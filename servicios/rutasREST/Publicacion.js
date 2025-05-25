const express = require('express');
const router = express.Router();
const {
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones
} = require('../../src/controladores/rest/Publicacion');

/**
 * @swagger
 * tags:
 *   name: Publicaciones
 *   description: Operaciones relacionadas con publicaciones
 */

/**
 * @swagger
 * /api/publicaciones:
 *   post:
 *     summary: Crear una nueva publicación
 *     tags: [Publicaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contenido:
 *                 type: string
 *               autorId:
 *                 type: number
 *               tipo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', crearPublicacion);

/**
 * @swagger
 * /api/publicaciones/{identificador}:
 *   delete:
 *     summary: Eliminar una publicación como moderador
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: identificador
 *         required: true
 *         schema:
 *           type: string
 *         description: ID o identificador de la publicación a eliminar
 *     responses:
 *       200:
 *         description: Publicación eliminada exitosamente
 *       404:
 *         description: Publicación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:identificador', eliminarPublicacionModerador);

/**
 * @swagger
 * /api/publicaciones:
 *   get:
 *     summary: Buscar publicaciones por filtros
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: autorId
 *         schema:
 *           type: number
 *         description: ID del autor
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Tipo de publicación
 *       - in: query
 *         name: palabraClave
 *         schema:
 *           type: string
 *         description: Palabra clave en el contenido
 *     responses:
 *       200:
 *         description: Publicaciones encontradas
 *       500:
 *         description: Error del servidor
 */
router.get('/', buscarPublicaciones);

module.exports = router;
