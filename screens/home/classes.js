class FrontTask extends FrontClickable {
    constructor(frontEvent, task) {
        const event = frontEvent.event;
        const checkBox = new FrontDiv({
            classes: ['check'],
            calculate: [{ path: ['style', 'backgroundColor'], value: () => task.isChecked ? colorDark : colorQuarterdark }],
            child: SvgFactory.checkmark(colorQuarterdark),
        });
        const description = new FrontDiv({
            tagName: 'p',
            classes: ['description'],
            child: task.description,
        });
        super({
            id: task.id,
            tagName: 'li',
            classes: ['task'],
            onclick: () => {
                this.isChecked = !this.isChecked;
                this.frontEvent.refresh();
                data.saveEvent(this.event);
            },
            child: [checkBox, description],
            style: { order: task.position },
        });
        this.divDescription = description;
        this.frontEvent = frontEvent;
        this.event = event;
        this.task = task;
        this.checkBox = checkBox;
    }

    get description() {
        return this.task.description;
    }
    set description(value) {
        this.divDescription.textContent = value;
        this.task.description = value;
    }

    get isChecked() {
        return this.task.isChecked;
    }

    set isChecked(value) {
        this.task.isChecked = value;
    }

    get position() {
        return this.task.position;
    }
    set position(value) {
        this.task.position = value;
        this.style.order = value;
    }
}

class FrontEvent extends FrontConditional {
    constructor(event, showMe) {
        const status = event.status;

        const decoration = new FrontClickable({
            classes: ['wall'],
            onclick: () => {
                if (this.lastClick && Date.now() - this.lastClick < 1000) {
                    return;
                }
                this.lastClick = Date.now();

                const now = MowDateTime.now();
                let message = event.name + ': ';
                switch (event.status) {
                    case 'active':
                        if (event.endDate === null && event.endTime === null) {
                            message += 'No terminara hasta ser completado o cancelado';
                            break;
                        }

                        let datetimeEnd;
                        if (event.endDate) {
                            if (event.endTime) {
                                datetimeEnd = event.end;
                            } else {
                                datetimeEnd = MowDateTime.fromDateAndTime(
                                    event.endDate,
                                    new MowTime(23, 59, 59)
                                );
                            }
                        } else {
                            datetimeEnd = MowDateTime.fromDateAndTime(
                                now.date,
                                event.endTime
                            );
                        }

                        const activeLapse = MowLapse.fromDateTime(
                            now,
                            datetimeEnd
                        );
                        message += 'Finaliza en ';
                        if (activeLapse.asYears > 0) {
                            message += activeLapse.asYears + (activeLapse.asYears === 1 ? ' año' : ' años');
                        } else if (activeLapse.asMonths > 0) {
                            message += activeLapse.asMonths + (activeLapse.asMonths === 1 ? ' mes' : ' meses');
                        } else if (activeLapse.asDays > 0) {
                            message += activeLapse.asDays + (activeLapse.asDays === 1 ? ' dia' : ' dias');
                        } else if (activeLapse.asHours > 0) {
                            message += activeLapse.asHours + (activeLapse.asHours === 1 ? ' hora' : ' horas');
                            const mins = activeLapse.asMinutes - activeLapse.asHours * 60;
                            if (mins > 0) {
                                message += ' y ' + mins + (mins === 1 ? ' minuto' : ' minutos');
                            }
                        } else if (activeLapse.asMinutes > 0) {
                            message += activeLapse.asMinutes + (activeLapse.asMinutes === 1 ? ' minuto' : ' minutos');
                        } else if (activeLapse.asSeconds > 0) {
                            message += activeLapse.asSeconds + (activeLapse.asSeconds === 1 ? ' segundo' : ' segundos');
                        } else {
                            message += ' este momento';
                        }
                        break;
                    case 'waiting':
                        const waitingLapse = MowLapse.fromDateTime(
                            now,
                            MowDateTime.fromDateAndTime(
                                event.startDate.isLessThan(now.date)
                                    ? now
                                    : event.startDate,
                                event.startTime
                            )
                        );
                        message += 'Comienza en ';
                        if (waitingLapse.asYears > 0) {
                            message += waitingLapse.asYears + (waitingLapse.asYears === 1 ? ' año' : ' años');
                        } else if (waitingLapse.asMonths > 0) {
                            message += waitingLapse.asMonths + (waitingLapse.asMonths === 1 ? ' mes' : ' meses');
                        } else if (waitingLapse.asDays > 0) {
                            message += waitingLapse.asDays + (waitingLapse.asDays === 1 ? ' dia' : ' dias');
                        } else if (waitingLapse.asHours > 0) {
                            message += waitingLapse.asHours + (waitingLapse.asHours === 1 ? ' hora' : ' horas');
                            const mins = waitingLapse.asMinutes - waitingLapse.asHours * 60;
                            if (mins > 0) {
                                message += ' y ' + mins + (mins === 1 ? ' minuto' : ' minutos');
                            }
                        } else if (waitingLapse.asMinutes > 0) {
                            message += waitingLapse.asMinutes + (waitingLapse.asMinutes === 1 ? ' minuto' : ' minutos');
                        } else if (waitingLapse.asSeconds > 0) {
                            message += waitingLapse.asSeconds + (waitingLapse.asSeconds === 1 ? ' segundo' : ' segundos');
                        } else {
                            message += ' este momento';
                        }
                        break;
                    case 'expired':
                        const expiredLapse = MowLapse.fromDateTime(
                            event.end,
                            now
                        );
                        message += 'Expirado hace ';
                        if (expiredLapse.asYears > 0) {
                            message += expiredLapse.asYears + (expiredLapse.asYears === 1 ? ' año' : ' años');
                        } else if (expiredLapse.asMonths > 0) {
                            message += expiredLapse.asMonths + (expiredLapse.asMonths === 1 ? ' mes' : ' meses');
                        } else if (expiredLapse.asDays > 0) {
                            message += expiredLapse.asDays + (expiredLapse.asDays === 1 ? ' dia' : ' dias');
                        } else if (expiredLapse.asHours > 0) {
                            message += expiredLapse.asHours + (expiredLapse.asHours === 1 ? ' hora' : ' horas');
                            const mins = expiredLapse.asMinutes - expiredLapse.asHours * 60;
                            if (mins > 0) {
                                message += ' y ' + mins + (mins === 1 ? ' minuto' : ' minutos');
                            }
                        } else if (expiredLapse.asMinutes > 0) {
                            message += expiredLapse.asMinutes + (expiredLapse.asMinutes === 1 ? ' minuto' : ' minutos');
                        } else if (expiredLapse.asSeconds > 0) {
                            message += expiredLapse.asSeconds + (expiredLapse.asSeconds === 1 ? ' segundo' : ' segundos');
                        } else {
                            message = ' 0 segundos';
                        }
                        break;
                    case 'cancelled':
                        message += 'Cancelado';
                        break;
                    case 'completed':
                        message += 'Completado';
                        break;
                }
                showNotification('info', message, event.color);
            },
            child: [
                new FrontDiv({
                    classes: ['sign', 'decoration'],
                })
            ]
        });

        const titleName = new FrontDiv({
            tagName: 'p',
            classes: ['titlename'],
            child: event.name,
        });
        const titles = new FrontClickable({
            classes: ['titles'],
            onclick: () => {
                if (this.lastClick && Date.now() - this.lastClick < 1000) {
                    screenEdit.open(this.event);
                } else {
                    this.lastClick = Date.now();
                }
            },
            child: [
                new FrontConditional({
                    showMe: () => !['father', 'repeat'].includes(event.type),
                    tagName: 'p',
                    classes: ['titletype'],
                    child: event.type,
                }),
                titleName,
                new FrontConditional({
                    showMe: () => event.status !== 'active',
                    tagName: 'p',
                    classes: ['titletype'],
                    child: '(' + optionsEventStatusValues[optionsEventStatus.indexOf(status)] + ')',
                    calculate: [{ path: ['div', 'textContent'], value: () => '(' + optionsEventStatusValues[optionsEventStatus.indexOf(event.status)] + ')' }]
                }),
            ]
        });

        const buttons = new FrontDiv({
            classes: ['buttons'],
            child: [
                new FrontButton({
                    classes: ['sign'],
                    calculate: [
                        { path: ['style', 'visibility'], value: () => event.status === "completed" ? 'hidden' : 'visible' },
                        { path: ['div', 'disabled'], value: () => ['cancelled', 'completed'].includes(event.status) || !event.canComplete },
                    ],
                    onclick: () => this.clickComplete(),
                    child: SvgFactory.checkmark(colorDark),
                }), // Complete
                new FrontButton({
                    classes: ['sign'],
                    calculate: [
                        { path: ['style', 'visibility'], value: () => event.status === "completed" ? 'hidden' : 'visible' },
                        { path: ['div', 'disabled'], value: () => event.status === 'cancelled' || event.status === 'completed' },
                    ],
                    onclick: () => this.clickLate(),
                    child: SvgFactory.arrowBack(colorDark),
                }), // Late
                new FrontButton({
                    classes: ['sign'],
                    onclick: () => this.clickCancel(),
                    child: SvgFactory.crossmark(colorDark),
                }), // Cancel
            ],
        });

        const taskslist = new FrontConditional({
            showMe: () => event.tasks.length !== 0,
            tagName: 'ul',
            classes: ['tasks'],
        });

        super({
            id: event.id,
            showMe: showMe,
            classes: ['event'],
            calculate: [{ path: ['style', 'opacity'], value: () => event.status === 'active' ? 1 : 0.7 }],
            child: [
                decoration,
                new FrontDiv({
                    classes: ['header'],
                    child: [
                        new FrontDiv({
                            classes: ['upperheader'],
                            child: [titles, buttons],
                        }),
                        taskslist,
                    ],
                }),
            ],
        });

        this.event = event;
        this.decoration = decoration;
        this.titles = titles;
        this.buttons = buttons;
        this.taskslist = taskslist;

        taskslist.addChild(event.tasks.map(task => new FrontTask(this, task)));
        this.titleName = titleName;
        this.color = event.color;
    }

    get name() {
        return this.titleName.div.textContent;
    }

    set name(value) {
        this.titleName.div.textContent = value;
        this.event.name = value;
    }

    get color() {
        return this.event.color;
    }

    set color(value) {
        this.event.color = value;
        this.style.setProperty('--color-main', this.event.main);
        this.style.setProperty('--color-dark', this.event.dark);
        this.style.setProperty('--color-quarterdark', this.event.quarterdark);
        this.style.setProperty('--color-halfdark', this.event.halfdark);
    }

    clickComplete() {
        if (!this.event.canComplete) {
            console.warn('Event "' + this.id + '" cant be completed');
            return;
        }
        this.event.interaction = 'completed';
        data.saveEvent(this.event);
        this.refresh();
    }

    clickLate() {
        this.event.delayed += 10;
        this.refresh();
        data.saveEvent(this.event);
    }

    clickCancel() {
        if (this.event.status === 'completed' || this.event.status === 'cancelled') {
            this.event.interaction = 'none';
        } else {
            this.event.interaction = 'cancelled';
        }
        data.saveEvent(this.event);
        this.refresh();
    }

    refresh() {
        const before = this.isShowing;
        super.refresh();
        const after = this.isShowing;
        if (before !== after && (
            after ||
            this.div.classList.contains('first-child') ||
            this.div.classList.contains('last-child')
        )) {
            screenHome.findFirstAndLast();
        }
    }
}

class FrontFilterField extends FrontSwitch {
    constructor(params) {
        super({
            initialState: params.initialState ?? 'off',
            classes: ['filterfield', ...(params.classes ?? [])],
            states: [
                {
                    value: 'off', onclick: () => {
                        this.classList.add('active');
                        this._state = 'on';
                        screenHome.checkEventStatus();
                    }
                },
                {
                    value: 'on', onclick: () => {
                        this.classList.remove('active');
                        this._state = 'off';
                        screenHome.checkEventStatus();
                    }
                },
            ],
            child: params.label,
        });
    }
}

class FrontHomeFilter extends FrontDiv {
    constructor() {
        const fieldDateBefore = new FrontFilterField({ label: 'Anteriores' });
        const fieldDateToday = new FrontFilterField({ label: 'Hoy', classes: ['active'], initialState: 'on' });
        const fieldDateAfter = new FrontFilterField({ label: 'Proximos' });

        const fieldStatusCompleted = new FrontFilterField({ label: 'Compleados' });
        const fieldStatusActive = new FrontFilterField({ label: 'Activos', classes: ['active'], initialState: 'on' });
        const fieldStatusWaiting = new FrontFilterField({ label: 'En espera', classes: ['active'], initialState: 'on' });
        const fieldStatusExpired = new FrontFilterField({ label: 'Expirados' });
        const fieldStatusCancelled = new FrontFilterField({ label: 'Cancelados' });

        const options = new FrontDiv({
            classes: ['options', 'closed'],
            child: [
                new FrontDiv({
                    child: 'Fecha',
                    classes: ['filtertitle'],
                }),
                fieldDateBefore,
                fieldDateToday,
                fieldDateAfter,
                new FrontDiv({
                    tagName: 'hr',
                }),
                new FrontDiv({
                    child: 'Estado',
                    classes: ['filtertitle'],
                }),
                fieldStatusCompleted,
                fieldStatusActive,
                fieldStatusWaiting,
                fieldStatusExpired,
                fieldStatusCancelled,
            ]
        });
        const filterSvg = SvgFactory.build('filter', 'white');
        const optionsBookMark = new FrontButton({
            id: 'filterbookmark',
            classes: ['bookmark'],
            child: filterSvg,
            onclick: () => {
                filterSvg.classList.toggle('open');
                options.classList.toggle('closed');
            }
        })
        super({
            id: 'filter',
            child: [
                new FrontDiv({
                    classes: ['container'],
                    child: options,
                }),
                optionsBookMark
            ]
        });
        this.fieldDateBefore = fieldDateBefore;
        this.fieldDateToday = fieldDateToday;
        this.fieldDateAfter = fieldDateAfter;

        this.fieldStatusCompleted = fieldStatusCompleted;
        this.fieldStatusActive = fieldStatusActive;
        this.fieldStatusWaiting = fieldStatusWaiting;
        this.fieldStatusExpired = fieldStatusExpired;
        this.fieldStatusCancelled = fieldStatusCancelled;
    }

    refreshValues() {
        if (this.fieldDateBefore.state === 'on') {
            this.dateStart = null;
        } else {
            const now = MowDate.now();
            if (this.fieldDateToday.state === 'on') {
                this.dateStart = now;
            } else {
                now.day++;
                this.dateStart = this.fieldDateAfter.state === 'on'
                    ? now
                    : null;
            }
        }
        this.dateStartValue = this.dateStart?.netValue ?? null;

        if (this.fieldDateAfter.state === 'on') {
            this.dateEnd = null;
        } else {
            const now = MowDate.now();
            if (this.fieldDateToday.state === 'on') {
                this.dateEnd = now;
            } else {
                now.day--;
                this.dateEnd = this.fieldDateBefore.state === 'on'
                    ? now
                    : null;
            }
        }
        this.dateEndValue = this.dateEnd?.netValue ?? null;

        this.states = [];
        if (this.fieldStatusCompleted.state === 'on') {
            this.states.push('completed');
        }
        if (this.fieldStatusActive.state === 'on') {
            this.states.push('active');
        }
        if (this.fieldStatusWaiting.state === 'on') {
            this.states.push('waiting');
        }
        if (this.fieldStatusExpired.state === 'on') {
            this.states.push('expired');
        }
        if (this.fieldStatusCancelled.state === 'on') {
            this.states.push('cancelled');
        }
    }
}

const loading = new FrontDiv({
    classes: ['loading'],
    child: SvgFactory.loading("#383a40"),
});

class FrontScreenHome extends FrontScreen {
    constructor() {
        const filter = new FrontHomeFilter();
        const list = new FrontDiv({
            id: 'eventlist',
            classes: ['scrollable'],
        });
        super({
            willClear: false,
            id: 'home',
            child: [
                filter,
                list,
                new FrontButton({
                    id: 'homeButton',
                    child: '+',
                    onclick: () => screenEdit.open()
                })
            ],
        });
        this.filter = filter;
        this.list = list;
        this.eventsMap = new Map();
        this.fetchedLocal = false;
        this.fetchedOnline = false;
        this.refreshers = [];

        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        const remainingMilliseconds = (60 - seconds) * 1000 - milliseconds;
        const self = this;
        delay(remainingMilliseconds).then(_ => this.refreshers.push(setInterval(() => self.checkEventStatus(), 60000)));
    }

    get eventsList() {
        return this.list?.children;
    }

    async fetchMyEvents() {
        let checked = false;
        if (!this.fetchedLocal) {
            const events = await data.getLocalEvents();
            this.fetchedLocal = true;
            if (events.length > 0) {
                const allEvents = [];
                for (const event of events) {
                    allEvents.push(event, ...event.repeats.events);
                }
                loading.remove();
                this.addEvents(allEvents, []);
                this.checkEventStatus();
                checked = true;
            }
        }
        if (!this.fetchedOnline && navigator.onLine) {
            const email = auth.getUserData()?.email;
            if (!email) {
                return;
            }
            const events = await data.fetchEvents(email);
            this.fetchedOnline = true;
            if (events.length > 0) {
                const allEvents = [];
                for (const event of events) {
                    allEvents.push(event, ...event.repeats.events);
                }
                loading.remove();
                this.addEvents(allEvents, ['local']);
                this.checkEventStatus();
                checked = true;
            }
        }
        if (!checked) {
            loading.remove();
            this.checkEventStatus();
        }
    }

    open() {
        const email = auth.getUserData()?.email;
        if (!email) {
            screenLogin.open();
            return;
        }
        super.open();
        if (this.isClosed) {
            return;
        }
        this.fetchMyEvents();
    }

    async checkEventStatus(aux) {
        console.info('🟣 Screen: Events refhreshed ' + MowTime.now().toString());
        if ((aux ?? this).isClosed) {
            return;
        }
        this.filter.refreshValues();
        this.list.refresh();
    }

    addEvents(events, scopes = ['online', 'local']) {
        if (!this.isActive) {
            this.open();
        }
        data.saveEvents(events, scopes);
        for (const event of events) {
            let front = this.eventsMap.get(event.id);
            if (front) {
                const toRemove = [];
                if (event.type === 'father') {
                    toRemove.push(
                        ...Array.from(this.eventsMap.values())
                            .filter(front => front.event.family === event.id)
                    );
                }
                for (const front of toRemove) {
                    front.remove();
                    this.eventsMap.delete(front.id);
                    const index = this.eventsList.indexOf(front);
                    if (index !== -1) {
                        this.eventsList.splice(index, 1);
                    }
                }
            }
            front = new FrontEvent(event, () => (
                this.filter.dateEndValue === null ||
                event.startDate.netValue <= this.filter.dateEndValue
            ) && (
                    this.filter.dateStartValue === null ||
                    event.endDate === null ||
                    event.endDate.netValue >= this.filter.dateStartValue
                ) && this.filter.states.includes(event.status));
            this.eventsMap.set(event.id, front);
            this.insertEventInList(front);
        }
    }

    removeEvents(events, scopes = ['online', 'local']) {
        if(events.length === 0) {
            return;
        }
        const fathers = new Map();
        for(const event of events) {
            fathers.set(event.family, event.father ?? event);
        }
        const eventsList = [...fathers.values()];
        if(scopes.length > 0) {
            data.deleteEvents(eventsList, scopes);
        }
        
        const families = new Set();
        for (const event of eventsList) {
            families.add(event.family);
            screenHome.eventsMap.delete(event.id);
            for (const child of event.repeats.events) {
                screenHome.eventsMap.delete(child.id);
            }
        }
        this.list.children = this.list.children.filter(child => {
            if(!families.has(child.event.family)) {
                return true;
            }
            child.remove();
            return false;
        });
        this.findFirstAndLast();
    }

    findFirstAndLast() {
        const divs = Array.from(document.querySelectorAll('.event:not([style*="display: none"])'));
        if (divs.length === 0) {
            return;
        }

        const first = divs[0];
        first.classList.add('first-child');
        if (divs.length === 1) {
            first.classList.add('last-child');
            return;
        }
        first.classList.remove('last-child');

        const last = divs[divs.length - 1];
        last.classList.remove('first-child');
        last.classList.add('last-child');

        for (let i = 1; i < divs.length - 1; i++) {
            const div = divs[i];
            div.classList.remove('first-child', 'last-child');
        }
    }

    insertEventInList(frontEvent) {
        this.eventsMap.set(frontEvent.id, frontEvent);
        const fronts = Array.from(this.eventsMap.values())
            .map(front => [front.event.start.netValue, front])
            .sort((a, b) => a[0] - b[0])
            .map(([_, front]) => front);
        const myIndex = fronts.indexOf(frontEvent);
        this.list.addChild(frontEvent, fronts[myIndex + 1]);
        this.findFirstAndLast();
    }
}
