var Location = function(lat, lon) {

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
  this.createGraphMaps();
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
Location.prototype.createGraphMaps = function() {
  var self = this;

  var maps = ['temperature-map', 'precipitation-map', 'derived-map'];

  var view = new ol.View({
    center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
    zoom: 9
  });

  $.each(maps, function(i, map) {
    self[map] = new ol.Map({
      target: map,
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
    self.updateTiledLayer(map, false);

  });

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

  $('.data-accordion-tab').on('click', function() {
    self["temperature-map"].updateSize();
    self["precipitation-map"].updateSize();
    self["derived-map"].updateSize();
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


Location.prototype.updateTiledLayer = function(map, replace) {
  var self = this;
  var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
  var seasons = ['tasmax', 'tasmin', 'pr'];

  var extent = ol.proj.transformExtent([-135,11.3535322866,-56.25,49.5057345956],'EPSG:4326', 'EPSG:3857');

  var hist = null;
  var season = ( seasons.indexOf(this.selectedVariable) !== -1 ) ? '_'+this.selectedSeason : '';

  var src, src85;
  if ( histYears.indexOf(this.activeYear) !== -1 ) {
    src = this.activeYear + season + this.tilesHistMapping[map][ this.selectedVariable[map] ];
    src85 = null;
  } else {
    src = this.activeYear +  season + this.tilesMapping[map][ this.selectedVariable[map] ];
    src85 = this.activeYear + season + this.tilesMapping85[map][ this.selectedVariable[map] ];
  }

  if ( replace ) {
    if ( this.tileLayer ) {
      this[map].removeLayer(this.tileLayer);
      this.tileLayer = null;
    }
    if ( this.tileLayer85 ) {
      this[map].removeLayer(this.tileLayer85);
      this.tileLayer85 = null;
    }
  }


  //rcp45 OR historical
  this.tileLayer = new ol.layer.Tile({
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

  this.tileLayer.set('layer_id', 'tile_layer');
  this[map].addLayer(this.tileLayer);

  if ( src85 ) {
    //rcp85
    this.tileLayer85 = new ol.layer.Tile({
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

    this.tileLayer85.set('layer_id', 'tile_layer');
    this[map].addLayer(this.tileLayer85);
  }

  this.nameLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
    })
  });

  this.nameLayer.set('layer_id', 'name_layer');
  this[map].addLayer(this.nameLayer);

  this.tileLayer.setZIndex(0);
  if ( src85 ) { this.tileLayer85.setZIndex(0); }
  this.nameLayer.setZIndex(6);

  // if ( src85 ) {
  //   $( "#sliderDiv" ).show();
  //   this.setSwipeMap();
  // } else {
  //   $( "#sliderDiv" ).hide();
  // }
  //
  // if ( replace ) {
  //   this.setSlider();
  // }

};
