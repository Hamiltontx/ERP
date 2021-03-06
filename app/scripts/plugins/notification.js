(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Notification = (function() {

    function Notification(template, options) {
      var _this = this;
      this.template = template;
      this.options = options;
      this.dismiss = __bind(this.dismiss, this);

      this.item = {};
      this.item.imagePath = this.options.imagePath;
      this.item.imageClass = "img";
      if (this.options.fillImage === true) {
        this.item.imageClass += " fill";
      } else {
        this.item.imageClass += " border";
      }
      this.item.text = this.options.text;
      this.item.time = this.options.time;
      if (this.options.imagePath == null) {
        this.item.itemClass = " no-image";
      }
      this.view = $(_.template(this.template, {
        item: this.item
      }));
      if (options["class"] != null) {
        this.view.addClass(options["class"]);
      }
      this.hideButton = this.view.find(".hide");
      this.hideButton.bind("click touchend", this.dismiss);
      if (this.options.autoDismiss != null) {
        setTimeout(function() {
          return _this.dismiss();
        }, this.options.autoDismiss * 1000);
      }
    }

    Notification.prototype.dismiss = function() {
      var _this = this;
      return this.view.slideUp().queue(function() {
        _this.options._dismiss(_this, _this.options.dismiss);
        return _this.view.remove();
      });
    };

    return Notification;

  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Array.prototype.remove = function(e) {
    var i;
    if ((i = this.indexOf(e)) !== -1) {
      return this.splice(i, 1);
    }
  };

  this.Notifications = (function() {

    Notifications.instance = null;

    function Notifications(options) {
      this.removeNotification = __bind(this.removeNotification, this);

      this.dismissAll = __bind(this.dismissAll, this);

      this.onDismiss = __bind(this.onDismiss, this);

      this.flipIn = __bind(this.flipIn, this);

      this.push = __bind(this.push, this);

      this.mobileEvents = __bind(this.mobileEvents, this);

      var _ref;
      if (Notifications.instance === null) {
        Notifications.instance = this;
      }
      this.parent = options.container;
      this.notificationTemplate = $("#template-notification").html();
      this.notificationsTemplate = $("#template-notifications").html();
      this.container = $(_.template(this.notificationsTemplate, {
        bootstrapPositionClass: (_ref = options.bootstrapPositionClass) != null ? _ref : "span6 offset4"
      }));
      this.parent.prepend(this.container);
      this.content = this.container.find("#content #notes");
      this.notificationsContainer = this.container.find("#notifications");
      this.dismissAllButton = this.container.find("#dismiss-all");
      this.dismissAllButton.bind("click", this.dismissAll);
      this.mobileEvents();
      this.notifications = [];
    }

    Notifications.prototype.mobileEvents = function() {
      var _this = this;
      return this.notificationsContainer.bind("touchstart", function() {
        return _this.notificationsContainer.addClass("active");
      });
    };

    Notifications.push = function(options) {
      if (Notifications.instance === null) {
        new Notifications({
          container: $("body"),
          bootstrapPositionClass: "span6 offset3"
        });
      }
      return Notifications.instance.push(options);
    };

    Notifications.prototype.push = function(options) {
      var note;
      options._dismiss = this.onDismiss;
      note = new Notification(this.notificationTemplate, options);
      this.flipIn(note.view);
      return this.notifications.push(note);
    };

    Notifications.prototype.flipIn = function(view) {
      if (this.notifications.length === 0) {
        this.notificationsContainer.addClass("flipInX");
        return this.content.prepend(view);
      } else {
        return this.content.prepend(view);
      }
    };

    Notifications.prototype.onDismiss = function(notification, callback) {
      this.removeNotification(notification);
      if (callback != null) {
        return callback();
      }
    };

    // Hack to fix trigger click problem
    Notifications.dismissAll = function() {
      if (Notifications.instance !== null) {
        return Notifications.instance.dismissAll();
      }
    };

    Notifications.prototype.dismissAll = function() {
      var notification, _i, _len, _ref, _results;
      _ref = this.notifications;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        notification = _ref[_i];
        _results.push(notification.dismiss());
      }
      return _results;
    };

    



    Notifications.prototype.removeNotification = function(notification) {
      this.notifications.remove(notification);
      notification = null;
      if (this.notifications.length === 0) {
        return this.notificationsContainer.removeClass("flipInX active");
      }
    };

    return Notifications;

  }).call(this);

}).call(this);

