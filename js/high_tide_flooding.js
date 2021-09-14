import './main.js';
import './stations_map.js';

$(function () {
 
  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');
  enableCustomSelect('tidalzoom-select');

  const widget = new TidalStationWidget($('#tidal-chart')[0], {
    data_url: 'https://crt-climate-explorer.nemac.org/data/high-tide-flooding-widget/tidal_data.json',
    responsive: true
  }); // this is using the rollup name now and not the name of the class

  $('.footer-button').removeClass('footer-button-selected');
  $('[data-page="high_tide_flooding"]').addClass('footer-button-selected');

  const state = window.app.state
  const cityStateCE = state['city'];
  const countyCE = state['county'];

  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  if (!countyCE) {
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }
  const county = state['county']
  const city = state['city']
  const zoom = state['zoom'] || 9;
  const lat = state['lat'];
  const lon = state['lon'];
  const mode = 'high_tide_flooding' // stationsMapState['mode'];
  const stationId = state['stationId'];
  const stationName = state['stationName'];
  const tidalStationId = state['tidalStationId'];
  const tidalStationName = state['tidalStationName'];
  const tidalStationMOverMHHW = state['tidalStationMOverMHHW'];
  const center = [lat, lon]

  // initialize station map state from url values
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
      if (!!stations.tidalStationId) {
        stationsSelectElem.data('value', `${stations.tidalStationId}|${stations.tidalStationName}`);
        stationsSelectElem.text(`${stations.tidalStationName} - (${stations.tidalStationId})`);
      }
    }
  }

  /**
   * Clicking Historical & Modeled button
   */
  $('#historical-model-selection').click(function (e) {

    let disabled = $("#historical-model-selection").hasClass('disabled');

    if(disabled) return;

    let is_selected = $("#historical-model-selection").hasClass('selected-item');

    if(is_selected) return;

    widget.zoomToggle();

    // Make the clicked button the new selection.
    $("#historical-model-selection").removeClass('default-selection');
    $("#historical-model-selection").addClass('selected-item');

    // Remove the selection from the old button.
    $("#historical-selection").removeClass('selected-item');
    $("#historical-selection").addClass('default-selection');

    googleAnalyticsEvent('click', 'tidalzoom', 'Historical & Modeled');
  });

  /**
   * Clicking Historical button
   */
  $('#historical-selection').click(function (e) {

    let disabled = $("#historical-selection").hasClass('disabled');

    if(disabled) return;

    let is_selected = $("#historical-selection").hasClass('selected-item');

    if(is_selected) return;

    widget.zoomToggle();

    // Make the clicked button the new selection.
    $("#historical-selection").removeClass('default-selection');
    $("#historical-selection").addClass('selected-item');

    // Remove the selection from the old button.
    $("#historical-model-selection").removeClass('selected-item');
    $("#historical-model-selection").addClass('default-selection');

    googleAnalyticsEvent('click', 'tidalzoom', 'Historical');
  });


  // in responsive mode the time is a dropdown this enables the change of the zoom of to
  // historical vs zoom to historical and modeled
  $('#tidalzoom-select-vis').bind('cs-changed', function (e) {
  
    const target = $(e.target);

    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const val = $('#tidalzoom-select-vis').data('value');
      if (!$(`.btn-tidalzoom-${val}`).hasClass('btn-default-selected')) {
        // toggle button visual state
        $(`#historical-model-selection`).removeClass('btn-default-selected');
        $(`#historical-selection`).removeClass('btn-default-selected');

        $(`.btn-tidalzoom-${val}`).addClass('btn-default-selected');

        widget.zoomToggle();
      }
    }
  })

  // the way graphs are handled and initialized require them to visible
  // so we move them off the screen.  this not ideal but we can move
  // trade them with the map when we the use needs them
  function resetGraphs(stations) {

    // update graphs with new station id and station name
    
    // widget.options.station = stations.tidalStationId;
    
    $('#tidal_station').change(function () {
      widget.request_update({'station': stations.tidalStationId});
    });

    $('#historical-model-selection').removeClass('disabled');
    $('#historical-model-selection').removeClass('default-selection');
    $('#historical-model-selection').addClass('selected-item');

    $('#historical-selection').removeClass('disabled');
    $('#historical-selection').addClass('default-selection');
  }

  // updates the visible text for the station dropdown with the information from the state url
  updateStationSelectText({tidalStationName, tidalStationId})

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
      stationsGraphRowElem.classList.remove('d-off');
      stationsGraphRowElem.classList.add('d-flex');
    }

    // hide chart overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-off');
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
  function RelorVal(target) {
    if (target.data('value') === undefined || target.data('value') === null) {
      return target.data('value');
    }
    return target.data('value');
  }

  // hide or show appropriate view
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
    if (ChartInfoTextElem) {
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
  function chartDropdownChartText() {
    // update dropdown default of chart
    const chartMapElem = $('#chartmap-select-vis');
    if (chartMapElem) {
      chartMapElem.data('value', 'chart');
      chartMapElem.text('Chart');
    }
  }

  // if state url has a station render station and not map.
  if (tidalStationId) {
    // show chart overlay
    showGraphs()

    // reset graphs
    resetGraphs({variable: 'temperature', tidalStationId, tidalStationName});
    widget.request_update({'station': tidalStationId});

    // toggle button visual state
    $('#chartmap-select-chart-link').removeClass('disabled');
    toggleButton($('#chartmap-select-chart-link'));

    // update chart dropdown to chart as default
    chartDropdownChartText()

    $('#chart-info-row-btn').removeClass('disabled');

    // updates the visible text for the station dropdown with the information from the state url
    updateStationSelectText({tidalStationName, tidalStationId})

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
  $('.download-select li a').click(function (e) {
    const downloadAction = $(this).data('value');
    const tidalStationId = window.app.state['tidalStationId'];

    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-tidal-image': // download image

          if(widget) {
            widget.request_download_image();
          }

        break;
      case 'download-tidal-data':
        $('#multi-chart').stationAnnualGraph('downloadPrecipitationData', event.currentTarget);
        break;
      default:
        e.target.href = $("#tidal-chart canvas")[0].toDataURL('image/png');
        e.target.download = "high_tide_flooding_" + tidalStationId + ".png";
    }
  });

  /**
   * When a station is selected from the dropdown menu this is triggered.
   */
  $('#stations-dropdown-menu').bind('cs-changed', function (e) {

    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {

      const val = target.data('value').split('|');

      const tidalStationName = val[1];
      const tidalStationId = val[0];
      const tidalStationMOverMHHW = val[2];

      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');

      updateStationIDText(`${tidalStationId}`);
      updateStationText(`${tidalStationName}`);
      updatestationMOverMHHWText(`${tidalStationMOverMHHW}m over MHHW`);

      // change map variable
      window.app.update({tidalStationId, tidalStationName, tidalStationMOverMHHW});

      // show chart overlay
      showGraphs();

      // reset graphs
      resetGraphs({variable: 'temperature', tidalStationId, tidalStationName });
      widget.request_update({'station': tidalStationId});

      // toggle button visual state
      $('#chartmap-select-chart-link').removeClass('disabled');
      toggleButton($('#chartmap-select-chart-link'));

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setMapSize();

    }
  });

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

  // in responsive mode the time is a dropdown this enables the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if (notDisabled) {
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

  // this function Updates the chart title.
  function updatestationMOverMHHWText(text) {
    $('#default-stationMOverMHHW').html(text);
  }

  function renderStationInfo(tidalStationName, tidalStationId, tidalStationMOverMHHW) {
    if (!!tidalStationName) {
      document.getElementById('station-info').classList.remove('d-none');
      document.getElementById('station-info-none').classList.add('d-none');
      updateStationIDText(`${tidalStationId}`);
      updateStationText(`${tidalStationName}`);
      updatestationMOverMHHWText(`${tidalStationMOverMHHW}m over MHHW`)
    } else {
      document.getElementById('station-info').classList.add('d-none');
      document.getElementById('station-info-none').classList.remove('d-none');
    }
  }

  renderStationInfo(tidalStationName, tidalStationId, tidalStationMOverMHHW);

  // toggle filters click
  $('#filters-toggle').click(function (e) {
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
      const messageElem = document.getElementById('stations-map-message');
      // show message if there are no tidal stations in map extent
      if (typeof options.currentstations !== "undefined" && options.currentstations.length === 0) {
        // get map parent element - which provides the correct dimensions for the map
        if (messageElem) {
          const rect = document.getElementById('stations-map-wrap').getBoundingClientRect();
          messageElem.style.left = `${(rect.right - rect.left) / 3}px`;
          messageElem.style.top = `-${((rect.bottom - rect.top) / 2)}px`;
          messageElem.style.pointerEvents = 'none';
          messageElem.innerHTML = 'Move the map to a coastal location to select a tidal gauge station.'
          messageElem.classList.remove('d-none');
        }
        return null
      }
      // todo restrict this down so we're not passing ALL options in here
      window.app.update(options);
      renderStationInfo(options.tidalStationId, options.tidalStationName, options.tidalStationMOverMHHW);

      if (messageElem) {
        messageElem.classList.add('d-none');
      }


    },

    // when user clicks on map station marker
    // show graph hide map
    // todo add this to dropdown events also
    stationUpdated: function (event, options) {

      // show chart overlay
      showGraphs();

      // toggle button to select chart
      $(`#chartmap-select-chart-link`).removeClass("disabled");
      toggleButton($(`#chartmap-select-chart-link`));

      // update chart dropdown to chart as default
      chartDropdownChartText();

      // reset graphs
      resetGraphs({variable: 'temperature', tidalStationId: options.tidalStationId, tidalStationName: options.tidalStationName});

      widget.request_update({'station': options.tidalStationId});

      // updates the visible text for the station dropdown with the information from the state url
      updateStationSelectText({tidalStationName: options.tidalStationName, tidalStationId: options.tidalStationId})
      renderStationInfo(options.tidalStationName, options.tidalStationId, options.tidalStationMOverMHHW);

      // todo restrict this down so we're not passing ALL options in here
      window.app.update(options);

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setMapSize();
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
      messageElem.style.left = `${(rect.right - rect.left) / 3}px`;
      messageElem.style.top = `-${((rect.bottom - rect.top) / 2)}px`;
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

    // set size of temp chart
    if (graphRect.width <= 900) {
      if (document.querySelector('#stations-graph-row')) {
        document.querySelector('#stations-graph-row').style.height = `350px`;
        document.querySelector('#stations-graph-row').style.minHeight = `350px`;
      }
    }

    // set size of tidal-chart chart
    if (document.querySelector('#tidal-chart')) {
      document.querySelector('#tidal-chart').style.minWidth = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.maxWidth = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.width = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.height = `${graphRect.height}px`;
    }

    // set size of map
    if (document.querySelector('.chartjs-size-monitor')) {
      document.querySelector('.chartjs-size-monitor').style.minWidth = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.maxWidth = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.width = `${graphWidth}px`;
      document.querySelector('.chartjs-size-monitor').style.height = `${graphRect.height}px`;
    }
  }

  function setBodySize() {

    let nav_element = document.querySelector(".navbar-element");
    let footer_element = document.querySelector(".footer-element");

    let nav_height = nav_element.getBoundingClientRect().height / 16;
    let footer_height = footer_element.getBoundingClientRect().height / 16;

    let high_tide_body = document.querySelector(".high-tide-flooding-body");
    high_tide_body.style.paddingTop = nav_height + "rem";
    high_tide_body.style.paddingBottom = footer_height + "rem";

  }

  // reset map and chart sizes
  setMapSize();
  setBodySize();

  $(window).resize(function () {
    setMapSize();
    setBodySize();
  })

  $('#chart-info-row-btn .more-info.btn-default').click(function (e) {

    let disabled = $('.more-info').hasClass('btn-default-disabled');

    if(disabled) return;

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
