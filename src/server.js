const mongoose = require('mongoose');
const app = require('./app');
const { MONGO_URI, PORT } = require('./config');

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Conectado a MongoDB');
        app.listen(PORT || 3000, '0.0.0.0',() => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar a MongoDB:', err);
    });