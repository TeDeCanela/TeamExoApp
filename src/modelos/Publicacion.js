const mongoose = require('mongoose');
const { Schema, model } = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const PublicacionSchema = Schema({
    identificador: {
        type: Number,
        required: true,
        unique: true
    },
    titulo: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true,
        enum: ['Publicado', 'Borrador', 'Eliminado'],
        default: 'Borrador'
    },
    contenido: {
        type: String,
        required: true
    },
    usuarioId: {
        type: Number,
        required: true
    },
    fechaCreacion: {
        type: Date,
        required: true
    }
});

PublicacionSchema.plugin(AutoIncrement, { inc_field: 'identificador' });

module.exports = model('Publicacion', PublicacionSchema);
