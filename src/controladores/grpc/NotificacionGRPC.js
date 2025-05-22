const Notificacion = require('../../modelos/Notificacion');


const suscriptores = {};

function streamNotificaciones(call) {
    const { usuarioId } = call.request;

    if (!usuarioId) {
        call.end();
        return;
    }

    if (!suscriptores[usuarioId]) {
        suscriptores[usuarioId] = [];
    }

    suscriptores[usuarioId].push(call);

    call.on('cancelled', () => {
        suscriptores[usuarioId] = suscriptores[usuarioId].filter(s => s !== call);
    });
}

async function emitirNotificacion(notificacion) {
    const { usuarioId, tipo, mensaje, datosAdicionales = {} } = notificacion;

    if (!usuarioId || !tipo || !mensaje) {
        console.warn('Datos incompletos en notificación:', { usuarioId, tipo, mensaje });
        return;
    }

    const datos = typeof datosAdicionales === 'object' ? datosAdicionales : {};

    const nuevaNotificacion = new Notificacion({
        notificacionId: Date.now(),
        usuarioId,
        tipo,
        mensaje,
        datosAdicionales
    });
    await nuevaNotificacion.save();

    if (suscriptores[usuarioId]) {
        suscriptores[usuarioId] = suscriptores[usuarioId].filter(stream => {
            if (stream.cancelled) return false;
            try {
                stream.write({
                    notificacionId: nuevaNotificacion.notificacionId,
                    tipo,
                    mensaje,
                    datosAdicionales,
                    fecha: nuevaNotificacion.fecha
                });
            } catch (error) {
                console.error('Error enviando notificación:', error);
                return false;
            }
            return true;
        });
    }
}

function __setSuscriptores(map) {
    for (const key in map) {
        suscriptores[key] = map[key];
    }
}

module.exports = {
    streamNotificaciones,
    emitirNotificacion,
    __setSuscriptores
};