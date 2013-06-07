define([
  "app"
],

function(app) {

	//Helper's no prototype
	Date.prototype.formatDate = function(dt) {
      var 
      d = dt.getDate(),
      m = dt.getMonth()+1,
      y = dt.getFullYear(),
      h = dt.getHours(),
      mi = dt.getMinutes();
      return '' + (d<=9?'0'+d:d) +'/'+ (m<=9?'0'+m:m) +'/'+ y + ' ' + (h<=9?'0'+h:h) + ':' +  (mi<=9?'0'+mi:mi);
	};
	Number.prototype.formatMoney = function(c, d, t){
	var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
	   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	 };
	// Array.prototype.remove = function(from, to) {
	//   var rest = this.slice((to || from) + 1 || this.length);
	//   this.length = from < 0 ? this.length + from : from;
	//   return this.push.apply(this, rest);
	// };
	//Helper's no prototype

	var Hlp = app.module();

	Hlp = {

		validate: {
        	number: '(\d+)(((.|,)\d+)+)?'
		},

		_applyChosen: function() {
			$("select").each(function() { 
	            var col = $(this).data().autorel;  
	            if (col) {
	              $(this).ajaxChosen({
	                 loadingImg: 'images/loading_chosen.gif',
	                 generateUrl: function() { 
	                  return app.api_url + col + "/find/" + this.value
	                }
	              });
	            }
          	});
		},


		//revisar soma
		soma_total: function() {
			var tt=0,it =0;
			$("[id*=ped_valor]").each(function() {
				if($(this).parent().next().find(".add_prod").is(":visible") === false){
					var vl = ($(this).val()*1), 
					qtd = ($(this).parent().prev().find("input").val()*1);
					tt += qtd*vl;
					it +=1;
				}
			});
			$("#total").text(tt.formatMoney());
			$("#itens").text(it);
		},

		

		doLogin : function() {

			$("#login").on("click", function(ev) {

				ev.preventDefault();
				var
				userId = $("#logName").val(),
				passWrd = $("#pass").val();

				$.getJSON("http://api.icasei.com.br/admin/1.0/login?username="+userId+"&password="+passWrd, function(data){
					if(data.code) {

						app.userId = userId;
						app.passWrd = passWrd;
						app.logedHash = true;
						Hlp.logado();

					}else{
						//window.gap.vibrate(5000);
						$(".home-login").addClass("shake").on("webkitAnimationEnd mozAnimationEnd oAnimationEnd animationend msAnimationEnd", function(){
					 		$(this).removeClass("shake");
					    });

					}
				});

			});

		},
		logado: function() {

			$("nav a").attr("data-nav", "open");
			$("nav li").removeClass("menu-off");
			Backbone.history.navigate('#dashboard', true);
		},
		get_data_geral: function() {
			$.getJSON(app.api_url + 'hlp/sum.j').done(function(d) {
        
		        $("#ped_sep").html(d.ped_sep);

      		});
		}



	}

  return Hlp;

});