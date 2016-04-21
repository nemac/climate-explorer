var Location = function(lat, lon) {

  $('#temperature-map-season').hide();
  $('#precipitation-map-season').hide();

  this.tilesHistMapping = {
    'temperature-map': {
      'tasmax': '_hist_prism_tmax',
      'tasmin': '_hist_prism_tmin',
      'days_tmin_blw_0.0': '_annual_hist_days-tmin-blw',
      'days_tmax_abv_35.0': '_annual_hist_days-tmax-abv',
    },
    'precipitation-map': {
      'pr': '_hist_prism_pr',
    },
    'derived-map': {
      'cooling_degree_day_18.3': '_annual_hist_cooling-degree-day',
      'heating_degree_day_18.3': '_annual_hist_heating-degree-day'
    }
  };

  this.tilesMapping = {
    'temperature-map': {
      'tasmax': '_rcp45_ea_tasmax',
      'tasmin': '_rcp45_ea_tasmin',
      'days_tmin_blw_0.0': '_annual_rcp45_days-tmin-blw',
      'days_tmax_abv_35.0': '_annual_rcp45_days-tmax-abv',
    },
    'precipitation-map': {
      'pr': '_rcp45_ea_pr',
    },
    'derived-map': {
      'cooling_degree_day_18.3': '_annual_rcp45_cooling-degree-day',
      'heating_degree_day_18.3': '_annual_rcp45_heating-degree-day'
    }
  };

  this.tilesMapping85 = {
    'temperature-map': {
      'tasmax': '_rcp85_ea_tasmax',
      'tasmin': '_rcp85_ea_tasmin',
      'days_tmin_blw_0.0': '_annual_rcp85_days-tmin-blw',
      'days_tmax_abv_35.0': '_annual_rcp85_days-tmax-abv',
    },
    'precipitation-map': {
      'pr': '_rcp85_ea_pr',
    },
    'derived-map': {
      'cooling_degree_day_18.3': '_annual_rcp85_cooling-degree-day',
      'heating_degree_day_18.3': '_annual_rcp85_heating-degree-day'
    }
  };

  this.selectedVariable = {
    'temperature-map': 'tasmax',
    'precipitation-map': 'pr',
    'derived-map': 'cooling_degree_day_18.3'
  };

  this.activeYear = 2010;
  this.selectedSeason = 'summer';

  this.lat = parseFloat(lat) || 37.42;
  this.lon = parseFloat(lon) || -105.21;
  this.createMap();
  this.wire();
};




/*
* Create map
*
*
*/
Location.prototype.createMap = function() {
  var self = this;

  var view = new ol.View({
    center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: 9
  });

  this.map = new ol.Map({
    target: 'location-station-map',
    interactions: ol.interaction.defaults({mouseWheelZoom:false}),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
          attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
        })
      }),
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
          attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
        })
      })
    ],
    view: view
  });

  this.popup = new ol.Overlay.Popup();
  this.map.addOverlay(this.popup);

  self.addStations();
};



/*
* Create CHART MAPS
*
*
*/
Location.prototype.createGraphMaps = function(map) {
  var self = this;

  //var maps = ['temperature-map', 'precipitation-map', 'derived-map'];
  if ( self[ map ] ) return;

  var view = new ol.View({
    center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: 6
  });

  //$.each(maps, function(i, map) {
    self[map] = new ol.Map({
      target: map,
      interactions: ol.interaction.defaults({mouseWheelZoom:false}),
      view: view,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: 'http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
            attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
          })
        })
      ]
    });
    self.updateTiledLayer(map, true, true);

  //});

};




/*
*
* get stations and add to map
*
*/
Location.prototype.addStations = function() {
  var self = this;

  var styles = {
    'Point': new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({color: '#2980b9'}),
        stroke: new ol.style.Stroke({color: '#FFF', width: 2})
      })
    })
  };

  var styleFunction = function(feature) {
    return styles[feature.getGeometry().getType()];
  };


  $.getJSON('resources/data/wx_stations.json', function(data) {

    var featureCollection = {
      'type': 'FeatureCollection',
      'features': []
    };

    var obj;
    $.each(data, function(i, d) {
      if ( d.weight < 2 ) {
        obj = {
          'type': 'Feature',
          'properties': {
            'station': d.id,
            'name': d.name
          },
          'geometry': {
            'type': 'Point',
            'coordinates': [d.lon, d.lat]
          }
        };
        featureCollection.features.push(obj);
      }
    });

    var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
      featureProjection: 'EPSG:3857'
    });
    var vectorSource = new ol.source.Vector({
      features: features
    });
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: styleFunction
    });

    vectorLayer.set('layer_id', 'stations');
    self.map.addLayer(vectorLayer);

    //console.log('added', data);
  });

};


Location.prototype.wire = function() {
  var self = this;

  var select = new ol.interaction.Select({
    condition: ol.events.condition.click
  });

  this.map.addInteraction(select);

  select.on('select', function(e) {

    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function(feature, layer) {
      return feature;
    });

    if (feature) {
      var props = feature.getProperties();
      self.stationSelected(feature, e);
    } else {
      self.popup.hide();
    }

  });

  $('.data-accordion-tab').on('click', function(e) {
    var id = e.currentTarget.id;
    var map;

    if ( id.match('chart') ) {
      map = id.replace('-chart', '-map-container');
      $('#'+map+' .moveable').hide();
      $('#'+map+' .map-seasons-container').hide();
      $('#'+map+' .year').hide();
      return;
    } else {

      map = id.replace('-container', '');

      var h = $('#'+map).parent().height();
      $('#'+map).css({'height': h - 74 - 90 + 'px'});
      $('.moveable').css({'height': h - 74 - 90 + 40 + 'px'});

      self.createGraphMaps(map);

      setTimeout(function() {
        $('#'+id+' .year').show().css({'z-index': 200});

        map = id.replace('-chart', '-map-container');
        $('#'+map+' .map-seasons-container').show();
        $('#'+map+' .year').show();

        map = id.replace('-container', '');
        if ( self[ map ] ) self[ map ].updateSize();

      },500);
    }

    // if ( self["precipitation-map"] ) self["precipitation-map"].updateSize();
    // if ( self["derived-map"] ) self["derived-map"].updateSize();
  });


  $('#temperature-data h4').on('click', function() {
    var id = $(this).attr('id').replace('var-', '');
    self.selectedVariable['temperature-map'] = id;
    self.updateTiledLayer('temperature-map', false);
  });

  $('#precipitation-data h4').on('click', function() {
    var id = $(this).attr('id').replace('var-', '');
    self.selectedVariable['precipitation-map'] = id;
    self.updateTiledLayer('precipitation-map', false);
  });

  $('#derived-data h4').on('click', function() {
    var id = $(this).attr('id').replace('var-', '');
    self.selectedVariable['derived-map'] = id;
    self.updateTiledLayer('derived-map', false);
  });

  $('#precipitation-map-season .fs-dropdown-item').on('click', function(e) {
    self.selectedSeason =  $(this).data().value;
    self.updateTiledLayer('precipitation-map', true, false);
  });

  $('#temperature-map-season .fs-dropdown-item').on('click', function(e) {
    self.selectedSeason =  $(this).data().value;
    self.updateTiledLayer('temperature-map', true, false);
  });

};


Location.prototype.stationSelected = function(feature, event) {
  var self = this;

  if (feature) {
    var props = feature.getProperties();
    var html = '<div>Station: '+props.name+'<br /></div>' +
      '<div id="multi-chart" style="width:500px; height:300px"></div>'+
      '<div id="multi-precip-chart" style="width:500px; height:300px"></div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.chart = new ChartBuilder(props);
  } else {
    this.popup.hide();
  }

};


Location.prototype.updateTiledLayer = function(map, replace, timeReset) {
  var self = this;
  var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
  var seasons = ['tasmax', 'tasmin', 'pr'];

  var extent = ol.proj.transformExtent([-135,11.3535322866,-56.25,49.5057345956],'EPSG:4326', 'EPSG:3857');

  var hist = null;
  var season = ( seasons.indexOf(this.selectedVariable[map]) !== -1 ) ? '_'+this.selectedSeason : '';

  if ( ( this.selectedVariable[map] === 'tasmax' || this.selectedVariable[map] === 'tasmin') && map === 'temperature-map' ) {
    $('#temperature-map-season').show();
  } else if ( map === 'temperature-map' ){
    $('#temperature-map-season').hide();
  }

  if ( this.selectedVariable[map] === 'pr' && map === 'precipitation-map' ) {
    $('#precipitation-map-season').show();
  } else if ( map === 'precipitation-map' ){
    $('#precipitation-map-season').hide();
  }

  var src, src85;
  if ( histYears.indexOf(this.activeYear) !== -1 ) {
    src = this.activeYear + season + this.tilesHistMapping[map][ this.selectedVariable[map] ];
    src85 = null;
  } else {
    src = this.activeYear +  season + this.tilesMapping[map][ this.selectedVariable[map] ];
    src85 = this.activeYear + season + this.tilesMapping85[map][ this.selectedVariable[map] ];
  }

  if ( replace ) {
    if ( this[layer] ) {
      this[map].removeLayer(this.tileLayer);
      this.tileLayer = null;
    }
    if ( this[layer85] ) {
      this[map].removeLayer(this.tileLayer85);
      this.tileLayer85 = null;
    }
  }


  //rcp45 OR historical
  var layer = map + 'TileLayer';
  this[layer] = new ol.layer.Tile({
    source: new ol.source.XYZ({
      urls:[
        'http://tiles.habitatseven.work/'+src+'/{z}/{x}/{y}.png'
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
  if ( src85 ) {
    //rcp85
    layer85 = map + 'TileLayer85';
    this[layer85] = new ol.layer.Tile({
      source: new ol.source.XYZ({
        urls:[
          'http://tiles.habitatseven.work/'+src85+'/{z}/{x}/{y}.png'
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
      url: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
    })
  });

  this.nameLayer.set('layer_id', 'name_layer');
  this[map].addLayer(this.nameLayer);

  this[layer].setZIndex(0);
  if ( src85 ) { this[layer85].setZIndex(0); }
  this.nameLayer.setZIndex(6);

  if ( src85 ) {
    $( "#"+map+"SliderDiv" ).show();
    this.setSwipeMap(map);
  } else {
    $( "#"+map+"SliderDiv" ).hide();
  }

  if ( replace && timeReset ) {
    this.setSlider(map);
  }

};


Location.prototype.setSwipeMap = function(map) {
  var self = this;
  var swipeVal = null, pos, wrapper;
  var layer = map + 'TileLayer';
  var layer85 = map + 'TileLayer85';

  $( "#"+map+"SliderDiv" ).draggable({
    axis: "x",
    containment: "#"+map+"-container",
    scroll: false,
    drag: function(event,ui) {
      pos = ui.helper.offset();
      swipeVal = (pos.left - $( "#"+map+"-container" ).offset().left);
      self[layer].dispatchEvent('change');
      $(".emissions-low").fadeOut();
			$(".emissions-high").fadeOut();
      // self.map.render();
    },
    stop: function(event, ui) {
      pos = ui.helper.offset();
      swipeVal = (pos.left - $( "#"+map+"-container" ).offset().left);
      self[layer].dispatchEvent('change');
      $(".emissions-low").fadeIn();
			$(".emissions-high").fadeIn();
    }
  });

  self[layer85].on('precompose', function(event) {
    var ctx = event.context;
    var wrapper = $("#"+map+"-container").width();
    if(swipeVal === null) {
      pos = $( "#"+map+"SliderDiv" ).offset(); //ui.helper.offset();
      swipeVal = (pos.left - $( "#"+map+"-container" ).offset().left);
    }
    var screenPercent = swipeVal / wrapper;
		var width = ctx.canvas.width * screenPercent;
    ctx.save();
		ctx.beginPath();
		ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
		ctx.clip();
  });

  self[layer85].on('postcompose', function(event) {
    var ctx = event.context;
    ctx.restore();
  });
};


Location.prototype.setSlider = function(map) {
    var self = this;
    var year_slider = $('#'+map+'-time-slider');

    var tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();

    year_slider.slider({
        range: false,
        min: 1950,
        max: 2090,
        step: 10,
        value: 2010,
        slide: function (event, ui) {
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

    // $(year_slider).hover(function () {
    //   tooltip.fadeIn(200);
    // }, function () {
    //   tooltip.fadeOut(100);
    // });

};
