import './main.js';
import './stations_map.js';

// add auto hide for what is this.

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');
  enableCustomSelect('stations-dropdown-menu');
  enableCustomSelect('selection-dropdown-menu');

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

  const county =  state['county'];
  const city =    state['city'];
  const zoom =    state['zoom'] || 9;
  const lat =     state['lat'];
  const lon =     state['lon'];
  const mode = 'thresholds'  // stationsMapState['mode'];
  const stationId = state['stationId'];
  const stationName = state['stationName'];
  const tidalStationId = state['tidalStationId'];
  const tidalStationName = state['tidalStationName'];
  const tidalStationMOverMHHW = state['tidalStationMOverMHHW'];
  const center = [lat, lon]
  const threshold = state['threshold']  || null;
  const windowValue = state['window']  || 1;
  const thresholdVariable = state['thresholdVariable']  || 'precipitation';

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
    window: windowValue,
    thresholdVariable,
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
      if ( !!stations.stationId) {
        stationsSelectElem.data('value',`${stations.stationId},${stations.stationName}`);
        stationsSelectElem.text(`${stations.stationName} - (${stations.stationId})`);
      }
    }
  }

  // updates the visible text for the Threshold Variable dropdown with the information from the state url
  function updateThresholdVariableSelectText(thresholdVariable) {
    const thresholdVariableSelectElem = $('#selection-dropdown-menu');

    if (thresholdVariable) {
      if ( thresholdVariable !== undefined) {
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
  }

  // updates the visible text for the station dropdown with the information from the state url
  updateStationSelectText({stationName, stationId})


  // Handles disabling/enable the graph views, nothing else.
  function showGraphs() {
    $('.graph-row').removeClass("d-none");

    $('.more-info').removeClass('btn-default-disabled');
  }

  function updateGraphs(options) {

    if(typeof window.cbs_annual_exceedance === "undefined") {
      window.cbs_annual_exceedance = new ClimateByStationWidget($('#annual-exceedance-view'), {
        view_type: 'annual_exceedance',
        ...options
      });
    } else {
      window.cbs_annual_exceedance.update({view_type: 'annual_exceedance', ...options});
    }

    if(typeof window.cbs_histogram === "undefined") {
      window.cbs_histogram = new ClimateByStationWidget($('#histogram-view'), {
        view_type: 'daily_precipitation_histogram',
        ...options
      });
    } else {
      window.cbs_histogram.update({view_type: 'daily_precipitation_histogram', ...options})
    }

    if(typeof window.cbs_absolute_view === "undefined") {
      window.cbs_absolute_view = new ClimateByStationWidget($('#absolute-view'), {
        view_type: 'daily_precipitation_absolute',
        ...options
      });
    } else {
      window.cbs_absolute_view.update({view_type: 'daily_precipitation_absolute', ...options})
    }

  }

  function toggleDownloads() {
    const targetParent = $('#download-dropdown-menu');
    if (targetParent.hasClass('disabled')) {
      targetParent.removeClass('disabled');
    }
  }

  // if state url has a station render station and not map.
  if(stationId) {

    updateGraphs({
      station: stationId,
      threshold: threshold,
      window_days: windowValue,
      variable: thresholdVariable
    });

    updateThresholdVariableSelectText(thresholdVariable);
    $('#threshold-value').val(threshold);
    $('#window-value').val(windowValue);

    showGraphs()

    // Toggle about modal
    $(`#chartmap-select-chart-link`).removeClass("disabled");
    toggleButton($(`#chartmap-select-chart-link`));

    $('#chart-info-row-btn').removeClass('disabled');

    $('#selection-dropdown-menu').removeClass('disabled');

    // updates the visible text for the station dropdown with the information from the state url
    updateStationSelectText({stationName, stationId})

    toggleDownloads();

  }

  // function to enable downloads (images and data)
  $('.download-select li a').click( function (event) {
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
  $('#stations-dropdown-menu').bind('cs-changed', function(e) {

    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {

      const val = target.data('value').split(',');
      const stationName = val[1];
      const stationId = val[0];

      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      updateStationIDText(`${stationId}`);
      updateStationText(`${stationName}`);

      // get current threshold values
      const thresholdVariable = $('#selection-dropdown-menu').data('value');
      const windowValue = parseInt($('#window-value').val());
      const thresholdValue = parseFloat($('#threshold-value').val());

      // change map variable
      window.app.update( {stationId, stationName, threshold: thresholdValue, window: windowValue, thresholdVariable: thresholdVariable});

      // show chart overlay
      showGraphs();

      // reset graphs
      updateGraphs({
        variable: thresholdVariable,
        stationId,
        stationName,
        window: windowValue,
        threshold: thresholdValue
      });

      // toggle button visual state
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      toggleDownloads();

    }
  })


  // in responsive mode, event handler a for when  threshold value (inches of rain temp in F) changes
  $('#threshold-value').change( function(e) {

    const thresholdValueElem = document.getElementById('threshold-value');

    if(!thresholdValueElem) return;

    const val = parseFloat($(thresholdValueElem).val()).toFixed(1);

    if(isNaN(val)) return;

    const stations = $('#stations-dropdown-menu').data('value').split(',');
    const stationName = stations[1];
    const stationId = stations[0];
    const thresholdVariable = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: thresholdVariable

    // change map url state
    window.app.update( { stationId, stationName, threshold: val, thresholdValue: thresholdVariable});

    // ga event action, category, label
    googleAnalyticsEvent('click', 'threshold-value', val);

  });

  // in responsive mode, event handler a for when  window value (duration of days) changes
  $('#window-value').change( function(e) {

    const windowValueElem = document.getElementById('window-value');

    if(!windowValueElem) return;

    const val = parseFloat($(windowValueElem).val());

    if(isNaN(val)) return;

    const stations = $('#stations-dropdown-menu').data('value').split(',');
    const stationName = stations[1];
    const stationId = stations[0];
    const thresholdVariable = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: thresholdVariable

    // change map url state
    window.app.update( { stationId, stationName, window: val, thresholdValue: thresholdVariable});

    // ga event action, category, label
    googleAnalyticsEvent('click', 'window-value', val);

  });

  $('#chartmap-select-chart-link').click(function(e) {

    if (e.type === 'keydown' && e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    if (!(e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13)))) {
      return;
    }

    const target = $(e.target);

    const disabled =  target.hasClass('disabled');

    if(disabled) return;

    const selected = target.hasClass('selected-item');

    if(selected) return;

    toggleButton($(target));

    showGraphs();

    googleAnalyticsEvent('click', 'chartmap', target);
  })

  $('#chartmap-select-map-link').click(function(e) {

    if (e.type === 'keydown' && e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    if (!(e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13)))) {
      return;
    }

    const target = $(e.target);

    const disabled =  target.hasClass('disabled');

    if(disabled) return;

    const selected = target.hasClass('selected-item');

    if(selected) return;

    toggleButton($(target));

    googleAnalyticsEvent('click', 'chartmap', target);
  })

  // this function Updates the chart title.
  function updateStationText(text) {
    $('#default-station').html(text);
  }

  // this function Updates the chart title.
  function updateStationIDText(text) {
    $('#default-station-id').html(text);
  }

  function renderStationInfo(stationName, stationId) {
    if (stationName) {
      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      updateStationIDText(`${stationId}`);
      updateStationText(`${stationName}`);
    } else {
      document.getElementById('station-info').classList.add('d-none');
      document.getElementById('station-info-none').classList.remove('d-none');
    }
  }

  renderStationInfo(stationName, stationId);

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
      renderStationInfo(options.stationId, options.stationName);

      let message_element = $("#stations-map-message");

      if(message_element) {
        message_element.addClass("d-none");
      }

    },


    // when user clicks on map station marker
    stationUpdated: (event, options) => {
      updateGraphs({
        variable: thresholdVariable,
        window: windowValue,
        threshold: threshold,
        station: options.stationId,
        station_label: options.stationName
      });

      showGraphs();

      // toggle button to select chart
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      $('#selection-dropdown-menu').removeClass('disabled');


      // updates the visible text for the station dropdown with the information from the state url
      updateStationSelectText({stationName: options.stationName, stationId: options.stationId})
      renderStationInfo(options.stationId, options.stationName);

      window.app.update(options);

      toggleDownloads();

    }
  }, stationsMapState));

  // not sure why but on initialize does not update the graph so this makes sure url updates happen.
  // this is a bit hacky way of resolving....
  let thresholdValueTEMP = parseFloat($('#threshold-value').val());

    $('#chart-info-row-btn .more-info.btn-default').click( function (e) {

      let disabled = $('.more-info').hasClass('btn-default-disabled');

      if(disabled) return;

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
      showGraphs();
      forceResize()
    })
});
