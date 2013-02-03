define([

  "app",
  "modules/helper"

],

function(app, Hlp, Grid, CRUD) {

  var 
  Venda = app.module();

  // Venda.Collection = Backbone.Collection.extend({
  //   url : function() {
  //     return app.api_url + this.name ;
  //   },
  //   parse: function(data) {
  //     return data;
  //   }
  // });

  Venda.Model = Backbone.Model.extend({
    idAttribute: "_id",
    url: function() {
        if (this.isNew()) {
          return app.api_url;
        }
        return app.api_url + '/' + this.attributes._id;
    },
    change:  function() {

      //alert(0);

    },
    validate: function(attrs) {

      var err = {};

      _.each(attrs, function(val,key,list){
        var el = document.getElementById(key) || {};
        
        if (el.attributes){
          $(el).val(attrs[key]);
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


  Venda.Model_Itens = Backbone.Model.extend({
    idAttribute: "_id",
    change:  function() {

      //alert(0);

    },
    validate: function(attrs) {

      // var err = {};

      // _.each(attrs, function(val,key,list){
      //   var el = document.getElementById(key) || {};
        
      //   if (el.attributes){
      //     $(el).val(attrs[key]);
      //     if (el.hasAttribute("required")) {
      //       if (attrs[key].length === 0) {
      //         err[key] = "vazio";
      //         var del = $(el);
      //         del.addClass("error");
      //         if (del.next().filter("span").length === 0){
      //           del.after('<span class="input-error" data-title="please write a valid username" data-original-title=""><i class="icon-warning-sign"></i></span>');
      //         }
      //       }
      //     }
      //   }
      // });

      // if (!_.isEmpty(err)) {
      //   return err;
      // } 

    }
  });

  //Form
  Venda.Views.Formulario = Backbone.View.extend({

    initialize: function() {
      this.options.template = 'vendas/formulario';
      this.render();
    },

    salvar: function () {
      var that = this, model = {};

      this.$el.find("input, select, textarea").each(function() {
        var t = $(this);
        model[t.prop("id")] = t.val();
      });

      this.model.attributes._name = that.options.name;
      this.model.save(model,{

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
          that.model.clear({silent:true});
          that.render();
          $("#grid_"+that.options.name).dataTable().fnDraw(true);

        }

      });



    },

    

    afterRender: function() {

      var that = this;

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


      //itens do pedido
      var model_itens = new Venda.Model_Itens();

      var det = new Venda.Views.Itens({
          model: model_itens
      });

      this.$el.find("#body_ped").append(det.$el)




      $("#modal_venda .modal-body").empty().append(this.$el);


      $("form input").on("blur", function() {
          $(this).removeClass("error").next().remove();
      });
      $("#save").off("click.salvar").on("click.salvar", function() {
        that.salvar();
      });
      $("#reset").off("click.reset").on("click.reset", function() {
        $("#form_"+ that.options.name)[0].reset();
      });
      if (this.model.isNew()){
          $("#remover").hide();
      }else{
        $("#remover").off("click.remove").on("click.remove", function() {
          $("#btn_remove").trigger("click");
        }).show();
      }
      
    }
    

  });

  //Itens do pedido
  Venda.Views.Itens = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'vendas/item';
      this.render();
      
    },

    events: {
      "click .add_prod": "novo",
      "keypress input:last": "novo",
      "keypress input": "validate",
      "click .del_prod": "remover"
    },

    afterRender: function() {
      //bind do model

    },

    novo: function(e,id) {

      if (e.keyCode !== undefined && e.keyCode !== 13) {
        return

      }
      // duplica e remove botao add bot remover
      var 
        el = this.$el;

      el.find(".add_prod").hide();
      el.find(".del_prod").show();

      var model_itens = new Venda.Model_Itens();
      var det = new Venda.Views.Itens({
          model: model_itens
      });
      el.before(det.$el);
      det.$el.find("input:first").focus();

    },

    validate: function(e) {

      var 
      let = e.target.value;
      //reg = new RegExp(Hlp.validate.number);
      
      if (_.isNaN(let*1)) {

        return false;

      }


      // console.log(Hlp.validate.number)

    },
   
    remover: function() { 
      var that = this;

      // remover item do model referenciado e refresh
      this.remove();
      
    }

  });



  // Grid
  Venda.Views.Tela = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'vendas/grid';
      
    },

    events: {
      "click #btn_novo": "novo",
      "click #btn_edit": "edit",
      "click #btn_remove": "remover"
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

    novo: function(id) {

      var name = this.options.name;
      $(".modal-header span").text("Adcionar " + name );

      var model = new Venda.Model({_name: name});

      if (!_.isObject(id) && id !== undefined) {
          model.set({_id: id}).fetch();
      }

      var det = new Venda.Views.Formulario({
          name: name,
          model: model
      });

      $('#modal_venda').modal();

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
          var model = new Venda.Model({_name: this.options.name, _id: $(".selected_row").data().id});
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

  return Venda;

});
