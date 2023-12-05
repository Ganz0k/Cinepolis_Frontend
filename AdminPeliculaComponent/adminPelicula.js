import CookiesService from "../services/cookiesService.js";

export default class AdminPeliculaComponent extends HTMLElement {

    static #base64;
    static #boletos;

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
        
        const urlParams = new URLSearchParams(window.location.search);
        const operacion = urlParams.get("operacion");
        const id = urlParams.get("id");

        if (operacion === "actualizar") {
            fetch(`http://127.0.0.1:3000/api/peliculas/${id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`No se pudo obtener la película Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    let blob = new Blob([new Uint8Array(data.imagen.data)], { type: "image/jpg" });
                    let url = URL.createObjectURL(blob);

                    AdminPeliculaComponent.#boletos = data.boletos;

                    let imagen = shadow.querySelector("img");
                    imagen.setAttribute("src", url);

                    let tituloInput = shadow.querySelector("#titulo");
                    tituloInput.value = data.nombre;

                    let sinopsisInput = shadow.querySelector("#sinopsis-text");
                    sinopsisInput.value = data.descripcion;

                    let precioInput = shadow.querySelector("#precio");
                    precioInput.value = data.precioBoleto;

                    let checkBoxes = shadow.querySelectorAll('input[name="horario"]');

                    for (let checkBox of checkBoxes) {
                        for (let horario of data.horarios) {
                            if (checkBox.value === horario) {
                                checkBox.checked = true;
                            }
                        }
                    }
                });
        }
    }

    #crearListeners(shadow) {
        let dropArea = shadow.querySelector(".drop-area");
        let fileInput = shadow.querySelector("#pelicula-imagen");
        let btnGuardar = shadow.querySelector("#btn-guardar");

        dropArea.addEventListener("dragover", (event) => this.#handleDragOver(event, dropArea));
        dropArea.addEventListener("drop", (event) => this.#handleDrop(shadow, event, dropArea));
        fileInput.addEventListener("change", (event) => this.#handleFileSelect(shadow, event));
        btnGuardar.addEventListener("click", () => this.#crearActualizarPelicula(shadow));
    }

    #handleFileSelect(shadow, event) {
        let files = event.target.files;

        this.#getBase64Content(files[files.length - 1], (base64, mimeString) => {
            let img = shadow.querySelector("img");
            let blob = this.#base64toBlob(base64, mimeString);
            let url = URL.createObjectURL(blob);
            img.setAttribute("src", url);
        });
    }

    #handleDragOver(event, dropArea) {
        event.preventDefault();

        dropArea.classList.add("drag-over");
    }

    #handleDrop(shadow, event, dropArea) {
        event.preventDefault();

        dropArea.classList.remove("drag-over");
        let files = event.dataTransfer.files;

        this.#getBase64Content(files[files.length - 1], (base64, mimeString) => {
            let img = shadow.querySelector("img");

            if (mimeString !== "image/jpeg") {
                alert("Solo se aceptan jpgs como imagen");
                return;
            }

            let blob = this.#base64toBlob(base64, mimeString);
            let url = URL.createObjectURL(blob);
            img.setAttribute("src", url);
        });
    }

    #getBase64Content(file, callback) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const base64Content = event.target.result.split(",")[1];
            AdminPeliculaComponent.#base64 = base64Content;
            const mimeString = event.target.result.split(";")[0].split(":")[1];
            callback(base64Content, mimeString);
        };
        reader.readAsDataURL(file);
    }

    #base64toBlob(base64, mimeString) {
        const byteString = atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([arrayBuffer], { type: mimeString });
    }

    #crearActualizarPelicula(shadow) {
        let autorizacion = CookiesService.getCookie("accessToken");
        const urlParams = new URLSearchParams(window.location.search);
        const operacion = urlParams.get("operacion");
        let titulo = shadow.querySelector("#titulo").value;
        let sinopsis = shadow.querySelector("#sinopsis-text").value;
        let allHorarios = shadow.querySelectorAll('input[name="horario"]');
        let precio = shadow.querySelector("#precio").value;
        let horarios = [];

        for (let horario of allHorarios) {
            if (horario.checked) {
                horarios.push(horario.value);
            }
        }
        
        if (AdminPeliculaComponent.#base64 === undefined || this.#isBlank(titulo) || this.#isBlank(sinopsis) || this.#isBlank(precio) || horarios.length == 0) {
            alert("Llene todos los campos");
            return;
        }

        const byteString = atob(AdminPeliculaComponent.#base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uintArray = new Uint8Array(arrayBuffer);

        for (let i = 0; i < byteString.length; i++) {
            uintArray[i] = byteString.charCodeAt(i);
        }
        
        let pelicula = {
            nombre: titulo.trim(),
            descripcion: sinopsis.trim(),
            precioBoleto: parseInt(precio),
            imagen: {
                "type": "Buffer",
                "data": Array.from(uintArray)
            },
            horarios: horarios
        };

        if (operacion === "crear") {
            fetch(`http://127.0.0.1:3000/api/peliculas/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${autorizacion}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pelicula)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al crear la película Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    page("/index.html");
                })
                .catch(error => {
                    alert(error);
                });
        } else {
            const id = urlParams.get("id");
            let pelicula = {
                nombre: titulo.trim(),
                descripcion: sinopsis.trim(),
                precioBoleto: parseInt(precio),
                imagen: {
                    "type": "Buffer",
                    "data": Array.from(uintArray)
                },
                horarios: horarios,
                boletos: AdminPeliculaComponent.#boletos
            }

            fetch(`http://127.0.0.1:3000/api/peliculas/${id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${autorizacion}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pelicula)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Ocurrió un error al actualizar la película Status: ${response.status}`);
                    }

                    return response.json();
                })
                .then(data => {
                    page("/index.html");
                })
                .catch(error => {
                    alert(error);
                });
        }
    }

    #isBlank(str) {
        return !str || /^\s*$/.test(str);
    }
}