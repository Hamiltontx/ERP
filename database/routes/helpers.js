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

