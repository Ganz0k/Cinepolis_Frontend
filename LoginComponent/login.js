export default class LoginComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#agregarListenerBotonRegistro(shadow);
    }

    async #render(shadow) {
        await fetch("./LoginComponent/loginCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #agregarListenerBotonRegistro(shadow) {
        let botonRegistro = shadow.querySelector("#register-button");

        botonRegistro.addEventListener("click", function () {
            page("/frontend/registrarse");
        });
    }
}