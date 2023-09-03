/**
 * tagName?: string = 'div',
 * id?: string,
 * classes?: string[],
 * child?: string | node | node[] | MowDiv | MowDiv[],
 * style?: {},
 * alternative?: {},
 * calculate: [ {path: ['div','style','background'], value: () => boolean} ],
 * */
class FrontDiv {
    constructor(params) {
        this.div = document.createElement(params.tagName ?? 'div');
        this.children = [];
        if (params.id) {
            this.div.id = params.id;
        }
        if (params.classes) {
            try {
                for (const name of params.classes ?? []) {
                    this.div.classList.add(name);
                }
            } catch (e) {
                console.error('Error at ' + params.id + ' adding classes ' + classes);
                throw e;
            }
        }
        if (params.child) {
            this.addChild(params.child);
        }
        if (params.style) {
            const s = this.style;
            for (const [key, value] of Object.entries(params.style)) {
                if (key.startsWith('--')) {
                    s.setProperty(key, value);
                } else {
                    s[key] = value;
                }
            }
        }
        if (params.alternative) {
            const d = this.div;
            for (const [key, value] of Object.entries(params.alternative)) {
                d[key] = value;
            }
        }
        this.calculate = params.calculate;
        this.parent = null;
    }

    get id() {
        return this.div.id;
    }
    set id(value) {
        this.div.id = value;
    }

    get style() {
        return this.div.style;
    }
    get classList() {
        return this.div.classList;
    }

    addChild(child, before) {
        const beforeIndex = before
            ? this.children.indexOf(before)
            : this.children.length;
        try {
            if (typeof child === 'string') {
                this.div.textContent = child;
            } else if (Array.isArray(child)) {
                for (const c of child) {
                    if (c instanceof FrontDiv) {
                        c.parent = this;
                        if (!this.children.includes(c)) {
                            this.children.splice(beforeIndex, 0, c);
                        }
                        if (before) {
                            this.div.insertBefore(c.div, before.div);
                        } else {
                            this.div.appendChild(c.div);
                        }
                    } else {
                        this.div.appendChild(c);
                    }
                }
            } else {
                if (child instanceof FrontDiv) {
                    child.parent = this;
                    if (!this.children.includes(child)) {
                        this.children.splice(beforeIndex, 0, child);
                    }
                    if (before) {
                        this.div.insertBefore(child.div, before.div);
                    } else {
                        this.div.appendChild(child.div);
                    }
                } else {
                    this.div.appendChild(child);
                }
            }
        } catch (e) {
            console.error('Error at ' + this.id + ' adding child ' + child);
            throw e;
        }
    }

    get firstChild() {
        return this.children[0];
    }

    get lastChild() {
        return this.children[Math.max(0, this.children.length - 1)];
    }

    refresh() {
        if (this.calculate) {
            for (const calculable of this.calculate) {
                let holder = this;
                for (let i = 0; i < calculable.path.length - 1; i++) {
                    holder = holder[calculable.path[i]];
                }
                holder[calculable.path[calculable.path.length - 1]] = calculable.value();
            }
        }
        for (const child of this.children) {
            child.refresh();
        }
    }

    remove() {
        this.removed = true;
        this.div.remove();
    }
}

/**
 * onlick: (event) => {},
 * disabled: boolean = false,
*/
class FrontClickable extends FrontDiv {
    constructor(params) {
        params.classes = [ 'clickable', ...(params.classes ?? [])];
        super(params);
        this.disabled = params.disabled ?? false;
        this.click = (event) => {
            if(this.isDisabled) {
                return;
            }
            params.onclick(event);
        };
    }

    eneable() {
        this.div.disabled = false;
    }

    disable() {
        this.div.disabled = true;
    }

    get isEneabled() {
        return !this.div.disabled;
    }

    get isDisabled() {
        return this.div.disabled;
    }

    get disabled() {
        return this.div.disabled;
    }
    set disabled(value) {
        this.div.disabled = value;
    }
}

/**
 * onclick: () => {}
 * disabled: boolean = false,
 * 
 * id?: string,
 * classes?: string[],
 * child?: string | node | node[] | MowDiv | MowDiv[],
 * style?: {},
 * alternative?: {},
 * */
class FrontButton extends FrontClickable {
    constructor(params) {
        params.tagName = 'button';
        super(params);
        this.div.disabled = params.disabled ?? false;
        this.div.type = 'button';
    }
}

/* initialState: x,
 * states: [ {value: x, onclick: (event) => {}} ],
 * disabled: boolean = false,
 * 
 * id?: string,
 * classes?: string[],
 * child?: string | node | node[] | MowDiv | MowDiv[],
 * style?: {},
 * alternative?: {},
 * */
class FrontSwitch extends FrontClickable {
    constructor(params) {
        params.tagName = 'button';
        params.onclick = () => {
            const actual = this.states.get(this.state);
            actual.click();
            this._state = actual.next;
        };
        super(params);
        this._state = params.initialState ?? params.states[0].value;
        this.div.disabled = params.disabled ?? false;
        this.div.type = 'button';
        this.states = new Map();
        for (let i = 0; i < params.states.length; i++) {
            const state = params.states[i];
            this.states.set(state.value, {
                click: state.onclick,
                next: (params.states[i + 1] ?? params.states[0]).value
            });
        }
    }

    get state() {
        return this._state;
    }

    set state(value) {
        if (value === this._state) {
            return;
        }
        if (![...this.states.keys()].includes(value)) {
            return;
        }
        while (this._state !== value) {
            this.click();
        }
    }
}

/**
 * showMe: () => boolean
 * 
 * tagName?: string = 'div',
 * id?: string,
 * classes?: string[],
 * child?: string | node | node[] | MowDiv | MowDiv[],
 * style?: {},
 * alternative?: {},
 * */
class FrontConditional extends FrontDiv {
    constructor(params) {
        super(params);
        this.showMe = params.showMe;
    }

    refresh() {
        const showMe = this.showMe();
        if (!showMe && showMe === this.isShowing) {
            return;
        }
        this.isShowing = showMe;
        if (showMe) {
            this.style.removeProperty('display');
            super.refresh();
        } else {
            this.style.display = 'none';
        }
    }
}

/**
 * side: top | bottom | right | left | top-right | top-left | bottom-right | bottom-left
 * center: boolean && side = top | bottom | right | left
 * touchable: FrontDiv
 * options: FrontDiv
 * 
 * tagName?: string = 'div',
 * id?: string,
 * classes?: string[],
 * style?: {},
 * alternative?: {},
 * calculate: [ {path: ['div','style','background'], value: () => boolean} ],
 * */
class FrontSideOpenable extends FrontDiv { // TODO usar?
    constructor(params) {
        params.child = [params.touchable, params.options];
        params.classes = params.classes ?? [];
        params.classes.push('sideOpenable');
        params.style = params.style ?? {};
        if (params.side.includes('-')) {
            const sides = params.side.split('-');
            params.style[sides[0]] = '0';
            params.style[sides[1]] = '0';
        } else {
            params.style[params.side] = '0';
            if (params.center) {
                params.classes.push(['top', 'bottom'].includes(params.side) ? 'centerHorizontal' : 'centerVertical');
            }
        }
        super(params);
        this.touchable = params.touchable;
        this.options = params.options;
        this.side = params.side;
        this.sides = params.side.split('-');
    }
}

/**validation: () => string[]
 * 
 * id?: string,
 * classes?: string[],
 * style?: {},
 * alternative?: {},
 * calculate: [ {path: ['div','style','background'], value: () => boolean} ],
 * */
class FrontForm extends FrontDiv {
    constructor(params) {
        params.tagName = params.tagName === 'input' ? 'input' : 'form';
        super(params);
        this.localValidation = params.validation;
    }

    validate() {
        const errors = (this.localValidation ?? (() => []))();
        const recursive = (children) => {
            for (const child of children) {
                if (child.validate) {
                    errors.push(...child.validate());
                }
                if (child.children.length != 0) {
                    recursive(child.children);
                }
            }
        };
        recursive(this.children);
        return errors;
    }

    get isValid() {
        return this.validate().length === 0;
    }

    get isNotValid() {
        return !this.isValid;
    }
}

/**
 * name?: string,
 * type: string,
 * required?: boolean,
 * placeholder?: string,
 * value?: string,
 * onInput: (value) => {},
 * onValidation: (value) => string[],
 * disabled: boolean,
 * 
 * id?: string,
 * classes?: string[],
 * style?: {},
 * alternative?: {},
 * calculate: [ {path: ['div','style','background'], value: () => boolean} ],
 * */
class FrontInput extends FrontForm {
    constructor(params) {
        params.alternative = params.alternative ?? {};
        params.alternative.type = params.type;
        params.alternative.required = params.required ?? false;
        params.alternative.disabled = params.disabled ?? false;
        if (params.name) {
            params.alternative.name = params.name;
        }
        if (params.placeholder) {
            params.alternative.placeholder = params.placeholder;
        }
        if (params.value) {
            params.alternative.value = params.value;
        }
        if (params.onInput) {
            params.alternative.oninput = params.onInput;
        }
        params.validation = params.onValidation;
        params.classes = params.classes ?? [];
        params.classes.push('frontinput');
        params.tagName = 'input';
        super(params);
    }

    get value() {
        return this.div.value;
    }

    set value(val) {
        this.div.value = val;
        this.classList.remove('fixed');
        delay(10).then(_ => this.classList.add('fixed'));
    }

    get disabled() {
        return this.div.disabled;
    }
    set disabled(value) {
        this.div.disabled = value;
    }

    validate() {
        const errors = (this.localValidation ?? (() => []))(this.value);
        if (errors.length !== 0) {
            this.classList.add('error');
        } else {
            this.classList.remove('error');
        }
        return errors;
    }

    get isValid() {
        return this.validate().length === 0;
    }

    get isNotValid() {
        return !this.isValid;
    }
}

/**
 * options: [{label: string, value: any}],
*/
class FrontSelectMenu extends FrontDiv {
    constructor(params) {
        params.tagName = 'select';
        params.child = params.options.map(data => {
            const option = document.createElement('option');
            option.value = data.value;
            option.textContent = data.label;
            return option;
        });
        super(params);
        this.options = params.child;
    }

    get value() {
        return this.div.value;
    }

    set value(newvalue) {
        this.div.value = newvalue;
    }
}

/**
 * classess: [],
 * on: () => {},
 * off: () => {},
 * */
 class FrontChip extends FrontSwitch {
    constructor(params) {
        super({
            classes: ['chip', ...(params?.classes ?? [])],
            states: [
                {
                    value: 'on', onclick: () => {
                        this.classList.remove('on');
                        if (params.on) {
                            params.on();
                        }
                    }
                },
                {
                    value: 'off', onclick: () => {
                        this.classList.add('on');
                        if (params.off) {
                            params.off();
                        }
                    }
                },
            ],
            child: new FrontDiv({
                classes: ['light'],
                child: new FrontDiv({
                    classes: ['dark'],
                })
            }),
        });
    }

    turnOn() {
        this.click();
        if (this.state === 'off') {
            this.click();
        }
    }
    turnOff() {
        this.click();
        if (this.state === 'on') {
            this.click();
        }
    }
}

var screenStack = null;
/**
 * willClear: boolean
 * 
 * id?: string,
 * classes?: string[],
 * child?: string | node | node[] | MowDiv | MowDiv[],
 * style?: {},
 * alternative?: {},
 * calculate: [ {path: ['div','style','background'], value: () => boolean} ],
 * */
class FrontScreen extends FrontDiv {
    constructor(params) {
        params.classes = params.classes ?? [];
        params.classes.push('screen');
        params.style = params.style ?? {};
        params.style.display = 'none';
        params.willClear = params.willClear ?? true;
        let child = params.child;
        if (params.willClear && child) {
            delete params.child;
        }

        super(params);
        this.willClear = params.willClear;
        if (params.willClear && child) {
            this.children = Array.isArray(child) ? child : [child];
        }
        this.isOpen = false;
        this.isActive = false;
        this.div.onclick = (event) => this.click(event);
    }

    get isClosed() {
        return !this.isOpen;
    }
    set isClosed(value) {
        this.isOpen = !value;
    }

    open() {
        if (this.isOpen) {
            return;
        }
        if(screenStack) {
            screenStack.close();
        }
        screenStack = this;
        this.isActive = true;
        this.isOpen = true;
        this.style.removeProperty('display');
        delay(10).then(_ => {
            if (this.willClear) {
                for (const child of this.children) {
                    this.div.appendChild(child.div);
                }
            }
            this.div.classList.add('open');
        });
    }

    close() {
        if (this.isClosed) {
            return;
        }
        this.isActive = this.willClear ? false : true;
        this.div.classList.remove('open');
        delay(300).then(_ => this.style.display = 'none');
        this.isOpen = false;
        if (this.willClear) {
            return delay(400).then(_ => {
                for (const child of this.children) {
                    child.remove();
                }
            });
        }
    }

    click(event) {
        let target = event.target;
        let clicked = null;
        while(target !== this.div) {
            if(target.classList.contains('clickable')) {
                clicked = target;
                break;
            }
            target = target.parentElement;
        }
        if(!clicked) {
            return;
        }
        const path = [];
        while(target !== this.div) {
            path.unshift(target);
            target = target.parentElement;
        }
        let front = this;
        for(const div of path) {
            front = front.children.find(front => front.div === div);
            if(!front) {
                throw Error('Missing Front of clicked div');
            }
        }
        front.click(event);
    }
}
