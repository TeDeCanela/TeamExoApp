const express = require('express');
const router = express.Router();
const estadisticasController = require('../../src/controladores/rest/Estadistica');

router.get('/estadistica', estadisticasController.obtenerEstadisticasREST);

module.exports = router;