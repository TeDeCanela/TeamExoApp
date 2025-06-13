const Notificacion = require('../../../../src/modelos/Notificacion');

/**
 * Almacena los streams activos organizados por ID de usuario.
 * Cada clave representa un usuario suscrito y su valor es un array de conexiones gRPC activas.
 * @type {Object<string, import('@grpc/grpc-js').ServerWritableStream[]>}
 */
const suscriptores = {};

/**
 * Registra una nueva suscripción al stream de notificaciones para un usuario.
 * Este metodo es llamado automáticamente por gRPC cuando un cliente ejecuta StreamNotificaciones.
 *
 * @param {import('@grpc/grpc-js').ServerWritableStream<{ usuarioId: number }, Object>} call - Stream del cliente gRPC
 */
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

/**
 * Emite una notificación a todos los streams activos del usuario destino.
 * También guarda la notificación en la base de datos para consulta posterior.
 *
 * @param {{
 *   usuarioId: number,
 *   tipo: string,
 *   mensaje: string,
 *   datosAdicionales?: Record<string, string>
 * }} notificacion - Objeto con los datos de la notificación a emitir.
 */
async function emitirNotificacion(notificacion) {
    const { usuarioId, tipo, mensaje, datosAdicionales = {} } = notificacion;

    if (!usuarioId || !tipo || !mensaje) {
        console.warn('Datos incompletos en notificación:', { usuarioId, tipo, mensaje });
        return;
    }

    const datos = typeof datosAdicionales === 'object' ? datosAdicionales : {};

    const nuevaNotificacion = new Notificacion({
        notificacionId: Date.now(), // genera un ID basado en timestamp
        usuarioId,
        tipo,
        mensaje,
        datosAdicionales
    });

    await nuevaNotificacion.save();

    // Emitir la notificación en tiempo real si hay clientes suscritos
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

/**
 * Metodo auxiliar para pruebas: permite establecer manualmente el mapa de suscriptores.
 *
 * @param {Object<string, import('@grpc/grpc-js').ServerWritableStream[]>} map - Diccionario de streams por usuarioId
 */
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
