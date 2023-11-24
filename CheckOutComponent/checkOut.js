export default class CheckOutComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#pintarBoleto(shadow);
        this.#formularioPago(shadow);
    }

    async #render(shadow) {
        await fetch("./CheckOutComponent/checkOutCinemapolis.html")
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
        const idPelicula = urlParams.get("id");
        const titulo = urlParams.get("titulo");
        const sinopsis = urlParams.get("sinopsis");
        const imagenURL = urlParams.get("imagen");
        const asientos = urlParams.get("asientos");
        let numAsientos;

        let imagen = shadow.querySelector("#imagen-pelicula");
        imagen.setAttribute("src", imagenURL);

        let campoTitulo = shadow.querySelector("#titulo");
        campoTitulo.innerHTML = titulo;

        let campoSinopsis = shadow.querySelector("#sinopsis");
        campoSinopsis.innerHTML = sinopsis;

        if (asientos.includes(",")) {
            numAsientos = asientos.split(",").length;
        } else {
            numAsientos = 1;
        }

        let totalBoletos = shadow.querySelector("#total-boletos");
        totalBoletos.innerHTML = numAsientos;

        fetch(`http://127.0.0.1:3000/api/peliculas/${idPelicula}`)
            .then(response => response.json())
            .then(data => {
                let precio = shadow.querySelector("#precio");
                precio.innerHTML = `$${data.precioBoleto * numAsientos}.00`;
            })
            .catch(error => {
                alert(error);
            });
    }

    async #formularioPago(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const asientos = urlParams.get("asientos");
        const horario = urlParams.get("horario");
        const titulo = urlParams.get("titulo");
        const sinopsis = urlParams.get("sinopsis");
        const imagenURL = urlParams.get("imagen");
        let boletos = [];
        let boletosComprados = [];
        
        let formulario = shadow.querySelector("#pago-form");
        let radios = formulario.querySelectorAll('input[name="metodo-pago"]');

        formulario.addEventListener("submit", function (event) {
            event.preventDefault();

            radios.forEach(radio => {
                if (radio.checked) {
                    let metodoPago = radio.value;
                    let fecha = new Date();
                    let partesHorario = horario.split(":");
                    fecha.setHours(partesHorario[0], 0, 0);

                    if (asientos.includes(",")) {
                        let nomAsientos = asientos.split(",");

                        nomAsientos.forEach(asiento => {
                            boletos.push({
                                idPelicula,
                                asiento,
                                horario: fecha,
                                estado: "Pagado"
                            });
                        });
                    } else {
                        boletos.push({
                            idPelicula,
                            asiento: asientos,
                            horario: fecha,
                            estado: "Pagado"
                        });
                    }

                    boletos.forEach(async boleto => {
                        await fetch(`http://127.0.0.1:3000/api/boletos`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(boleto)
                        })
                            .then(response => response.json())
                            .then(data => {
                                boletosComprados.push(data);
                            })
                            .catch(error => {
                                console.error("Error al crear boletos: ", error);
                                alert("No se pudo crear el boleto");
                            });
                    });

                    page(`/boletoComprado?titulo=${titulo}&asientos=${asientos}&imagen=${imagenURL}`);
                }
            });
        });
    }
}