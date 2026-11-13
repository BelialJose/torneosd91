
const URL_PRENSA =
    "https://script.google.com/macros/s/AKfycbytXAEm-x7_JMeTqp44eAFivkYpM4y1KMGdwaYlPIR55h7Zd7T_Zp_KGzDt8_uydL6b/exec";

const listaNoticias = document.getElementById("listaNoticias");

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

function mostrarFecha(fecha) {
    if (!fecha) return "";

    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return escaparHTML(fecha);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}



function mostrarNoticias(articulos) {
    if (!articulos.length) {
        listaNoticias.innerHTML =
            '<p class="mensaje">Todavía no hay publicaciones.</p>';
        return;
    }

    const publicacionesOrdenadas = [...articulos].sort((a, b) =>
        String(b.fecha || "").localeCompare(String(a.fecha || ""))
    );

    listaNoticias.innerHTML = publicacionesOrdenadas.map(articulo => {
        const imagen = articulo.portada
            ? `<img class="portadaNoticia"
                    src="${escaparHTML(articulo.portada)}"
                    alt="${escaparHTML(articulo.titulo)}">`
            : "";

        return `
            <article class="articuloPrensa">
                <a class="enlacePortada"
                href="nota.html?id=${encodeURIComponent(articulo.id)}">

                    ${imagen}

                    <div class="cuerpoNoticia">
                        <p class="fechaNoticia">
                            ${escaparHTML(mostrarFecha(articulo.fecha))}
                        </p>

                        <h2>${escaparHTML(articulo.titulo)}</h2>
                    </div>
                </a>
            </article>
        `;
    }).join("");
}



async function cargarNoticias() {
    try {
        const respuesta = await fetch(URL_PRENSA);

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar las noticias.");
        }

        const articulos = await respuesta.json();
        mostrarNoticias(articulos);

    } catch (error) {
        console.error("Error al cargar la prensa:", error);

        listaNoticias.innerHTML =
            '<p class="mensaje">No pudimos cargar las noticias. Intentá nuevamente más tarde.</p>';
    }
}

cargarNoticias();

// Actualiza las noticias cada 60 segundos.
setInterval(cargarNoticias, 60000);
