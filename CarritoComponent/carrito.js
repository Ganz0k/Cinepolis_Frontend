import CookiesService from "../services/cookiesService.js";

export default class CarritoComponent extends HTMLElement {

    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        await this.#consultaBoletos(shadow);
        this.#pagarTodo(shadow);
        this.#pagarSeleccionado(shadow);
        this.#clickAPagar(shadow);
        this.#clickACancelar(shadow);
        this.#eliminarBoletos(shadow);
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

    async #consultaBoletos(shadow) {
        let div = shadow.querySelector(".boletos-box");
        let template = shadow.querySelector("#tem-boleto");
        await this.#despliegaBoletos(template, div);
    }

    async #despliegaBoletos(template, div) {
        let clone;
        let element;
        let autorizacion = CookiesService.getCookie("accessToken");
        let idCarrito;

        await fetch(`http://127.0.0.1:3000/api/clientes/`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al buscar su carrito Status: ${response.status}`);
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
        
        await fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}/boletos`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al econtrar los boletos en su carrito");
                }

                return response.json();
            })
            .then(data => {
                for (let d of data) {
                    if (d.boletos.length === 0) {
                        continue;
                    }

                    let blob = new Blob([new Uint8Array(d.imagen.data)], { type: "image/jpg" });
                    let url = URL.createObjectURL(blob);

                    clone = template.content.cloneNode(true);
                    element = clone.querySelector("img");
                    element.setAttribute("src", url);
                    element.setAttribute("alt", d.titulo);

                    element = clone.querySelector(".pelicula-details");
                    element.setAttribute("data-pelicula", d.idPelicula);
                    element.setAttribute("data-boletos", Array.from(d.boletos).map(boleto => boleto._id));

                    element = clone.querySelector("#titulo");
                    element.textContent = d.titulo;

                    element = clone.querySelector("#sinopsis");
                    element.textContent = d.sinopsis;

                    element = clone.querySelector("#total-boletos");
                    element.textContent = d.boletos.length;

                    element = clone.querySelector("#precio");
                    element.textContent = `$${d.precioBoleto * d.boletos.length}.00`;

                    div.appendChild(clone);
                }
            })
            .catch(error => {
                alert(error);
                throw error;
            });
    }

    #pagarTodo(shadow) {
        let btnPagarTodo = shadow.querySelector("#btn-pay-all");
        let dialog = shadow.querySelector("dialog");
        let form = shadow.querySelector("#pago-form");

        btnPagarTodo.addEventListener("click", function () {
            dialog.showModal();
            form.setAttribute("data-how-many", "todos");
        });
    }

    #pagarSeleccionado(shadow) {
        let btnPagarSeleccionado = shadow.querySelector("#btn-pay-selected");
        let dialog = shadow.querySelector("dialog");
        let form = shadow.querySelector("#pago-form");

        btnPagarSeleccionado.addEventListener("click", function () {
            dialog.showModal();
            form.setAttribute("data-how-many", "seleccionados");
        });
    }

    #eliminarBoletos(shadow) {
        let btnEliminar = shadow.querySelector("#btn-delete-selected");

        btnEliminar.addEventListener("click", async function () {
            if (!confirm("¿Está seguro que quiere eliminar esos boletos?")) {
                return;
            }

            let camposBoleto = shadow.querySelectorAll(".boleto");
            let peliculasDetails = [];
            let idCarrito;
            let autorizacion = CookiesService.getCookie("accessToken");
            let boletosEnCarrito;
            let idsCompletos = [];

            for (let cB of camposBoleto) {
                let input = cB.querySelector('input[type="checkbox"]');

                if (input.checked) {
                    peliculasDetails.push(cB.querySelector(".pelicula-details"));
                }
            }

            if (peliculasDetails.length === 0) {
                alert("Seleccione los boletos de una película a eliminar");
                return;
            }

            await fetch(`http://127.0.0.1:3000/api/clientes/`, {
                headers: {
                    "Authorization": `Bearer ${autorizacion}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al eliminar sus boletos Status: ${response.status}`);
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
                        throw new Error(`Ocurrió un error al eliminar sus boletos Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    boletosEnCarrito = data.boletos;
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });

            for (let pD of peliculasDetails) {
                let idPelicula = pD.getAttribute("data-pelicula");
                let idsBoletos = pD.getAttribute("data-boletos").split(",");

                for (let id of idsBoletos) {
                    let boleto;

                    await fetch(`http://127.0.0.1:3000/api/boletos/${idPelicula}/${id}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Ocurrió un error al eliminar sus boletos Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .then(data => {
                            data.estado = "Cancelado"
                            boleto = data;
                        })
                        .catch(error => {
                            alert(error);
                            throw error;
                        });
                    
                    await fetch(`http://127.0.0.1:3000/api/boletos/${idPelicula}/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(boleto)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Ocurrió un error al eliminar sus boletos Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .catch(error => {
                            alert(error);
                            throw error;
                        });
                    
                    idsCompletos.push(id);
                }
            }

            boletosEnCarrito = boletosEnCarrito.filter(item => !idsCompletos.includes(item));

            fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${autorizacion}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(boletosEnCarrito)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al eliminar sus boletos Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    page("/carrito");
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });
        });
    }

    #clickAPagar(shadow) {
        let form = shadow.querySelector("#pago-form");
        let camposBoleto = shadow.querySelectorAll(".boleto");
        let radios = form.querySelectorAll('input[name="metodo-pago"]');
        let peliculasDetails = shadow.querySelectorAll(".pelicula-details");
        let precios = shadow.querySelectorAll("#precio");
        let autorizacion = CookiesService.getCookie("accessToken");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            let metodoPago;
            let idCarrito;
            let monto = 0;
            let idsCompletos = [];
            let tipoCompra = form.getAttribute("data-how-many");
            let contadorChecks = 0;
            let boletosEnCarrito;

            if (tipoCompra === "seleccionados") {
                peliculasDetails = [];
                precios = [];

                for (let cB of camposBoleto) {
                    let input = cB.querySelector('input[type="checkbox"]');

                    if (input.checked) {
                        peliculasDetails.push(cB.querySelector(".pelicula-details"));
                        precios.push(cB.querySelector("#precio"));
                        contadorChecks++;
                    }
                }
            }

            if (peliculasDetails.length === 0) {
                alert("No ha seleccionado boletos a comprar");
                return;
            }

            await fetch(`http://127.0.0.1:3000/api/clientes/`, {
                headers: {
                    "Authorization": `Bearer ${autorizacion}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
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
                        throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    boletosEnCarrito = data.boletos;
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });

            for (let radio of radios) {
                if (radio.checked) {
                    metodoPago = radio.value;
                    break;
                }
            }

            for (let i = 0; i < peliculasDetails.length; i++) {
                let idPelicula = peliculasDetails[i].getAttribute("data-pelicula");
                let idsBoletos = peliculasDetails[i].getAttribute("data-boletos").split(",");
                let precio = precios[i].textContent.match(/\d+/)[0];

                for (let id of idsBoletos) {
                    let boleto;

                    await fetch(`http://127.0.0.1:3000/api/boletos/${idPelicula}/${id}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .then(data => {
                            data.estado = "Pagado"
                            boleto = data;
                        })
                        .catch(error => {
                            alert(error);
                            throw error;
                        });
                    
                    await fetch(`http://127.0.0.1:3000/api/boletos/${idPelicula}/${id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(boleto)
                    })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
                            }

                            return response.json();
                        })
                        .catch(error => {
                            alert(error);
                            throw error;
                        });
                    
                    idsCompletos.push(id);
                }
                
                monto += parseInt(precio);
            }

            boletosEnCarrito = boletosEnCarrito.filter(item => !idsCompletos.includes(item));

            let pago = {
                monto: monto,
                metodoPago: metodoPago,
                fechaPago: new Date(),
                boletos: idsCompletos
            };

            await fetch(`http://127.0.0.1:3000/api/pagos`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${autorizacion}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pago)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
                    }

                    return response.json();
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });
            
            fetch(`http://127.0.0.1:3000/api/carritos/${idCarrito}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${autorizacion}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(boletosEnCarrito)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al comprar sus boletos Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    page("/carrito");
                })
                .catch(error => {
                    alert(error);
                    throw error;
                });
        });
    }

    #clickACancelar(shadow) {
        let btnCancelar = shadow.querySelector("#btn-cancelar");
        let dialog = shadow.querySelector("dialog");

        btnCancelar.addEventListener("click", function () {
            dialog.classList.add("close-animate");

            setTimeout(() => {
                dialog.close();
                dialog.classList.remove("close-animate");
            }, 300);
        });
    }
}