import './main.js';

$(function () {
  // get city, state from state url
  const state = window.app.state;
  const city_label = state['city'];
  const county_label = state['county'];
  const area_label = state['area_label'];
  const is_alaska_area = state['is_alaska_area'];
  const is_conus_area = state['is_conus_area'];
  const is_island_area = state['is_island_area'];

  $('.footer-button').removeClass('footer-button-selected');
  $('[data-page="climate_graphs"]').addClass('footer-button-selected');

  /**
   * Disable specific buttons in the info section.
   *  ex: Disable Maps and Monthly for Alaska regions.
   *
   * Disable specific cards/footer_nav items for different regions.
   *  ex: Disable climate_maps and high_tide_flooding for Alaska regions.
   */
  if(is_conus_area) {
    $('#map-selection').removeClass('disabled');
    $('[for="map-selection"]').removeClass('disabled');

    $('.how-to-read-conus').removeClass('d-none');
    $('.how-to-read-ak').addClass('d-none');
    $('.how-to-read-island').addClass('d-none');

  } else if(is_alaska_area) {

    $('#map-selection').addClass('disabled');
    $('[for="map-selection"]').addClass('disabled');

    $('[data-page="climate_maps"]').addClass('disabled');
    $('[data-page="high_tide_flooding"]').addClass('disabled');

    $('.how-to-read-conus').addClass('d-none');
    $('.how-to-read-ak').removeClass('d-none');
    $('.how-to-read-island').addClass('d-none');

  } else if(is_island_area) {

    $('[data-page="climate_maps"]').addClass('disabled');

    $('#map-selection').addClass('disabled');
    $('[for="map-selection"]').addClass('disabled');

    $('.how-to-read-conus').addClass('d-none');
    $('.how-to-read-ak').addClass('d-none');
    $('.how-to-read-island').removeClass('d-none');

  }

  $('#default-city-county').text(county_label || area_label);
  $('#cards-search-input').attr("placeholder", city_label || area_label);


  if (!city_label && !area_label) {
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }

  if (city_label) {
    if (city_label.indexOf('County') > 0) {
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }

  // enable custom selection boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('filter-dropdown-menu');
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
    let download_promise;
    // capture what we are downloading
    switch (downloadAction) {
      case 'download-image': // download image
        download_promise = window.cbl_chart.download_image(this);
        break;
      case 'download-observed-data':
        download_promise = window.cbl_chart.download_hist_obs_data(this);
        break;
      case 'download-historical-modeled-data':
        download_promise = window.cbl_chart.download_hist_mod_data(this)
        break;
      case 'download-projected-modeled-data':
        download_promise = window.cbl_chart.download_proj_mod_data(this);
        break;
      case 'download-interpreting':
        break;
      default:
        download_promise = window.cbl_chart.download_image(this);
    }
    download_promise.catch((e)=>{
      $(this).append(`<span id="download-err" style="color: #ff5d5d;">Not available for current area / variable / frequency selection.</span>`);
      window.setTimeout(()=>{
        $('#download-err').remove()
      }, 1500)
    });
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

    if(!target.hasClass("btn")) {
      return;
    }

    const disabled = target.hasClass('disabled');

    // not all variables can display monthly chart
    // when the variable cannot display monthly chart do
    // do execute the click event
    if (!disabled) {
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
  $('#legend-wrapper .btn').click(function (e) {

    const target = $(e.currentTarget);
    const disabled = target.hasClass('disabled');

    if (!disabled) {
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
  $('#monthly-select-wrapper .btn').click(function (e) {
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
  $('#filter-dropdown-menu').bind('cs-changed', function (e) {

    const variable = $('#filter-dropdown-menu').data('value');
    // update the chart based on char variable

    if(window.cbl_chart) {
      window.cbl_chart.update({
        variable
      });
    }

    window.app.update({variable});

    // update the text
    updateTitle($('#filter-dropdown-menu').text());

    // disable variables if they are valid time period
    const is_valid = jQuery.inArray(variable, validMonthly);

    if (is_valid < 0) {
      $('[data-value="monthly"]').addClass('disabled');
      $('[data-value="monthly"]').removeClass('selected-item');
      $('#monthly-selection-label').addClass('disabled');
      $('#monthly-selection-label').removeClass('selected-item');
    } else {
      $('[data-value="monthly"]').removeClass('disabled')
      $('[data-value="monthly"]').addClass('default-selection')
      $('#monthly-selection-label').removeClass('disabled');
      $('#monthly-selection-label').addClass('default-selection');
    }
    if (is_alaska_area) {
      $('[data-value="monthly"]').addClass('disabled');
      $('#monthly-selection-label').addClass('disabled');
    }
  });

  // this function changes chart layers based on what the user
  // clicks on
  function updateChartLayers(el) {

    const legend_el = $('#legend-wrapper');

    el.toggleClass('selected-item');
    // map all buttons and get the val from html val attribute
    const visible_layers = {
      show_historical_observed: legend_el.find('[data-value="histobs"]').hasClass('selected-item') || false,
      show_historical_modeled: legend_el.find('[data-value="histmod"]').hasClass('selected-item') || false,
      show_projected_rcp45: legend_el.find('[data-value="rcp45"]').hasClass('selected-item') || false,
      show_projected_rcp85: legend_el.find('[data-value="rcp85"]').hasClass('selected-item') || false,
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

  Promise.allSettled([ClimateByLocationWidget.when_areas(), ClimateByLocationWidget.when_variables()]).then(
      () => {

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

      });

  $('#chart-info-row-btn').click(function (e) {
    const target = $('#more-info-description');
    // show description of charts
    if (target.hasClass('d-none')) {
      target.removeClass('d-none');
      $('#chart-info-row .more').addClass('d-none');
      $('#chart-info-row .more-icon').addClass('d-none');

      $('#chart-info-row .less').removeClass('d-none');
      $('#chart-info-row .less-icon').removeClass('d-none');

      // Only show 'How to read' of the area we are at (ex: How to read Alaska)
      if(state.is_alaska_area) {

        if(!$('.how-to-read-conus').hasClass('d-none')) {
          $('.how-to-read-conus').addClass('d-none');
        }

        if(!$('.how-to-read-island').hasClass('d-none')) {
          $('.how-to-read-island').addClass('d-none');
        }

      } else if(state.is_conus_area) {
        if(!$('.how-to-read-ak').hasClass('d-none')) {
          $('.how-to-read-ak').addClass('d-none');
        }

        if(!$('.how-to-read-island').hasClass('d-none')) {
          $('.how-to-read-island').addClass('d-none');
        }

      } else if(state.is_island_area) {

        if(!$('.how-to-read-conus').hasClass('d-none')) {
          $('.how-to-read-conus').addClass('d-none');
        }

        if(!$('.how-to-read-ak').hasClass('d-none')) {
          $('.how-to-read-ak').addClass('d-none');
        }
      }

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

  })

  /**
   * This function handles the resizing of the map on climate_graphs page. It takes the height of the top nav bar
   * and the height of the footer which it then adds as padding to the top and the bottom of the element containing the .climate-graphs-body
   * class.
   *
   * The #.height / 16 is attempting to convert it from pixels to rem (1 rem = 16px)
   */
  function setBodySize() {

    let nav_element = document.querySelector(".navbar-element");
    let footer_element = document.querySelector(".footer-element");

    let nav_height = nav_element.getBoundingClientRect().height / 16;
    let footer_height = footer_element.getBoundingClientRect().height / 16;

    let climate_graphs_body = document.querySelector(".climate-graphs-body");
    climate_graphs_body.style.paddingTop = nav_height + "rem";
    climate_graphs_body.style.paddingBottom = footer_height + "rem";

  }

  setBodySize();

  $(window).resize(function () {
    setBodySize();
  })

  updateValidVariable();
  window.addEventListener('location-changed', () => {
    updateValidVariable();
  })
});
