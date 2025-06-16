const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ComentarioSchema = new Schema({
    comentarioId: {
        type: Number,
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

ComentarioSchema.plugin(AutoIncrement, { inc_field: 'comentarioId' });

module.exports = model('Comentario', ComentarioSchema);