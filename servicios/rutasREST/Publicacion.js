const express = require('express');
const router = express.Router();
const {
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones
} = require('../../src/controladores/Publicacion');

/**
 * @swagger
 * tags:
 *   name: Publicaciones
 *   description: Endpoints para crear, buscar y eliminar publicaciones
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
 *             required:
 *               - titulo
 *               - contenido
 *             properties:
 *               titulo:
 *                 type: string
 *               contenido:
 *                 type: string
 *               estado:
 *                 type: string
 *                 example: "Publicado"
 *               usuarioId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Publicación creada exitosamente
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.post('/', crearPublicacion);

/**
 * @swagger
 * /api/publicaciones/{identificador}:
 *   delete:
 *     summary: Eliminar una publicación (moderador o administrador)
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: identificador
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la publicación a eliminar
 *       - in: body
 *         name: datos
 *         required: false
 *         schema:
 *           type: object
 *           properties:
 *             rol:
 *               type: string
 *               example: "Moderador"
 *             usuarioId:
 *               type: integer
 *     responses:
 *       200:
 *         description: Publicación eliminada correctamente
 *       403:
 *         description: No tienes permisos para realizar esta acción
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
 *     summary: Buscar publicaciones por filtros, estado y palabras clave
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Palabras clave de búsqueda
 *       - in: query
 *         name: categorias
 *         schema:
 *           type: string
 *         description: Categorías separadas por comas
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado de la publicación (Publicado, Borrador, Eliminado)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de resultados por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página actual
 *     responses:
 *       200:
 *         description: Lista de publicaciones encontradas
 *       500:
 *         description: Error del servidor
 */
router.get('/', buscarPublicaciones);

module.exports = router;
