module.exports = {

    eAdmin: function(req, res, next){

        if(req.isAuthenticated()){
            return next();
        }

        req.flash('error_msg', 'Faça login para ter acesso');
        res.redirect('/');

    }

}