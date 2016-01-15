(function($) {
  
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
  
  $(function() {
    
    // smooth scroll
    
    function smooth_scroll(id, offset, speed) {
      var viewport_scrolltop = $('#viewport').scrollTop();
      var element_position = $(id).position().top;
      
      var destination = viewport_scrolltop + element_position;
      
  		$("#viewport").animate({
  		  scrollTop: destination-offset
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
    

    // NAV
    
    $('.launch-nav').click(function(e) {
      e.preventDefault();
      
      var goto_slide = $(this).attr('data-nav-slide');
      var current_slide = $('#nav-cycle').data('cycle.opts').currSlide;
      
      if (goto_slide != current_slide) {
        $('#nav-cycle').cycle('goto', goto_slide).on( 'cycle-after', function( event, opts ) {
          open_nav();
        });
      } else {
        open_nav();
      }
    });
    
    function open_nav() {
      $('#nav-overlay').fadeIn(250);
      $('body').addClass('nav-open');
    }
    
    function close_nav() {
      $('#nav-overlay').fadeOut(250);
      $('body').removeClass('nav-open');
    }
    
    $('#nav-trigger').click(function(e) {
      e.preventDefault();
      open_nav();
    });
    
    $('#nav-close').click(function(e) {
      e.preventDefault();
      close_nav();
    });
    
    $('.nav-left').click(function(e) {
      $('#nav-cycle').cycle('prev');
    });
    
    $('.nav-right').click(function(e) {
      $('#nav-cycle').cycle('next');
    });
    
    $('.nav-vars-tab').tabs();
    $('.nav-topics-tab').tabs();
    
    $('body').on('keyup', function(e) {
      if ($('body').hasClass('nav-open')) {
        if (e.keyCode == 39) {
          $('.cycle-slideshow').cycle('next');
        }
        
        if (e.keyCode == 37) {
          $('.cycle-slideshow').cycle('prev');
        }
        
        if (e.keyCode == 27) {
          close_nav();
        }
      }
    });
    
    // SHARE
    
    $('.share-trigger').click(function(e) {
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
    
    // LOCATION
    
    if ($('#page-nav').length) {
      var sticky = new Waypoint.Sticky({
        element: $('#page-nav')[0],
        context: $("#viewport")
      });
  	
    	$('#page-nav a').click(function(e) {
      	e.preventDefault();
      	
      	var link_href = $(this).attr('href');
      	smooth_scroll(link_href, 50, 500);
    	});
    }
    
    $('.dropdown').dropdown();
    
    function equalize_charts() {
      /*$('.data-accordion').each(function() {
        var option_list = $(this).parents('.location-data-section').find('.data-options');
        var list_height = option_list.height(); // - 20; // subtract borders
        $(this).height(list_height);
      });*/
    }
    
    $('.location-data-section').each(function() {
      var accordion = $(this).find('.data-accordion');
      
      //console.log(accordion);
      
      $(this).find('.data-accordion-tab').first().addClass('open'); //.find('h4').hide();
    });
    
    $('.data-accordion-tab h4').click(function() {
      var parent_accordion = $(this).parents('.data-accordion');
      
      parent_accordion.children('.data-accordion-tab').toggleClass('open');
      //parent_accordion.children('.data-accordion-tab').find('h4').fadeToggle();
    });
    
    function accordion_width() {
      $('.data-accordion-content').each(function() {
        var content_div = $(this);
        var accordion = content_div.parents('.data-accordion');
        var accordion_width = accordion.width() * 0.9;
        
        content_div.css('width', accordion_width);
        
        //$(this).find('.chart-canvas-wrap').css('width', accordion_width);
        
        if (content_div.hasClass('chart')) {
        }
      });
    }
    
    // chart
    
    function get_chart_data(chart_id, start, end) {
      var ajax_url = 'ajax_chart.php?id=' + chart_id + '&start=' + start + '&end=' + end;
      
      var json_data = [];
      
      $.ajax({
        url: ajax_url,
        async: false,
        dataType: 'json',
        success: function (json) {
          json_data = json.result;
        }
      });
      
      return json_data;
    }
    
  	function draw_charts(chart_div) {
    	var chart_canvas = chart_div.find('.chart-canvas');
    	
    	var start = chart_div.find('.chart-range').attr('data-start');
    	var end = chart_div.find('.chart-range').attr('data-end');
    	
      chart_ID = chart_canvas.attr('id');
      chart_data = get_chart_data(123, start, end);
      
      var ctx = document.getElementById(chart_ID).getContext("2d");

      window.myLine = new Chart(ctx).Line(chart_data, {
        animation: false,
  			responsive: true,
  			scaleShowVerticalLines: false,
  			bezierCurve: false,
  			datasetStrokeWidth: 5,
        pointDotRadius: 6,
        pointDotStrokeWidth: 3,
        pointHitDetectionRadius: 10,
        legendTemplate: '<span></span>',
  			datasetFill: false,
  			showTooltips: false,
  			scaleFontFamily: 'Roboto'
  		});
  	}
  	
  	$('.chart-range').each(function() {
      var tooltip_min = $('<span class="tooltip">' + $(this).attr('data-start') + '</span>').hide();
      var tooltip_max = $('<span class="tooltip">' + $(this).attr('data-end') + '</span>').hide();
      
    	$(this).slider({
        range: true,
        min: 2010,
        max: 2100,
        values: [ 2010, 2100 ],
        step: 5,
        slide: function( event, ui ) {
          $(this).attr('data-start', ui.values[0]);
          $(this).attr('data-end', ui.values[1]);
          
          tooltip_min.text(ui.values[0]);
          tooltip_min.fadeIn(200);
          
          tooltip_max.text(ui.values[1]);
          tooltip_max.fadeIn(200);
          
          draw_charts($(this).parents('.chart'));
        }
      });
      
      $(this).find(".ui-slider-range").addClass('accent-background').html('<span class="icon icon-arrow-left-right"></span>');
      
      $(this).find('.ui-slider-handle').first().append(tooltip_min);
      $(this).find('.ui-slider-handle').last().append(tooltip_max);
      
      $(this).hover(function() {
        tooltip_min.fadeIn(200);
        tooltip_max.fadeIn(200);
      }, function() {
        tooltip_min.fadeOut(100);
        tooltip_max.fadeOut(100);
      });
    });
  	    
    // VARIABLES
    
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
    
    $('.zoom-slider').slider({
      orientation: "vertical",
      range: false,
      min: 1,
      max: 15,
      value: 1,
      change: function( event, ui ) {
        $(this).attr('data-value', ui.value);
      },
      stop: function( event, ui ) {
        $(this).attr('data-value', ui.value);
      }
    });
    
    // year
    
    $('.year').each(function() {
      var year_slider = $(this).find('.year-slider');
      
      var tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();
      
      var year_min = parseInt($(this).find('.year-min').text());
      var year_max = parseInt($(this).find('.year-max').text());
      
      year_slider.slider({
        range: false,
        min: year_min,
        max: year_max,
        value: 2016,
        slide: function(event, ui) {
          tooltip.text(ui.value);
          tooltip.fadeIn(200);
        },
        change: function(event, ui) {
          year_slider.attr('data-value', ui.value);
        },
        stop: function(event, ui) {
          year_slider.attr('data-value', ui.value);
        }
      }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);
      
      $(this).hover(function() {
        tooltip.fadeIn(200);
      }, function() {
        tooltip.fadeOut(100);
      });
    });
    
    $('.ui-slider-label').click(function() {
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
    
    // case
    
    $('#case-menu .color').mouseenter(function() {
      $(this).siblings('.tooltip').fadeIn(200);
    }).mouseleave(function() {
      $(this).siblings('.tooltip').fadeOut(100);
    });
    
    // load functions
    
    $(window).load(function() {
      equalize_charts();
      equalize_left_header();
      accordion_width();
      
      setTimeout(function() {
        $('.chart').each(function() {
          draw_charts($(this));
        });
      }, 1000);
    });
    
    // resize functions
    
    $(window).resize(function() {
      equalize_charts();
      equalize_left_header();
      accordion_width();
    });
    
  });
}(jQuery));