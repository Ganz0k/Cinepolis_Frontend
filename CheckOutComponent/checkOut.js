import CookiesService from "../services/cookiesService.js";

export default class CheckOutComponent extends HTMLElement {
    
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        await this.#pintarBoletos(shadow);
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

    async #pintarBoletos(shadow) {
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

        formulario.addEventListener("submit", async function (event) {
            event.preventDefault();

            for (let radio of radios) {
                if (radio.checked) {
                    let metodoPago = radio.value;
                    let fecha = new Date();
                    let partesHorario = horario.split(":");
                    fecha.setHours(partesHorario[0], 0, 0);
                    let autorizacion = CookiesService.getCookie("accessToken");

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

                    for (let boleto of boletos) {
                        await fetch(`http://127.0.0.1:3000/api/boletos/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(boleto)
                        })
                            .then(response => response.json())
                            .then(data => {
                                boletosComprados.push(data._id);
                            })
                            .catch(error => {
                                console.error("Error al crear boletos: ", error);
                                alert("No se pudo crear el boleto");
                            });
                    }

                    if (autorizacion !== null) {
                        let precio = shadow.querySelector("#precio").textContent;
                        let precioBoletos = precio.match(/\d+/)[0];

                        let pago = {
                            monto: parseInt(precioBoletos),
                            metodoPago: metodoPago,
                            fechaPago: new Date(),
                            boletos: boletosComprados
                        };

                        console.log(pago);

                        await fetch(`http://127.0.0.1:3000/api/pagos/`, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${autorizacion}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(pago)
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`Ocurrió un error al pagar sus boletos Status: ${response.status}`);
                                }

                                return response.json();
                            })
                            .then(data => {
                                alert(`Su pago de $${data.monto}.00 se ha realizado correctamente`);
                            })
                            .catch(error => {
                                alert(error);
                                throw error;
                            });
                    }

                    boletosComprados = [{
                        titulo: titulo,
                        asientos: asientos.split(","), 
                        imagen: imagenURL
                    }];

                    page(`/boletoComprado?boletos=${JSON.stringify(boletosComprados)}`);
                }
            }
        });
    }
}