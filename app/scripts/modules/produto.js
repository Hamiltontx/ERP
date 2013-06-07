define([

  "app",
  "modules/helper"

],

function(app, Hlp, Grid, CRUD) {

  var 
  Produto = app.module();

  //Produtos Model
  Produto.Model = Backbone.Model.extend({
    idAttribute: "_id",
    url: function() {
        if (this.isNew()) {
          return app.api_url + this.attributes._name;
        }
        return app.api_url + this.attributes._name + '/' + this.attributes._id;
    },
    change:  function() {
      //alert(0);
    },
    validate: function(attrs) {

      var err = {};

      _.each(attrs, function(val,key,list){
        var el = document.getElementById(key) || {};
        
        if (el.attributes){
          
          if (el.tagName === "SELECT"){
              if ($(el).data().autorel !== undefined) {
                if (attrs[key+'_description'] !== undefined){
                  $(el).append('<option value="'+attrs[key]+'">'+attrs[key+'_description']+'</option>');
                }
              }else{
                $(el).val(attrs[key]);
              }
          }else{
            $(el).val(attrs[key]);
          }

          if (el.hasAttribute("required")) {
            if (attrs[key].length === 0) {
              err[key] = "vazio";
              var del = $(el);
              del.addClass("error");
              if (del.next().filter("span").length === 0){
                del.after('<span class="input-error" data-title="please write a valid username" data-original-title=""><i class="icon-warning-sign"></i></span>');
              }
            }
          }
        }
      });

      if (!_.isEmpty(err)) {
        return err;
      } 

    }
  });

  Produto.Model_Ped = Backbone.Model.extend({
    idAttribute: "_id",
    url: function() {
        return app.api_url + 'print/' + this.attributes._id;
    }  
  });


  //Itens Collection
  Produto.Colec_Itens = Backbone.Collection.extend({
    model: Backbone.Model,
  });


  //Form's view
  Produto.Views.Formulario = Backbone.View.extend({

    initialize: function() {
      this.options.template = 'cadastros/produtos/formulario';
      this.listenTo(this.model.get("itens"), 'add', this.addOne);
      this.render();
    },

    salvar: function () {
      // alert(0)
      var that = this, model = {};

      this.$el.find("select,input", "#header_ped").not("[id^=ped_]").each(function() {
        var t = $(this);
        model[t.prop("id")] = t.val();

        if (t[0].tagName === "SELECT"){
          delete that.model.attributes[t.prop("id")+"_description"];
        }

      });

      
      _.each(that.model.get("itens").models, function(m, idx) {
        var ctx = "#" + m.attributes._name


        if ($(".add_prod", ctx).is(":visible") && $("#ped_item", ctx).val() !== ''){
          return false;
        }

        if ($(".del_prod", ctx).is(":visible") && $("#ped_item", ctx).val() === ''){
          return false;
        }



        _.each(m.attributes, function(v,k) {
          var el = $("#"+k, ctx)[0] || {};




          if (el.attributes) {
            if (el.tagName === "SELECT"){
              m.set($(el).prop("id")+"_name", $(el).find("option:selected", ctx).text());
              m.set("prod_comp", $(el).find("option:selected", ctx).data().prod_det);
            }
          }
          if (k !== "_name") {
            if (k !== "prod_comp") {
              m.set(k, $("#"+k, ctx).val());
            }
          }
         
        });

      });
      
      delete this.model.attributes.proxy_itens;

      this.model.attributes._name = that.options.name;
      this.model.save(model,{
        
        validate:true,
        error: function() {
          Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Erro na validaçao!</p><div>Corrigir os campos indicados</div> <div>Antes de enviar verifique se esta tudo OK!</div>",
            autoDismiss: 3
          });
        }, 
        success: function() {

          Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Salvo com sucesso</p>"
          });

          $('[data-dismiss="modal"]').trigger('click');
          $("#grid_"+that.options.name).dataTable().fnDraw(true);

        }

      });



    },

    addOne: function( iten ) {
      var 
      view = new Produto.Views.Itens({ model: iten }), 
      that = this;
      
      var dt_ped = new Date();
      dt_ped = dt_ped.formatDate(dt_ped);

      $("input", view.el).first().val(dt_ped);  

      this.$el.find("#body_prod").prepend(view.el);

      if (!that.model.isNew()) {
        ctx = "#" + iten.attributes._name;

        if (iten.attributes.prod_qtd !== '') {
          _.each(iten.attributes, function(v,key,list) {
            var el = that.$el.find("#"+key, ctx)[0] || {};

            if (el.attributes) {
              if (el.tagName === "SELECT"){
                var selec = $(el, ctx);
                $('<option value="'+list[key]+'">'+list[key+"_name"]+'</option>').appendTo(selec).data("prod_det", list.prod_comp);
              }else{
                $(el, ctx).val(list[key]);
              }
            }
          });
        }

      }

    },

    afterRender: function() {

      var that = this;

      var ctx = $("#modal");
      
      $(".modal-body", ctx).empty().append(this.$el);

      this.$el.find("select[data-rel]").each(function() {
        var t = $(this);

          $.ajax({
            url: app.api_url + t.data().rel + '/rel',
            dataType: 'json',
            async: false,
            success: function(data) {
              var items = [];
           
              $.each(data, function(key, v) {
                items.push('<option value="' + v._id + '">' + v.nm_titu + '</li>');
              });
             
              t.append(items.join(''));

            }
          });
      });

      $("form input").on("blur", function() {
          $(this).removeClass("error").next().remove();
      });
      $("#save", ctx).off("click.salvar").on("click.salvar", function() {
        that.salvar();
      });
      $("#reset", ctx).off("click.reset").on("click.reset", function() {
        $("#form_"+ that.options.name)[0].reset();
      });
      if (this.model.isNew()){
          $("#remover", ctx).hide();
      }else{
        $("#remover", ctx).off("click.remove").on("click.remove", function() {
          $("#btn_remove").trigger("click");
        }).show();
      } 
      
    }
    

  });

  //Itens do pedido
  Produto.Views.Itens = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'cadastros/produtos/item';
      this.render();
    },

    events: {
      "click .add_prod": "novo",
      "keypress input:last": "novo",
      "keypress input:not(:first)": "validate",
      "click .del_prod": "remover"
    },

    afterRender: function() {
      //bind do model
      var  that = this, el = that.$el, tt = 0, id = this.cid;

      // fake model
      if (!_.has(this.model.attributes, "prod_qtd")) {
        this.model.set({
          _name: id,
          prod_qtd: '',
          prod_data: ''
        });
      }

      if (this.model.attributes.prod_qtd !== ''){
        el.find(".add_prod").hide();
      }else {
        el.find(".del_prod").hide();
      }

      that.$el.attr("id", this.model.attributes._name);

    },

    novo: function(e,id) {

      // validate
      var el = this.$el, err = false;

      if (e.keyCode !== undefined && e.keyCode !== 13) {
        return;
      }
      if (!el.find(".add_prod").is(":visible")) { err = true; }

      el.find("input,select").each(function() {
        err = ($(this).val().length === 0)
      });

      if (err) { 
        Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Preencha o item corretamente.</p>",
            autoDismiss: 3
        });
        return; 
      }

      // duplica e remove botao add bot remover
      el.find(".add_prod").hide();
      el.find(".del_prod").show();
      
      // setTimeout(function() {
      this.model.collection.add( new Produto.Model({_name: "start_empty"}) );  

      // }, 1000);

    },

    validate: function(e) {

      var letr = (e.target.value + String.fromCharCode(e.keyCode));
      if (_.isNaN(letr*1)) {
        return false;
      }

    }, 
   
    remover: function() { 
      var that = this;
      // remover item do model referenciado e refresh
      this.remove();
      this.model.collection.remove(this.model);
    }

  });


  Produto.Views.Print = Backbone.View.extend({
  
    initialize: function() {
      this.render();
    },

    afterRender: function() {


      $("#imp_ped").html(this.$el.html());
      window.print();
    }

  });


  // Grid
  Produto.Views.Tela = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'cadastros/produtos/grid';
      
    },

    events: {
      "click #btn_novo": "novo",
      "click #btn_edit": "edit",
      "click #btn_remove": "remover",
      "click #btn_print": "print"
    },

    afterRender: function() {
      var that = this, name = this.options.name;
      $("h1").text(name);

      this.$el.find("table").grid({
        urlData: app.api_url + name + '/grid',
        tlaEdit: function() { 
          that.novo($(".selected_row").data().id); 
        },
        name: name
      });

      $("[id*=btn_]", this.el).not("#proc").click(function(ev){
        ev.preventDefault();
      });

    },
    print: function() {

      var modelo = new Produto.Model_Ped();

console.log(modelo)

      new Produto.Views.Print({
        template: "Produtos/print",
        name: "print_Produtos",
        model: modelo.fetch()
      });
      
      //window.open("Produtos/print?iDisplayStart=0&iDisplayLength=0");

    },

    nf: function() {
      
      window.open(app.api_url + "nf/" + $(".selected_row").data().id );

    },

    

    novo: function(id) {

      var 
      name = this.options.name,
      that = this,
      model = new Produto.Model({_name: name , itens: new Produto.Colec_Itens() }),
      modal = function(m,name) {

        var det = new Produto.Views.Formulario({
          name: name,
          model: m
        });

        $('#modal').modal()
        // .on("shown", function(){
          
        // });

        itens = model.get("itens");

        setTimeout(function() {

          if (!("proxy_itens" in model.attributes)) {
            itens.add( new Produto.Model({_name: "xxx"}) );
          }else{
            var pitens = model.get("proxy_itens");
            _.each(pitens, function(k,v) {
              // var name_view = _.keys(k)[0];
              // name_view = name_view.substring(name_view.indexOf("view"),name_view.length);
              itens.add( new Produto.Model(k) );
            });
            
          }

        }, 500);

      }
      
      $(".modal-header span").text("Adcionar " + name );

      if (!_.isObject(id) && id !== undefined) {
          model.set({_id: id})
          .fetch({validate: false})
          .done(function(){
            model.set("proxy_itens", model.get("itens") );
            model.set("itens", new Produto.Colec_Itens() );
            modal.call(this,model,name);
            model.validate(model.attributes, {});

            $("label").each(function(i,e) {

              var el = $(this).prev();

              if (model.attributes[el.attr("id")] == 1) {
                $(this).trigger("click");
                el.val("1");
              }

            });
            
            Hlp._applyChosen();
          });
      }else {
        modal.call(this,model,name);
        Hlp._applyChosen();
      }
      
    },
    edit: function() { 
      if ($(".selected_row").length > 0) {
        this.novo($(".selected_row").data().id);
      }else {
         Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Selecione um registro para alterar.</p>",
            autoDismiss: 3
          });
      }
    },
    remover: function() { 
      var that = this;

      if ($(".selected_row").length > 0) {
        if(confirm("Remover este registro?")) {
          var model = new Produto.Model({_name: this.options.name, _id: $(".selected_row").data().id});
          model.destroy({
              success: function() {

              Notifications.push({
                imagePath: "../../images/alert.png",
                text: "<p>Removido com sucesso</p>"
              });

              if ($("#modal").css("display") === "block") {
                that.novo();
              }

              $("#grid_"+that.options.name).dataTable().fnDraw(true);
            }
          });
        }
      }else {
         Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Selecione um registro para remover.</p>",
            autoDismiss: 3
          });
      }

      
    }

  });

  return Produto;

});
