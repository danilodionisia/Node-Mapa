const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Mapa = new Schema({
    sala: {
        type: Schema.Types.ObjectId,
        ref: 'salas',
        required: true
    },
    tecnico: {
        type: Schema.Types.ObjectId,
        ref: 'tecnicos',
        required: true
    },
    turma: {
        type: Schema.Types.ObjectId,
        ref: 'turmas',
        required: true
    },
    periodo: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    }
})

mongoose.model('mapas', Mapa)