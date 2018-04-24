//$('#overlay-chart-container').hide();

var Location = function (lat, lon, stations_base_url, data_base_url) {

  this.stations_base_url = stations_base_url;
  this.data_base_url = data_base_url;

  $('#temperature-map-season').hide();
  $('#precipitation-map-season').hide();

  this.selectedVariable = {
    'temperature-map': 'tmax',
    'precipitation-map': 'pcpn',
    'derived-map': 'hdd_65f'
  };

  this.activeYear = 2020;
  this.selectedSeason = 'summer';

  this.lat = parseFloat(lat) || 37.42;
  this.lon = parseFloat(lon) || -105.21;
  this.createMap();
};



/*
* Creates maps used for each variable that is highlighted
* "map" is id of container
*
*/
Location.prototype.createGraphMaps = function (map) {
  var self = this;

  //var maps = ['temperature-map', 'precipitation-map', 'derived-map'];
  if (self[map]) return;

  var view = new ol.View({
    center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  });

  self[map] = new ol.Map({
    target: map,
    interactions: ol.interaction.defaults({mouseWheelZoom: false}),
    view: view,
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          attributions: [new ol.Attribution({html: ['&copy; Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ']})],
          maxZoom: 19
        })
      })
    ]
  });
  self.updateTiledLayer(map, true, true);


};


/*
*
* Wires up all the crazy interactions and UI sliders on this page
*
*/
Location.prototype.wire = function (map) {
  var self = this;


  $(document).ready(function () {
    $("#precipitation-swipeImg .emissions-low button[data-value=lower_historical]").hide();
    $("#precipitation-swipeImg .emissions-low button[data-value=higher_historical]").hide();
  });

  var select = new ol.interaction.Select({
    condition: ol.events.condition.click
  });

  this.map.addInteraction(select);

  select.on('select', function (e) {

    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
      return feature;
    });

    if (feature) {
      var props = feature.getProperties();
      self.stationSelected(feature, e);
    } else {
      $('#station-data-about').show();
      //$('#station-data-container').empty();
      //self.popup.hide();
    }

  });

  $('#precipitation-le-options').val('lower').change();

  $('.data-options-trigger').click(function (e) {
    e.preventDefault();

    $(this).siblings('.data-options').slideDown();
  });

  $('.data-accordion-tab').on('click', function (e) {
    var id = e.currentTarget.id;
    var map;

    if (id.match('chart')) {
      map = id.replace('-chart', '-map-container');
      var mapDiv = id.replace('-chart', '-map');
      $('#' + id + ' .chart').show();
      $('#' + mapDiv).hide();
      $('#' + map + ' .moveable').hide();
      $('#' + map + ' .map-seasons-container').hide();
      $('#' + map + ' .year').hide();

      self.updateSidebar(false, id);

      return;
    } else {

      $($('#precipitation-data .location-resolution a')[0]).trigger('click');
      $($('#temperature-data .location-resolution a')[0]).trigger('click');

      self.updateSidebar(true, id);

      map = id.replace('-container', '');
      $('#' + map).show();

      var h = $('#' + map).parent().height();
      //$('#'+map).css({'height': h - 74 - 90 + 'px'});
      //$('.moveable').css({'height': h - 74 - 90 + 40 + 'px'});

      self.createGraphMaps(map);

      setTimeout(function () {
        $('#' + id + ' .year').show().css({'z-index': 200});

        //id = id.replace('-chart', '-map-container');
        var c = id.replace('-map-container', '-chart');
        $('#' + c + ' .chart').hide();
        $('#' + id + ' .moveable').show();
        $('#' + id + ' .map-seasons-container').show();
        $('#' + id + ' .year').show();

        map = id.replace('-container', '');
        if (self[map]) self[map].updateSize();

      }, 200);
    }
  });

  $.fn.swap_classes = function (clicked) {

    // remove all active, accent border and accent color classes
    this.find('.active').removeClass('active');
    this.find('.accent-border').removeClass('accent-border');
    this.find('.accent-color').removeClass('accent-color');

    // set the parent li to active
    clicked.parents('li').addClass('active').addClass('accent-border');

    // set the first link under the h4 to active
    var first_li = clicked.siblings('ul').find('li').first();

    first_li.addClass('active').addClass('accent-border');
    first_li.find('a').addClass('accent-color');
  };

  $('#temperature-data h4').on('click', function (e) {
    e.preventDefault();

    $('#temperature-data .data-options').swap_classes($(this));

    var id = $(this).attr('id').replace('var-', '');
    self.selectedVariable['temperature-map'] = id;
    if (self['temperature-map']) {

      le_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
      he_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();

      self.updateTiledLayer('temperature-map', false, false, le_option_selected, he_option_selected);

    }

    var legendFilename;

    if (self.selectedVariable['temperature-map'] === 'tmax') {
      legendFilename = 'summer_tmax';
    } else if (self.selectedVariable['temperature-map'] === 'tmin') {
      legendFilename = 'summer_tmin';
    } else {
      legendFilename = self.selectedVariable['temperature-map'];
    }

    $('#temperature-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});

    $('#temperature-map-container .location-map-legend').html('<img class="legend-image" src="/resources/img/legends/' + legendFilename + '.png"></img>');


  });

  $('#precipitation-data h4').on('click', function (e) {
    e.preventDefault();

    $('#precipitation-data .data-options').swap_classes($(this));

    var id = $(this).attr('id').replace('var-', '');

    // use the same tiles as PR for days with above one inch
    //if (id === 'days_pcpn_gt_1in') {
    //    id = 'pcpn';
    //}
    self.selectedVariable['precipitation-map'] = id;
    if (self['precipitation-map']) {

      le_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
      he_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();

      if (id === 'pcpn' || id === 'days_dry_days') {
        le_option_selected = 'LOWER EMISSIONS';
        he_option_selected = 'HIGHER EMISSIONS';
        $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text(le_option_selected);
        $("#precipitation-swipeImg .emissions-low button[data-value=lower_historical]").hide();
        $("#precipitation-swipeImg .emissions-low button[data-value=higher_historical]").hide();
        $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text(he_option_selected);
        $("#precipitation-swipeImg .emissions-high button[data-value=lower_historical]").hide();
        $("#precipitation-swipeImg .emissions-high button[data-value=higher_historical]").hide();

        $('#precipitation-map-season').show();
      } else {
        $("#precipitation-swipeImg .emissions-low button[data-value=lower_historical]").show();
        $("#precipitation-swipeImg .emissions-low button[data-value=higher_historical]").show();
        $("#precipitation-swipeImg .emissions-high button[data-value=lower_historical]").show();
        $("#precipitation-swipeImg .emissions-high button[data-value=higher_historical]").show();

        $('#precipitation-map-season').hide();
      }

      self.updateTiledLayer('precipitation-map', false, false, le_option_selected, he_option_selected);

    }

    var legendFilename;
    legendFilename = self.selectedVariable['precipitation-map'];


    $('#precipitation-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});

    $('#precipitation-map-container .location-map-legend').html('<img class="legend-image" src="/resources/img/legends/' + legendFilename + '.png">');
  });

  $('#derived-data h4').on('click', function (e) {
    e.preventDefault();

    $('#derived-data .data-options').swap_classes($(this));

    var id = $(this).attr('id').replace('var-', '');
    self.selectedVariable['derived-map'] = id;
    if (self['derived-map']) {

      le_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
      he_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();

      self.updateTiledLayer('derived-map', false, false, le_option_selected, he_option_selected);

    }

    var legendFilename;
    legendFilename = self.selectedVariable['derived-map'];

    $('#derived-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});
    $('#derived-map-container .location-map-legend').html('<img class="legend-image" src="/resources/img/legends/' + legendFilename + '.png">');
  });

  $('#precipitation-map-season .fs-dropdown-item').on('click', function (e) {
    self.selectedSeason = $(this).data().value;
    left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
    right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();

    self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
  });

  $('#temperature-map-season .fs-dropdown-item').on('click', function (e) {
    self.selectedSeason = $(this).data().value;
    if (self.selectedVariable['temperature-map'] === 'tmax' || self.selectedVariable['temperature-map'] === 'tmin') {
      var legendFilename;
      legendFilename = self.selectedSeason + '_' + self.selectedVariable['temperature-map'];
      $('.location-map-legend').html('<img class="legend-image" src="/resources/img/legends/' + legendFilename + '.png">');
    }
    left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
    right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
    self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
  });

  $('#temperature-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
    left_option_selected = this.innerHTML;
    right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
    self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
  });
  $('#temperature-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
    left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
    right_option_selected = this.innerHTML;
    self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
  });


  $('#precipitation-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
    left_option_selected = this.innerHTML;
    $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text(left_option_selected);
    right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();
    self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
  });
  $('#precipitation-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
    left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
    right_option_selected = this.innerHTML;
    $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text(right_option_selected);
    self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
  });


  $('#derived-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
    left_option_selected = this.innerHTML;
    right_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();
    self.updateTiledLayer('derived-map', true, false, left_option_selected, right_option_selected);
  });
  $('#derived-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
    left_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
    right_option_selected = this.innerHTML;
    self.updateTiledLayer('derived-map', true, false, left_option_selected, right_option_selected);
  });


};


Location.prototype.updateSidebar = function (disable, id) {
  id = id.split('-')[0] + '-data';
  if (disable) {
    $('#' + id + ' .seasonal-monthly').addClass('disabled');
  } else {
    $('#' + id + ' .seasonal-monthly').removeClass('disabled');
  }
};


/*
*
* Creates tiled layers, both 45 and 85
* map id required
* replace / time reset tells us what sort of update this is – new layer or otherwise
*
*/

Location.prototype.updateTiledLayer = function (map, replace, timeReset, left_option_selected, right_option_selected) {


  if (map === 'temperature-map') {
    if (!left_option_selected) {
      left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
    }
    if (!right_option_selected) {
      right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
    }
  }

  if (map === 'precipitation-map') {
    if (!left_option_selected) {
      left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
    }
    if (!right_option_selected) {
      right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();
    }
  }

  if (map === 'derived-map') {
    if (!left_option_selected) {
      left_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
    }
    if (!right_option_selected) {
      right_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();
    }
  }

  console.log(map, replace, timeReset, left_option_selected, right_option_selected);

  if (replace && timeReset) {
    this.setSlider(map);
  }

  var self = this;
  var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
  var seasons = ['tmax', 'tmin', 'pcpn'];

  var extent = ol.proj.transformExtent([-135, 11.3535322866, -56.25, 49.5057345956], 'EPSG:4326', 'EPSG:3857');

  var hist = null;
  var season = (seasons.indexOf(this.selectedVariable[map]) !== -1) ? '-' + this.selectedSeason : '';

  if ((this.selectedVariable[map] === 'tmax' || this.selectedVariable[map] === 'tmin') && map === 'temperature-map') {
    $('#temperature-map-season').show();
  } else if (map === 'temperature-map') {
    $('#temperature-map-season').hide();
  }

  if (this.selectedVariable[map] === 'pcpn' && map === 'precipitation-map') {
    $('#precipitation-map-season').show();
  } else if (map === 'precipitation-map') {
    $('#precipitation-map-season').hide();
  }

  var layer_left, layer_right;
  //
  // if (histYears.indexOf(this.activeYear) !== -1) {
  //
  //     layer_left = this.activeYear + season + this.tilesHistMapping[map][this.selectedVariable[map]];
  //     layer_right = null;
  // } else {


  if (left_option_selected === 'lower_historical' || left_option_selected === 'HISTORICAL') {
    layer_left = 'avg' + season + this.tilesHistMapping[map][this.selectedVariable[map]];
  } else {
    layer_left = this.activeYear + season + this.tilesMapping[map][this.selectedVariable[map]];
  }


  if (right_option_selected === 'higher_historical' || right_option_selected === 'HISTORICAL') {
    layer_right = 'avg' + season + this.tilesHistMapping[map][this.selectedVariable[map]];
  } else {
    layer_right = this.activeYear + season + this.tilesMapping85[map][this.selectedVariable[map]];
  }

  console.log('LAYER LEFT');
  console.log(layer_left);
  console.log('LAYER RIGHT');
  console.log(layer_right);

  if (replace) {
    this.removeOldTiles(map);
  }

  //rcp45 OR historical
  var layer = map + 'TileLayer';
  this[layer] = new ol.layer.Tile({
    source: new ol.source.XYZ({
      urls: [
        'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_left + '/{z}/{x}/{-y}.png'
      ],
      extent: extent,
      minZoom: 0,
      maxZoom: 5,
      tilePixelRatio: 1
    })
  });

  this[layer].set('layer_id', 'tile_layer');
  this[map].addLayer(this[layer]);

  var layer85;
  if (layer_right) {
    //rcp85
    layer85 = map + 'TileLayer85';
    this[layer85] = new ol.layer.Tile({
      source: new ol.source.XYZ({
        urls: [
          'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_right + '/{z}/{x}/{-y}.png'
        ],
        extent: extent,
        minZoom: 0,
        maxZoom: 5,
        tilePixelRatio: 1
      })
    });

    this[layer85].set('layer_id', 'tile_layer');
    this[map].addLayer(this[layer85]);
  }

  this.nameLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      attributions: [new ol.Attribution({html: ['']})],
      maxZoom: 19
    })
  });

  this.nameLayer.set('layer_id', 'name_layer');
  this[map].addLayer(this.nameLayer);

  this[layer].setZIndex(1);
  if (layer_right) {
    this[layer85].setZIndex(1);
  }
  this.nameLayer.setZIndex(10);


  if (replace && timeReset) {


    $("#" + map + "SliderDiv").draggable({
      axis: "x",
      containment: "#" + map + "-container",
      scroll: false,

      drag: function (event, ui) {
        var pos, swipeVal;
        pos = ui.helper.offset();
        swipeVal = (pos.left - $("#" + map + "-container").offset().left);
        self[layer].dispatchEvent('change');
        $(".emissions-low").fadeOut();
        $(".emissions-high").fadeOut();
        // self.map.render();
      },
      stop: function (event, ui) {
        pos = ui.helper.offset();
        swipeVal = (pos.left - $("#" + map + "-container").offset().left);
        self[layer].dispatchEvent('change');
        $(".emissions-low").fadeIn();
        $(".emissions-high").fadeIn();
      }
    });

    this[layer85].on('precompose', function (event) {
      var ctx = event.context;
      var wrapper = $("#" + map + "-container").width();
      var pos = $("#" + map + "SliderDiv").offset(); //ui.helper.offset();
      var swipeVal = (pos.left - $("#" + map + "-container").offset().left);
      var screenPercent = swipeVal / wrapper;
      var width = ctx.canvas.width * screenPercent;
      ctx.save();
      ctx.beginPath();
      ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      ctx.clip();
    });


    this[layer85].on('postcompose', function (event) {
      var ctx = event.context;
      ctx.restore();
    });

  }

  // if (layer_right) {
  //     $("#" + map + "SliderDiv").show();
  this.setSwipeMap(map);
  // } else {
  //     $("#" + map + "SliderDiv").hide();
  // }


};


/*
* Removes old climate tiles from map
* Timeout means new tiles will load before we remove old, so there isn't a
* flash of map with no tiles at all
*
*/
Location.prototype.removeOldTiles = function (map) {
  var self = this;

  this.oldTile = this[map + 'TileLayer'];
  this.oldTile85 = this[map + 'tileLayer85'];

  setTimeout(function () {
    if (self.oldTile) {
      self.map.removeLayer(self.oldTile);
      self.oldTile = null;
    }
    if (self.oldTile85) {
      self.map.removeLayer(self.oldTile85);
      self.oldTile85 = null;
    }
  }, 900);
};


/*
*
* Map swiper logic!
* Map ( id ) required, to assign swiper and eventing to correct map
*
*/


Location.prototype.setSlider = function (map) {
  var self = this;
  var year_slider = $('#' + map + '-time-slider');

  var tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();

  year_slider.slider({
    range: false,
    min: 1950,
    max: 2090,
    step: 10,
    value: 2020,
    slide: function (event, ui) {
      if (self.selectedVariable[map] !== 'tmax' && self.selectedVariable[map] !== 'tmin' && self.selectedVariable[map] !== 'pcpn') {
        if (ui.value === 2000) {
          return false;
        }
      }
      tooltip.text(ui.value);
      tooltip.fadeIn(200);
    },
    change: function (event, ui) {
      year_slider.attr('data-value', ui.value);
    },
    stop: function (event, ui) {
      year_slider.attr('data-value', ui.value);
      self.activeYear = ui.value;

      self.updateTiledLayer(map, true, false);
      tooltip.fadeOut(200);
    }
  }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);
  tooltip.fadeIn(200);
};

Location.prototype.setSwipeMap = function (map) {


  var self = this;
  var swipeVal = null, pos, wrapper;
  var layer = map + 'TileLayer';
  var layer85 = map + 'TileLayer85';

  $("#" + map + "SliderDiv").draggable({
    axis: "x",
    containment: "#" + map + "-container",
    scroll: false,

    drag: function (event, ui) {
      var pos, swipeVal;
      pos = ui.helper.offset();
      swipeVal = (pos.left - $("#" + map + "-container").offset().left);
      self[layer].dispatchEvent('change');
      $(".emissions-low").fadeOut();
      $(".emissions-high").fadeOut();
      // self.map.render();
    },
    stop: function (event, ui) {
      pos = ui.helper.offset();
      swipeVal = (pos.left - $("#" + map + "-container").offset().left);
      self[layer].dispatchEvent('change');
      $(".emissions-low").fadeIn();
      $(".emissions-high").fadeIn();
    }
  });

  self[layer85].on('precompose', function (event) {
    var ctx = event.context;
    var wrapper = $("#" + map + "-container").width();
    var pos = $("#" + map + "SliderDiv").offset(); //ui.helper.offset();
    var swipeVal = (pos.left - $("#" + map + "-container").offset().left);
    var screenPercent = swipeVal / wrapper;
    var width = ctx.canvas.width * screenPercent;
    ctx.save();
    ctx.beginPath();
    ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
    ctx.clip();
  });

  self[layer85].on('postcompose', function (event) {
    var ctx = event.context;
    ctx.restore();
  });


};


/*
*
* Handles logic for the time sliders
* Map ( id )  required to assign slider to correct map
*
*/


var cwg = null;
var precipChart = null;
var derivedChart = null;

function populate_variables(frequency) {
  var variables = climate_widget.variables(frequency);
  $("select#variable").empty();
  $(variables.map(function (v) {
    return ('<option value="' + v.id + '"' + '>' + v.title + '</option>');
  }).join("")).appendTo($("select#variable"));
}

populate_variables('annual');

function update_frequency_ui() {
  var freq = $('#frequency').val();
  if (freq === "annual") {
    $('#timeperiod').attr("disabled", "true");
    $('label[for=timeperiod]').css("opacity", 0.5);
    $('#presentation').removeAttr("disabled");
    $('label[for=presentation]').css("opacity", 1.0);
    $('#slider-range').show();
    $('#x-axis-pan-note').hide();
  }
  if (freq === "monthly") {
    $('#timeperiod').removeAttr("disabled");
    $('label[for=timeperiod]').css("opacity", 1.0);
    $('#presentation').attr("disabled", "true");
    $('label[for=presentation]').css("opacity", 0.5);
    //$('#slider-range').hide();
    $('#x-axis-pan-note').show();
  }
  if (freq === "seasonal") {
    $('#timeperiod').removeAttr("disabled");
    $('label[for=timeperiod]').css("opacity", 1.0);
    $('#presentation').attr("disabled", "true");
    $('label[for=presentation]').css("opacity", 0.5);
    //$('#slider-range').hide();
    $('#x-axis-pan-note').show();
  }
  //populate_variables(freq);
}

update_frequency_ui();

$('#frequency').change(function () {
  update_frequency_ui();
  var id = $('#frequency').val();
  if (id !== 'annual') {
    $('#historical-range, #under-baseline-range, #over-baseline-range').hide();
    $('#temperature-chart .legend-item-line.observed').addClass('seasonal');
    if (!$('#historical-obs').hasClass('selected')) {
      $('#historical-obs').trigger('click');
    }
    if (!$('#precip-historical-obs').hasClass('selected')) {
      $('#precip-historical-obs').trigger('click');
    }
  } else {
    $('#historical-range, #under-baseline-range, #over-baseline-range').show();
    $('#temperature-chart .legend-item-line.observed').removeClass('seasonal');
  }

  if (id !== 'annual') {
    $("#slider-range").addClass('not-annual').slider('destroy').slider({
      range: false,
      min: 0,
      max: 2,
      value: 0,
      slide: function (event, ui) {
        val = (ui.value === 0) ? '2025' : '2050';
        if (ui.value === 2) {
          val = '2075';
        }
        cwg.update({timeperiod: val});
      }
    });
    $('#temp-range-low').html('30 Years Centered in 2025');
    $('#temp-range-mid').show().html('30 Years Centered in 2050');
    $('#temp-range-high').html('30 Years Centered in 2075');
  } else {
    sliderisnotannual = $("#slider-range").hasClass("not-annual");
    if (sliderisnotannual) {
      $("#slider-range").removeClass('not-annual').slider('destroy').slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [1950, 2099],
        slide: function (event, ui) {
          return cwg.setXRange(ui.values[0], ui.values[1]);
        }
      }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
    }

    $('#temp-range-low').html('1950');
    $('#temp-range-mid').hide();
    $('#temp-range-high').html('2100');
  }

  cwg.update({
    frequency: $('#frequency').val(),
    variable: $('#variable').val()
  });
});

$('#precip-frequency').change(function () {
  update_frequency_ui();
  var id = $('#precip-frequency').val();
  if (id !== 'annual') {
    $('#precip-historical-range, #under-baseline-range, #over-baseline-range').hide();
    $('#precipitation-chart .legend-item-line.observed').addClass('seasonal');
  } else {
    $('#precip-historical-range, #under-baseline-range, #over-baseline-range').show();
    $('#precipitation-chart .legend-item-line.observed').removeClass('seasonal');
  }

  if (id !== 'annual') {
    $("#precip-slider-range").addClass('not-annual').slider('destroy').slider({
      range: false,
      min: 0,
      max: 2,
      value: 0,
      slide: function (event, ui) {
        val = (ui.value === 0) ? '2025' : '2050';
        if (ui.value === 2) {
          val = '2075';
        }
        precipChart.update({timeperiod: val});
      }
    });
    $('#precip-range-low').html('30 Years Centered in 2025');
    $('#precip-range-mid').show().html('30 Years Centered in 2050');
    $('#precip-range-high').html('30 Years Centered in 2075');
  } else {
    psliderisnotannual = $("#precip-slider-range").hasClass("not-annual");
    if (psliderisnotannual) {

      $("#precip-slider-range").removeClass('not-annual').slider('destroy').slider({
        range: true,
        min: 1950,
        max: 2099,
        values: [1950, 2099],
        slide: function (event, ui) {
          return precipChart.setXRange(ui.values[0], ui.values[1]);
        }
      }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
    }
    $('#precip-range-low').html('1950');
    $('#precip-range-mid').hide();
    $('#precip-range-high').html('2100');
  }

  precipChart.update({
    frequency: $('#precip-frequency').val(),
    variable: $('#precip-variable').val()
  });
});

$('#timeperiod').change(function () {
  cwg.update({
    timeperiod: $('#timeperiod').val()
  });
});
$('#county').change(function () {
  cwg.update({
    fips: $('#county').val()
  });
});
$('#variable').change(function () {
  cwg.update({
    variable: $('#variable').val()
  });
});
$('#precip-variable').change(function () {
  console.log("PRECIP CHANGE");
  console.log($('#precip-variable').val());
  precipChart.update({
    variable: $('#precip-variable').val()
  });
});
$('#derived-variable').change(function () {
  derivedChart.update({
    variable: $('#derived-variable').val()
  });
});
$('#scenario').change(function () {
  cwg.update({
    scenario: $('#scenario').val()
  });
});
$('#precip-scenario').change(function () {
  precipChart.update({
    scenario: $('#precip-scenario').val()
  });
});
$('#derived-scenario').change(function () {
  derivedChart.update({
    scenario: $('#derived-scenario').val()
  });
});
$('#presentation').change(function () {
  cwg.update({
    presentation: $('#presentation').val()
  });
});
$('#precip-presentation').change(function () {
  precipChart.update({
    presentation: $('#precip-presentation').val()
  });
});
$('#derived-presentation').change(function () {
  derivedChart.update({
    presentation: $('#derived-presentation').val()
  });
});

$('#median').change(function () {
  cwg.update({
    pmedian: $('#median').val()
  });
});
$('#precip-median').change(function () {
  precipChart.update({
    pmedian: $('#precip-median').val()
  });
});
$('#derived-median').change(function () {
  derivedChart.update({
    pmedian: $('#derived-median').val()
  });
});
$('#hist-mod').change(function () {
  cwg.update({
    histmod: $('#hist-mod').val()
  });
});
$('#precip-hist-mod').change(function () {
  precipChart.update({
    histmod: $('#precip-hist-mod').val()
  });
});
$('#derived-hist-mod').change(function () {
  derivedChart.update({
    histmod: $('#derived-hist-mod').val()
  });
});
$('#hist-obs').change(function () {
  cwg.update({
    histobs: $('#hist-obs').val()
  });
});
$('#precip-hist-obs').change(function () {
  precipChart.update({
    histobs: $('#precip-hist-obs').val()
  });
});
$('#derived-hist-obs').change(function () {
  derivedChart.update({
    histobs: $('#derived-hist-obs').val()
  });
});
$('#range').change(function () {
  cwg.update({
    hrange: $('#range').val(),
    prange: $('#range').val()
  });
});
$('#temperature-data .location-resolution a').on('click', function (e) {
  if ($(this).parent().hasClass('disabled')) {
    return;
  }
  var val = $(this).html().toLowerCase();
  $('#frequency').val(val).change();
});
$('#precipitation-data .location-resolution a').on('click', function (e) {
  if ($(this).parent().hasClass('disabled')) {
    return;
  }
  var val = $(this).html().toLowerCase();
  $('#precip-frequency').val(val).change();
});
$('#temperature-data h4').on('click', function () {
  // removed - duplicate click functions in location.js
  //$('ul.data-options li').removeClass('active accent-border');
  //$(this).closest('li').addClass('active accent-border');

  var val = $(this).children('a');


  $('#temp-chart-name').html(val[0].text);
  $('#temp-map-name').html(val[0].text);

  var id = $(this).attr('id').replace('var-', '');
  $('#frequency').val('annual').change();
  $('#variable').val(id).change();
});
$('#precipitation-data h4').on('click', function () {
  // removed - duplicate click functions in location.js
  //$('ul.data-options li').removeClass('active accent-border');
  //$(this).closest('li').addClass('active accent-border');

  var val = $(this).children('a');


  $('#precip-chart-name').html(val[0].text);
  $('#precip-map-name').html(val[0].text);

  var id = $(this).attr('id').replace('var-', '');
  $('#precip-frequency').val('annual').change();
  $('#precip-variable').val(id).change();
});
$('#derived-data h4').on('click', function () {
  // removed - duplicate click functions in location.js
  //$('ul.data-options li').removeClass('active accent-border');
  //$(this).closest('li').addClass('active accent-border');

  var val = $(this).children('a');


  $('#derived-chart-name').html(val[0].text);
  $('#derived-map-name').html(val[0].text);

  var id = $(this).attr('id').replace('var-', '');
  $('#derived-frequency').val('annual').change();
  $('#derived-variable').val(id).change();
});
$('#temperature-presentation').on('change', function () {
  var val = $(this).val();
  $('#presentation').val(val).change();
});
$('#precipitation-presentation').on('change', function () {
  var val = $(this).val();
  $('#precip-presentation').val(val).change();
});
$('#der-presentation').on('change', function () {
  var val = $(this).val();
  $('#derived-presentation').val(val).change();
});
$('.legend-item-range').on('click', function (e) {
  $(this).toggleClass('selected');
  $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');
  $(this).children('.legend-item-line-container').children('.legend-item-line').toggleClass('selected');

  var pre = $(this).closest('.chart-legend').attr('id');
  if (!pre) {
    pre = '';
  } else {
    pre = pre.replace('-chart', '');
  }

  var scenario = null;
  switch (true) {
    case $('#' + pre + 'rcp85-block').hasClass('selected') && $('#' + pre + 'rcp45-block').hasClass('selected'):
      scenario = 'both';
      break;
    case $('#' + pre + 'rcp45-block').hasClass('selected'):
      scenario = 'rcp45';
      break;
    case $('#' + pre + 'rcp85-block').hasClass('selected'):
      scenario = 'rcp85';
      break;
    default:
      scenario = '';
  }
  if (pre === 'precip') {
    $('#precip-scenario').val(scenario).change();
  } else if (pre === 'derive') {
    $('#derived-scenario').val(scenario).change();
  } else {
    $('#scenario').val(scenario).change();
  }


  var median = null;
  switch (true) {
    case $('#' + pre + 'rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
      median = 'true';
      break;
    case $('#' + pre + 'rcp45-line').hasClass('selected'):
      median = 'true';
      break;
    case $('#' + pre + 'rcp85-line').hasClass('selected'):
      median = 'true';
      break;
    default:
      median = 'false';
  }

  if (pre === 'precip') {
    $('#precip-median').val(median).change();
  } else if (pre === 'derive') {
    $('#derived-median').val(median).change();
  } else {
    $('#median').val(median).change();
  }


  var histmod = null;
  switch (true) {
    case $('#' + pre + 'historical-block').hasClass('selected') && $('#historical-block').hasClass('selected'):
      histmod = 'true';
      break;
    case $('#' + pre + 'historical-block').hasClass('selected'):
      histmod = 'true';
      break;
    default:
      histmod = 'false';
  }

  if (pre === 'precip') {
    $('#precip-hist-mod').val(histmod).change();
  } else if (pre === 'derive') {
    $('#derived-hist-mod').val(histmod).change();
  } else {
    $('#hist-mod').val(histmod).change();
  }


  var histobs = null;
  switch (true) {
    case $('#' + pre + 'over-baseline-block').hasClass('selected') && $('#under-baseline-block').hasClass('selected'):
      histobs = 'true';
      break;
    case $('#' + pre + 'over-baseline-block').hasClass('selected'):
      histobs = 'true';
      break;
    case $('#' + pre + 'under-baseline-block').hasClass('selected'):
      histobs = 'true';
      break;
    default:
      histobs = 'false';
  }

  if (pre === 'precip') {
    $('#precip-hist-obs').val(histobs).change();
  } else if (pre === 'derive') {
    $('#derived-hist-obs').val(histobs).change();
  } else {
    $('#hist-obs').val(histobs).change();
  }

});
$('#temp-download-image').on('click', function (e) {
  $('#download-image-link-temp').get(0).click();
  return false;
});
$('#download-image-precip').on('click', function (e) {
  $('#download-image-link-precip').get(0).click();
  return false;
});
$('#download-image-derived').on('click', function (e) {
  $('#download-image-link-derived').get(0).click();
  return false;
});
$('#temp-download-data').click(function (e) {

  console.log('.download-data clicked');
  $('#download-panel').removeClass("hidden");

  $('#download-panel').show();
  $('#download-panel').fadeIn(250);

});


$('#precip-download-data').click(function (e) {

  precipChart.update({
    variable: $('#precip-variable').val()
  });
  $('#download-precip-panel').removeClass("hidden");
  $('#download-precip-panel').show();
  $('#download-precip-panel').fadeIn(250);

});

$('#derived-download-data').click(function (e) {

  $('#download-derived-panel').removeClass("hidden");
  $('#download-derived-panel').show();
  $('#download-derived-panel').fadeIn(250);

});

$('#download-dismiss-button').click(function () {
  $('#download-panel').fadeOut(250);
});


$('#download-precip-dismiss-button').click(function () {
  $('#download-precip-panel').fadeOut(250);
});


$('#download-derived-dismiss-button').click(function () {
  $('#download-derived-panel').fadeOut(250);
});

$('#download-image-link-temp').click(function () {
  cwg.download_image(this, 'graph.png');
});
$('#download-image-link-precip').click(function () {
  precipChart.download_image(this, 'graph.png');
});
$('#download-image-link-derived').click(function () {
  derivedChart.download_image(this, 'graph.png');
});
$("#slider-range").slider({
  range: true,
  min: 1950,
  max: 2099,
  values: [1950, 2099],
  slide: function (event, ui) {
    // return the return value returned by setXRange, to keep
    // the slider thumb(s) from moving into a disallowed range
    return cwg.setXRange(ui.values[0], ui.values[1]);
  }
});
$("#precip-slider-range").slider({
  range: true,
  min: 1950,
  max: 2099,
  values: [1950, 2099],
  slide: function (event, ui) {
    // return the return value returned by setXRange, to keep
    // the slider thumb(s) from moving into a disallowed range
    return precipChart.setXRange(ui.values[0], ui.values[1]);
  }
});
$("#derived-slider-range").slider({
  range: true,
  min: 1950,
  max: 2099,
  values: [1950, 2099],
  slide: function (event, ui) {
    // return the return value returned by setXRange, to keep
    // the slider thumb(s) from moving into a disallowed range
    return derivedChart.setXRange(ui.values[0], ui.values[1]);
  }
});
$('#download_hist_obs_data').click(function () {
  if (cwg) {
    cwg.download_hist_obs_data(this)
  }
});

$('#download_hist_mod_data').click(function () {
  if (cwg) {
    cwg.download_hist_mod_data(this)
  }
});
$('#download_proj_mod_data').click(function () {
  if (cwg) {
    cwg.download_proj_mod_data(this)
  }
});


$('#download_precip_hist_obs_data').click(function () {
  if (precipChart) {
    precipChart.download_hist_obs_data(this)
  }
});


$('#download_precip_hist_mod_data').click(function () {
  if (precipChart) {
    precipChart.download_hist_mod_data(this)
  }
});
$('#download_precip_proj_mod_data').click(function () {
  if (precipChart) {
    precipChart.download_proj_mod_data(this)
  }
});


$('#download_derived_hist_mod_data').click(function () {
  if (derivedChart) {
    derivedChart.download_hist_obs_data(this)
  }
});


$('#download_derived_hist_mod_data').click(function () {
  if (derivedChart) {
    derivedChart.download_hist_mod_data(this)
  }
});
$('#download_derived_proj_mod_data').click(function () {
  if (derivedChart) {
    derivedChart.download_proj_mod_data(this)
  }
});

// This function will be called whenever the user changes the x-scale in the graph.
function xrangeset(min, max) {
  // Force the slider thumbs to adjust to the appropriate place

  $("#slider-range").slider("option", "values", [min, max]);
}

function dxrangeset(min, max) {
  $("#derived-slider-range").slider("option", "values", [min, max]);
}

function pxrangeset(min, max) {
  $("#precip-slider-range").slider("option", "values", [min, max]);
}


cwg = climate_widget.graph({
  'div': "div#chart-123",
  'dataprefix': '/climate-explorer2-data/data',
  'font': 'Roboto',
  'responsive': true,
  'frequency': $('#frequency').val(),
  'timeperiod': $('#timeperiod').val(),
  'county': $('#county').val(),
  'variable': $('#variable').val(),
  'scenario': $('#scenario').val(),
  'presentation': $('#presentation').val(),
  'pmedian': $('#median').val(),
  'histobs': $('#hist-obs').val(),
  'xrangefunc': xrangeset
});

precipChart = climate_widget.graph({
  'div': "#chart-234",
  'dataprefix': '/climate-explorer2-data/data',
  'font': 'Roboto',
  'responsive': true,
  'frequency': $('#precip-frequency').val(),
  'timeperiod': $('#precip-timeperiod').val(),
  'county': $('#precip-county').val(),
  'variable': $('#precip-variable').val(),
  'scenario': $('#precip-scenario').val(),
  'presentation': $('#precip-presentation').val(),
  'pmedian': $('#precip-median').val(),
  'histobs': $('#precip-hist-obs').val(),
  'xrangefunc': pxrangeset
});

derivedChart = climate_widget.graph({
  'div': "#chart-345",
  'dataprefix': '/climate-explorer2-data/data',
  'font': 'Roboto',
  'responsive': true,
  'frequency': $('#derived-frequency').val(),
  'timeperiod': $('#derived-timeperiod').val(),
  'county': $('#derived-county').val(),
  'variable': $('#derived-variable').val(),
  'scenario': $('#derived-scenario').val(),
  'presentation': $('#derived-presentation').val(),
  'pmedian': $('#derived-median').val(),
  'histobs': $('#derived-hist-obs').val(),
  'xrangefunc': dxrangeset
});

setTimeout(function () {
  cwg.resize();
  precipChart.resize();
  derivedChart.resize();
}, 700);

$(window).resize(function () {
  cwg.resize();
});
$(window).resize(function () {
  precipChart.resize();
});
$(window).resize(function () {
  derivedChart.resize();
});


