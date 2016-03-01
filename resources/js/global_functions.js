(function ($) {

    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    if (filename.toLowerCase().indexOf("location") >= 0) {
        $("#breadcrumb").html('<span class="level-2">Location results</span> <span class="level-1">Seattle, WA</span>');
    }
    if (filename.toLowerCase().indexOf("variables") >= 0) {
        $("#breadcrumb").html('<span class="level-2">Variable</span> <span class="level-1">Average Mean Temperature</span>');
    }
    if (filename.toLowerCase().indexOf("case_fire-regimes") >= 0) {
        $("#breadcrumb").html('<span class="level-3">Impacts</span> <span class="level-2">Case</span> <span class="level-1">Fire Regimes</span>');
    }

    function window_width(fraction) {
        fraction = typeof fraction !== 'undefined' ? fraction : 1;
        var window_width = jQuery(window).width() / fraction;
        return window_width;
    }

    function window_height(fraction) {
        fraction = typeof fraction !== 'undefined' ? fraction : 1;
        var window_height = jQuery(window).height() / fraction;
        return window_height;
    }

    $(function () {

        // smooth scroll

        function smooth_scroll(id, offset, speed) {
            var viewport_scrolltop = $('#viewport').scrollTop();
            var element_position = $(id).position().top;

            var destination = viewport_scrolltop + element_position;

            $("#viewport").animate({
                scrollTop: destination - offset
            }, speed);

            return false;
        }

        $('.smooth-scroll').click(function(e) {
            e.preventDefault();

            var link_href = $(this).attr('href');
            smooth_scroll(link_href, 0, 500);
        });

        // AJAX

        /*
         $('a:not(.no-ajax)').on('click',function(){
         var link_href = $(this).attr('href');

         $.ajax({
         url: link_href,
         success: function(data) {
         $('#help-content').html(data);
         }
         });
         });

         */


        // ---
        //
        // NAV
        //
        // ---
        
        // plugin
        
        $.fn.do_nav = function(options, callback) {
          var settings = $.extend({
            action: 'open',
            slide: 0
          }, options);
          
          $('#nav-cycle').cycle('goto', settings.slide);
          
          if (settings.action === 'close') {
            $('#nav-overlay').fadeOut(250);
            $('.nav-detail').fadeOut();
            $('body').removeClass('nav-open');
          } else {
            $('#nav-overlay').fadeIn(250, function() {
              $('body').addClass('nav-open');
              
              if (typeof callback == 'function') {
                callback.call(this);
              }
            });
          }
        }
        
        // home page menu

        $('.launch-nav').click(function (e) {
          e.preventDefault();

          var goto_slide = $(this).attr('data-nav-slide');
          var current_slide = $('#nav-cycle').data('cycle.opts').currSlide;

          if (goto_slide != current_slide) {
            $(document).do_nav({
              slide: goto_slide
            });
          } else {
            $(document).do_nav();
          }
        });
        
        // nav trigger

        $('#nav-trigger').click(function (e) {
            e.preventDefault();
            
            $(document).do_nav({
              action: 'open',
              slide: 0
            });
        });
        
        // close button

        $('#nav-close').click(function (e) {
            e.preventDefault();
            
            $(document).do_nav({
              action: 'close'
            });
        });
        
        // nav slide pagers

        $('.nav-left').click(function (e) {
            $('#nav-cycle').cycle('prev');
        });

        $('.nav-right').click(function (e) {
            $('#nav-cycle').cycle('next');
        });

        // tabs
        
        //$('.nav-vars-tab').tabs();
        $('.nav-topics-tab').tabs();

        // keyboard actions
        
        $('body').on('keyup', function (e) {
          if ($('body').hasClass('nav-open')) {
            if (e.keyCode == 39) {
              $('.cycle-slideshow').cycle('next');
            }
            
            if (e.keyCode == 37) {
              $('.cycle-slideshow').cycle('prev');
            }
            
            if (e.keyCode == 27) {
              $(document).do_nav({
                action: 'close'
              });
            }
          }
        });
        
        // VARIABLE DETAIL
        
        $.fn.open_nav_detail = function () {
          var link_href = $(this).attr('href');
          var parent_slide = $(link_href).parents('.slide');
          
          if (!$('body').hasClass('nav-open')) {
            $(document).do_nav({
              slide: 1
            }, function() {
              parent_slide.find('.nav-detail').fadeIn();
              $(link_href).fadeIn();
            });
          }
        }
        
        $('#nav-variables ol a, #vars-menu .about-link a').click(function(e) {
          e.preventDefault();
          $(this).open_nav_detail();
        });
        
        $('.nav-detail .close-detail').click(function(e) {
          e.preventDefault();
          $('.nav-detail, .nav-detail-item').fadeOut();
        });

        // -----
        //
        // SHARE
        //
        // -----

        $('.share-trigger').click(function (e) {
            e.preventDefault();

            if ($(this).hasClass('open')) {
                $(this).removeClass('open').siblings('ul').animate({
                    height: '0'
                }, 500);
            } else {
                $(this).addClass('open').siblings('ul').animate({
                    height: '180px'
                }, 500);
            }
        });

        // --------
        //
        // LOCATION
        //
        // --------

        if ($('#page-nav').length) {
            var sticky = new Waypoint.Sticky({
                element: $('#page-nav')[0],
                context: $("#viewport")
            });

            $('#page-nav a').click(function (e) {
                e.preventDefault();

                var link_href = $(this).attr('href');
                smooth_scroll(link_href, 50, 500);
            });
        }
        
        // LOCATION DATA ACCORDIONS

        // set up each section

        $('.location-data-section').each(function () {
            var accordion = $(this).find('.data-accordion');

            //console.log(accordion);

            $(this).find('.data-accordion-tab').first().addClass('open'); //.find('h4').hide();
        });

        $('.data-accordion-tab header').click(function () {
            var parent_tab = $(this).parents('.data-accordion-tab');
            var parent_accordion = parent_tab.parents('.data-accordion');

            if (!parent_tab.hasClass('open')) {
                parent_accordion.children('.data-accordion-tab').each(function () {
                    $(this).removeClass('open');
                });

                parent_tab.addClass('open');
            }

        });

        function accordion_width() {
            $('.data-accordion-content').each(function () {
                var content_div = $(this);
                var accordion = content_div.parents('.data-accordion');
                var accordion_width = accordion.width() * 0.9;

                content_div.css('width', accordion_width);

                //$(this).find('.chart-canvas-wrap').css('width', accordion_width);

                if (content_div.hasClass('chart')) {
                }
            });
        }

        // download

        $('.chart-download-image').click(function (e) {
            e.preventDefault();
            $(this).parents('.data-chart').find('.chart').draw_charts({
                download_png: true
            });
        });

        // ---------
        //
        // VARIABLES
        //
        // ---------

        function equalize_left_header() {
            var spaceleft = $('#main-header').height() + $('#left-header .blue-menu').height();
            var filler_height = window_height() - spaceleft - 60;
            $('.left-filler').css('height', filler_height);
            $('.left-filler .zoom').css('height', filler_height - 40);
            $('.left-filler .fs-range').css('height', filler_height - 40);
        }

        /*$('.about-links').equalize({
         target: 'a'
         });*/

        $('#vars-menu input[type=checkbox]').lc_switch();

        // zoom

        $('.zoom-slider').attr('data-value', 4);
        $('.zoom-slider').slider({
            orientation: "vertical",
            range: false,
            min: 1,
            max: 15,
            value: 4,
            slide: function( event, ui ) {
              $(this).attr('data-value', ui.value);
              app.setZoom(ui.value);
            },
            change: function (event, ui) {
              $(this).attr('data-value', ui.value);
              app.setZoom(ui.value);
            }
        });

        // year

        $('.year').each(function () {
            var year_slider = $(this).find('.year-slider');

            var tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();

            var year_min = parseInt($(this).find('.year-min').text());
            var year_max = parseInt($(this).find('.year-max').text());

            year_slider.slider({
                range: false,
                min: year_min,
                max: year_max,
                value: 2016,
                slide: function (event, ui) {
                    tooltip.text(ui.value);
                    tooltip.fadeIn(200);
                },
                change: function (event, ui) {
                    year_slider.attr('data-value', ui.value);
                },
                stop: function (event, ui) {
                    year_slider.attr('data-value', ui.value);
                }
            }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);

            $(this).hover(function () {
                tooltip.fadeIn(200);
            }, function () {
                tooltip.fadeOut(100);
            });
        });

        $('.ui-slider-label').click(function () {
            var slider = $(this).siblings('.ui-slider');

            var max_value = slider.slider('option', 'max');
            var min_value = slider.slider('option', 'min');
            var slider_value = parseInt(slider.attr('data-value'));

            if ($(this).hasClass('plus') && slider_value != max_value) {
                slider_value += 1;
                //console.log(slider_value);
            }

            if ($(this).hasClass('minus') && slider_value != min_value) {
                slider_value -= 1;
                //console.log(slider_value);
            }

            slider.slider('value', slider_value);
        });

        /*$('.ui-slider-handle').tooltip({
         content: function() {
         var element = $(this).parents('.year-slider');
         console.log(element.attr('data-value'));
         return element.attr('data-value');
         }
         });*/

        // --------
        //
        // CASE MAP
        //
        // --------
        
        // sortable
        
        $('#case-menu').sortable({
            axis: 'y',
            placeholder: 'ui-state-highlight',
            cancel: '.layer-info,.help',
            containment: '#left-header',
            cursor: 'move',
            forcePlaceholderSize: true,
            opacity: 0.75,
            revert: 250,
            activate: function (event, ui) {
                $('body').close_layer_info();
            },
            deactivate: function (event, ui) {
                console.log('sortable menu callback');
            }
        });

        $('#case-menu').disableSelection();
        
        // tooltip
        
        $('#case-menu .color').mouseenter(function () {
            $(this).siblings('.tooltip').fadeIn(200);
        }).mouseleave(function () {
            $(this).siblings('.tooltip').fadeOut(100);
        });

        // layer info

        $.fn.close_layer_info = function () {
            $('.menu').find('.legend').each(function () {
                $(this).removeClass('info-on').find('.layer-info').fadeOut(250);
            });
        }

        $.fn.open_layer_info = function () {
            $('body').close_layer_info();
            this.addClass('info-on').find('.layer-info').fadeIn();
        };

        // close btn

        $('.legend .layer-info-close').click(function (e) {
            e.preventDefault();
            $('body').close_layer_info();
        });

        // next btn

        $('.legend .layer-info-next').click(function (e) {
            e.preventDefault();
            $(this).parents('.legend').next('.legend').open_layer_info();
        });

        // help icon

        $('.legend .help').click(function (e) {
            e.preventDefault();

            var current_legend = $(this).parents('.legend');

            if (current_legend.hasClass('info-on')) {
                $('body').close_layer_info();
            } else {
                current_legend.open_layer_info();
            }
        });
        
        // SPLIT PANE

        $('.split-pane').splitPane();

<<<<<<< Updated upstream
        $('#case-menu').sortable({
            axis: 'y',
            placeholder: 'ui-state-highlight',
            cancel: '.layer-info,.help',
            containment: '#left-header',
            cursor: 'move',
            forcePlaceholderSize: true,
            opacity: 0.75,
            revert: 250,
            activate: function (event, ui) {
                $('body').close_layer_info();
            },
            deactivate: function (event, ui) {
              app.reorderLayers();
=======
        // disable selection while dragging

        var mouse_down = false;

        $('.split-pane-divider').on('mousedown touchstart', function (e) {
            e.preventDefault();
            mouse_down = true;
        });

        $('.split-pane-divider').on('mousemove touchmove', function (e) {
            e.preventDefault();
            if (mouse_down) {
                //console.log('mouse down');
                $('body').disableSelection();
>>>>>>> Stashed changes
            }
        });
        
        $(document).on('mouseup touchend', function (e) {
            mouse_down = false;
            //console.log('mouse up');
            $('body').enableSelection();
        });
        
        // ------------
        //
        // MISC PLUGINS
        //
        // ------------
        
        // FORMSTONE

        $('.dropdown').dropdown();
         
        // LAYER TOGGLE

        $('#vars-menu input[type=checkbox]').lc_switch(); 

        // -------------------
        //
        // PAGE LOAD FUNCTIONS
        //
        // -------------------

        $(window).load(function () {
            equalize_left_header();
            accordion_width();
            $('#case-menu .legend').first().open_layer_info();

            setTimeout(function () {
                $('.chart').each(function () {
                    cwg.resize();
                });
            }, 1000);
        });

        // ----------------
        //
        // RESIZE FUNCTIONS
        // 
        // ----------------

        $(window).resize(function () {
            equalize_left_header();
            accordion_width();
        });

    });
}(jQuery));
