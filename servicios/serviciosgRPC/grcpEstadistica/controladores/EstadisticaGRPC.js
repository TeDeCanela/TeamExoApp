const grpc = require('@grpc/grpc-js'); // Necesario para usar códigos de estado gRPC

const Reaccion = require('../../../../src/modelos/Reaccion');
const Comentario = require('../../../../src/modelos/Comentario');
const Estadistica = require('../../../../src/modelos/Estadistica');

/**
 * Metodo gRPC que calcula estadísticas generales de interacción en la plataforma.
 * Obtiene la publicación con más "likes" y la publicación con más comentarios.
 * Las estadísticas también se almacenan en la base de datos para seguimiento.
 *
 * @param {import('@grpc/grpc-js').ServerUnaryCall<any, any>} call - Llamada gRPC entrante (sin parámetros)
 * @param {import('@grpc/grpc-js').sendUnaryData<any>} callback - Función para enviar la respuesta o error al cliente
 */
async function obtenerEstadisticas(call, callback) {
    try {
        const topLikes = await Reaccion.aggregate([
            { $match: { tipo: 'like' } },
            { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        const topComentarios = await Comentario.aggregate([
            { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        await Promise.all([
            Estadistica.findOneAndUpdate(
                { tipo: 'top_likes' },
                {
                    publicacionId: topLikes[0]?._id || null,
                    cantidad: topLikes[0]?.total || 0
                },
                { upsert: true }
            ),
            Estadistica.findOneAndUpdate(
                { tipo: 'top_comentarios' },
                {
                    publicacionId: topComentarios[0]?._id || null,
                    cantidad: topComentarios[0]?.total || 0
                },
                { upsert: true }
            )
        ]);

        callback(null, {
            topLikes: {
                publicacionId: topLikes[0]?._id || 0,
                total: topLikes[0]?.total || 0
            },
            topComentarios: {
                publicacionId: topComentarios[0]?._id || 0,
                total: topComentarios[0]?.total || 0
            }
        });
    } catch (error) {

        callback({
            code: grpc.status.INTERNAL,
            message: 'Error al obtener estadísticas'
        });
    }
}

module.exports = {
    obtenerEstadisticas
};
