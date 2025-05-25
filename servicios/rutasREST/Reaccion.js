const express = require('express');
const router = express.Router();
const {
    crearReaccion,
    obtenerReaccionesPorPublicacion,
    actualizarReaccion,
    eliminarReaccion,
} = require('../../src/controladores/rest/Reaccion');

/**
 * @swagger
 * tags:
 *   name: Reacciones
 *   description: Operaciones relacionadas con las reacciones de publicaciones
 */

/**
 * @swagger
 * /api/reacciones:
 *   post:
 *     summary: Crear una nueva reacción
 *     tags: [Reacciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicacionId:
 *                 type: number
 *               usuarioId:
 *                 type: number
 *               tipo:
 *                 type: string
 *                 enum: [like, love, haha, triste, enojado]
 *     responses:
 *       201:
 *         description: Reacción creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', crearReaccion);

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
 *           type: number
 *         description: ID de la publicación
 *     responses:
 *       200:
 *         description: Lista de reacciones obtenida exitosamente
 *       404:
 *         description: No se encontraron reacciones para la publicación
 *       500:
 *         description: Error del servidor
 */
router.get('/publicacion/:id', obtenerReaccionesPorPublicacion);

/**
 * @swagger
 * /api/reacciones/{reaccionId}:
 *   put:
 *     summary: Actualizar una reacción
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: reaccionId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la reacción a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [like, love, haha, triste, enojado]
 *     responses:
 *       200:
 *         description: Reacción actualizada exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Reacción no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:reaccionId', actualizarReaccion);

/**
 * @swagger
 * /api/reacciones/{reaccionId}:
 *   delete:
 *     summary: Eliminar una reacción
 *     tags: [Reacciones]
 *     parameters:
 *       - in: path
 *         name: reaccionId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la reacción a eliminar
 *     responses:
 *       200:
 *         description: Reacción eliminada exitosamente
 *       404:
 *         description: Reacción no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:reaccionId', eliminarReaccion);

module.exports = router;
