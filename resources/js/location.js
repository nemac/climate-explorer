'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';

  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  makeCustomSelect('#stations-select');
  makeCustomSelect('#downnloads-select');
  makeCustomSelect('#varriable-select');

  function makeCustomSelect(selectSelector) {

    // custom select start
    // from https://speckyboy.com/open-source-css-javascript-select-box-snippets/ - https://codepen.io/wallaceerick/pen/ctsCz
    $(selectSelector).each(function(){

        var $this = $(this), numberOfOptions = $(this).children('option').length;
        var iconAttr = $(this).attr('icon');

        if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
          // Element has this attribute
          var icon = `<i class="${iconAttr}"></i>`;
        } else {
          var icon = '';
        }

        $this.addClass('select-hidden');
        $this.wrap('<div class="select"></div>');
        $this.after(`<div class="select-styled">${icon}</div>`);

        var $styledSelect = $this.next('div.select-styled');
        $styledSelect.text($this.children('option').eq(0).text());
        $styledSelect.prepend(icon);

        if ( $(selectSelector).hasClass( 'disabled' )){
          $styledSelect.addClass('disabled');
          return null;
        }

        var $list = $('<ul />', {
            'class': 'select-options'
        }).insertAfter($styledSelect);

        for (var i = 0; i < numberOfOptions; i++) {
            $('<li />', {
                text: $this.children('option').eq(i).text(),
                rel: $this.children('option').eq(i).val(),
                icon: $this.children('option').attr('icon'),
                // future version allow for different icons...
                // html: `${icon}${$this.children('option').eq(i).text()}`
            }).appendTo($list);
        }

        var $listItems = $list.children('li');
        console.log($listItems)

        $styledSelect.click(function(e) {
            e.stopPropagation();
            $('div.select-styled.active').not(this).each(function(){
                $(this).removeClass('active').next('ul.select-options').hide();
            });
            $(this).toggleClass('active').next('ul.select-options').toggle();
        });

        $listItems.click(function(e, icon) {
            e.stopPropagation();
            $styledSelect.text($(this).text()).removeClass('active');
            $styledSelect.prepend(icon);
            $this.val($(this).attr('rel'));

            var iconAttr = $(this).attr('icon');
            if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
              // Element has this attribute
              var icon = `<i class="${iconAttr}"></i>`;
            } else {
              var icon = '';
            }

            $styledSelect.prepend(icon);
            $list.hide();
            console.log($this.val(), $(this).attr('icon') );
        });

        $(document).click(function() {
            $styledSelect.removeClass('active');
            $list.hide();
        });

    });
    // custom select end
  }


  $('#splash-city').text(window.ce.ce('getLocationPageState')['city']);
  $('#splash-county').text(window.ce.ce('getLocationPageState')['county']);
  $('.data-accordion-tab .full-title').text(window.ce.ce('getLocationPageState')['county']);
  $('select#derived-county, select#precip-county, select#county').append($('<option value="' + window.ce.ce('getLocationPageState')['fips'] + '" selected="selected">' + window.ce.ce('getLocationPageState')['county'] + '</option>'));

  var slid = false;
  $('.data-options-trigger').click(function () {
    slid = !slid;
    if (slid) {
      $(this).siblings('.data-options').slideDown();
    } else {
      $(this).siblings('.data-options').slideUp();
    }
  });

  $('#temperature-map-container header').on('click', function () {
    $('#temperature-map').height($('#temperature-map').parent().height());
    $('#location-temperature .location-resolution li').addClass('disabled');
    if (typeof window.temperatureScenariosMap === 'undefined') {
      $('#temperature-map').spinner();
      window.temperatureScenariosMap = $('#temperature-map').scenarioComparisonMap({
        variable: activeVariableTemperature,
        extent: window.ce.ce('getLocationPageState')['extent'],
        center: window.ce.ce('getLocationPageState')['center'],
        zoom: window.ce.ce('getLocationPageState')['zoom'] || 9,
        showCounties: false,
        layersloaded: function layersloaded() {
          $('#temperature-map').spinner('destroy');
        },
        change: function change() {
          window.temperatureScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#temperature-map-season").show(200) : $("#temperature-map-season").hide();
        }
      });
      window.temperatureScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#temperature-map-season").show(200) : $("#temperature-map-season").hide();
    }
  });
  $('#temperature-chart header').on('click', function () {
    $('#location-temperature .location-resolution li').removeClass('disabled');
  });

  $('#precipitation-map-container header').on('click', function () {
    $('#precipitation-map').height($('#precipitation-map').parent().height());
    $('#location-precipitation .location-resolution li').addClass('disabled');
    if (typeof window.precipitationScenariosMap === 'undefined') {
      $('#precipitation-map').spinner();
      window.precipitationScenariosMap = $('#precipitation-map').scenarioComparisonMap({
        variable: activeVariablePrecipitation,
        extent: window.ce.ce('getLocationPageState')['extent'],
        center: window.ce.ce('getLocationPageState')['center'],
        zoom: window.ce.ce('getLocationPageState')['zoom'] || 9,
        showCounties: false,
        layersloaded: function layersloaded() {
          $('#precipitation-map').spinner('destroy');
        },
        change: function change() {
          window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
        }
      });
      window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
    }
  });
  $('#precipitation-chart header').on('click', function () {
    $('#location-precipitation .location-resolution li').removeClass('disabled');
  });

  $('#derived-map-container header').on('click', function () {
    $('#derived-map').height($('#derived-map').parent().height());
    $('#location-derived .location-resolution li').addClass('disabled');
    if (typeof window.derivedScenariosMap === 'undefined') {
      $('#derived-map').spinner();
      window.derivedScenariosMap = $('#derived-map').scenarioComparisonMap({
        variable: ['hdd', 'cdd'].includes(activeVariableDerived) ? activeVariableDerived + '_65f' : activeVariableDerived,
        extent: window.ce.ce('getLocationPageState')['extent'],
        center: window.ce.ce('getLocationPageState')['center'],
        zoom: window.ce.ce('getLocationPageState')['zoom'] || 9,
        showCounties: false,
        layersloaded: function layersloaded() {
          $('#derived-map').spinner('destroy');
        },
        change: function change() {
          window.derivedScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#derived-map-season").show(200) : $("#derived-map-season").hide();
        }
      });
      window.derivedScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#derived-map-season").show(200) : $("#derived-map-season").hide();
    }
  });
  $('#derived-chart header').on('click', function () {
    $('#location-derived .location-resolution li').removeClass('disabled');
  });

  var variable_li_update = function variable_li_update(container, el) {
    // remove all active, accent border and accent color classes
    $(container).find('.active').removeClass('active');
    $(container).find('.accent-border').removeClass('accent-border');
    $(container).find('.accent-color').removeClass('accent-color');

    // set the parent li to active
    el.parents('li').addClass('active').addClass('accent-border');

    // set the first link under the h4 to active
    var first_li = $(el.siblings('ul')).find('li').first();

    first_li.addClass('active').addClass('accent-border');
    first_li.find('a').addClass('accent-color');
  };

  // variable selectors
  $('#temperature-data h4').on('click', function (e) {
    e.preventDefault();
    variable_li_update($('#temperature-data .data-options'), $(this));
    activeVariableTemperature = $(this).data('value');
    if (window.temperatureScenariosMap) {
      $(window.temperatureScenariosMap).scenarioComparisonMap({ variable: activeVariableTemperature });
    }
    $('#temperature-map-container .full-map-btn').prop({ 'href': '/variables/?id=' + activeVariableTemperature });
  });
  $('#precipitation-data h4').on('click', function (e) {
    e.preventDefault();
    variable_li_update($('#precipitation-data .data-options'), $(this));
    activeVariablePrecipitation = $(this).data('value');
    if (window.precipitationScenariosMap) {
      $(window.precipitationScenariosMap).scenarioComparisonMap({ variable: activeVariablePrecipitation });
    }
    $('#precipitation-map-container .full-map-btn').prop({ 'href': '/variables/?id=' + activeVariablePrecipitation });
  });
  $('#derived-data h4').on('click', function (e) {
    e.preventDefault();
    variable_li_update($('#derived-data .data-options'), $(this));
    activeVariableDerived = $(this).data('value');
    if (window.derivedScenariosMap) {
      $(window.derivedScenariosMap).scenarioComparisonMap({
        variable: ['hdd', 'cdd'].includes(activeVariableDerived) ? activeVariableDerived + '_65f' : activeVariableDerived
      });
    }
    $('#derived-map-container .full-map-btn').prop({ 'href': '/variables/?id=' + activeVariableDerived });
  });

  // season selectors
  $('#precipitation-map-season .fs-dropdown-item').on('click', function () {
    $(window.precipitationScenariosMap).scenarioComparisonMap({ season: $(this).data().value });
  });
  $('#temperature-map-season .fs-dropdown-item').on('click', function () {
    $(window.temperatureScenariosMap).scenarioComparisonMap({ season: $(this).data().value });
  });
  $('#derived-map-season .fs-dropdown-item').on('click', function () {
    $(window.derivedScenariosMap).scenarioComparisonMap({ season: $(this).data().value });
  });

  function populate_variables(frequency) {
    var variables = climate_widget.variables(frequency);
    $("select#variable").empty();
    $(variables.map(function (v) {
      return '<option value="' + v.id + '"' + '>' + v.title + '</option>';
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
      // $('#download_hist_mod_data').show();
      // $('#download_precip_hist_mod_data').show();
    }
    if (freq === "monthly") {
      $('#timeperiod').removeAttr("disabled");
      $('label[for=timeperiod]').css("opacity", 1.0);
      $('#presentation').attr("disabled", "true");
      $('label[for=presentation]').css("opacity", 0.5);
      //$('#slider-range').hide();
      $('#x-axis-pan-note').show();
      // $('#download_hist_mod_data').hide();
      // $('#download_precip_hist_mod_data').hide();
    }
    if (freq === "seasonal") {
      $('#timeperiod').removeAttr("disabled");
      $('label[for=timeperiod]').css("opacity", 1.0);
      $('#presentation').attr("disabled", "true");
      $('label[for=presentation]').css("opacity", 0.5);
      //$('#slider-range').hide();
      $('#x-axis-pan-note').show();
    }
    //populate_variables(freq);
  }

  update_frequency_ui();

  $('#frequency').change(function () {
    update_frequency_ui();
    var id = $('#frequency').val();
    if (id !== 'annual') {
      $('#historical-range, #under-baseline-range, #over-baseline-range').hide();
      $('#temperature-chart .legend-item-line.observed').addClass('seasonal');
      if (!$('#historical-obs').hasClass('selected')) {
        $('#historical-obs').trigger('click');
      }
      if (!$('#precip-historical-obs').hasClass('selected')) {
        $('#precip-historical-obs').trigger('click');
      }
    } else {
      $('#historical-range, #under-baseline-range, #over-baseline-range').show();
      $('#temperature-chart .legend-item-line.observed').removeClass('seasonal');
    }

    if (id !== 'annual') {
      $("#slider-range").addClass('not-annual').slider('destroy').slider({
        range: false,
        min: 0,
        max: 2,
        value: 0,
        slide: function slide(event, ui) {
          var val = ui.value === 0 ? '2025' : '2050';
          if (ui.value === 2) {
            val = '2075';
          }
          window.tempChart.update({ timeperiod: val });
        }
      });
      $('#temp-range-low').html('30 Years Centered in 2025');
      $('#temp-range-mid').show().html('30 Years Centered in 2050');
      $('#temp-range-high').html('30 Years Centered in 2075');
    } else {
      var sliderisnotannual = $("#slider-range").hasClass("not-annual");
      if (sliderisnotannual) {
        $("#slider-range").removeClass('not-annual').slider('destroy').slider({
          range: true,
          min: 1950,
          max: 2099,
          values: [1950, 2099],
          slide: function slide(event, ui) {
            return window.tempChart.setXRange(ui.values[0], ui.values[1]);
          }
        }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
      }

      $('#temp-range-low').html('1950');
      $('#temp-range-mid').hide();
      $('#temp-range-high').html('2100');
    }

    window.tempChart.update({
      frequency: $('#frequency').val(),
      variable: $('#variable').val()
    });
  });

  $('#precip-frequency').change(function () {
    update_frequency_ui();
    var id = $('#precip-frequency').val();
    if (id !== 'annual') {
      $('#precip-historical-range, #under-baseline-range, #over-baseline-range').hide();
      $('#precipitation-chart .legend-item-line.observed').addClass('seasonal');
    } else {
      $('#precip-historical-range, #under-baseline-range, #over-baseline-range').show();
      $('#precipitation-chart .legend-item-line.observed').removeClass('seasonal');
    }

    if (id !== 'annual') {
      $("#precip-slider-range").addClass('not-annual').slider('destroy').slider({
        range: false,
        min: 0,
        max: 2,
        value: 0,
        slide: function slide(event, ui) {
          var val = ui.value === 0 ? '2025' : '2050';
          if (ui.value === 2) {
            val = '2075';
          }
          window.precipChart.update({ timeperiod: val });
        }
      });
      $('#precip-range-low').html('30 Years Centered in 2025');
      $('#precip-range-mid').show().html('30 Years Centered in 2050');
      $('#precip-range-high').html('30 Years Centered in 2075');
    } else {
      var psliderisnotannual = $("#precip-slider-range").hasClass("not-annual");
      if (psliderisnotannual) {

        $("#precip-slider-range").removeClass('not-annual').slider('destroy').slider({
          range: true,
          min: 1950,
          max: 2099,
          values: [1950, 2099],
          slide: function slide(event, ui) {
            return window.precipChart.setXRange(ui.values[0], ui.values[1]);
          }
        }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
      }
      $('#precip-range-low').html('1950');
      $('#precip-range-mid').hide();
      $('#precip-range-high').html('2100');
    }

    window.precipChart.update({
      frequency: $('#precip-frequency').val(),
      variable: $('#precip-variable').val()
    });
  });

  $('#timeperiod').change(function () {
    window.tempChart.update({
      timeperiod: $('#timeperiod').val()
    });
  });
  $('#county').change(function () {
    window.tempChart.update({
      fips: $('#county').val()
    });
  });
  $('#variable').change(function () {
    window.tempChart.update({
      variable: $('#variable').val()
    });
  });
  $('#precip-variable').change(function () {
    console.log("PRECIP CHANGE");
    console.log($('#precip-variable').val());
    window.precipChart.update({
      variable: $('#precip-variable').val()
    });
  });
  $('#derived-variable').change(function () {
    window.derivedChart.update({
      variable: $('#derived-variable').val()
    });
  });
  $('#scenario').change(function () {
    window.tempChart.update({
      scenario: $('#scenario').val()
    });
  });
  $('#precip-scenario').change(function () {
    window.precipChart.update({
      scenario: $('#precip-scenario').val()
    });
  });
  $('#derived-scenario').change(function () {
    window.derivedChart.update({
      scenario: $('#derived-scenario').val()
    });
  });
  $('#presentation').change(function () {
    window.tempChart.update({
      presentation: $('#presentation').val()
    });
  });
  $('#precip-presentation').change(function () {
    window.precipChart.update({
      presentation: $('#precip-presentation').val()
    });
  });
  $('#derived-presentation').change(function () {
    window.derivedChart.update({
      presentation: $('#derived-presentation').val()
    });
  });

  $('#median').change(function () {
    window.tempChart.update({
      pmedian: $('#median').val()
    });
  });
  $('#precip-median').change(function () {
    window.precipChart.update({
      pmedian: $('#precip-median').val()
    });
  });
  $('#derived-median').change(function () {
    window.derivedChart.update({
      pmedian: $('#derived-median').val()
    });
  });
  $('#hist-mod').change(function () {
    window.tempChart.update({
      histmod: $('#hist-mod').val()
    });
  });
  $('#precip-hist-mod').change(function () {
    window.precipChart.update({
      histmod: $('#precip-hist-mod').val()
    });
  });
  $('#derived-hist-mod').change(function () {
    window.derivedChart.update({
      histmod: $('#derived-hist-mod').val()
    });
  });
  $('#hist-obs').change(function () {
    window.tempChart.update({
      histobs: $('#hist-obs').val()
    });
  });
  $('#precip-hist-obs').change(function () {
    window.precipChart.update({
      histobs: $('#precip-hist-obs').val()
    });
  });
  $('#derived-hist-obs').change(function () {
    window.derivedChart.update({
      histobs: $('#derived-hist-obs').val()
    });
  });
  $('#range').change(function () {
    window.tempChart.update({
      hrange: $('#range').val(),
      prange: $('#range').val()
    });
  });

  // @arg $wrapper - jquery wrapper of the section DOM wrapper of element that was clicked
  // @arg freq - string of the dataset frequency. Annual or Monthly
  // @arg dataset - string of the dataset, ex Avg Daily Max Temp
  var timescale_label_update = function timescale_label_update($wrapper, freq, dataset) {
    $wrapper.find(".source").html(freq + " " + dataset);
  };

  // @arg $wrapper - jquery wrapper of the section DOM wrapper of element that was clicked
  var find_hidden_select_selector_prepend = function find_hidden_select_selector_prepend($wrapper) {
    var wrapper_id = $wrapper.prop("id");
    var selector_prepend = "#";

    if (wrapper_id === "location-precipitation") {
      selector_prepend += "precip-";
    } else if (wrapper_id === "location-derived") {
      selector_prepend += "derived-";
    }

    return selector_prepend;
  };

  var data_resolution_click_handler = function data_resolution_click_handler(e) {
    if ($(this).parent().hasClass('disabled')) {
      return;
    }

    var $wrapper = $(this).parents(".location-data-section-wrap");
    var dataset = $(this).parents(".location-resolution").siblings("h4").children("a")[0].text;
    var freq = $(this).html();

    timescale_label_update($wrapper, freq, dataset);

    var val = freq.toLowerCase();
    $(find_hidden_select_selector_prepend($wrapper) + "frequency").val(val).change();
  };

  var data_source_click_handler = function data_source_click_handler(e) {
    var val = $(this).children("a");
    var $wrapper = $(this).parents(".location-data-section-wrap");

    timescale_label_update($wrapper, "Annual", val[0].text);

    var id = $(this).attr("id").replace("var-", "");
    var selector_prepend = find_hidden_select_selector_prepend($wrapper);

    $(selector_prepend + "frequency").val("annual").change();
    $(selector_prepend + "variable").val(id).change();
  };

  $('.location-resolution a').on('click', data_resolution_click_handler);
  $('.data-list h4').on('click', data_source_click_handler);

  // $('#temperature-presentation').on('change', function () {
  //   let val = $(this).val();
  //   $('#presentation').val(val).change();
  // });
  // $('#precipitation-presentation').on('change', function () {
  //   let val = $(this).val();
  //   $('#precip-presentation').val(val).change();
  // });
  // $('#der-presentation').on('change', function () {
  //   let val = $(this).val();
  //   $('#derived-presentation').val(val).change();
  // });
  $('.legend-item-range').on('click', function () {
    $(this).toggleClass('selected');
    $(this).find('.legend-item-block, .legend-item-line').toggleClass('selected');

    var pre = $(this).closest('.chart-legend').attr('id');
    if (!pre) {
      pre = '';
    } else {
      pre = pre.replace('-chart', '');
    }

    var scenario = null;
    switch (true) {
      case $('#' + pre + 'rcp85-block').hasClass('selected') && $('#' + pre + 'rcp45-block').hasClass('selected'):
        scenario = 'both';
        break;
      case $('#' + pre + 'rcp45-block').hasClass('selected'):
        scenario = 'rcp45';
        break;
      case $('#' + pre + 'rcp85-block').hasClass('selected'):
        scenario = 'rcp85';
        break;
      default:
        scenario = '';
    }
    if (pre === 'precip') {
      $('#precip-scenario').val(scenario).change();
    } else if (pre === 'derive') {
      $('#derived-scenario').val(scenario).change();
    } else {
      $('#scenario').val(scenario).change();
    }

    var median = 'false';
    if ($('#' + pre + 'rcp85-line').hasClass('selected') || $('#' + pre + 'rcp45-line').hasClass('selected')) {
      median = 'true';
    }

    if (pre === 'precip') {
      $('#precip-median').val(median).change();
    } else if (pre === 'derive') {
      $('#derived-median').val(median).change();
    } else {
      $('#median').val(median).change();
    }

    var histmod = null;
    switch (true) {
      case $('#' + pre + 'historical-block').hasClass('selected') && $('#historical-block').hasClass('selected'):
        histmod = 'true';
        break;
      case $('#' + pre + 'historical-block').hasClass('selected'):
        histmod = 'true';
        break;
      default:
        histmod = 'false';
    }

    if (pre === 'precip') {
      $('#precip-hist-mod').val(histmod).change();
    } else if (pre === 'derive') {
      $('#derived-hist-mod').val(histmod).change();
    } else {
      $('#hist-mod').val(histmod).change();
    }

    var histobs = null;
    switch (true) {
      case $('#' + pre + 'over-baseline-block').hasClass('selected') && $('#under-baseline-block').hasClass('selected'):
        histobs = 'true';
        break;
      case $('#' + pre + 'over-baseline-block').hasClass('selected'):
        histobs = 'true';
        break;
      case $('#' + pre + 'under-baseline-block').hasClass('selected'):
        histobs = 'true';
        break;
      default:
        histobs = 'false';
    }

    if (pre === 'precip') {
      $('#precip-hist-obs').val(histobs).change();
    } else if (pre === 'derive') {
      $('#derived-hist-obs').val(histobs).change();
    } else {
      $('#hist-obs').val(histobs).change();
    }
  });
  $('#temp-download-image').on('click', function () {
    $('#download-image-link-temp').get(0).click();
    return false;
  });
  $('#download-image-precip').on('click', function () {
    $('#download-image-link-precip').get(0).click();
    return false;
  });
  $('#download-image-derived').on('click', function () {
    $('#download-image-link-derived').get(0).click();
    return false;
  });
  $('#temp-download-data').click(function () {

    console.log('.download-data clicked');
    $('#download-panel').removeClass("hidden");
    $('#download-panel').show();
    $('#download-panel').fadeIn(250);
  });

  $('.location-data-section-wrap #temperature-data .seasonal-monthly').click(function () {
    $('#download_hist_mod_data').hide();
  });

  $('.location-data-section-wrap #temperature-data .seasonal-monthly').siblings().click(function () {
    $('#download_hist_mod_data').show();
  });

  $('#precip-download-data').click(function () {

    window.precipChart.update({
      variable: $('#precip-variable').val()
    });
    $('#download-precip-panel').removeClass("hidden");
    $('#download-precip-panel').show();
    $('#download-precip-panel').fadeIn(250);
  });

  $('.location-data-section-wrap #precipitation-data .seasonal-monthly').click(function () {
    $('#download_precip_hist_mod_data').hide();
  });

  $('.location-data-section-wrap #precipitation-data .seasonal-monthly').siblings().click(function () {
    $('#download_precip_hist_mod_data').show();
  });

  $('#derived-download-data').click(function () {

    $('#download-derived-panel').removeClass("hidden");
    $('#download-derived-panel').show();
    $('#download-derived-panel').fadeIn(250);
  });

  $('#download-dismiss-button').click(function () {
    $('#download-panel').fadeOut(250);
  });

  $('#download-precip-dismiss-button').click(function () {
    $('#download-precip-panel').fadeOut(250);
  });

  $('#download-derived-dismiss-button').click(function () {
    $('#download-derived-panel').fadeOut(250);
  });

  $('#download-image-link-temp').click(function () {
    window.tempChart.download_image(this, 'graph.png');
  });
  $('#download-image-link-precip').click(function () {
    window.precipChart.download_image(this, 'graph.png');
  });
  $('#download-image-link-derived').click(function () {
    window.derivedChart.download_image(this, 'graph.png');
  });
  $("#slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function slide(event, ui) {
      // return the return value returned by setXRange, to keep
      // the slider thumb(s) from moving into a disallowed range
      return window.tempChart.setXRange(ui.values[0], ui.values[1]);
    }
  });
  $("#precip-slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function slide(event, ui) {
      // return the return value returned by setXRange, to keep
      // the slider thumb(s) from moving into a disallowed range
      return window.precipChart.setXRange(ui.values[0], ui.values[1]);
    }
  });
  $("#derived-slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function slide(event, ui) {
      // return the return value returned by setXRange, to keep
      // the slider thumb(s) from moving into a disallowed range
      return window.derivedChart.setXRange(ui.values[0], ui.values[1]);
    }
  });
  $('#download_hist_obs_data').click(function () {
    if (window.tempChart) {
      window.tempChart.download_hist_obs_data(this);
    }
  });

  $('#download_hist_mod_data').click(function () {
    if (window.tempChart) {
      window.tempChart.download_hist_mod_data(this);
    }
  });
  $('#download_proj_mod_data').click(function () {
    if (window.tempChart) {
      window.tempChart.download_proj_mod_data(this);
    }
  });

  $('#download_precip_hist_obs_data').click(function () {
    if (window.precipChart) {
      window.precipChart.download_hist_obs_data(this);
    }
  });

  $('#download_precip_hist_mod_data').click(function () {
    if (window.precipChart) {
      window.precipChart.download_hist_mod_data(this);
    }
  });
  $('#download_precip_proj_mod_data').click(function () {
    if (window.precipChart) {
      window.precipChart.download_proj_mod_data(this);
    }
  });

  $('#download_derived_hist_obs_data').click(function () {
    if (window.derivedChart) {
      window.derivedChart.download_hist_obs_data(this);
    }
  });

  $('#download_derived_hist_mod_data').click(function () {
    if (window.derivedChart) {
      window.derivedChart.download_hist_mod_data(this);
    }
  });
  $('#download_derived_proj_mod_data').click(function () {
    if (window.derivedChart) {
      window.derivedChart.download_proj_mod_data(this);
    }
  });

  // This function will be called whenever the user changes the x-scale in the graph.
  function xrangeset(min, max) {
    // Force the slider thumbs to adjust to the appropriate place

    $("#slider-range").slider("option", "values", [min, max]);
  }

  function dxrangeset(min, max) {
    $("#derived-slider-range").slider("option", "values", [min, max]);
  }

  function pxrangeset(min, max) {
    $("#precip-slider-range").slider("option", "values", [min, max]);
  }

  window.tempChart = climate_widget.graph({
    'div': "div#chart-123",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#frequency').val(),
    'timeperiod': $('#timeperiod').val(),
    'county': $('#county').val(),
    'variable': $('#variable').val(),
    'scenario': $('#scenario').val(),
    'presentation': $('#presentation').val(),
    'pmedian': $('#median').val(),
    'histobs': $('#hist-obs').val(),
    'xrangefunc': xrangeset
  });

  window.precipChart = climate_widget.graph({
    'div': "#chart-234",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#precip-frequency').val(),
    'timeperiod': $('#precip-timeperiod').val(),
    'county': $('#precip-county').val(),
    'variable': $('#precip-variable').val(),
    'scenario': $('#precip-scenario').val(),
    'presentation': $('#precip-presentation').val(),
    'pmedian': $('#precip-median').val(),
    'histobs': $('#precip-hist-obs').val(),
    'xrangefunc': pxrangeset
  });

  window.derivedChart = climate_widget.graph({
    'div': "#chart-345",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#derived-frequency').val(),
    'timeperiod': $('#derived-timeperiod').val(),
    'county': $('#derived-county').val(),
    'variable': $('#derived-variable').val(),
    'scenario': $('#derived-scenario').val(),
    'presentation': $('#derived-presentation').val(),
    'pmedian': $('#derived-median').val(),
    'histobs': $('#derived-hist-obs').val(),
    'xrangefunc': dxrangeset
  });

  setTimeout(function () {
    window.tempChart.resize();
    window.precipChart.resize();
    window.derivedChart.resize();
  }, 700);
  $(window).resize(function () {
    window.tempChart.resize();
  });
  $(window).resize(function () {
    window.precipChart.resize();
  });
  $(window).resize(function () {
    window.derivedChart.resize();
  });
});
