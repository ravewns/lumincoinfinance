import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";

export class Form {
    private rememberMeElement: HTMLElement | null;
    private processElement: HTMLElement | null;
    readonly page: 'login' | 'signup';
    private fields: FormFieldType[];

    constructor(page: 'login' | 'signup') {
        this.rememberMeElement = null;
        this.processElement = null;
        this.page = page;

        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        const that: Form = this;

        this.fields = [
            {
                name: 'email',
                id: 'exampleInputEmail1',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'exampleInputPassword1',
                element: null,
                regex: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z\d]{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift(
                {
                    name: 'name',
                    id: 'exampleInputUsername',
                    element: null,
                    regex: /^([A-ZА-ЯЁ][a-zа-яё\-]*\s?){1,3}$/,
                    valid: false,
                },
                {
                    name: 'repeat-password',
                    id: 'exampleInputRepeatPassword',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[a-zA-Z\d]{8,}$/,
                    valid: false,
                })
        }

        if (accessToken) {
            location.href = '#/main';
            return;
        }

        if (this.page === 'login') {
            this.rememberMeElement = document.getElementById('exampleCheck1');
        }

        this.fields.forEach((item: FormFieldType): void => {
            (item.element as HTMLElement | null) = document.getElementById(item.id);
            if (item.element) {
                item.element.onchange = function (): void {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }

        })

        this.processElement = document.getElementById('process');
        if (this.processElement) {
            this.processElement.onclick = function () {
                that.processForm();
            }
        }
    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.style.borderColor = 'red';
            field.valid = false;
        } else {
            element.style.borderColor = 'blue';
            field.valid = true;
        }
        this.validateForm();
    }

    validateForm() {
        return this.fields.every((item: FormFieldType) => item.valid);
    }

    private async processForm(): Promise <void> {
        if (this.validateForm()) {
            const email: string | undefined = this.fields.find(item => item.name === 'email')?.element?.value;
            const password: string | undefined = this.fields.find(item => item.name === 'password')?.element?.value;

            if (this.page === 'signup') {
                const repeatPassword: string | undefined = this.fields.find(item => item.name === 'repeat-password')?.element?.value;
                const name: string | undefined = this.fields.find(item => item.name === 'name')?.element?.value.split(' ')[1];
                const lastName: string | undefined = this.fields.find(item => item.name === 'name')?.element?.value.split(' ')[0];

                if (password === repeatPassword) {
                    try {
                        const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                            name: name,
                            lastName: lastName,
                            email: email,
                            password: password,
                            passwordRepeat: repeatPassword,
                        })

                        if (result) {
                            if (result.error || !result.user) {
                                throw new Error(result.message);
                            }
                            location.href = "#/";
                        }
                    } catch (error) {
                        console.log(error);
                        return;
                    }
                }
            }

            if (this.page === 'login' && this.rememberMeElement) {
                try {
                    const rememberMe: boolean = (this.rememberMeElement as HTMLInputElement).checked;
                    const result = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password,
                        rememberMe: rememberMe,
                    })

                    if (result) {
                        if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                            (document.getElementById('login-form-error-message') as HTMLElement).style.display = 'block';
                            throw new Error(result.message);
                        }

                        Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                        Auth.setUserInfo({
                            name: result.user.name,
                            userId: result.user.id.toString(),
                            lastName: result.user.lastName,
                            rememberMe: rememberMe
                        })
                        location.href = "#/main";
                        (document.getElementById('sidebar-username') as HTMLElement).innerText = result.user.name + ' ' + result.user.lastName;
                    } else {
                        (document.getElementById('login-form-error-message') as HTMLElement).style.display = 'block';
                    }
                } catch (error) {
                    (document.getElementById('login-form-error-message') as HTMLElement).style.display = 'block';
                    return console.log(error);
                }
            }
        }
    }
}
