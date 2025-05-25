const express = require('express');
const router = express.Router();
const estadisticasController = require('../../src/controladores/rest/Estadistica');

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Operaciones relacionadas con estadísticas de publicaciones
 */

/**
 * @swagger
 * /api/estadistica:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Estadísticas]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 publicacionConMasLikes:
 *                   type: object
 *                   description: Publicación con más likes
 *                   example:
 *                     publicacionId: 1
 *                     totalLikes: 10
 *                 publicacionConMasComentarios:
 *                   type: object
 *                   description: Publicación con más comentarios
 *                   example:
 *                     publicacionId: 3
 *                     totalComentarios: 15
 *       500:
 *         description: Error del servidor
 */
router.get('/estadistica', estadisticasController.obtenerEstadisticasREST);

module.exports = router;
