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

router.get('/buscar', buscarRecursos);
router.get('/:id', obtenerRecursoPorId);
router.get('/usuario/:usuarioId', obtenerRecursosPorUsuario);
router.get('/tipo/:tipo', obtenerRecursosPorTipo);
router.delete('/:id', eliminarRecurso);
router.put('/:id', actualizarRecurso);

module.exports = router;
