const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Tecnico = new Schema({
    tecnico: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('tecnicos', Tecnico)