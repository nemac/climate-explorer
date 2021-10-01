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
  $('[data-page="historical_thresholds"]').addClass('footer-button-selected');

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
  const threshold = state['threshold']  || 1;
  const windowValue = state['window']  || 1;
  const thresholdVariable = state['thresholdVariable']  || 'precipitation';

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
  const initialObj = {
    station: stationsMapState.stationId, // GHCN-D Station id (required)
    variable: stationsMapState.thresholdVariable, // Valid values: 'precipitation', 'tmax', 'tmin', 'tavg'
    threshold: stationsMapState.threshold,
    responsive: true,
    thresholdOperator: '>', // Valid values: '==', '>=', '>', '<=', '<'
    thresholdFilter: '', // Transformations/Filters to support additional units. Valid Values: 'KtoC','CtoK','FtoC','CtoF','InchToCM','CMtoInch'
    thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
    window: stationsMapState.window, // Rolling window size in days.
    dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
    yearValidator: undefined, // Similar to dailyValueValidator
    dataAPIEndpoint:  thresholdStationsDataURL.split('StnData')[0],
    barColor: '#307bda' // Color for bars.
  };

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
  function updateThresholdVariableSelectText(initialObj) {
    const thresholdVariableSelectElem = $('#selection-dropdown-menu');
    const thresholdVariable = initialObj.variable;

    if (thresholdVariableSelectElem) {
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

    thresholdVariableChanged($(thresholdVariableSelectElem))
  }

  // the way graphs are handled and initialized require them to visible
  // so we move them off the screen.  this not ideal but we can move
  // trade them with the map when we the use needs them
  function resetGraphs(stations) {
    // remove and reset old graphs
    $('#stations-graph-wrap').empty();

    // add new graph wrappers so they will initialize
    $('#stations-graph-wrap').append('<div id="thresholds-container" class="d-flex-center width-100"></div>');

    // update graphs with new station id and station name
    $('#thresholds-container').item({
      variable: stations.variable,
      station: stations.stationId,
      stationName: stations.stationName,
      window: stations.window,
      threshold: stations.stations
    }).item('update');
  }

  // updates the visible text for the station dropdown with the information from the state url
  updateStationSelectText({stationName, stationId})

  // show more about charts
  function showMoreCharts() {
    const target = $('#chart-info-row-btn .more-info.btn-default');
    // show description of charts
    // if (target.hasClass('d-none')) {
    //   target.removeClass('d-none');
    // }
  }

  // don't show more about charts
  function dontShowMoreCharts() {
    const target = $('#chart-info-row-btn .more-info.btn-default');
    // show description of charts
    // if (!target.hasClass('d-none')) {
    //   target.addClass('d-none');
    // }
  }

  // show graph overlay.
  // graph is visible and on page just pushed of viewable area
  // so we can initialize it when needed
  function showGraphs() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');
    showMoreCharts();

    $('[data-value="chart"]').removeClass('btn-default-disabled');

    // show chart overlay
    if (stationsGraphRowElem) {
      stationsGraphRowElem.classList.remove('d-none');
      stationsGraphRowElem.classList.add('d-flex');
    }

    // hide chart overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-none');
      stationsMapRowElem.classList.remove('d-flex');
    }

    $('.more-info').removeClass('btn-default-disabled');
  }

  // show map overlay.
  // map is visible and on page just pushed of viewable area
  // so we can initialize it when needed
  function showMap() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');
    dontShowMoreCharts();

    // show chart overlay
    if (stationsGraphRowElem) {
      stationsGraphRowElem.classList.remove('d-flex');
      stationsGraphRowElem.classList.add('d-none');
    }

    // show map overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-flex');
      stationsMapRowElem.classList.remove('d-none');
    }
  }

  // return attribute of html element based on rel for dropdown or val based on button
  // we probably should switch all elements to val for consistency.
  function RelorVal(target){
    if (target.data('value') === undefined || target.data('value') === null) {
      return target.data('value');
    }
    return  target.data('value');
  }

  function chooseGraphOrMap(target){
    // check val of button to see if user is on map  or chart
    // hide or show the appropriate overlay (map, chart)
    switch (RelorVal(target)) {
      case 'chart':
        // show chart overlay
        showGraphs();
        break;
      case 'map':
        // show map overlay
        showMap();
      break
      default:
        // show chart overlay
        showGraphs();
    }
    // ga event action, category, label
    googleAnalyticsEvent('change', 'chartmap', RelorVal(target));
    forceResize();
  }

  function toggleChartInfoText(val) {
    const ChartInfoTextElem = document.getElementById('station-info-row');
    if ( ChartInfoTextElem ) {
      switch (val) {
        case 'chart':
          // show chart text
          ChartInfoTextElem.setAttribute("style", 'display: block;');
          break;
        case 'map':
          // show map overlay
          ChartInfoTextElem.setAttribute("style", 'display: none !important;');
          break
        default:
          // show chart text
          ChartInfoTextElem.setAttribute("style", 'display: block;');
      }
    }
  }

  function toggleDownloads() {
    const targetParent = $('#download-dropdown-menu');
    if (targetParent.hasClass('disabled')) {
      targetParent.removeClass('disabled');
    }
  }

  // update chart dropdown to chart as default
  function chartDropdownChartText(){
    // update dropdown default of chart
    const chartMapElem = $('#chartmap-select-vis');
    if (chartMapElem){
      chartMapElem.data('value','chart');
      chartMapElem.text('Chart');
    }
  }

  // if state url has a station render station and not map.
  if(stationId) {

    updateThresholdVariableSelectText(initialObj);
    $('#threshold-value').val(initialObj.threshold);
    $('#window-value').val(initialObj.window);

    $("#thresholds-container").item(initialObj);
    $("#thresholds-container").item(initialObj);

    // // show chart overlay
    showGraphs()

    // get current threshold values
    const variableValue = $('#selection-dropdown-menu').data('value');
    const windowValue = parseInt($('#window-value').val());
    const thresholdValue = parseFloat($('#threshold-value').val());

    // reset graphs
    resetGraphs({
      stationId,
      stationName,
      variable: variableValue,
      window: windowValue,
      threshold: thresholdValue,
      from: 'stationid'
    });

    // toggle button visual state
    $(`#chartmap-select-chart-link`).removeClass("disabled");
    toggleButton($(`#chartmap-select-chart-link`));

    $('#chart-info-row-btn').removeClass('disabled');

    $('#selection-dropdown-menu').removeClass('disabled');

    // update chart dropdown to chart as default
    chartDropdownChartText()

    // updates the visible text for the station dropdown with the information from the state url
    updateStationSelectText({stationName, stationId})

    toggleChartInfoText('chart');

    toggleDownloads();

    setTimeout(function () {
      // reset map and chart sizes
      // filer transition means heigh will be updates in few seconds
      // so delaying the resize ensures proper size
      setGraphSize();
      setThresholdsContainer();
      setBodySize();
    }, 600);
  } else {
    showMap();
    toggleChartInfoText('map');
    setGraphSize();
    setThresholdsContainer();
    setBodySize();
  }

  // function to enable downloads (images and data)
  $('.download-select li a').click( function (e) {
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

  // imcrement threshold
  $('.threshold-up').click( function (e) {

    const target = $(e.target);
    const thresholdValueElem = document.getElementById('threshold-value');

    // ensure thresholdValue element exits
    if (thresholdValueElem) {

      // get thresholdValue element values
      const max = parseFloat(thresholdValueElem.getAttribute('max')).toFixed(1);
      const step = parseFloat(thresholdValueElem.getAttribute('step')).toFixed(1);
      const val = parseFloat($(thresholdValueElem).val()).toFixed(1);
      const newVal = parseFloat(parseFloat(val) + parseFloat(step)).toFixed(1);

      if (parseFloat(newVal) > parseFloat(max)) {
        $(thresholdValueElem).val(val);
      } else {

        $(thresholdValueElem).val(newVal);

        const stations = $('#stations-dropdown-menu').data('value').split(',');
        const stationName = stations[1];
        const stationId = stations[0];
        const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

        // change map url state
        window.app.update( { stationId, stationName, threshold: newVal, thresholdValue: variableValue});

        // ga event action, category, label
        googleAnalyticsEvent('click', 'threshold-up', newVal);

        $("#thresholds-container").item({
          threshold: newVal,
        }).item('update');
      }
    }
  });

  // decrememt threshold
  $('.threshold-down').click( function (e) {

    const thresholdValueElem = document.getElementById('threshold-value');

    if (thresholdValueElem) {

      const min = parseFloat(thresholdValueElem.getAttribute('min')).toFixed(1);
      const step = parseFloat(thresholdValueElem.getAttribute('step')).toFixed(1);
      const val = parseFloat($(thresholdValueElem).val()).toFixed(1);
      const newVal = parseFloat(parseFloat(val) - parseFloat(step)).toFixed(1);

      if (parseFloat(newVal) < parseFloat(min)) {
        $(thresholdValueElem).val(val);
      } else {
        $(thresholdValueElem).val(newVal);

        const stations = $('#stations-dropdown-menu').data('value').split(',');
        const stationName = stations[1];
        const stationId = stations[0];
        const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

        // change map url state
        window.app.update( { stationId, stationName, threshold: newVal, thresholdValue: variableValue});

        // ga event action, category, label
        googleAnalyticsEvent('click', 'threshold-down', newVal);

        $("#thresholds-container").item({
          threshold: newVal,
        }).item('update');
      }
    }
  });

  // imcrement window
  $('.window-up').click( function (e) {

    const windowValueElem = document.getElementById('window-value');

    if (windowValueElem) {

      const max = parseInt(windowValueElem.getAttribute('max'));
      const step = parseInt(windowValueElem.getAttribute('step'));
      const val = parseInt($(windowValueElem).val());
      const newVal = parseInt(parseInt(val) + parseInt(step));

      if (parseInt(newVal) > parseInt(max)) {
        $(windowValueElem).val(val);
      } else {
        $(windowValueElem).val(newVal);

        const stations = $('#stations-dropdown-menu').data('value').split(',');
        const stationName = stations[1];
        const stationId = stations[0];
        const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

        // change map url state
        window.app.update( {stationId, stationName,  window: newVal, thresholdValue: variableValue});

        // ga event action, category, label
        googleAnalyticsEvent('click', 'window-up', newVal);

        $("#thresholds-container").item({
          window: newVal,
        }).item('update');
      }
    }
  });

  // descrememt window
  $('.window-down').click( function (e) {

    const windowValueElem = document.getElementById('window-value');
    if (windowValueElem) {
      const min = parseInt(windowValueElem.getAttribute('min'));
      const step = parseInt(windowValueElem.getAttribute('step'));
      const val = parseInt($(windowValueElem).val());
      const newVal = parseInt(parseInt(val) - parseInt(step));

      if (parseInt(newVal) < parseInt(min)) {
        $(windowValueElem).val(val);
      } else {
        $(windowValueElem).val(newVal);

        const stations = $('#stations-dropdown-menu').data('value').split(',');
        const stationName = stations[1];
        const stationId = stations[0];
        const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

        // change map url state
        window.app.update( { stationId, stationName, window: newVal,  thresholdValue: variableValue });

        // ga event action, category, label
        googleAnalyticsEvent('click', 'window-down', newVal);

        $("#thresholds-container").item({
          window: newVal,
        }).item('update');
      }
    }
  });

  function thresholdVariableChanged(target) {
    const disabled = target.hasClass('disabled');
    if (!disabled) {

      const val = $('#selection-dropdown-menu').data('value');
      const thresholdValueElem = document.getElementById('threshold-value');
      const windowValueElem = document.getElementById('window-value');

      if (thresholdValueElem) {
        // capture what we are downloading
        switch (val) {
          case 'precipitation':
            thresholdValueElem.setAttribute('min', 0);
            thresholdValueElem.setAttribute('max', 150);
            thresholdValueElem.setAttribute('step', .1);
            thresholdValueElem.setAttribute('value', 1);
            $(thresholdValueElem).val(1);
            document.getElementById('threshold-unit').innerHTML = ' inches';
            break;
          case 'tavg':
            thresholdValueElem.setAttribute('min', -200);
            thresholdValueElem.setAttribute('max', 200);
            thresholdValueElem.setAttribute('step', .1);
            thresholdValueElem.setAttribute('value', 70);
            $(thresholdValueElem).val(70);
            document.getElementById('threshold-unit').innerHTML = ' °F';
            break;
          case 'tmin':
            thresholdValueElem.setAttribute('min', -200);
            thresholdValueElem.setAttribute('max', 200);
            thresholdValueElem.setAttribute('step', .1);
            thresholdValueElem.setAttribute('value', 32);
            $(thresholdValueElem).val(32);
            document.getElementById('threshold-unit').innerHTML = ' °F';
            break;
          case 'tmax':
            thresholdValueElem.setAttribute('min', -200);
            thresholdValueElem.setAttribute('max', 200);
            thresholdValueElem.setAttribute('step', .1);
            thresholdValueElem.setAttribute('value', 95);
            $(thresholdValueElem).val(95);
            document.getElementById('threshold-unit').innerHTML = ' °F';
            break;
          default:
            thresholdValueElem.setAttribute('min', 0);
            thresholdValueElem.setAttribute('max', 150);
            thresholdValueElem.setAttribute('step', .1);
            thresholdValueElem.setAttribute('value', 1);
            $(thresholdValueElem).val(1);
            document.getElementById('threshold-unit').innerHTML = ' in inches';
        }
      }

      const variableValue = val;
      const windowValue = parseInt($('#window-value').val());
      const thresholdValue = parseFloat($('#threshold-value').val());

      const stations = target.data('value').split(',');
      const stationName = stations[1];
      const stationId = stations[0];

      // change map url state
      window.app.update( {stationId, stationName,  threshold: thresholdValue, window: windowValue, thresholdVariable: variableValue});

      $("#thresholds-container").item({
        threshold: thresholdValue,
        window: windowValue,
        variable: variableValue
      }).item('update');

    }
  }

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
      const variableValue = $('#selection-dropdown-menu').data('value');
      const windowValue = parseInt($('#window-value').val());
      const thresholdValue = parseFloat($('#threshold-value').val());

      // change map variable
      window.app.update( {stationId, stationName, threshold: thresholdValue, window: windowValue, thresholdVariable: variableValue});

      // show chart overlay
      showGraphs();

      // reset graphs
      resetGraphs({
        variable: variableValue,
        stationId,
        stationName,
        window: windowValue,
        threshold: thresholdValue
      });

      // make sure selector actually changes
      thresholdVariableChanged($('#selection-dropdown-menu'));

      // toggle button visual state
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setGraphSize();
      setThresholdsContainer();
      setBodySize();
    }
  })

  $('#selection-dropdown-menu').bind('cs-changed', function(e) {
    thresholdVariableChanged($(e.target));
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
    const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

    // change map url state
    window.app.update( { stationId, stationName, threshold: val, thresholdValue: variableValue});

    // ga event action, category, label
    googleAnalyticsEvent('click', 'threshold-value', val);

    $("#thresholds-container").item({
      threshold: val,
    }).item('update');

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
    const variableValue = $('#selection-dropdown-menu').data('value'); //  , thresholdValue: variableValue

    // change map url state
    window.app.update( { stationId, stationName, window: val, thresholdValue: variableValue});

    // ga event action, category, label
    googleAnalyticsEvent('click', 'window-value', val);

    $("#thresholds-container").item({
      window: val,
    }).item('update');

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

    showMap();
    setGraphSize();
    setThresholdsContainer();
    setBodySize();

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
    change: function change(event, options) {


      const messageElem = document.getElementById('stations-map-message');

      // check if there are any tidal stations in map extent
      if (typeof options.currentstations !== "undefined" && options.currentstations.length === 0) {
        // get map parent element - which provides the correct dimensions for the map
        if (messageElem) {
          const rect = document.getElementById('stations-map-wrap').getBoundingClientRect();
          messageElem.style.left = `${(rect.right - rect.left)/3}px`;
          messageElem.style.top = `-${((rect.bottom - rect.top)/2)}px`;
          messageElem.style.pointerEvents = 'none';
          messageElem.innerHTML = 'There are no weather stations within the map view.'
          messageElem.classList.remove('d-none');
        }
        return null
      }

      window.app.update( options);
      renderStationInfo(options.stationId, options.stationName);
      if (messageElem) {
        messageElem.classList.add('d-none');
      }

    },


    // when user clicks on map station marker
    // show graph hide map
    // todo add this to dropdown events also
    stationUpdated: function(event, options) {
      // show chart overlay
      showGraphs();

      // toggle button to select chart
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      $('#chart-info-row-btn').removeClass('disabled');

      $('#selection-dropdown-menu').removeClass('disabled');

      // update chart dropdown to chart as default
      chartDropdownChartText()

      // get current threshold values
      const variableValue = $('#selection-dropdown-menu').data('value');
      const windowValue = parseInt($('#window-value').val());
      const thresholdValue = parseFloat($('#threshold-value').val());

      // reset graphs
      resetGraphs({
        variable: variableValue,
        window: windowValue,
        threshold: thresholdValue,
        stationId: options.stationId,
        stationName: options.stationName
      });

      // updates the visible text for the station dropdown with the information from the state url
      updateStationSelectText({stationName: options.stationName, stationId: options.stationId})
      renderStationInfo(options.stationId, options.stationName);

      options.threshold = thresholdValue;
      options.window = windowValue;
      options.thresholdVariable = variableValue;

      window.app.update(options);

      toggleChartInfoText('chart');

      toggleDownloads();

      thresholdVariableChanged($('#stations-dropdown-menu'));

      setTimeout(function () {
        // reset map and chart sizes
        // filer transition means heigh will be updates in few seconds
        // so delaying the resize ensures proper size
        setGraphSize();
        setThresholdsContainer();
      }, 100);
    }
  }, stationsMapState));

  // resize map when browser is resized
  function setMapSize2() {
    $('#stations-map').height($('#stations-map').parent().height())

    // get map parent element - which provides the correct dimensions for the map
    const rect = document.getElementById('stations-map-wrap').getBoundingClientRect();

    const messageElem = document.getElementById('stations-map-message');
    // get map parent element - which provides the correct dimensions for the map
    if (messageElem) {
      const rect = document.getElementById('stations-map-wrap').getBoundingClientRect();
      messageElem.style.left = `${(rect.right - rect.left)/3}px`;
      messageElem.style.top = `-${((rect.bottom - rect.top)/2)}px`;
    }

    // set size of map overlay
    if (document.querySelector('.esri-view-root')) {
      document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.maxWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
    }

    // set size of map overlay
    if (document.querySelector('.esri-view-user-storage')) {
      document.querySelector('.esri-view-user-storage').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-user-storage').style.maxWidth = `${rect.width}px`;
    }

    // set size of map
    if (document.querySelector('#stations-map')) {
      document.querySelector('#stations-map').style.minWidth = `${rect.width}px`;
      document.querySelector('#stations-map').style.maxWidth = `${rect.width}px`;
      document.querySelector('#stations-map').style.width = `${rect.width}px`;
      document.querySelector('#stations-map').style.height = `${rect.height}px`;
    }

    // get graph parent element - which provides the correct dimensions for the graph
    const graphRect = document.getElementById('stations-graph-wrap').getBoundingClientRect();
    let graphWidth = graphRect.width;

    // when smaller than 900 (full size)
    // expand graphs to cover 100%
    if (graphRect.width <= 882) {
      graphWidth = graphRect.width;
    }

    // set size of temp chart
    if (graphRect.width <= 900) {
      if (document.querySelector('#stations-graph-row')) {
        document.querySelector('#stations-graph-row').style.height = `350px`;
        document.querySelector('#stations-graph-row').style.minHeight = `350px`;
      }
    }

    // set size of temp chart
    if (document.querySelector('#thresholds-container')) {
      document.querySelector('#thresholds-container').style.minWidth = `${graphWidth}px`;
      document.querySelector('#thresholds-container').style.maxWidth = `${graphWidth}px`;
      document.querySelector('#thresholds-container').style.width = `${graphWidth}px`;
      document.querySelector('#thresholds-container').style.height = `${graphRect.height}px`;
      document.querySelector('#thresholds-container').style.maxHeight = `${graphRect.height}px`;
    }

    // set size of map
    if (document.querySelector('.chartjs-size-monitor')) {
      document.querySelector('.chartjs-size-monitor').style.minWidth = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.maxWidth = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.width = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.height = `${graphRect.height}px`;
    }
  }

  function setThresholdsContainer() {
    let graph_body = document.querySelector(".graph-body");
    $('#thresholds-container').height(graph_body.style.height);
  }

  // reset map and chart sizes
  setGraphSize();
  setThresholdsContainer();
  setBodySize();

  $(window).resize(function () {
    setGraphSize();
    setThresholdsContainer();
  })

  // not sure why but on initialize does not update the graph so this makes sure url updates happen.
  // this is a bit hacky way of resolving....
  let thresholdValueTEMP = parseFloat($('#threshold-value').val());
  $("#thresholds-container").item({ threshold: thresholdValueTEMP }).item('update');


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
      forceResize();
      setGraphSize();
      setThresholdsContainer();
    })
});
