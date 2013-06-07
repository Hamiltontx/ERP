var express = require('express'),
    cad = require('./routes/cadastros'),
    hlp = require('./routes/helpers');
    cst = require('./routes/custom');
 
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

//Fix routes
app.get('/vendas/grid', cst.vendasfindGrid); //G
app.get('/vendas/print', cst.vendasPrint); //D

app.get('/vendas/:id', cst.vendasfindById); //V
app.get('/nf/:id', cst.NFById); //I

//Helpers
app.get('/:collection/rel', hlp.findRel); //Relacao
app.get('/:collection/find/:w', hlp.findW); //Autocomplete
app.get('/mun/:w', hlp.findMun); //Municipios
app.get('/hlp/sum.j', hlp.Sum); //Somarizador


//GCRUD Cadastros
app.get('/:collection/grid', cad.findGrid); //G
app.get('/:collection/print', cad.printAll); //P
app.post('/:collection', cad.addCad); //C
app.delete('/:collection/:id', cad.deleteCad); //R
app.put('/:collection/:id', cad.updateCad); //U
app.get('/:collection/:id', cad.findById); //D



app.listen(3500);

console.log('Porta 3500...');