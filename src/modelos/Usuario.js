const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const UsuarioSchema = Schema({
    usuarioId: {
        type: Number,
        unique: true
    },
    nombreUsuario: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    contrasena: {
        type: String
    },
    rol: {
        type: String,
        required: true,
        enum: ['Administrador', 'Fan', 'Moderador'],
        default: 'Moderador'
    }
});

UsuarioSchema.plugin(AutoIncrement, { inc_field: 'usuarioId' });

module.exports = model('Usuario', UsuarioSchema);
