'use strict';
import ScenarioComparisonMap from "./scenarioComparisonMap";
/* globals html2canvas */

$(function () {
  // get city, state from state url
  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  let isAlaska = false;
  let isHawaii = false;

  if (cityStateCE) {
    isAlaska = (cityStateCE.indexOf('Alaska') >= 0 || cityStateCE.indexOf(', AK') > 0);
    isHawaii = (cityStateCE.indexOf('Hawaii') >= 0 || cityStateCE.indexOf(', HI') > 0);
  }

  $('#default-city-state').text(cityStateCE);
  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  if (!cityStateCE) {
    $('#default-in').addClass('d-none');
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  if (cityStateCE) {
    if (cityStateCE.indexOf('County') > 0) {
      $('#default-in').addClass('d-none');
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }

  updateValidVarriable();

  let mapExtent = window.ce.ce('getLocationPageState')['extent'];
  let mapZoom = window.ce.ce('getLocationPageState')['zoom'] || 9;
  let lat = window.ce.ce('getLocationPageState')['lat'];
  let lon = window.ce.ce('getLocationPageState')['lon'];
  let variable = window.ce.ce('getLocationPageState')['id'] || 'tmax';
  let city = window.ce.ce('getLocationPageState')['city'];
  let county = window.ce.ce('getLocationPageState')['county'];
  let fips = window.ce.ce('getLocationPageState')['fips'];

  const locationMapState = {
    city,
    county,
    variable,
    lat,
    lon,
    zoom: mapZoom,
    center: [lon, lat],
    id: variable,
    fips
  };

  if (isNational()) {
    locationMapState['lat'] = null;
    locationMapState['lon'] = null;
    locationMapState['center'] = null;
    locationMapState['extent'] = null;
    locationMapState['zoom'] = 9;
    locationMapState['fips'] = null;
  }


  // enable custom selection boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('variable-select');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');

  initVarriableToolTips();

  // valid seasonal variables
  // seasonal timeperiod is only valid for limited variables
  // to disable those variables from the user we use this constant
  const validSeasonal = ['tmax', 'tmin', 'pcpn'];

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-variable').html(chartText);
  }

  window.addEventListener('last-left-image-added', function () {
    exportLeft();
  })

  window.addEventListener('last-right-image-added', function () {
    exportRight();
  })

  $('#clear-location').click(function (e) {
    const target = $(e.target);
    handleClearLocationClick(target);
  })

  // function to enable downloads (images and data)
  $('.download-select li a').click(function () {
    const downloadAction = $(this).attr('rel');
    $('#local-climate-map-element').spinner();

    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-rightmap-image': // download image
        mapToImageRight();
        break;
      case 'download-leftmap-image': // download image
        mapToImageLeft();
        break;
      default:
        mapToImageRight();
    }
  });

  function addImage(imageUrl, side = 'left', cssclass = 'none', add = false) {
    if (add) {
      const elem = document.getElementById(`map-for-print-${side}`);
      elem.innerHTML = '';
    }
    const img = document.createElement('img');
    img.src = imageUrl;
    if (cssclass) {
      img.classList.add(cssclass)
    }
    img.setAttribute('crossorigin', 'anonymous');
    document.getElementById(`map-for-print-${side}`).appendChild(img);
  }

  function getBase64Image(img) {
    const canvas = document.createElement("canvas");
    // hardcoded until there is a better way
    canvas.width = 280;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

  function exportRight() {
    // download image of images
    const elem = document.getElementById('map-for-print-right');
    elem.classList.remove('d-none');

    html2canvas($('#map-for-print-right'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      letterRendering: 1,
      foreignObjectRendering: true,
      onrendered: function (canvas) {

        const emissionsText = $('#rightScenario-select-vis').text().toLowerCase().replace(' ', '_');
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        a.download = `local-climate-map-${variable}-${emissionsText}-right.png`;
        document.body.appendChild(a);
        a.click();
        elem.classList.add('d-none');
        document.body.removeChild(a);
        $('#local-climate-map-element').spinner('destroy');
      }
    });
  }

  function exportLeft() {
    // download image of images
    const elem = document.getElementById('map-for-print-left');
    elem.classList.remove('d-none');

    html2canvas($('#map-for-print-left'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      letterRendering: 1,
      foreignObjectRendering: true,
      onrendered: function (canvas) {

        const emissionsText = $('#leftScenario-select-vis').text().toLowerCase().replace(' ', '_');
        const a = document.createElement('a');
        a.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        a.download = `local-climate-map-${variable}-${emissionsText}-left.png`;
        document.body.appendChild(a);
        a.click();
        elem.classList.add('d-none');
        document.body.removeChild(a);
        $('#local-climate-map-element').spinner('destroy');
      }
    });
  }

  function mapToImageRight() {
    // base map
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[0], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'basemap', true);
      }
    });

    // export right map
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[2], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'rightmap');
      }
    });

    // export label and state boundaries overlay
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[4], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'label-boundaries-overlay1');
      }
    });

    // export label and state boundaries overlay
    const canvasLength = $('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object').length;
    if (canvasLength >= 6) {
      html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[5], {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        removeContainer: true,
        foreignObjectRendering: true,
        onrendered: function (canvas) {
          const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          addImage(imageUrl, 'right', 'label-boundaries-overlay2');
        }
      });
    }

    // export legend
    html2canvas($('.esri-expand__content .legend-image'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function () {

        const imgurl = $('.esri-expand__content .legend-image')[0].src;
        let imageExists = new Image();
        imageExists.addEventListener('load', imageFound);
        imageExists.addEventListener('error', imageNotFound);
        imageExists.src = imgurl;

        function imageFound() {
          // const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          const base64temp = getBase64Image($('.esri-expand__content .legend-image')[0])
          addImage(base64temp, 'right', 'legend');
          return true;
        }

        function imageNotFound() {
          return false;
        }
      }
    });

    // export right controls
    html2canvas($('.bottom-scenario-controls .right-scenario-controls'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'bottom-controls');
      }
    });

    // export right title
    html2canvas($('#info-text-wrapper'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'title');
      }
    });

    // export attribution
    html2canvas($('.esri-ui-inner-container.esri-ui-manual-container .esri-component.esri-attribution.esri-widget'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'right', 'attribution');
        const leftMapDoneEvent = new CustomEvent('last-right-image-added');
        window.dispatchEvent(leftMapDoneEvent);
      }
    });
  }

  function mapToImageLeft() {
    // base map
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[0], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'basemap', true);
      }
    });

    // export left map
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[1], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'leftmap');
      }
    });

    // export label and state boundaries overlay
    html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[4], {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'label-boundaries-overlay1');
      }
    });

    // export label and state boundaries overlay
    const canvasLength = $('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object').length;
    if (canvasLength >= 6) {
      html2canvas($('#local-climate-map-element .esri-view-root .esri-view-surface canvas.esri-display-object')[5], {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        removeContainer: true,
        foreignObjectRendering: true,
        onrendered: function (canvas) {
          const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          addImage(imageUrl, 'left', 'label-boundaries-overlay2');
        }
      });
    }

    // export legend
    html2canvas($('.esri-expand__content .legend-image'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function () {
        const imgurl = $('.esri-expand__content .legend-image')[0].src;
        let imageExists = new Image();
        imageExists.addEventListener('load', imageFound);
        imageExists.addEventListener('error', imageNotFound);
        imageExists.src = imgurl;

        function imageFound() {
          // const imageUrl  = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
          const base64temp = getBase64Image($('.esri-expand__content .legend-image')[0])
          addImage(base64temp, 'left', 'legend');
          return true;
        }

        function imageNotFound() {
          return false;
        }
      }
    });

    // export left title
    html2canvas($('#info-text-wrapper'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'title');
      }
    });

    // export left controls
    html2canvas($('.bottom-scenario-controls .left-scenario-controls'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'bottom-controls');
      }
    });

    // export attribution
    html2canvas($('.esri-ui-inner-container.esri-ui-manual-container .esri-component.esri-attribution.esri-widget'), {
      allowTaint: true,
      useCORS: true,
      backgroundColor: null,
      removeContainer: true,
      foreignObjectRendering: true,
      onrendered: function (canvas) {
        const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        addImage(imageUrl, 'left', 'attribution');
        const leftMapDoneEvent = new CustomEvent('last-left-image-added');
        window.dispatchEvent(leftMapDoneEvent);
      }
    });
  }

  // toggle filters click
  $('#filters-toggle').click(function (e) {
    const target = $(e.target);
    if (target.hasClass('closed-filters')) {
      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-filters', 'open');
      target.removeClass('closed-filters');
    } else {
      target.addClass('closed-filters');
      // ga event action, category, label
      googleAnalyticsEvent('click', 'toggle-filters', 'closed');
    }

    const infoRowElem = $('#info-row');
    if ($(infoRowElem).hasClass('closed-filters')) {
      $(infoRowElem).removeClass('closed-filters');
    } else {
      $(infoRowElem).addClass('closed-filters');
    }

    const chartRowElem = $('#map-row');
    if ($(chartRowElem).hasClass('closed-filters')) {
      $(chartRowElem).removeClass('closed-filters');
    } else {
      $(chartRowElem).addClass('closed-filters');
    }

    setTimeout(function () {
      // reset map and chart sizes
      // filer transition means height will be updates in few seconds
      // so delaying the resize ensures proper size
      setMapSize();
    }, 600);

  })

  // enables time chart, map click events
  $('#chartmap-wrapper').click(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    if (notDisabled) {

      // toggle button visual state
      toggleButton($(target));

      // change select dropdowns for responsive mode
      setSelectFromButton(target);

      handleChartMapClick(target);
    }
  })

  // enables time chart, map click events
  $('#chartmap-wrapper').keyup(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    if (notDisabled) {
      if (e.keyCode === 13) {
        const target = $(e.target);

        // toggle button visual state
        toggleButton($(target));

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        handleChartMapClick(target);
      }
    }
  })

  // update season map
  function updateSeason(targetval) {
    if (window.scenarioComparisonMap) {
      window.scenarioComparisonMap.update({season: targetval});
    }
  }

  // enables time annual, monthly click events
  $('#time-wrapper').click(function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    // not all variables can display monthly chart
    // when the variable cannot display monthly chart do
    // do execute the click event
    if (notDisabled) {
      const val = target.attr('val')

      // toggle button visual state
      toggleButton(target);

      // change select dropdowns for responsive mode
      setSelectFromButton(target);

      // change map variable
      updateSeason(val);

      // ga event action, category, label
      googleAnalyticsEvent('click', 'update-time', val);
    }
  })

  // enables time annual, monthly click events
  $('#time-wrapper').keyup(function (e) {
    if (e.keyCode === 13) {
      const target = $(e.target);
      const notDisabled = !target.hasClass('btn-default-disabled');
      // not all variables can display monthly chart
      // when the variable cannot display monthly chart do
      // do execute the click event
      if (notDisabled) {
        const val = target.attr('val')

        // toggle button visual state
        toggleButton(target);

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        // change map variable
        updateSeason(val);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'update-time', val);
      }
    }
  })

  // in responsive mode the time is a dropdown this enables the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      // toggle button visual state
      toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

      handleChartMapClick(target);
    }
  })

  // event handler a for when map variable changes
  $('#variable-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const variable = $('#variable-select-vis').attr('rel')
      window.ce.ce('setVariablesMapState', {variable})
      // disable variables if they are valid time period
      const isvalid = jQuery.inArray(variable, validSeasonal);
      if (isvalid < 0) {
        const val = 'annual';
        window.scenarioComparisonMap.update({season: val});
        const target = $('#btn-chart.btn-annual');
        // toggle button visual state
        toggleButton(target);

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        // change map variable
        updateSeason(val);

        $('.btn-summer').addClass('btn-default-disabled');
        $('.btn-summer').addClass('disabled-seasonal');
        $('.btn-summer').removeClass('btn-default');

        $('.btn-winter').addClass('btn-default-disabled');
        $('.btn-winter').addClass('disabled-seasonal');
        $('.btn-winter').removeClass('btn-default');

        $('.btn-fall').addClass('btn-default-disabled');
        $('.btn-fall').addClass('disabled-seasonal');
        $('.btn-fall').removeClass('btn-default');


        $('.btn-spring').addClass('btn-default-disabled');
        $('.btn-spring').addClass('disabled-seasonal');
        $('.btn-spring').removeClass('btn-default');

        $('#time-select-vis').addClass('disabled');
        $('.btn-summer').addClass('disabled-seasonal');
        $('#time-select-wrapper').addClass('disabled');

      } else {

        $('.btn-summer').removeClass('btn-default-disabled');
        $('.btn-summer').removeClass('disabled-seasonal');
        $('.btn-summer').addClass('btn-default');

        $('.btn-winter').removeClass('btn-default-disabled');
        $('.btn-winter').removeClass('disabled-seasonal');
        $('.btn-winter').addClass('btn-default');

        $('.btn-fall').removeClass('btn-default-disabled');
        $('.btn-fall').removeClass('disabled-seasonal');
        $('.btn-fall').addClass('btn-default');

        $('.btn-spring').removeClass('btn-default-disabled');
        $('.btn-spring').removeClass('disabled-seasonal');
        $('.btn-spring').addClass('btn-default');

        $('#time-select-vis').removeClass('disabled');
        $('#time-select-wrapper').removeClass('disabled');

      }

      // update the text
      updateTitle($('#variable-select-vis').text());

      // change map variable
      if (window.scenarioComparisonMap) {
        window.scenarioComparisonMap.update({variable});
      }
    }
  })

  // in responsive mode, event handler a for when season (time) variable changes
  $('#time-select-vis').bind('cs-changed', function (e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if (notDisabled) {
      const val = $('#time-select-vis').attr('rel')

      // change map variable
      updateSeason(val);
    }
  })

  function isNational() {
    return (window.ce.ce('getNavFooterState')['nav'] === 'national-climate-maps')
  }

  $('#local-climate-map-element').height($('#local-climate-map-element').parent().height());
  if (typeof window.scenarioComparisonMap === 'undefined') {
    $('#local-climate-map-element').spinner();
    const variable = window.ce.ce('getVariablesPageState')['variable'] || 'tmax';
    window.scenarioComparisonMap = new ScenarioComparisonMap(document.querySelector('#local-climate-map-element'), {
      variable: 'tmax',
      season: 'annual',
      extent: mapExtent,
      center: [lon, lat],
      zoom: mapZoom,
      showCounties: true, // isNational() add isNational() if we re-institute national maps again
      layersLoaded: function layersloaded() {
        $('#local-climate-map-element').spinner('destroy');
        const rect = document.getElementById('map-wrap').getBoundingClientRect();
        document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
        document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
        enableCustomSelect('leftScenario-select');
        enableCustomSelect('rightScenario-select');

        if (variable !== undefined) {
          // const $styledSelect = $('.select.variable-select div.select-styled');
          $(`li[rel="${variable}"]`).click();
        }
      },
      // when user pans zooms initiate to check current extent
      // for alaska and islands to display no map data message...
      changeExtent: function changeExtent(event, options) {
        const messageEl = document.getElementById('map-message');
        if (messageEl) {
          if (!options.isCenterConus) {
            const selector = 'local-climate-charts';
            const nav = 'local-climate-charts';
            const selectorAddOn = '-nav-footer';

            // remove existing nav search url parameters
            // otherwise we use the first one which is most likely the wrong page
            const searchParams = removeUrlParam('nav')

            // get the invisible link just outside the element node tree
            // if inside we have issues will bubbling propagation
            const link = document.querySelector(`#${selector}-secretlink${selectorAddOn}`);

            // set the url and search params
            const url = `${$(link).attr('href')}/${searchParams}&nav=${nav}`

            // get map parent element - which provides the correct dimensions for the map
            const rect = document.getElementById('map-wrap').getBoundingClientRect();
            messageEl.style.left = `${(rect.right - rect.left) / 3}px`;
            messageEl.style.top = `-${((rect.bottom - rect.top) - 6)}px`;
            if (!isHawaii) {
              messageEl.innerHTML = `The location on the map is outside the contiguous United States. Currently, there is no climate map data available for this location. If you are looking for climate information about this location, refer to the <a class="warning-link" href="${url}">local charts</a> page.`
            } else {
              messageEl.innerHTML = `The location on the map is outside the contiguous United States. Currently, there is no climate map data available for this location.`
            }
            messageEl.classList.remove('d-none');
          } else {
            messageEl.classList.add('d-none');
          }
        }
      },

      change: function change() {
        window.scenarioComparisonMap.getShowSeasonControls() ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
      }
    });
    window.scenarioComparisonMap.getShowSeasonControls() ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
  }


  if (!isNational()) {
    window.scenarioComparisonMap.update(Object.assign({
      // When state changes, just pass the current options along directly for this page.
      // If we re-use the stationsMap widget on another page there may be more handling to do.
      change: function change(event, options) {
        const {
          variable,
          county,
          city,
          fips,
          'center': [lon, lat],
          zoom,
        } = options;
        window.ce.ce('setLocationPageState', {variable, county, city, fips, lat, lon, zoom,});
      },
    }, locationMapState));
  }

  function setMapSize() {
    $('#local-climate-map-element').height($('#local-climate-map-element').parent().height())

    const rect = document.getElementById('map-wrap').getBoundingClientRect();
    // const infoRowRect = document.getElementById('info-row').getBoundingClientRect();

    const esriViewRoot = document.querySelector('.esri-view-root');
    if (esriViewRoot) {
      esriViewRoot.style.minWidth = `${rect.width}px`;
      esriViewRoot.style.maxWidth = `${rect.width}px`;
      esriViewRoot.style.height = `${rect.height}px`;
    }

    const esriViewUserStorage = document.querySelector('.esri-view-user-storage');
    if (esriViewUserStorage) {
      esriViewUserStorage.style.minWidth = `${rect.width}px`;
      esriViewUserStorage.style.maxWidth = `${rect.width}px`;
    }

    const mapEl = document.querySelector('#local-climate-map-element');
    if (mapEl) {
      mapEl.style.minWidth = `${rect.width}px`;
      mapEl.style.maxWidth = `${rect.width}px`;
      mapEl.style.height = `${rect.height}px`;
      mapEl.style.minHeight = `${rect.height}px`;
      mapEl.style.maxHeight = `${rect.height}px`;
      mapEl.style.minWidth = `${rect.width}px`;
    }
    const mapOverlayEl = document.querySelector('.scenario-map-overlay-container');
    if (mapOverlayEl) {
      mapOverlayEl.style.top = `${rect.top}px`;
      mapOverlayEl.style.left = `${rect.left}px`;
      mapOverlayEl.style.width = `${rect.width}px`;
      mapOverlayEl.style.height = `${rect.height}px`;
      mapOverlayEl.style.minHeight = `${rect.height}px`;
      mapOverlayEl.style.maxHeight = `${rect.height}px`;
    }

    const printMapLeft = document.querySelector('#map-for-print-left');
    if (printMapLeft) {
      printMapLeft.style.top = `${rect.top}px`;
      printMapLeft.style.left = `${rect.left}px`;
      printMapLeft.style.width = `${rect.width}px`;
      printMapLeft.style.height = `${rect.height}px`;
    }
    const printMapRight = document.querySelector('#map-for-print-right');
    if (printMapRight) {
      printMapRight.style.top = `${rect.top}px`;
      printMapRight.style.left = `${rect.left}px`;
      printMapRight.style.width = `${rect.width}px`;
      printMapRight.style.height = `${rect.height}px`;
    }
  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })

  updateValidVarriable();
  window.addEventListener('location-changed', () => {
    updateValidVarriable();
  })
});
