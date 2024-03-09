import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Popup} from "../utils/popup";
import {DateFormatter} from "../utils/dateFormatter";
import {SvgBtns} from "../utils/svgBtns";

export class Operations {
    readonly createBtnElement: HTMLElement | null;
    readonly createBtnElementExpense: HTMLElement | null;
    private dateInputFromElement: HTMLElement | null;
    private dateInputToElement: HTMLElement | null;
    readonly operationTableBody: HTMLElement | null;
    private dateIntervalElement: HTMLElement | null;

    constructor() {
        this.createBtnElement = document.getElementById('operations-create-btn');
        this.createBtnElementExpense = document.getElementById('operations-create-btn-expense');
        this.dateInputFromElement = document.getElementById('date-input-from');
        this.dateInputToElement = document.getElementById('date-input-to');
        this.operationTableBody = document.getElementById('operations-table-body-content');
        this.dateIntervalElement = document.getElementById('intervalButton');
        this.init();
    }

    init(): void {
        const currentDate: Date = new Date();
        this.loadingOperations(DateFormatter.YYYY_MM_DD(currentDate), DateFormatter.YYYY_MM_DD(currentDate));
        this.activateButtons();

        if (this.createBtnElement) {
            this.createBtnElement.onclick = function () {
                location.href = '#/operations/create';
                localStorage.setItem('operation', 'Доход');
            }
        }

        if (this.createBtnElementExpense) {
            this.createBtnElementExpense.onclick = function () {
                location.href = '#/operations/create';
                localStorage.setItem('operation', 'Расход');
            }
        }
    }

    private activateButtons(): void {
        const that = this;
        const menuItems = document.getElementsByClassName('operations-date-buttons');
        const currentDate = DateFormatter.YYYY_MM_DD(new Date());

        const onClick = function (event: Event): void {
            event.preventDefault();

            for (let i: number = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            if (event.currentTarget) {
                (event.currentTarget as HTMLElement).classList.add('active');
            }

            if (!event.currentTarget) {
                return
            }
            switch ((event.currentTarget as HTMLElement).innerText.toLowerCase()) {
                case 'сегодня':
                    that.loadingOperations(currentDate, currentDate);
                    break;

                case 'неделя':
                    that.loadingOperations(DateFormatter.weekDate, currentDate);
                    break;

                case 'месяц':
                    that.loadingOperations(DateFormatter.monthDate, currentDate);
                    break;

                case 'год':
                    that.loadingOperations(DateFormatter.yearDate, currentDate);
                    break;

                case 'все':
                    that.loadingOperations(DateFormatter.allDate, currentDate);
                    break;

                case 'интервал':

                    if (that.operationTableBody && that.dateIntervalElement) {
                        that.operationTableBody.innerHTML = '';

                        that.dateIntervalElement.onclick = function () {
                            const fromDateValue = (that.dateInputFromElement as HTMLInputElement).value;
                            const toDateValue = (that.dateInputToElement as HTMLInputElement).value;
                            if (fromDateValue && toDateValue) {
                                that.loadingOperations(fromDateValue, toDateValue);
                            } else {
                                (that.operationTableBody as HTMLInputElement).innerHTML = '';
                            }
                        }
                    }



                    (that.dateInputToElement as HTMLInputElement).onchange = function () {
                        const fromDateValue = (that.dateInputFromElement as HTMLInputElement).value;
                        const toDateValue = (that.dateInputToElement as HTMLInputElement).value;
                        if (fromDateValue && toDateValue) {
                            that.loadingOperations(fromDateValue, toDateValue);
                        } else {
                            (that.operationTableBody as HTMLInputElement).innerHTML = '';
                        }
                    }
                    break;
            }
        };

        for (let i: number = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', onClick, false);
        }
    }

    private async loadingOperations(dateFrom: string, dateTo: string): Promise <void> {
        const emptyBlock: HTMLElement | null = document.getElementById('operations-empty-text');
        const result = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        if (emptyBlock) {
            emptyBlock.style.display = (result.length === 0) ? 'block' : 'none';
            if (this.operationTableBody) {
                this.operationTableBody.innerHTML = '';
            }
        }

        result.forEach((operation:any, index: string) => {
            const tRow: HTMLTableRowElement = document.createElement('tr');
            const tHead: HTMLTableCellElement = document.createElement('th');
            const tdType: HTMLTableCellElement = document.createElement('td');
            const tdCategory: HTMLTableCellElement = document.createElement('td');
            const tdAmount: HTMLTableCellElement = document.createElement('td');
            const tdDate: HTMLTableCellElement = document.createElement('td');
            const tdComment: HTMLTableCellElement = document.createElement('td');
            const tdBtns: HTMLTableCellElement = document.createElement('td');
            const removeBtn: HTMLButtonElement = document.createElement('button');
            const changeBtn: HTMLButtonElement = document.createElement('button');
            const that: Operations = this;

            tRow.id = 'table-row-' + operation.id;
            removeBtn.innerHTML = SvgBtns.removeBtn;
            changeBtn.innerHTML = SvgBtns.editBtn;
            removeBtn.setAttribute('data-bs-toggle', "modal");
            removeBtn.setAttribute("data-bs-target", "#userModal");

            changeBtn.onclick = function () {
                localStorage.setItem('editOperation', JSON.stringify(operation.id));
                location.href = '#/operations/edit'
            }

            removeBtn.onclick = function () {
                Popup.setTextPopup(Popup.removeOperationText);
                Popup.setButtons(Popup.yesRemoveBtn, Popup.notRemoveBtn);
                (document.getElementById('popup-remove-category-btn') as HTMLButtonElement).onclick = async function () {
                    const currentBalance = document.getElementById('sidebar-user-balance');
                    let updatedBalance;
                    if (operation.type === 'income' && currentBalance) {
                        updatedBalance = Number(currentBalance.innerText) - operation.amount;
                    } else if (currentBalance) {
                        updatedBalance = Number(currentBalance.innerText) + operation.amount;
                    }

                    if (currentBalance) {
                        currentBalance.innerText = updatedBalance;
                    }
                    await CustomHttp.request(config.host + '/operations/' + operation.id, 'DELETE');
                    await CustomHttp.request(config.host + '/balance', 'PUT', {newBalance: updatedBalance});
                    that.loadingOperations(dateFrom, dateTo);
                }
            }

            tdBtns.appendChild(removeBtn);
            tdBtns.appendChild(changeBtn);
            tHead.innerText = index + 1;
            tRow.appendChild(tHead);
            tRow.appendChild(tdType);
            tdCategory.innerText = operation.category;
            tRow.appendChild(tdCategory);
            tdAmount.innerText = operation.amount + '$';
            tRow.appendChild(tdAmount);
            tdDate.innerText = DateFormatter.DD_MM_YYYY(new Date(operation.date));
            tRow.appendChild(tdDate);
            tdComment.innerText = operation.comment;
            tRow.appendChild(tdComment);
            tRow.appendChild(tdBtns);

            if (operation.type === 'income') {
                tdType.style.color = 'green';
                tdType.innerText = 'доход';
            }

            if (operation.type === 'expense') {
                tdType.style.color = 'red';
                tdType.innerText = 'расход';
            }

            (document.getElementById('operations-table-body-content') as HTMLTableElement).appendChild(tRow);
        })
    }
}
