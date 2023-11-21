export default class AdminPeliculaComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#crearListeners(shadow);
    }

    async #render(shadow) {
        await fetch("./AdminPeliculaComponent/adminPeliculaCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #crearListeners(shadow) {
        let inputFile = shadow.querySelector("#pelicula-imagen");
        
        inputFile.addEventListener("change", (e) => {
            let imagen = e.target.files[0];
            console.log(imagen);
            let imagenField = shadow.querySelector("#imagen");
            imagenField.setAttribute("src", imagen.name);
        });
    }
}