const express = require('express');
const router = express.Router();
const {
    getUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarContrasena,
    obtenerPerfil
} = require('../../src/controladores/rest/Usuario');
const validarJWT = require('../../src/middlwares/validarJWT');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Operaciones relacionadas con usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       500:
 *         description: Error del servidor
 */
router.get('/', getUsuarios);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Agregar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       500:
 *         description: Error del servidor
 */
router.post('/', agregarUsuario);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   put:
 *     summary: Actualizar datos de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:usuarioId', actualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:usuarioId', eliminarUsuario);

/**
 * @swagger
 * /api/usuarios/{usuarioId}/contrasena:
 *   put:
 *     summary: Actualizar contraseña del usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:usuarioId/contrasena', actualizarContrasena);

/**
 * @swagger
 * /api/usuarios/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: Token no válido o no proporcionado
 *       500:
 *         description: Error del servidor
 */
router.get('/perfil', validarJWT, obtenerPerfil);


module.exports = router;
