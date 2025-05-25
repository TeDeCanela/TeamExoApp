const express = require('express');
const router = express.Router();
const {
    obtenerRecursoPorId,
    obtenerRecursosPorUsuario,
    obtenerRecursosPorTipo,
    eliminarRecurso,
    actualizarRecurso,
    buscarRecursos
} = require('../../src/controladores/rest/Recurso');

/**
 * @swagger
 * tags:
 *   name: Recursos
 *   description: Operaciones relacionadas con los recursos
 */

/**
 * @swagger
 * /api/recursos/buscar:
 *   get:
 *     summary: Buscar recursos por parámetros
 *     tags: [Recursos]
 *     parameters:
 *       - in: query
 *         name: termino
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de recursos que coinciden con la búsqueda
 *       500:
 *         description: Error del servidor
 */
router.get('/buscar', buscarRecursos);

/**
 * @swagger
 * /api/recursos/{id}:
 *   get:
 *     summary: Obtener un recurso por su ID
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Recursos encontrados
 *       404:
 *         description: No se encontraron recursos para este usuario
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
 *         description: Tipo de recurso
 *     responses:
 *       200:
 *         description: Recursos del tipo solicitado
 *       404:
 *         description: No se encontraron recursos del tipo especificado
 *       500:
 *         description: Error del servidor
 */
router.get('/tipo/:tipo', obtenerRecursosPorTipo);

/**
 * @swagger
 * /api/recursos/{id}:
 *   delete:
 *     summary: Eliminar un recurso
 *     tags: [Recursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del recurso a eliminar
 *     responses:
 *       200:
 *         description: Recurso eliminado exitosamente
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
 *           type: string
 *         description: ID del recurso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recurso actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Recurso no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', actualizarRecurso);

module.exports = router;
