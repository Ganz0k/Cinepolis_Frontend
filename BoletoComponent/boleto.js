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
        let div = shadow.querySelector(".boleto-container");
        console.log(div);
        let template = shadow.querySelector("#boletos");
        console.log(template);
        const urlParams = new URLSearchParams(window.location.search);
        const boletosComprados = JSON.parse(urlParams.get("boletos"));
        let numAsientos;
        let clone;
        let element;

        for (let boleto of boletosComprados) {
            clone = template.content.cloneNode(true);
            element = clone.querySelector(".boleto-header img");
            element.setAttribute("src", boleto.imagen);

            element = clone.querySelector("#titulo");
            element.textContent = boleto.titulo;

            element = clone.querySelector(".total-boletos span");
            element.textContent = `x${boleto.asientos.length}`;

            element = clone.querySelector("#asientos");
            element.textContent = boleto.asientos;

            div.appendChild(clone);
        }
    }
}