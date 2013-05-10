var mongo = require('mongodb')
    _ = require('./underscore');
 
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;
 
var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('jooxFestanca', server, {safe:true});
 
db.open(function(err, db) {
    if(!err) {
        console.log("Custom conectado");
    }
});




    //Helper's no prototype
    Date.prototype.formatDate = function(dt) {
      var 
      d = dt.getDate(),
      m = dt.getMonth()+1,
      y = dt.getFullYear();
      return  y +'-'+ (m<=9?'0'+m:m) +'-'+ (d<=9?'0'+d:d) ;
    };
    Number.prototype.formatMoney = function(c, d, t){
    var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
       return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
     };
    Number.prototype.fv = function(){
        t = this;
        t = t.formatMoney();
        t += '';
        t = t.replace(".","");
        t = t.replace(",",".");
        return t;   
    };
    String.prototype.to_n = function(){
        t = this.replace(/\D/g,'');
        return t;
    }
    String.prototype.fix = function(n){
        var run = n - (this.length+1), x = 0;
        for (var _i = 0; _i < run; _i++) {
          x += '0';
        }
        t = (this.length<n) ? x + this : this;
        return t;
    }

    String.prototype.sg = function(){
        var siglas = {
            "12": "AC",
            "27": "AL",
            "16": "AP",
            "13": "AM",
            "29": "BA",
            "23": "CE",
            "53": "DF",
            "32": "ES",
            "52": "GO",
            "21": "MA",
            "51": "MG",
            "50": "MS",
            "31": "MG",
            "15": "PA",
            "25": "PB",
            "41": "PR",
            "26": "PE",
            "22": "PI",
            "33": "RJ",
            "24": "RN",
            "43": "RS",
            "11": "RO",
            "14": "RR",
            "42": "SC",
            "35": "SP",
            "28": "SE",
            "17": "TO"
        };

        return siglas[this];
    }

    //Helper's no prototype


var semacento = function(chg) {
    var trans = {
        'ç': 'c', 'Ç': 'C', 'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'í': 'i', 'ì': 'i', 'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ú': 'u', 'ù': 'u', 'ü': 'u',
        'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'É': 'E', 'È': 'E', 'Ê': 'E', 'Í': 'I', 'Ì': 'I', 'Ó': 'O', 'Ò': 'O', 'Ô': 'O', 'Õ': 'O', 'Ú': 'U', 'Ù': 'U', 'Ü': 'U'
    };

    return chg.replace(/[çÇáàãâéèêíìóòôõúùüÁÀÃÂÉÈÊÍÌÓÒÔÕÚÙÜ]/ig, function(m) { return trans[m] });
};


var x = function(els,callback,add,comp) {
    var total = els.length, count = 0;
    if (total === 0) 
            callback();

    _.each(els,function(el,ix){
        var 
        keyx = el["key"], 
        nodex = el["el"], 
        colx  = keyx.substring(0, keyx.indexOf('_id'));

        db.collection(colx, function(err, col) { 
            col.findOne({'_id':new BSON.ObjectID(nodex[keyx])}, function(err, it) {
                if (it !== null){
                    nodex[keyx+add] = it.nm_titu;
                    if (comp !== undefined){
                        nodex[keyx+comp] = it;
                    }
                }else{
                    nodex[keyx+add] = "Relacao removida"
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


exports.vendasfindById = function(req, res) {
    var id = req.params.id;
    db.collection('vendas', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, items) {
        	var els = [];
            _.map(items, function(num, key) {
                if (key.indexOf('_id') > 4 && num.length > 0) {
                    els.push({key:key,id:num,el:items});
                }
            });
        	x.call(items,els,function(){
				res.send(items);
            },'_description');

        });
    });
};


exports.vendasfindGrid = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    var iDisplayStart = (req.query.iDisplayStart*1);
    var qt_rowcount = (req.query.iDisplayLength*1);
    var search = {}, obj = {};

    if (req.query.sSearch !== "") { 
        var bSearch = eval ("(" + req.query.sSearch + ")");

        search.$or = [];

        _.each(bSearch, function(v, k) {
            var obj = {};
            obj[k] = new RegExp(v);
            search.$or.push(obj);
        });

    }

    db.collection('vendas', function(err, collection) {
        var total = 0;
        collection.find(search, { itens: 0 }).count(function(err, count) {
            total = count
            var options = {
                "limit": qt_rowcount,
                "skip": iDisplayStart,
                "sort": {"_id": 1}
            }

            var mycursor = collection.find(search, { dt_nf_emitida:1, clientes_id:1, nf_num:1,  valor_total:1, data_ped:1}, options);

                
            mycursor.toArray(function(err, items) {

                var els = [];

                _.each(items, function(el, ix) {

                    _.map(el, function(num,key){ 
                        if (key.indexOf('_id') > 4 && num.length > 0) {
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
                },'')
            });            
        });
    });
};




exports.NFById = function(req, res) {
    var id = req.params.id, config = {};

    db.collection('vendas', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, items) {
            var els = [];
            items['config_id'] = '514101a19d2b6f0de868577c';

            _.map(items, function(num, key) {
                if (key.indexOf('_id') > 4 && num.length > 0) {
                    els.push({key:key,id:num,el:items});
                }
            });

            x.call(items,els,function(){
                
                var dt_nf = new Date();
                Ndate = dt_nf.formatDate(dt_nf);

                var 
                nf = items,
                Natop =  (nf.clientes_id_comp.cli_uf.sg() === 'SP') ? 5102 : 6102,
                // Ndate = formatDate(dt_nf),
                config = nf.config_id_comp,
                c = nf.clientes_id_comp,
                num_nf = (config.nf_num*1)+1;

                config.upt_nf_num = true;
                if (nf.nf_num !== '') {
                    num_nf = nf.nf_num;
                    config.upt_nf_num = false;
                }

                config.nf_num = num_nf;


                var 
                html =  "NOTAFISCAL|1\r\n";    // Total de NF's
                html += "A|2.00||\r\n"        // Versao

                // Emissor
                // Venda - 5102 SP  - 6102 - Fora
                html += "B|35||Vendas|"+nf.ind_pag+"|55|1|"+num_nf+"|"+ Ndate +"|||1|3523107|1|1||1|1|3|2.2.8|||\r\n"
                html += "C|FESTANCA COMERCIO DE ARTIGOS DE EPOCA LTDA - EPP|FESTANCA FESTAS|379100240115||4789099|4789099|1|\r\n"
                html += "C02|07802430000176|\r\n"
                html += "C05|Av Registro|130||Jardim Tropical|3523107|Itaquaquecetuba|SP|08582540|1058|BRASIL|1122494382|\r\n"

                // Destinatario  - ?? Verificar formato para suframa
                var suframa = "";
                
                //PROD
                // html += "E|"+c.nm_titu+"|"+c.cli_ie.to_n()+"||"+c.cli_email+"\r\n"
                //PROD

                // HOMOLOGACAO
                html += "E|"+c.nm_titu+"|||"+c.cli_email+"\r\n" 
                // HOMOLOGACAO

                if (c.cli_cnpj.length > 11){
                    html += "E02|"+c.cli_cnpj.to_n()+"|\r\n"
                }else{
                    html += "E03|"+c.cli_cnpj.to_n()+"|\r\n"
                }

                html += "E05|"+c.cli_end+"|"+c.cli_numero+"||"+c.cli_bairro+"|"+c.cli_uf+c.cli_cid.fix(5)+"|"+semacento(c.cli_cid_description)+"|"+c.cli_uf.sg()+"|"+c.cli_cep.to_n()+"|1058|BRASIL|"+c.cli_phone.to_n()+"|123|1234\r\n"

                // Itens do Pedido

                var 
                alicota = (config.alicota*1),
                total_alicota = 0,
                total_geral =0,
                total_desconto =0,
                tipo_nf = (nf.prazos_idB === '') ? 'LUXO' : 'SIMPLES';

                var desconto = (nf.nf_desconto === '' || nf.nf_desconto === undefined) ? 0 : (nf.nf_desconto*1);

                //Fix for no code itens on document.
                _.each(nf.itens, function(el,i) {
                        if (el.prod_comp === undefined) 
                            delete nf.itens[i];
                });

                _.each(nf.itens, function(el, ix) {

                    var 
                    valor_prod = (el.ped_valor*1).fv(),
                    valor_desconto = "";

                    if (tipo_nf === 'SIMPLES'){
                        valor_prod = (valor_prod/2);
                    }

                    var
                    total_prod = valor_prod * (el.ped_qtd*1),
                    nome_prod = el.prod_comp.nm_titu + " " + tipo_nf,
                    vl_alicota = total_prod * (alicota/100);

                    if (desconto > 0) {
                        valor_desconto = (total_prod*(desconto/100));
                        valor_desconto = valor_desconto.fv();

                    }


                    html += "H|"+(ix+1)+"||\r\n"
                    html += "I|"+el.prod_comp.id_prod+"||"+nome_prod+"|95059000||"+Natop+"|"+el.prod_comp.nu_med+"|"+el.ped_qtd+"|"+valor_prod+"|"+total_prod.fv()+"||"+el.prod_comp.nu_med+"|"+el.ped_qtd+"|"+valor_prod+"|||"+valor_desconto+"||1\r\n"
                    html += "M|\r\n"
                    html += "N|\r\n"
                    html += "N10c|0|101|"+alicota+"|"+vl_alicota.fv()+"\r\n"
                    html += "O|950||||950\r\n"
                    html += "O08|52\r\n"
                    html += "Q|\r\n"
                    html += "Q04|07\r\n"
                    html += "S|\r\n"
                    html += "S04|07\r\n"

                    total_alicota += vl_alicota;
                    total_geral += total_prod;
                    total_desconto += valor_desconto;

                });

                var 
                t = (nf.transportadoras_id_comp == undefined) ? "" : nf.transportadoras_id_comp,
                prazo = (nf.prazos_idA_comp == undefined) ? "" : nf.prazos_idA_comp.nm_titu,
                vendedor = (nf.vendedores_id_comp == undefined) ? "" : nf.vendedores_id_comp.nm_titu;

                if (vendedor ===  undefined) {
                    vendedor = "";
                }

                transp_sg = (t.transp_uf == undefined) ? "" : t.transp_uf.sg();
                transp_desc = (t.transp_cid_description == undefined) ? "" : semacento(t.transp_cid_description);

                if (total_desconto >0){
                    total_desconto = total_desconto.fv();
                }else{
                    total_desconto = "0.0";
                }

                    html += "W|"
                    html += "W02|0.00|0.00|0.00|0.00|"+total_geral.fv()+"|0.00|0.00|"+total_desconto+"|0.00|0.00|0.00|0.00|0.00|"+(total_geral-total_desconto).fv()+"|\r\n"
                    html += "X|"+nf.frete+"\r\n" 
                    html += "X03|"+t.nm_titu+"||"+t.transp_end+"|"+transp_sg+"|"+transp_desc+"|\r\n"
                    html += "X26|"+nf.nf_qtd_caixa+"|VOLUMES|||"+nf.nf_peso+"|"+nf.nf_peso+"\r\n"
                    html += "Z|I-DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO SIMPLES NACIONAL.  II- NÃO GERA DIREITO A CREDITO FISCAL DE IPI. III- PERMITE O APROVEITAMENTO DO CREDITO DE ICMS NO VALOR DE R$ "+total_alicota.fv()+" CORRESPONDENTE A ALIQUOTA DE "+alicota+"% NOS TERMOS DO ART. 23 DA LC 123|PRAZO: "+prazo+" - VENDEDOR: "+vendedor+"|\r\n"

                var file = "NFe"+num_nf+".txt" 
                var fs = require('fs');

                fs.writeFile("/tmp/nf/" + file , html, function(err) {
                    if(err) {
                        console.log(err);
                    } else {
                        
                        //Atualiza Numero da NF
                        db.collection('vendas', function(err, collection) {
                            cad = {
                                nf_num : config.nf_num
                            }
                            collection.update({'_id':new BSON.ObjectID(id)}, {$set: cad } , {safe:true}, function(err, result) {
                                if (err) {
                                    res.send({'error':'An error has occurred'});
                                }
                            });
                        });

                        if (config.upt_nf_num) {

                            //Atualiza Numero da NF
                            db.collection('config', function(err, collection) {
                                cad = {
                                    nf_num : config.nf_num
                                }
                                collection.update({'_id':new BSON.ObjectID('514101a19d2b6f0de868577c')}, {$set: cad }, {safe:true}, function(err, result) {
                                    if (err) {
                                        res.send({'error':'An error has occurred'});
                                    }
                                });
                            });
                        }



                        res.download("/tmp/nf/" + file);
                    }
                }); 


            },'_description','_comp');





        });
    });
};


