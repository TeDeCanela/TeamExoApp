const express = require('express');
const router = express.Router();
const {
    crearComentario,
    obtenerComentariosPorPublicacion,
    actualizarComentario,
    eliminarComentario
} = require('../../src/controladores/rest/Comentario');

router.post('/', crearComentario);
router.get('/publicacion/:id', obtenerComentariosPorPublicacion);
router.put('/:comentarioId', actualizarComentario);
router.delete('/:comentarioId', eliminarComentario);

module.exports = router;
