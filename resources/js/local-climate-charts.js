'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';

  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  // enable custom selction boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('varriable-select');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');
  enableCustomSelect('presentation-select');

  // init slider
  initSlider();


  // valid monlthly varriables
  // monlthly timeperoid is only valud for limitited varriables
  // to dissable those varriabls from the user we use this constant
  const validMonthly = ['tmax', 'tmin', 'pcpn'];

  // function to enable downloads (images and data)
  $('.download-select li a').click( function (e) {
    const downloadAction = $(this).attr('rel');

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-image': // download image
        window.tempChart.download_image(this, 'graph.png');
        break;
      case 'download-observed-data':
        window.tempChart.download_hist_obs_data(this);
        break;
      case 'download-historical-modeled-data':
        window.tempChart.download_hist_mod_data(this);
        break;
      case 'download-projected-modeled-data':
        window.tempChart.download_proj_mod_data(this);
        break;
      case 'download-interpreting':
        break;
      default:
        window.tempChart.download_image(this, 'graph.png');
    }
  });

  // toggle filters click
  $('#filters-toggle').click( function(e) {
      const target = $(e.target);
      if (target.hasClass('closed-filters')) {
        target.removeClass('closed-filters');
      } else {
        target.addClass('closed-filters');
      }

      const infoRowElem = $('#info-row');
      if ($(infoRowElem).hasClass('closed-filters')) {
        $(infoRowElem).removeClass('closed-filters');
      } else {
        $(infoRowElem).addClass('closed-filters');
      }

      const chartRowElem = $('#chart-row');
      if ($(chartRowElem).hasClass('closed-filters')) {
        $(chartRowElem).removeClass('closed-filters');
      } else {
        $(chartRowElem).addClass('closed-filters');
      }

      setTimeout(function () {
        window.tempChart.resize();
      }, 600);
  })

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);

    // toggle button visual state
    toggleButton($(target));

    // change select pulldowns for resposnive mode
    setSelectFromButton(target);


    handleChartMapClick(target);
  })


  // eanbles time annual, monlthly click events
  $('#time-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    // not all varriables can display monthly chart
    // when the varriable cannot display monthly chart do
    // do execute the click event
    if ( notDisabled ) {
      const val = target.attr('val')

      // toggle button visual state
      toggleButton(target);

      // update chart frequency value
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);

      // change select pulldowns for resposnive mode
      setSelectFromButton(target);
    }
  })

  // in repsonsive mode the time is a pulldown this eanbles the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').attr('rel')

      // toggle button visual state
      toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

      handleChartMapClick(target);
    }
  })

  // in repsonsive mode the time is a pulldown this eanbles the change of the timeperiod
  // to update the chart
  $('#time-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').attr('rel')

      // toggle button visual state
      toggleButton($(`.btn-${$('#time-select-vis').attr('rel')}`));

      // update chart frequency slider based on timeperiod
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);
    }
  })

  // adds a click event to turn off chart layers aka what you
  // see on the chart
  $('#legend-wrapper').click( function(e) {
    const target = $(e.target);

    // update the chart layers
    updateChartLayers(target);
  })

  // adds a click event to change the presentation the chart
  // from actual to anomaly
  $('#presentation-wrapper').click( function(e) {
      const target = $(e.target);
      const val = target.attr('val');

      // toggle button visual state
      toggleButton(target);

      // updates the chart for actual to anomaly
      updatePresentation(val)

      // updates the select pulldown for repsonsive mode
      setSelectFromButton(target);
  })

  // in repsonsive mode the presentation is a pulldown this eanbles the change of the presentation
  // to update the chart
  $('#presentation-select-vis').bind('cs-changed', function(e) {
      const val = $('#presentation-select-vis').attr('rel');

      // toggle button visual state
      toggleButton($(`.btn-${$('#presentation-select-vis').attr('rel')}`));

      // updates the button for when leaving repsonsive mode (small screen)
      updatePresentation(val)
  })

  // adds time perioid click
  $('#monthly-select-wrapper').click( function(e) {
    const target = $(e.target);
    const val = target.attr('val');

    // toggle button visual state
    toggleButton(target);

    // change time period
    updateTimePeriod(val);
  })

  // binds update of chart varriable to change of selector
  $('#varriable-select-vis').bind('cs-changed', function (e) {
  const variable = $('#varriable-select-vis').attr('rel');
    // update the chart based on char varriable
    window.tempChart.update({
      variable
    });

    window.ce.ce('setVariablesMapState',{variable})

    // update the text
    updateTitle($('#varriable-select-vis').text());

    // disable varriablles if they are valid time period
    const isvalid =   jQuery.inArray( variable , validMonthly);
    if (  isvalid < 0 ) {
      $('[val="monthly"]').addClass('btn-default-disabled')
      $('[val="monthly"]').removeClass('btn-default')
    } else {
      $('[val="monthly"]').removeClass('btn-default-disabled')
      $('[val="monthly"]').addClass('btn-default')
    }
  });

  // this function changes chart layers based on what the user
  // clicks on
  function updateChartLayers(target){
    target.toggleClass('selected');
    const allItems = $(target).parent().children();

    // map all buttons and get the val from html val attribute
    const valid = allItems.map( function()  {
      const elAttribute = $(this).attr('val');
      var obj = Object.assign({}, this);
      obj[elAttribute] = $(this).hasClass('selected');
      return obj;
    })

    // flatten the array
    var merged = Object.assign.apply(Object, valid);
    let scenario = true;

    // check scenarios

    // both rcp45 & rcp85
    if(merged.rcp45 && merged.rcp85) {
      scenario = 'both';
    }

    // rcp45
    if(merged.rcp45 && !merged.rcp85) {
      scenario = 'rcp45';
    }

    // rcp86
    if(!merged.rcp45 && merged.rcp85) {
      scenario = 'rcp85';
    }

    // Neihter rcp45 & rcp85
    if(!merged.rcp45 && !merged.rcp85) {
      scenario = '';
    }

    // set historical
    const histmod = merged.hist_mod;
    const histobs = merged.histobs;

    // update chart
    window.tempChart.update({
      scenario,
      histmod,
      histobs
    });
  }

  // this function forces a map legend button to be selcted css class
  function forceSlected(selector) {
    $(selector).addClass('selected');
  }

  // this function firce a map legend to be "un selected" css class
  function forceUnSlected(selector) {
    $(selector).removeClass('selected');
  }

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-varriable').html(chartText);
  }

  // this function dissables varriables when monthly period is selected
  function validVarrablesDisable() {
    $('#varriable-select-wrapper .default-select-option').each( function()  {
      const attribute =  $(this).attr('rel');
      const isvalid =   jQuery.inArray( attribute, validMonthly);
      if (  isvalid < 0 ) {
        $(this).addClass('default-select-option-disabled');
        $(this).removeClass('default-select-option');
      }
    })
  }

  // this function enables varriables when annual period is selected
  function validVarrablesEnable() {
    $('#varriable-select-wrapper .default-select-option-disabled').each( function()  {
      const attribute =  $(this).attr('rel');
      $(this).removeClass('default-select-option-disabled');
      $(this).addClass('default-select-option');
    })
  }

  // update slider dispaly
  // monthly uses choice buttons
  // anuall uses slider of years 1950-2099
  function updateFrequencySlider(targetval) {
    switch (targetval) {
      case 'annual':
        annualSliderOn();
        monthlySelectOff();
        validVarrablesEnable();
        break;
      case 'monthly':
        monthlySelectOn();
        annualSliderOff();
        validVarrablesDisable();
        break;
      default:
        annualSliderOn();
        monthlySelectOff();
        validVarrablesEnable();
    }
  }

  // this function changes the frequency for the charts
  function updateFrequency(targetval) {
    window.tempChart.update({
      frequency: targetval,
      variable: $('#varriable-select-vis').attr('rel'),
      histobs: true,
    });
    forceSlected('.btn-histobs');
  }

  // this function changes the presentation (anomaly,actual) for the charts
  function updatePresentation(targetval) {
    window.tempChart.update({
      presentation: targetval
    });
  }
  // this function changes the time period for monthly chart centered on 2025, 2050, 2075
  function updateTimePeriod(targetval) {
    window.tempChart.update({
      timeperiod: targetval
    });
  }



  // This function will be called whenever the user changes the x-scale in the graph.
  function xrangesetmon() {
    // Force the slider thumbs to adjust to the appropriate place
     $("#slider-range").slider("option", "values", [0, 1]);
  }

  // this function sets the xrangeset
  function xrangeset(min, max) {
    // Force the slider thumbs to adjust to the appropriate place
    var sliderElem = document.getElementById('slider-range');
    if (sliderElem) {
      sliderElem.noUiSlider.set([min, max]);
    }
  }

  function initSlider() {
    annualSliderOn();
    monthlySelectOff();

    var sliderElem = document.getElementById('slider-range');
    if (sliderElem) {
      noUiSlider.create(sliderElem, {
          start: [20, 80],
          connect: true,
          range: {
              'min': 1950,
              'max': 2099
          },
          step: 1,
          // Handles start at ...
          start: [1950, 2099]
      });

      // set slider on slide event
      sliderElem.noUiSlider.on('slide', function () {
        const values = sliderElem.noUiSlider.get();
        const minValue = parseInt(values[0]);
        const maxValue =  parseInt(values[1]);
        $('#slider-value-high').text(maxValue);
        $('#slider-value-low').text(minValue);

        // update chart with new max min range
        return window.tempChart.setXRange(minValue, maxValue);
      });

      // update chart with default starting min max
      const values = sliderElem.noUiSlider.get();
      const minValue = parseInt(values[0]);
      const maxValue =  parseInt(values[1]);
      $('#slider-value-high').text(maxValue);
      $('#slider-value-low').text(minValue);
    }

    $('#monthly-select-wrapper').hide();
  }

  function annualSliderOn() {
    $('#annual-slider-wrapper').removeClass('d-none');
    $('#annual-slider-wrapper').addClass('d-flex-center');
  }

  function annualSliderOff() {
    $('#annual-slider-wrapper').addClass('d-none');
    $('#annual-slider-wrapper').removeClass('d-flex-center');
  }

  function monthlySelectOn() {
    $('#monthly-select-wrapper').removeClass('d-none');
    $('#monthly-select-wrapper').addClass('d-flex-center');
  }

  function monthlySelectOff() {
    $('#monthly-select-wrapper').addClass('d-none');
    $('#monthly-select-wrapper').removeClass('d-flex-center');
  }

  window.tempChart = climate_widget.graph({
    'div': "div#chart-123",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': 'annual',
    'timeperiod': '2025',
    'county': window.ce.ce('getLocationPageState')['fips'],
    'variable':'tmax',
    'scenario': 'both',
    'presentation': 'absolute',
    'pmedian': true,
    'hmedian': false,
    'histobs': false,
    'histmod': true,
    'xrangefunc': xrangeset(1950, 2099)
  });

  setTimeout(function () {
    window.tempChart.resize();
  }, 700);

  $(window).resize(function () {
    window.tempChart.resize();
  });


  const variable = window.ce.ce('getVariablesPageState')['variable'];
  if ( variable !== undefined) {
    const $styledSelect = $('.select.varriable-select div.select-styled');
    $(`[rel="${variable}"]`).click();

    // change chart varriable
    window.tempChart.update({
      variable
    });
  }

});
