var mongo = require('mongodb')
    _ = require('./underscore');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('jooxFestanca', server, {safe:true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("Helper conectado");
    }
});

exports.findRel = function(req, res) {
    db.collection(req.params.collection, { nm_titu:1 }, function(err, collection) {
        collection.find({}, { nm_titu:1 }).toArray(function(err, item) {
            res.send(item);
        });
    });
};

exports.findW = function(req, res) {

    var resp = function(collection) {
        var options = {
                "limit": 10,
                "sort": {"nm_titu": 1}
            }
        collection.find({nm_titu: { $regex: req.params.w, $options: 'i' }}, options).toArray(function(err, item) {
            var send = {
                q: req.params.w,
                results:  item
            }
            
            res.send(send);
        });

    }

    var resp_cli = function(collection) {
        var options = {
                "limit": 10,
                "sort": {"nm_titu": 1}
            }
            var search = {};
            search.$or = [];
            search.$or.push({"nm_titu":{ $regex: req.params.w, $options: 'i' }});
            search.$or.push({"cli_cnpj":{ $regex: req.params.w, $options: 'i' }});

        collection.find(search, {"nm_titu": 1, "cli_cnpj": 1}, options).toArray(function(err, item) {

            _.each(item, function(el,ix) {
                
                el.nm_titu += " - " + el.cli_cnpj;
                delete el.cli_cnpj;

            }); 

            var send = {
                q: req.params.w,
                results:  item
            }
            
            res.send(send);
        });

    }

    db.collection(req.params.collection, { nm_titu:1 }, function(err, collection) {
        
        if (req.params.collection === "clientes") {
            resp_cli(collection);
            return;
        }

        resp(collection);
        
    });


};



exports.findMun = function(req, res) {
    db.collection("nfMunicipios", function(err, collection) {
        var options = {
                "sort": {"Nome_Municipio": 1}
            }
        
        collection.find({ "UF" : req.params.w*1 },  { "Municipio": 1, "Nome_Municipio": 1 }, options).toArray(function(err, item) {

            var mel = [];
            _.each(item, function(el,ix) {
                delete el._id;
                if (ix > 0) {
                    if (el.Municipio !== item[ix-1].Municipio) { mel.push(el) }
                }else{
                    mel.push(el)
                }
            });
            
            var send = {
                q: req.params.w,
                results:  mel
            }
            
            res.send(send);
        });

    });
};







exports.Sum = function(req, res) {

    db.collection("vendas", function(err, collection) {

        collection.find({ 'dt_nf_emitida': '' }).toArray(function(err, item) {

            var send = {
                    ped_sep: item.length
                };
            
            res.send(send);
        })
    })
};


