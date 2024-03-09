import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Categories} from "./components/categories";
import {Popup} from "./utils/popup";
import {CustomHttp} from "./services/custom-http";
import config from "../config/config";
import {CreateCategory} from "./components/createCategory";
import {EditCategory} from "./components/editCategory";
import {Operations} from "./components/operations";
import {OperationCreate} from "./components/operationCreate";
import {Main} from "./components/main";
import {RouteType} from "./types/route-type";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly popupElement: HTMLElement | null;
    readonly mainElement: HTMLElement | null;
    readonly sidebarContentElement: HTMLElement | null;
    readonly contentElements: HTMLElement | null;
    readonly sidebarUsername: HTMLElement | null;
    readonly userLogoutBtn: HTMLElement | null;
    readonly popupLogoutBtn: HTMLElement | null;
    readonly sidebarUserBalance: HTMLElement | null;
    private routes: RouteType[];

    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.popupElement = document.getElementById('popup');
        this.mainElement = document.getElementById('main');
        this.sidebarContentElement = document.getElementById('sidebar-content');
        this.contentElements = document.getElementById('content');
        this.sidebarUsername = document.getElementById('sidebar-username');
        this.userLogoutBtn = document.getElementById('user-logout-btn');
        this.popupLogoutBtn = document.getElementById('popup-logout-btn');
        this.sidebarUserBalance = document.getElementById('sidebar-user-balance');


        this.routes = [
            {
                route: '#/',
                title: 'Вход',
                template: 'templates/login.html',
                styles: 'css/form.css',
                load: (): void => {
                    new Form('login');
                }
            },
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'css/form.css',
                load: (): void => {
                    new Form('signup');
                }
            },
            {
                route: '#/categories/income',
                title: 'Доходы',
                template: 'templates/categories.html',
                styles: 'css/categories.css',
                load: (): void => {
                    new Categories('income');
                }
            },
            {
                route: '#/categories/expenses',
                title: 'Расходы',
                template: 'templates/categories.html',
                styles: 'css/categories.css',
                load: (): void => {
                    new Categories('expense');
                }
            },
            {
                route: '#/categories/income/create',
                title: 'Создание категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: (): void => {
                    new CreateCategory('income');
                }
            },
            {
                route: '#/categories/expense/create',
                title: 'Создание категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: (): void => {
                    new CreateCategory('expense');
                }
            },
            {
                route: '#/categories/expense/edit',
                title: 'Редактирование категории расходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: (): void => {
                    new EditCategory('expense');
                }
            },
            {
                route: '#/categories/income/edit',
                title: 'Редактирование категории доходов',
                template: 'templates/createCategory.html',
                styles: 'css/createCategory.css',
                load: (): void => {
                    new EditCategory('income');
                }
            },
            {
                route: '#/operations',
                title: 'Доходы и расходы',
                template: 'templates/operations.html',
                styles: 'css/operations.css',
                load: (): void => {
                    new Operations();
                }
            },
            {
                route: '#/operations/create',
                title: 'Создание дохода/расхода',
                template: 'templates/operationCreate.html',
                styles: 'css/operationCreate.css',
                load: (): void => {
                    new OperationCreate('create');
                }
            },
            {
                route: '#/operations/edit',
                title: 'Редактирование дохода/расхода',
                template: 'templates/operationCreate.html',
                styles: 'css/operationCreate.css',
                load: (): void => {
                    new OperationCreate('edit');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/main.html',
                styles: 'css/main.css',
                load: (): void => {
                    new Main();
                }
            },
        ];
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/';
                return;
            }
        }


        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        if (!this.mainElement || !this.mainElement || !this.contentElement || !this.sidebarContentElement || !this.contentElements
        || !this.popupElement || !this.stylesElement || !this.titleElement || !this.sidebarUserBalance || !this.userLogoutBtn || !this.sidebarUsername) {
            if (urlRoute === '#/') {
                return
            } else {
                window.location.href = '#/';
                return;
            }
        }

        if (urlRoute === '#/') {
            this.mainElement.style.justifyContent = 'center';
            this.mainElement.style.alignItems = 'center';
            this.contentElement.style.marginLeft = "0";
            this.sidebarContentElement.style.display = 'none';
           
        } else if (urlRoute === '#/signup') {
            this.mainElement.style.justifyContent = 'center';
            this.mainElement.style.alignItems = 'center';
            this.contentElement.style.marginLeft = "0";
            this.sidebarContentElement.style.display = 'none';
        } else {
            this.mainElement.style.justifyContent = 'start';
            this.mainElement.style.alignItems = 'start';
            this.contentElements.style.marginLeft = "219px";
            this.sidebarContentElement.style.display = 'flex';

            const userData = Auth.getUserInfo();
            if (userData) {
            this.sidebarUsername.innerText = userData.name + ' ' + userData.lastName;
            } 

            this.userLogoutBtn.onclick = function (): void {
                Popup.setTextPopup(Popup.logoutText);
                Popup.setButtons(Popup.exitBtn, Popup.cancelBtn);
                
                const popupLogoutBtn: HTMLElement | null = document.getElementById('popup-logout-btn');
            
                if (!popupLogoutBtn) {
                    return;
                }
                const logoutBtn: HTMLElement | null = document.getElementById('user-logout-btn');
                popupLogoutBtn.onclick = function (): void {
                    Auth.logout();
                    location.href = "#/login";
                }
            }

            // Show Balance
            const resultBalance = await CustomHttp.request(config.host + '/balance');
            this.sidebarUserBalance.innerText = resultBalance.balance;

        }

        this.popupElement.innerHTML = await fetch('templates/UI/modal.html').then(response => response.text());
        this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerText = newRoute.title;
    

        function setActiveLink() {
            const links = document.querySelectorAll('.nav-link');
            links.forEach(link => {
                const href: string | null = link.getAttribute('href');
                if (href === urlRoute && link.firstElementChild) {
                    link.classList.add('active');
                    link.classList.add('text-light');
                    (link.firstElementChild as HTMLInputElement).style.fill = 'white'
                } else if (link.firstElementChild) {
                    link.classList.remove('active');
                    link.classList.remove('text-light');
                    (link.firstElementChild as HTMLInputElement).style.fill = '#052C65'
                }
            });
        }

        const categoriesBtn: HTMLElement | null = document.getElementById('sidebar-categories-button');
        const fcollapse: HTMLElement | null = document.getElementById('flush-collapseOne');
        const categoriesBlock: HTMLElement | null = document.getElementById('categories-collapse');
        const arrow: HTMLElement | null = document.getElementById('arrow');

        (fcollapse as HTMLElement).addEventListener('show.bs.collapse', function () {
            (categoriesBtn as HTMLElement).classList.add('text-white');
            (categoriesBtn as HTMLElement).style.backgroundColor = '#0d6efd';
            (categoriesBlock as HTMLElement).classList.add('border');
            (categoriesBlock as HTMLElement).classList.add('border-primary');
            (categoriesBlock as HTMLElement).classList.add('rounded-3');
            (arrow as HTMLElement).style.transform = 'rotate(90deg)';
            (arrow as HTMLElement).style.fill = '#ffffff';
        });

        (fcollapse as HTMLElement).addEventListener('hide.bs.collapse', function () {
            (categoriesBtn as HTMLElement).classList.remove('text-white');
            (categoriesBtn as HTMLElement).style.backgroundColor = 'transparent';
            (categoriesBlock as HTMLElement).classList.remove('border');
            (categoriesBlock as HTMLInputElement).classList.remove('border-primary');
            (categoriesBlock as HTMLElement).classList.remove('rounded-3');
            (arrow as HTMLElement).style.transform = 'rotate(0)';
            (arrow as HTMLElement).style.fill = '#052C65';
        });

        setActiveLink()
        window.addEventListener('hashchange', setActiveLink);
        newRoute.load();
    }
}
