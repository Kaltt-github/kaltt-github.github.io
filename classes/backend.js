class MowTask {
    constructor(id, position, isChecked, description) {
        this.id = id;
        this.position = position;
        this.isChecked = isChecked;
        this.description = description;
    }

    static fromJson(json) {
        return new MowTask(
            json['id'],
            json['position'],
            json['isChecked'],
            json['description']
        );
    }

    copy() {
        return new MowTask(this.id, this.position, false, this.description);
    }

    toJson() {
        return {
            id: this.id,
            position: this.position,
            isChecked: this.isChecked,
            description: this.description
        };
    }
}

class MowEventRepeatSettings {
    /**
     * @param type none | lapse | weekly
     * @param values null | {number: 1, kind: (minute | hour | day | week | month | year)} | [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday]
     * @param limit MowDateTime | null
     * @param events MowEventRepeat[]
     * */
    constructor(event, type = 'none', values = null, limit = null, events = []) {
        this.event = event;
        this.type = type;
        this.values = values;
        this.limit = limit;
        if (type === 'lapse') {
            this.values.number = parseInt(this.values.number);
        }
        this.events = events;
        this.generateEvents();
    }

    toJson() {
        return {
            type: this.type,
            values: this.values,
            limit: this.limit?.toString() ?? null,
            events: this.events.filter(event => event.isRelevant).map(event => event.toJson())
        }
    }

    static fromJson(father, json) {
        return new MowEventRepeatSettings(
            father,
            json['type'] ?? 'none',
            json['values'] ?? null,
            json['limit'] === null ? null : MowDateTime.fromString(json['limit']),
            (json['events'] ?? []).map(event => MowEventRepeat.fromJson(father, event)),
        );
    }

    copy() {
        return new MowEventRepeatSettings(this.type, this.values, this.limit);
    }

    generateEvents(keepOlds = true) {
        if (this.type === 'none') {
            this.events = [];
            return this.events;
        }

        const oldEvents = this.events.filter(event => event.isRelevant);
        let limit = this.limit?.netValue;
        if (!limit) {
            limit = MowDateTime.now();
            limit.year += 20;
            limit = limit.netValue;
        }
        const today = MowDateTime.now().netValue;

        this.events = [];
        const start = this.event.start.copy();

        const dateLength = this.event.endDate
            ? MowLapse.fromDateTime(
                start,
                MowDateTime.fromDateAndTime(
                    this.event.endDate,
                    start.time,
                )
            ).asDays
            : null;
        const timeLength = this.event.endTime
            ? MowLapse.fromDateTime(
                start,
                MowDateTime.fromDateAndTime(
                    start.date,
                    this.event.endTime,
                )
            ).asMinutes
            : null;

        if (this.type === 'lapse') {
            this.values.number = parseInt(this.values.number);
            if (this.values.kind === 'week') {
                start.day += this.values.number * 7;
            } else {
                start[this.values.kind] += this.values.number;
            }
            while (start.netValue <= limit) {
                const end = start.copy();
                if (dateLength !== null) {
                    end.day += dateLength;
                }
                if (timeLength !== null) {
                    end.minute += timeLength;
                }

                const newstart = start.copy();
                this.events.push(
                    new MowEventRepeat(this.event, {
                        index: this.events.length,
                        startTime: newstart.time,
                        startDate: newstart.date,
                        endTime: timeLength !== null ? end.time : null,
                        endDate: dateLength !== null ? end.date : null,
                        interaction: dateLength === null && (
                            (timeLength === null &&
                                newstart.netValue < today
                            ) || end.netValue < today)
                            ? 'cancelled'
                            : 'none',
                        tasks: this.event.tasks.map(task => task.copy()),
                    })
                );

                if (this.values.kind === 'week') {
                    start.day += this.values.number * 7;
                } else {
                    start[this.values.kind] += this.values.number;
                }
            }
        }
        if (this.type === 'weekly') {
            if (this.values.length === 0) {
                return this.events;
            }
            const todayIndex = optionsDaysValues.indexOf(MowDateTime.now().dayOfWeek());
            const jumps = this.values
                .map(day => {
                    const difference = optionsDaysValues.indexOf(day) - todayIndex;
                    return difference < 1
                        ? difference + 7
                        : difference;
                })
                .sort()
                .reverse()
                .map((jump, i, list) => jump - (list[i + 1] ?? 0))
                .reverse();

            let jumpIndex = 0;
            start.day += jumps[jumpIndex];
            while (start.netValue <= limit) {
                jumpIndex++;
                if (jumpIndex >= jumps.length) {
                    jumpIndex = 0;
                }

                const end = start.copy();
                if (dateLength !== null) {
                    end.day += dateLength;
                }
                if (timeLength !== null) {
                    end.minute += timeLength;
                }

                const newstart = start.copy();
                this.events.push(
                    new MowEventRepeat(this.event, {
                        index: this.events.length,
                        startTime: newstart.time,
                        startDate: newstart.date,
                        endTime: timeLength !== null ? end.time : null,
                        endDate: dateLength !== null ? end.date : null,
                        interaction: dateLength === null && (
                            (timeLength === null &&
                                newstart.netValue < today
                            ) || end.netValue < today)
                            ? 'cancelled'
                            : 'none',
                        tasks: this.event.tasks.map(task => task.copy()),
                    })
                );
                start.day += jumps[jumpIndex];
            }
        }

        if (keepOlds) {
            for (const older of oldEvents) {
                const newer = this.events[older.index];
                if (!newer) {
                    continue;
                }
                newer.tasks = older.tasks;
                newer.delayed = older.delayed;
                newer.interaction = older.interaction;
            }
        }
        return this.events;
    }
}

class MowEvent {
    constructor(
        id,
        owner,
        type = 'father',
        name = 'Name',
        interaction = 'none',
        color = 30,
        startDate = MowDate.now(),
        startTime = MowTime.now(),
        endDate = null,
        endTime = null,
        tasks = [],
        delayed = 0,
        lastUpdate = Date.now(),
        repeats = new MowEventRepeatSettings(this)
    ) {
        this.id = id;
        this.owner = owner;
        this.type = type;
        this.family = id;
        this.name = name;
        this.interaction = interaction;
        this.color = color;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.tasks = tasks;
        this.delayed = delayed;
        this.lastUpdate = lastUpdate;
        this.repeats = repeats;
    }

    static newEvent(owner, name, color = 30, startDate = MowDate.now(), startTime = MowTime.now(), endDate = null, endTime = null, tasks = [], repeatSettings) {
        const event = new MowEvent(
            randomId(),
            owner,
            'father',
            name,
            'none',
            color,
            startDate,
            startTime,
            endDate,
            endTime,
            tasks,
            0,
            Date.now(),
        );
        if (repeatSettings) {
            event.repeats = repeatSettings;
        }
        return event;
    }

    static fromJson(json) {
        const event = new MowEvent(
            json['id'],
            json['owner'],
            json['type'],
            json['name'],
            json['interaction'],
            json['color'],
            MowDate.fromString(json['startDate']),
            MowTime.fromString(json['startTime']),
            json['endDate'] === null ? null : MowDate.fromString(json['endDate']),
            json['endTime'] === null ? null : MowTime.fromString(json['endTime']),
            json['tasks'].map(js => MowTask.fromJson(js)),
            json['delayed'],
            parseInt(json['lastUpdate'] ?? Date.now()),
        );
        if (json['repeats']) {
            event.repeats = MowEventRepeatSettings.fromJson(event, json['repeats']);
        }
        return event;
    }

    toJson() {
        return {
            id: this.id,
            owner: this.owner,
            type: this.type,
            family: this.family,
            name: this.name,
            interaction: this.interaction,
            color: this.color,
            startDate: this.startDate.toString(),
            startTime: this.startTime.toString(),
            endDate: this.endDate?.toString() ?? null,
            endTime: this.endTime?.toString() ?? null,
            tasks: this.tasks.map(task => task.toJson()),
            delayed: this.delayed,
            lastUpdate: this.lastUpdate,
            repeats: (this.repeats ?? new MowEventRepeatSettings(this)).toJson(),
        };
    }

    set color(value) {
        this._color = value;
        this.main = BackColor.fromHSV(this._color, 77, 97).toString();
        this.dark = BackColor.fromHSV(this._color, 85, 15).toString();
        this.quarterdark = BackColor.fromHSV(this._color, 71, 79).toString();
        this.halfdark = BackColor.fromHSV(this._color, 65, 60).toString();
    }

    get color() {
        return this._color;
    }

    get start() {
        const result = MowDateTime.fromDateAndTime(this.startDate.copy(), this.startTime.copy());
        result.minute += this.delayed;
        return result;
    }

    get end() {
        const now = MowDateTime.now();
        now.year += 10;
        const result = MowDateTime.fromDateAndTime(this.endDate ?? now.date, this.endTime ?? now.time);
        if (!this.endDate && this.endTime?.isLessThan(this.startTime)) {
            result.day++;
        }
        result.minute += this.delayed;
        return result;
    }

    get status() {
        if (this.interaction === 'cancelled') {
            return "cancelled";
        }
        if (this.interaction === 'completed') {
            if (this.canComplete) {
                return "completed";
            }
            this.interaction = 'none';
        }

        const now = MowDateTime.now();
        now.second = 0;
        if (now.isMoreThan(this.end)) {
            return "expired";
        }
        if (now.isLessThan(this.start)) {
            return "waiting";
        }
        if (this.endTime === null) {
            return 'active';
        }
        if (this.startTime.isLessThan(this.endTime)) {
            if (
                now.time.isMoreOrEqual(this.startTime) &&
                now.time.isLessOrEqual(this.endTime)
            ) {
                return 'active';
            }
        } else {
            if (
                now.time.isMoreOrEqual(this.startTime) ||
                now.time.isLessOrEqual(this.endTime)
            ) {
                return 'active';
            }
        }
        return "waiting";
    }

    get canComplete() {
        return this.tasks.length === 0 || this.tasks.every(task => task.isChecked);
    }
}

class MowEventRepeat extends MowEvent {
    /**
     * id?: string,
     * index: number,
     * interacion?: 'none'
     * startTime, 
     * startDate,
     * endTime, 
     * endDate,
     * tasks?,
     * delayed?,
    */
    constructor(father, params) {
        super(
            params.id ?? randomId(),
            params.owner,
            'repeat',
            father.name,
            params.interaction ?? 'none',
            father.color,
            params.startDate,
            params.startTime,
            params.endDate,
            params.endTime,
            params.tasks ?? father.tasks,
            params.delayed ?? 0,
        );
        this.index = params.index;
        this.family = father.id;
        this.father = father;
    }

    get repeats() {
        return this.father?.repeats;
    }
    set repeats(value) {
        if (this.father) {
            this.father.repeats = value;
        }
    }

    get isRelevant() {
        return this.interaction !== 'none' || this.tasks.filter(task => task.isChecked).length > 0 || this.delayed != 0;
    }

    toJson() {
        return {
            id: this.id,
            index: this.index,
            interaction: this.interaction,
            startTime: this.startTime.toString(),
            startDate: this.startDate.toString(),
            endTime: this.endTim?.toString() ?? null,
            endDate: this.endDate?.toString() ?? null,
            tasks: this.tasks.map(task => task.toJson()),
            delayed: this.delayed,
        };
    }

    static fromJson(father, json) {
        json['startDate'] = MowDate.fromString(json['startDate']);
        json['startTime'] = MowTime.fromString(json['startTime']);
        json['endDate'] = json['endDate'] === null ? null : MowDate.fromString(json['endDate']);
        json['endTime'] = json['endTime'] === null ? null : MowTime.fromString(json['endTime']);
        json['tasks'] = json['tasks'].map(js => MowTask.fromJson(js));
        return new MowEventRepeat(father, json);
    }
}