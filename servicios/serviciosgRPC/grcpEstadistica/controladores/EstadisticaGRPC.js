const Publicacion = require('../../../../src/modelos/Publicacion');
const Usuario = require('../../../../src/modelos/Usuario');
const Reaccion = require('../../../../src/modelos/Reaccion');
const Comentario = require('../../../../src/modelos/Comentario');
const { Recurso } = require('../../../../src/modelos/Recurso');
const Notificacion = require('../../../../src/modelos/Notificacion');
const grpc = require('@grpc/grpc-js');
const mongoose = require('mongoose');

async function obtenerEstadisticas(call, callback) {
    try {
        const [
            topLikes,
            topComentarios,
            totalPublicaciones,
            diaTopPublicaciones,
            usuarioTopPublicaciones,
            recursosPorTipo,
            usuarioTopReacciones,
            usuarioTopComentarios,
            notificacionesPendientes
        ] = await Promise.all([
            Reaccion.aggregate([
                { $match: { tipo: 'like' } },
                { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Comentario.aggregate([
                { $group: { _id: '$publicacionId', total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Publicacion.countDocuments({ estado: 'Publicado' }),
            Publicacion.aggregate([
                { $match: { estado: 'Publicado' } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$fechaCreacion" } },
                        total: { $sum: 1 }
                    }
                },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Publicacion.aggregate([
                { $group: { _id: "$usuarioId", total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Recurso.aggregate([
                { $group: { _id: "$tipo", total: { $sum: 1 } } }
            ]),
            Reaccion.aggregate([
                { $group: { _id: "$usuarioId", total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Comentario.aggregate([
                { $group: { _id: "$usuarioId", total: { $sum: 1 } } },
                { $sort: { total: -1 } },
                { $limit: 1 }
            ]),
            Notificacion.countDocuments({ leida: false })
        ]);

        // Validación de arreglos
        const topLikesArr = Array.isArray(topLikes) ? topLikes : [];
        const topComentariosArr = Array.isArray(topComentarios) ? topComentarios : [];
        const diaTopPublicacionesArr = Array.isArray(diaTopPublicaciones) ? diaTopPublicaciones : [];
        const usuarioTopPublicacionesArr = Array.isArray(usuarioTopPublicaciones) ? usuarioTopPublicaciones : [];
        const recursosPorTipoArr = Array.isArray(recursosPorTipo) ? recursosPorTipo : [];
        const usuarioTopReaccionesArr = Array.isArray(usuarioTopReacciones) ? usuarioTopReacciones : [];
        const usuarioTopComentariosArr = Array.isArray(usuarioTopComentarios) ? usuarioTopComentarios : [];

        const publicacionTopLikes = topLikesArr[0]?._id
            ? await Publicacion.findById(new mongoose.Types.ObjectId(topLikesArr[0]._id)).lean()
            : null;

        const publicacionTopComentarios = topComentariosArr[0]?._id
            ? await Publicacion.findById(new mongoose.Types.ObjectId(topComentariosArr[0]._id)).lean()
            : null;

        const [usuarioPublicaciones, usuarioReacciones, usuarioComentarios] = await Promise.all([
            Usuario.findOne({ usuarioId: usuarioTopPublicacionesArr[0]?._id }).lean(),
            Usuario.findOne({ usuarioId: usuarioTopReaccionesArr[0]?._id }).lean(),
            Usuario.findOne({ usuarioId: usuarioTopComentariosArr[0]?._id }).lean()
        ]);

        const recursosPorTipoFormateados = recursosPorTipoArr.map(r => ({
            tipo: r._id,
            total: r.total
        }));

        callback(null, {
            topLikes: {
                publicacionId: topLikesArr[0]?._id?.toString() || "0",
                titulo: publicacionTopLikes?.titulo || "Desconocido",
                total: topLikesArr[0]?.total || 0
            },
            topComentarios: {
                publicacionId: topComentariosArr[0]?._id?.toString() || "0",
                titulo: publicacionTopComentarios?.titulo || "Desconocido",
                total: topComentariosArr[0]?.total || 0
            },
            totalPublicaciones,
            diaConMasPublicaciones: diaTopPublicacionesArr[0]?._id || "N/A",
            publicacionesEnEseDia: diaTopPublicacionesArr[0]?.total || 0,
            usuarioTopPublicaciones: {
                usuarioId: usuarioPublicaciones?.usuarioId || 0,
                nombre: usuarioPublicaciones?.nombre || "Desconocido"
            },
            recursosPorTipo: recursosPorTipoFormateados,
            usuarioTopReacciones: {
                usuarioId: usuarioReacciones?.usuarioId || 0,
                nombre: usuarioReacciones?.nombre || "Desconocido"
            },
            usuarioTopComentarios: {
                usuarioId: usuarioComentarios?.usuarioId || 0,
                nombre: usuarioComentarios?.nombre || "Desconocido"
            },
            notificacionesPendientes
        });
    } catch (error) {
        console.error("Error en obtenerEstadisticas:", error);
        callback({
            code: grpc.status.INTERNAL,
            message: 'Error al obtener estadísticas extendidas'
        });
    }
}

module.exports = { obtenerEstadisticas };
