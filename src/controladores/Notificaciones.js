const { response } = require('express');
const Notificacion = require('../modelos/Notificacion');
const logger = require('../helpers/logger');

/**
 * @swagger
 * /api/notificaciones/{usuarioId}:
 *   get:
 *     summary: Obtener notificaciones de un usuario
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: leida
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura (true/false)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Número de notificaciones por página (default: 10)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "Página a consultar (default: 1)"
 *     responses:
 *       200:
 *         description: Lista paginada de notificaciones
 *       500:
 *         description: Error del servidor
 */
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

        if (leida === 'false') {
            const ids = notificaciones.map(n => n._id);
            await Notificacion.updateMany({ _id: { $in: ids } }, { $set: { leida: true } });
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

/**
 * @swagger
 * /api/notificaciones/{id}/leida:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * /api/notificaciones/marcar-multiples:
 *   patch:
 *     summary: Marcar múltiples notificaciones como leídas
 *     tags: [Notificaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *             example:
 *               ids: ["66211b845fd6e1bcd88215ea", "66211b845fd6e1bcd88215eb"]
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 *       500:
 *         description: Error del servidor
 */
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

/**
 * @swagger
 * /api/notificaciones/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación eliminada correctamente
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
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
