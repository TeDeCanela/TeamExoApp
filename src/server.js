// server.js
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { MONGO_URI } = require('./config'); // ajusta según tu estructura

const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
    });
