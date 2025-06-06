const { response } = require('express');
const bcrypt = require('bcrypt');
const logger = require('../helpers/logger');
const Usuario = require('../modelos/Usuario');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener la lista de todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *       500:
 *         description: Error del servidor
 */
const getUsuarios = async (req, res = response) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        logger.error(`Error al obtener usuarios: ${error.message}`);
        res.status(500).json({ msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador' });
    }
};

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Registrar un nuevo usuario
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
const agregarUsuario = async (req, res = response) => {
    const { nombreUsuario, nombre, apellidos, correo, contrasena, rol } = req.body;
    if (await emailExist(correo)) {
        return res.status(400).json({ msg: 'El correo ya está registrado' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = new Usuario({
            nombreUsuario,
            nombre,
            apellidos,
            correo,
            contrasena: hashedPassword,
            rol
        });

        await nuevoUsuario.save();
        res.json({
            msg: `El usuario ${nombre} ha sido creado`,
            usuario: nuevoUsuario
        });
    } catch (error) {
        logger.error(`Error al agregar usuarios: ${error.message}`);
        res.status(500).json({ msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador' });
    }
};

async function emailExist(email) {
    try {
        const existe = await Usuario.findOne({ correo: email });
        return !!existe;
    } catch (error) {
        logger.error('Error al verificar el correo:', error);
        throw new Error('Error interno del servidor');
    }
}

/**
 * @swagger
 * /api/usuarios/{usuarioId}:
 *   put:
 *     summary: Actualizar la información de un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
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
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: El correo ya está registrado a otro usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const actualizarUsuario = async (req, res = response) => {
    const { usuarioId } = req.params;
    const { nombreUsuario, nombre, apellidos, correo, rol } = req.body;

    if (await emailExistExceptUserId(correo, usuarioId)) {
        return res.status(400).json({ msg: 'El correo ya está registrado a otro usuario' });
    }

    try {
        const updatedUsuario = await Usuario.findOneAndUpdate(
            { usuarioId: parseInt(usuarioId) },
            { nombreUsuario, nombre, apellidos, correo, rol },
            { new: true }
        );

        if (!updatedUsuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({
            msg: `El usuario ${usuarioId} ha sido actualizado`,
            usuario: updatedUsuario
        });
    } catch (error) {
        logger.error(`Error al actualizar usuarios: ${error.message}`);
        res.status(500).json({ msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador' });
    }
};

async function emailExistExceptUserId(email, usuarioId) {
    try {
        const existe = await Usuario.findOne({
            correo: email,
            usuarioId: { $ne: usuarioId }
        });

        return !!existe;
    } catch (error) {
        throw new Error('Error interno del servidor');
    }
}

/**
 * @swagger
 * /api/usuarios/{usuarioId}/contrasena:
 *   patch:
 *     summary: Actualizar la contraseña de un usuario
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
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: La contraseña está vacía
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const actualizarContrasena = async (req, res = response) => {
    const { usuarioId } = req.params;
    const { nuevaContrasena } = req.body;

    if (!nuevaContrasena || nuevaContrasena.trim() === '') {
        return res.status(400).json({ msg: 'La contraseña no puede estar vacía' });
    }

    try {
        const existe = await Usuario.findOne({ usuarioId: parseInt(usuarioId) });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(nuevaContrasena, salt);

        const updated = await Usuario.findOneAndUpdate(
            { usuarioId: parseInt(usuarioId) },
            { contrasena: hashedPassword },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({ msg: 'Contraseña actualizada correctamente' });
    } catch (error) {
        logger.error(`Error al actualizar contraseña: ${error.message}`);
        res.status(500).json({ msg: 'Error interno del servidor al cambiar la contraseña' });
    }
}

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
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
const eliminarUsuario = async (req, res = response) => {
    const { usuarioId } = req.params;
    if (!usuarioId) {
        return res.status(400).json({ msg: 'Nombre de usuario no válido' });
    }
    try {
        const deletedUsuario = await Usuario.findOneAndDelete({ usuarioId: parseInt(usuarioId) });
        if (!deletedUsuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.status(200).json({
            msg: `El usuario con id de usuario ${usuarioId} ha sido eliminado`,
            usuario: deletedUsuario
        });
    } catch (error) {
        logger.error(`Error al eliminar usuarios: ${error.message}`);
        res.status(500).json({ msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador' });
    }
};

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
const obtenerPerfil = async (req, res = response) => {
    const { id } = req.usuario;

    try {
        const usuario = await Usuario.findOne({ usuarioId: id }).select('-contrasena');

        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        res.json({
            msg: 'Perfil obtenido correctamente',
            usuario
        });
    } catch (error) {
        logger.error(`Error al obtener perfil: ${error.message}`);
        res.status(500).json({ msg: 'Error en el servidor al obtener el perfil' });
    }
};

module.exports = {
    getUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarContrasena,
    obtenerPerfil
};
