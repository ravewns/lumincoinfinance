import config from "../../config/config";
import {UserInfoType} from "../types/user-info.type";
import {RefreshResponseType} from "../types/refresh-response.type";
import {LogoutResponseType} from "../types/logout-response.type";

export class Auth {

    public static accessTokenKey: string = 'accessToken';
    public static refreshTokenKey: string = 'refreshToken';
    private static userInfoKey: string = 'userInfo';

    public static async processUnautharizedResponse(): Promise<boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        const rememberMeFlag = this.getUserInfo().rememberMe;
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/refresh', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken, rememberMe: rememberMeFlag})
            });

            if (response && response.status === 200) {
                const result: RefreshResponseType | null = await response.json();
                if (result && !result.error) {
                    this.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    return true;
                }
            }
        }
 
        this.removeTokens();
        location.href = '#/';
        return false
    }


    public static async logout(): Promise <boolean> {
        const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
            const response: Response = await fetch(config.host + '/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken})
            });

            if (response && response.status === 200) {
                const result: LogoutResponseType | null = await response.json();
                if (result && !result.error) {
                    Auth.removeTokens();
                    localStorage.removeItem(Auth.userInfoKey);
                    localStorage.clear();
                    return true;
                }
            }
        }
        return false;
    }

    public static setTokens(accessToken: string, refreshToken: string): void {
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
    }

    public static removeTokens(): void {
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
    }

    public static setUserInfo(info: UserInfoType): void {
        localStorage.setItem(this.userInfoKey, JSON.stringify(info));
    }

    public static getUserInfo() {
        const userInfo: string | null = localStorage.getItem(this.userInfoKey);
        if (userInfo) {
            return JSON.parse(userInfo);
        }

        return null;
    }
}
