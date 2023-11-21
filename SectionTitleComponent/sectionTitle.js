export default class SectionTitleComponent extends HTMLElement {

    #location = window.location.pathname;
    
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#setNombreSection(shadow);
    }

    async #render(shadow) {
        await fetch("./SectionTitleComponent/sectionTitleCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #setNombreSection(shadow) {
        let title = shadow.querySelector("#title");
        
        switch (this.#location) {
            case "/frontend/carrito.html":
                title.innerHTML = "CARRITO";
                break;
            case "/frontend/boletoComprado.html":
                title.innerHTML = "Disfrute";
                break;
            case "/frontend/checkOut.html":
                title.innerHTML = "CheckOut";
                break;
            default:
                title.innerHTML = "CARTELERA";
                break;
        }
    }
}