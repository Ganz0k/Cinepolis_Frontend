import CookiesService from "../services/cookiesService.js";

export default class HeaderComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#agregarListenerLogo(shadow);
        this.#pintarHeader(shadow);
    }

    async #render(shadow) {
        await fetch("./HeaderComponent/headerCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #pintarHeader(shadow) {
        let autorizacion = CookiesService.getCookie("accessToken");
        
        if (autorizacion !== null) {
            const tokenParts = autorizacion.split(".");
            const decodedPayload = JSON.parse(atob(tokenParts[1]));
            const rol = decodedPayload.rol;

            switch (rol) {
                case "administrador":
                    fetch(`http://127.0.0.1:3000/api/administradores/`, {
                        headers: {
                            "Authorization": `Bearer ${autorizacion}`
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error al buscar el usuario Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .then(data => {
                            this.#admin(shadow, data.nombre);
                        })
                        .catch(error => {
                            alert(error);
                            this.#defaultView(shadow);
                        });
                    
                    break;
                case "cliente":
                    fetch(`http://127.0.0.1:3000/api/clientes`, {
                        headers: {
                            "Authorization": `Bearer ${autorizacion}`
                        }
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error al buscar el usuario Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .then(data => {
                            this.#cliente(shadow, data.nombre, autorizacion, data.idCarrito);
                        })
                        .catch(error => {
                            alert(error);
                            this.#defaultView(shadow);
                        });
                    
                    break;
            }

            return;
        }

        this.#defaultView(shadow);
    }

    #defaultView(shadow) {
        let rightHeader = shadow.querySelector(".right-header");
        let btnLogin = document.createElement("button");
        btnLogin.setAttribute("id", "btn-login");
        btnLogin.innerHTML = "INICIAR SESIÓN";

        btnLogin.addEventListener("click", function () {
            page("/iniciarSesion");
        });

        rightHeader.appendChild(btnLogin);
    }

    #cliente(shadow, nombre, autorizacion, idCarrito) {
        let rightHeader = shadow.querySelector(".right-header");
        let userName = shadow.querySelector(".user-name");

        userName.innerHTML = nombre;
        
        let imgCarrito = document.createElement("img");
        imgCarrito.setAttribute("src", "./images/carrito.png");
        imgCarrito.setAttribute("alt", "logo");
        rightHeader.appendChild(imgCarrito);

        let montoCarrito = document.createElement("span");
        montoCarrito.setAttribute("id", "monto-carrito");

        fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}/total`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al buscar su carrito Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                montoCarrito.innerHTML = `$${data.total}.00`
            })
            .catch(error => {
                alert(error);
            });

        rightHeader.appendChild(montoCarrito);
    }

    #admin(shadow, nombre) {
        let userName = shadow.querySelector(".user-name");

        userName.innerHTML = nombre;
    }

    #agregarListenerLogo(shadow) {
        let imagen = shadow.querySelector("img");
        let texto = shadow.querySelector("#logo-text");

        imagen.addEventListener("click", function () {
            page("/index.html");
        });

        texto.addEventListener("click", function () {
            page("/index.html"); 
        });
    }
}