import CookiesService from "../services/cookiesService.js";

export default class SignUpComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#agregarListeners(shadow);
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

    #agregarListeners(shadow) {
        let botonInicioSesion = shadow.querySelector("#btn-login");
        let form = shadow.querySelector("#signUp");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            let username = shadow.querySelector("#username").value;
            let correo = shadow.querySelector("#correo-electronico").value;
            let password = shadow.querySelector("#password").value;
            let verifyPassword = shadow.querySelector("#verify-password").value;
            let idCarrito;

            if (password !== verifyPassword) {
                alert("La contraseña no coincide");
                return;
            }

            let cliente = {
                nombre: username,
                correoElectronico: correo,
                password
            };

            await fetch("http://127.0.0.1:3000/api/clientes/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al crear tu usuario Status: ${response.status}`);
                    }

                    return response.json()
                })
                .then(data => {
                    CookiesService.setCookie("accessToken", data.accessToken, 1);
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });
            
            await fetch("http://127.0.0.1:3000/api/carritos/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${CookiesService.getCookie("accessToken")}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al crear tu usuario Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    idCarrito = data._id;
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });
            
            cliente = {
                nombre: username,
                correoElectronico: correo,
                password,
                rol: "cliente",
                idCarrito,
                historialCompras: []
            };

            fetch("http://127.0.0.1:3000/api/clientes/", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${CookiesService.getCookie("accessToken")}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cliente)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al crear tu usuario Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    page("/index.html");
                })
                .catch(error => {
                    alert(error);
                });
        });

        botonInicioSesion.addEventListener("click", function () {
            page("/iniciarSesion");
        });
    }
}