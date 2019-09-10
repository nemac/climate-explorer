'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

$(function () {
  function updateAboutLink(title, link) {
    $('#about-stations-link').prop('href', '#detail-' + link).html('About ' + title);
  }

  var stationsMapState = window.ce.ce("getStationsMapState");
  if (stationsMapState.mode) {
    $("#stations-options").val(stationsMapState.mode).change();
    $("option[value=" + stationsMapState.mode + "]").attr("selected", "selected");
    updateAboutLink($(".fs-dropdown-item[data-value=" + stationsMapState.mode + "]").text(), stationsMapState.mode);
  }
  window.stations = $('#stations-map').stationsMap(_extends({
    // When state changes, just pass the current options along directly for this page.
    // If we re-use the stationsMap widget on another page there may be more handling to do.
    change: function change(event, options) {
      window.ce.ce('setStationsMapState', options);
    }
  }, stationsMapState));

  var initFormMapper = function initFormMapper() {
    $("#formmapper").formmapper({
      details: "form"
    });

    $("#formmapper").bind("geocode:result", function (event, result) {
      if (result.geometry.access_points) {
        window.stations.stationsMap({
          extent: null,
          center: [result.geometry.access_points[0].location.lat, result.geometry.access_points[0].location.lng],
          zoom: 8
        });
      } else {
        window.stations.stationsMap({ extent: null, center: [result.geometry.location.lat(), result.geometry.location.lng()], zoom: 8 });
      }
    });
  };
  var whenFormMapper = function whenFormMapper() {
    if (window.google !== undefined) {
      initFormMapper();
    } else {
      setTimeout(whenFormMapper);
    }
  };
  whenFormMapper();

  $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
    window.stations.stationsMap({ mode: $(this).data().value });
    // update about link
    updateAboutLink($(this).text(), $(this).data().value);

    $('#breadcrumb .current').html($(this).text());
  });

  $('#stations-options').on('change', function () {
    $("#chart-name").html($('.fs-dropdown-selected').html());
  });
});