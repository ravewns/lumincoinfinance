import {Auth} from "../services/auth";
import {Popup} from "../utils/popup";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class Sidebar {
    private contentElement: HTMLElement | null;
    private stylesElement: HTMLElement | null;
    private titleElement: HTMLElement | null;
    private popupElement: HTMLElement | null;
    private newRoute: any;

    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('title');
        this.popupElement = document.getElementById('popup');
        this.init();
    };


    private async init(): Promise<void> {
        const userData = Auth.getUserInfo();
        (document.getElementById('sidebar-username') as HTMLElement).innerText = userData.name + ' ' + userData.lastName;
        
        (document.getElementById('user-logout-btn') as HTMLButtonElement).onclick = function () {

            Popup.setTextPopup(Popup.logoutText);
            Popup.setButtons(Popup.exitBtn, Popup.cancelBtn);
            (document.getElementById('popup-logout-btn') as HTMLButtonElement).onclick = function () {
                Auth.logout();
                location.href = "#/";
            }
        }
    

        // show-balance
        const resultBalance = await CustomHttp.request(config.host + '/balance');
        (document.getElementById('sidebar-user-balance') as HTMLElement).innerText = resultBalance.balance;

        //mainPage button
        (document.getElementById('sidebar-main-text') as HTMLElement).onclick = function () {
            location.href = '#/main';
        }

        // categories buttons
        const sidebarIncomeBtn: HTMLElement | null = document.getElementById('sidebar-income-button');
        if (sidebarIncomeBtn) {
            sidebarIncomeBtn.onclick = function () {
                location.href = '#/categories/income';
            }
        }

        const sideBarExpensesButton: HTMLElement | null = document.getElementById('sidebar-expenses-button');
        if (sideBarExpensesButton) {
            sideBarExpensesButton.onclick = function () {
                location.href = '#/categories/expenses';
            }
        }

        const sidebarIncomeExpensesText: HTMLElement | null = document.getElementById('sidebar-income-and-expenses-text');

        if (sidebarIncomeExpensesText) {
            sidebarIncomeExpensesText.onclick = function () {
                location.href = '#/operations';
            }
        }


        (this.popupElement as HTMLElement).innerHTML = await fetch('templates/UI/modal.html').then(response => response.text());
        (this.contentElement as HTMLElement).innerHTML = await fetch(this.newRoute.template).then(response => response.text());
        (this.stylesElement as HTMLElement).setAttribute('href', this.newRoute.styles);
        (this.titleElement as HTMLElement).innerText = this.newRoute.title;

        
    }
}


