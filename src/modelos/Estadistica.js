const mongoose = require('mongoose');

const EstadisticaSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['top_likes', 'top_comentarios'],
        required: true
    },
    publicacionId: {
        type: Number,
        required: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Estadistica', EstadisticaSchema);