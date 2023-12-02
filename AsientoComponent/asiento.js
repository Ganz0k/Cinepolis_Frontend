import CookiesService from "../services/cookiesService.js";

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
        this.#toCarrito(shadow);
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
                    let fechaActual = new Date();
                    fechaActual.setHours(parseInt(horario.split(":")), 0, 0, fecha.getMilliseconds());
                    
                    if (fecha.getTime() === fechaActual.getTime() && (boleto.estado === "Pendiente" || boleto.estado === "Pagado")) {
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

    #toCarrito(shadow) {
        const urlParams = new URLSearchParams(window.location.search);
        const idPelicula = urlParams.get("id");
        const titulo = urlParams.get("titulo");
        const sinopsis = urlParams.get("sinopsis");
        const numBoletos = urlParams.get("numBoletos");
        const imagenURL = urlParams.get("imagen");
        const horario = urlParams.get("horario");
        let btnToCarrito = shadow.querySelector("#btn-anadir-carrito");
        const autorizacion = CookiesService.getCookie("accessToken");
        const tokenParts = autorizacion.split(".");
        const decodedPayload = JSON.parse(atob(tokenParts[1]));
        
        if (autorizacion === null) {
            alert("Inicie sesión para poder usar el carrito de compras");
            return;
        }

        btnToCarrito.addEventListener("click", async function () {
            let asientosSeleccionados = Array.from(shadow.querySelectorAll(".seat-selected")).map(seat => seat.getAttribute("data-seat"));
            
            if (asientosSeleccionados !== null && asientosSeleccionados.length === parseInt(numBoletos)) {
                let idCarrito;
                let boletos = [];
                let idsBoleto = [];
                let fecha = new Date();
                let partesHorario = horario.split(":");
                fecha.setHours(partesHorario[0], 0, 0);

                asientosSeleccionados.forEach(asiento => {
                    boletos.push({
                        idPelicula,
                        idUsuario: decodedPayload.idUsuario,
                        asiento,
                        horario: fecha,
                        estado: "Pendiente"
                    });
                });

                await fetch(`http://127.0.0.1:3000/api/clientes/`, {
                    headers: {
                        "Authorization": `Bearer ${autorizacion}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Ocurrió un error al buscar su carrito Status: ${response.ok}`);
                        }

                        return response.json();
                    })
                    .then(data => {
                        idCarrito = data.idCarrito;
                    })
                    .catch(error => {
                        alert(error);
                        throw error;
                    });
                
                await fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}`, {
                    headers: {
                        "Authorization": `Bearer ${autorizacion}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Ocurrió un error con su carrito Status: ${response.status}`);
                        }

                        return response.json();
                    })
                    .then(data => {
                        console.log(data);
                        if (data.boletos.length > 0) {
                            data.boletos.forEach(boleto => {
                                idsBoleto.push(boleto);
                            });
                        }
                    });

                for (let boleto of boletos) {
                    await fetch(`http://127.0.0.1:3000/api/boletos/`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(boleto)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Error al crear el boleto Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .then(data => {
                            idsBoleto.push(data._id);
                        })
                        .catch(error => {
                            alert(error);
                            throw error;
                        });
                }

                fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${autorizacion}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(idsBoleto)
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error al añadir los boletos al carrito Status: ${response.status}`);
                        }

                        return response.json();
                    })
                    .then(data => {
                        page("/carrito");
                    })
                    .catch(error => {
                        alert(error);
                    });

                return;
            }

            alert("Seleccione todos los asientos que quiere");
        });
    }
}