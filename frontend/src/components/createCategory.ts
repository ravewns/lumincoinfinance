import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class CreateCategory {
    readonly type: 'expense' | 'income';
    readonly incomeTitleText: string;
    readonly expenseTitleText: string;
    readonly createCategoryTitleElement: HTMLElement | null;
    readonly createCategoryCancelBtnElement: HTMLElement | null;
    readonly editCategorySaveBtnElement: HTMLElement | null;
    private editCategoryInput: HTMLElement | null;

    constructor(typeCategory: 'expense' | 'income') {
        this.type = typeCategory;
        this.incomeTitleText = 'Создание категории доходов';
        this.expenseTitleText = 'Создание категории расходов';
        this.createCategoryTitleElement = document.getElementById('create-category-title');
        this.createCategoryCancelBtnElement = document.getElementById('create-category-cancel-btn');
        this.editCategorySaveBtnElement = document.getElementById('create-category-save-btn');
        this.editCategoryInput = document.getElementById('create-category-input');
        this.init();
    }

    init(): void {
        if (this.type === "income" && this.createCategoryTitleElement && this.createCategoryCancelBtnElement && this.editCategorySaveBtnElement) {
            this.createCategoryTitleElement.innerText = this.incomeTitleText;
            this.createCategoryCancelBtnElement.onclick = function (): void {
                location.href = '#/categories/income';
            }

            const that: CreateCategory = this;
            this.editCategorySaveBtnElement.onclick = async function (): Promise <void> {

                if (!that.editCategoryInput) {
                    return
                }

                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/income';
                }
            }
        }

        if (this.type === 'expense' && this.createCategoryTitleElement && this.createCategoryCancelBtnElement && this.editCategorySaveBtnElement) {
            this.createCategoryTitleElement.innerText = this.expenseTitleText;
            this.createCategoryCancelBtnElement.onclick = function (): void {
                location.href = '#/categories/expenses';
            }

            const that = this;
            this.editCategorySaveBtnElement.onclick = async function (): Promise <void> {

                if (!that.editCategoryInput) {
                    return
                }

                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/expense/', 'POST', {
                        title: title
                    })
                    location.href = '#/categories/expenses';
                }
            }
        }
    }
}
