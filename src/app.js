const express = require('express');

const app = express();
app.use(express.json());

// Rutas
app.use('/api/usuarios', require('../servicios/rutasREST/Usuario'));
// app.use('/api/login', require('./rutas/login'));

module.exports = app;