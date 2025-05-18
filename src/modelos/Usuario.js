const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const UsuarioSchema = Schema({
    usuarioId: {
        type: Number,
        required: true,
        unique: true
    },
    nombreUsuario: {
        type: Number,
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
        type: Number
    },
    rol: {
        type: String,
        required: true,
        enum: ['Administrador', 'Fan', 'Moderador'],
        default: 'Moderador'
    }
});

UsuarioSchema.plugin(AutoIncrement, { inc_field: 'identificador' });

module.exports = model('Usuario', UsuarioSchema);
