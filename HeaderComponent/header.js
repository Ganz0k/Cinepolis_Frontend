export default class HeaderComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        const location = window.location.pathname;
        this.#agregarListenerLogo(shadow);

        switch (location) {
            case "/frontend/cliente.html":
                this.#cliente(shadow);
                break;
            case "/frontend/carrito.html":
                this.#carrito(shadow);
                break;
            case "/frontend/admin.html":
                this.#admin(shadow);
                break;
            case "/frontend/adminPelicula.html":
                this.#admin(shadow);
                break;
            case "/frontend/iniciarSesion":
                break;
            case "/frontend/registrarse":
                break;
            default:
                this.#default(shadow);
                break;
        }
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

    #default(shadow) {
        let rightHeader = shadow.querySelector(".right-header");
        let btnLogin = document.createElement("button");
        btnLogin.setAttribute("id", "btn-login");
        btnLogin.innerHTML = "INICIAR SESIÓN";

        btnLogin.addEventListener("click", function () {
            page("/frontend/iniciarSesion");
        });

        rightHeader.appendChild(btnLogin);
    }

    #cliente(shadow) {
        let rightHeader = shadow.querySelector(".right-header");
        let userName = shadow.querySelector(".user-name");

        userName.innerHTML = "Luis Gonzalo Cervantes Rivera";
        
        let imgCarrito = document.createElement("img");
        imgCarrito.setAttribute("src", "./images/carrito.png");
        imgCarrito.setAttribute("alt", "logo");
        rightHeader.appendChild(imgCarrito);

        let montoCarrito = document.createElement("span");
        montoCarrito.setAttribute("id", "monto-carrito");
        montoCarrito.innerHTML = "$0.00";

        rightHeader.appendChild(montoCarrito);
    }

    #carrito(shadow) {
        let rightHeader = shadow.querySelector(".right-header");
        let userName = shadow.querySelector(".user-name");

        userName.innerHTML = "Luis Gonzalo Cervantes Rivera";
        
        let imgCarrito = document.createElement("img");
        imgCarrito.setAttribute("src", "./images/carrito.png");
        imgCarrito.setAttribute("alt", "logo");
        rightHeader.appendChild(imgCarrito);

        let montoCarrito = document.createElement("span");
        montoCarrito.setAttribute("id", "monto-carrito");
        montoCarrito.innerHTML = "$201.00";

        rightHeader.appendChild(montoCarrito);
    }

    #admin(shadow) {
        let userName = shadow.querySelector(".user-name");

        userName.innerHTML = "Admin1";
    }

    #agregarListenerLogo(shadow) {
        let imagen = shadow.querySelector("img");
        let texto = shadow.querySelector("#logo-text");

        imagen.addEventListener("click", function () {
            page("/frontend/");
        });

        texto.addEventListener("click", function () {
           page("/frontend/"); 
        });
    }
}