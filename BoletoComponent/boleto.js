export default class BoletoComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#pintarBoleto(shadow);
    }

    async #render(shadow) {
        await fetch("./BoletoComponent/boletoCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #pintarBoleto(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const titulo = urlParams.get("titulo");
        const asientos = urlParams.get("asientos");
        const imagenURL = urlParams.get("imagen");
        let numAsientos;

        if (asientos.includes(",")) {
            numAsientos = asientos.split(",").length;
        } else {
            numAsientos = 1;
        }

        let imagenPelicula = shadow.querySelector(".boleto-header img");
        imagenPelicula.setAttribute("src", imagenURL);

        let campoTitulo = shadow.querySelector("#titulo");
        campoTitulo.innerHTML = titulo;

        let campoNumBoletos = shadow.querySelector(".total-boletos span");
        campoNumBoletos.innerHTML = `x${numAsientos}`;

        let campoAsientos = shadow.querySelector("#asientos");
        campoAsientos.innerHTML = asientos;
    }
}