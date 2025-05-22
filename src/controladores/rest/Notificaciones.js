const { response } = require('express');
const Notificacion = require('../../modelos/Notificacion');
const logger = require('../../helpers/logger');

const obtenerNotificacionesUsuario = async (req, res = response) => {
    const { usuarioId } = req.params;
    const { leida, limit = 10, page = 1 } = req.query;

    try {
        const filtro = { usuarioId: Number(usuarioId) };

        if (leida !== undefined) {
            filtro.leida = leida === 'true';
        }

        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: { fecha: -1 }
        };

        const [notificaciones, total] = await Promise.all([
            Notificacion.find(filtro, null, options),
            Notificacion.countDocuments(filtro)
        ]);

        // Marcar como leídas si se están obteniendo las no leídas
        if (leida === 'false') {
            const ids = notificaciones.map(n => n._id);
            await Notificacion.updateMany(
                { _id: { $in: ids } },
                { $set: { leida: true } }
            );
        }

        res.json({
            total,
            paginas: Math.ceil(total / parseInt(limit)),
            paginaActual: parseInt(page),
            resultados: notificaciones
        });
    } catch (error) {
        logger.error(`Error al obtener notificaciones: ${error.message}`);
        res.status(500).json({
            msg: 'Error al obtener las notificaciones',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const marcarComoLeida = async (req, res = response) => {
    try {
        const notificacion = await Notificacion.findOneAndUpdate(
            { notificacionId: parseInt(req.params.id) },
            { $set: { leida: true } },
            { new: true }
        );

        if (!notificacion) {
            return res.status(404).json({ msg: 'Notificación no encontrada' });
        }

        res.json(notificacion);
    } catch (error) {
        logger.error(`Error al marcar notificación como leída: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

const marcarMultiplesComoLeidas = async (req, res = response) => {
    try {
        const { ids } = req.body;

        const result = await Notificacion.updateMany(
            { _id: { $in: ids } },
            { $set: { leida: true } }
        );

        res.json({
            msg: `${result.modifiedCount} notificaciones marcadas como leídas`
        });
    } catch (error) {
        logger.error(`Error al marcar notificaciones como leídas: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

// Opcional: Método para eliminar notificación
const eliminarNotificacion = async (req, res = response) => {
    try {
        const eliminada = await Notificacion.findOneAndDelete({
            notificacionId: parseInt(req.params.id)
        });

        if (!eliminada) {
            return res.status(404).json({ msg: 'Notificación no encontrada' });
        }

        res.json({
            msg: 'Notificación eliminada correctamente',
            notificacion: eliminada
        });
    } catch (error) {
        logger.error(`Error al eliminar notificación: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {
    obtenerNotificacionesUsuario,
    marcarComoLeida,
    marcarMultiplesComoLeidas,
    eliminarNotificacion
};