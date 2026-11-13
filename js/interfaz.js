const listaTorneos = document.getElementById("listaTorneos");

function mostrarTorneos() {
    if (!listaTorneos || typeof torneos === "undefined") {
        return;
    }

    listaTorneos.innerHTML = torneos.map(torneo => `
        <article class="tarjeta">
            <h3>${torneo.nombre}</h3>
            <p>Juego: ${torneo.juego}</p>
            <p>Formato: ${torneo.formato}</p>
        </article>
    `).join("");
}

mostrarTorneos();


function mostrarEquipos() {
    const grupoA = document.getElementById("grupoA");
    const grupoB = document.getElementById("grupoB");

    if (!grupoA || !grupoB || typeof equipos === "undefined") return;

    const equiposActivos = equipos.filter(equipo =>
        String(equipo.activo).toLowerCase() === "si"
    );

    function crearTarjetas(lista) {
        return lista.map(equipo => `
            <article class="tarjetaEquipo">
                <img src="${equipo.escudo}" alt="Escudo de ${equipo.nombre}">
                <h4>${equipo.nombre}</h4>
                <p>${equipo.participante}</p>
            </article>
        `).join("");
    }

    grupoA.innerHTML = crearTarjetas(
        equiposActivos.filter(equipo => equipo.grupo === "A")
    );

    grupoB.innerHTML = crearTarjetas(
        equiposActivos.filter(equipo => equipo.grupo === "B")
    );
}


function mostrarPosiciones() {
    const tablaGrupoA = document.getElementById("tablaGrupoA");
    const tablaGrupoB = document.getElementById("tablaGrupoB");

    if (!tablaGrupoA || !tablaGrupoB) return;

    function crearTabla(grupo) {
        const equiposGrupo = equipos.filter(equipo =>
            equipo.grupo === grupo &&
            String(equipo.activo).toLowerCase() === "si"
        );

        const partidosGrupo = partidos.filter(partido =>
            partido.grupo === grupo &&
            partido.fase === "Grupos"
        );

        const posiciones = calcularPosiciones(
            equiposGrupo,
            partidosGrupo,
            configuracion
        );

        return `
            <div class="tablaScroll">
                <table class="tablaPosiciones">
                    <thead>
                        <tr>
                            <th>POS</th>
                            <th>EQUIPO</th>
                            <th>PJ</th>
                            <th>PG</th>
                            <th>PE</th>
                            <th>PP</th>
                            <th>GF</th>
                            <th>GC</th>
                            <th>DG</th>
                            <th>PTS</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${posiciones.map((equipo, indice) => `
                            <tr>
                                <td>${indice + 1}</td>
                                <td class="equipoTabla">
                                <img src="${equipo.escudo}" alt="Escudo de ${equipo.nombre}">
                                <span>${equipo.participante}</span>
                                </td>
                                <td>${equipo.PJ}</td>
                                <td>${equipo.PG}</td>
                                <td>${equipo.PE}</td>
                                <td>${equipo.PP}</td>
                                <td>${equipo.GF}</td>
                                <td>${equipo.GC}</td>
                                <td>${equipo.DG}</td>
                                <td>${equipo.PTS}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    tablaGrupoA.innerHTML = crearTabla("A");
    tablaGrupoB.innerHTML = crearTabla("B");
}

function mostrarPartidos() {
    const listaPartidos = document.getElementById("listaPartidos");
    const jornadasEnCurso = String(configuracion.jornadasEnCurso || "")
    .split(/[,.]/)
    .map(jornada => Number(jornada.trim()))
    .filter(jornada => Number.isInteger(jornada) && jornada > 0);

    if (!listaPartidos) return;

    const partidosGrupos = partidos.filter(partido =>
        partido.fase === "Grupos"
    );

    const buscarEquipo = id =>
        equipos.find(equipo => equipo.idEquipo === id);

    const jornadas = [...new Set(
        partidosGrupos.map(partido => Number(partido.jornada))
    )].sort((a, b) => a - b);

    listaPartidos.innerHTML = jornadas.map(jornada => {

        const partidosJornada = partidosGrupos.filter(partido =>
            Number(partido.jornada) === jornada
        );

        const estaEnCurso = jornadasEnCurso.includes(jornada);

        return `
        <div class="jornada ${estaEnCurso ? "enCurso" : ""}">
        <h3>
            JORNADA ${jornada}
            ${estaEnCurso
                ? '<span class="etiquetaEnCurso">EN CURSO</span>'
                : ""
            }
        </h3>

                ${partidosJornada.map(partido => {
                    const local = buscarEquipo(partido.idLocal);
                    const visitante = buscarEquipo(partido.idVisitante);

                    if (!local || !visitante) return "";

                    const finalizado = partido.estado === "finalizado";

                    return `
                        <article class="partido">
                            <div class="equipoPartido">
                                <img src="${local.escudo}" alt="">
                                <span>${local.participante}</span>
                            </div>

                            <div class="marcador">
                                ${finalizado
                                    ? `${partido.golesLocal} - ${partido.golesVisitante}`
                                    : "VS"
                                }
                            </div>

                            <div class="equipoPartido">
                                <img src="${visitante.escudo}" alt="">
                                <span>${visitante.participante}</span>
                            </div>

                            <p class="estadoPartido ${finalizado ? "partidoFinalizado" : "partidoPendiente"}">
                            ${finalizado ? "FINALIZADO" : "PENDIENTE"}
                            </p>
                        </article>
                    `;
                }).join("")}
            </div>
        `;
    }).join("");
}

function mostrarGoleadores() {
    const listaGoleadores = document.getElementById("listaGoleadores");

    if (!listaGoleadores) return;

    const goleadoresOrdenados = goleadores
        .filter(registro =>
            registro.idTorneo === configuracion.idTorneo
        )
        .sort((a, b) => Number(b.goles) - Number(a.goles));

    const buscarEquipo = id =>
        equipos.find(equipo => equipo.idEquipo === id);

    if (goleadoresOrdenados.length === 0) {
        listaGoleadores.innerHTML = `
            <tr>
                <td colspan="3" class="mensaje">
                    Todavía no hay goleadores registrados.
                </td>
            </tr>
        `;
        return;
    }
    let posicion = 0;
    let golesAnterior = null;
    listaGoleadores.innerHTML = goleadoresOrdenados.map((registro, indice) => {
        const equipo = buscarEquipo(registro.idEquipo);
        const golesActuales = Number(registro.goles);

        if (golesActuales !== golesAnterior) {
            posicion = indice + 1;
        }

golesAnterior = golesActuales;

        if (!equipo) return "";

        return `
            <tr>
                <td>${posicion}</td>

                <td>
                    <div class="equipoTabla">
                        <img src="${equipo.escudo}" alt="">
                        <div>
                            <strong>${registro.jugador}</strong>
                            <small>${equipo.nombre}</small>
                        </div>
                    </div>
                </td>

                <td><strong>${registro.goles}</strong></td>
            </tr>
        `;
    }).join("");
}
