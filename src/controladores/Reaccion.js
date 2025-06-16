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
        const nueva = new Reaccion({ tipo, publicacionId, usuarioId });
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

/**
 * @swagger
 * /api/reacciones/buscar:
 *   get:
 *     summary: Obtener los datos de una reacción por usuario y publicación
 *     description: Devuelve el ID de la reacción, el tipo y la fecha con base en el usuario y la publicación especificados.
 *     tags: [Reacciones]
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario que realizó la reacción
 *       - in: query
 *         name: publicacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación relacionada
 *     responses:
 *       200:
 *         description: Reacción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reaccionId:
 *                   type: integer
 *                   description: ID de la reacción
 *                   example: 123
 *                 tipo:
 *                   type: string
 *                   description: Tipo de reacción
 *                   enum: [like, dislike, emoji]
 *                   example: like
 *                 fecha:
 *                   type: string
 *                   format: date-time
 *                   description: Fecha de creación de la reacción
 *                   example: "2025-06-16T16:25:00.000Z"
 *       400:
 *         description: Parámetros faltantes (usuarioId o publicacionId)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: usuarioId y publicacionId son requeridos
 *       404:
 *         description: Reacción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: No se encontró una reacción con esos datos
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Error al buscar la reacción
 */

const obtenerReaccionId = async (req, res = response) => {
    const { usuarioId, publicacionId } = req.query;

    if (!usuarioId || !publicacionId) {
        return res.status(400).json({
            msg: 'usuarioId y publicacionId son requeridos'
        });
    }

    try {
        const reaccion = await Reaccion.findOne({ usuarioId: Number(usuarioId), publicacionId: Number(publicacionId) });

        if (!reaccion) {
            return res.status(404).json({
                msg: 'No se encontró una reacción con esos datos'
            });
        }

        return res.json({
            reaccionId: reaccion.reaccionId,
            tipo: reaccion.tipo,
            fecha: reaccion.fecha
        });

    } catch (error) {
        console.error(`Error al obtener reaccionId: ${error.message}`);
        return res.status(500).json({
            msg: 'Error al buscar la reacción'
        });
    }
};



module.exports = {
    crearReaccion,
    obtenerReaccionesPorPublicacion,
    actualizarReaccion,
    eliminarReaccion,
    obtenerReaccionId
};
