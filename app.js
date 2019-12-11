//declaração das constantes do projeto
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const mongoose = require('mongoose')

require('./models/Turma')
require('./models/Tecnico')
require('./models/Sala')

const Sala = mongoose.model('salas')

//configuração do flash messages
app.use(session({
    secret: 'mapa',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})

//configuração do mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mapaapp').then(() => {
    console.log("connected to mongodb")
}).catch((err) => {
    console.log(err)
})

//configuração inicial body-parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//configuração inicial do handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

//configuraçaõ dos arquivos estáticos (bootstrap)
app.use(express.static(path.join(__dirname, "public")))

//configuração das rotas
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/add-turma', (req, res) => {
    res.render('forms/form-add-turma')
})

app.post('/add-turma-db', (req, res) => {

    var erros = []

    if(!req.body.turma || typeof req.body.turma == undefined || req.body.turma == null){
        erros.push({texto: 'Turma inválida!'})
    }

    if(!req.body.oferta || typeof req.body.oferta == undefined || req.body.oferta == null){
        erros.push({texto: 'Turma inválida!'})
    }

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == 'Escolher...' || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'})
    }

    if(erros.length > 0){
        res.render('forms/form-add-turma', {erros: erros})
    }
    else{
        req.flash('success_msg', 'Turma cadastrada com sucesso!')
        res.redirect('/add-turma')
    }

})

app.get('/add-sala', (req, res) => {
    
    res.render('forms/form-add-sala')
})

app.post('/add-sala-db', (req, res) => {

    var erros = []

    if(!req.body.sala || typeof req.body.sala == undefined || req.body.sala == null){
        erros.push({texto: 'Sala inválida!'})
    }

    if(!req.body.capacidade || typeof req.body.capacidade == undefined || req.body.capacidade == null){
        erros.push({texto: 'Capacidade inválida!'})
    }

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == 'Escolher...' || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'})
    }

    if(erros.length > 0){
        res.render('forms/form-add-sala', {erros: erros})
    }
    else{
        req.flash('success_msg', 'Sala cadastrada com sucesso!')
        res.redirect('/add-sala')
    }

})

app.get('/add-tecnico', (req, res) => {
    res.render('forms/form-add-tecnico')
})

app.post('/add-tecnico-db', (req, res) => {

    var erros = []

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'})
    }

    if(erros.length > 0){
        res.render('forms/form-add-tecnico', {erros: erros})
    }else{
        req.flash('success_msg', 'Técnica(o) cadastrada(o) com sucesso!')
        res.redirect('/add-tecnico')
    }

})

app.get('/list-turma', (req, res) => {
    res.render('lists/list-turma')
})

app.get('/list-sala', (req, res) => {
    res.render('lists/list-sala')
})

app.get('/list-tecnico', (req, res) => {
    res.render('lists/list-tecnico')
})



//configuração doservidor
app.listen(8080, () => {
    console.log('Server running on port 8080')
})