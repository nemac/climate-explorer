'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';

  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  const mapExtent = window.ce.ce('getLocationPageState')['extent'];
  const mapZoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  const mapcenter = window.ce.ce('getLocationPageState')['center'];

  // enable custom selction boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('varriable-select');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');


  // valid seasonal varriables
  // seasonal timeperoid is only valud for limitited varriables
  // to dissable those varriabls from the user we use this constant
  const validSeasonal = ['tmax', 'tmin', 'pcpn'];

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
        $('#temperature-map').height($('#temperature-map').parent().height());
      }, 600);

  })

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);

    // toggle button visual state
    toggleButton($(target));

    // change select pulldowns for resposnive mode
    setSelectFromButton(target);

    handleChartMapClick(target);
  })

  // update season map
  function updateSeason(targetval) {
    if (window.precipitationScenariosMap) {
      $(window.precipitationScenariosMap).scenarioComparisonMap({ season: targetval });
    }
  }


  // eanbles time annual, monlthly click events
  $('#time-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    // not all varriables can display monthly chart
    // when the varriable cannot display monthly chart do
    // do execute the click event
    if ( notDisabled ) {
      const val = target.attr('val')

      // toggle button visual state
      toggleButton(target);

      // change select pulldowns for resposnive mode
      setSelectFromButton(target);

      // change map varriable
      updateSeason(val);
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

      handleChartMapClick(target);
    }
  })

  // event hanlder a for when map varriable changes
  $('#varriable-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if ( notDisabled ) {
      const val = $('#varriable-select-vis').attr('rel')

      // disable varriablles if they are valid time period
      const isvalid =   jQuery.inArray( val , validSeasonal);
      if (  isvalid < 0 ) {
        $('.btn-summer').addClass('btn-default-disabled');
        $('.btn-summer').removeClass('btn-default');

        $('.btn-winter').addClass('btn-default-disabled');
        $('.btn-winter').removeClass('btn-default');

        $('.btn-fall').addClass('btn-default-disabled');
        $('.btn-fall').removeClass('btn-default');

        $('.btn-spring').addClass('btn-default-disabled');
        $('.btn-spring').removeClass('btn-default');

        $('#time-select-vis').addClass('disabled');
        $('#time-select-wrapper').addClass('disabled');

      } else {
        $('.btn-summer').removeClass('btn-default-disabled');
        $('.btn-summer').addClass('btn-default');

        $('.btn-winter').removeClass('btn-default-disabled');
        $('.btn-winter').addClass('btn-default');

        $('.btn-fall').removeClass('btn-default-disabled');
        $('.btn-fall').addClass('btn-default');

        $('.btn-spring').removeClass('btn-default-disabled');
        $('.btn-spring').addClass('btn-default');

        $('#time-select-vis').removeClass('disabled');
        $('#time-select-wrapper').removeClass('disabled');

      }

      // change map varriable
      if (window.precipitationScenariosMap) {
        $(window.precipitationScenariosMap).scenarioComparisonMap({ variable: val });
      }
    }
  })

  // in resposnive mode, event hanlder a for when season (time) varriable changes
  $('#time-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').attr('rel')

      // change map varriable
      updateSeason(val);
    }
  })


// $(window.precipitationScenariosMap).scenarioComparisonMap({ season: $(this).data().value });


    $('#temperature-map').height($('#temperature-map').parent().height());
    if (typeof window.precipitationScenariosMap === 'undefined') {
      $('#temperature-map').spinner();
      window.precipitationScenariosMap = $('#temperature-map').scenarioComparisonMap({
        variable: 'tmax',
        extent: mapExtent,
        center: mapcenter,
        zoom: mapZoom,
        showCounties: false,
        layersloaded: function layersloaded() {
          $('#temperature-map').spinner('destroy');
          const rect = document.getElementById('map-wrap').getBoundingClientRect();
          document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
          document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
          document.querySelector('.esri-view-root').style.minWidth = `${rect.height}px`;
          enableCustomSelect('leftScenario-select');
          enableCustomSelect('rightScenario-select');

        },
        change: function change() {
          window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
        }
      });
      window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
    }

  function setMapSize() {
    $('#temperature-map').height($('#temperature-map').parent().height())

    const rect = document.getElementById('map-wrap').getBoundingClientRect();

    // document.querySelector('.esri-view-root').style.width = `${rect.width}px`;
    // document.querySelector('.esri-view-root').style.minWdth = `${rect.width}px`;
    // document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
    //
    // document.querySelector('#temperature-map').style.width = `${rect.width}px`;

    // setTimeout(function () {
    //   document.querySelector('.esri-view-root').style.minWdth = `${rect.width}px`;
    // }, 600);
    if (document.querySelector('.esri-view-root')) {
      document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.maxWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
      document.querySelector('.esri-view-root').style.minWidth = `${rect.height}px`;
    }

    if (document.querySelector('.esri-view-user-storage')) {
      document.querySelector('.esri-view-user-storage').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-user-storage').style.maxWidth = `${rect.width}px`;
    }

    if (document.querySelector('.temperature-map')) {
      document.querySelector('.temperature-map').style.minWidth = `${rect.width}px`;
      document.querySelector('.temperature-map').style.maxWidth = `${rect.width}px`;
      document.querySelector('.temperature-map').style.height = `${rect.height}px`;
      document.querySelector('.temperature-map').style.minWidth = `${rect.height}px`;
    }


    document.querySelector('.scenario-map-overlay-container').style.top = `${rect.top}px`;
    document.querySelector('.scenario-map-overlay-container').style.left = `${rect.left}px`;
    document.querySelector('.scenario-map-overlay-container').style.width = `${rect.width}px`;
    document.querySelector('.scenario-map-overlay-container').style.height = `${rect.height}px`;

    // document.querySelector('.esri-view-root').style.top = `${rect.top}px`;
    // document.querySelector('.esri-view-root').style.left = `${rect.left}px`;
    // document.querySelector('.esri-view-root').style.width = `${rect.width}px`;
    // document.querySelector('.esri-view-root').style.height = `${rect.height}px`;

  }

  setMapSize();

  // document.getElementById('local-climate-maps-viewport').addEventListener('onscroll', (e) => {
  //   console.log('scrolling');
  // })

  document.getElementById('local-climate-maps-viewport').addEventListener('scroll', (e) => {
    // setMapSize();;
  })

  // document.getElementById('local-climate-maps-viewport').addEventListener('touchend', (e) => {
  //   console.log('scrolling');
  // })

  $(window).resize(function () {
    setMapSize();
  })
});
