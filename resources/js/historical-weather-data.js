'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';

  enableCustomSelect('chartmap-select');
  enableCustomSelect('stations-select');

  // get city, state from state url
  // $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  // $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  // $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  let stationsMapState = window.ce.ce("getStationsMapState");
  const county =  window.ce.ce('getLocationPageState')['county']
  const city = window.ce.ce('getLocationPageState')['city']
  // const mapcenter = window.ce.ce('getLocationPageState')['center'];
  // const mapExtent = window.ce.ce('getLocationPageState')['extent'];
  const zoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  const lat = window.ce.ce('getLocationPageState')['lat'];
  const lon = window.ce.ce('getLocationPageState')['lon'];
  const mode = stationsMapState['mode'];
  // const extent = stationsMapState['extent'];
  const stationId = stationsMapState['stationId'];
  const stationName = stationsMapState['stationName'];
  const stationMOverMHHW = stationsMapState['stationMOverMHHW'];
  const center = [lat, lon]

  stationsMapState = {
    mode,
    stationId,
    stationName,
    stationMOverMHHW,
    // extent,
    // variable: 'variable',
    lat,
    lon,
    zoom,
    center
  };

  // renove disable state of stations
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
    toggleAllButtonsOff(selector.get())
    toggleButton($('.btn-chart'));

    setTimeout(function () {
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
        // extent,
        // variable: 'variable',
        lat,
        lon,
        zoom,
        center
      };

      console.log(stationId, stationName)
      $('#stations-graph-wrap').empty()

      $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
      $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

      $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stationId, stationName:  stationName });
      $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  stationId, stationName:  stationName });

      // toggle button visual state
      const selector = $("#chartmap-wrapper #btn-chart")
      toggleAllButtonsOff(selector.get())
      toggleButton($('.btn-chart'));

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

      // handleChartMapClick(target);
    }
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
      $('#stations-map').height($('#stations-map').parent().height());
      $('#multi-chart').stationAnnualGraph.resize();
      $('#multi-precip-chart').stationAnnualGraph.resize()
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
      console.log('stationupdated')
      const stationsGraphRowElem = document.getElementById('stations-graph-row');
      const stationsMapRowElem = document.getElementById('stations-map-row');
      console.log('stationupdated2')

      if (stationsGraphRowElem) {
        stationsGraphRowElem.classList.remove('d-off');
        stationsGraphRowElem.classList.add('d-flex');
      }

      if (stationsMapRowElem) {
        stationsMapRowElem.classList.add('d-off');
        stationsMapRowElem.classList.remove('d-flex');
      }

      console.log('stationupdated3')


      // const innerText = target.html().trim();
      // const val = target.attr('val');
      // const selector = target.attr('sel');
      //
      // console.log('selector', selector)
      //
      //
      // $(`#${selector}`).text(innerText);
      // $(`#${selector}`).attr('rel', val);

      // $('#stations-graph-wrap').empty()
      //
      // $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
      // $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');
      //
      // $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: stationId, stationName:  stationName });
      // $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  stationId, stationName:  stationName });

      // toggle button visual state
      const selectorToggle = $("#chartmap-wrapper #btn-chart")
      // toggleAllButtonsOff(selector.get())
      toggleButton($('.btn-chart'));


      console.log(stationId, stationName)
      $('#stations-graph-wrap').empty()

      $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
      $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

      $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: options.stationId, stationName:  options.stationName });
      $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  options.stationId, stationName:  options.stationName });


      // resetGraphs(options);
      window.ce.ce('setStationsMapState', options);

    }
  }, stationsMapState));


  function resetGraphs(options) {
    console.log('resetGraphs', options)
    $('#stations-graph-wrap').empty()

    $('#stations-graph-wrap').append('<div id="multi-chart" class="left_chart d-flex-center width-50"></div>');
    $('#stations-graph-wrap').append('<div id="multi-precip-chart" class="left_chart d-flex-center width-50"></div>');

    $('#multi-chart').stationAnnualGraph({ variable: 'temperature', station: options.stationId, stationName:  options.stationName });
    $('#multi-precip-chart').stationAnnualGraph({ variable: 'precipitation', station:  options.stationId, stationName:  options.stationName });
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
  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })


});
