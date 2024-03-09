import Chart from 'chart.js/auto'
import {DateFormatter} from "../utils/dateFormatter";
import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {OperationType} from "../types/operation.type";
import {Auth} from "../services/auth";

export class Main {
    private dateInputFromElement: HTMLInputElement;
    private dateInputToElement: HTMLInputElement;
    private dateIntervalElement: HTMLInputElement;
    private incomeChart: any;
    private expenseChart: any;
    private token: string | null = localStorage.getItem(Auth.accessTokenKey);

    constructor() {
        this.dateInputFromElement = document.getElementById('date-input-from') as HTMLInputElement;
        this.dateInputToElement = document.getElementById('date-input-to') as HTMLInputElement;
        this.dateIntervalElement = document.getElementById('main-interval-button') as HTMLInputElement;


        this.incomeChart = new Chart(
            document.getElementById('pie-income') as HTMLCanvasElement,
            {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Доходы',
                        data: [],
                        backgroundColor: [
                            'rgba(253, 126, 20, 1)',
                            'rgb(194,220,20)',
                            'rgb(70,253,20)',
                            'rgb(20,253,113)',
                            'rgb(20,24,253)',
                            'rgb(140,20,253)',
                            'rgba(220, 53, 69, 1)',
                            'rgba(32, 201, 151, 1)',
                            'rgba(13, 110, 253, 1)',
                            'rgb(20,199,253)',
                            'rgba(255, 193, 7, 1)',
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Доходы'
                        }
                    }
                },
            }
        );

        this.expenseChart = new Chart(
            document.getElementById('pie-expense') as HTMLCanvasElement,
            {
                type: 'pie',
                data: {
                    labels: ['Пусто'],
                    datasets: [{
                        label: 'Расходы',
                        data: [],
                        backgroundColor: [
                            'rgba(220, 53, 69, 1)',
                            'rgba(32, 201, 151, 1)',
                            'rgba(13, 110, 253, 1)',
                            'rgb(20,199,253)',
                            'rgba(255, 193, 7, 1)',
                            'rgba(253, 126, 20, 1)',
                            'rgb(195,222,18)',
                            'rgb(70,253,20)',
                            'rgb(20,253,113)',
                            'rgb(20,24,253)',
                            'rgb(140,20,253)',
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Расходы'
                        }
                    }
                },
            }
        );

        this.init();
    }

    private async init(): Promise <void> {
        const currentDate: string = DateFormatter.YYYY_MM_DD(new Date());
        this.loadingOperations(currentDate, currentDate);
        this.activateButtons();
    }

    private activateButtons(): void {
        const that = this;
        const menuItems: HTMLCollectionOf<Element> = document.getElementsByClassName('operations-date-buttons');
        const currentDate: string = DateFormatter.YYYY_MM_DD(new Date());

        const onClick = function (event: Event) {
            event.preventDefault();

            for (let i: number = 0; i < menuItems.length; i++) {
                menuItems[i].classList.remove('active');
            }

            if (!event.currentTarget) {
                return
            }

            (event.currentTarget as HTMLInputElement).classList.add('active');

            switch ((event.currentTarget as HTMLInputElement).innerText.toLowerCase()) {
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

                    that.dateIntervalElement.onclick = function (): void {
                        const fromDateValue = that.dateInputFromElement.value;
                        const toDateValue = that.dateInputToElement.value;
                        that.loadingOperations(fromDateValue, toDateValue);
                    }

                    that.dateInputToElement.onchange = function (): void {
                        const fromDateValue = that.dateInputFromElement.value;
                        const toDateValue = that.dateInputToElement.value;
                        that.loadingOperations(fromDateValue, toDateValue);
                    }

                    that.dateInputFromElement.onchange = function (): void {
                        const fromDateValue = that.dateInputFromElement.value;
                        const toDateValue = that.dateInputToElement.value;
                        that.loadingOperations(fromDateValue, toDateValue);
                    }
                    break;
            }
        };

        for (let i: number = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', onClick, false);
        }
    }

    private async loadingOperations(dateFrom: string, dateTo: string): Promise <void> {
        const result = await CustomHttp.request(config.host + `/operations?period=interval&dateFrom=${dateFrom}&dateTo=${dateTo}`);
        const emptyExpenseText: HTMLElement | null = document.getElementById('main-page-empty-text-expense');
        const emptyIncomeText: HTMLElement | null = document.getElementById('main-page-empty-text-income');

        const incomeCategoriesMap: Map<any,any> = new Map();
        const expenseCategoriesMap: Map<any,any> = new Map();
        const incomeCategories: any[] = [];
        const incomeAmounts: any[] = [];
        const expenseCategories: any[] = [];
        const expenseAmounts: any [] = [];

        result.forEach((operation: OperationType): void => {
            if (operation.type === 'income') {
                const category = operation.category;
                const amount = operation.amount;
                if (incomeCategoriesMap.has(category)) {
                    incomeCategoriesMap.set(category, incomeCategoriesMap.get(category) + amount);
                } else {
                    incomeCategoriesMap.set(category, amount);
                }
            }

            if (operation.type === 'expense') {
                const category = operation.category;
                const amount = operation.amount;
                if (expenseCategoriesMap.has(category)) {
                    expenseCategoriesMap.set(category, expenseCategoriesMap.get(category) + amount);
                } else {
                    expenseCategoriesMap.set(category, amount);
                }
            }
        })

        incomeCategoriesMap.forEach((value, key) => {
            incomeCategories.push(key);
            incomeAmounts.push(value);
        });

        expenseCategoriesMap.forEach((value, key) => {
            expenseCategories.push(key);
            expenseAmounts.push(value);
        });

        if (!emptyIncomeText || !emptyExpenseText) {
            return;
        }

        emptyIncomeText.style.display = (incomeCategories.length === 0) ? 'block' : 'none';
        emptyExpenseText.style.display = (expenseCategories.length === 0) ? 'block' : 'none';

        this.incomeChart.data.datasets[0].data = incomeAmounts;
        this.incomeChart.data.labels = incomeCategories;
        this.incomeChart.update();
        this.expenseChart.data.datasets[0].data = expenseAmounts;
        this.expenseChart.data.labels = expenseCategories;
        this.expenseChart.update();

    }
}
