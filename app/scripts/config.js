// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["main"],

  paths: {
    // JavaScript folders.
    libs: "../scripts/libs",
    plugins: "../scripts/plugins",

    // Libraries.
    jquery: "../scripts/libs/jquery",
    lodash: "../scripts/libs/lodash",
    backbone: "../scripts/libs/backbone",
    jqueryui: "plugins/jquery-ui-1.10.0.custom"
  },

  shim: {
    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },

    jqueryui: {
      deps: ["jquery"]
    },

    // Backbone.LayoutManager depends on Backbone.
    "plugins/backbone.layoutmanager": ["backbone"],
    "plugins/joox": ["jqueryui"],
    "plugins/bootstrap": ["jquery"],
    "plugins/jquery.dataTables": ["jquery"],
    "plugins/notification": ["jqueryui"],
    "plugins/chosen": ["jquery"]

    
    

  }

});
