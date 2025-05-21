
const suscriptores = {};

function streamReacciones(call) {
    const { publicacionId } = call.request;

    if (!publicacionId) {
        call.end();
        return;
    }

    if (!suscriptores[publicacionId]) {
        suscriptores[publicacionId] = [];
    }

    suscriptores[publicacionId].push(call);

    call.on('cancelled', () => {
        suscriptores[publicacionId] = suscriptores[publicacionId].filter(s => s !== call);
    });
}

function emitirReaccion(reaccion) {
    const { tipo, usuarioId, publicacionId, nombreUsuario = 'Desconocido' } = reaccion;

    if (!tipo || !usuarioId || !publicacionId) {
        console.warn(' Reacción inválida, faltan datos');
        return;
    }

    const notificacion = {
        tipo,
        usuarioId,
        publicacionId,
        nombreUsuario
    };

    if (!suscriptores[publicacionId]) return;

    suscriptores[publicacionId] = suscriptores[publicacionId].filter(stream => {
        if (stream.cancelled) return false;
        try {
            stream.write(notificacion);
        } catch (error) {
            console.error(' Error al enviar notificación:', error.message);
            return false;
        }
        return true;
    });
}
function __setSuscriptores(map) {
    for (const key in map) {
        suscriptores[key] = map[key];
    }
}

module.exports = {
    streamReacciones,
    emitirReaccion,
    __setSuscriptores
};