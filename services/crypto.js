export default class Crypto {

    constructor() {

    }

    static encryptData(data) {
        try {
            const encryptedData = btoa(JSON.stringify(data));
            return encryptedData;
        } catch (error) {
            console.error("Error al cifrar los datos: ", error);
            return null;
        }
    }

    static decryptData(data) {
        try {
            return JSON.parse(atob(data));
        } catch (error) {
            console.error("Error al decifrar los datos: ", error);
            return null;
        }
    }
}