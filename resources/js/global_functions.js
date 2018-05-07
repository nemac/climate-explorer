(function ($) {

    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    var name;

    /*if (filename.toLowerCase().indexOf("location") >= 0) {
      name = getParameterByName('city');
      $("#breadcrumb").html('<span class="level-2">Location results</span> <span class="level-1">'+name.split(',')[0]+', <span class="state-name caps">'+name.split(',')[1]+'</span></span>');
    }
    if (filename.toLowerCase().indexOf("variables") >= 0) {
      $("#breadcrumb").html('<span class="level-2">Variable</span> <span class="level-1">Average Mean Temperature</span>');
    }
    if (filename.toLowerCase().indexOf("case") >= 0) {
      name = getParameterByName('id');
      $("#breadcrumb").html('<span class="level-2">station</span> <span class="level-1">'+name.split(',')[0].replace(/_/g, ' ')+'</span></span>');
    }*/

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

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        url = url.toLowerCase(); // This is just to avoid case sensitiveness
        name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();// This is just to avoid case sensitiveness for query parameter name
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    $(function () {

        // smooth scroll

        function smooth_scroll(id, offset, speed) {
            //console.log($(id).offset());

            var viewport_scrolltop = $('#viewport').scrollTop();
            var element_position = $(id).offset().top;

            var destination = viewport_scrolltop + element_position;

            //console.log(element_position);
            //console.log(destination);

            $('#viewport').animate({
                scrollTop: destination - offset
            }, speed);

            return false;
        }

        $('.smooth-scroll').click(function (e) {
            e.preventDefault();

            var link_href = $(this).attr('href');
            smooth_scroll(link_href, $('#main-header').outerHeight(), 500);
        });

        // WINDOW SIZE CLASSES

        // on load

        //update with following forced by jquery upgrade
        //$(window).load(function() {
        $(window).on('load', function () {

            if (window_width() <= 600) {
                $('body').addClass('size-600');
            } else if (window_width() <= 800) {
                $('body').addClass('size-800');
            } else if (window_width() <= 1000) {
                $('body').addClass('size-1000');
            } else if (window_width() <= 1200) {
                $('body').addClass('size-1200');
            } else {
                $('body').addClass('size-max');
            }

        });

        // resize

        $(window).resize(function () {

            if (window_width() <= 600) {
                $('body').removeClass('size-max').removeClass('size-800').removeClass('size-1000').removeClass('size-1200');
                $('body').addClass('size-600');
            } else if (window_width() <= 800) {
                $('body').removeClass('size-max').removeClass('size-600').removeClass('size-1000').removeClass('size-1200');
                $('body').addClass('size-800');
            } else if (window_width() <= 1000) {
                $('body').removeClass('size-max').removeClass('size-600').removeClass('size-800').removeClass('size-1200');
                $('body').addClass('size-1000');
            } else if (window_width() <= 1200) {
                $('body').removeClass('size-max').removeClass('size-600').removeClass('size-800').removeClass('size-1000');
                $('body').addClass('size-1200');
            } else {
                $('body').removeClass('size-600').removeClass('size-800').removeClass('size-1000').removeClass('size-1200');
                $('body').addClass('size-max');
            }

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

        $.fn.do_nav = function (options, callback) {
            var settings = $.extend({
                action: 'open',
                slide: 0
            }, options);

            if (settings.action === 'close') {
                $('#nav-overlay').fadeOut(250);
                $('#nav-controls').fadeIn();
                $('body').removeClass('nav-open');
            } else {
                $('#nav-overlay').fadeIn(250, function () {
                    $('body').addClass('nav-open');

                    if (typeof callback == 'function') {
                        callback.call(this);
                    }

                    $('#nav-cycle').cycle('goto', settings.slide);
                });
            }
        }

        // VARIABLE DETAIL

        $.fn.do_detail = function (options, callback) {
            var settings = $.extend({
                action: 'open'
            }, options);

            if (settings.action === 'open') {

                var link_href = this.attr('href').replace(/\//g, "");

                var detail_item = $('#detail-overlay').find(link_href);
                var detail_div = detail_item.parents('.nav-detail');

                // hide all detail divs & items
                $('.nav-detail, .nav-detail-item').hide();

                // show the selected div & item
                detail_div.show();
                detail_item.show();

                $('#detail-overlay').fadeIn(500, function () {
                    $('body').addClass('detail-open');
                });

            } else if (settings.action === 'close') {
                $('#detail-overlay, .nav-detail, .nav-detail-item').fadeOut(250, function () {
                    $('body').removeClass('detail-open');
                });
            }

        }

        // home page menu

        $.fn.nav_scroll = function (options, callback) {
            var settings = $.extend({
                action: 'open'
            }, options);

            var nav_height = $('#main-header').outerHeight();
            var init_viewport_height = $('#viewport').outerHeight();

            //console.log(init_viewport_height);

            var default_margin = parseInt($('#viewport').css('margin-top'));
            var new_viewport_margin, new_viewport_height;

            var last_y = $('#viewport').scrollTop();

            $('#viewport').scroll(function () {

                // scroll position

                var y = $('#viewport').scrollTop();

                if (y >= 0) {

                    // scroll distance (up = negative, down = positive)

                    var scroll_distance = y - last_y;

                    // current nav top

                    var nav_position = parseInt($('#main-header').css('top'));
                    var viewport_margin = parseInt($('#viewport').css('margin-top'));

                    if (y < last_y) {

                        // scrolling up

                        if (nav_position >= 0) { // full nav is in view
                            new_nav_position = 0;
                            new_viewport_margin = default_margin;
                        } else {
                            new_nav_position = nav_position - scroll_distance;
                            new_viewport_margin = viewport_margin - scroll_distance;

                            // don't let the margin get bigger than the default
                            if (new_viewport_margin >= default_margin) {
                                new_viewport_margin = default_margin;
                            }
                        }

                    } else {

                        // scrolling down

                        if (nav_position <= -nav_height) {
                            new_nav_position = -nav_height;
                            new_viewport_margin = 0;
                        } else {
                            new_nav_position = nav_position - scroll_distance;
                            new_viewport_margin = viewport_margin - scroll_distance;
                        }

                    }

                    new_viewport_height = $(window).height() - 40 - new_viewport_margin;

                    /* removed to prevent click scroll jump
                     if (window_width() >= 1000) {

                      $('#main-header').css('top', new_nav_position + 'px');
                      $('#viewport').css('margin-top', new_viewport_margin + 'px');
                      //$('#viewport').css('margin-top', new_viewport_margin + 'px');

                      $('#viewport').css('height', new_viewport_height + 'px');

                      if ($('#page-nav').hasClass('stuck')) {
                        var page_nav_top = new_viewport_margin + 20;
                        $('#page-nav').css('top', page_nav_top + 'px');
                      }

                      last_y = y;

                    }*/
                } else {
                    if (window_width() >= 1000) {
                        $('#main-header').css('top', '0px');
                        $('#viewport').css('margin-top', '95px');
                    }
                }
            });
        }

        $(document).nav_scroll();

        $(window).resize(function () {
            if ($('body').hasClass('page-type-location') || $('body').hasClass('page-type-text')) {
                new_viewport_height = $(window).height() - 40 - parseInt($('#viewport').css('margin-top'));
                $('#viewport').css('height', new_viewport_height + 'px');
            }
        });

        $('.launch-nav').click(function (e) {
            e.preventDefault();

            var goto_slide = $(this).attr('data-nav-slide');
            var current_slide = $('#nav-cycle').data('cycle.opts').currSlide;

            $(document).do_nav({
                slide: goto_slide
            });
        });

        $('.launch-detail').click(function (e) {
            e.preventDefault();

            var detail_id = $(this).attr('href');

            $(document).do_detail({
                id: detail_id
            });
        });

        // nav trigger

        // close nav

        $('#nav-overlay .close').click(function (e) {
            e.preventDefault();

            $(document).do_nav({
                action: 'close'
            });
        });

        // close detail

        $('#detail-overlay .close, .close-detail').click(function (e) {
            e.preventDefault();

            $(document).do_detail({
                action: 'close'
            });
        });

        // nav slide pagers

        /*$('#nav-controls a').click(function(e) {
          e.preventDefault();

          var link_href = $(this).attr('href');
          var slide_num = $(link_href).attr('data-slide-num');

          console.log(slide_num);

          $(document).do_nav({
            slide: slide_num
          });
        });*/

        $('.nav-left').click(function (e) {
            $('#nav-cycle').cycle('prev');
        });

        $('.nav-right').click(function (e) {
            $('#nav-cycle').cycle('next');
        });

        // tabs

        //$('.nav-vars-tab').tabs();
        //$('.nav-stations-tab').tabs();

        // keyboard actions

        $('body').on('keyup', function (e) {

            if ($('body').hasClass('detail-open')) {
                if (e.keyCode == 27) {
                    $(document).do_detail({
                        action: 'close'
                    });
                }
            } else if ($('body').hasClass('nav-open')) {
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

        $('.nav-detail-link').click(function (e) {
            e.preventDefault();

            $(this).do_detail({
                options: 'open'
            });
        });

        // subnav trigger

        $('#subnav-trigger').click(function (e) {
            e.preventDefault();

            if ($('body').hasClass('subnav-open')) {
                $('body').removeClass('subnav-open');
                $(this).siblings('ul').fadeOut();
            } else {
                $('body').addClass('subnav-open');
                $(this).siblings('ul').fadeIn();
            }

        });

        // left header trigger

        $('#left-header-trigger').click(function (e) {
            e.preventDefault();

            if ($('body').hasClass('left-header-closed')) {
                $('body').removeClass('left-header-closed');
                $('#left-header-trigger').removeClass('icon-variables').addClass('icon-close');
            } else {
                $('body').addClass('left-header-closed');
                $('#left-header-trigger').removeClass('icon-close').addClass('icon-variables');
            }
        });

        // -----
        //
        // SHARE
        //
        // -----

/*
        window.fbAsyncInit = function () {
            FB.init({
                appId: '1515755258521649', // dev
                // appId      : '304370549903730', // prod
                xfbml: true,
                version: 'v2.6'
            });
        };

        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
*/
        $('.share-trigger').click(function (e) {
            e.preventDefault();

            if ($(this).hasClass('open')) {
                $(this).removeClass('open').siblings('ul').animate({
                    height: '0'
                }, 500);

                $('#share-permalink').removeClass('open');
                $('#share-permalink-input').fadeOut(250);
            } else {
                $(this).addClass('open').siblings('ul').animate({
                    height: '180px'
                }, 500);
            }
        });

        $('.share-link').click(function (e) {
            e.preventDefault();

            if ($(this).hasClass('share-facebook')) {
/*
                var share_URL = $(this).attr('data-href');

                FB.ui({
                    method: 'share',
                    href: share_URL,
                }, function (response) {
                    // nothing
                });
*/
            } else if ($(this).hasClass('share-permalink')) {

                if ($('#share-permalink').hasClass('open')) {

                    $('#share-permalink').removeClass('open');
                    $('#share-permalink-input').fadeOut(250);

                } else {

                    $('#share-permalink').addClass('open');

                    $('#share-permalink-input').show().position({
                        my: 'right',
                        at: 'left-15',
                        of: $('#share-permalink')
                    });
                }

            } else {

                var width = 575,
                    height = 320,
                    left = ($(window).width() - width) / 2,
                    top = ($(window).height() - height) / 2,
                    url = this.href,
                    opts = 'status=0' +
                        ',width=' + width +
                        ',height=' + height +
                        ',top=' + top +
                        ',left=' + left;

                window.open(url, 'sharepopup', opts);

            }
        });

        // --------
        //
        // LOCATION
        //
        // --------


        // removed sticky nav
        /*if ($('#page-nav').length) {
            var sticky = new Waypoint.Sticky({
                element: $('#page-nav')[0],
                context: $("#viewport")
            });

            $('#page-nav a').click(function (e) {
                e.preventDefault();

                var link_href = $(this).attr('href');
                smooth_scroll(link_href, ($('#main-header').outerHeight() + $('#page-nav').outerHeight()), 500);
            });
        }*/

        var locations = [
            'Seattle'
        ];

        $('.autocomplete').autocomplete({
            source: locations
        });

        // accordion

        $('.data-options').accordion({
            header: 'h4'
        });

        // LOCATION DATA ACCORDIONS

        // set up each section

        $('.location-data-section').each(function () {
            var accordion = $(this).find('.data-accordion');

            //console.log(accordion);

            $(this).find('.data-accordion-tab').first().addClass('open'); //.find('h4').hide();
        });

        $('.data-accordion-tab header').click(function () {

            console.log('clicked');

            var parent_tab = $(this).parents('.data-accordion-tab');
            var parent_accordion = parent_tab.parents('.data-accordion');

            var parent_tab_name = parent_tab[0].id;

            if (!parent_tab.hasClass('open')) {
                parent_accordion.children('.data-accordion-tab').each(function () {
                    $(this).removeClass('open');
                });

                parent_tab.addClass('open');
            }

            if (parent_tab_name === 'temperature-chart'){
                setTimeout(function () {
                    tempChart.resize();
                }, 100);
            }

            if (parent_tab_name === 'precipitation-chart'){
                setTimeout(function () {
                    precipChart.resize();
                }, 100);
            }

            if (parent_tab_name === 'derived-chart'){
                setTimeout(function () {
                    derivedChart.resize();
                }, 100);
            }
            // precipChart.resize();
            // derivedChart.resize();
        });

        function accordion_width() {
            $('.data-accordion-content').each(function () {
                var content_div = $(this);
                var accordion = content_div.parents('.data-accordion');

                var width_percent = 0.9;

                /*
                            if (window_width() <= 800) {
                              width_percent = 0.5;
                            }
                */

                var accordion_width = accordion.width() * width_percent;

                content_div.css('width', accordion_width);

                //$(this).find('.chart-canvas-wrap').css('width', accordion_width);

                if (content_div.hasClass('chart')) {
                }
            });
        }

        // download

        $('.download-image').click(function (e) {
            e.preventDefault();
            /*$(this).parents('.data-chart').find('.chart').draw_charts({
                download_png: true
            });*/
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

        // zoom
        $('.page-type-case .zoom-slider').attr('data-value', 4);
        $('.page-type-case .zoom-slider').slider({
            orientation: "vertical",
            range: false,
            min: 1,
            max: 15,
            value: 5,
            slide: function (event, ui) {
                $(this).attr('data-value', ui.value);
                impacts.setZoom(ui.value);
            },
            change: function (event, ui) {
                $(this).attr('data-value', ui.value);
                impacts.setZoom(ui.value);
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
            handle: '.icon-arrow-up-down',
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
                impacts.reorderLayers();
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
                impacts.reorderLayers();
            }
        });

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

//    $(window).load(function () {

        $(window).on('load', function () {
            equalize_left_header();
            accordion_width();
            $('#case-menu .legend').first().open_layer_info();

            if ($('body').hasClass('page-type-location')) {
                $('.ui-slider-range').addClass('accent-background').html('<span class="icon icon-arrow-left-right"></span>');

                setTimeout(function () {
                    tempChart.resize();
                    precipChart.resize();
                    derivedChart.resize();
                }, 1500);
            }
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
        //
        // removed - not necessary
        // $('.ui-slider-handle').draggable({
        //     axis: "x"
        // });

        // ----------------
        //
        // MISC
        //
        // ----------------

        // UI accordion

        $('.accordion-plain').accordion({
            collapsible: true,
            header: 'h4',
            icons: {
                'header': 'icon-arrow-right',
                'activeHeader': 'icon-arrow-down'
            },
            heightStyle: 'content'
        });

        // UI tabs

        $('.tabs-plain').tabs({
            active: 0
        });

    });
}(jQuery));
