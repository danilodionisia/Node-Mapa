const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Turma = new Schema({
    turma:{
        type: String,
        required: true
    },
    oferta: {
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

mongoose.model('turmas', Turma)

