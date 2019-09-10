'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

$(function () {
  $('#variable-map').spinner();
});
$(document).ready(function () {
  window.scenariosMap = $('#variable-map').scenarioComparisonMap(_extends(window.ce.ce("getVariablesPageState"), {
    change: function change(event, options) {
      window.ce.ce("setVariablesMapState", options);
    },
    countyselected: function countyselected(event, value) {
      window.countySelected($('.cwg-container')[0], value);
    },
    layersloaded: function layersloaded(event, value) {
      $('#variable-map').spinner('destroy');
    }
  }));
  if (!window.scenariosMap.scenarioComparisonMap('getShowSeasonControls')) {
    $('#map-seasons-container').hide();
  }
});
$(document).ready(function () {
  'use strict';

  function updateAboutLink(title, link) {
    $('#about-variable-link').prop('href', '#detail-' + link).html('About ' + title);
  }

  $("#formmapper").formmapper({
    details: "form"
  });

  $("#formmapper").bind("geocode:result", function (event, result) {
    if (result.geometry.access_points) {
      window.scenariosMap.scenarioComparisonMap({
        extent: null,
        center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
        zoom: 8

      });
    } else {
      window.scenariosMap.scenarioComparisonMap({ extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8 });
    }
  });

  var initVariable = window.ce.ce("getVariablesPageState")['variable'] || 'tmax';
  $('#variable-options').val(initVariable).change();

  $('#map-season').val(window.ce.ce("getVariablesPageState")['season'] || 'summer').change();

  updateAboutLink($(".fs-dropdown-item[data-value=" + initVariable + "]").text(), initVariable);

  $('#variable-options-container .fs-dropdown-item').on('click', function (e) {
    var variable = $(this).data().value;
    var variableTitle = $(this).text();

    // update breadcrumb label
    $('#breadcrumb .current').html(variableTitle);
    // update about link
    updateAboutLink(variableTitle, variable.split('.')[0]);

    $(".level-1").html(variableTitle);

    window.scenariosMap.scenarioComparisonMap({ variable: variable });

    if (window.scenariosMap.scenarioComparisonMap('getShowSeasonControls')) {
      $('#map-seasons-container').show(200);
    } else {
      $('#map-seasons-container').hide();
    }
  });

  $('#map-seasons-container .fs-dropdown-item').on('click', function (e) {
    window.scenariosMap.scenarioComparisonMap({ season: $(this).data().value });
  });

  $('#variable-options').on('change', function () {
    $("#chart-name").html($('.fs-dropdown-selected').html());
  });
});