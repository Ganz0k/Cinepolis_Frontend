import CookiesService from "../services/cookiesService.js";

export default class CarteleraComponent extends HTMLElement {
    
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({ mode: "open" });
        await this.#render(shadow);
        this.#consultaPeliculas(shadow);
        this.#agregarListeners(shadow);
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

    async #consultaPeliculas(shadow) {
        let div = shadow.querySelector(".cartelera");
        let autorizacion = CookiesService.getCookie("accessToken");
        let template = shadow.querySelector("#tem-cartelera");
        
        if (autorizacion !== null) {
            let tokenParts = autorizacion.split(".");
            let payload = JSON.parse(atob(tokenParts[1]));

            if (payload.rol === "administrador") {
                fetch(`http://127.0.0.1:3000/api/administradores`, {
                    headers: {
                        "Authorization": `Bearer ${autorizacion}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error();
                        }

                        return response.json();
                    })
                    .then(data => {
                        template = shadow.querySelector("#tem-admin");
                        this.#despliegaMenuAdmin(shadow, template, div);
                    });
            } else {
                this.#despliegaPeliculas(template, div);
            }
        } else {
            this.#despliegaPeliculas(template, div);
        }
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
                    element.setAttribute("href", `/pelicula?id=${pelicula._id}&imagen=${url}`);

                    element = clone.querySelector("img");
                    element.setAttribute("src", url);
                    element.setAttribute("alt", pelicula.nombre);

                    div.appendChild(clone);
                });
            })
            .catch(error => {
                alert(error);
            });
    }

    #despliegaMenuAdmin(shadow, template, div) {
        let clone;
        let element;

        fetch("http://127.0.0.1:3000/api/peliculas")
            .then(response => response.json())
            .then(data => {
                data.forEach(pelicula => {
                    let blob = new Blob([new Uint8Array(pelicula.imagen.data)], { type: "image/jpg" });
                    let url = URL.createObjectURL(blob);

                    clone = template.content.cloneNode(true);
                    element = clone.querySelector("img");
                    element.setAttribute("src", url);
                    element.setAttribute("alt", pelicula.nombre);

                    element = clone.querySelector("input");
                    element.setAttribute("value", pelicula._id);
                    
                    div.appendChild(clone);
                });
            })
            .catch(error => {
                alert(error);
            });

        let opciones = shadow.querySelector(".opciones");
        opciones.style.display = "block";
    }

    #agregarListeners(shadow) {
        let btnAnadir = shadow.querySelector("#btn-aniadir");
        let btnActualizar = shadow.querySelector("#btn-actualizar");
        let btnEliminar = shadow.querySelector("#btn-eliminar");

        btnAnadir.addEventListener("click", () => this.#anadirPelicula());
        btnActualizar.addEventListener("click", () => this.#actualizarPelicula(shadow));
        btnEliminar.addEventListener("click", () => this.#eliminarPelicula(shadow));
    }

    async #anadirPelicula() {
        let autorizacion = CookiesService.getCookie("accessToken");
        let tienePermiso = false;

        await fetch(`http://127.0.0.1:3000/api/administradores/`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Hubo un problema al verificar sus permisos Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                for (let permiso of data.permisos) {
                    if (permiso === "Crear películas") {
                        tienePermiso = true;
                    }
                }
            })
            .catch(error => {
                alert(error);
                throw error;
            });
        
        if (!tienePermiso) {
            alert("No tienes permisos para crear películas");
            return;
        }

        page('/adminPelicula?operacion=crear');
    }

    async #actualizarPelicula(shadow) {
        let radios = shadow.querySelectorAll('input[name="pelicula"]');
        let idPelicula;
        let seleccionados = 0;
        let autorizacion = CookiesService.getCookie("accessToken");
        let tienePermiso = false;

        await fetch(`http://127.0.0.1:3000/api/administradores/`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Hubo un problema al verificar sus permisos Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                for (let permiso of data.permisos) {
                    if (permiso === "Actualizar películas") {
                        tienePermiso = true;
                    }
                }
            })
            .catch(error => {
                alert(error);
                throw error;
            });
        
        if (!tienePermiso) {
            alert("No tienes permisos para crear películas");
            return;
        }

        for (let radio of radios) {
            if (radio.checked) {
                seleccionados++;
                idPelicula = radio.value;
                page(`/adminPelicula?operacion=actualizar&id=${idPelicula}`);
            }
        }

        if (seleccionados == 0) {
            alert("Seleccione una película para poder actualizarla");
            return;
        }
    }

    async #eliminarPelicula(shadow) {
        let radios = shadow.querySelectorAll('input[name="pelicula"]');
        let idPelicula;
        let seleccionados = 0;
        let autorizacion = CookiesService.getCookie("accessToken");
        let tienePermiso = false;

        for (let radio of radios) {
            if (radio.checked) {
                seleccionados++;
                idPelicula = radio.value;
            }
        }

        if (seleccionados == 0) {
            alert("Seleccione una película para poder eliminarla");
            return;
        }

        await fetch(`http://127.0.0.1:3000/api/administradores/`, {
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Hubo un problema al verificar sus permisos Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                for (let permiso of data.permisos) {
                    if (permiso === "Eliminar películas") {
                        tienePermiso = true;
                    }
                }
            })
            .catch(error => {
                alert(error);
                throw error;
            });
        
        if (!tienePermiso) {
            alert("No tienes permisos para eliminar películas");
            return;
        }

        if (!confirm("¿Estás seguro de que quieres eliminar esa película?")) {
            return;
        }

        fetch(`http://127.0.0.1:3000/api/peliculas/${idPelicula}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${autorizacion}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo eliminar la película Status: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                alert(data.message);
                page("/index.html");
            });
    }
}