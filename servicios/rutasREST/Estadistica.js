const express = require('express');
const router = express.Router();
const estadisticasController = require('../../src/controladores/Estadistica');

/**
 * @swagger
 * tags:
 *   name: Estadísticas
 *   description: Endpoints relacionados con métricas y reportes de la plataforma
 */

/**
 * @swagger
 * /api/estadisticas/estadistica:
 *   get:
 *     summary: Obtener estadísticas generales de la plataforma
 *     tags: [Estadísticas]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 topLikes:
 *                   type: object
 *                   properties:
 *                     publicacionId:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 topComentarios:
 *                   type: object
 *                   properties:
 *                     publicacionId:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/estadistica', estadisticasController.obtenerEstadisticasREST);

module.exports = router;
