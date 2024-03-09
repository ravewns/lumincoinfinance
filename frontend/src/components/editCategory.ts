import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";

export class EditCategory {
    readonly type: 'expense' | 'income';
    readonly incomeEditTitleText: string;
    readonly expenseEditTitleText: string;
    readonly editCategoryTitleElement: HTMLElement | null;
    readonly editCategoryCancelBtnElement: HTMLElement | null;
    readonly editCategorySaveBtnElement: HTMLElement | null;
    readonly editCategoryInput: HTMLElement | null;
    private categoryTitleInput: Storage;

    constructor(typeCategory: 'expense' | 'income') {
        this.type = typeCategory;
        this.incomeEditTitleText = 'Редактирование категории доходов';
        this.expenseEditTitleText = 'Редактирование категории расходов';
        this.editCategoryTitleElement = document.getElementById('create-category-title');
        this.editCategoryCancelBtnElement = document.getElementById('create-category-cancel-btn');
        this.editCategorySaveBtnElement = document.getElementById('create-category-save-btn');
        this.editCategoryInput = document.getElementById('create-category-input');
        this.categoryTitleInput = JSON.parse(localStorage.getItem('editCategory')!);
        this.init();
    }

    init(): void {
        if (!this.editCategoryInput || !this.editCategoryTitleElement || !this.editCategoryCancelBtnElement || !this.editCategorySaveBtnElement) {
            return
        }
        (this.editCategoryInput as HTMLInputElement).value = this.categoryTitleInput.title;
        if (this.type === 'income') {
            this.editCategoryTitleElement.innerText = this.incomeEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function (): void {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }

            const that: EditCategory = this;
            this.editCategorySaveBtnElement.onclick = async function (): Promise <void> {
                if (!that.editCategoryInput) {
                    return
                }
                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/income/' + that.categoryTitleInput.id, 'PUT', {
                        title: title
                    })
                }
                localStorage.removeItem('editCategory');
                location.href = '#/categories/income';
            }
        }

        if (this.type === 'expense') {
            this.editCategoryTitleElement.innerText = this.expenseEditTitleText;
            this.editCategoryCancelBtnElement.onclick = function (): void {
                localStorage.removeItem('editCategory');
                location.href = '#/categories/expenses';
            }

            const that: EditCategory = this;
            this.editCategorySaveBtnElement.onclick = async function (): Promise <void> {
                if (!that.editCategoryInput) {
                    return
                }
                const title: string = (that.editCategoryInput as HTMLInputElement).value.trim();
                if (title) {
                    await CustomHttp.request(config.host + '/categories/expense/' + that.categoryTitleInput.id, 'PUT', {
                        title: title
                    })
                }
                localStorage.removeItem('editCategory');
                location.href = '#/categories/expenses';
            }
        }
    }
}
