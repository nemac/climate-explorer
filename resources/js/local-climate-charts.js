'use strict';

ClimateByLocationWidget.areas_json_url = '/resources/vendor/areas.json'

$(function () {

  // get city, state from state url
  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  let isAlaska = false;
  let isHawaii = false;

  if (cityStateCE) {
    isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
    isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  $('#default-city-state').text(cityStateCE);
  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  if (!cityStateCE) {
    $('#default-in').addClass('d-none');
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  if (cityStateCE) {
    if (cityStateCE.indexOf('County') > 0) {
      $('#default-in').addClass('d-none');
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }

  // enable custom selection boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('variable-select');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');
  enableCustomSelect('presentation-select');

  // init slider
  initSlider();
  initVarriableToolTips();
  monthlySelectOff();

  // valid monthly variables
  // monthly timeperiod is only valid for limited variables
  // to disable those variables from the user we use this constant
  const validMonthly = ['tmax', 'tmin', 'pcpn'];

  $('#clear-location').click(function (e) {
    const target = $(e.target);
    handleClearLocationClick(target);
  });

  // function to enable downloads (images and data)
  $('.download-select li a').click(function (e) {
    const downloadAction = $(e.currentTarget).parent().attr('id');
    if ($(e.currentTarget).hasClass('disabled')) {
      return null;
    }
    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-image': // download image
        window.cbl_instance.download_image(e.currentTarget);
        break;
      case 'download-observed-data':
        window.cbl_instance.download_hist_obs_data(e.currentTarget);
        break;
      case 'download-historical-modeled-data':
        window.cbl_instance.download_hist_mod_data(e.currentTarget);
        break;
      case 'download-projected-modeled-data':
        window.cbl_instance.download_proj_mod_data(e.currentTarget);
        break;
      case 'download-interpreting':
        break;
      default:
        window.cbl_instance.download_image(e.currentTarget);
    }
  });

  // toggle filters click
  $('#filters-toggle').click(function (e) {
    const target = $(e.target);
    if (target.hasClass('closed-filters')) {
      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-filters', 'open');
      target.removeClass('closed-filters');
    } else {
      target.addClass('closed-filters');
      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-filters', 'close');
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
      window.cbl_instance.resize();
    }, 600);
  });

  // enables time chart, map click events
  $('#chartmap-wrapper').keyup(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    if (notDisabled) {
      if (e.keyCode === 13) {
        const target = $(e.target);

        // toggle button visual state
        toggleButton($(target));

        // change select pulldowns for responsive mode
        setSelectFromButton(target);

        handleChartMapClick(target);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'chartmap', target);
      }
    }
  });

  // enables time chart, map click events
  $('#chartmap-wrapper').click(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    if (notDisabled) {
      // toggle button visual state
      toggleButton($(target));

      // change select pulldowns for responsive mode
      setSelectFromButton(target);

      handleChartMapClick(target);

      // ga event action, category, label
      googleAnalyticsEvent('click', 'chartmap', target);
    }
  });

  // enables time annual, monthly click events
  $('#time-wrapper').click(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    // not all variables can display monthly chart
    // when the variable cannot display monthly chart do
    // do execute the click event
    if (notDisabled) {
      const val = target.attr('val');

      // toggle button visual state
      toggleButton(target);

      // update chart frequency value
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);

      // change select pulldowns for responsive mode
      setSelectFromButton(target);

      // ga event action, category, label
      googleAnalyticsEvent('click', 'update-time', val);
    }
  });

  // enables time annual, monthly click events
  $('#time-wrapper').keyup(function (e) {
    if (e.keyCode === 13) {
      const target = $(e.target);
      const notDisabled = !target.hasClass('btn-default-disabled');

      // not all variables can display monthly chart
      // when the variable cannot display monthly chart do
      // do execute the click event
      if (notDisabled) {
        const val = target.attr('val');

        // toggle button visual state
        toggleButton(target);

        // update chart frequency value
        updateFrequency(val);

        // update chart frequency slider based on timeperiod
        updateFrequencySlider(val);

        // change select pulldowns for responsive mode
        setSelectFromButton(target);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'update-time', val);
      }
    }
  });

  // in responsive mode the time is a dropdown this enables the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const val = $('#time-select-vis').attr('rel');

      // toggle button visual state
      toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

      handleChartMapClick(target);
    }
  });

  // in responsive mode the time is a dropdown this enables the change of the timeperiod
  // to update the chart
  $('#time-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const val = $('#time-select-vis').attr('rel');

      // toggle button visual state
      toggleButton($(`.btn-${$('#time-select-vis').attr('rel')}`));

      // update chart frequency slider based on timeperiod
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);
    }
  });

  // adds a click event to turn off chart layers aka what you
  // see on the chart
  $('#legend-wrapper').click(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if (notDisabled) {
      // update the chart layers
      updateChartLayers(target);

      // ga event action, category, label
      googleAnalyticsEvent('click', 'legend-wrapper', target);
    }
  });

  // adds a click event to turn off chart layers aka what you
  // see on the chart
  $('#legend-wrapper').keyup(function (e) {
    if (e.keyCode === 13) {
      const target = $(e.target);
      const notDisabled = !target.hasClass('disabled');
      if (notDisabled) {
        // update the chart layers
        updateChartLayers(target);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'legend-wrapper', target);
      }
    }
  });

  // adds a click event to change the presentation the chart
  // from actual to anomaly
  $('#presentation-wrapper').click(function (e) {
    const target = $(e.target);
    const val = target.attr('val');

    // toggle button visual state
    toggleButton(target);

    // updates the chart for actual to anomaly
    updatePresentation(val);

    // updates the select dropdown for responsive mode
    setSelectFromButton(target);

    // ga event action, category, label
    googleAnalyticsEvent('click', 'presentation', val);
  });

  // in responsive mode the presentation is a dropdown this enables the change of the presentation
  // to update the chart
  $('#presentation-select-vis').bind('cs-changed', function (e) {
    const val = $('#presentation-select-vis').attr('rel');

    // toggle button visual state
    toggleButton($(`.btn-${$('#presentation-select-vis').attr('rel')}`));

    // updates the button for when leaving responsive mode (small screen)
    updatePresentation(val)
  });

  // adds time period click
  $('#monthly-select-wrapper').click(function (e) {
    const target = $(e.target);
    const val = target.attr('val');

    // toggle button visual state
    toggleButton(target);

    // change time period
    updateTimePeriod(val);

    // ga event action, category, label
    googleAnalyticsEvent('click-tab', 'monthly-select-wrapper', val);
  });

  // binds update of chart variable to change of selector
  $('#variable-select-vis').bind('cs-changed', function (e) {
    const variable = $('#variable-select-vis').attr('rel');
    // update the chart based on char variable
    if (window.cbl_instance) {
      window.cbl_instance.update({
        variable
      });
    }
    window.ce.ce('setVariablesMapState', {variable});

    // update the text
    updateTitle($('#variable-select-vis').text());

    // disable variables if they are valid time period
    const isvalid = jQuery.inArray(variable, validMonthly);
    if (isvalid < 0) {
      $('[val="monthly"]').addClass('btn-default-disabled');
      $('[val="monthly"]').removeClass('btn-default')
      $('[rel="monthly"]').addClass('default-select-option-disabled');
    } else {
      $('[val="monthly"]').removeClass('btn-default-disabled')
      $('[val="monthly"]').addClass('btn-default')
      $('[rel="monthly"]').removeClass('default-select-option-disabled');
    }
    if (isAlaska) {
      $('[val="monthly"]').addClass('btn-default-disabled');
      $('[rel="monthly"]').addClass('default-select-option-disabled');
    }
  });

  // this function changes chart layers based on what the user
  // clicks on
  function updateChartLayers(inTarget) {
    let target = inTarget;
    if ($(inTarget).attr('class').includes('inner')) {
      target = $(inTarget).parent();
    }
    target.toggleClass('selected');
    const allItems = $(target).parent().children();

    // map all buttons and get the val from html val attribute
    const valid = allItems.map(function () {
      const elAttribute = $(this).attr('val');
      var obj = Object.assign({}, this);
      obj[elAttribute] = $(this).hasClass('selected');
      return obj;
    });

    // flatten the array
    var merged = Object.assign.apply(Object, valid);
    let scenario = true;

    // check scenarios

    // both rcp45 & rcp85
    if (merged.rcp45 && merged.rcp85) {
      scenario = 'both';
    }

    // rcp45
    if (merged.rcp45 && !merged.rcp85) {
      scenario = 'rcp45';
    }

    // rcp86
    if (!merged.rcp45 && merged.rcp85) {
      scenario = 'rcp85';
    }

    // Neither rcp45 & rcp85
    if (!merged.rcp45 && !merged.rcp85) {
      scenario = '';
    }


    // ga event action, category, label
    googleAnalyticsEvent('change', 'chart', scenario + '-' + merged.hist_mod + '-' + merged.histobs);

    // update chart
    if (window.cbl_instance) {
      window.cbl_instance.update({
        show_projected_rcp45: merged.rcp45,
        show_projected_rcp85: merged.rcp85,
        show_historical_modeled: merged.hist_mod,
        show_historical_observed: merged.histobs
      });
    }
  }

  // this function forces a map legend button to be selected css class
  function forceSelected(selector) {
    $(selector).addClass('selected');
  }

  // this function force a map legend to be "un selected" css class
  function forceUnSelected(selector) {
    $(selector).removeClass('selected');
  }

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-variable').html(chartText);
  }

  // this function disables variables when monthly period is selected
  function validVarrablesDisable() {
    $('#variable-select-wrapper .default-select-option').each(function () {
      const attribute = $(this).attr('rel');
      const isvalid = jQuery.inArray(attribute, validMonthly);
      if (isvalid < 0) {
        $(this).addClass('default-select-option-disabled');
        $(this).removeClass('default-select-option');
      }
    })
  }

  // this function enables variables when annual period is selected
  function validVarrablesEnable() {
    $('#variable-select-wrapper .default-select-option-disabled').each(function () {
      const attribute = $(this).attr('rel');
      $(this).removeClass('default-select-option-disabled');
      $(this).addClass('default-select-option');
    })
  }

  // update slider display
  // monthly uses choice buttons
  // annual uses slider of years 1950-2099
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
  function updateFrequency(value) {
    if (window.cbl_instance) {
      if (value === 'annual') {
        window.cbl_instance.update({
          frequency: value,
          variable: $('#variable-select-vis').attr('rel'),
          show_historical_observed: false,
        });
        forceUnSelected('.btn-histobs')
        $('.btn-histmod').removeClass('d-none').addClass('d-flex-center')
      } else {
        window.cbl_instance.update({
          frequency: value,
          variable: $('#variable-select-vis').attr('rel'),
          show_historical_observed: true,
        });
        forceSelected('.btn-histobs');
        $('.btn-histmod').addClass('d-none').removeClass('d-flex-center')
      }

    }
  }

  // this function changes the presentation (anomaly,actual) for the charts
  function updatePresentation(targetval) {
    if (window.cbl_instance) {
      window.cbl_instance.update({
        presentation: targetval
      });
    }
  }

  // this function changes the time period for monthly chart centered on 2025, 2050, 2075
  function updateTimePeriod(targetval) {
    // ga event action, category, label
    googleAnalyticsEvent('change', 'chart-time-period', targetval);
    if (window.cbl_instance) {
      window.cbl_instance.update({
        monthly_timeperiod: targetval
      });
    }
  }

  function initSlider() {
    annualSliderOn();
    monthlySelectOff();

    var sliderElem = document.getElementById('slider-range');
    if (sliderElem) {
      noUiSlider.create(sliderElem, {
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
        const maxValue = parseInt(values[1]);
        $('#slider-value-high').text(maxValue);
        $('#slider-value-low').text(minValue);

        // ga event action, category, label
        googleAnalyticsEvent('slide', 'update-years', minValue + "-" + maxValue);

        // update chart with new max min range
        return window.cbl_instance.set_x_axis_range(minValue, maxValue);
      });

      // update chart with default starting min max
      const values = sliderElem.noUiSlider.get();
      const minValue = parseInt(values[0]);
      const maxValue = parseInt(values[1]);
      $('#slider-value-high').text(maxValue);
      $('#slider-value-low').text(minValue);
    }
    monthlySelectOff();
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
    $('#monthly-select-wrapper').removeClass('d-none').addClass('d-flex-center');
  }

  function monthlySelectOff() {
    $('#monthly-select-wrapper').addClass('d-none').removeClass('d-flex-center');
  }

  // temp fix fo Hawaii leave out the fips...
  if (!isHawaii) {
    window.cbl_instance = new ClimateByLocationWidget($("div#chart-123")[0], {
      'area_id': window.ce.ce('getLocationPageState')['fips'],
      'font': 'Roboto',
      'responsive': true,
      'frequency': 'annual',
      'monthly_timeperiod': '2025',
      'variable': window.ce.ce('getVariablesPageState')['variable'] || 'tmax',
      'show_projected_rcp45': true,
      'show_projected_rcp85': true,
      'show_historical_observed': false,
      'show_historical_modeled': true,
    });
  } else {
    window.cbl_instance = new ClimateByLocationWidget($("div#chart-123")[0], {
      'font': 'Roboto',
      'responsive': true,
      'frequency': 'annual',
      'monthly_timeperiod': '2025',
      'variable': window.ce.ce('getVariablesPageState')['variable'] || 'tmax',
      'show_projected_rcp45': true,
      'show_projected_rcp85': true,
      'show_historical_observed': false,
      'show_historical_modeled': true,
    });
  }

  // setTimeout(function () {
  //   window.cbl_instance.resize();
  // }, 700);
  //
  // $(window).resize(function () {
  //   window.cbl_instance.resize();
  // });
  // setTimeout(function () {
  //   window.cbl_instance.resize();
  // }, 500);

  $('#chart-info-row-btn .more-info.btn-default').click(function (e) {
    const target = $('#more-info-description');
    // show description of charts
    if (target.hasClass('d-none')) {
      target.removeClass('d-none');
      $('#chart-info-row .more').addClass('d-none');
      $('#chart-info-row .more-icon').addClass('d-none');

      $('#chart-info-row .less').removeClass('d-none');
      $('#chart-info-row .less-icon').removeClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'open');
      // hide description of charts
    } else {
      target.addClass('d-none');
      $('#chart-info-row .more').removeClass('d-none');
      $('#chart-info-row .more-icon').removeClass('d-none');

      $('#chart-info-row .less').addClass('d-none');
      $('#chart-info-row .less-icon').addClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'close');
    }

  })

  const variable = window.ce.ce('getVariablesPageState')['variable'];
  if (variable !== undefined) {
    const $styledSelect = $('.select.variable-select div.select-styled');
    $(`[rel="${variable}"]`).click();
  }

  updateValidVarriable();
  window.addEventListener('location-changed', () => {
    updateValidVarriable();
  })
});
