import './main.js';
import './stations_map.js';
import './station_annual_graph.js';

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');

  // get city, state from state url
  const state = window.app.state;
  const city = state['city'];
  const county = state['county'];

  $('.footer-button').removeClass('footer-button-selected');
  $('[data-page="historical_weather_data"]').addClass('footer-button-selected');

  $('#default-city-county').text(county);
  $('#cards-search-input').attr("placeholder", city);

  if (!county) {
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
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

  if(!!stationId) {
    $('#chartmap-select-chart-link').removeClass('disabled');
  }

  // updates the visible text for the station dropdown with the information from the state url
  function updateStationSelectText(stations) {
    const stationsSelectElem = $('#stations-dropdown-menu');
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
    $('#stations-graph-wrap').append('<div id="multi-chart" class="chart-body col-12 col-lg-6"></div>');
    $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="chart-body col-12 col-lg-6"></div>');

    // update graphs with new station id and station name
    $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stations.stationId, stationName: stations.stationName });
    $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station: stations.stationId, stationName: stations.stationName });
  }



  // show graph overlay.
  // graph is visible and on page just pushed of viewable area
  // so we can initialize it when needed
  function showGraphs() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');

    $('#chartmap-select-chart-link').removeClass('disabled');
    $('#chartmap-select-chart-link').removeClass('default-selection');
    $('#chartmap-select-chart-link').addClass('selected-item');

    $("#historical-weather-data-viewport").addClass("d-none");

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

    $('.more-info').removeClass('disabled');
  }

  // show map overlay.
  // map is visible and on page just pushed of viewable area
  // so we can initialize it when needed
  function showMap() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');

    $("#historical-weather-data-viewport").removeClass("d-none");

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
    const targetParent = $('#download-dropdown-menu');

    if (targetParent.hasClass('disabled')) {
      targetParent.removeClass('disabled');
    }

    enableCustomSelect('download-select');
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

  /**
   * If the stationId already exists in the state then we don't
   * need to show the Map first. This automatically enables the
   * graph and shows the graph view.
   */
  if (stationId) {
    // show chart overlay
    showGraphs()

    // reset graphs
    resetGraphs({variable: 'temperature', stationId, stationName });

    // toggle button visual state
    $('#chartmap-select-chart-link').removeClass('disabled');
    toggleButton($('#chartmap-select-chart-link'));

    $('#chart-info-row-btn').removeClass('disabled');

    // updates the visible text for the station dropdown with the information from the state url
    updateStationSelectText({stationName, stationId})

    toggleChartInfoText('chart');

    toggleDownloads();

    setTimeout(function () {
      // reset map and chart sizes
      // filer transition means heigh will be updates in few seconds
      // so delaying the resize ensures proper size
      setGraphSizeWeatherData();
    }, 600);
  } else {
    showMap();
    toggleChartInfoText('map');
    setGraphSizeWeatherData();
  }

  /**
   * When a station is selected from the dropdown menu this is triggered.
   */
  $('#stations-dropdown-menu').bind('cs-changed', function (e) {

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

      // change map variable
      window.app.update({stationId, stationName});

      // show chart overlay
      showGraphs();

      // reset graphs
      resetGraphs({variable: 'temperature', stationId, stationName});

      // toggle button visual state
      $('#chartmap-select-chart-link').removeClass('disabled');
      toggleButton($('#chartmap-select-chart-link'));

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setGraphSizeWeatherData();
    }
  });


  /**
   * Handles clicking of the download dropdown.
   */
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

  $('#chartmap-select-chart-link').click(function(e) {

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

    const target = $(e.target);

    const disabled =  target.hasClass('disabled');

    if(disabled) return;

    const selected = target.hasClass('selected-item');

    if(selected) return;

    toggleButton($(target));

    showMap();

    googleAnalyticsEvent('click', 'chartmap', target);
  })

  window.stations = $('#stations-map').stationsMap(Object.assign({
    // When state changes, just pass the current options along directly for this page.
    // If we re-use the stationsMap widget on another page there may be more handling to do.
    change: function change(event, options) {

      // check if there are any tidal stations in map extent
      if (typeof options.currentstations !== "undefined" && options.currentstations.length === 0) {
        noStationsMapMessage('There are no weather stations within the map view.');
        return null;
      }

      window.app.update( options);
      renderStationInfo(options.stationId, options.stationName);

      let message_element = $("#stations-map-message");

      if(message_element) {
        message_element.addClass("d-none");
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
        setGraphSizeWeatherData();
      }, 100);
    }
  }, stationsMapState));

  // reset map and chart sizes
  setGraphSizeWeatherData();
  setBodySize();

  function setChartSize() {

    let nav_element = document.querySelector(".navbar-element");
    let footer_element = document.querySelector(".nav_footer");

    let nav_height = px_to_rem(nav_element.getBoundingClientRect().height);
    let footer_height = px_to_rem(footer_element.getBoundingClientRect().height);

    let graph_body = document.querySelector("#stations-graph-wrap");

    let body_size = document.querySelector(".body-size");
    let body_height = px_to_rem(body_size.getBoundingClientRect().height);

    let search_row = document.querySelector(".search-station-row");
    let search_height = px_to_rem(search_row.getBoundingClientRect().height);

    let info_section = document.querySelector(".info-section");
    let info_height = px_to_rem(info_section.getBoundingClientRect().height);

    let height = body_height - search_height - info_height - nav_height - footer_height;

    graph_body.style.setProperty('height', `calc(${height}rem - 1rem)`);

    let canvas = graph_body.getElementsByTagName("canvas");

    if(canvas.length > 0) {
      canvas[0].style.setProperty('height', `calc(${height}rem - 1rem)`);
      canvas[1].style.setProperty('height', `calc(${height}rem - 1rem)`);
    }
  }

  // setChartSize();

  $(window).resize(function () {
    setGraphSizeWeatherData();
    // setChartSize();
  })

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
    setGraphSizeWeatherData();
  })
});
