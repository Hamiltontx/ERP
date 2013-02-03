//grid
~function($, undefined) {

    $x = "";
    $.widget('jx.grid', {

        options: {
              sort: '[0, 1, 2]'
            , center: '[0]'
            , urlData: null
            , qtd_rws: 10
            , line_edit: true
        },

        _create: function() {

            var 
            s = this,
	        o = s.options,
            el = s.element,
            tgrd = el.attr("id");
            $data_grid = {idr:0, sel_last:false};

            var mgrid = el.dataTable({
                "iDisplayLength": o.qtd_rws,
                "sPaginationType": "full_numbers",
                "bServerSide": true,
                "sAjaxSource": o.urlData,
                //"sDom": 'lfrtip',
                "sDom": '<""l>t<"F"p>',

                "fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                  var ele = $(nRow);
                  ele.css("cursor","pointer");
                  ele.data("id",_.last(aData));
                  s._acoesGrid(ele.attr("tabIndex",iDisplayIndex));
                },



                "fnDrawCallback": function() {  
                                            
                                            if (o.line_edit) {

                                                $("tr", this).each(function(i) {
                                                    var ele = $(this);
                                                    ele.parent().find("tr:first").click();
                                                });

                                                if ($data_grid.sel_last)
                                                {
                                                    $data_grid.idr = o.qtd_rws
                                                    $data_grid.sel_last = false;
                                                }
                                                if ($data_grid.idr) {
                                                    var trs = "tr:eq(" + $data_grid.idr+")";
                                                    $(trs, this).find("td:eq(0)").click();
                                                }
                                                
                                            }
                                            
                                            if (this.dataTable().fnSettings()._iRecordsTotal<=0)
                                            {
                                                $(this).next().hide();
                                                $(o.btn_edit).add(o.btn_remove).hide();
                                            }else{
                                                $(this).next().show();
                                                $(o.btn_edit).add(o.btn_remove).show();
                                            }
                                                
                },

                "bJQueryUI": true
            });


            $(o.btn_edit).click(function(){
                 s._openEdit();
            });

            $(o.btn_remove).click(function(){
                $(o.tlaEdit).Tela("remove",$(".row_selected"));
            });

            $(o.btn_novo).click(function(){
                $(o.tlaEdit).Tela("open",{cleanForm:true});
            });

            $('#proc').submit(function(ev) {
                ev.preventDefault();

                    var pal = $("#palavra")
                    string = pal.val(), 
                    search = mgrid.fnGetData(0),
                    pSearch = (search) ? {} : "";

                    if (search) {
                        search = search[search.length-2];

                        _.each(search, function(el, ix) {
                            pSearch[el] = string;
                        });

                        pSearch = JSON.stringify(pSearch, null, 2);
                    }

                    mgrid.fnFilter(pSearch);

                    pal.val(string);
                    pal.focus();

            });

        },

        _acoesGrid: function(obj) {
       
            var 
            s = this,
            idedit = obj.data("id");

            obj
            .click(function(){ 
                $(this).parent().find("tr").removeClass("selected_row").find("td").css({ "background":"", "color":"" });
                $(this).addClass("selected_row").find("td").css({ "background":"#3c4d69", "color":"#FFF" });
                $(this).focus();
                
            })
            .unbind("dblclick keydown")
            .bind("keydown", function(e) {
                 var 
                   code = (e.keyCode ? e.keyCode : e.which)
                 , el =  $(this)
                 , grid = el.parent().parent()
                 , _next = function(el) {
                        if ($("#"+grid.attr("id")+"_next").hasClass("ui-state-disabled") === false)
                            grid.dataTable().fnPageChange('next');
                    }
                 , _prev = function(el) {
                        if ($("#"+grid.attr("id")+"_previous").hasClass("ui-state-disabled") === false)
                        {
                            $("#"+grid.attr("id")).dataTable().fnPageChange('previous');
                            $data_grid.sel_last = true;
                        }
                        
                    }   
                 switch (code) {
                    case 40:
                        el.next().click();
                        if (el.next().length === 0)
                            _next(el);
                        break;
                    case 38:
                        el.prev().click();
                        if (el.prev().length === 0)
                            _prev(el);
                        break; 
                    case 34:
                         _next(el);
                         break; 
                    case 33:
                         _prev(el);
                         break;
                    case 13:
                        s._openEdit();
                        return false;
                        break; 
                      
                    }
                })
                .bind("dblclick", function() {
                    s._openEdit();
                });
               
        
        },

        _openEdit: function() {
              this.options.tlaEdit();
        },

        destroy: function() {
            $.Widget.prototype.destroy.call(this);
        },

        widget: function() {
            return this.jxgrid;
        }
    });



} (jQuery);