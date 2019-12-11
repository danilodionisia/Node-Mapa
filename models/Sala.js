const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Sala = new Schema({
    sala: {
        type: String,
        required: true
    },
    capacidade: {
        type: String,
        required: true
    },
    tecnico: {
        type: Schema.Types.ObjectId,
        ref: 'tecnicos',
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('salas', Sala)