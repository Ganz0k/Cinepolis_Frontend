export default class CarteleraComponent extends HTMLElement {
    
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#consultaPeliculas(shadow);
    }

    async #render(shadow) {
        await fetch("./CarteleraComponent/carteleraCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #consultaPeliculas(shadow) {
        let div = shadow.querySelector(".cartelera");
        let template = shadow.querySelector("#tem-cartelera");
        this.#despliegaPeliculas(template, div);
    }

    async #despliegaPeliculas(template, div) {
        let clone;
        let element;
        
        fetch("http://127.0.0.1:3000/api/peliculas/")
            .then(response => response.json())
            .then(data => {
                data.forEach(pelicula => {
                    let blob = new Blob([new Uint8Array(pelicula.imagen.data)], { type: "image/jpg" });
                    let url = URL.createObjectURL(blob);

                    clone = template.content.cloneNode(true);
                    element = clone.querySelector("a");
                    element.setAttribute("href", `/frontend/pelicula?id=${pelicula._id}&imagen=${url}`);

                    element = clone.querySelector("img");
                    element.setAttribute("src", url);
                    element.setAttribute("alt", pelicula.nombre);

                    div.appendChild(clone);
                });
            });
    }
}