export default class PeliculaComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#mostrarPelicula(shadow);
        this.#agregarListeners(shadow);
    }

    async #render(shadow) {
        await fetch("./PeliculaComponent/peliculaCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #mostrarPelicula(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const imagenURL = urlParams.get("imagen");

        fetch(`http://127.0.0.1:3000/api/peliculas/${idPelicula}`)
            .then(response => response.json())
            .then(data => {
                let imagen = shadow.querySelector("img");
                imagen.setAttribute("src", imagenURL);
                imagen.setAttribute("alt", data.nombre);

                let titulo = shadow.querySelector("#titulo");
                titulo.innerHTML = data.nombre;

                let sinopsis = shadow.querySelector("#sinopsis-text");
                sinopsis.innerHTML = data.descripcion;

                let celdas = shadow.querySelectorAll("td");

                for (let i = 0; i < data.horarios.length; i++) {
                    celdas[i].innerHTML = `<input type="radio" name="horario" value="${data.horarios[i]}"> ${data.horarios[i]}`;
                }
            });
    }

    #agregarListeners(shadow) {
        let btnAsientos = shadow.querySelector("#btn-escoger-asiento");
        let btnMas = shadow.querySelector("#btn-mas");
        let btnMenos = shadow.querySelector("#btn-menos");
        let cantidad = shadow.querySelector("#cantidad");
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const imagenURL = urlParams.get("imagen");

        btnAsientos.addEventListener("click", function () {
            let tituloField = shadow.querySelector("#titulo");
            let titulo = tituloField.innerHTML;
            let sinopsisField = shadow.querySelector("#sinopsis-text");
            let sinopsis = sinopsisField.innerHTML;
            let tabla = shadow.querySelector("table");
            let radios = tabla.querySelectorAll('input[name="horario"]');
            let radioSeleccionado;

            radios.forEach(radio => {
                if (radio.checked) {
                    radioSeleccionado = radio.value;
                    page(`/asientos?id=${idPelicula}&imagen=${imagenURL}&titulo=${titulo}&sinopsis=${sinopsis}&horario=${radioSeleccionado}&numBoletos=${cantidad.innerHTML}`);
                }
            });
        });

        btnMas.addEventListener("click", function () {
            let n = parseInt(cantidad.innerHTML);
            n++;
            cantidad.innerHTML = n;
        });

        btnMenos.addEventListener("click", function () {
            let n = parseInt(cantidad.innerHTML);
            
            if (n !== 1) {
                n--;
                cantidad.innerHTML = n;
            }
        });
    }
}