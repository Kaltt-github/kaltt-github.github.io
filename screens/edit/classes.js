let draggingItem = null;

function dragStart(e) {
    if (!e.target.classList.contains('dragarrows')) {
        console.warn('skipped not-arrows');
        return;
    }
    draggingItem = e.target.parentElement;
    draggingItem.classList.add("dragging");
}

function dragEnd(e) {
    draggingItem.classList.remove("dragging");
    draggingItem.style.display = "flex";
    delay(10).then(_ => draggingItem = null);
}

function dragOver(e) {
    e.preventDefault();
    const y = e.clientY;
    const afterElement = [
        ...screenEdit.tasksList.div.querySelectorAll("li:not(.dragging)"),
    ].reduce(
        (closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
    if (afterElement == null) {
        screenEdit.tasksList.div.appendChild(draggingItem);
    } else {
        screenEdit.tasksList.div.insertBefore(draggingItem, afterElement);
    }
}

function moveTask(frontTask, goUp) {
    const task = frontTask.div;
    const list = screenEdit.tasksList.div;
    const i = Array.from(list.children).indexOf(task);
    if (list.lastChild === task) {
        console.warn('Ignored moving empty task');
        return;
    }
    if (goUp) {
        if (list.children[0] === task) {
            console.warn('Ignored moving first child higher');
            return;
        }
        list.insertBefore(task, list.children[i - 1]);
    } else {
        if (list.lastChild === list.children[i + 1]) {
            console.warn('Ignored moving empty task');
            return;
        }
        list.insertBefore(list.children[i + 1], task);
    }
}

function checkLastTask(lastEdited) {
    const children = Array.from(screenEdit.tasksList.div.lastChild.children);
    if (children[children.length - 3].value !== '') {
        screenEdit.tasksList.addChild(buildTask());
        if (lastEdited) {
            delay(200).then(_ => lastEdited.scrollIntoView({ behavior: 'smooth' }));
        }
    }
}

function buildTask(task) {
    const isEmpty = !task;
    const id = isEmpty ? randomId(10) : task.id;

    const description = new FrontInput({
        type: 'text',
        id: id,
        value: isEmpty ? '' : task.description,
        required: true,
        onInput: (event) => {
            if (description.value === '' && built.div !== screenEdit.tasksList.div.lastChild) {
                const i = screenEdit.tasksList.children.indexOf(built);
                built.remove();
                screenEdit.tasksList.children.splice(i, 1);
            }
            checkLastTask(built.div);
        }
    });

    const check = new FrontButton({
        classes: ['taskbutton'],
        style: { '--check': task?.isChecked ? 'white' : '#313338' },
        onclick: () => {
            const actual = check.style.getPropertyValue('--check');
            check.style.setProperty('--check', actual === 'white' ? '#313338' : 'white');
        },
        child: SvgFactory.checkmark('var(--check)'),
    })
    const built = new FrontDiv({
        tagName: 'li',
        classes: ['scrolltask'],
        child: [
            ...(isMobileDevice()
                ? [
                    new FrontButton({
                        classes: ['taskbutton'],
                        onclick: () => moveTask(built, true),
                        child: SvgFactory.arrowUp('white'),
                    }),
                    new FrontButton({
                        classes: ['taskbutton'],
                        onclick: () => moveTask(built, false),
                        child: SvgFactory.arrowDown('white'),
                    }),
                ]
                : [
                    new FrontDiv({
                        classes: ['taskbutton', 'dragarrows'],
                        child: SvgFactory.arrowsUpAndDown('white'),
                        alternative: { draggable: true },
                    })
                ]),
            description,
            new FrontButton({
                classes: ['taskbutton'],
                onclick: (event) => {
                    if (built.div === screenEdit.tasksList.div.lastChild) {
                        description.value = '';
                    } else {
                        const i = screenEdit.tasksList.children.indexOf(built);
                        built.remove();
                        screenEdit.tasksList.children.splice(i, 1);
                    }
                    checkLastTask(built.div);
                },
                child: SvgFactory.crossmark('white'),
            }),
            check,
        ]
    });

    return built;
}

class FrontRepeatSwitch extends FrontDiv {
    constructor(screenEdit) {
        const typeNone = new FrontDiv({
            tagName: 'p',
            classes: ['repeattype', 'active'],
            child: 'Nunca',
        });

        const typeLapseAmount = new FrontInput({
            name: 'delayamount',
            type: 'number',
            onInput: (event) => event.target.value = Math.round(event.target.value),
        });
        const typeLapseKind = new FrontSelectMenu({
            options: optionsLapse.map((value, index) => {
                return { label: value, value: optionsLapseValues[index] };
            }),
        });
        const typeLapseLimit = new FrontInput({
            type: 'datetime-local',
            onInput: (event) => {
                if (event.target.value !== '') {
                    return;
                }
                let limited = this.screen.eventOriginal?.repeats.limit;
                if (!limited) {
                    limited = MowDateTime.fromDateAndTime(this.screen.dateStart, this.screen.timeStart);
                    limited.month++;
                }
                this.limit = limited;
            },
        });
        const typeLapseChip = new FrontChip({
            on: () => typeLapseLimit.disabled = true,
            off: () => typeLapseLimit.disabled = false,
        });
        const typeLapse = new FrontDiv({
            id: 'typelapse',
            classes: ['repeattype'],
            child: [
                new FrontDiv({
                    classes: ['inline'],
                    child: [
                        new FrontDiv({ tagName: 'p', child: 'Cada' }),
                        typeLapseAmount,
                        typeLapseKind,
                    ],
                }),
                new FrontDiv({
                    classes: ['inline'],
                    child: [
                        new FrontDiv({ tagName: 'p', child: 'Hasta' }),
                        typeLapseLimit,
                        typeLapseChip,
                    ],
                }),
            ],
        });

        const typeWeeklyLimit = new FrontInput({
            type: 'datetime-local',
            onInput: (event) => {
                if (event.target.value !== '') {
                    return;
                }
                let limited = this.screen.eventOriginal?.repeats.limit;
                if (!limited) {
                    limited = MowDateTime.fromDateAndTime(this.screen.dateStart, this.screen.timeStart);
                    limited.month++;
                }
                this.limit = limited;
            },
        });
        const typeWeeklyChip = new FrontChip({
            on: () => typeWeeklyLimit.disabled = true,
            off: () => typeWeeklyLimit.disabled = false,
        });
        const typeWeeklyDays = [];
        for (let i = 0; i < optionsDays.length; i++) {
            const day = new FrontSwitch({
                id: optionsDaysValues[i],
                classes: ['weekday'],
                child: optionsDays[i],
                states: [
                    { value: 'off', onclick: () => day.classList.add('selected') },
                    {
                        value: 'on', onclick: () => {
                            day.classList.remove('selected');
                            if (day.id !== this.screen.dateStart.dayOfWeek()) {
                                return;
                            }
                            let days;
                            let daysOn = typeWeeklyDays.filter(day => day.state === 'on');
                            if (daysOn.length === 1) {
                                (typeWeeklyDays[i + 1] ?? typeWeeklyDays[0]).state = 'on';
                                days = 1;
                            } else {
                                days = optionsDaysValues.indexOf((daysOn[daysOn.indexOf(day) + 1] ?? daysOn[0]).id) - optionsDaysValues.indexOf(day.id);
                                if (days < 1) {
                                    days += 7;
                                }
                            }
                            const dateFrom = this.screen.dateStart;
                            dateFrom.day += days;
                            this.screen.dateStart = dateFrom;
                            const dateTo = this.screen.dateEnd;
                            dateTo.day += days;
                            this.screen.dateEnd = dateTo;
                            const limit = this.limit;
                            if (dateFrom.isMoreOrEqual(limit)) {
                                limit.day += days;
                                this.limit = limit;
                            }
                        }
                    },
                ],
            });
            typeWeeklyDays.push(day);
        }
        const typeWeekly = new FrontDiv({
            id: 'typeweekly',
            classes: ['repeattype'],
            child: [
                new FrontDiv({ tagName: 'p', classes: ['inline'], child: 'Por semana' }),
                new FrontDiv({
                    id: 'weekcontainer',
                    classes: ['inline'],
                    child: typeWeeklyDays,
                }),
                new FrontDiv({
                    classes: ['inline'],
                    child: [
                        new FrontDiv({ tagName: 'p', child: 'Hasta' }),
                        typeWeeklyLimit,
                        typeWeeklyChip,
                    ],
                }),
            ],
        });

        const typesContainer = new FrontDiv({
            id: 'types',
            child: [typeNone, typeLapse, typeWeekly],
        });
        const switchType = new FrontSwitch({
            id: 'switch',
            child: SvgFactory.switchThree('#1f1f1f', 'white'),
            states: [
                {
                    value: 'none', onclick: () => {
                        switchType.style.transform = "rotate(120deg)";
                        typeNone.classList.remove('active');
                        typeLapse.classList.add('active');
                        typeLapseAmount.value = 8;
                        typeLapseKind.value = 'hour';
                        const limited = MowDateTime.fromDateAndTime(
                            this.screen.dateStart.copy(),
                            this.screen.timeStart.copy()
                        );
                        limited.day += 3;
                        typeLapseLimit.value = datetimeToHtml(limited);
                        typeLapseChip.click();
                        typeLapseChip.turnOn();
                        switchType.div.scrollIntoView({ behavior: 'smooth' });
                    }
                },
                {
                    value: 'lapse', onclick: () => {
                        switchType.style.transform = "rotate(240deg)";
                        typeLapse.classList.remove('active');
                        typeWeekly.classList.add('active');
                        const nowday = this.screen.dateStart.dayOfWeek();
                        for (const day of typeWeeklyDays) {
                            day.state = day.id === nowday ? 'on' : 'off';
                        }
                        const now = MowDateTime.now();
                        now.month += 1;
                        typeWeeklyLimit.value = datetimeToHtml(now);
                        typeWeeklyChip.turnOn();
                        switchType.div.scrollIntoView({ behavior: 'smooth' });
                    }
                },
                {
                    value: 'weekly', onclick: async () => {
                        switchType.style.transform = "rotate(0deg)";
                        typeWeekly.classList.remove('active');
                        typeNone.classList.add('active');
                        switchType.div.scrollIntoView({ behavior: 'smooth' });
                    }
                },
            ],

        });
        super({
            id: 'repeats',
            child: [switchType, typesContainer],
        });
        this.switch = switchType;

        this.lapseAmount = typeLapseAmount;
        this.lapseKind = typeLapseKind;
        this.lapseLimit = typeLapseLimit;
        this.lapseChip = typeLapseChip;

        this.weeklyDays = typeWeeklyDays;
        this.weeklyLimit = typeWeeklyLimit;
        this.weeklyChip = typeWeeklyChip;

        this.screen = screenEdit;
    }

    get state() {
        return this.switch.state;
    }

    set state(value) {
        this.switch.state = value;
    }

    get values() {
        if (this.state === 'weekly') {
            return this.weeklyDays.filter(day => day.state === 'on').map(day => day.id);
        }
        if (this.state === 'lapse') {
            return {
                number: this.lapseAmount.value,
                kind: this.lapseKind.value,
            };
        }
        return null;
    }

    set values(value) {
        if (this.state === 'weekly') {
            for (const day of this.weeklyDays) {
                day.state = value.includes(day.id) ? 'on' : 'off';
            }
        }
        if (this.state === 'lapse') {
            this.lapseAmount.value = value.number;
            this.lapseKind.value = value.kind;
        }
    }

    get limit() {
        if (this.state === 'weekly') {
            return datetimeFromHtml(this.weeklyLimit.value);
        }
        if (this.state === 'lapse') {
            return datetimeFromHtml(this.lapseLimit.value);
        }
        return null;
    }

    set limit(value) {
        if (this.state === 'weekly') {
            if (value) {
                this.weeklyLimit.value = datetimeToHtml(value);
            } else {
                value = MowDateTime.fromDateAndTime(this.screen.dateStart, new MowTime);
                value.month++;
                this.weeklyLimit.value = datetimeToHtml(value);
                this.weeklyChip.turnOff();
            }
        }
        if (this.state === 'lapse') {
            if (value) {
                this.lapseLimit.value = datetimeToHtml(value);
            } else {
                value = MowDateTime.fromDateAndTime(this.screen.dateStart, new MowTime);
                value.month++;
                this.lapseLimit.value = datetimeToHtml(value);
                this.lapseChip.turnOff();
            }
        }
    }

    get hasLimit() {
        return (this.state === 'weekly' && this.weeklyChip.state === 'on') ||
            (this.state === 'lapse' && this.lapseChip.state === 'on');
    }
}

class FrontScreenEdit extends FrontScreen {
    get name() {
        return this.frontInputName.value;
    }
    set name(value) {
        this.frontInputName.value = value;
    }

    get color() {
        return parseInt(this.frontInputSlider.value);
    }
    set color(value) {
        this.frontInputSlider.value = value;
        root.style.setProperty("--slider-color", BackColor.fromHSV(value, 100, 100).toString());
    }

    get dateStart() {
        return dateFromHtml(this.frontInputDateStart.value);
    }
    set dateStart(value) {
        this.frontInputDateStart.value = dateToHtml(value);
    }

    get dateEnd() {
        return dateFromHtml(this.frontInputDateEnd.value);
    }
    set dateEnd(value) {
        this.frontInputDateEnd.value = dateToHtml(value);
    }

    get dateHasEnd() {
        return this.frontChipDate.state === 'on';
    }
    set dateHasEnd(value) {
        if (value) {
            this.frontChipDate.turnOn();
        } else {
            this.frontChipDate.turnOff();
        }
    }

    get timeStart() {
        return timeFromHtml(this.frontInputTimeStart.value);
    }
    set timeStart(value) {
        this.frontInputTimeStart.value = timeToHtml(value);
    }

    get timeEnd() {
        return timeFromHtml(this.frontInputTimeEnd.value);
    }
    set timeEnd(value) {
        this.frontInputTimeEnd.value = timeToHtml(value);
    }

    get timeHasEnd() {
        return this.frontChipTime.state === 'on';
    }
    set timeHasEnd(value) {
        if (value) {
            this.frontChipTime.turnOn();
        } else {
            this.frontChipTime.turnOff();
        }
    }

    constructor() {
        const frontInputName = new FrontInput({
            id: 'eventname',
            type: 'text',
            placeholder: 'Nombre del evento',
            required: true,
        });
        const frontInputSlider = new FrontInput({
            id: 'colorslider',
            type: 'range',
            onInput: (event) => root.style.setProperty("--slider-color", BackColor.fromHSV(parseInt(event.target.value), 100, 100).toString()),
            alternative: { min: 0, max: 360, step: 1 },
        });

        const frontDateWord = new FrontDiv({ tagName: 'p', child: ' hasta ' });
        const frontInputDateStart = new FrontInput({
            type: 'date',
            onInput: (event) => {
                if (event.target.value === '') {
                    const start = this.dateEnd;
                    start.day -= this.dateLength;
                    this.dateStart = start;
                } else {
                    const end = this.dateStart;
                    end.day += this.dateLength;
                    this.dateEnd = end;
                    if (this.repeats.state === 'weekly') {
                        const weekday = this.dateStart.dayOfWeek();
                        const day = this.repeats.weeklyDays.find(day => day.id === weekday);
                        if (day.state === 'off') {
                            day.click();
                        }
                    }
                }
            },
        });
        const frontInputDateEnd = new FrontInput({
            type: 'date',
            onInput: (event) => {
                if (event.target.value === '') {
                    const end = this.dateStart;
                    end.day += this.dateLength;
                    this.dateEnd = end;
                } else {
                    this.refreshDateLength()
                }
            },
        });
        const frontChipDate = new FrontChip({
            on: () => {
                frontInputDateEnd.disabled = true;
                frontDateWord.style.color = '#383a40';
            },
            off: () => {
                frontInputDateEnd.disabled = false;
                frontDateWord.style.color = 'white';
            },
        });

        const frontTimeWord = new FrontDiv({ tagName: 'p', child: ' hasta ' });
        const frontInputTimeStart = new FrontInput({
            type: 'time',
            onInput: (event) => {
                if (event.target.value === '') {
                    const start = MowDateTime.fromDateAndTime(
                        this.dateEnd,
                        this.timeEnd
                    );
                    start.minute -= this.timeLength;
                    this.timeStart = start.time;
                } else {
                    const end = MowDateTime.fromDateAndTime(
                        this.dateStart,
                        this.timeStart
                    );
                    end.minute += this.timeLength;
                    this.timeEnd = end.time;
                }
            },
        });
        const frontInputTimeEnd = new FrontInput({
            type: 'time',
            onInput: () => {
                if (event.target.value === '') {
                    const end = MowDateTime.fromDateAndTime(
                        this.dateStart,
                        this.timeStart
                    );
                    end.minute += this.timeLength;
                    this.endTime = end.time;
                } else {
                    this.refreshTimeLength();
                    this.ensureEndDate();
                }
            },
        });
        const frontChipTime = new FrontChip({
            on: () => {
                frontInputTimeEnd.disabled = true;
                frontTimeWord.style.color = '#383a40';
            },
            off: () => {
                frontInputTimeEnd.disabled = false;
                frontTimeWord.style.color = 'white';
            },
        });

        const tasksList = new FrontDiv({
            tagName: 'ul',
            id: 'tasksInput',
        });
        tasksList.div.addEventListener("dragover", dragOver);
        tasksList.div.addEventListener("drop", dragEnd);
        tasksList.div.addEventListener("dragstart", dragStart);
        tasksList.div.addEventListener("dragend", dragEnd);

        const repeats = new FrontRepeatSwitch();

        const form = new FrontForm({
            id: 'eventform',
            child: new FrontDiv({
                classes: ['container', 'scrollable'],
                child: [
                    frontInputName,
                    document.createElement('br'),
                    document.createElement('br'),
                    frontInputSlider,
                    document.createElement('br'),
                    document.createElement('br'),
                    new FrontDiv({
                        tagName: 'label',
                        child: 'Fecha:',
                        alternative: { htmlFor: 'from-date' },
                    }),
                    document.createElement('br'),
                    new FrontDiv({
                        classes: ['frontlapse'],
                        child: [
                            frontInputDateStart,
                            frontDateWord,
                            frontInputDateEnd,
                            frontChipDate
                        ],
                    }),
                    document.createElement('br'),
                    document.createElement('br'),
                    new FrontDiv({
                        tagName: 'label',
                        child: 'Horario:',
                        alternative: { htmlFor: 'from-time' },
                    }),
                    document.createElement('br'),
                    new FrontDiv({
                        classes: ['frontlapse'],
                        child: [
                            frontInputTimeStart,
                            frontTimeWord,
                            frontInputTimeEnd,
                            frontChipTime
                        ],
                    }),
                    document.createElement('br'),
                    document.createElement('br'),
                    new FrontDiv({ tagName: 'p', child: 'Tareas' }),
                    document.createElement('br'),
                    tasksList,
                    document.createElement('br'),
                    document.createElement('br'),
                    new FrontDiv({ tagName: 'p', child: 'Repeticiones' }),
                    repeats,
                    new FrontDiv({ tagName: 'p', child: '- - - - - - - - - - - -' }),
                    new FrontDiv({ style: { height: '80px' } }),
                ],
            }),
        });

        const buttons = new FrontDiv({
            id: 'formbuttons',
        });

        super({
            id: 'edit',
            child: [form, buttons],
            willClear: true,
        });

        repeats.screen = this;
        this.frontInputName = frontInputName;
        this.frontInputSlider = frontInputSlider;

        this.frontInputDateStart = frontInputDateStart;
        this.frontInputDateEnd = frontInputDateEnd;
        this.frontChipDate = frontChipDate;
        this.frontInputTimeStart = frontInputTimeStart;
        this.frontInputTimeEnd = frontInputTimeEnd;
        this.frontChipTime = frontChipTime;

        this.tasksList = tasksList;

        this.repeats = repeats;

        this.form = form;
        this.buttons = buttons;
        this.buttonCancel = new FrontButton({
            child: 'VOLVER',
            onclick: () => {
                screenHome.open();
            },
        });
        this.buttonDelete = new FrontButton({
            child: 'ELIMINAR',
            onclick: () => this.clickCancel(),
        });
        this.buttonSave = new FrontButton({
            child: 'GUARDAR',
            onclick: () => this.clickSave(),
        });
        this.buttonCreate = new FrontButton({
            child: 'CREAR',
            onclick: () => this.clickCreate(),
        });

        this.eventOriginal = null;
    }

    get isEdit() {
        return this.eventOriginal != null;
    }

    open(event = null) {
        super.open();

        const email = auth.getUserData()?.email
        if (!email) {
            screenLogin.open();
            return;
        }

        this.eventOriginal = event;

        for (const child of this.tasksList.children) {
            child.remove();
        }
        this.tasksList.children = [];

        for (const child of this.buttons.children) {
            child.remove();
        }
        this.buttons.children = [];

        if (this.isEdit) {
            this.name = event.name;
            this.color = event.color;

            this.dateStart = event.startDate;
            this.dateHasEnd = event.endDate !== null;
            this.dateEnd = event.endDate ?? new MowDate(event.startDate.year, event.startDate.month, event.startDate.day + 1);

            this.timeStart = event.startTime;
            this.timeHasEnd = event.endTime !== null;
            this.timeEnd = event.endTime ?? new MowTime(event.startTime.hour + 1, event.startTime.minute);

            this.eventOriginal.tasks.sort((a, b) => a.position - b.position);
            for (const task of this.eventOriginal.tasks) {
                this.tasksList.addChild(buildTask(task));
            }

            this.repeats.state = event.repeats.type;
            this.repeats.values = event.repeats.values;
            this.repeats.limit = event.repeats.limit;

            this.buttons.addChild([this.buttonCancel, this.buttonDelete, this.buttonSave]);
        } else {
            this.name = '';
            this.color = Math.round(Math.random() * 360);

            const today = MowDateTime.now();
            if (today.minute > 30) {
                today.hour++;
            }
            today.second = 60;
            today.minute = 60;

            this.dateStart = today;
            this.dateHasEnd = false;
            today.day++;
            this.dateEnd = today;

            this.timeStart = today;
            this.timeHasEnd = false;
            today.minute += 60;
            this.timeEnd = today;

            this.repeats.state = 'none';

            this.buttons.addChild([this.buttonCancel, this.buttonCreate]);
        }

        this.refreshDateLength();
        this.refreshTimeLength();
        this.tasksList.addChild(buildTask());
    }

    refreshDateLength() {
        const time = new MowTime();
        this.dateLength = MowLapse.fromDateTime(
            MowDateTime.fromDateAndTime(this.dateStart, time),
            MowDateTime.fromDateAndTime(this.dateEnd, time),
        ).asDays;
    }

    refreshTimeLength() {
        const date = MowDate.now();
        this.timeLength = MowLapse.fromDateTime(
            MowDateTime.fromDateAndTime(date, this.timeStart),
            MowDateTime.fromDateAndTime(date, this.timeEnd),
        ).asMinutes;
    }

    ensureEndDate() {
        if (!this.timeHasEnd) {
            return;
        }
        if (!this.dateHasEnd) {
            return;
        }
        if (this.timeStart.isLessOrEqual(this.timeEnd)) {
            return;
        }
        if (this.dateStart.isLessThan(this.dateEnd)) {
            return;
        }
        const end = this.dateEnd;
        end.day++;
        this.dateEnd = end;
        this.dateLength++;
    }

    clickCancel() {
        if (this.eventOriginal.repeats.type === 'none' && this.repeats.state === 'none') {
            screenHome.removeEvents([this.eventOriginal]);
            screenHome.open();
            return;
        }
        popUp({
            message: "ELIMINAR un evento elimina el original y todas sus repeticiones, considera CANCELAR en su lugar para conservar los demas eventos o VOLVER para no realizar acciones",
            buttons: [
                {
                    label: 'VOLVER',
                    onclick: () => {
                        screenHome.open();
                        return true;
                    },
                },
                {
                    label: 'CANCELAR',
                    onclick: () => {
                        screenHome.open();
                        screenHome.eventsMap.get(this.eventOriginal.id).clickCancel();
                        return true;
                    },
                },
                {
                    label: 'ELIMINAR',
                    onclick: async () => {
                        screenHome.removeEvents([this.eventOriginal]);
                        screenHome.open();
                        return true;
                    },
                },
            ],
        })
    }

    isValid() {
        if (this.dateHasEnd) {
            if (this.dateStart.isMoreThan(this.dateEnd)) {
                this.frontInputDateEnd.classList.add('error');
                showNotification('error', 'La fecha de comienzo no puede ser mayor a la de finalizacion', 0);
                return false;
            }
            this.frontInputDateEnd.classList.remove('error');

            if (
                this.timeHasEnd &&
                this.dateStart.isEqual(this.dateEnd) &&
                this.timeStart.isMoreThan(this.timeEnd)
            ) {
                this.frontInputTimeEnd.classList.add('error');
                showNotification('error', 'La hora de comienzo no puede ser mayor a la de finalizacion', 0);
                return false;
            }
        }
        this.frontInputTimeEnd.classList.remove('error');

        return true;
    }

    clickCreate() {
        if (!this.isValid()) {
            return;
        }
        const newevent = MowEvent.newEvent(
            auth.getUserData().email,
            this.name,
            this.color,
            this.dateStart,
            this.timeStart,
            this.dateHasEnd ? this.dateEnd : null,
            this.timeHasEnd ? this.timeEnd : null,
            Array.from(this.tasksList.div.querySelectorAll('input[type="text"]'))
                .map(input => input.value.trim())
                .filter(content => content !== '')
                .map((description, i) => new MowTask(randomId(), i, false, description)),
        );
        newevent.repeats = new MowEventRepeatSettings(
            newevent,
            this.repeats.state,
            this.repeats.values,
            this.repeats.hasLimit ? this.repeats.limit : null,
        );
        screenHome.addEvents([newevent]);
        screenHome.open();
    }

    clickSave() {
        if (!this.isValid()) {
            return;
        }

        const eventFather = this.eventOriginal.father ?? this.eventOriginal;
        const eventTarget = this.eventOriginal;
        const group = [eventFather, ...eventFather.repeats.events];
        let hasChanges = !screenHome.eventsList.find(front => front.event === eventFather);
        
        const name = this.name;
        if (eventFather.name !== name) {
            hasChanges = true;
            for (const event of group) {
                event.name = name;
            }
        }

        const color = this.color;
        if (eventFather.color !== color) {
            hasChanges = true;
            for (const event of group) {
                event.color = color;
            }
        }

        const now = MowDateTime.now();
        if (
            this.dateHasEnd && (
                eventFather.endDate === null ||
                MowLapse.fromDateTime(
                    MowDateTime.fromDateAndTime(eventFather.startDate, now.time),
                    MowDateTime.fromDateAndTime(eventFather.endDate, now.time),
                ).asDays !== this.dateLength)
        ) {
            hasChanges = true;
            for (const event of group) {
                event.endDate = event.startDate.copy();
                event.endDate.day += this.dateLength;
            }
        } else if (!this.dateHasEnd && eventFather.endDate !== null) {
            hasChanges = true;
            for (const event of group) {
                event.endDate = null;
            }
        }

        if (!eventTarget.startDate.isEqual(this.dateStart)) {
            hasChanges = true;
            const changedLength = MowLapse.fromDateTime(
                MowDateTime.fromDateAndTime(eventTarget.startDate, now.time),
                MowDateTime.fromDateAndTime(this.dateStart, now.time)
            ).asDays;
            for (const event of group) {
                event.startDate.day += changedLength;
                if (event.endDate) {
                    event.endDate.day += changedLength;
                }
            }
        }

        if (
            this.timeHasEnd && (
                eventFather.endTime === null ||
                MowLapse.fromDateTime(
                    MowDateTime.fromDateAndTime(now.date, eventFather.startTime),
                    MowDateTime.fromDateAndTime(now.date, eventFather.endTime),
                ).asMinutes !== this.timeLength)
        ) {
            hasChanges = true;
            for (const event of group) {
                event.endTime = event.startTime.copy();
                event.endTime.minute += this.timeLength;
            }
        } else if (!this.timeHasEnd && eventFather.endTime !== null) {
            hasChanges = true;
            for (const event of group) {
                event.endTime = null;
            }
        }

        if (!eventTarget.startTime.isEqual(this.timeStart)) {
            hasChanges = true;
            const changedLength = MowLapse.fromDateTime(
                MowDateTime.fromDateAndTime(now.date, eventTarget.startTime),
                MowDateTime.fromDateAndTime(now.date, this.timeStart)
            ).asMinutes;
            for (const event of group) {
                event.startTime.minute += changedLength;
                if (event.endTime) {
                    event.endTime.minute += changedLength;
                }
            }
        }

        const nowTasks = [];
        let position = 0;
        for (const child of Array.from(this.tasksList.div.children)) {
            const children = Array.from(child.children);
            const input = children[children.length - 3];
            const check = children[children.length - 1];
            if (input.value === '') {
                continue;
            }
            nowTasks.push(
                new MowTask(
                    input.id,
                    position,
                    check.style.getPropertyValue('--check') === 'white',
                    input.value
                )
            );
            position++;
        }

        const orig = this.eventOriginal;
        for (const newtask of nowTasks) {
            const origTask = orig.tasks.find(task => task.id === newtask.id);
            if (!origTask) {
                hasChanges = true;
                for (const event of group) {
                    event.tasks.push(newtask);
                }
                continue;
            }
            if (newtask.isChecked !== origTask.isChecked) {
                hasChanges = true;
                origTask.isChecked = true;
            }
            if (newtask.description !== origTask.description) {
                hasChanges = true;
                for (const event of group) {
                    event.tasks.find(task => task.id === newtask.id).description = newtask.description;
                }
            }
            if (newtask.position !== origTask.position) {
                hasChanges = true;
                for (const event of group) {
                    event.tasks.find(task => task.id === newtask.id).position = newtask.position;
                }
            }
        }
        const toKeep = nowTasks.map(t => t.id);
        const toDelete = orig.tasks.filter(task => !toKeep.includes(task.id));
        if (toDelete.length !== 0) {
            hasChanges = true;
            for (const deleteTask of toDelete) {
                for (const event of group) {
                    event.tasks.splice(
                        event.tasks.findIndex(task => 
                            task.id === deleteTask.id
                        ), 1
                    );
                }
            }
        }

        if (
            eventFather.repeats.type !== this.repeats.state ||
            this.repeats.state !== 'none' && (
                (eventFather.repeats.limit !== null) !== this.repeats.hasLimit ||
                (eventFather.repeats.limit && this.repeats.limit && !eventFather.repeats.limit.isEqual(this.repeats.limit)) ||
                (this.repeats.state === 'lapse' && (
                    eventFather.repeats.values.kind !== this.repeats.values.kind ||
                    eventFather.repeats.values.number !== this.repeats.values.number
                )) ||
                (this.repeats.state === 'weekly' && (
                    eventFather.repeats.values.some(day => !this.repeats.values.includes(day)) ||
                    this.repeats.values.some(day => !eventFather.repeats.values.includes(day))
                ))
            )
        ) {
            hasChanges = true;
            eventFather.repeats.type = this.repeats.state;
            eventFather.repeats.values = this.repeats.values;
            eventFather.repeats.limit = this.repeats.hasLimit ? this.repeats.limit : null;
            eventFather.repeats.generateEvents();
        }

        if (hasChanges) {
            eventFather.lastUpdate = Date.now();
            screenHome.addEvents([eventFather]);
        }
        screenHome.open();
    }
}
