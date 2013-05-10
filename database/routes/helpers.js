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
    db.collection(req.params.collection, { nm_titu:1 }, function(err, collection) {
        var options = {
                "limit": 10,
                "sort": {"nm_titu": 1}
            }

        collection.find({nm_titu: { $regex: req.params.w, $options: 'i' }},  options).toArray(function(err, item) {
            var send = {
                q: req.params.w,
                results:  item
            }
            
            res.send(send);
        });
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



