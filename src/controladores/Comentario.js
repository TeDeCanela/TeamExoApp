const { response } = require('express');
const Comentario = require('../modelos/Comentario');
const logger = require('../helpers/logger');

/**
 * @swagger
 * /api/comentarios:
 *   post:
 *     summary: Crear un nuevo comentario
 *     tags: [Comentarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comentarioId
 *               - publicacionId
 *               - usuarioId
 *               - texto
 *             properties:
 *               comentarioId:
 *                 type: integer
 *               publicacionId:
 *                 type: integer
 *               usuarioId:
 *                 type: integer
 *               texto:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       500:
 *         description: Error del servidor
 */
const crearComentario = async (req, res = response) => {
    const { comentarioId, publicacionId, usuarioId, texto } = req.body;
    try {
        const nuevo = new Comentario({ comentarioId, publicacionId, usuarioId, texto });
        await nuevo.save();
        res.status(201).json({ msg: 'Comentario creado', comentario: nuevo });
    } catch (error) {
        logger.error(`Error al crear comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/comentarios/publicacion/{id}:
 *   get:
 *     summary: Obtener todos los comentarios de una publicación
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *       500:
 *         description: Error del servidor
 */
const obtenerComentariosPorPublicacion = async (req, res = response) => {
    try {
        const comentarios = await Comentario.find({ publicacionId: parseInt(req.params.id) });
        res.json(comentarios);
    } catch (error) {
        logger.error(`Error al obtener comentarios: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/comentarios/{comentarioId}:
 *   put:
 *     summary: Actualizar un comentario existente
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               texto:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado
 *       404:
 *         description: Comentario no encontrado
 *       500:
 *         description: Error del servidor
 */
const actualizarComentario = async (req, res = response) => {
    try {
        const { texto } = req.body;
        const actualizado = await Comentario.findOneAndUpdate(
            { comentarioId: parseInt(req.params.comentarioId) },
            { texto },
            { new: true }
        );

        if (!actualizado) return res.status(404).json({ msg: 'Comentario no encontrado' });

        res.json({ msg: 'Comentario actualizado', comentario: actualizado });
    } catch (error) {
        logger.error(`Error al actualizar comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

/**
 * @swagger
 * /api/comentarios/{comentarioId}:
 *   delete:
 *     summary: Eliminar un comentario por ID
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario a eliminar
 *     responses:
 *       200:
 *         description: Comentario eliminado correctamente
 *       404:
 *         description: Comentario no encontrado
 *       500:
 *         description: Error del servidor
 */
const eliminarComentario = async (req, res = response) => {
    try {
        const eliminado = await Comentario.findOneAndDelete({ comentarioId: parseInt(req.params.comentarioId) });
        if (!eliminado) return res.status(404).json({ msg: 'Comentario no encontrado' });

        res.json({ msg: 'Comentario eliminado correctamente', comentario: eliminado });
    } catch (error) {
        logger.error(`Error al eliminar comentario: ${error.message}`);
        res.status(500).json({ msg: 'Error del servidor' });
    }
};

module.exports = {
    crearComentario,
    obtenerComentariosPorPublicacion,
    actualizarComentario,
    eliminarComentario
};
