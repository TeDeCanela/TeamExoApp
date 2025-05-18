
const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ReaccionSchema = new Schema({
    reaccionId: {
        type: Number,
        required: true,
        unique: true
    },
    tipo: {
        type: String,
        enum: ['like', 'emoji', 'dislike'],
        required: true
    },
    publicacionId: {
        type: Number,
        required: true
    },
    usuarioId: { type: Number,
        required: true
    },
    fecha: { type: Date,
        default: Date.now }
});

module.exports = model('Reaccion', ReaccionSchema);