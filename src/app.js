const express = require('express');
const path = require('path');
const { swaggerUi, swaggerSpec } = require('./helpers/swagger');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/usuarios', require('../servicios/rutasREST/Usuario'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/recursos', require('../servicios/rutasREST/Recurso'));
app.use('/api/reacciones', require('../servicios/rutasREST/Reaccion'));
app.use('/api/comentarios', require('../servicios/rutasREST/Comentario'));


app.use('/api/publicaciones', require('../servicios/rutasREST/Publicacion'));
app.use('/api/notificaciones', require('../servicios/rutasREST/Notificacion'));
app.use('/api/estadisticas', require('../servicios/rutasREST/Estadistica'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/api/login', require('./rutas/login'));
module.exports = app;