export default class CarritoComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#consultaBoletos(shadow);
    }

    async #render(shadow) {
        await fetch("./CarritoComponent/carritoCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #consultaBoletos(shadow) {
        let div = shadow.querySelector(".boletos-box");
        let template = shadow.querySelector("#tem-boleto");
        this.#despliegaBoletos(template, div);
    }

    #despliegaBoletos(template, div) {
        let clone;
        let element;

        for (let i = 0; i < 2; i++) {
            switch (i) {
                case 0:
                    clone = template.content.cloneNode(true);
                    element = clone.querySelector("#imagen-pelicula");
                    element.setAttribute("src", "./images/shin_godzilla.jpg");
                    element.setAttribute("alt", "pelicula");

                    element = clone.querySelector("#titulo");
                    element.innerHTML = "Shin Godzilla";

                    element = clone.querySelector("#sinopsis");
                    element.innerHTML = "Un monstruo misterioso emerge de la bahía de Tokio y causa estragos en Japón.";

                    element = clone.querySelector("#total-boletos");
                    element.innerHTML = 2;

                    element = clone.querySelector("#precio");
                    element.innerHTML = "$134.00";

                    div.appendChild(clone);
                    break;
                case 1:
                    clone = template.content.cloneNode(true);
                    element = clone.querySelector("#imagen-pelicula");
                    element.setAttribute("src", "./images/across_the_spiderverse.jpg");
                    element.setAttribute("alt", "pelicula");

                    element = clone.querySelector("#titulo");
                    element.innerHTML = "Spider-Man: Across the Spider-Verse";

                    element = clone.querySelector("#sinopsis");
                    element.innerHTML = "Después de reunirse con Gwen Stacy, el amigable vecino de tiempo completo de Brooklyn Spiderman, es lanzado a través del multiverso, donde se encuentra a un equipo de gente araña encomendada con proteger su mera existencia.";

                    element = clone.querySelector("#total-boletos");
                    element.innerHTML = 1;

                    element = clone.querySelector("#precio");
                    element.innerHTML = "$67.00";

                    div.appendChild(clone);
                    break;
            }
            
        }
    }
}