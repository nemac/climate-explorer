var Location = function(lat, lon) {
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
