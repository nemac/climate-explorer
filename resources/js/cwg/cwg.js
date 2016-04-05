var cwg = null;
var precipChart = null;
var derivedChart = null;

$(document).ready(function() {

    function populate_variables(frequency) {
        var variables = climate_widget.variables(frequency);
        $("select#variable").empty();
        $(variables.map(function(v) {
            return ('<option value="' + v.id + '"' + '>'  + v.title + '</option>');
        }).join("")).appendTo($("select#variable"));
    }
    populate_variables('annual');

    function update_frequency_ui() {
        var freq = $('#frequency').val();
        if (freq === "annual") {
            $('#timeperiod').attr("disabled", "true");
            $('label[for=timeperiod]').css("opacity", 0.5);
            $('#presentation').removeAttr("disabled");
            $('label[for=presentation]').css("opacity", 1.0);
            $('#slider-range').show();
            $('#x-axis-pan-note').hide();
        }
        if (freq === "monthly") {
            $('#timeperiod').removeAttr("disabled");
            $('label[for=timeperiod]').css("opacity", 1.0);
            $('#presentation').attr("disabled", "true");
            $('label[for=presentation]').css("opacity", 0.5);
            $('#slider-range').hide();
            $('#x-axis-pan-note').show();
        }
        if (freq === "seasonal") {
            $('#timeperiod').removeAttr("disabled");
            $('label[for=timeperiod]').css("opacity", 1.0);
            $('#presentation').attr("disabled", "true");
            $('label[for=presentation]').css("opacity", 0.5);
            $('#slider-range').hide();
            $('#x-axis-pan-note').show();
        }
        //populate_variables(freq);
    }

    update_frequency_ui();

    $('#frequency').change(function() {
      update_frequency_ui();
      var id = $('#frequency').val();
      if ( id !== 'annual' ) {
        $('#historical-range, #under-baseline-range, #over-baseline-range').hide();
      } else {
        $('#historical-range, #under-baseline-range, #over-baseline-range').show();
      }
      cwg.update({
        frequency: $('#frequency').val(),
        variable: $('#variable').val()
      });
    });

    $('#precip-frequency').change(function() {
      update_frequency_ui();
      var id = $('#precip-frequency').val();
      if ( id !== 'annual' ) {
        $('#historical-range, #under-baseline-range, #over-baseline-range').hide();
      } else {
        $('#historical-range, #under-baseline-range, #over-baseline-range').show();
      }
      precipChart.update({
        frequency: $('#precip-frequency').val(),
        variable: $('#precip-variable').val()
      });
    });

    $('#timeperiod').change(function() {
        cwg.update({
            timeperiod: $('#timeperiod').val()
        });
    });
    $('#county').change(function() {
        cwg.update({
            fips: $('#county').val()
        });
    });
    $('#variable').change(function() {
      cwg.update({
        variable: $('#variable').val()
      });
    });
    $('#precip-variable').change(function() {
      precipChart.update({
        variable: $('#precip-variable').val()
      });
    });
    $('#derived-variable').change(function() {
      derivedChart.update({
        variable: $('#derived-variable').val()
      });
    });
    $('#scenario').change(function() {
        cwg.update({
            scenario: $('#scenario').val()
        });
    });
    $('#precip-scenario').change(function() {
      precipChart.update({
        scenario: $('#precip-scenario').val()
      });
    });
    $('#derived-scenario').change(function() {
      derivedChart.update({
        scenario: $('#derived-scenario').val()
      });
    });
    $('#presentation').change(function() {
      cwg.update({
        presentation: $('#presentation').val()
      });
    });
    $('#precip-presentation').change(function() {
      precipChart.update({
        presentation: $('#precip-presentation').val()
      });
    });
    $('#derived-presentation').change(function() {
      derivedChart.update({
        presentation: $('#derived-presentation').val()
      });
    });
    $('#median').change(function() {
        cwg.update({
            pmedian: $('#median').val()
        });
    });
    $('#precip-median').change(function() {
      precipChart.update({
        pmedian: $('#precip-median').val()
      });
    });
    $('#derived-median').change(function() {
      derivedChart.update({
        pmedian: $('#derived-median').val()
      });
    });
    $('#range').change(function() {
        cwg.update({
            hrange: $('#range').val(),
            prange: $('#range').val()
        });
    });

    $('#temperature-data .location-resolution a').on('click', function(e) {
      var val = $(this).html().toLowerCase();
      $('#frequency').val(val).change();
    });

    $('#precipitation-data .location-resolution a').on('click', function(e) {
      var val = $(this).html().toLowerCase();
      $('#precip-frequency').val(val).change();
    });

    $('#temperature-data h4').on('click', function() {
      $('ul.data-options li').removeClass('active accent-border');
      $(this).closest('li').addClass('active accent-border');

      var id = $(this).attr('id').replace('var-', '');
      $('#frequency').val('annual').change();
      $('#variable').val(id).change();
    });

    $('#precipitation-data h4').on('click', function() {
      $('ul.data-options li').removeClass('active accent-border');
      $(this).closest('li').addClass('active accent-border');

      var id = $(this).attr('id').replace('var-', '');
      $('#precip-frequency').val('annual').change();
      $('#precip-variable').val(id).change();
    });

    $('#derived-data h4').on('click', function() {
      $('ul.data-options li').removeClass('active accent-border');
      $(this).closest('li').addClass('active accent-border');

      var id = $(this).attr('id').replace('var-', '');
      $('#derived-frequency').val('annual').change();
      $('#derived-variable').val(id).change();
    });

    $('#temperature-presentation').on('change', function() {
      var val = $(this).val();
      $('#presentation').val(val).change();
    });

    $('#precipitation-presentation').on('change', function() {
      var val = $(this).val();
      $('#precip-presentation').val(val).change();
    });

    $('#der-presentation').on('change', function() {
      var val = $(this).val();
      $('#derived-presentation').val(val).change();
    });

    $('.legend-item-range').on('click', function(e) {
      $(this).toggleClass('selected');
      $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');

      var pre = $(this).closest('.chart-legend').attr('id');
      if (!pre) {
        pre = '';
      } else {
        pre = pre.replace('-chart', '');
      }

      var scenario = null;
      switch(true) {
        case $('#'+pre+'rcp85-block').hasClass('selected') && $('#'+pre+'rcp45-block').hasClass('selected'):
          scenario = 'both';
          break;
        case $('#'+pre+'rcp45-block').hasClass('selected'):
          scenario = 'rcp45';
          break;
        case $('#'+pre+'rcp85-block').hasClass('selected'):
          scenario = 'rcp85';
          break;
        default:
          scenario = '';
      }
      if ( pre === 'precip' ) {
        $('#precip-scenario').val(scenario).change();
      } else if ( pre === 'derive' ) {
        $('#derived-scenario').val(scenario).change();
      } else {
        $('#scenario').val(scenario).change();
      }


      var median = null;
      switch(true) {
        case $('#'+pre+'rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#'+pre+'rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#'+pre+'rcp85-line').hasClass('selected'):
          median = 'true';
          break;
        default:
          median = 'false';
      }

      if ( pre === 'precip' ) {
        $('#precip-median').val(median).change();
      } else if ( pre === 'derive' ) {
        $('#derived-median').val(median).change();
      } else {
        $('#median').val(median).change();
      }

    });

    $('#temp-download-image').on('click', function(e) {
      $('#download-image-link-temp').get(0).click();
      return false;
    });

    $('#download-image-precip').on('click', function(e) {
      $('#download-image-link-precip').get(0).click();
      return false;
    });

    $('#download-image-derived').on('click', function(e) {
      $('#download-image-link-derived').get(0).click();
      return false;
    });

    $('.download-data').click(function(e) {
      var id = $(e.target).attr('id');
      var c = ( id === 'temp-download-data' ) ? cwg : precipChart;
      if ( id === 'derived-download-data' ) { c = derivedChart; }
      var $ul = $('#download-panel').find('ul');
      $ul.empty();
      var dataurls = c.dataurls();
      if (dataurls.hist_obs) {
          $ul.append($("<li><a href='"+dataurls.hist_obs+"'>Observed Data</a></li>"));
      }
      if (dataurls.hist_mod) {
          $ul.append($("<li><a href='"+dataurls.hist_mod+"'>Historical Modeled Data</a></li>"));
      }
      if (dataurls.proj_mod) {
          $ul.append($("<li><a href='"+dataurls.proj_mod+"'>Projected Modeled Data</a></li>"));
      }
      $('#download-panel').removeClass("hidden");

    });

    $('#download-dismiss-button').click(function() {
        $('#download-panel').addClass("hidden");
    });

    // download hook
    $('#download-image-link-temp').click(function() {
      cwg.downloadImage(this, 'graph.png');
    });

    $('#download-image-link-precip').click(function() {
      precipChart.downloadImage(this, 'graph.png');
    });

    $('#download-image-link-derived').click(function() {
      derivedChart.downloadImage(this, 'graph.png');
    });

    $("#slider-range").slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [ 1950, 2099 ],
        slide: function( event, ui ) {
            // return the return value returned by setXRange, to keep
            // the slider thumb(s) from moving into a disallowed range
            return cwg.setXRange(ui.values[0], ui.values[1]);
        }
    });

    $("#precip-slider-range").slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [ 1950, 2099 ],
        slide: function( event, ui ) {
            // return the return value returned by setXRange, to keep
            // the slider thumb(s) from moving into a disallowed range
            return precipChart.setXRange(ui.values[0], ui.values[1]);
        }
    });

    $("#derived-slider-range").slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [ 1950, 2099 ],
        slide: function( event, ui ) {
            // return the return value returned by setXRange, to keep
            // the slider thumb(s) from moving into a disallowed range
            return derivedChart.setXRange(ui.values[0], ui.values[1]);
        }
    });

    // This function will be called whenever the user changes the x-scale in the graph.
    function xrangeset(min,max) {
        // Force the slider thumbs to adjust to the appropriate place
        $("#slider-range").slider("option", "values", [min,max]);
    }

    function dxrangeset(min,max) {
      $("#derived-slider-range").slider("option", "values", [min,max]);
    }

    function pxrangeset(min,max) {
      $("#precip-slider-range").slider("option", "values", [min,max]);
    }



    cwg = climate_widget.graph({
        'div'           :  "#chart-123",
        'dataprefix'    : 'http://climateexplorer.habitatseven.work/data',
        'font'          : 'Roboto',
        'frequency'     : $('#frequency').val(),
        'timeperiod'    : $('#timeperiod').val(),
        'fips'          : $('#county').val(),
        'variable'      : $('#variable').val(),
        'scenario'      : $('#scenario').val(),
        'presentation'  : $('#presentation').val(),
        'xrangefunc'    : xrangeset
    });

    precipChart = climate_widget.graph({
        'div'           :  "#chart-234",
        'dataprefix'    : 'http://climateexplorer.habitatseven.work/data',
        'font'          : 'Roboto',
        'frequency'     : $('#precip-frequency').val(),
        'timeperiod'    : $('#precip-timeperiod').val(),
        'fips'          : $('#precip-county').val(),
        'variable'      : $('#precip-variable').val(),
        'scenario'      : $('#precip-scenario').val(),
        'presentation'  : $('#precip-presentation').val(),
        'xrangefunc'    : pxrangeset
    });

    derivedChart = climate_widget.graph({
        'div'           :  "#chart-345",
        'dataprefix'    : 'http://climateexplorer.habitatseven.work/data',
        'font'          : 'Roboto',
        'frequency'     : $('#derived-frequency').val(),
        'timeperiod'    : $('#derived-timeperiod').val(),
        'fips'          : $('#derived-county').val(),
        'variable'      : $('#derived-variable').val(),
        'scenario'      : $('#derived-scenario').val(),
        'presentation'  : $('#derived-presentation').val(),
        'xrangefunc'    : dxrangeset
    });

    setTimeout(function() {
      precipChart.resize();
      derivedChart.resize();
    },600);

    $(window).resize(function() {
      cwg.resize();
      precipChart.resize();
      derivedChart.resize();
    });

});
