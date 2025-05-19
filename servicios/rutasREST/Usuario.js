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

router.get('/', getUsuarios);
router.post('/', agregarUsuario);
router.put('/:usuarioId', actualizarUsuario);
router.delete('/:usuarioId', eliminarUsuario);
router.put('/:usuarioId/contrasena', actualizarContrasena);
router.get('/perfil', validarJWT, obtenerPerfil);

module.exports = router;
