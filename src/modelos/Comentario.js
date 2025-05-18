const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ComentarioSchema = new Schema({
    comentarioId: {
        type: Number,
        required: true,
        unique: true
    },
    publicacionId: {
        type: Number,
        required: true
    },
    usuarioId: {
        type: Number,
        required: true },
    texto: {
        type: String,
        required: true },
    fecha: {
        type: Date,
        default: Date.now }
});

module.exports = model('Comentario', ComentarioSchema);