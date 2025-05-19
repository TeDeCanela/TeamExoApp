const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const RecursoSchema = new Schema({
        identificador: {
            type: Number,
            required: true,
            unique: true
        },
        formato: {
            type: Number,
            required: true
        },
        tamano: {
            type: Number,
            required: true
        },
        URL: {
            type: String,
            required: true
        },
        usuarioId: {
            type: Number,
            required: true
        }
    },
    { discriminatorKey: 'tipo', collection: 'recursos' });

const Recurso = model('Recurso', RecursoSchema);

const Foto = Recurso.discriminator('Foto', new Schema({
    resolucion: {
        type: Number,
        required: true
    }
}));

const Video = Recurso.discriminator('Video', new Schema({
    resolucion: {
        type: Number,
        required: true
    }
}));

const Audio = Recurso.discriminator('Audio', new Schema({
    duracion: {
        type: Number,
        required: true
    }
}));

module.exports = { Recurso, Foto, Video, Audio };
