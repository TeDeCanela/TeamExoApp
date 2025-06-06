const express = require('express');
const router = express.Router();
const {
    crearReaccion,
    obtenerReaccionesPorPublicacion,
    actualizarReaccion,
    eliminarReaccion,
} = require('../../src/controladores/Reaccion');

/**
 * @swagger
 * tags:
 *   name: Reacciones
 *   description: Endpoints para gestionar reacciones de usuarios a publicaciones
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
 *             required:
 *               - reaccionId
 *               - tipo
 *               - publicacionId
 *               - usuarioId
 *             properties:
 *               reaccionId:
 *                 type: integer
 *               tipo:
 *                 type: string
 *                 example: like
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
router.post('/', crearReaccion);

/**
 * @swagger
 * /api/reacciones/publicacion/{id}:
 *   get:
 *     summary: Obtener reacciones de una publicación por ID
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
 *         description: Lista de reacciones de la publicación
 *       500:
 *         description: Error del servidor
 */
router.get('/publicacion/:id', obtenerReaccionesPorPublicacion);

/**
 * @swagger
 * /api/reacciones/{reaccionId}:
 *   put:
 *     summary: Actualizar el tipo de una reacción
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
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: love
 *     responses:
 *       200:
 *         description: Reacción actualizada
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
 *     summary: Eliminar una reacción por su ID
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
 *         description: Reacción eliminada correctamente
 *       404:
 *         description: Reacción no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:reaccionId', eliminarReaccion);

module.exports = router;
