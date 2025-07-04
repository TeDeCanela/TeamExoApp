const express = require('express');
const router = express.Router();
const{
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones,
    obtenerPublicacionesConRecursos,
    obtenerPublicacionesUsuarioConRecursos
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
router.get('/buscar', buscarPublicaciones);

/**
 * @swagger
 * /api/publicaciones/con-recursos:
 *   get:
 *     summary: Obtener publicaciones con sus recursos asociados
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         description: ID del usuario para filtrar sus publicaciones (opcional)
 *     responses:
 *       200:
 *         description: Lista de publicaciones con sus recursos asociados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   titulo:
 *                     type: string
 *                   contenido:
 *                     type: string
 *                   recurso:
 *                     type: object
 *                     description: Recurso asociado (si existe)
 *       500:
 *         description: Error del servidor
 */
router.get('/con-recursos', obtenerPublicacionesConRecursos);

/**
 * @swagger
 * /api/publicaciones/usuario/{usuarioId}:
 *   get:
 *     summary: Obtiene todas las publicaciones de un usuario específico
 *     description: Retorna un listado de publicaciones filtradas por ID de usuario y opcionalmente por estado
 *     tags: [Publicaciones]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID numérico del usuario cuyas publicaciones se quieren obtener
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Publicado, Borrador, Eliminado]
 *           default: Publicado
 *           example: Publicado
 *         description: Estado de las publicaciones a filtrar
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *         description: Límite de resultados por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *         description: Número de página para paginación
 *     responses:
 *       200:
 *         description: Listado de publicaciones del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Publicacion'
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: No se encontraron publicaciones para el usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/usuario/:id', obtenerPublicacionesUsuarioConRecursos);

module.exports = router;
