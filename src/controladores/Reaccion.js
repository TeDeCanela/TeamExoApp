const { response } = require('express');
const Reaccion = require('../modelos/Reaccion');
const logger = require('../helpers/logger');
const { emitirReaccion } = require('../../servicios/serviciosgRPC/grcpReaccion/controladores/ReaccionGRPC');

/**
 * @swagger
 * /api/reacciones:
 *   post:
 *     summary: Crear una nueva reacción en una publicación
 *     tags: [Reacciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reaccionId
 *               - tipo
 *               - publicacionId
 *               - usuarioId
 *               - nombreUsuario
 *             properties:
 *               reaccionId:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 description: Tipo de reacción (like, love, etc.)
 *               publicacionId:
 *                 type: integer
 *               usuarioId:
 *                 type: integer
 *               nombreUsuario:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reacción creada exitosamente
 *       500:
 *         description: Error del servidor
 */
const crearReaccion = async (req, res = response) => {
    const { reaccionId, tipo, publicacionId, usuarioId, nombreUsuario } = req.body;

    try {
        const nueva = new Reaccion({ reaccionId, tipo, publicacionId, usuarioId });
        await nueva.save();

        emitirReaccion({ tipo, usuarioId, publicacionId, nombreUsuario });

        res.status(201).json({ msg: 'Reacción creada', reaccion: nueva });
    } catch (error) {
        logger.error(`Error al crear reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/reacciones/publicacion/{id}:
 *   get:
 *     summary: Obtener todas las reacciones de una publicación
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Lista de reacciones obtenida exitosamente
 *       500:
 *         description: Error del servidor
 */
const obtenerReaccionesPorPublicacion = async (req, res = response) => {
    try {
        const reacciones = await Reaccion.find({ publicacionId: parseInt(req.params.id) });
        res.json(reacciones);
    } catch (error) {
        logger.error(`Error al obtener reacciones: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/reacciones/{reaccionId}:
 *   put:
 *     summary: Actualizar el tipo de una reacción existente
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: reaccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reacción
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reacción actualizada exitosamente
 *       404:
 *         description: Reacción no encontrada
 *       500:
 *         description: Error del servidor
 */
const actualizarReaccion = async (req, res = response) => {
    try {
        const { tipo } = req.body;
        const actualizada = await Reaccion.findOneAndUpdate(
            { reaccionId: parseInt(req.params.reaccionId) },
            { tipo },
            { new: true }
        );

        if (!actualizada) return res.status(404).json({ msg: 'Reacción no encontrada' });
        res.json({ msg: 'Reacción actualizada', reaccion: actualizada });
    } catch (error) {
        logger.error(`Error al actualizar reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/reacciones/{reaccionId}:
 *   delete:
 *     summary: Eliminar una reacción por ID
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: reaccionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reacción a eliminar
 *     responses:
 *       200:
 *         description: Reacción eliminada exitosamente
 *       404:
 *         description: Reacción no encontrada
 *       500:
 *         description: Error del servidor
 */
const eliminarReaccion = async (req, res = response) => {
    try {
        const { reaccionId } = req.params;

        const eliminada = await Reaccion.findOneAndDelete({ reaccionId: parseInt(reaccionId) });

        if (!eliminada) {
            return res.status(404).json({ msg: 'Reacción no encontrada' });
        }

        res.json({
            msg: 'Reacción eliminada correctamente',
            reaccion: eliminada
        });
    } catch (error) {
        logger?.error(`Error al eliminar reacción: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {
    crearReaccion,
    obtenerReaccionesPorPublicacion,
    actualizarReaccion,
    eliminarReaccion
};
