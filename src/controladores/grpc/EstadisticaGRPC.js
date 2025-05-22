const grpc = require('@grpc/grpc-js'); // <--- ESTA LÍNEA es obligatoria

const Reaccion = require('../../modelos/Reaccion');
const Comentario = require('../../modelos/Comentario');
const Estadistica = require('../../modelos/Estadistica');

async function obtenerEstadisticas(call, callback) {
    try {
        // Publicación con más likes
        const topLikes = await Reaccion.aggregate([
            { $match: { tipo: 'like' } },
            { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        // Publicación con más comentarios
        const topComentarios = await Comentario.aggregate([
            { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        // Guardar estadísticas (opcional)
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