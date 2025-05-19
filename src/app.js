const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

app.use('/api/usuarios', require('../servicios/rutasREST/Usuario'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/login', require('./rutas/login'));

module.exports = app;