import './main.js';
import ScenarioComparisonMap from "./scenario_comparison_map.js";
/* globals html2canvas */

$(function () {
  // get city, state from state url
  const state = window.app.state;
  const cityStateCE = state['city'];
  const countyCE = state['county'];
  let isAlaska = false;
  let isHawaii = false;

  if (cityStateCE) {
    isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
    isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  if (!cityStateCE) {
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }

  if (cityStateCE) {
    if (cityStateCE.indexOf('County') > 0) {
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }

  updateValidVariable();
  let mapExtent = state['extent'];
  let mapZoom = state['zoom'] || 9;
  let lat = state['lat'];
  let lon = state['lon'];
  let variable = state['variable'] || 'tmax';
  let city = state['city'];
  let county = state['county'];
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

  // enable custom selection boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('filter-dropdown-menu');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');

  initVariableToolTips();

  // valid seasonal variables
  // seasonal timeperiod is only valid for limited variables
  // to disable those variables from the user we use this constant
  const validSeasonal = ['tmax', 'tmin', 'pcpn'];

  // this function Updates the chart title.
  function updateTitle(chartText) {
    $('#default-chart-map-variable').html(chartText);
  }

  window.addEventListener('last-left-image-added', function (e) {
    exportLeft();
  })

  window.addEventListener('last-right-image-added', function (e) {
    exportRight();
  })

  // function to enable downloads (images and data)
  $('.download-select li a').click(function (e) {
    const downloadAction = $(this).data('value');
    $('#local-climate-map-element').spinner();

    // ga event action, category, label
    googleAnalyticsEvent('click', 'download', downloadAction);

    // capture what we are downloading
    switch (downloadAction) {
      case 'download-rightmap-image': // download image
        mapToImageRight();
        break;
      case 'download-lefttmap-image': // download image
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
    let img = document.createElement('img');
    img.src = imageUrl;
    if (cssclass) {
      img.classList.add(cssclass)
    }
    img.setAttribute('crossorigin', 'anonymous');
    document.getElementById(`map-for-print-${side}`).appendChild(img);
  }

  function getBase64Image(img) {
    let canvas = document.createElement("canvas");
    // hardcoded until there is a better way
    canvas.width = 280;
    canvas.height = 800;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    let dataURL = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    ;
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
        let a = document.createElement('a');
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
        let a = document.createElement('a');
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
      onrendered: function (canvas) {

        const imgurl = $('.esri-expand__content .legend-image')[0].src;
        let imageExists = new Image();
        imageExists.addEventListener('load', imageFound);
        imageExists.addEventListener('error', imageNotFound);
        imageExists.src = imgurl;

        function imageFound() {
          const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
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
      onrendered: function (canvas) {
        const imgurl = $('.esri-expand__content .legend-image')[0].src;
        let imageExists = new Image();
        imageExists.addEventListener('load', imageFound);
        imageExists.addEventListener('error', imageNotFound);
        imageExists.src = imgurl;

        function imageFound() {
          const imageUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
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
      // filer transition means heigh will be updates in few seconds
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

      // handleChartMapClick(target);
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

        // handleChartMapClick(target);
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

    if(!target.hasClass("btn")) {
      return;
    }

    const notDisabled = !target.hasClass('btn-default-disabled');
    // not all variables can display monthly chart
    // when the variable cannot display monthly chart do
    // do execute the click event
    if (notDisabled) {
      const val = target.data('value')

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
        const val = target.data('value')

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
      const val = $('#time-select-vis').data('value')

      // toggle button visual state
      toggleButton($(`.btn-selector[data-value="${$('#chartmap-select-vis').data('value')}"]`));

      // handleChartMapClick(target);
    }
  })

  // event handler a for when map variable changes
  $('#filter-dropdown-menu').bind('cs-changed', function (e) {

    const target = $(e.target);
    const disabled = target.hasClass('disabled');

    if (!disabled) {
      const variable = $('#filter-dropdown-menu').data('value')
      window.app.update({variable})

      // disable variables if they are valid time period
      const is_valid = jQuery.inArray(variable, validSeasonal);
      if (is_valid < 0) {

        const val = 'annual';
        window.scenarioComparisonMap.update({season: val});

        const target = $('#annual-selection');
        // toggle button visual state
        toggleButton(target);

        // change select dropdowns for responsive mode
        setSelectFromButton(target);

        // change map variable
        updateSeason(val);

        //add disabled to 'Annual, Spring, etc' buttons
        $('#time-wrapper input').addClass('disabled');
        $('#time-wrapper label').addClass('disabled');

        $('#annual-selection-label').addClass('selected-item');
        $('#annual-selection').removeClass('disabled');
        $('#annual-selection-label').removeClass('disabled');
        $('#annual-selection-label').removeClass('default-selection');

      } else {

        $('#time-wrapper input').removeClass('disabled');
        $('#time-wrapper label').removeClass('disabled');

      }

      // update the text
      updateTitle($('#filter-dropdown-menu').text());

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
      const val = $('#time-select-vis').data('value')

      // change map variable
      updateSeason(val);
    }
  })

  $('#local-climate-map-element').height($('#local-climate-map-element').parent().height());
  if (typeof window.scenarioComparisonMap === 'undefined') {
    $('#local-climate-map-element').spinner();
    const variable = state['variable'] || 'tmax';

    window.scenarioComparisonMap = new ScenarioComparisonMap(document.querySelector('#local-climate-map-element'), {
      variable: 'tmax',
      season: 'annual',
      extent: mapExtent,
      center: [lon, lat],
      zoom: mapZoom,
      showCounties: true, // isNational() add isNational() if we re-institute national maps again
      layersLoaded: function layersloaded() {
        $('#local-climate-map-element').spinner('destroy');
        // const rect = document.getElementById('map-wrap').getBoundingClientRect();
        // document.querySelector('.esri-view-root').style.minWidth = `${rect.width}px`;
        // document.querySelector('.esri-view-root').style.height = `${rect.height}px`;
        enableCustomSelect('left-scenario-dropdown-menu');
        enableCustomSelect('right-scenario-dropdown-menu');

        if (variable !== undefined) {
          const $styledSelect = $('.select.variable-select div.select-styled');
          $(`li[data-value="${variable}"]`).click();
        }
    },
      changeExtent: function changeExtent(event, options) {
        // xmin: -178.44, xmax: -13.56, ymin: 22.72, ymax: 50.93
        const messageElem = document.getElementById('map-message');
        if (messageElem) {
          if (!options.isCenterConus) {

            // get map parent element - which provides the correct dimensions for the map
            const rect = document.getElementById('map-wrap').getBoundingClientRect();

            // messageElem.style.left = `${(rect.right - rect.left)/3}px`;
            // messageElem.style.top = `-${((rect.bottom - rect.top)/2)}px`;
            messageElem.style.left = `${(rect.right - rect.left) / 3}px`;
            messageElem.style.top = `-${((rect.bottom - rect.top) - 6)}px`;
            if (!isHawaii) {
              //refer use to click chart button instead of link in message
              messageElem.innerHTML = `Mapped climate data are available for counties in the contiguous United States. For locations outside of this area, click the Graph button to view data.`
            } else {
              messageElem.innerHTML = `Mapped climate data are available for counties in the contiguous United States. For locations outside of this area, click the Graph button to view data.`
            }
            messageElem.classList.remove('d-none');
          } else {
            messageElem.classList.add('d-none');
          }
        }
      },
      change: function change() {
        window.scenarioComparisonMap.getShowSeasonControls() ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
      }
      });
    window.scenarioComparisonMap.getShowSeasonControls() ? $("#precipitation-map-season").show(200) : $("#precipitation-map-season").hide();
    }

  function setMapSize() {

    $('#map-element').css({"maxHeight": "65vh"});

    let map_element = document.getElementById("map-element");

    let climate_map_element = document.getElementById("local-climate-map-element");

    climate_map_element.style.height = (map_element.getBoundingClientRect().height / 16) + "rem";

    let climate_map_height = climate_map_element.getBoundingClientRect().height / 16;

    let bottom_controls = document.querySelector(".bottom-scenario-controls");
    bottom_controls.style.top = (climate_map_height - 6) + "rem";

    let slider = document.querySelector(".movable");
    slider.style.height = climate_map_height + "rem";

  }

  setMapSize();

  $(window).resize(function () {
    setMapSize();
  })

  updateValidVariable();
  window.addEventListener('location-changed', () => {
    updateValidVariable();
  })
});
