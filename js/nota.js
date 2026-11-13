
const URL_PRENSA =
    "https://script.google.com/macros/s/AKfycbytXAEm-x7_JMeTqp44eAFivkYpM4y1KMGdwaYlPIR55h7Zd7T_Zp_KGzDt8_uydL6b/exec";

const articuloCompleto = document.getElementById("articuloCompleto");

function escaparHTML(texto) {
    return String(texto ?? "").replace(/[&<>"']/g, caracter => {
        const entidades = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entidades[caracter];
    });
}

function formatearFecha(fecha) {
    if (!fecha) return "";

    const partes = fecha.split("-");

    if (partes.length !== 3) return escaparHTML(fecha);

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

async function cargarArticulo() {
    try {
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id");

        if (!id) {
            throw new Error("No se indicó qué artículo mostrar.");
        }

        const respuesta = await fetch(URL_PRENSA);

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar las noticias.");
        }

        const articulos = await respuesta.json();
        const articulo = articulos.find(noticia => noticia.id === id);

        if (!articulo) {
            articuloCompleto.innerHTML =
                '<p class="mensaje">No encontramos esa noticia.</p>';
            return;
        }

        const imagen = articulo.portada
            ? `<img class="portadaArticulo"
                    src="${escaparHTML(articulo.portada)}"
                    alt="${escaparHTML(articulo.titulo)}">`
            : "";

        articuloCompleto.innerHTML = `
            <article class="notaEditorial">
                <a class="enlaceNoticia" href="prensa.html">
                    ← VOLVER A PRENSA
                </a>

                <p class="fechaNoticia">
                    ${formatearFecha(articulo.fecha)}
                </p>

                <h1>${escaparHTML(articulo.titulo)}</h1>

                <p class="autorNoticia">
                    Por ${escaparHTML(articulo.autor || "Prensa D91")}
                </p>

                ${imagen}

                ${articulo.contenido
                ? `<div class="textoArticulo">${escaparHTML(articulo.contenido)}</div>`
                : ""}
            </article>
        `;
    } catch (error) {
        console.error("Error al cargar el artículo:", error);

        articuloCompleto.innerHTML =
            '<p class="mensaje">No pudimos cargar la noticia. Volvé a intentarlo más tarde.</p>';
    }
}

cargarArticulo();
