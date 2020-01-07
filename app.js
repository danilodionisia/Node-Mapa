//declaração das constantes do projeto
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const mongoose = require('mongoose');
const moment = require('moment');
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)

require('./models/Turma');
require('./models/Tecnico');
require('./models/Sala');
require('./models/Mapa');

const db = require('./config/db')

const Sala = mongoose.model('salas');
const Tecnico = mongoose.model('tecnicos');
const Turma = mongoose.model('turmas');
const Mapa = mongoose.model('mapas');

const {eAdmin} = require('./helpers/eAdmin');


//configuração do flash messages
app.use(session({
    secret: 'mapa',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//configuração do mongodb
mongoose.Promise = global.Promise;
//mongoose.connect(db.mongoURI).then(() => {
mongoose.connect('mongodb+srv://danilo:ruth130178@cluster0-q4ydk.mongodb.net/test?retryWrites=true&w=majority').then(() => {
    console.log("connected to mongodb");
}).catch((err) => {
    console.log(err);
})

//configuração inicial body-parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//configuração inicial do handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


//configuraçaõ dos arquivos estáticos (bootstrap)
app.use(express.static(path.join(__dirname, "public")));

//configuração das rotas
app.get('/', (req, res) => {
   
    let now = moment();

    var dataSys = now.format('DD/MM/YYYY');
    var dataSearch = now.format('YYYY-MM-DD');

    var inf = [{path: 'tecnico', select: 'tecnico'}, {path: 'turma', select: 'turma'}, {path: 'sala', select: 'sala'}];

    //Mapa.find({ $and: [{data: {$eq: dataSearch}}, {periodo: {$eq: 'Manhã'}}] }).populate(inf).sort({data: 'DESC', periodo: 'ASC'}).then((mapas) => {
    Mapa.find({ $and: [ { data: dataSearch}, { periodo:'Manhã'}] } ).populate(inf).sort({sala: 'ASC'}).then((mapaManha) => {
    
        Mapa.find({ $and: [ { data: dataSearch}, { periodo:'Tarde'}] } ).populate(inf).sort({sala: 'ASC'}).then((mapaTarde) => {
    
            Mapa.find({ $and: [ { data: dataSearch}, { periodo:'Noite'}] } ).populate(inf).sort({sala: 'ASC'}).then((mapaNoite) => {
    
                res.render('index', {mapaManha: mapaManha, mapaTarde: mapaTarde, mapaNoite: mapaNoite,dataSys: dataSys});
        
            }).catch((err) => {
        
               req.flash('error_msg', 'Erro ao carregar o mapa!');
               res.redirect('/');
        
            });
    
        }).catch((err) => {
    
           req.flash('error_msg', 'Erro ao carregar o mapa!');
           res.redirect('/');
    
        });

    }).catch((err) => {

       req.flash('error_msg', 'Erro ao carregar o mapa!');
       res.redirect('/');

    });
    
});

app.get('/add-turma', eAdmin, (req, res) => {
    
    Tecnico.find().sort({tecnico: 'ASC'}).then((tecnico) => {        

        res.render('forms/form-add-turma', {tecnico: tecnico});

    }).catch(() => {
        req.flash('error_msg', 'Erro ao carregar os técnicos');
        res.redirect('/');
    });

    
});

app.post('/add-turma-db', eAdmin, (req, res) => {

    var erros = [];

    if(!req.body.turma || typeof req.body.turma == undefined || req.body.turma == null){
        erros.push({texto: 'Turma inválida!'});
    }

    if(!req.body.oferta || typeof req.body.oferta == undefined || req.body.oferta == null){
        erros.push({texto: 'Turma inválida!'});
    }

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == 0 || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'});
    }

    if(erros.length > 0){

        Tecnico.find().sort({tecnico: 'ASC'}).then((tecnico) => {
            res.render('forms/form-add-turma', {erros: erros, tecnico: tecnico});
        });
    }
    else{

        const novaTurma = {
            turma: req.body.turma,
            oferta: req.body.oferta,
            tecnico: req.body.tecnico
        }

        
        new Turma(novaTurma).save().then(() => {
           
            req.flash('success_msg', 'Turma cadastrada com sucesso!');
            res.redirect('/add-turma');
           
        }).catch((err) => {

            req.flash('error_msg', 'Erro ao salvar a turma');
            res.redirect('/add-turma');
        });
        
        
    }

});

app.get('/add-sala', eAdmin, (req, res) => {
    
    Tecnico.find().sort({tecnico: 'ASC'}).then((tecnico) => {
        res.render('forms/form-add-sala', {tecnico: tecnico});
    });    
});

app.post('/add-sala-db', (req, res) => {

    var erros = [];

    if(!req.body.sala || typeof req.body.sala == undefined || req.body.sala == null){
        erros.push({texto: 'Sala inválida!'});
    }

    if(!req.body.capacidade || typeof req.body.capacidade == undefined || req.body.capacidade == null || req.body.capacidade < 1 || req.body.capacidade > 100){
        erros.push({texto: 'Capacidade inválida!'});
    }

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == 'Escolher...' || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'});
    }

    if(erros.length > 0){       
        
        Tecnico.find().sort({tecnico: 'ASC'}).then((tecnico) => {
            res.render('forms/form-add-sala', {tecnico: tecnico, erros: erros});
        });
        
    }
    else{

        const novaSala = {
            sala: req.body.sala,
            capacidade: req.body.capacidade,
            tecnico: req.body.tecnico
        }
        
        new Sala(novaSala).save().then(() => {
            req.flash('success_msg', 'Sala cadastrada com sucesso!');
            res.redirect('/add-sala');
           
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao cadastrar a sala!');
            res.redirect('/add-sala');
        });
    }

});


app.get('/add-tecnico', eAdmin, (req, res) => {    
    res.render('forms/form-add-tecnico');
});


app.post('/add-tecnico-db', (req, res) => {

    var erros = [];

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == null){
        erros.push({texto: 'Técnica(o) inválida(o)!'});
    }

    if(erros.length > 0){        
        res.render('forms/form-add-tecnico', {erros: erros});
    }else{

        const novoTecnico = {
            tecnico: req.body.tecnico
        }

        new Tecnico(novoTecnico).save().then(() => {
            req.flash('success_msg', 'Técnica(o) cadastrada(o) com sucesso!');
            res.redirect('/add-tecnico');
        }).catch(() => {
            req.flash('error_msg', 'Erro ao inserir Técnica(o)!');
            res.redirect('/add-tecnico');
        });
        
    }

});

app.get('/list-turma', eAdmin, (req, res) => {
    
    Turma.find().populate('tecnico').sort({turma: 'ASC'}).then((turmas) => {
        res.render('lists/list-turma', {turmas: turmas});
    });
});

app.get('/list-sala', eAdmin, (req, res) => {
    
    Sala.find().populate('tecnico').sort({sala: 'ASC'}).then((salas) => {
        res.render('lists/list-sala', {salas: salas});
    });
    
});

app.get('/list-tecnico', eAdmin, (req, res) => {

    Tecnico.find().sort({tecnico: 'ASC'}).then((tecnicos) => {

        res.render('lists/list-tecnico', {tecnicos: tecnicos});

    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar técnicos');
    });
    
});



app.post('/rem-tecnico-db', (req, res) => {

    Tecnico.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Técnico removido com sucesso!');
        res.redirect('/list-tecnico');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao remover o técnico');
    });
});

app.post('/rem-sala-db', (req, res) => {

    Sala.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Sala removida com sucesso!');
        res.redirect('/list-sala');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao remover a sala');
    });
});

app.post('/rem-turma-db', (req, res) => {

    Turma.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Turma removida com sucesso!');
        res.redirect('/list-sala');
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao remover a turma');
    });
});





app.get('/list-mapa', (req, res) => {

    /*
    
     Turma.find().populate('tecnico').sort({turma: 'ASC'}).then((turmas) => {
        res.render('lists/list-turma', {turmas: turmas});
    });
    
    */
    var inf = [{path: 'tecnico', select: 'tecnico'}, {path: 'turma', select: 'turma'}, {path: 'sala', select: 'sala'}];
    Mapa.find().populate(inf).sort({data: 'DESC'}).then((mapas) => {

        res.render('lists/list-mapa', {mapas: mapas});

    }).catch((err) => {

        req.flash('error_msg', 'Erro ao carregar o mapa!');
        res.redirect('/');

    })
    
})

app.get('/add-mapa', eAdmin, (req, res) => {
    
    Sala.find().sort({sala: 'ASC'}).then((salas) => {  
        
        Tecnico.find().sort({tecnico: 'ASC'}).then((tecnicos) => {

            Turma.find().sort({turma: 'ASC'}).then((turmas) => {
                res.render('forms/form-add-mapa', {salas: salas, tecnicos: tecnicos, turmas: turmas});
            });
            
        });
        
    });
    
});


app.post('/add-mapa-db', (req, res) => {

    var erros = [];

    if(!req.body.data || typeof req.body.data == undefined || req.body.data == null){
        erros.push({texto: 'Data inválida!'});
    }

    if(!req.body.sala || typeof req.body.sala == undefined || req.body.sala == null || req.body.sala == 0){
        erros.push({texto: 'Sala inválida'});
    }

    if(!req.body.turma || typeof req.body.turma == undefined || req.body.turma == null || req.body.turma == 0){
        erros.push({texto: 'Turma inválida'});
    }

    if(!req.body.tecnico || typeof req.body.tecnico == undefined || req.body.tecnico == null || req.body.tecnico == 0){
        erros.push({texto: 'Técnico inválida'});
    }

    if(!req.body.periodo || typeof req.body.periodo == undefined || req.body.periodo == null){
        erros.push({texto: 'Período inválido!'});
    }
    

    if(erros.length > 0){
        res.render('forms/form-add-mapa', {erros: erros});
    }else{
        
       
        //var inf = [{path: 'tecnico', select: 'tecnico'}, {path: 'turma', select: 'turma'}, {path: 'sala', select: 'sala'}];    

        Mapa.find({ 
                
                $and: [
                    {data: { $eq: req.body.data}}, 
                    {sala: {$eq: req.body.sala}}, 
                    {periodo: {$eq: req.body.periodo}}
                ]
            
            }).then((mapas) => {
            
                console.log(mapas + ' - ' + mapas.length);

                if(mapas.length == 1){
                    req.flash('error_msg','Período já agendado!');
                    res.redirect('/add-mapa'); 
                }else if(mapas.length == 0){

                    const novoMapa = {

                        sala: req.body.sala,
                        tecnico: req.body.tecnico,
                        turma: req.body.turma,
                        periodo: req.body.periodo,
                        data: req.body.data

                    }
            
                    new Mapa(novoMapa).save().then(() => {
                        req.flash('success_msg', 'Adiocionado ao mapa de sala com sucesso!');
                        res.redirect('/add-mapa');
                    }).catch((err) => {
                        req.flash('error_msg', 'Erro ao adicionar no mapa de sala!');
                        res.redirect('/add-mapa');
                    });

                    req.flash('success_msg','Registro salvo no mapa!');
                    res.redirect('/add-mapa'); 
                }
            
        }).catch((err) => {
            console.log(err);
        });
           
    };

});

app.get('/edit-mapa', (req, res) => {
    res.render('forms/form-edit-mapa');
});


app.get('/remove-mapa-db/:id', (req, res) => {

    Mapa.remove({_id: req.params.id}).then(() => {

        req.flash('success_msg', 'Registro removido com sucesso!');
        res.redirect('/show-mapas');

    }).catch((err) => {

        req.flash('error_msg', 'Falha ao remover sucesso!');
        res.redirect('/show-mapas');

    })

    

});


app.get('/form-cons-mapa', (req, res) => {
    res.render('forms/form-cons-mapa')
})

app.get('/usuarios/form-cons-mapa', (req, res) => {
    res.render('forms/form-cons-mapa')
})



app.post('/search-mapa-data', (req, res) => {

    var erros = [];

    if(!req.body.dataInicial || typeof req.body.dataInicial == undefined || req.body.dataInicial == null){
        erros.push({texto: 'Data inicial inválida!'})
    }

    if(!req.body.dataFinal || typeof req.body.dataFinal == undefined || req.body.dataFinal == null){
        erros.push({texto: 'Data final inválida!'})
    }

    if(erros.length > 0){
        res.render('forms/form-cons-mapa', {erros: erros})
    }else{

        var inf = [{path: 'tecnico', select: 'tecnico'}, {path: 'turma', select: 'turma'}, {path: 'sala', select: 'sala'}];

        //Mapa.find({data: {$eq: dataSearch}}).populate(inf).sort({data: 'DESC'}).then((mapas)
        Mapa.find({ $and: [ { data: {$gte: req.body.dataInicial}}, {data: {$lte: req.body.dataFinal}} ] }).populate(inf).sort({data: 'DESC'}).then((mapas) => {            
            
            res.render('lists/list-mapa-by-data', {mapas: mapas});
            
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao pesquisar as datas inseridas!' + err);
            res.redirect('/form-cons-mapa')
        })

    }

});


app.get('/show-mapas', (req, res) => {

    let now = moment();

    var dataSys = now.format('DD/MM/YYYY');
    var dataSearch = now.format('YYYY-MM-DD');

    var inf = [{path: 'tecnico', select: 'tecnico'}, {path: 'turma', select: 'turma'}, {path: 'sala', select: 'sala'}];

    Mapa.find({data: {$eq: dataSearch}}).populate(inf).sort({data: 'DESC'}).then((mapas) => {

       res.render('forms/form-edit-mapa', {mapas: mapas, dataSys: dataSys});

    }).catch((err) => {

       req.flash('error_msg', 'Erro ao carregar o mapa!');
       res.redirect('/');

    });

});


app.use('/usuarios', usuarios);

//configuração doservidor
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log('Server running on port 8080');
});


