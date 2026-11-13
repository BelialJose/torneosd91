
function calcularPosiciones(equipos, partidos, configuracion = {}) {

    // 1. Leer el sistema de puntuación.
    const puntosVictoria = Number(configuracion.puntosVictoria ?? 3);
    const puntosEmpate = Number(configuracion.puntosEmpate ?? 1);
    const puntosDerrota = Number(configuracion.puntosDerrota ?? 0);

    // 2. Crear las estadísticas iniciales.
    const posiciones = equipos.map(equipo => ({
        idEquipo: equipo.idEquipo,
        nombre: equipo.nombre,
        participante: equipo.participante,
        escudo: equipo.escudo,
        PJ: 0,
        PG: 0,
        PE: 0,
        PP: 0,
        GF: 0,
        GC: 0,
        DG: 0,
        PTS: 0
    }));

    // 3. Crear acceso rápido por identificador.
    const posicionesPorId = new Map();

    posiciones.forEach(equipo => {
        posicionesPorId.set(equipo.idEquipo, equipo);
    });

    // 4. Procesar partidos finalizados.
    partidos.forEach(partido => {

        if (partido.estado !== "finalizado") return;

        if (
            partido.golesLocal === "" ||
            partido.golesVisitante === "" ||
            partido.golesLocal === null ||
            partido.golesVisitante === null ||
            partido.golesLocal === undefined ||
            partido.golesVisitante === undefined
        ) return;

        const golesLocal = Number(partido.golesLocal);
        const golesVisitante = Number(partido.golesVisitante);

        if (
            !Number.isInteger(golesLocal) ||
            !Number.isInteger(golesVisitante) ||
            golesLocal < 0 ||
            golesVisitante < 0
        ) return;

        const local = posicionesPorId.get(partido.idLocal);
        const visitante = posicionesPorId.get(partido.idVisitante);

        if (!local || !visitante || local === visitante) return;

        // 5. Actualizar estadísticas.
        local.PJ++;
        visitante.PJ++;

        local.GF += golesLocal;
        local.GC += golesVisitante;

        visitante.GF += golesVisitante;
        visitante.GC += golesLocal;

        // 6. Asignar puntos.
        if (golesLocal > golesVisitante) {
            local.PG++;
            visitante.PP++;

            local.PTS += puntosVictoria;
            visitante.PTS += puntosDerrota;

        } else if (golesLocal < golesVisitante) {
            visitante.PG++;
            local.PP++;

            visitante.PTS += puntosVictoria;
            local.PTS += puntosDerrota;

        } else {
            local.PE++;
            visitante.PE++;

            local.PTS += puntosEmpate;
            visitante.PTS += puntosEmpate;
        }
    });

    // 7. Calcular diferencia de gol.
    posiciones.forEach(equipo => {
        equipo.DG = equipo.GF - equipo.GC;
    });

    // 8. Aplicar los criterios de desempate configurados.
    const desempates = [
        configuracion.desempate1 || "DG",
        configuracion.desempate2 || "GF"
    ];

    posiciones.sort((a, b) => {
        if (b.PTS !== a.PTS) {
            return b.PTS - a.PTS;
        }

        for (const criterio of desempates) {
            if (b[criterio] !== undefined && a[criterio] !== undefined) {
                const diferencia = b[criterio] - a[criterio];

                if (diferencia !== 0) return diferencia;
            }
        }

        return a.nombre.localeCompare(b.nombre);
    });

    return posiciones;
}
