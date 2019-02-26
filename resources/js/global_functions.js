'use strict';
(function ($) {

  function window_width(fraction) {
    fraction = typeof fraction !== 'undefined' ? fraction : 1;
    return jQuery(window).width() / fraction;
  }

  function window_height(fraction) {
    fraction = typeof fraction !== 'undefined' ? fraction : 1;
    return jQuery(window).height() / fraction;
  }

  $(function () {

    // smooth scroll

    function smooth_scroll(id, offset, speed) {
      //console.log($(id).offset());

      const viewport_scrolltop = $('#viewport').scrollTop();
      const element_position = $(id).offset().top;

      const destination = viewport_scrolltop + element_position;

      //console.log(element_position);
      //console.log(destination);

      $('#viewport').animate({
        scrollTop: destination - offset
      }, speed);

      return false;
    }

    $('.smooth-scroll').click(function (e) {
      e.preventDefault();

      const link_href = $(this).attr('href');
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

    $('#nav-cycle').on('cycle-after',function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag){
      if ($(incomingSlideEl).data().slideNum === 0 || $(incomingSlideEl).data().slideNum === "0"){
        $('input.location-mapper').focus();
      }});

    $.fn.do_nav = function (options, callback) {
      const settings = $.extend({
        action: 'open',
        slide: 0
      }, options);

      if (settings.action === 'close') {
        window.ce.ce("setNavState", {});
      } else {
        window.ce.ce("setNavState", settings);
      }

      if (settings.action === 'close') {
        $('#nav-overlay').fadeOut(250);
        $('#nav-controls').fadeIn();
        $('body').removeClass('nav-open');
      } else {
        $('#nav-overlay').fadeIn(250, function () {
          $('body').addClass('nav-open');

          if (typeof callback === 'function') {
            callback.call(this);
          }
          if (settings.slide === 0||settings.slide === "0"){
            $('input.location-mapper').focus();
          }
          $('#nav-cycle').cycle('goto', settings.slide);

        });
      }
    };


    // VARIABLE DETAIL

    $.fn.do_detail = function (options) {
      const settings = $.extend({
        action: 'open'
      }, options);

      let id = null;
      if (settings.action === 'open' || "detail" in settings) {
        let link_href = "detail" in settings ? "#detail-" + settings.detail : this.attr('href').replace(/\//g, "");
        id = link_href.replace("#detail-", "");
        const detail_item = $('#detail-overlay').find(link_href);
        const detail_div = detail_item.parents('.nav-detail');

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
      window.ce.ce("setNavState", {"detail": id});

    };

    // home page menu

    $.fn.nav_scroll = function (options) {
      const settings = $.extend({
        action: 'open'
      }, options);

      let nav_height = $('#main-header').outerHeight();
      const init_viewport_height = $('#viewport').outerHeight();

      //console.log(init_viewport_height);

      const default_margin = parseInt($('#viewport').css('margin-top'));
      let new_viewport_margin, new_viewport_height;

      const last_y = $('#viewport').scrollTop();

      $('#viewport').scroll(function () {

        // scroll position

        const y = $('#viewport').scrollTop();

        if (y >= 0) {

          // scroll distance (up = negative, down = positive)

          const scroll_distance = y - last_y;

          // current nav top

          const nav_position = parseInt($('#main-header').css('top'));
          const viewport_margin = parseInt($('#viewport').css('margin-top'));
          let new_nav_position;
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
    };

    $(document).nav_scroll();

    $(window).resize(function () {
      if ($('body').hasClass('page-type-location') || $('body').hasClass('page-type-text')) {
        $('#viewport').css('height', $(window).height() - 40 - parseInt($('#viewport').css('margin-top')) + 'px');
      }
    });

    $('.launch-nav').click(function (e) {
      e.preventDefault();

      const goto_slide = $(this).attr('data-nav-slide');
      const current_slide = $('#nav-cycle').data('cycle.opts').currSlide;

      $(document).do_nav({
        slide: goto_slide
      });
    });

    $('.launch-detail').click(function (e) {
      e.preventDefault();

      const detail_id = $(this).attr('href');

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

    $('#nav-controls a').click(function(e) {
      e.preventDefault();

      var link_href = $(this).attr('href');
      var slide_num = $(link_href).attr('data-slide-num');

      console.log(slide_num);

      $(document).do_nav({
        slide: slide_num
      });
    });

    $('.nav-left').click(function () {
      $('#nav-cycle').cycle('prev');
    });

    $('.nav-right').click(function () {
      $('#nav-cycle').cycle('next');
    });

    // tabs

    //$('.nav-vars-tab').tabs();
    //$('.nav-stations-tab').tabs();

    // keyboard actions

    $('body').on('keyup', function (e) {

      if ($('body').hasClass('detail-open')) {
        if (e.keyCode === 27) {
          $(document).do_detail({
            action: 'close'
          });
        }
      } else if ($('body').hasClass('nav-open')) {
        if (e.keyCode === 39) {
          $('.cycle-slideshow').cycle('next');
        }

        if (e.keyCode === 37) {
          $('.cycle-slideshow').cycle('prev');
        }

        if (e.keyCode === 27) {
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
      if ($(this).hasClass('share-facebook')) return;

      e.preventDefault();

      if ($(this).hasClass('share-permalink')) {
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
        const width = 575,
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


    const locations = [
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
      const accordion = $(this).find('.data-accordion');

      //console.log(accordion);

      $(this).find('.data-accordion-tab').first().addClass('open'); //.find('h4').hide();
    });

    $('.data-accordion-tab header').click(function () {

      console.log('clicked');

      const parent_tab = $(this).parents('.data-accordion-tab');
      const parent_accordion = parent_tab.parents('.data-accordion');

      const parent_tab_name = parent_tab[0].id;

      if (!parent_tab.hasClass('open')) {
        parent_accordion.children('.data-accordion-tab').each(function () {
          $(this).removeClass('open');
        });

        parent_tab.addClass('open');
      }

      if (parent_tab_name === 'temperature-chart') {
        setTimeout(function () {
          tempChart.resize();
        }, 100);
      }

      if (parent_tab_name === 'precipitation-chart') {
        setTimeout(function () {
          precipChart.resize();
        }, 100);
      }

      if (parent_tab_name === 'derived-chart') {
        setTimeout(function () {
          derivedChart.resize();
        }, 100);
      }
      // precipChart.resize();
      // derivedChart.resize();
    });

    function accordion_width() {
      $('.data-accordion-content').each(function () {
        const content_div = $(this);
        const accordion = content_div.parents('.data-accordion');

        const width_percent = 0.9;

        /*
                    if (window_width() <= 800) {
                      width_percent = 0.5;
                    }
        */

        const accordion_width = accordion.width() * width_percent;

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
      const spaceleft = $('#main-header').height() + $('#left-header .blue-menu').height();
      const filler_height = window_height() - spaceleft - 60;
      $('.left-filler').css('height', filler_height);
      $('.left-filler .zoom').css('height', filler_height - 40);
      $('.left-filler .fs-range').css('height', filler_height - 40);
    }

    // year

    $('.year').each(function () {
      const year_slider = $(this).find('.year-slider');

      const tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();

      const year_min = parseInt($(this).find('.year-min').text());
      const year_max = parseInt($(this).find('.year-max').text());

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
      const slider = $(this).siblings('.ui-slider');

      const max_value = slider.slider('option', 'max');
      const min_value = slider.slider('option', 'min');
      let slider_value = parseInt(slider.attr('data-value'));

      if ($(this).hasClass('plus') && slider_value !== max_value) {
        slider_value += 1;
        //console.log(slider_value);
      }

      if ($(this).hasClass('minus') && slider_value !== min_value) {
        slider_value -= 1;
        //console.log(slider_value);
      }

      slider.slider('value', slider_value);
    });


    // layer info

    $.fn.close_layer_info = function () {
      $('.menu').find('.legend').each(function () {
        $(this).removeClass('info-on').find('.layer-info').fadeOut(250);
      });
    };

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

      const current_legend = $(this).parents('.legend');

      if (current_legend.hasClass('info-on')) {
        $('body').close_layer_info();
      } else {
        current_legend.open_layer_info();
      }
    });

    // SPLIT PANE

    $('.split-pane').splitPane();


    // disable selection while dragging

    let mouse_down = false;

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

    $(document).on('mouseup touchend', function () {
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

      if ($('body').hasClass('page-type-location')) {
        $('.ui-slider-range').addClass('accent-background').html('<span class="icon icon-arrow-left-right"></span>');

        setTimeout(function () {
          tempChart.resize();
          precipChart.resize();
          derivedChart.resize();
        }, 1500);
      }

      let state = window.ce.ce("getNavState");
      if (state.slide) {
        $(document).do_nav(state);
      }
      if (state.detail) {
        $(document).do_detail(state);
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

  //mobile topnav expand
  $('#expand-topnav-btn').click(function() {
    let x = document.getElementById("main-nav");
    if (x.className === "topnav") {
      x.className += " expanded";
      $('.nav-pages .spacer-bars').hide();
    } else {
      x.className = "topnav";
      $('.nav-pages .spacer-bars').show();
    }
  });

}(jQuery));
