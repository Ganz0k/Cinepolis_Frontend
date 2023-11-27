import Crypto from "./crypto.js";

export default class CookiesService {
    
    constructor() {

    }

    static setCookie(name, value, days) {
        const encryptedValue = Crypto.encryptData(value);
        let expires = "";

        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = `; expires=${date.toUTCString()}`;
        }

        document.cookie = `${name}=${encryptedValue}${expires};path=/`;
    }

    static getCookie(name) {
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            const [cookieName, cookieValue] = cookie.split("=");

            if (cookieName === name) {
                return Crypto.decryptData(cookieValue.trim());
            }
        }

        return null;
    }
}