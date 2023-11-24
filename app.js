import HeaderComponent from "./HeaderComponent/header.js";
import CarteleraComponent from "./CarteleraComponent/cartelera.js";
import FooterComponent from "./FooterComponent/footer.js";
import LoginComponent from "./LoginComponent/login.js";
import SignUpComponent from "./SignUpComponent/signUp.js";
import SectionTitleComponent from "./SectionTitleComponent/sectionTitle.js";
import CarritoComponent from "./CarritoComponent/carrito.js";
import PeliculaComponent from "./PeliculaComponent/pelicula.js";
import AsientoComponent from "./AsientoComponent/asiento.js";
import AdminPeliculaComponent from "./AdminPeliculaComponent/adminPelicula.js";
import BoletoComponent from "./BoletoComponent/boleto.js";
import CheckOutComponent from "./CheckOutComponent/checkOut.js";
import AdminMenuComponent from "./AdminMenuComponent/adminMenu.js";

document.addEventListener("DOMContentLoaded", function () {
    page("/index.html", () => showCartelera());
    page("/iniciarSesion", () => showLogin());
    page("/registrarse", () => showSignUp());
    page("/pelicula", () => showPelicula());
    page("/asientos", () => showAsientos());
    page("/checkOut", () => showCheckOut());
    page("/boletoComprado", () => showBoletoComprado());

    page();
});

function showCartelera() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>
        
        <section-title></section-title>
        <cartelera-info></cartelera-info>

        <footer-info></footer-info>
    `;
}

function showPelicula() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>
        
        <pelicula-details></pelicula-details>

        <footer-info></footer-info>
    `;
}

function showLogin() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>
        
        <login-form></login-form>

        <footer-info></footer-info>
    `;
}

function showSignUp() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>

        <sign-up-form></sign-up-form>
        
        <footer-info></footer-info>
    `;
}

function showAsientos() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>

        <asientos-info></asientos-info>

        <footer-info></footer-info>
    `;
}

function showCheckOut() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>
        
        <section-title></section-title>
        <check-out></check-out>

        <footer-info></footer-info>
    `;
}

function showBoletoComprado() {
    const body = document.querySelector("body");

    body.innerHTML = `
        <header-info></header-info>
        <section-title></section-title>

        <boleto-info></boleto-info>

        <footer-info></footer-info>
    `;
}

window.customElements.define("header-info", HeaderComponent);
window.customElements.define("footer-info", FooterComponent);
window.customElements.define("login-form", LoginComponent);
window.customElements.define("sign-up-form", SignUpComponent);
window.customElements.define("section-title", SectionTitleComponent);
window.customElements.define("carrito-list", CarritoComponent);
window.customElements.define("pelicula-details", PeliculaComponent);
window.customElements.define("asientos-info", AsientoComponent);
window.customElements.define("administrar-pelicula", AdminPeliculaComponent);
window.customElements.define("cartelera-info", CarteleraComponent);
window.customElements.define("boleto-info", BoletoComponent);
window.customElements.define("check-out", CheckOutComponent);
window.customElements.define("admin-menu", AdminMenuComponent);