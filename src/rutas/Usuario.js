const express = require('express');
const router = express.Router();
const {
    getUsuarios,
    agregarUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../controladores/Usuario');

router.get('/', getUsuarios);
router.post('/', agregarUsuario);
router.put('/:usuarioId', actualizarUsuario);
router.delete('/:usuarioId', eliminarUsuario);

module.exports = router;
