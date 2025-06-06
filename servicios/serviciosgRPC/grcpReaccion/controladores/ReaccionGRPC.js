/**
 * Almacena los streams de los usuarios suscritos por `publicacionId`.
 * La clave es el ID de la publicación y el valor es un array de streams (call).
 * Cada stream representa a un cliente suscrito en tiempo real.
 * @type {Object<string, import('@grpc/grpc-js').ServerWritableStream[]>}
 */
const suscriptores = {};

/**
 * Maneja una nueva suscripción a las reacciones de una publicación.
 * Guarda el stream abierto para que posteriormente se puedan enviar notificaciones
 * cuando alguien reaccione a la publicación.
 *
 * Este método es invocado por gRPC cuando un cliente ejecuta `StreamReacciones`.
 *
 * @param {import('@grpc/grpc-js').ServerWritableStream<{ publicacionId: number }, Object>} call - Stream del cliente que recibe notificaciones
 */
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

    // Si el cliente cancela su conexión, se elimina del array
    call.on('cancelled', () => {
        suscriptores[publicacionId] = suscriptores[publicacionId].filter(s => s !== call);
    });
}

/**
 * Envía una notificación de reacción a todos los clientes que están
 * suscritos a la publicación indicada.
 *
 * @param {{ tipo: string, usuarioId: number, publicacionId: number, nombreUsuario?: string }} reaccion - Datos de la reacción a emitir
 */
function emitirReaccion(reaccion) {
    const { tipo, usuarioId, publicacionId, nombreUsuario = 'Desconocido' } = reaccion;

    if (!tipo || !usuarioId || !publicacionId) {
        console.warn('Reacción inválida, faltan datos');
        return;
    }

    const notificacion = {
        tipo,
        usuarioId,
        publicacionId,
        nombreUsuario
    };

    if (!suscriptores[publicacionId]) return;

    // Filtra y envía la notificación a cada cliente activo
    suscriptores[publicacionId] = suscriptores[publicacionId].filter(stream => {
        if (stream.cancelled) return false;
        try {
            stream.write(notificacion);
        } catch (error) {
            console.error('Error al enviar notificación:', error.message);
            return false;
        }
        return true;
    });
}

/**
 * Método de utilidad para pruebas unitarias.
 * Permite sobrescribir el mapa de suscriptores manualmente.
 *
 * @param {Object<string, import('@grpc/grpc-js').ServerWritableStream[]>} map - Nuevo mapa de suscriptores
 */
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
