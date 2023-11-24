export default class AsientoComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#pintarAsientos(shadow);
        this.#seleccionarAsiento(shadow);
        this.#comprarBoleto(shadow);
    }

    async #render(shadow) {
        await fetch("./AsientoComponent/asientoCinemapolis.html")
            .then(response => response.text())
            .then(html => {
                shadow.innerHTML += html;
            })
            .catch(error => {
                console.error("Error loading HTML: " + error);
            });
    }

    #pintarAsientos(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const imagenURL = urlParams.get("imagen");
        const nombrePelicula = urlParams.get("titulo");
        let horario = urlParams.get("horario");
        
        let imagen = shadow.querySelector("img");
        imagen.setAttribute("src", imagenURL);
        imagen.setAttribute("alt", nombrePelicula);

        let titulo = shadow.querySelector("#titulo");
        titulo.innerHTML = nombrePelicula;

        fetch(`http://127.0.0.1:3000/api/boletos/${idPelicula}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(boleto => {
                    let timestamp = Date.parse(boleto.horario);
                    let fecha = new Date(timestamp);

                    if (parseInt(horario.split(":")[0]) === fecha.getHours()) {
                        let asientoOcupado = shadow.querySelector(`[data-seat="${boleto.asiento}"]`);
                        asientoOcupado.setAttribute("class", "seat-occupied");
                    }
                });
            })
            .catch(error => {
                alert(error);
            });
    }

    #seleccionarAsiento(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const numBoletos = urlParams.get("numBoletos");
        let asientos = shadow.querySelectorAll(".seat");

        asientos.forEach(a => {
            a.addEventListener("click", () => {
                let seleccionados = shadow.querySelectorAll(".seat-selected");
                let numSeleccionados;

                if (seleccionados === null) {
                    numSeleccionados = 0;
                } else {
                    numSeleccionados = seleccionados.length;
                }
                
                if ((a.getAttribute("class") === "seat") && (numSeleccionados < parseInt(numBoletos))) {
                    a.setAttribute("class", "seat-selected");
                } else if (a.getAttribute("class") === "seat-selected") {
                    a.setAttribute("class", "seat");
                }
            });
        });
    }

    #comprarBoleto(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const titulo = urlParams.get("titulo");
        const sinopsis = urlParams.get("sinopsis");
        const numBoletos = urlParams.get("numBoletos");
        const imagenURL = urlParams.get("imagen");
        const horario = urlParams.get("horario");
        let btnComprar = shadow.querySelector("#btn-comprar");

        btnComprar.addEventListener("click", function () {
            let asientosSeleccionados = Array.from(shadow.querySelectorAll(".seat-selected")).map(seat => seat.getAttribute("data-seat"));

            if (asientosSeleccionados !== null && asientosSeleccionados.length === parseInt(numBoletos)) {
                page(`/checkOut?id=${idPelicula}&titulo=${titulo}&sinopsis=${sinopsis}&asientos=${asientosSeleccionados}&imagen=${imagenURL}&horario=${horario}`);
            }
        });
    }
}