const express = require('express');
const router = express.Router();
const {
    crearComentario,
    obtenerComentariosPorPublicacion,
    actualizarComentario,
    eliminarComentario
} = require('../../src/controladores/rest/Comentario');

/**
 * @swagger
 * tags:
 *   name: Comentarios
 *   description: Operaciones relacionadas con los comentarios en publicaciones
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
 *               usuarioId:
 *                 type: number
 *               publicacionId:
 *                 type: number
 *               mensaje:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comentario creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', crearComentario);

/**
 * @swagger
 * /api/comentarios/publicacion/{id}:
 *   get:
 *     summary: Obtener comentarios de una publicación
 *     tags: [Comentarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Lista de comentarios
 *       404:
 *         description: Publicación no encontrada
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
 *           type: number
 *         description: ID del comentario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mensaje:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
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
 *           type: number
 *         description: ID del comentario
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
 *       404:
 *         description: Comentario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:comentarioId', eliminarComentario);

module.exports = router;
