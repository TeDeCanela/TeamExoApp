const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const NotificacionSchema = new Schema({
    notificacionId: {
        type: Number,
        required: true,
        unique: true
    },
    usuarioId: {
        type: Number,
        required: true,
        index:true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['reaccion', 'comentario', 'seguimiento'] 
    },
    mensaje: {
        type: String,
        required: true
    },
    leida: { type: Boolean,
        default: false
    },
    fecha: { type: Date,
        default: Date.now }
});

module.exports = model('Notificacion', NotificacionSchema);