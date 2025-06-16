
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const ReaccionSchema = new Schema({
    reaccionId: {
        type: Number,
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

ReaccionSchema.plugin(AutoIncrement, { inc_field: 'reaccionId' });

module.exports = model('Reaccion', ReaccionSchema);