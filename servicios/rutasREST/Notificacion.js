const express = require('express');
const router = express.Router();
const {
    obtenerNotificacionesUsuario,
    marcarComoLeida,
    marcarMultiplesComoLeidas,
    eliminarNotificacion
} = require('../../src/controladores/rest/Notificaciones');



router.get('/usuario/:usuarioId', obtenerNotificacionesUsuario);
router.patch('/:id/marcar-leida', marcarComoLeida);
router.patch('/marcar-leidas', marcarMultiplesComoLeidas);
router.delete('/:id', eliminarNotificacion);

module.exports = router;