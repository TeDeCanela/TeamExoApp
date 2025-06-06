const express = require('express');
const router = express.Router();
const {
    obtenerRecursoPorId,
    obtenerRecursosPorUsuario,
    obtenerRecursosPorTipo,
    eliminarRecurso,
    actualizarRecurso,
    buscarRecursos
} = require('../../src/controladores/Recurso');

/**
 * @swagger
 * tags:
 *   name: Recursos
 *   description: Endpoints para consultar, actualizar y eliminar recursos multimedia
 */

/**
 * @swagger
 * /api/recursos/buscar:
 *   get:
 *     summary: Buscar recursos por filtros
 *     tags: [Recursos]
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Tipo de recurso (Foto, Video, Audio)
 *       - in: query
 *         name: tamano
 *         schema:
 *           type: integer
 *         description: Tamaño del recurso
 *       - in: query
 *         name: formato
 *         schema:
 *           type: integer
 *         description: Formato del recurso (ej. 1 = jpg)
 *       - in: query
 *         name: usuarioId
 *         schema:
 *           type: integer
 *         description: ID del usuario que subió el recurso
 *     responses:
 *       200:
 *         description: Lista de recursos encontrados
 *       500:
 *         description: Error del servidor
 */
router.get('/buscar', buscarRecursos);

/**
 * @swagger
 * /api/recursos/{id}:
 *   get:
 *     summary: Obtener un recurso por su identificador
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Recurso encontrado
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', obtenerRecursoPorId);

/**
 * @swagger
 * /api/recursos/usuario/{usuarioId}:
 *   get:
 *     summary: Obtener recursos por ID de usuario
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de recursos del usuario
 *       500:
 *         description: Error del servidor
 */
router.get('/usuario/:usuarioId', obtenerRecursosPorUsuario);

/**
 * @swagger
 * /api/recursos/tipo/{tipo}:
 *   get:
 *     summary: Obtener recursos por tipo
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de recurso (Foto, Video, Audio)
 *     responses:
 *       200:
 *         description: Recursos encontrados
 *       500:
 *         description: Error del servidor
 */
router.get('/tipo/:tipo', obtenerRecursosPorTipo);

/**
 * @swagger
 * /api/recursos/{id}:
 *   delete:
 *     summary: Eliminar un recurso por su ID
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     responses:
 *       200:
 *         description: Recurso eliminado correctamente
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', eliminarRecurso);

/**
 * @swagger
 * /api/recursos/{id}:
 *   put:
 *     summary: Actualizar un recurso
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recurso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               formato:
 *                 type: integer
 *               tamano:
 *                 type: integer
 *               resolucion:
 *                 type: integer
 *               duracion:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Recurso actualizado
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', actualizarRecurso);

module.exports = router;
