import CookiesService from "../services/cookiesService.js";

export default class LoginComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#agregarListeners(shadow);
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

    #agregarListeners(shadow) {
        let login = shadow.querySelector("#login");
        let botonRegistro = shadow.querySelector("#register-button");

        login.addEventListener("submit", function (event) {
            event.preventDefault();

            let username = shadow.querySelector("#username").value;
            let password = shadow.querySelector("#password").value;

            fetch(`http://127.0.0.1:3000/api/usuarios/${username}/${password}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`No se encontró el usuario Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    CookiesService.setCookie("accessToken", data.accessToken, 1);
                    page("/index.html");
                })
                .catch(error => {
                    alert(error);
                });
        });

        botonRegistro.addEventListener("click", function () {
            page("/registrarse");
        });
    }
}