import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Popup} from "../utils/popup";
import {DateFormatter} from "../utils/dateFormatter";

export class Categories {
    private categoryType: HTMLElement | null = document.getElementById('category-title');
    readonly incomeCategories: any;
    readonly expenseCategories: any;
    readonly type: "expense" | "income";
    private cards: any;
    readonly cardItems: HTMLElement | null;
    readonly newBtnElement: HTMLElement | null;

    constructor(typeCategory: 'expense' | 'income') {

        if (this.categoryType) {
            this.categoryType.innerText = (typeCategory === 'income') ? 'Доходы' : 'Расходы';
        }
        this.incomeCategories = [];
        this.expenseCategories = [];
        this.type = typeCategory;
        this.cards = (typeCategory === 'income') ? this.incomeCategories : this.expenseCategories;
        this.cardItems = document.getElementById('cards');
        this.newBtnElement = document.getElementById('category-new-item-button');
        this.init();
    }

    private async init(): Promise<void> {
        if (this.type === 'income' && this.newBtnElement) {
            const result = await CustomHttp.request(config.host + '/categories/income');
            result.forEach((item: any) => this.incomeCategories.push(item));
            this.newBtnElement.onclick = function (): void {
                location.href = '#/categories/income/create';
            }
        }

        if (this.type === 'expense' && this.newBtnElement) {
            const result = await CustomHttp.request(config.host + '/categories/expense');
            result.forEach((item: any) => this.expenseCategories.push(item));
            this.newBtnElement.onclick = function (): void {
                location.href = '#/categories/expense/create';
            }
        }

        for (let i: number = 0; i < this.cards.length; i++) {
            const itemCard: HTMLDivElement = document.createElement('div');
            itemCard.innerHTML = await fetch('templates/UI/card.html').then(response => response.text());
            if (this.cardItems) {
                this.cardItems.appendChild(itemCard);
            }
            const that: Categories = this;
            document.getElementsByClassName('card-item-title')[i].textContent = this.cards[i].title;
            (document.getElementsByClassName('card-edit-btn')[i] as HTMLInputElement).onclick = function (): void {
                localStorage.setItem('editCategory', JSON.stringify(that.cards[i]));
                if (that.type === 'income') {
                    location.href = '#/categories/income/edit';
                }

                if (that.type === 'expense') {
                    location.href = '#/categories/expense/edit';
                }
            }
            const cardRemoveBtn: HTMLCollectionOf<Element> = document.getElementsByClassName('card-remove-btn');
            (cardRemoveBtn[i] as HTMLInputElement).onclick = async function (): Promise<void> {
                Popup.setTextPopup(Popup.incomeRemoveText);
                Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                const currentDate: string = DateFormatter.YYYY_MM_DD(new Date());
                const operations = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${DateFormatter.allDate}&dateTo=${currentDate}`);
                const currentBalance: HTMLElement | null  = document.getElementById('sidebar-user-balance');
                let updatedBalance: number;

                const popupRemoveCategoryBtn: HTMLElement | null = document.getElementById('popup-remove-category-btn');

                if (that.type === 'income' && popupRemoveCategoryBtn) {    
                    popupRemoveCategoryBtn.onclick = async function (): Promise <void> {
                        await CustomHttp.request(config.host + '/categories/income/' + that.cards[i].id, 'DELETE');
                        for (let j: number = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title && currentBalance) {
                                updatedBalance = Number(currentBalance.innerText) - operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                currentBalance.innerText = String(updatedBalance);
                            }
                        }
                        location.href = '#/categories/income';
                    }
                }

                if (that.type === 'expense' && popupRemoveCategoryBtn && currentBalance) {
                    Popup.setTextPopup(Popup.expensesRemoveText);
                    Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                    const popupRemoveCategoryBtn: HTMLElement | null = document.getElementById('popup-remove-category-btn');
                    (popupRemoveCategoryBtn as HTMLElement).onclick = async function () {
                        console.log('SOS')
                        await CustomHttp.request(config.host + '/categories/expense/' + that.cards[i].id, 'DELETE');
                        for (let j: number = 0; j < operations.length; j++) {
                            if (operations[j].category === that.cards[i].title) {
                                updatedBalance = Number(currentBalance.innerText) + operations[j].amount;
                                await CustomHttp.request(config.host + '/operations/' + operations[j].id, 'DELETE');
                                await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                                currentBalance.innerText = String(updatedBalance);
                            }
                        }
                        location.href = '#/categories/expenses';
                    }
                }
            }
        }
        if (this.cardItems && this.newBtnElement) {
            this.cardItems.appendChild(this.newBtnElement);
            this.newBtnElement.style.display = 'flex';
        }
    }
}
