class FrontLoginField extends FrontDiv {
    constructor(params) {
        const input = new FrontInput({
            id: params.id,
            type: params.inputType,
            name: params.inputName,
            classes: ['custom-input'],
            placeholder: ' ',
            disabled: true,
            onInput: params.onInput,
            style: { backgroundColor: BackColor.fromHSV(params.color, 23, 97).toString() },
            calculate: [ {path: ['disabled'], value: () => this.classList.contains('closedfield') || screenLogin.isLoading} ],
        });

        params.tagName = 'li';
        params.child = [
            new FrontDiv({
                classes: ['fieldicon'],
                child: SvgFactory.build(params.icon, BackColor.fromHSV(params.color, 85, 15).toString())
            }),
            new FrontDiv({
                classes: ['input-container'],
                child: [
                    input, 
                    new FrontDiv({
                        tagName: 'label',
                        classes: ['input-label'],
                        child: params.label,
                        alternative: { htmlFor: params.id },
                    })
                ],
            }),
        ];
        params.classes = ['loginfield', 'closedfield', ...(params.classList ?? [])];
        params.style = params.style ?? {};
        params.style.backgroundColor = BackColor.fromHSV(params.color, 77, 97).toString();
        params.calculated = params.calculated;
        delete params.id;
        super(params);
        this.input = input;
        this.isOpen = false;
    }

    get value() {
        return this.input.value;
    }

    set value(newone) {
        this.input.value = newone;
    }

    open() {
        if(this.isOpen) {
            return;
        }
        this.classList.remove('closedfield');
        this.input.disabled = false;
        this.isOpen = true;
    }

    close() {
        if(!this.isOpen){
            return;
        }
        this.classList.add('closedfield');
        this.input.disabled = true;
        this.input.value = '';
        this.isOpen = false;
    }
}

class FrontLoginButton extends FrontDiv {
    constructor(params) {
        const button = new FrontButton({
            id: params.id,
            classes: ['input-button'],
            onclick: params.onclick,
            disabled: true,
            child: new FrontDiv({
                tagName: 'p',
                child: params.text,
            }),
            style: {
                backgroundColor: BackColor.fromHSV(params.color, 23, 97).toString(),
            },
            calculate: [ {path: ['disabled'], value: () => this.classList.contains('closedbutton') || screenLogin.isLoading} ],
        });

        params.tagName = 'li';
        params.classes = ['loginbutton', 'closedbutton', ...(params.classes ?? [])];
        params.style = params.style ?? {};
        params.style.backgroundColor = BackColor.fromHSV(params.color, 77, 97).toString();
        delete params.id;
        params.child = [
            new FrontDiv({
                classes: ['fieldicon'],
                child: SvgFactory.build(params.icon, BackColor.fromHSV(params.color, 85, 15).toString()),
            }),
            button
        ];
        super(params);
        this.button = button;
        this.isOpen = false;
    }
    
    open(position, total) {
        if(this.isOpen) {
            return;
        }
        this.style.width = `calc(max(200px, min(600px, 90%) * (${position}/${total})))`
        this.classList.remove('closedbutton');
        this.button.disabled = false;
        this.isOpen = true;
    }

    close() {
        if(!this.isOpen){
            return;
        }
        this.classList.add('closedbutton');
        this.button.disabled = true;
        this.isOpen = false;
    }
}

class FrontLoginEmpty extends FrontDiv {
    constructor(color) {
        super({
            tagName: 'li',
            classes: ['emptyfield'],
            style: {
                backgroundColor: BackColor.fromHSV(color, 77, 97).toString()
            }
        })
    }
}

class FrontScreenLogin extends FrontScreen {
    constructor() {
        const email = new FrontLoginField({
            inputType: 'email', 
            inputName: 'email', 
            id: 'inputemail', 
            label: 'Email', 
            icon: 'message', 
            color: 70,
        });
        const password = new FrontLoginField({
            inputType: 'password', 
            inputName: 'password', 
            id: 'inputpassword', 
            label: 'Contraseña', 
            icon: 'lock', 
            color: 30,
        });
        const repassword = new FrontLoginField({
            inputType: 'password', 
            inputName: 'password', 
            id: 'inputpasswordcheck', 
            label: 'Repetir contraseña', 
            icon: 'lock', 
            color: 45,
        });
        const name = new FrontLoginField({
            inputType: 'text', 
            inputName: 'username', 
            id: 'inputname', 
            label: 'Nombre', 
            icon: 'person', 
            color: 150,
            onInput: (event) => event.target.value = event.target.value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 30),
        });
        const forgot = new FrontLoginButton({
            id: 'buttonforgot',
            icon: 'message',
            text: 'Recuperar',
            color: 280,
            onclick: () => this.goPhaseRecovery(),
        });
        const signup = new FrontLoginButton({
            id: 'buttonsignup',
            icon: 'write',
            text: 'Registrarse',
            color: 60,
            onclick: () => this.goPhaseSignUp(),
        });
        const login = new FrontLoginButton({
            id: 'buttonlogin',
            icon: 'door',
            text: 'Iniciar sesion',
            color: 120,
            onclick: () => this.clickLogin(),
        });
        const next = new FrontLoginButton({
            id: 'buttonnext',
            icon: 'next',
            text: 'Siguiente',
            color: 220,
            onclick: () => this.clickNext(),
        });
        const cancel = new FrontLoginButton({
            id: 'buttoncancel',
            icon: 'back',
            text: 'Cancelar',
            color: 355,
            onclick: () => this.goPhaseLogin(),
        });

        super({
            id: 'login',
            child: new FrontForm({
                child: [
                    new FrontDiv({
                        tagName: 'ul',
                        child: [
                            new FrontLoginEmpty(240),
                            name,
                            new FrontLoginEmpty(185),
                            login,
                            next,
                            cancel,
                        ],
                    }),
                    new FrontDiv({
                        tagName: 'ul',
                        child: [
                            email,
                            password,
                            repassword,
                            new FrontLoginEmpty(315),
                            forgot,
                            signup,
                            new FrontLoginEmpty(95),
                        ],
                    })
                ]
            }),
        })
    
        this.phase = '';
        this._isLoading = true;
        this._cache = {};
        this.email = email;
        this.password = password;
        this.repassword = repassword;
        this.name = name;
        this.forgot = forgot;
        this.signup = signup;
        this.login = login;
        this.next = next;
        this.cancel = cancel;
    }

    get isLoading() {
        return this._isLoading;
    }

    set isLoading(value) {
        this._isLoading = value;
        this.refresh();
    }

    open() {
        super.open();
        this.goPhaseEmpty();
        this.tryLogIn();
    }

    goPhaseEmpty() {
        this.phase = 'empty';
        this.isLoading = true;
        this.email.close();
        this.password.close();
        this.repassword.close();
        this.name.close();
        this.forgot.close();
        this.signup.close();
        this.login.close();
        this.next.close();
        this.cancel.close();
    }

    goPhaseLogin() {
        this.open();
        this.phase = 'login';
        this.isLoading = false;
        this.email.open();
        this.password.open();
        this.repassword.close();
        this.name.close();
        this.forgot.open(1, 3);
        this.signup.open(2, 3);
        this.login.open(3, 3);
        this.next.close();
        this.cancel.close();
    }

    goPhaseSignUp() {
        this.phase = 'signup';
        this.isLoading = false;
        this.email.open();
        this.password.close();
        this.repassword.close();
        this.name.open();
        this.forgot.close();
        this.signup.close();
        this.login.close();
        this.next.open(2, 2);
        this.cancel.open(1, 2);
    }

    goPhaseRecovery() {
        this.phase = 'recovery';
        this.isLoading = false;
        this.email.open();
        this.password.close();
        this.repassword.close();
        this.name.close();
        this.forgot.close();
        this.signup.close();
        this.login.close();
        this.next.open(2, 2);
        this.cancel.open(1, 2);
    }

    goPhasePassword() {
        this.phase = 'password';
        this.isLoading = false;
        this.email.close();
        this.password.open();
        this.repassword.open();
        this.name.close();
        this.forgot.close();
        this.signup.close();
        this.login.open(2, 2);
        this.next.close();
        this.cancel.open(1, 2);
    }

    async clickLogin() {
        if(!navigator.onLine) {
            showNotification('error', 'No puedes iniciar sesion sin coneccion', 0);
            return;
        }
        this.isLoading = true;
        switch(this.phase) {
            case 'login':
                const data = await auth.loginWithPassword(this.email.value, this.password.value);
                if (!data) {
                    this.email.input.classList.add('fielderror');
                    this.password.input.classList.add('fielderror');
                    showNotification('error', 'Email o contraseña incorrecto', 0);
                    break;
                }
                this.email.input.classList.remove('fielderror');
                this.password.input.classList.remove('fielderror');

                auth.setUserData(data.email, data.name, data.token);
                await this.tryLogIn();
                break;
            case 'password':
                const password = this.password.value;
                if (password.length < 5) {
                    this.password.input.classList.add('fielderror');
                    showNotification('error', 'Contraseña demasiado corta', 0);
                    break;
                }
                this.password.input.classList.remove('fielderror');

                if (password !== this.repassword.value) {
                    this.repassword.input.classList.add('fielderror');
                    showNotification('error', 'Las contraseñas no coinciden', 0);
                    break;
                }
                this.repassword.input.classList.remove('fielderror');

                auth.setUserData(
                    this._cache.email, 
                    this._cache.name, 
                    await auth.addUser(
                        this._cache.email, 
                        this._cache.name, 
                        password
                    )
                );
                await this.tryLogIn();
                break;
            default:
                showNotification('error', 'Error de boton LOGIN en etapa ' + this.phase, 0);        
        }
        this.isLoading = false;
    }

    async clickNext() {
        this.isLoading = true;
        switch(this.phase) {
            case 'signup':
                if (!isValidEmail(this.email.value)) {
                    this.email.input.classList.add('fielderror');
                    showNotification('error', 'Email invalido', 0);
                    break;
                }
                if (!(await auth.canUseEmail(this.email.value))) {
                    this.email.input.classList.add('fielderror');
                    showNotification('error', 'Email en uso', 0);
                    break;
                }
                this.email.input.classList.remove('fielderror');

                this._cache.email = this.email.value;
                this._cache.name = this.name.value;
                this.goPhasePassword();
                break;
            case 'recovery': 
                const name = await auth.getNameByEmail(this.email.value);
                if (!name) {
                    this.email.input.classList.add('fielderror');
                    showNotification('error', 'Email no registrado', 0);
                    break;
                }
                this.email.input.classList.remove('fielderror');

                window.open("https://api.whatsapp.com/send?phone=1131413193&text=" + encodeURIComponent('Hola soy ' + name + '! Olvide mi contraseña, mi usuario es ' + inputEmail.value), 'blank');
                goPhaseLogin();
                break;
            default:
                showNotification('error', 'Error de boton NEXT en etapa ' + this.phase, 0);
        }
        this.isLoading = false;
    }

    async tryLogIn() {
        console.log("login!")
        const olddata = auth.getUserData();
        if (!olddata || Object.keys(olddata).length === 0) {
            auth.deleteUserData();
            this.goPhaseLogin();
            return false;
        }
        if(!navigator.onLine) {
            auth.tokenVerified = false;
            showNotification('info', 'Accediendo sin coneccion', 60);
        } else {
            const newdata = await auth.loginWithToken(olddata.email, olddata.token);
            if (!newdata) {
                auth.tokenVerified = false;
                auth.deleteUserData();
                showNotification('check', 'Expiro la sesion', 120);
                this.goPhaseLogin();
                return false;
            }
            auth.tokenVerified = true;
            auth.setUserData(newdata.email, newdata.name, olddata.token);
            this.goPhaseEmpty();
            showNotification('check', 'Bienvenido ' + newdata.name, 120);
        }
        
        screenHome.open();
        return true;
    }
}
