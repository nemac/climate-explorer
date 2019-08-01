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

  // in resposnive mode, event hanlder a for when season (time) varriable changes
  $('#stations-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('disabled');
    if ( notDisabled ) {
      const val = $('#stations-select-vis').attr('rel').split(',');
      const stationId = val[1];
      const stationName = val[0];

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

      // handleChartMapClick(target);
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
      }, 600);
  })


window.stations = $('#stations-map').stationsMap(_extends({
  // When state changes, just pass the current options along directly for this page.
  // If we re-use the stationsMap widget on another page there may be more handling to do.
  change: function change(event, options) {
    window.ce.ce('setStationsMapState', options);
    renderStationInfo(options.stationId, options.stationName);
  },
}, stationsMapState));

// }

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
