const express = require('express');
const router = express.Router();
const{
    crearPublicacion,
    eliminarPublicacionModerador,
    buscarPublicaciones
} = require('../../src/controladores/rest/Publicacion');

router.post('/', crearPublicacion);
router.delete('/:identificador', eliminarPublicacionModerador);
router.get('/', buscarPublicaciones);
module.exports = router;