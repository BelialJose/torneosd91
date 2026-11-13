
const API_URL = "https://script.google.com/macros/s/AKfycbxur5LE8PYJS63Wla9a2yh_9_A-d0u0bpVSmllFh89eIq3pXpO4JROS-mYbzA4h-fco/exec";

let torneos = [];
let equipos = [];
let partidos = [];
let configuracion = {};
let goleadores = [];

async function cargarDatos() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los datos");
        }

        const datos = await respuesta.json();

        torneos = datos.Torneos || [];
        equipos = datos.Equipos || [];
        partidos = datos.Partidos || [];
        configuracion = datos.Configuracion.find(
        config => config.idTorneo === "TOR001"
        ) || {};
        goleadores = datos.Goleadores || [];

        mostrarTorneos();
        mostrarEquipos();
        mostrarPosiciones();
        mostrarPartidos();
        mostrarGoleadores();

        console.log("Datos de Liga D91 cargados correctamente");
        console.log("Torneos:", torneos);
        console.log("Equipos:", equipos);
        console.log("Configuración:", datos.Configuracion);
        console.log("Partidos:", partidos);
        console.log("Configuración activa:", JSON.stringify(configuracion));
        console.log("Jornadas en curso:", configuracion.jornadasEnCurso);

    } catch (error) {
        console.error("Error al cargar los datos:", error);

        const listaTorneos = document.getElementById("listaTorneos");

        if (listaTorneos) {
            listaTorneos.innerHTML =
                '<p class="mensaje">No se pudieron cargar las competiciones.</p>';
        }
    }
}

cargarDatos();
