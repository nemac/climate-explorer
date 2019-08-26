'use strict';

$(function () {
  // var activeVariableTemperature = 'tmax';
  // var activeVariablePrecipitation = 'pcpn';
  // var activeVariableDerived = 'hdd';

  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);


  // let mapcenter = window.ce.ce('getLocationPageState')['center'];
  let mapExtent = window.ce.ce('getLocationPageState')['extent'];
  let mapZoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  let lat = window.ce.ce('getLocationPageState')['lat'];
  let lon = window.ce.ce('getLocationPageState')['lon'];
  let variable = window.ce.ce('getLocationPageState')['id'] || 'tmax';
  let city = window.ce.ce('getLocationPageState')['city'];
  let county = window.ce.ce('getLocationPageState')['county'];
  let mapcenter = [lon, lat];

  const locationMapState = {
    city,
    county,
    variable,
    lat,
    lon,
    zoom: mapZoom,
    center: mapcenter,
    id: variable
  };

  if (isNational()) {
    lat = null,
    lon = null,
    mapcenter = null;
    mapExtent = null;
    mapZoom = 7;
  }


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

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-varriable').html(chartText);
  }

  // function to enable downloads (images and data)
  $('.download-select li a').click( function (e) {
    const downloadAction = $(this).attr('rel');

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-rightmap-image': // download image
        mapToImage();
        break;
      default:
        mapToImage();
    }
  });


  function addImage(imageUrl, add=false){
    if (add) {
      const elem = document.getElementById('map-for-print');
      elem.innerHTML = '';
    }
    var img = document.createElement('img');
    img.src = imageUrl;
    document.getElementById('map-for-print').appendChild(img);
  }

  function addBackGroundImage(imageUrl, add=false){
    const currentBackGroundImages = $('#map-for-print').css('background');
    console.log('currentBackGroundImages', currentBackGroundImages)
    if (add) {
       $('#map-for-print').css('background', ` url(${imageUrl}) no-repeat, ${currentBackGroundImages}`);
    } else {
        $('#map-for-print').css('background', ` url(${imageUrl}) no-repeat`);
         console.log('one', $('#map-for-print').css('background-image'));
    }
    // console.log('currentBackGroundImages', currentBackGroundImages)
    //
    //
    // const currentBackGroundImages2 = $('#map-for-print').css('background-image');
    // console.log('currentBackGroundImages2', currentBackGroundImages2)

  }

  function mapToImage() {

    // document.querySelectorAll('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object[display="none"]').forEach(e => e.parentNode.removeChild(e));


    html2canvas($('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object')[0] , {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      // logging: true,
      // letterRendering: 1,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function(canvas) {
        // var a = document.createElement('a');
        const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, true);
        // console.log('onrendered', canvas);
        // // undo your ugly changes
        // a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        // a.download = 'local-climate-map-right.jpg';
        // a.click();
      }
    });

    // const imgElem =  document.get('div');
    html2canvas($('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object')[2] , {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      // logging: true,
      // letterRendering: 1,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function(canvas) {
        // var a = document.createElement('a');
        const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        // addBackGroundImage(imageUrl);
        addImage(imageUrl);
        // console.log('onrendered', canvas);
        // undo your ugly changes
        // a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        // a.download = 'local-climate-map-basemap.jpg';
        // a.click();
      }
    });


    // html2canvas($('#temperature-map .esri-ui-corner-container') , {
    //   allowTaint: true,
    //   useCORS: true,
    //   logging: true,
    //   backgroundColor: null,
    //   letterRendering: 1,
    //   removeContainer: true,
    //   foreignObjectRendering: true,
    //   onrendered: function(canvas) {
    //     var a = document.createElement('a');
    //     const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //     // addBackGroundImage(imageUrl, true);
    //     addImage(imageUrl);
    //     // var a = document.createElement('a');
    //     // console.log('onrendered', canvas);
    //     // // undo your ugly changes
    //     // a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    //     // a.download = 'local-climate-map-legend.jpg';
    //     // a.click();
    //   }
    // });


    // const imgElem =  document.get('div');
    const canvasLength =  $('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object').length
    console.log('canvasLength', canvasLength)
    html2canvas($('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object')[4] , {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      // logging: true,
      // letterRendering: 1,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function(canvas) {
        // var a = document.createElement('a');
        const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        // addBackGroundImage(imageUrl, true);
        addImage(imageUrl);
        const elem = document.getElementById('map-for-print');
        elem.classList.remove('d-none');
        // console.log('onrendered', canvas);
        // undo your ugly changes
        // a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        // a.download = 'local-climate-map-labels.jpg';
        // a.click();
      }
    });


    //
    // html2canvas($('#temperature-map .esri-view-root .esri-view-surface canvas.esri-display-object')[4] , {
    //   allowTaint: true,
    //   useCORS: true,
    //   logging: true,
    //   letterRendering: 1,
    //   removeContainer: false,
    //   foreignObjectRendering: true,
    //   onrendered: function(canvas) {
    //     var a = document.createElement('a');
    //     console.log('onrendered', canvas);
    //     // undo your ugly changes
    //     a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    //     a.download = 'local-climate-map-left.jpg';
    //     a.click();
    //   }
    // });
    //
    // html2canvas($('#temperature-map .esri-view-root .esri-view-surfaced .esri-display-object canvas.esri-display-object') , {
    //   allowTaint: true,
    //   useCORS: true,
    //   logging: true,
    //   backgroundColor: 	'#ffffff',
    //   letterRendering: 1,
    //   removeContainer: true,
    //   foreignObjectRendering: true,
    //   onrendered: function(canvas) {
    //     var a = document.createElement('a');
    //     const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    //     addBackGroundImage(imageUrl, true);
    //     // undo your ugly changes
    //   //   a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    //   //   a.download = 'local-climate-map-states.jpg';
    //   //   a.click();
    //   }
    // });

    //
    // html2canvas($('#temperature-map .esri-view-user-storage .bottom-scenario-controls') , {
    //   allowTaint: true,
    //   useCORS: true,
    //   logging: true,
    //   backgroundColor: 	'#ffffff',
    //   letterRendering: 1,
    //   removeContainer: true,
    //   foreignObjectRendering: true,
    //   onrendered: function(canvas) {
    //     var a = document.createElement('a');
    //     console.log('onrendered', canvas);
    //     // undo your ugly changes
    //     a.href = canvas.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
    //     a.download = 'local-climate-map-buttons.jpg';
    //     a.click();
    //   }
    // });
    //


    html2canvas($('#map-for-print') , {
      allowTaint: true,
      useCORS: true,
      logging: true,
      backgroundColor: '#ffffff',
      letterRendering: 1,
      // removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function(canvas) {
        const elem = document.getElementById('map-for-print');
        var a = document.createElement('a');
        console.log('onrendered', canvas);
        // undo your ugly changes
        a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        a.download = 'local-climate-map.png';
        a.click();
        elem.classList.add('d-none');
      }
    });


    // domtoimage.toJpeg(document.getElementById('map-row'), { quality: 0.95 })
    //   .then(function (dataUrl) {
    //       var link = document.createElement('a');
    //       link.download = 'my-image-name.jpeg';
    //       link.href = dataUrl;
    //       link.click();
    //   });
  }

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

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = (!target.hasClass('btn-default-disabled') || !target.hasClass('disabled'));

    if ( notDisabled ) {

      // toggle button visual state
      toggleButton($(target));

      // change select pulldowns for resposnive mode
      setSelectFromButton(target);

      handleChartMapClick(target);
    }
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
      const variable = $('#varriable-select-vis').attr('rel')
      window.ce.ce('setVariablesMapState',{variable})
      // disable varriablles if they are valid time period
      const isvalid =   jQuery.inArray( variable , validSeasonal);
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

      // update the text
      updateTitle($('#varriable-select-vis').text());

      // change map varriable
      if (window.precipitationScenariosMap) {
        $(window.precipitationScenariosMap).scenarioComparisonMap({ variable });
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

  function isNational(){
    return (window.ce.ce('getNavFooterState')['nav'] ===  'national-climate-maps' )
  }

  $('#temperature-map').height($('#temperature-map').parent().height());
  if (typeof window.precipitationScenariosMap === 'undefined') {
    $('#temperature-map').spinner();
    const variable = window.ce.ce('getVariablesPageState')['variable'] || 'tmax';
    window.precipitationScenariosMap = $('#temperature-map').scenarioComparisonMap({
      variable: 'tmax',
      extent: mapExtent,
      center: mapcenter,
      zoom: mapZoom,
      showCounties: isNational(),
      layersloaded: function layersloaded() {
        $('#temperature-map').spinner('destroy');
        const rect = document.getElementById('map-wrap').getBoundingClientRect();
        document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
        document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
        enableCustomSelect('leftScenario-select');
        enableCustomSelect('rightScenario-select');

        if ( variable !== undefined) {
          const $styledSelect = $('.select.varriable-select div.select-styled');
          $(`[rel="${variable}"]`).click();

          // change map varriable
          if (window.precipitationScenariosMap) {
            $(window.precipitationScenariosMap).scenarioComparisonMap({ variable });
          }
        }

      },
      change: function change(event) {
        window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
      }
    });
    window.precipitationScenariosMap.scenarioComparisonMap("getShowSeasonControls") ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
  }

  if (!isNational()) {
      window.stations = $('#temperature-map').scenarioComparisonMap(_extends({
        // When state changes, just pass the current options along directly for this page.
        // If we re-use the stationsMap widget on another page there may be more handling to do.
        change: function change(event, options) {
          window.ce.ce('setLocationPageState', options);
        },
      }, locationMapState ));
  }

  function setMapSize() {
    $('#temperature-map').height($('#temperature-map').parent().height())

    const rect = document.getElementById('map-wrap').getBoundingClientRect();

    if (document.querySelector('.esri-view-root')) {
      document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.maxWidth = `${rect.width}px`;
      document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
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

    document.querySelector('#map-for-print').style.top = `${rect.top}px`;
    document.querySelector('#map-for-print').style.left = `${rect.left}px`;
    document.querySelector('#map-for-print').style.width = `${rect.width}px`;
    document.querySelector('#map-for-print').style.height = `${rect.height}px`;


  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })


});
