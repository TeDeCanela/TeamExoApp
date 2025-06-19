const express = require('express');
const router = express.Router();
const {
    getUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarContrasena,
    obtenerPerfil,
    obtenerUsuarioPorId
} = require('../../src/controladores/Usuario');
const validarJWT = require('../../src/middlwares/validarJWT');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Endpoints para gestión de usuarios y autenticación
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       500:
 *         description: Error del servidor
 */
router.get('/', getUsuarios);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreUsuario
 *               - nombre
 *               - apellidos
 *               - correo
 *               - contrasena
 *               - rol
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: El correo ya está registrado
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
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreUsuario:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               correo:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
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
 *           type: integer
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado
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
 *     summary: Actualizar contraseña de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nuevaContrasena
 *             properties:
 *               nuevaContrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: La contraseña no puede estar vacía
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
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/perfil', validarJWT, obtenerPerfil);

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   get:
 *     summary: Obtiene un usuario por su ID
 *     description: Retorna la información de un usuario específico excluyendo su contraseña
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID numérico del usuario a buscar
 *     responses:
 *       200:
 *         description: Información del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Falta el parámetro usuarioId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: El parámetro usuarioId es requerido
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 msg:
 *                   type: string
 *                   example: Error interno del servidor
 *                 error:
 *                   type: string
 *                   example: Mensaje detallado del error
 */
router.get('/:usuarioId', obtenerUsuarioPorId);

module.exports = router;
