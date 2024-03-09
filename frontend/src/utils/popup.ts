export class Popup {
    static logoutText: string = 'Вы действительно хотите выйти?';
    static incomeRemoveText: string = 'Вы действительно хотите удалить категорию? Связанные доходы будут удалены навсегда.';
    static expensesRemoveText: string = 'Вы действительно хотите удалить категорию? Связанные расходы будут удалены навсегда.';
    static removeOperationText: string = 'Вы действительно хотите удалить операцию?';
    static exitBtn: string = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal" id="popup-logout-btn">Выйти</button>';
    static cancelBtn: string = '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>';
    static notRemoveBtn: string = '<button type="button" class="btn btn-danger" data-bs-dismiss="modal">Не удалять</button>';
    static yesRemoveBtn: string = '<button type="button" class="btn btn-success" data-bs-dismiss="modal" id="popup-remove-category-btn">Да, удалить</button>';

    public static setButtons(leftButton: string, rightButton: string): void {
        let btnModalContent = document.getElementById('btn-modal-content')
        if (btnModalContent) {
            btnModalContent.innerHTML = leftButton + rightButton;
        }
    }    

    public static setTextPopup(text: string): void {
        let textModalContent = document.getElementById('text-modal-content');
        if (textModalContent) {
            textModalContent.innerText = text;
        }
    }
}
