define([
  // Application.
  "app",

  //Modules
  "modules/helper",
  "modules/cadastro",
  "modules/vendas",
  "modules/produto"


],

function(app, Hlp, Cadastro, Venda, Produto) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "vendas/ped": "vendas",
      "compras": "compras",
      "fabrica": "fabrica",
      "montagem": "montagem",
      "cadastros/produtos": "produtos",
      "cadastros/:base": "cadastros",
    },

    index: function() {
      //app.layout : app.menu
      app.useLayout('painel/base', 'controle');

      $.getJSON(app.api_url + 'config/514101a19d2b6f0de868577c').done(function(d) {
        
        $("#nf_num").val(d.nf_num);
        $("#nf_obs").val(d.nf_obs);
        $("#alicota").val(d.alicota);

      });
      Hlp.get_data_geral();

      $("#save_config").on("click", function() {

          $.ajax({
              url: app.api_url + 'config/514101a19d2b6f0de868577c',
              type: 'PUT',
              data: {
                  nf_num: $("#nf_num").val(),
                  nf_obs: $("#nf_obs").val(),
                  alicota: $("#alicota").val()
              },
              success: function(result) {
                  alert("Atualizado com sucesso!")
              }
          });

      });



    },

    vendas: function() {

      Hlp.get_data_geral();

      app.useLayout('vendas/base', 'controle')
      .setViews({
        "#edit_mode": new Venda.Views.Tela({
          name: "vendas",
          model: new Venda.Model()
        })
      }).render();

    },

    compras: function() {
      app.useLayout('compras/base', 'controle');
    },

    fabrica: function() {
      app.useLayout('fabrica/base', 'controle');
    },

    montagem: function() {
      app.useLayout('montagem/base', 'controle');
    },

    cadastros: function(base) {
      
      var model = new Cadastro.Model({_name: base});

      app
      .useLayout('cadastros/base', 'cadastro')
      .setViews({
        "#edit_mode": new Cadastro.Views.Tela({
          name: base,
          model: model
        })
      }).render();
      
    },

    produtos: function() {

      app.useLayout('cadastros/base', 'cadastro')
      .setViews({
        "#edit_mode": new Produto.Views.Tela({
          name: "produtos",
          model: new Produto.Model()
        })
      }).render();

    },

  });

  return Router;

});
