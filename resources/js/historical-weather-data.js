'use strict';

$(function () {

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');

  let stationsMapState = window.ce.ce("getStationsMapState");
  const county =  window.ce.ce('getLocationPageState')['county']
  const city = window.ce.ce('getLocationPageState')['city']
  const zoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  const lat = window.ce.ce('getLocationPageState')['lat'];
  const lon = window.ce.ce('getLocationPageState')['lon'];
  const mode = stationsMapState['mode'];
  const stationId = stationsMapState['stationId'];
  const stationName = stationsMapState['stationName'];
  const stationMOverMHHW = stationsMapState['stationMOverMHHW'];
  const center = [lat, lon]

  stationsMapState = {
    mode,
    stationId,
    stationName,
    stationMOverMHHW,
    lat,
    lon,
    zoom,
    center
  };

  // renmove disable state of stations
  const stationsSelectElem = $('#stations-select-vis');
  if ($(stationsSelectElem).hasClass('disabled')) {
    $(stationsSelectElem).removeClass('disabled');
  }

  // if state url has a station render station and not map.
  if (stationId) {
    const stationsGraphRowElem = document.getElementById('stations-graph-row');
    const stationsMapRowElem = document.getElementById('stations-map-row');

    if (stationsGraphRowElem) {
      stationsGraphRowElem.classList.remove('d-off');
      stationsGraphRowElem.classList.add('d-flex');
    }

    if (stationsMapRowElem) {
      stationsMapRowElem.classList.add('d-off');
      stationsMapRowElem.classList.remove('d-flex');
    }

    const options = {variable: 'temperature', station: stationId, stationName:  stationName }
    // resetGraphs(options);

    $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stationId, stationName:  stationName });
    $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  stationId, stationName:  stationName });

    // toggle button visual state
    const selector = $("#chartmap-wrapper #btn-chart")
    toggleButton($('.btn-chart'));

    setTimeout(function () {
      setMapSize();
      // $('#multi-chart').stationAnnualGraph.resize();
      // $('#multi-precip-chart').stationAnnualGraph.resize()
    }, 600);
  }

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

      stationsMapState = {
        mode,
        stationId,
        stationName,
        stationMOverMHHW,
        lat,
        lon,
        zoom,
        center
      };

      $('#stations-graph-wrap').empty()

      $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
      $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

      $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stationId, stationName:  stationName });
      $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  stationId, stationName:  stationName });

      // toggle button visual state
      const selector = $("#chartmap-wrapper #btn-chart")
      // toggleAllButtonsOff(selector.get())
      toggleButton($('.btn-chart'));
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


      const stationsGraphRowElem = document.getElementById('stations-graph-row');
      const stationsMapRowElem = document.getElementById('stations-map-row');

      switch (target.attr('val')) {
        case 'chart':
          if (stationsGraphRowElem) {
            stationsGraphRowElem.classList.remove('d-off');
            stationsGraphRowElem.classList.add('d-flex');
          }

          if (stationsMapRowElem) {
            stationsMapRowElem.classList.add('d-off');
            stationsMapRowElem.classList.remove('d-flex');
          }
          break;
        case 'map':
          if (stationsGraphRowElem) {
            stationsGraphRowElem.classList.remove('d-flex');
            stationsGraphRowElem.classList.add('d-off');
          }

          if (stationsMapRowElem) {
            stationsMapRowElem.classList.add('d-flex');
            stationsMapRowElem.classList.remove('d-off');
          }
          break
        default:

      }
    }
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

      const stationsGraphRowElem = document.getElementById('stations-graph-row');
      const stationsMapRowElem = document.getElementById('stations-map-row');

      switch (target.attr('val')) {
        case 'chart':
          if (stationsGraphRowElem) {
            stationsGraphRowElem.classList.remove('d-off');
            stationsGraphRowElem.classList.add('d-flex');
          }

          if (stationsMapRowElem) {
            stationsMapRowElem.classList.add('d-off');
            stationsMapRowElem.classList.remove('d-flex');
          }
          break;
        case 'map':
          if (stationsGraphRowElem) {
            stationsGraphRowElem.classList.remove('d-flex');
            stationsGraphRowElem.classList.add('d-off');
          }

          if (stationsMapRowElem) {
            stationsMapRowElem.classList.add('d-flex');
            stationsMapRowElem.classList.remove('d-off');
          }
          break
        default:

      }
    }
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
      // $('#stations-map').height($('#stations-map').parent().height());
      // $('#multi-chart').stationAnnualGraph.resize();
      // $('#multi-precip-chart').stationAnnualGraph.resize()
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
      const stationsGraphRowElem = document.getElementById('stations-graph-row');
      const stationsMapRowElem = document.getElementById('stations-map-row');

      if (stationsGraphRowElem) {
        stationsGraphRowElem.classList.remove('d-off');
        stationsGraphRowElem.classList.add('d-flex');
      }

      if (stationsMapRowElem) {
        stationsMapRowElem.classList.add('d-off');
        stationsMapRowElem.classList.remove('d-flex');
      }


      // toggle button visual state
      const selectorToggle = $("#chartmap-wrapper #btn-chart")
      // toggleAllButtonsOff(selector.get())
      toggleButton($('.btn-chart'));

      $('#stations-graph-wrap').empty();
      $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
      $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

      $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: options.stationId, stationName:  options.stationName });
      $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  options.stationId, stationName:  options.stationName });


      // resetGraphs(options);
      window.ce.ce('setStationsMapState', options);

    }
  }, stationsMapState));


  function resetGraphs(stationId, stationName) {
    // remove and reset old graphs
    $('#stations-graph-wrap').empty();

    // add new graph wrappers so they will initialize
    $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
    $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

    // update graphs with new station id and station name
    $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stationId, stationName });
    $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  stationId, stationName });
  }

  // resize map when browser is resized
  function setMapSize() {
    $('#stations-map').height($('#stations-map').parent().height())

    const rect = document.getElementById('stations-map-wrap').getBoundingClientRect();
    if (document.querySelector('.esri-view-root')) {
      document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.maxWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
    }

    if (document.querySelector('.esri-view-user-storage')) {
      document.querySelector('.esri-view-user-storage').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-user-storage').style.maxWidth = `${rect.width}px`;
    }

    if (document.querySelector('#stations-map')) {
      document.querySelector('#stations-map').style.minWidth = `${rect.width}px`;
      document.querySelector('#stations-map').style.maxWidth = `${rect.width}px`;
      document.querySelector('#stations-map').style.height = `${rect.height}px`;
      document.querySelector('#stations-map').style.minWidth = `${rect.height}px`;
    }

    const graphRect = document.getElementById('stations-graph-wrap').getBoundingClientRect();
    if (document.querySelector('#multi-chart')) {
      document.querySelector('#multi-chart').style.minWidth = `${graphRect.width}px`;
      document.querySelector('#multi-chart').style.maxWidth = `${graphRect.width}px`;
      document.querySelector('#multi-chart').style.height = `${graphRect.height}px`;
      document.querySelector('#multi-chart').style.minWidth = `${graphRect.height}px`;
    }

    if (document.querySelector('#multi-precip-chart')) {
      document.querySelector('#multi-precip-chart').style.minWidth = `${graphRect.width}px`;
      document.querySelector('#multi-precip-chart').style.maxWidth = `${graphRect.width}px`;
      document.querySelector('#multi-precip-chart').style.height = `${graphRect.height}px`;
      document.querySelector('#multi-precip-chart').style.minWidth = `${graphRect.height}px`;
    }
  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })


});
