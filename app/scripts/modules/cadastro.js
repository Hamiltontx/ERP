define([

  "app",
  "modules/helper"

],

function(app, Hlp, Grid, CRUD) {

  var 
  Cadastro = app.module();

  // Cadastro.Collection = Backbone.Collection.extend({
  //   url : function() {
  //     return app.api_url + this.name ;
  //   },
  //   parse: function(data) {
  //     return data;
  //   }
  // });

  Cadastro.Model = Backbone.Model.extend({
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

  //Form
  Cadastro.Views.Formulario = Backbone.View.extend({

    initialize: function() {
      this.options.template = 'cadastros/' + this.options.name + "/formulario";
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

      $("#modal .modal-body").empty().append(this.$el);


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

  // Grid
  Cadastro.Views.Tela = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'cadastros/' + this.options.name + "/grid";
      
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

      var model = new Cadastro.Model({_name: name});

      if (!_.isObject(id) && id !== undefined) {
          model.set({_id: id}).fetch();
      }

      var det = new Cadastro.Views.Formulario({
          name: name,
          model: model
      });

      $('#modal').modal();

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
          var model = new Cadastro.Model({_name: this.options.name, _id: $(".selected_row").data().id});
          model.destroy({
              success: function() {

              Notifications.push({
                imagePath: "../../images/alert.png",
                text: "<p>Removido com sucesso</p>",
                autoDismiss: 3
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

  return Cadastro;

});
