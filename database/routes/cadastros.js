var mongo = require('mongodb')
    _ = require('./underscore');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true} );
db = new Db('jooxFestanca', server, {safe:true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("jooxFestanca conectado");
    }
});

exports.findGrid = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var iDisplayStart = (req.query.iDisplayStart*1);
    var qt_rowcount = (req.query.iDisplayLength*1);
    var search = {}, obj = {};

    if (req.query.sSearch !== "") { 
        var bSearch = eval ("(" + req.query.sSearch + ")");

        search.$or = [];

        _.each(bSearch, function(v, k) {
            var obj = {};
            
            obj[k] = { $regex: v, $options: 'i' }

            search.$or.push(obj);

            // console.log(obj)

            // search.$or.push({"nm_titu":{ $regex: req.params.w, $options: 'i' }});

            // { $regex: req.params.w, $options: 'i' }

        });



    }

    var x = function(els,callback) {
        var total = els.length, count = 0;
        if (total === 0) 
                callback();

        _.each(els,function(el,ix){
            var keyx = el["key"], nodex = el["el"];

            db.collection(keyx.replace('_id', ''), function(err, col) { 
                col.findOne({'_id':new BSON.ObjectID(nodex[keyx])}, function(err, it) {
                    if (it !== null){
                        nodex[keyx] = it.nm_titu;
                    }else{
                        nodex[keyx] = "Relacao removida"
                    }
                    count ++;
                    if(count == total){
                        if(callback)
                            callback();
                    }
                });
            }); 
        });
    }

    db.collection(req.params.collection, function(err, collection) {
        var total = 0;
        collection.find(search).count(function(err, count) {
            total = count
            var options = {
                "limit": qt_rowcount,
                "skip": iDisplayStart,
                "sort": {"_id": 1}
            }

            var mycursor = {};

            if (req.params.collection === 'produtos') {

                mycursor = collection.find(search, {id_prod:1, nm_titu:1, qt_prod:1, vl_prod:1 }, options);

            }else{

                mycursor = collection.find(search, options);

            }
             

                
            mycursor.toArray(function(err, items) {

                var els = [];

                _.each(items, function(el, ix) {

                    _.map(el, function(num,key){ 
                        if (key.indexOf('_id') > 4) {
                            els.push({key:key,id:num,el:el});
                        }
                    });

                });

                x.call(items,els,function(){

                    _.each(items, function(el, ix) {
                        var _id = el._id;
                        delete el._id;
                        delete el._name;

                        items[ix]  = _.values(el);
                        items[ix].push(_.keys(el));
                        items[ix].push(_id);

                    });

                    obj = {
                        aaData: items,
                        iTotalDisplayRecords: total,
                        iTotalRecords: total,
                        sEcho: (req.query.sEcho*1)+1
                    }
                    res.send(obj);
                })
            });            
        });
    });
};


exports.printAll = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var iDisplayStart = (req.query.iDisplayStart*1);
    var qt_rowcount = (req.query.iDisplayLength*1);
    var search = {}, obj = {};
    var x = function(els,callback) {
        var total = els.length, count = 0;
        if (total === 0) 
                callback();

        _.each(els,function(el,ix){
            var keyx = el["key"], nodex = el["el"];

            db.collection(keyx.replace('_id', ''), function(err, col) { 
                col.findOne({'_id':new BSON.ObjectID(nodex[keyx])}, function(err, it) {
                    if (it !== null){
                        nodex[keyx] = it.nm_titu;
                    }else{
                        nodex[keyx] = "Relacao removida"
                    }
                    count ++;
                    if(count == total){
                        if(callback)
                            callback();
                    }
                });
            }); 
        });
    }

    db.collection(req.params.collection, function(err, collection) {
        var total = 0;
        collection.find(search).count(function(err, count) {
            total = count
            var options = {
                "limit": qt_rowcount,
                "skip": iDisplayStart,
                "sort": {"_id": 1}
            }


            var mycursor = collection.find(search, options);

                
            mycursor.toArray(function(err, items) {

                var els = [];

                _.each(items, function(el, ix) {

                    _.map(el, function(num,key){ 
                        if (key.indexOf('_id') > 4) {
                            els.push({key:key,id:num,el:el});
                        }
                    });

                });

                x.call(items,els,function(){

                    var html = "<html><body><table>";

                    _.each(items, function(el, ix) {

                        if (ix == 0){
                            html += "<tr bgcolor=yellow>";
                            _.each(el,function(mu,key) {
                                if (key !== "_id"){
                                    html += "<td>" + key + " </td>";
                                }
                            });
                            html += "</tr>";
                        }

                        html += "<tr>";
                        _.each(el,function(mu,key) {
                            if (key !== "_id"){
                                html += "<td>" + mu + " </td>";
                            }
                        });
                        html += "</tr>";

                    });

                    html += "</table></body></html>";
                    
                    console.log(html);
                    
                    var fs = require('fs');
                    fs.writeFile("/tmp/" + req.params.collection  + ".xls", html, function(err) {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log("The file was saved!");

                            
                            res.download("/tmp/" + req.params.collection  + ".xls");
                                                    }


                    }); 


                    

                })
            });            
        });
    });
};


exports.addCad = function(req, res) {
    var cad = req.body;
    db.collection(req.params.collection, function(err, collection) {
        collection.insert(cad, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'Faio'});
            } else {
                res.send(result[0]);
            }
        });
    });
}


exports.findById = function(req, res) {
    var id = req.params.id;
    db.collection(req.params.collection, function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};


exports.updateCad = function(req, res) {
    var id = req.params.id;
    var cad = req.body;
    db.collection(req.params.collection, function(err, collection) {
        delete cad._id;
        collection.update({'_id':new BSON.ObjectID(id)}, cad, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                res.send(cad);
            }
        });
    });
}
 
exports.deleteCad = function(req, res) {
    var id = req.params.id;
    db.collection(req.params.collection, function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                res.send(req.body);
            }
        });
    });
}

