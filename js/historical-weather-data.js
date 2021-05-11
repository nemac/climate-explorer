'use strict';

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');

  // get city, state from state url
  const state = window.app.state;
  const city = state['city'];
  const county = state['county'];

  //$('#default-city-state').text(city);
  $('#default-city-county').text(county);
  $('#cards-search-input').attr("placeholder", city);

  if (!county) {
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  const zoom = state['zoom'] || 9;
  const lat =  state['lat'];
  const lon =  state['lon'];
  const mode = 'daily_vs_climate';
  const stationId = state['stationId'];
  const stationName = state['stationName'];
  const tidalStationId = state['tidalStationId'];
  const tidalStationName = state['tidalStationName'];
  const tidalStationMOverMHHW = state['tidalStationMOverMHHW'];
  const center = [lat, lon]

  let stationsMapState = {
    city,
    county,
    mode,
    stationId,
    stationName,
    tidalStationId,
    tidalStationName,
    tidalStationMOverMHHW,
    lat,
    lon,
    zoom,
    center
  };



  // updates the visible text for the station dropdown with the information from the state url
  function updateStationSelectText(stations) {
    const stationsSelectElem = $('#stations-select-vis');
    if (stationsSelectElem) {
      if ( !!stationId) {
        stationsSelectElem.data('value',`${stations.stationId},${stations.stationName}`);
        stationsSelectElem.text(`${stations.stationName} - (${stations.stationId})`);
      }
    }
  }

  // the way graphs are handled and initialized require them to visible
  // so we move them off the screen.  this not ideal but we can move
  // trade them with the map when we the use needs them
  function resetGraphs(stations) {
    // remove and reset old graphs
    $('#stations-graph-wrap').empty();

    // add new graph wrappers so they will initialize
    $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
    $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

    // update graphs with new station id and station name
    $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stations.stationId, stationName: stations.stationName });
    $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station: stations.stationId, stationName: stations.stationName });
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
    // show chart overlay
    if (stationsGraphRowElem) {
      stationsGraphRowElem.classList.remove('d-off');
      stationsGraphRowElem.classList.add('d-flex');
    }

    // hide chart overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-off');
      stationsMapRowElem.classList.remove('d-flex');
    }
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
      stationsGraphRowElem.classList.add('d-off');
    }

    // show map overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-flex');
      stationsMapRowElem.classList.remove('d-off');
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

  function chooseGraphOrMap(target) {
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
          ChartInfoTextElem.setAttribute("style", 'display: flex;');
          break;
        case 'map':
          // show map overlay
          ChartInfoTextElem.setAttribute("style", 'display: none !important;');
          break
        default:
          // show chart text
          ChartInfoTextElem.setAttribute("style", 'display: flex;');
      }
    }
  }

  function toggleDownloads() {
    const targetParent = $('#downloads-select-wrapper');
    if (targetParent.hasClass('disabled')) {
      targetParent.removeClass('disabled');
    }

    const target = $('#downloads-select-vis');
    if (target.hasClass('disabled')) {
      target.removeClass('disabled');
      enableCustomSelect('download-select');
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
  if (stationId) {
    // show chart overlay
    showGraphs()

    // reset graphs
    resetGraphs({variable: 'temperature', stationId, stationName });

    // toggle button visual state
    toggleButton($(`.btn-selector[data-value="chart"]`));

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
      setMapSize();
    }, 600);
  } else {
    showMap();
    toggleChartInfoText('map');
    setMapSize();
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
      case 'download-precipitation-image': // download image
        e.target.href = $("#multi-precip-chart canvas")[0].toDataURL('image/png');
        e.target.download = "daily_vs_climate_precip_" + stationId + ".png";
        break;
      case 'download-precipitation-data':
        $('#multi-precip-chart').stationAnnualGraph('downloadPrecipitationData', e.currentTarget);
        break;
      case 'download-temperature-image': // download image
        e.target.href = $("#multi-chart canvas")[0].toDataURL('image/png');
        e.target.download = "daily_vs_climate_precip_" + stationId + ".png";
        break;
      case 'download-temperature-data':
        $('#multi-chart').stationAnnualGraph('downloadTemperatureData', e.currentTarget);
        break;
      default:
        $('#multi-chart').stationAnnualGraph('downloadTemperatureData', e.currentTarget);
    }
  });

  // in responsive mode, event handler a for when season (time) variable changes
  $('#stations-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if ( notDisabled ) {
      const val = $('#stations-select-vis').data('value').split(',');
      const stationName = val[1];
      const stationId = val[0];


      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      updateStationIDText(`${stationId}`);
      updateStationText(`${stationName}`);

      // change map variable
      window.app.update({stationId, stationName});


      // show chart overlay
      showGraphs();

      // reset graphs
      resetGraphs({variable: 'temperature', stationId, stationName });

      // toggle button visual state
      toggleButton($(`.btn-selector[data-value="chart"]`));

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setMapSize();
    }
  })

  // enables time chart, map click events
  $('#chartmap-wrapper').keyup( function(e) {
    if (e.keyCode === 13){
      const target = $(e.target);
      const notDisabled = (!target.hasClass('btn-default-disabled') || !target.hasClass('disabled'));

      if ( notDisabled ) {

        // toggle button visual state
        toggleButton($(target));

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        // check val of button to see if user is on map  or chart
        // hide or show the appropriate overlay (map, chart)
        chooseGraphOrMap(target);
        toggleChartInfoText(RelorVal(target));
      }

      // reset map and chart sizes
      setMapSize();
      chooseGraphOrMap(target);

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'chartmap', target);
    }
  })

  // enables time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = (!target.hasClass('btn-default-disabled') || !target.hasClass('disabled'));

    if ( notDisabled ) {

      // toggle button visual state
      toggleButton($(target));

      // change select dropdowns for responsive mode
      setSelectFromButton(target);

      // check val of button to see if user is on map  or chart
      // hide or show the appropriate overlay (map, chart)
      chooseGraphOrMap(target);
      toggleChartInfoText(RelorVal(target));
    }

    // reset map and chart sizes
    setMapSize();
    chooseGraphOrMap(target);

    // ga event action, category, label
    googleAnalyticsEvent('click', 'chartmap', target);
  })

  // in responsive mode the time is a dropdown this enables the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').data('value')

      // toggle button visual state
      toggleButton($(`.btn-selector[data-value="${$('#chartmap-select-vis').data('value')}"]`));

      // check val of button to see if user is on map  or chart
      // hide or show the appropriate overlay (map, chart)
      chooseGraphOrMap(target);
      toggleChartInfoText(RelorVal(target));
    }
    // reset map and chart sizes
    setMapSize();
  })

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-variable').html(chartText);
  }

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

  // toggle filters click
  $('#filters-toggle').click( function(e) {
    const target = $(e.target);
    if (target.hasClass('closed-filters')) {
      target.removeClass('closed-filters');
        // ga event action, category, label
        googleAnalyticsEvent('click', 'toggle-filters', 'open');
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

    const chartRowElem = $('#stations-graph-row');
    if ($(chartRowElem).hasClass('closed-filters')) {
      $(chartRowElem).removeClass('closed-filters');
    } else {
      $(chartRowElem).addClass('closed-filters');
    }

    const stationsMapRowElem = $('#stations-map-row');
    if ($(stationsMapRowElem).hasClass('closed-filters')) {
      $(stationsMapRowElem).removeClass('closed-filters');
    } else {
      $(stationsMapRowElem).addClass('closed-filters');
    }

    setTimeout(function () {
      // reset map and chart sizes
      // filer transition means heigh will be updates in few seconds
      // so delaying the resize ensures proper size
      setMapSize();
    }, 600);
  })

  window.stations = $('#stations-map').stationsMap(Object.assign({
    // When state changes, just pass the current options along directly for this page.
    // If we re-use the stationsMap widget on another page there may be more handling to do.
    change: function change(event, options) {
      // error check
      if (options.currentstations) {return null}

      window.app.update( options);
      renderStationInfo(options.stationId, options.stationName);

      const messageElem = document.getElementById('stations-map-message');
      // check if there are any tidal stations in map extent
      if (!!options.currentstations && options.currentstations.features.length === 0) {
        // get map parent element - which provides the correct dimensions for the map
        if (messageElem) {
          const rect = document.getElementById('stations-map').getBoundingClientRect();
          messageElem.style.left = `${(rect.right - rect.left)/3}px`;
          messageElem.style.top = `-${((rect.bottom - rect.top)/2)}px`;
          messageElem.innerHTML = 'There are no weather stations within the map view.'
          messageElem.classList.remove('d-none');
        }
      } else {
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
      toggleButton($(`.btn-selector[data-value="chart"]`));

      // update chart dropdown to chart as default
      chartDropdownChartText()

      // reset graphs
      resetGraphs({
        variable: 'temperature',
        stationId: options.stationId,
        stationName: options.stationName
      });

      // updates the visible text for the station dropdown with the information from the state url
      updateStationSelectText({stationName: options.stationName, stationId: options.stationId})
      renderStationInfo(options.stationId, options.stationName);

      window.app.update( options);

      toggleChartInfoText('chart');

      toggleDownloads();

      setTimeout(function () {
        // reset map and chart sizes
        // filer transition means heigh will be updates in few seconds
        // so delaying the resize ensures proper size
        setMapSize();
      }, 100);
    }
  }, stationsMapState));

  // resize map when browser is resized
  function setMapSize() {
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
    let graphWidth = graphRect.width/2;

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
      } else {
        document.querySelector('#stations-graph-row').style.height = `${rect.height}px`;
        document.querySelector('#stations-graph-row').style.minHeight = `${rect.height}px`;
      }
    }

    // set size of temp chart
    if (document.querySelector('#multi-chart')) {
      document.querySelector('#multi-chart').style.minWidth = `${graphWidth}px`;
      document.querySelector('#multi-chart').style.maxWidth = `${graphWidth}px`;
      document.querySelector('#multi-chart').style.width = `${graphWidth}px`;
      document.querySelector('#multi-chart').style.height = `${graphRect.height}px`;
    }

    // set size of precip chart
    if (document.querySelector('#multi-precip-chart')) {
      document.querySelector('#multi-precip-chart').style.minWidth = `${graphWidth}px`;
      document.querySelector('#multi-precip-chart').style.maxWidth = `${graphWidth}px`;
      document.querySelector('#multi-precip-chart').style.width = `${graphWidth}px`;
      document.querySelector('#multi-precip-chart').style.height = `${graphRect.height}px`;
    }
  }

  // reset map and chart sizes
  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })

  $('#chart-info-row-btn .more-info.btn-default').click( function (e) {
    const target = $('#more-info-description');
    // show description of charts
    if (target.hasClass('d-none')) {
      target.removeClass('d-none');
      // $('#chart-info-row-btn .more').addClass('d-none');
      // $('#chart-info-row-btn .more-icon').addClass('d-none');
      //
      // $('#chart-info-row-btn .less').removeClass('d-none');
      // $('#chart-info-row-btn .less-icon').removeClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'open');
    // hide description of charts
    } else {
      target.addClass('d-none');
      // $('#chart-info-row-btn .more').removeClass('d-none');
      // $('#chart-info-row-btn .more-icon').removeClass('d-none');
      //
      // $('#chart-info-row-btn .less').addClass('d-none');
      // $('#chart-info-row-btn .less-icon').addClass('d-none');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-chart-info', 'close');
    }

    // force draw and resize of charts
    showGraphs();
    forceResize();
    setMapSize();
  })
});
