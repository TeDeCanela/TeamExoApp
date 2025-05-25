const express = require('express');
const router = express.Router();
const {
    obtenerNotificacionesUsuario,
    marcarComoLeida,
    marcarMultiplesComoLeidas,
    eliminarNotificacion
} = require('../../src/controladores/rest/Notificaciones');

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Operaciones relacionadas con notificaciones
 */

/**
 * @swagger
 * /api/notificaciones/usuario/{usuarioId}:
 *   get:
 *     summary: Obtener notificaciones de un usuario
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de notificaciones obtenida exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:usuarioId', obtenerNotificacionesUsuario);

/**
 * @swagger
 * /api/notificaciones/{id}/marcar-leida:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notificaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch('/:id/marcar-leida', marcarComoLeida);

/**
 * @swagger
 * /api/notificaciones/marcar-leidas:
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
 *                   type: number
 *                 description: Lista de IDs de notificaciones a marcar como leídas
 *     responses:
 *       200:
 *         description: Notificaciones marcadas como leídas
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.patch('/marcar-leidas', marcarMultiplesComoLeidas);

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
 *           type: number
 *         description: ID de la notificación a eliminar
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', eliminarNotificacion);

module.exports = router;
