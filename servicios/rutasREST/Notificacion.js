const express = require('express');
const router = express.Router();
const {
    obtenerNotificacionesUsuario,
    marcarComoLeida,
    marcarMultiplesComoLeidas,
    eliminarNotificacion
} = require('../../src/controladores/Notificaciones');

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para consultar y actualizar notificaciones de usuario
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
 *           type: integer
 *         description: ID del usuario
 *       - in: query
 *         name: leida
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado de lectura (true o false)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número máximo de resultados por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página de resultados a obtener
 *     responses:
 *       200:
 *         description: Lista de notificaciones del usuario
 *       500:
 *         description: Error al obtener notificaciones
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
 *                   type: string
 *     responses:
 *       200:
 *         description: Notificaciones actualizadas
 *       500:
 *         description: Error del servidor
 */
router.patch('/marcar-leidas', marcarMultiplesComoLeidas);

/**
 * @swagger
 * /api/notificaciones/{id}:
 *   delete:
 *     summary: Eliminar una notificación por su ID
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
router.delete('/:id', eliminarNotificacion);

module.exports = router;
