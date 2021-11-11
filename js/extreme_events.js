import './main.js';
import './stations_map.js';

// add auto hide for what is this.

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');
  enableCustomSelect('stations-dropdown-menu');
  enableCustomSelect('selection-dropdown-menu');
  enableCustomSelect('percentile-dropdown-menu');
  enableCustomSelect('operator-dropdown-menu');

  const state = window.app.state;
  const cityStateCE = state['city'];
  const countyCE = state['county'];

  $('.footer-button').removeClass('footer-button-selected');
  $('[data-page="extreme_events"]').addClass('footer-button-selected');

  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  if (!countyCE) {
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }

  const county = state['county'];
  const city = state['city'];
  const zoom = state['zoom'] || 9;
  const lat = state['lat'];
  const lon = state['lon'];
  const mode = 'thresholds'  // stationsMapState['mode'];
  const stationId = state['stationId'];
  const stationName = state['stationName'];
  const tidalStationId = state['tidalStationId'];
  const tidalStationName = state['tidalStationName'];
  const tidalStationMOverMHHW = state['tidalStationMOverMHHW'];
  const center = [lat, lon]
  const threshold = state['threshold'] || null;
  const window_days = state['window_days'] || 1;
  const threshold_variable = state['threshold_variable'] || 'precipitation';
  const threshold_operator = state['threshold_operator'] || '>=';

  update_meta_tag(county, city);

  let stationsMapState = {
    city,
    county,
    mode,
    stationId,
    stationName,
    tidalStationId,
    tidalStationName,
    tidalStationMOverMHHW,
    threshold,
    window_days,
    threshold_variable,
    lat,
    lon,
    zoom,
    center
  };

  const thresholdStationsDataURL = "https://data.rcc-acis.org/StnData";

  // updates the visible text for the station dropdown with the information from the state url
  function updateStationSelectText(stations) {
    const stationsSelectElem = $('#stations-dropdown-menu');
    if (stationsSelectElem) {
      if (!!stations.stationId) {
        stationsSelectElem.data('value', `${stations.stationId},${stations.stationName}`);
        stationsSelectElem.text(`${stations.stationName} - (${stations.stationId})`);
      }
    }
  }

  // updates the visible text for the Threshold Variable dropdown with the information from the state url
  function updateThresholdVariableSelectText(thresholdVariable) {
    const thresholdVariableSelectElem = $('#selection-dropdown-menu');

    if (thresholdVariable) {
      thresholdVariableSelectElem.data('value', thresholdVariable);
      switch (thresholdVariable) {
        case 'precipitation':
          thresholdVariableSelectElem.text('Precipitation');
          break;
        case 'tmax':
          thresholdVariableSelectElem.text('Maximum Temperature');
          break;
        case 'tmin':
          thresholdVariableSelectElem.text('Minimum Temperature');
          break;
        case 'tavg':
          thresholdVariableSelectElem.text('Average Temperature');
          break;
        default:
          thresholdVariableSelectElem.text('Precipitation');
      }
    }
  }

  // updates the visible text for the station dropdown with the information from the state url
  updateStationSelectText({stationName, stationId})


  // Handles disabling/enable the graph views, nothing else.
  function show_graphs() {
    $('.graph-row').removeClass("d-none");

    $('.more-info').removeClass('btn-default-disabled');
  }

  function update_graphs(options) {
    const threshold_null = options.threshold === null;
    if (typeof window.cbs_annual_exceedance === "undefined") {
      window.cbs_annual_exceedance = new ClimateByStationWidget($('#annual-exceedance-view'), {
        view_type: 'annual_exceedance',
        ...options
      });

      window.cbs_annual_exceedance.element.addEventListener('update_complete', function (e) {
        window.app.update({
          threshold: window.cbs_annual_exceedance.options.threshold,
          window_days: window.cbs_annual_exceedance.options.window_days
        })

        document.getElementById("threshold").value = window.cbs_annual_exceedance.options.threshold;
        document.getElementById("window_days").value = window.cbs_annual_exceedance.options.window_days;
        document.getElementById("variable_unit_label").innerText = window.cbs_annual_exceedance.variable_unit;

        if (threshold_null &&  window.cbs_annual_exceedance.options.threshold !== null){
          update_graphs({threshold: window.cbs_annual_exceedance.options.threshold});
        }
      })

    } else {
      window.cbs_annual_exceedance.update({view_type: 'annual_exceedance', ...options});
    }

    if (typeof window.cbs_histogram === "undefined") {
      window.cbs_histogram = new ClimateByStationWidget($('#histogram-view'), {
        view_type: options.hasOwnProperty('variable') ? options.variable === 'precipitation' ? 'daily_precipitation_histogram' : 'daily_temperature_histogram' : window.cbs_histogram.options.view_type,
        ...options
      });

      window.cbs_histogram.element.addEventListener('threshold_changed', function (e) {
        window.app.update({threshold: e.detail.threshold});

        update_graphs({
          threshold: e.detail.threshold
        })
      })

    } else {
      window.cbs_histogram.update({
        view_type: options.hasOwnProperty('variable') ? options.variable === 'precipitation' ? 'daily_precipitation_histogram' : 'daily_temperature_histogram' : window.cbs_histogram.options.view_type, ...options
      })
    }

    if (typeof window.cbs_absolute_view === "undefined") {
      window.cbs_absolute_view = new ClimateByStationWidget($('#absolute-view'), {
        view_type: options.hasOwnProperty('variable') ? options.variable === 'precipitation' ? 'daily_precipitation_absolute' : 'daily_temperature_absolute' : window.cbs_absolute_view.options.view_type, ...options
      });
    } else {
      window.cbs_absolute_view.update({
        view_type: options.hasOwnProperty('variable') ? options.variable === 'precipitation' ? 'daily_precipitation_absolute' : 'daily_temperature_absolute' : window.cbs_absolute_view.options.view_type, ...options
      });
    }

  }

  function toggle_downloads() {
    const targetParent = $('#download-dropdown-menu');
    if (targetParent.hasClass('disabled')) {
      targetParent.removeClass('disabled');
    }
  }

  // if state url has a station render station and not map.
  if (stationId) {

    update_graphs({
      station: stationId,
      threshold: threshold,
      window_days: window_days,
      variable: threshold_variable,
      threshold_operator: threshold_operator
    });

    updateThresholdVariableSelectText(threshold_variable);
    $('#threshold').val(threshold);
    $('#window_days').val(window_days);

    show_graphs()

    // Toggle about modal
    $(`#chartmap-select-chart-link`).removeClass("disabled");
    toggleButton($(`#chartmap-select-chart-link`));

    $('#chart-info-row-btn').removeClass('disabled');

    $('#selection-dropdown-menu').removeClass('disabled');

    // updates the visible text for the station dropdown with the information from the state url
    updateStationSelectText({stationName, stationId})

    toggle_downloads();

  }

  // function to enable downloads (images and data)
  $('.download-select li a').click(function (event) {
    const downloadAction = $(this).data('value');
    const state = window.app.state;
    const stationId = state['stationId'];

    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-thresholds-image': // download image
        event.target.href = $("#thresholds-container canvas")[0].toDataURL('image/png');
        event.target.download = "thresholds_" + stationId + ".png";
        break;
      case 'download-thresholds-data':
        $("#thresholds-container").item('downloadExceedanceData', event.currentTarget);
        break;
      default:
        event.target.href = $("#thresholds-container canvas")[0].toDataURL('image/png');
        event.target.download = "thresholds_" + stationId + ".png";
    }
  });


  // in responsive mode, event handler a for when season (time) variable changes
  $('#stations-dropdown-menu').bind('cs-changed', function (e) {

    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {

      const val = target.data('value').split(',');
      const stationName = val[1];
      const stationId = val[0];

      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      update_station_id_text(`${stationId}`);
      update_station_text(`${stationName}`);

      // get current threshold values
      const thresholdVariable = $('#selection-dropdown-menu').data('value');
      const windowValue = parseInt($('#window').val());
      const thresholdValue = parseFloat($('#threshold').val());

      // change map variable
      window.app.update({stationId, stationName, threshold: thresholdValue, window: windowValue, thresholdVariable: thresholdVariable});

      // show chart overlay
      show_graphs();

      // reset graphs
      update_graphs({
        variable: thresholdVariable,
        station: stationId,
        station_label: stationName,
        window_days: windowValue,
        threshold: thresholdValue
      });

      // toggle button visual state
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      toggle_downloads();

    }
  })

  $('#selection-dropdown-menu').bind('cs-changed', function (e) {
    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {

      const data_value = target.data('value');
      let options = {};

      if (data_value.includes("preset")) {

        if (data_value === "preset-1") {

          options = {
            variable: 'precipitation',
            window_days: 3,
            threshold: null,
            threshold_operator: ">=",
            threshold_percentile: 90
          }

        } else if (data_value === "preset-2") {

          options = {
            variable: 'precipitation',
            window_days: 1,
            threshold: 0.01,
            threshold_operator: "<=",
            threshold_percentile: null
          }

        } else if (data_value === "preset-3") {

          options = {
            variable: 'tmax',
            window_days: 1,
            threshold: 95,
            threshold_operator: ">=",
            threshold_percentile: null
          }

        } else if (data_value === "preset-4") {

          options = {
            variable: 'tmin',
            window_days: 3,
            threshold: 90,
            threshold_operator: ">=",
            threshold_percentile: null
          }

        } else if (data_value === "preset-5") {

          options = {
            variable: 'tmin',
            window_days: 1,
            threshold: 32,
            threshold_operator: "<=",
            threshold_percentile: null
          }

        } else if (data_value === "preset-6") {

          options = {
            variable: 'tmax',
            window_days: 1,
            threshold: 32,
            threshold_operator: "<=",
            threshold_percentile: null
          }

        }
      } else {
        options = {
          variable: data_value
        }
      }

      update_graphs(options);

    }

  });

  $('#percentile-dropdown-menu').bind('cs-changed', function (e) {
    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {
      const data_value = target.data('value');
      update_graphs({
        threshold: null,
        threshold_percentile: data_value
      });
    }
  });


  $('#operator-dropdown-menu').bind('cs-changed', function (e) {
    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {
      const data_value = target.data('value');

      window.app.update({threshold_operator: data_value});

      update_graphs({
        threshold_operator: data_value
      });
    }
  });


  // in responsive mode, event handler a for when  threshold value (inches of rain temp in F) changes
  $('#threshold, #window_days').change(function (e) {

    const threshold = parseFloat($('#threshold').val()).toFixed(2);
    const window_days = parseFloat($('#window_days').val()).toFixed(0) || 1;

    // change map url state
    window.app.update({threshold, window_days});

    update_graphs({
      threshold: threshold,
      window_days: window_days
    })

    // ga event action, category, label
    googleAnalyticsEvent('click', 'threshold-value', threshold);
    googleAnalyticsEvent('click', 'window-value', window_days);

  });

  $('#chartmap-select-chart-link').click(function (e) {

    if (e.type === 'keydown' && e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    if (!(e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13)))) {
      return;
    }

    const target = $(e.target);

    const disabled = target.hasClass('disabled');

    if (disabled) return;

    const selected = target.hasClass('selected-item');

    if (selected) return;

    toggleButton($(target));

    show_graphs();

    googleAnalyticsEvent('click', 'chartmap', target);
  })

  $('#chartmap-select-map-link').click(function (e) {

    if (e.type === 'keydown' && e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    if (!(e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13)))) {
      return;
    }

    const target = $(e.target);

    const disabled = target.hasClass('disabled');

    if (disabled) return;

    const selected = target.hasClass('selected-item');

    if (selected) return;

    toggleButton($(target));

    googleAnalyticsEvent('click', 'chartmap', target);
  })

  // this function Updates the chart title.
  function update_station_text(text) {
    $('#default-station').html(text);
  }

  // this function Updates the chart title.
  function update_station_id_text(text) {
    $('#default-station-id').html(text);
  }

  function render_station_info(stationName, stationId) {
    if (stationName) {
      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      update_station_id_text(`${stationId}`);
      update_station_text(`${stationName}`);
    } else {
      document.getElementById('station-info').classList.add('d-none');
      document.getElementById('station-info-none').classList.remove('d-none');
    }
  }

  render_station_info(stationName, stationId);

  window.stations = $('#stations-map').stationsMap(Object.assign({
    // When state changes, just pass the current options along directly for this page.
    // If we re-use the stationsMap widget on another page there may be more handling to do.
    change: (event, options) => {

      // check if there are any tidal stations in map extent
      if (typeof options.currentstations !== "undefined" && options.currentstations.length === 0) {
        noStationsMapMessage('There are no weather stations within the map view.');
        return null
      }

      window.app.update(options);
      render_station_info(options.stationId, options.stationName);

      let message_element = $("#stations-map-message");

      if (message_element) {
        message_element.addClass("d-none");
      }

    },


    // when user clicks on map station marker
    stationUpdated: (event, options) => {
      update_graphs({
        variable: threshold_variable,
        window_days: window_days,
        threshold: threshold,
        station: options.stationId,
        station_label: options.stationName
      });

      show_graphs();

      // toggle button to select chart
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      $('#selection-dropdown-menu').removeClass('disabled');


      // updates the visible text for the station dropdown with the information from the state url
      updateStationSelectText({stationName: options.stationName, stationId: options.stationId})
      render_station_info(options.stationId, options.stationName);

      window.app.update(options);

      toggle_downloads();

    }
  }, stationsMapState));

  // not sure why but on initialize does not update the graph so this makes sure url updates happen.
  // this is a bit hacky way of resolving....
  let thresholdValueTEMP = parseFloat($('#threshold-value').val());

  $('#chart-info-row-btn .more-info.btn-default').click(function (e) {

    let disabled = $('.more-info').hasClass('btn-default-disabled');

    if (disabled) return;

    const target = $('#more-info-description');
    // show description of charts
    if (target.hasClass('d-none')) {
      target.removeClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'open');
      // hide description of charts
    } else {
      target.addClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'close');
    }

    // force draw and resize of charts
    show_graphs();
    forceResize()
  })
});
