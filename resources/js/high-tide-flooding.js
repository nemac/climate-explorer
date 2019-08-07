'use strict';

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('download-select');

  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  let stationsMapState = window.ce.ce("getStationsMapState");
  const county =  window.ce.ce('getLocationPageState')['county']
  const city = window.ce.ce('getLocationPageState')['city']
  const zoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  const lat = window.ce.ce('getLocationPageState')['lat'];
  const lon = window.ce.ce('getLocationPageState')['lon'];
  const mode = 'high_tide_flooding' // stationsMapState['mode'];
  const stationId = stationsMapState['stationId'];
  const stationName = stationsMapState['stationName'];
  const stationMOverMHHW = stationsMapState['stationMOverMHHW'];
  const center = [lat, lon]

  // initialize staion map state from url values
  stationsMapState = {
    city,
    county,
    mode,
    stationId,
    stationName,
    stationMOverMHHW,
    lat,
    lon,
    zoom,
    center
  };

  // updates the visible text for the station pulldown with the information from the state url
  function updateStationSelectText(stations) {
    const stationsSelectElem = $('#stations-select-vis');
    if (stationsSelectElem) {
      if ( stations.stationId !== undefined) {
        stationsSelectElem.attr('rel',`${stations.stationId},${stations.stationName}`);
        stationsSelectElem.text(`${stations.stationName} - (${stations.stationId})`);
      }
    }
  }

  // zoom to historical part of chart
  $('.btn-tidalzoom').click(function () {
    $("#tidal-chart").tidalstationwidget('zoomToggle');
    $('.btn-tidalzoom').toggleClass('active');
  });
  // the way graphs are handled and initialized require them to visible
  // so we move them off the screen.  this not ideal but we can move
  // trade them with the map when we the use needs them
  function resetGraphs(stations) {
    // remove and reset old graphs
    $('#stations-graph-wrap').empty();

    // add new graph wrappers so they will initialize
    $('#stations-graph-wrap').append('<div id="tidal-chart" class="tidal-chart d-flex-center width-100"></div>');

    // update graphs with new station id and station name
    $("#tidal-chart").tidalstationwidget({
      station: stations.stationId,
      data_url: '/resources/vendor/tidal/tidal_data.json', // defaults to tidal_data.json
      responsive: true // set to false to disable ChartJS responsive sizing.
    });

    $('#tidal_station').change(function () {
      $("#tidal-chart").tidalstationwidget({ station: stations.stationId });
    });
  }

  // updates the visible text for the station pulldown with the information from the state url
  updateStationSelectText({stationName, stationId})

  // show graph overlay.
  // graph is visbile and on page just pushed of viewable area
  // so we can intialize it when needed
  function showGraphs() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');

    // unhide chart overlay
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
  // map is visbile and on page just pushed of viewable area
  // so we can intialize it when needed
  function showMap() {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');

    // unhide chart overlay
    if (stationsGraphRowElem) {
      stationsGraphRowElem.classList.remove('d-flex');
      stationsGraphRowElem.classList.add('d-off');
    }

    // unhide map overlay
    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-flex');
      stationsMapRowElem.classList.remove('d-off');
    }
  }

  // reuturn attribute of html element based on rel for dropdown or val based on button
  // we probably should switch all elements to val for consistency.
  function RelorVal(target){
    if (target.attr('val') === undefined || target.attr('val') === null) {
      return target.attr('rel');
    }
    return  target.attr('val');
  }

  function chooseGraphOrMap(target){
    // check val of button to see if user is on map  or chart
    // hide or unhide the appropriate overlay (map, chart)
    switch (RelorVal(target)) {
      case 'chart':
        // unhide chart overlay
        showGraphs();
        break;
      case 'map':
        // unhide map overlay
        showMap();
      break
      default:
        // unhide chart overlay
        showGraphs();
    }
  }

  function toggleChartInfoText(val) {
    const ChartInfoTextElem = document.getElementById('station-info-row');
    if ( ChartInfoTextElem ) {
      switch (val) {
        case 'chart':
          // unhide chart text
          ChartInfoTextElem.setAttribute("style", 'display: flex;');
          break;
        case 'map':
          // unhide map overlay
          ChartInfoTextElem.setAttribute("style", 'display: none !important;');
          break
        default:
          // unhide chart text
          ChartInfoTextElem.setAttribute("style", 'display: flex;');
      }
    }
  }

  function toggleDownloads() {
    const target = $('#downnloads-select-vis');
    if (target.hasClass('disabled')) {
      target.removeClass('disabled');
      enableCustomSelect('download-select');
    }
  }

  // update chart pulldown to chart as default
  function chartPulldownChartText(){
    // updart pulldown default of chart
    const chartMapElem = $('#chartmap-select-vis');
    if (chartMapElem){
      chartMapElem.attr('rel','chart');
      chartMapElem.text('Chart');
    }
  }

  // if state url has a station render station and not map.
  if (stationId) {
    // unhide chart overlay
    showGraphs()

    // reset graphs
    resetGraphs({variable: 'temperature', stationId, stationName });;

    // toggle button visual state
    toggleButton($('.btn-chart'));

    // update chart pulldown to chart as default
    chartPulldownChartText()

    // updates the visible text for the station pulldown with the information from the state url
    updateStationSelectText({stationName, stationId})

    toggleChartInfoText('chart');

    toggleDownloads();

    setTimeout(function () {
      // reset map and chart sizes
      // filer transistion means heigh will be updates in few seconds
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
    const downloadAction = $(this).attr('rel');

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-tidal-image': // download image
        event.target.href = $("#tidal-chart canvas")[0].toDataURL('image/png');
        event.target.download = "high_tide_flooding_" + stationId + ".png";
        break;
      case 'download-tidal-data':
        $('#multi-chart').stationAnnualGraph('downloadPrecipitationData', event.currentTarget);
        break;
      default:
      event.target.href = $("#tidal-chart canvas")[0].toDataURL('image/png');
      event.target.download = "high_tide_flooding_" + stationId + ".png";
    }
  });

  // in resposnive mode, event hanlder a for when season (time) varriable changes
  $('#stations-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if ( notDisabled ) {
      const val = $('#stations-select-vis').attr('rel').split(',');
      const stationName = val[1];
      const stationId = val[0];


      document.getElementById('station-info').classList.remove('d-none');
      updateStationIDText(`${stationId}`);
      updateStationText(`${stationName}`);

      // change map varriable
      window.ce.ce('setStationsMapState', {stationId, stationName});

      // state url object
      stationsMapState = {
        county,
        mode,
        stationId,
        stationName,
        stationMOverMHHW,
        lat,
        lon,
        zoom,
        center
      };

      // unhide chart overlay
      showGraphs();

      // reset graphs
      resetGraphs({variable: 'temperature', stationId, stationName });;

      // toggle button visual state
      toggleButton($('.btn-chart'));

      toggleChartInfoText('chart');

      toggleDownloads();

      // reset map and chart sizes
      setMapSize();
    }
  })

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = (!target.hasClass('btn-default-disabled') || !target.hasClass('disabled'));

    if ( notDisabled ) {

      // toggle button visual state
      toggleButton($(target));

      // change select pulldowns for resposnive mode
      setSelectFromButton(target);

      // check val of button to see if user is on map  or chart
      // hide or unhide the appropriate overlay (map, chart)
      chooseGraphOrMap(target);
      toggleChartInfoText(RelorVal(target));
    }

    // reset map and chart sizes
    setMapSize();
  })

  // in repsonsive mode the time is a pulldown this eanbles the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').attr('rel')

      // toggle button visual state
      toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

      // check val of button to see if user is on map  or chart
      // hide or unhide the appropriate overlay (map, chart)
      chooseGraphOrMap(target);
      toggleChartInfoText(RelorVal(target));
    }
    // reset map and chart sizes
    setMapSize();
  })

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-varriable').html(chartText);
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
      updateStationIDText(`${stationId}`);
      updateStationText(`${stationName}`);
    } else {
      document.getElementById('station-info').classList.add('d-none');
    }
  }

  renderStationInfo(stationName, stationId);

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
      // reset map and chart sizes
      // filer transistion means heigh will be updates in few seconds
      // so delaying the resize ensures proper size
      setMapSize();
    }, 600);
  })

  window.stations = $('#stations-map').stationsMap(_extends({
    // When state changes, just pass the current options along directly for this page.
    // If we re-use the stationsMap widget on another page there may be more handling to do.
    change: function change(event, options) {
      window.ce.ce('setStationsMapState', options);
      renderStationInfo(options.stationId, options.stationName);
    },

    // when user clicks on map station marker
    // show graph hide map
    // todo add this to puldown events also
    stationUpdated: function(event, options) {
      // unhide chart overlay
      showGraphs();

      // toggle button to select chart
      toggleButton($('.btn-chart'));

      // update chart pulldown to chart as default
      chartPulldownChartText()

      // reset graphs
      resetGraphs({variable: 'temperature', stationId: options.stationId, stationName: options.stationName });;

      // updates the visible text for the station pulldown with the information from the state url
      updateStationSelectText({stationName: options.stationName, stationId: options.stationId})

      window.ce.ce('setStationsMapState', options);

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


    // set size of tidal-chart chart
    if (document.querySelector('#tidal-chart')) {
      document.querySelector('#tidal-chart').style.minWidth = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.maxWidth = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.width = `${graphWidth}px`;
      document.querySelector('#tidal-chart').style.height = `${graphRect.height}px`;
    }
  }

  // reset map and chart sizes
  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })


});
