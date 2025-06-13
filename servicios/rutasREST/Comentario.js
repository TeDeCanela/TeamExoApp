const express = require('express');
const router = express.Router();
const {
    crearComentario,
    obtenerComentariosPorPublicacion,
    actualizarComentario,
    eliminarComentario
} = require('../../src/controladores/Comentario');

/**
 * @swagger
 * tags:
 *   name: Comentarios
 *   description: Endpoints para gestionar comentarios
 */

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
router.post('/', crearComentario);

/**
 * @swagger
 * /api/comentarios/publicacion/{id}:
 *   get:
 *     summary: Obtener comentarios por ID de publicación
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
router.get('/publicacion/:id', obtenerComentariosPorPublicacion);

/**
 * @swagger
 * /api/comentarios/{comentarioId}:
 *   put:
 *     summary: Actualizar un comentario
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: comentarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del comentario a actualizar
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
router.put('/:comentarioId', actualizarComentario);

/**
 * @swagger
 * /api/comentarios/{comentarioId}:
 *   delete:
 *     summary: Eliminar un comentario
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
router.delete('/:comentarioId', eliminarComentario);

module.exports = router;
