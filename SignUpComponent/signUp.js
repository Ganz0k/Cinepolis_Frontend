export default class SignUpComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#agregarListenerBotonInicioSesion(shadow);
    }

    async #render(shadow) {
        await fetch("./SignUpComponent/signUpCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #agregarListenerBotonInicioSesion(shadow) {
        let botonInicioSesion = shadow.querySelector("#btn-login");

        botonInicioSesion.addEventListener("click", function () {
            page("/iniciarSesion");
        });
    }
}