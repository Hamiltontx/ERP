define([
  // Libraries.
  "jquery",
  "lodash",
  "backbone",

  // Plugins.
  "plugins/backbone.layoutmanager",
  "plugins/bootstrap",
  "plugins/joox",
  "plugins/jquery.dataTables",
  "plugins/notification",
  "plugins/chosen"
  
],

function($, _, Backbone) {

  new Notifications({
        container: $("body"),
        bootstrapPositionClass: "span8 offset2"
  });

  $(document).ajaxError( function(e, xhr, options){
    $("#dismiss-all").trigger("click");
    Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Erro na servidor!</p><div>recarregue a aplicacao e tente novamente</div>",
            autoDismiss: 3
          });
  }).ajaxStart(function() {
    Notifications.push({
            imagePath: "../../images/alert.png",
            text: "<p>Carregando aguarde</div>"
    });
    //create a logic here...if notification existe in sequential ajax call's
  }).ajaxSuccess(function() {
    //close all only when all ajax finished (defferred)
    //$("#dismiss-all").trigger("click");
    Notifications.dismissAll();

  });

  // Provide a global location to place configuration settings and module
  // creation.
  var app = {
    // The root path to run the application.
    root: "/",
    api_url: "http://localhost:3500/"
  };

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  // Configure LayoutManager with Backbone Boilerplate defaults.
  Backbone.LayoutManager.configure({
    manage: true,
    paths: {
      layout: "templates/",
      template: "templates/"
    },

    fetch: function(path) {
      path = path + ".html";

      if (!JST[path]) {
        $.ajax({ url: app.root + path, async: false }).then(function(contents) {
          JST[path] = _.template(contents);
        });
      }

      return JST[path];
    }
  });

  // Mix Backbone.Events, modules, and layout management into the app object.
  return _.extend(app, {
    // Create a custom object with a nested Views object.
    module: function(additionalProps) {
      return _.extend({ Views: {} }, additionalProps);
    },

    // Helper for using layouts.
    useLayout: function(name, menu) {
      // If already using this Layout, then don't re-inject into the DOM.
      if (this.layout && this.layout.options.template === name) {
        return this.layout;

      }

      // If a layout already exists, remove it from the DOM.
      if (this.layout) {
        this.layout.remove();
      }

      // Create a new Layout.
      var layout = new Backbone.Layout({
        template: name,
        className: "layout " + name,
        id: "layout"
      });

      var active = name.substring(0,name.indexOf('/'));

      // Insert into the DOM.
      $("#main").empty().append(layout.el);

      if (menu) {
        this.execMenu(menu, active);
      }
      
      // Render the layout.
      layout.render();

      // Cache the refererence.
      this.layout = layout;

      // Return the reference, for chainability.
      return layout;
    },

    execMenu: function(name, active) {
      

      if (this.menu && this.menu.options.template === 'menu/' + name) {
        return false;
      }

      var menu = new Backbone.Layout({
        template: 'menu/' + name,
        className: "menu " + name,
        el: '.secondary-nav-menu',
        id: "menu"
      });

      // Render the menu.
      menu.render().done(function(){
        $("nav#secondary li").on("click", function() {
          $("nav#secondary li").removeClass("active");
          $(this).addClass("active");
        });
      });
      $("#"+active).addClass("active");

      // Cache the refererence.
      this.menu = menu;

      // Return the reference, for chainability.
      return menu;
    },

  }, Backbone.Events);

});
