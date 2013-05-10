define([

  "app",
  "modules/helper"

],

function(app, Hlp, Grid, CRUD) {

  var 
  Venda = app.module();

  //Vendas Model
  Venda.Model = Backbone.Model.extend({
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

  Venda.Model_Ped = Backbone.Model.extend({
    idAttribute: "_id",
    url: function() {
        return app.api_url + 'print/' + this.attributes._id;
    }  
  });


  //Itens Collection
  Venda.Colec_Itens = Backbone.Collection.extend({
    model: Backbone.Model,
  });


  //Form's view
  Venda.Views.Formulario = Backbone.View.extend({

    initialize: function() {
      this.options.template = 'vendas/formulario';
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

        if (model["emit_nf"] == 1){
          var dt_nf = new Date();
          dt_nf = dt_nf.formatDate(dt_nf);
          model["dt_nf_emitida"] = dt_nf;
        }else{
          model["dt_nf_emitida"] = "";
        }

      });

      model["valor_total"] = $("#total").text();

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

          // that.model.clear({silent:true});
          // that.model.set("itens", new Venda.Colec_Itens() );
          // that.listenTo(that.model.get("itens"), 'add', that.addOne);
          // that.render().done(function() {
          //   Hlp._applyChosen();
          //   that.model.get("itens").add( new Venda.Model({_name: "start_empty"}) );
          // });

          $('[data-dismiss="modal"]').trigger('click');
          $("#grid_"+that.options.name).dataTable().fnDraw(true);

        }

      });



    },

    addOne: function( iten ) {
      var 
      view = new Venda.Views.Itens({ model: iten }), 
      that = this;
      this.$el.find("#body_ped").prepend(view.el);

      if (!that.model.isNew()) {
        ctx = "#" + iten.attributes._name;

        if (iten.attributes.ped_item !== '') {
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

      var sle = this.$el.find("#ped_item", "#body_ped")

      sle.ajaxChosen({
         loadingImg: 'images/loading_chosen.gif',
         generateUrl: function() { 
          var col = $('.chzn-search input').parent().parent().parent().parent().find("select").data().autorel;  
          return app.api_url + "produtos/find/" + this.value
        }
      });

    },

    addAll: function() {
      this.$('#nbody_ped').html('');
      Venda.Colec_Itens.each(this.addOne, this);
    },

    afterRender: function() {

      var that = this;

      var ctx = $("#modal_venda");
      
      $(".modal-body", ctx).empty().append(this.$el);

      var dt_ped = new Date();
      dt_ped = dt_ped.formatDate(dt_ped);

      $("#data_ped").val(dt_ped);

      $("label").click(function() {
        var v = $(this).prev().val()*1;
        $(this).prev().val((v === 0) ? 1 : 0); 
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
  Venda.Views.Itens = Backbone.View.extend({
  
    initialize: function() {
      this.options.template = 'vendas/item';
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
      if (!_.has(this.model.attributes, "ped_item")) {
        this.model.set({
          _name: id,
          ped_item: '',
          ped_valor: '',
          ped_qtd: '',
          prod_comp: ''
        });
      }

      if (this.model.attributes.ped_item !== ''){
        el.find(".add_prod").hide();
      }else {
        el.find(".del_prod").hide();
      }

      that.$el.attr("id", this.model.attributes._name);

      el.find("#ped_item").change(function() { 
        var 
        obj = $(this)[0],
        txt = obj.options[obj.selectedIndex].text;
        el.find("#ped_item_name").val(txt);
        el.find("#ped_valor").val($(":selected",this).data().prod_det.vl_prod.replace('.','').replace(',','.'));
      });

      
      el.find("select,input").change(function() {
        Hlp.soma_total();
      });

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
      this.model.collection.add( new Venda.Model({_name: "start_empty"}) );  

      // }, 1000);

      Hlp.soma_total();
      

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
      Hlp.soma_total();
    }

  });


  Venda.Views.Print = Backbone.View.extend({
  
    initialize: function() {
      this.render();
    },

    afterRender: function() {


      $("#imp_ped").html(this.$el.html());
      window.print();
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
      "click #btn_remove": "remover",
      "click #btn_print": "print",
      "click #btn_nf": "nf"
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

      var modelo = new Venda.Model_Ped();

console.log(modelo)

      new Venda.Views.Print({
        template: "vendas/print",
        name: "print_vendas",
        model: modelo.fetch()
      });
      
      //window.open("vendas/print?iDisplayStart=0&iDisplayLength=0");

    },

    nf: function() {
      
      window.open(app.api_url + "nf/" + $(".selected_row").data().id );

    },

    

    novo: function(id) {

      var 
      name = this.options.name,
      that = this,
      model = new Venda.Model({_name: name , itens: new Venda.Colec_Itens() }),
      modal = function(m,name) {

        var det = new Venda.Views.Formulario({
          name: name,
          model: m
        });

        $('#modal_venda').modal()
        // .on("shown", function(){
          
        // });

        itens = model.get("itens");

        setTimeout(function() {

          if (!("proxy_itens" in model.attributes)) {
            itens.add( new Venda.Model({_name: "xxx"}) );
          }else{
            var pitens = model.get("proxy_itens");
            _.each(pitens, function(k,v) {
              // var name_view = _.keys(k)[0];
              // name_view = name_view.substring(name_view.indexOf("view"),name_view.length);
              itens.add( new Venda.Model(k) );
            });
            
          }

          if($(this).parent().next().find(".add_prod").is(":visible") === true){
                alert("add")
          }

          Hlp.soma_total();


        }, 500);

      }
      
      $(".modal-header span").text("Adcionar " + name );

      if (!_.isObject(id) && id !== undefined) {
          model.set({_id: id})
          .fetch({validate: false})
          .done(function(){
            model.set("proxy_itens", model.get("itens") );
            model.set("itens", new Venda.Colec_Itens() );
            modal.call(this,model,name);
            model.validate(model.attributes, {});

            $("label").each(function(i,e) {

              var el = $(this).prev();

              if (model.attributes[el.attr("id")] == 1) {
                $(this).trigger("click");
                el.val("1");
              }

            });
            if (model.attributes["dt_nf_emitida"] !== ""){
              $("label[for='emit_nf']").after("&nbsp;&nbsp;" + model.attributes["dt_nf_emitida"]);
            }

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
