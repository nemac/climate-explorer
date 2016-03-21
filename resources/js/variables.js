var Variables = function(page) {
  // this.page = page;
  // this.subLayers = {};
  this.selectedVariable = 'tasmax';
  this.createMap();
};




/*
* Create map
*
*
*/
Variables.prototype.createMap = function() {
  var view = new ol.View({
    center: ol.proj.transform([-105.41, 35.42], 'EPSG:4326', 'EPSG:3857'),
    zoom: 5
  });

  this.map = new ol.Map({
    target: 'variable-map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'osm'})
      })
    ],
    view: view
  });

  this.popup = new ol.Overlay.Popup();
  this.map.addOverlay(this.popup);

  //add layers to map and wire events
  this.addCounties();
  this.addStates();
  this.addStations();
  this.wire();
};




/*
* Wire map and UI events
*
*
*/
Variables.prototype.wire = function() {
  var self = this;

  //layer show / hide handlers
  $('#counties-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'counties') {
        layer.setVisible(show);
      }
    });
  });


  $('#weather-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'stations') {
        layer.setVisible(show);
      }
    });
  });

  //var selector
  $('.fs-dropdown-item').on('click', function(e) {
    self.selectedVariable =  $(this).data().value;
    self.updateChart();
  });

  //map click selector
  var select = new ol.interaction.Select({
    layers: function(layer) {
      if ( layer.get('layer_id') === 'states' ) {
        return false;
      } else {
        return true;
      }
    },
    condition: ol.events.condition.click
  });

  this.map.addInteraction(select);
  select.on('select', function(e) {
    
    var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function(feature, layer) {
      var id = layer.get('layer_id');
      if ( id === 'states' ) {
        return null;
      } else {
        return feature;
      }
    });

    if (feature) {
      var props = feature.getProperties();
      if ( props.station ) {
        self.stationSelected(feature, e);
      } else {
        self.countySelected(feature, e);
      }
    } else {
      self.popup.hide();
    }

  });
};




/*
*
* get counties geojson and add to map
*
*/
Variables.prototype.addCounties = function() {

  var self = this;
  var style = function(feature, resolution) {

    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)'
      }),
      stroke: new ol.style.Stroke({
        color: '#2980b9',
        width: 0.5
      })
    })];

  };

  this.vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/counties-20m.json',
       format: new ol.format.GeoJSON()
    }),
    style: style
  });

  this.vectorLayer.set('layer_id', 'counties');
  self.map.addLayer(this.vectorLayer);

};



/*
*
* get states geojson and add to map
*
*/
Variables.prototype.addStates = function() {

  var self = this;

  var style = function(feature, resolution) {

    return [new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 0)'
      }),
      stroke: new ol.style.Stroke({
        color: '#2980b9',
        width: 2
      })
    })];

  };

  this.vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/states.json',
       format: new ol.format.GeoJSON()
    }),
    style: style
  });

  this.vectorLayer.set('layer_id', 'states');
  self.map.addLayer(this.vectorLayer);

};




/*
*
* get counties geojson and add to map
*
*/
Variables.prototype.addStations = function() {

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
    vectorLayer.setVisible(false);
    self.map.addLayer(vectorLayer);

  });

};





/*
* Highlight county feature
*
*/
Variables.prototype.countySelected = function(feature, event) {

  if (feature) {
    var props = feature.getProperties();
    console.log('props: ', props);
    var fips = props.STATE + props.COUNTY;
    var html = '<div>'+props.NAME+' County</div>' +
      '<div id="climate-chart" style="width:500px; height:300px"></div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.cwg = climate_widget.graph({
      div        : "div#climate-chart",
      dataprefix : "http://climateexplorer.habitatseven.work/data",
      font       : "Roboto",
      frequency  : "annual",
      fips       : fips,
      variable   : this.selectedVariable,
      scenario   : "rcp85"
    });

  } else {
    this.cwg = null;
    this.popup.hide();
  }
};




Variables.prototype.stationSelected = function(feature, event) {
  console.log('station selected!');
  var self = this;

  if (feature) {
    var props = feature.getProperties();
    console.log('props', props);
    var html = '<div>Station: '+props.name+'<br /></div>' +
      '<div id="multi-chart" style="width:500px; height:300px"></div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.chart = new ChartBuilder(props);
  } else {
    this.popup.hide();
  }

};



/*
* Update the chart!
*
*/
Variables.prototype.updateChart = function() {

  if ( this.cwg ) {
    this.cwg.update({
      variable : this.selectedVariable
    });
  }

};
