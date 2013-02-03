require([
  // Application.
  "app",

  // Main Router.
  "router",

  "modules/helper"
],

function(app, Router, Hlp) {

  // Define your master router on the application namespace and trigger all
  // navigation from this instance.
  app.router = new Router();

  // Trigger the initial route and enable HTML5 History API support, set the
  // root folder to '/' by default.  Change in app.js.
  Backbone.history.start({ root: app.root });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router. If the link has a `data-bypass`
  // attribute, bypass the delegation completely.
  $(document).on("click", "a[data-bone]", function(evt) {
    evt.preventDefault();

    // Get the absolute anchor href.
    var href = $(this).attr("href");
    Backbone.history.navigate(href, true);

    // If the href exists and is a hash route, run it through Backbone.
    // if (href && href.indexOf("#") === 0) {
    //   // Stop the default event to ensure the link will not cause a page
    //   // refresh.
      

    //   // `Backbone.history.navigate` is sufficient for all Routers and will
    //   // trigger the correct events. The Router's internal `navigate` method
    //   // calls this anyways.  The fragment is sliced from the root.
      
    // }
  });


  //Menu Responsive
  $(function() {
    return $(".profile-menu-nav-collapse .button").click(function() {
      return $(".secondary-nav-menu").toggleClass("open");
    });
  });

  //Controles do menu
  $("nav#primary li").on("click", function() {
    $("nav#primary li").removeClass("active");
    $(this).addClass("active");
    app.execMenu($("a", this).data().menu);
  });






});
