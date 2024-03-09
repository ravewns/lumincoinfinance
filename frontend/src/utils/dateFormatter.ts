export class DateFormatter {
    static weekDate: string = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7));
    static monthDate: string = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
    static yearDate: string = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()));
    static allDate: string = DateFormatter.YYYY_MM_DD(new Date(new Date().getFullYear() - 300, new Date().getMonth(), new Date().getDate()));

    public static YYYY_MM_DD(date: any): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`;
    }

    public static DD_MM_YYYY(date: any): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0')
        return `${day}.${month}.${year}`;
    }
}
