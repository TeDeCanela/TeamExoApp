const express = require('express');
const router = express.Router();
const {
    crearReaccion,
    obtenerReaccionesPorPublicacion,
    actualizarReaccion,
    eliminarReaccion,
} = require('../../src/controladores/rest/Reaccion');

router.post('/', crearReaccion);
router.get('/publicacion/:id', obtenerReaccionesPorPublicacion);
router.put('/:reaccionId', actualizarReaccion);
router.delete('/:reaccionId', eliminarReaccion);

module.exports = router;
