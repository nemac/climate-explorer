'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';


  enableCustomSelect('chartmap-select');

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
  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  let stationsMapState = window.ce.ce("getStationsMapState");
  const mapcenter = window.ce.ce('getLocationPageState')['center'];
  const mapExtent = window.ce.ce('getLocationPageState')['extent'];
  const zoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  const lat = window.ce.ce('getLocationPageState')['lat'];
  const lon = window.ce.ce('getLocationPageState')['lon'];
  const mode = stationsMapState['mode'];
  const stationId = stationsMapState['station'];
  const stationName = stationsMapState['station-name'];
  const stationMOverMHHW = stationsMapState['station-mhhw'];
  const center = [lon, lat]
  console.log('stationId', stationId)

  stationsMapState = {
    mode,
    stationId,
    stationName,
    stationMOverMHHW,
    // variable: 'variable',
    lat,
    lon,
    zoom,
    center
  };

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

    // layersloaded: function(event) {
    //   console.log(layersloadedevent)
    //   window.ce.stationsMap('getStationsInExtent');
    // }
  }, stationsMapState));




  // $('#stations-map').height($('#stations-map').parent().height());
    // if (typeof window.precipitationScenariosMap === 'undefined') {
      // $('#temperature-map').spinner();
      // window.precipitationScenariosMap = $('#temperature-map').scenarioComparisonMap({
      //   variable: 'tmax',
      //   extent: mapExtent,
      //   center: mapcenter,
      //   zoom: mapZoom,
      //   showCounties: isNational(),
      //   // countyselected: function countyselected(event, value) {
      //   //   window.countySelected($('.cwg-container')[0], value);
      //   // },
      //   layersloaded: function layersloaded() {
      //     $('#temperature-map').spinner('destroy');
      //     const rect = document.getElementById('map-wrap').getBoundingClientRect();
      //     document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
      //     document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
      //     enableCustomSelect('leftScenario-select');
      //     enableCustomSelect('rightScenario-select');
      //
      //     const variable = window.ce.ce('getVariablesPageState')['variable'];
      //     console.log(variable)
      //     if ( variable !== undefined) {
      //       const $styledSelect = $('.select.varriable-select div.select-styled');
      //       $(`[rel="${variable}"]`).click();
      //
      //       // change map varriable
      //       if (window.precipitationScenariosMap) {
      //         $(window.precipitationScenariosMap).scenarioComparisonMap({ variable });
      //       }
      //     }
      //
      //   },
      //   change: function change() {
      //     window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
      //   }
      // });
      // window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
    // }

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

    // document.querySelector('.scenario-map-overlay-container').style.top = `${rect.top}px`;
    // document.querySelector('.scenario-map-overlay-container').style.left = `${rect.left}px`;
    // document.querySelector('.scenario-map-overlay-container').style.width = `${rect.width}px`;
    // document.querySelector('.scenario-map-overlay-container').style.height = `${rect.height}px`;

  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })


});


// var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
//
// $(function () {
//   function updateAboutLink(title, link) {
//     $('#about-stations-link').prop('href', '#detail-' + link).html('About ' + title);
//   }
//
//   var stationsMapState = window.ce.ce("getStationsMapState");
//   if (stationsMapState.mode) {
//     $("#stations-options").val(stationsMapState.mode).change();
//     $("option[value=" + stationsMapState.mode + "]").attr("selected", "selected");
//     updateAboutLink($(".fs-dropdown-item[data-value=" + stationsMapState.mode + "]").text(), stationsMapState.mode);
//   }
//   window.stations = $('#stations-map').stationsMap(_extends({
//     // When state changes, just pass the current options along directly for this page.
//     // If we re-use the stationsMap widget on another page there may be more handling to do.
//     change: function change(event, options) {
//       window.ce.ce('setStationsMapState', options);
//     }
//   }, stationsMapState));
//
//   var initFormMapper = function initFormMapper() {
//     $("#formmapper").formmapper({
//       details: "form"
//     });
//
//     $("#formmapper").bind("geocode:result", function (event, result) {
//       if (result.geometry.access_points) {
//         window.stations.stationsMap({
//           extent: null,
//           center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
//           zoom: 8
//         });
//       } else {
//         window.stations.stationsMap({ extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8 });
//       }
//     });
//   };
//   var whenFormMapper = function whenFormMapper() {
//     if (window.google !== undefined) {
//       initFormMapper();
//     } else {
//       setTimeout(whenFormMapper);
//     }
//   };
//   whenFormMapper();
//
//   $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
//     window.stations.stationsMap({ mode: $(this).data().value });
//     // update about link
//     updateAboutLink($(this).text(), $(this).data().value);
//
//     $('#breadcrumb .current').html($(this).text());
//   });
//
//   $('#stations-options').on('change', function () {
//     $("#chart-name").html($('.fs-dropdown-selected').html());
//   });
// });
