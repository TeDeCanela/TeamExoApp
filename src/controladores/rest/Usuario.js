const { response } = require('express');
const logger = require('../../helpers/logger');
const Usuario = require('../../modelos/Usuario');

const getUsuarios = async (req, res = response) => {
    try {
        const usuarios = await Usuario.find();
        res.json(usuarios);
    } catch (error) {
        logger.error(`Error al obtener usuarios: ${error.message}`);
        res.status(500).json({ msg: 'Ha habido un error en el servidor, porfavor intente más tarde o contacte con el administrador' });
    }
};

const agregarUsuario = async (req, res = response) => {
    const { nombreUsuario, nombre, apellidos, correo, contrasena, rol } = req.body;
    try {
        const nuevoUsuario = new Usuario({ nombreUsuario, nombre, apellidos, correo, contrasena, rol });
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

const actualizarUsuario = async (req, res = response) => {
    const { usuarioId } = req.params;
    const { nombreUsuario, nombre, apellidos, correo, contrasena, rol } = req.body;
    try {
        const updatedUsuario = await Usuario.findOneAndUpdate(
            { usuarioId: parseInt(usuarioId) },
            { nombreUsuario, nombre, apellidos, correo, contrasena, rol },
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

module.exports = { getUsuarios, agregarUsuario, actualizarUsuario, eliminarUsuario };
