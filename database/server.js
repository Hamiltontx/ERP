var express = require('express'),
    cad = require('./routes/cadastros'),
    hlp = require('./routes/helpers');
 
var app = express();
 
app.configure(function () {
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

// ## CORS middleware
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);

});

//Helpers
app.get('/:collection/rel', hlp.findRel); //D

//GCRUD Cadastros
app.get('/:collection/grid', cad.findGrid); //G
app.post('/:collection', cad.addCad); //C
app.delete('/:collection/:id', cad.deleteCad); //R
app.put('/:collection/:id', cad.updateCad); //U
app.get('/:collection/:id', cad.findById); //D



app.listen(3500);

console.log('Porta 3500...');