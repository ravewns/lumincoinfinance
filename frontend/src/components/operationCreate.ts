import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationCreateType} from "../types/operation-create.type";

export class OperationCreate {
    readonly operationType: 'create' | 'edit';
    private titleOperationElement: HTMLElement | null;
    private createSelectTypeElement: HTMLElement | null;
    private cancelButtonElement: HTMLElement | null;
    private createButtonElement: HTMLElement | null;
    private amountInputElement: HTMLElement | null;
    private dateInputElement: HTMLElement | null;
    private commentInputElement: HTMLElement | null;
    readonly expenseCategories:any = [];
    readonly incomeCategories:any = [];
    private editOperation: any;
    private operationId: any;
    private operator: string | null;

    constructor(type: 'create' | 'edit') {
        this.operationType = type;
        this.titleOperationElement = document.getElementById('operation-create-title');
        this.createSelectTypeElement = document.getElementById('operation-create-select-type');
        this.cancelButtonElement = document.getElementById('operations-create-cancel-btn');
        this.createButtonElement = document.getElementById('operations-create-new-btn');
        this.amountInputElement = document.getElementById('operation-create-input-number');
        this.dateInputElement = document.getElementById('operation-create-input-date');
        this.commentInputElement = document.getElementById('operation-create-input-comment');
        this.expenseCategories = [];
        this.incomeCategories = [];
        this.editOperation = null
        this.operator = localStorage.getItem('operation');

        if (type === 'edit') {
            (this.titleOperationElement as HTMLElement).innerText = 'Редактирование дохода/расхода';
            (this.createButtonElement as HTMLElement).innerText = 'Сохранить';
        }

        this.init();
    }

    private async init(): Promise <void> {
        const that: OperationCreate = this;
        const expensesResult = await CustomHttp.request(config.host + '/categories/expense');
        const incomeResult = await CustomHttp.request(config.host + '/categories/income');
        expensesResult.forEach((expense: any) => this.expenseCategories.push(expense));
        incomeResult.forEach((income: any) => this.incomeCategories.push(income));

        if (this.operator === 'Доход') { 
            document.getElementById('option-income')!.setAttribute('selected', '');
            this.loadOptions(this.incomeCategories);
        } else if (this.operator === 'Расход') {
            document.getElementById('option-expense')!.setAttribute('selected', '');
            this.loadOptions(this.expenseCategories);
        }

        (this.createSelectTypeElement as HTMLElement).addEventListener('change', function (e: Event): void {
            if (!e.target) {
                return
            }

            let selectType = (e.target as HTMLInputElement).value;
            that.loadingCategories(selectType);
        })

        if (this.operationType === 'edit') {
            this.operationId = JSON.parse(localStorage.getItem('editOperation')!);
            this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
            this.loadingCategories(this.editOperation.type);
        }


        if (this.cancelButtonElement) {
            this.cancelButtonElement.onclick = function (): void {
                location.href = '#/operations';
                localStorage.removeItem('editOperation');
                localStorage.removeItem('operation');
            }
        }

        if (!this.createButtonElement) {
            return;
        }


        this.createButtonElement.onclick = async function (): Promise <void> {
            let createSelectCategoryElement: HTMLElement | null = document.getElementById('operation-create-select-category');
            const comment: string = (that.commentInputElement as HTMLInputElement).value;
            const date: string = (that.dateInputElement as HTMLInputElement).value;
            const type: string = (that.createSelectTypeElement as HTMLInputElement).value;
            const amount: number = Number((that.amountInputElement as HTMLInputElement).value.replace('$', ''));
            const categoryID: number = Number((createSelectCategoryElement as HTMLInputElement).value);

            if (comment && date && type && amount && categoryID) {
                const body: OperationCreateType = {
                    type: type,
                    amount: amount,
                    date: date,
                    comment: comment,
                    category_id: categoryID
                }

                if (that.operationType === 'edit') {
                    await CustomHttp.request(config.host + '/operations/' + that.operationId, 'PUT', body);
                } else {
                    await CustomHttp.request(config.host + '/operations', 'POST', body);
                }
                location.href = '#/operations';
                localStorage.removeItem('editOperation');
            }
        }
    }

    private loadingCategories(selectType: string): void {
        const createSelectCategoryElement: HTMLElement | null = document.getElementById('operation-create-select-category');
        if (createSelectCategoryElement) {
            createSelectCategoryElement.innerHTML = '';
        }

        if (selectType === 'income') {
            this.loadOptions(this.incomeCategories);
            if (this.operationType === 'edit') {
                this.filledInputs(selectType)
            }
        }

        if (selectType === 'expense') {
            this.loadOptions(this.expenseCategories);
            if (this.operationType === 'edit') {
                this.filledInputs(selectType)
            }
        }
        
    }

    private async filledInputs(type: string): Promise <void> {
        this.operationId = JSON.parse(localStorage.getItem('editOperation')!);
        this.editOperation = await CustomHttp.request(config.host + '/operations/' + this.operationId);
        (document.getElementById(`option-${type}`) as HTMLElement).setAttribute('selected', 'selected');
        const options = document.getElementsByTagName("option");
        for (let i: number = 0; i < options.length; i++) {
            if (!this.editOperation) {
                return
            }
            if (options[i].innerText === this.editOperation.category) {
                options[i].setAttribute('selected', 'selected');
            }
        }
        if (!this.amountInputElement || !this.dateInputElement || !this.commentInputElement || !this.editOperation) {
            return
        }
        (this.amountInputElement as HTMLInputElement).value = this.editOperation.amount + '$';
        (this.dateInputElement as HTMLInputElement).value = this.editOperation.date;
        (this.commentInputElement as HTMLInputElement).value = this.editOperation.comment;
    }

    private loadOptions(categories: any): void {
        const createSelectCategoryElement: HTMLElement | null = document.getElementById('operation-create-select-category');
        (createSelectCategoryElement as HTMLElement).innerHTML = '';
        categories.forEach((income:any): void => {
            const optionCategory = document.createElement('option');
            optionCategory.innerText = income.title;
            optionCategory.value = income.id;
            (createSelectCategoryElement as HTMLElement).appendChild(optionCategory);
        })
    }
}
