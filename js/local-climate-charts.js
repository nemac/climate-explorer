'use strict';

$(function () {
  // get city, state from state url
  const state = window.app.state;
  const city_label = state['city'];
  const county_label = state['county'];
  const area_label = state['area_label'];
  const is_alaska_area = state['is_alaska_area'];

  //$('#default-city-state').text(city_label || '');
  $('#default-city-county').text(county_label || area_label);
  $('#cards-search-input').attr("placeholder", city_label || area_label);


  if (!city_label) {
    $('#default-in').addClass('d-none');
  }
  if (!city_label && !area_label) {
    $('#default-in,#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  if (city_label) {
    if (city_label.indexOf('County') > 0) {
      $('#default-in,#default-dash').addClass('d-none');
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

  initVariableToolTips();
  hideMonthlySelect();

  // valid monthly variables
  // monthly timeperiod is only valid for limited variables
  // to disable those variables from the user we use this constant
  const validMonthly = ['tmax', 'tmin', 'pcpn'];


  // function to enable downloads (images and data)
  $('.download-select li a').click(function (e) {
    const downloadAction = $(this).data('value');
    if ($(this).hasClass('disabled')) {
      return null;
    }
    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-image': // download image
        window.cbl_chart.download_image(this);
        break;
      case 'download-observed-data':
        window.cbl_chart.download_hist_obs_data(this);
        break;
      case 'download-historical-modeled-data':
        window.cbl_chart.download_hist_mod_data(this);
        break;
      case 'download-projected-modeled-data':
        window.cbl_chart.download_proj_mod_data(this);
        break;
      case 'download-interpreting':
        break;
      default:
        window.cbl_chart.download_image(this);
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
      window.cbl_chart.resize();
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

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        // handleChartMapClick(target);

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

      // change select dropdowns for responsive mode
      setSelectFromButton(target);

      //handleChartMapClick(target);

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
      const val = target.data('value');

      // toggle button visual state
      toggleButton(target);

      // update chart frequency value
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);

      // change select dropdowns for responsive mode
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
        const val = target.data('value');

        // toggle button visual state
        toggleButton(target);

        // update chart frequency value
        updateFrequency(val);

        // update chart frequency slider based on timeperiod
        updateFrequencySlider(val);

        // change select dropdowns for responsive mode
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
      const val = $('#time-select-vis').data('value');

      // toggle button visual state
      toggleButton($(`.btn-selector[data-value="${$('#chartmap-select-vis').data('value')}"]`));

      // handleChartMapClick(target);
    }
  });

  // in responsive mode the time is a dropdown this enables the change of the timeperiod
  // to update the chart
  $('#time-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const val = $('#time-select-vis').data('value');

      // toggle button visual state
      toggleButton($(`.btn-${$('#time-select-vis').data('value')}`));

      // update chart frequency slider based on timeperiod
      updateFrequency(val);

      // update chart frequency slider based on timeperiod
      updateFrequencySlider(val);
    }
  });

  // adds a click event to turn off chart layers aka what you
  // see on the chart
  $('#legend-wrapper .btn-selector').click(function (e) {
    const target = $(e.currentTarget);
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
    const val = target.data('value');

    // toggle button visual state
    toggleButton(target);

    // updates the select dropdown for responsive mode
    setSelectFromButton(target);

    // ga event action, category, label
    googleAnalyticsEvent('click', 'presentation', val);
  });

  // in responsive mode the presentation is a dropdown this enables the change of the presentation
  // to update the chart
  $('#presentation-select-vis').bind('cs-changed', function (e) {
    const val = $('#presentation-select-vis').data('value');

    // toggle button visual state
    toggleButton($(`.btn-${$('#presentation-select-vis').data('value')}`));

  });

  // adds time period click
  $('#monthly-select-wrapper .btn-selector').click(function (e) {
    const target = $(e.target);
    const val = target.data('value');

    // toggle button visual state
    toggleButton(target);

    // change time period
    updateTimePeriod(val);

    // ga event action, category, label
    googleAnalyticsEvent('click-tab', 'monthly-select-wrapper', val);
  });

  // binds update of chart variable to change of selector
  $('#variable-select-vis').bind('cs-changed', function (e) {
    const variable = $('#variable-select-vis').data('value');
    // update the chart based on char variable
    window.cbl_chart.update({
      variable
    });

    window.app.update({variable});

    // update the text
    updateTitle($('#variable-select-vis').text());

    // disable variables if they are valid time period
    const isvalid = jQuery.inArray(variable, validMonthly);
    if (isvalid < 0) {
      $('[data-value="monthly"]').addClass('btn-default-disabled');
      $('[data-value="monthly"]').removeClass('btn-default')
      $('[rel="monthly"]').addClass('default-select-option-disabled');
    } else {
      $('[data-value="monthly"]').removeClass('btn-default-disabled')
      $('[data-value="monthly"]').addClass('btn-default')
      $('[rel="monthly"]').removeClass('default-select-option-disabled');
    }
    if (is_alaska_area) {
      $('[data-value="monthly"]').addClass('btn-default-disabled');
      $('[rel="monthly"]').addClass('default-select-option-disabled');
    }
  });

  // this function changes chart layers based on what the user
  // clicks on
  function updateChartLayers(el) {
    const legend_el = $('#legend-wrapper');
    el.toggleClass('selected');
    // map all buttons and get the val from html val attribute
    const visible_layers = {
      show_historical_observed: legend_el.find('[data-value="histobs"]').hasClass('selected') || false,
      show_historical_modeled: legend_el.find('[data-value="histmod"]').hasClass('selected') || false,
      show_projected_rcp45: legend_el.find('[data-value="rcp45"]').hasClass('selected') || false,
      show_projected_rcp85: legend_el.find('[data-value="rcp85"]').hasClass('selected') || false,
    };


    // ga event action, category, label
    googleAnalyticsEvent('change', 'chart', Object.entries(visible_layers).map(a => a.join('-')).join('-'));

    // update chart
    window.cbl_chart.update(visible_layers);
  }

  // this function forces a map legend button to be selected css class
  function setSelected(selector, value = true) {
    $(selector).toggleClass('selected', value);
  }

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-variable').html(chartText);
  }

  // this function disables variables when monthly period is selected
  function validVariablesDisable() {
    $('#variable-select-wrapper .default-select-option').each(function () {
      const attribute = $(this).data('value');
      const isvalid = jQuery.inArray(attribute, validMonthly);
      if (isvalid < 0) {
        $(this).addClass('default-select-option-disabled');
        $(this).removeClass('default-select-option');
      }
    })
  }

  // this function enables variables when annual period is selected
  function validVariablesEnable() {
    $('#variable-select-wrapper .default-select-option-disabled').each(function () {
      const attribute = $(this).data('value');
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
        hideMonthlySelect();
        validVariablesEnable();
        break;
      case 'monthly':
        showMonthlySelect();
        validVariablesDisable();
        break;
      default:
        hideMonthlySelect();
        validVariablesEnable();
    }
  }

  // this function changes the frequency for the charts
  function updateFrequency(targetval) {
    window.cbl_chart.update({
      frequency: targetval,
      variable: $('#variable-select-vis').data('value'),
      show_historical_observed: true,
    });
    setSelected('.btn-histobs');
  }

  // this function changes the time period for monthly chart centered on 2025, 2050, 2075
  function updateTimePeriod(targetval) {
    // ga event action, category, label
    googleAnalyticsEvent('change', 'chart-time-period', targetval);

    window.cbl_chart.update({
      monthly_timeperiod: targetval
    });
  }


  function showMonthlySelect() {
    $('#monthly-select-wrapper').removeClass('d-none').addClass('d-flex-center');
  }

  function hideMonthlySelect() {
    $('#monthly-select-wrapper').addClass('d-none').removeClass('d-flex-center');
  }

  // temp fix fo Hawaii leave out the fips...
  window.cbl_chart = new ClimateByLocationWidget($("div#chart-123")[0], {
    font: 'Roboto',
    responsive: true,
    frequency: 'annual',
    timeperiod: '2025',
    area_id: state['fips'] || state['area_id'],
    variable: state['variable'] || 'tmax',
    show_projected_rcp45: true,
    show_projected_rcp85: true,
    show_historical_modeled: true,
    show_historical_observed: false,
  });

  setTimeout(function () {
    window.cbl_chart.resize();
  }, 700);

  $(window).resize(function () {
    window.cbl_chart.resize();
  });


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

    setTimeout(function () {
      window.cbl_chart.resize();
    }, 500);
    // // force draw and resize of charts
    // showGraphs();
    // forceResize();
    // setMapSize();
  })

  const variable = state['variable'];
  if (variable !== undefined) {
    const $styledSelect = $('.select.variable-select div.select-styled');
    $(`[rel="${variable}"]`).click();

    // // change chart variable
    // window.cbl_chart.update({
    //   variable
    // });
  }

  updateValidVariable();
  window.addEventListener('location-changed', () => {
    updateValidVariable();
  })
});
