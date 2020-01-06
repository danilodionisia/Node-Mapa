//mongodb+srv://danilo:<password>@cluster0-q4ydk.mongodb.net/test?retryWrites=true&w=majority

if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://danilo:ruth130178@cluster0-q4ydk.mongodb.net/test?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/mapaapp'}
}