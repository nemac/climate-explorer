var App = function(page) {

  this.page = page;
  this.subLayers = {};
  this.createMap();
};




/*
* Creates map
*
*
*/
App.prototype.createMap = function() {
  var zoom = ( this.page === 'drought' ) ? 4 : 5;
  var view = new ol.View({
    center: ol.proj.transform([-105.41, 35.42], 'EPSG:4326', 'EPSG:3857'),
    zoom: zoom
  });

  this.map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'osm'})
      })
    ],
    view: view
  });
  this.getData();
  this.wireMapEvents();
};


/*
* Get data for page
*
*/
App.prototype.getData = function() {
  var self = this;

  $.getJSON('./resources/data/data.json', function(data) {
    self.data = data;
    //self.createJsonLayer('weather_stations');
    self.addLayers();
    self.createLegend();
    self.wireEvents();
  });

};



/*
* Now that we are building legend dynamically needed to pull in some
* of the events from global_functions to handle events
* after legend is rendered
*
*/
App.prototype.wireEvents = function() {
  var self = this;

  //close btn
  $('.legend .layer-info-close').click(function (e) {
    e.preventDefault();
    $('body').close_layer_info();
  });

  // next btn
  $('.legend .layer-info-next').click(function (e) {
    e.preventDefault();
    $(this).parents('.legend').next('.legend').open_layer_info();
  });

  // help icon
  $('.legend .help').click(function (e) {
    e.preventDefault();
    var current_legend = $(this).parents('.legend');
    if (current_legend.hasClass('info-on')) {
      $('body').close_layer_info();
    } else {
      current_legend.open_layer_info();
    }
  });


  $('.opacity-slider').slider({
    range: false,
    min: 0,
    max: 1,
    step: 0.05,
    slide: function (event, ui) {
      var id = $(this).attr('id').replace('opacity-', '');
      var visible = ( ui.value > 0 ) ? true : false;

      self.map.getLayers().forEach(function(layer) {
        if (layer.get('layer_id') == id) {
          layer.setVisible(visible);
          layer.setOpacity(ui.value);
        }
      });

    }
  });
  $('.opacity-slider').first().slider('value', 1);


  // help icon
  $('.legend .visibility').click(function (e) {
    var id = $(this).attr('id').replace('visibility-', '');
    var visible = $(this).is(':checked');
    var subs = self.subLayers[id];
    if ( subs ) {
      $.each(subs, function(i, sub) {
        self.map.getLayers().forEach(function(layer) {
          if (layer.get('layer_id') == sub.id) {
            layer.setVisible(visible);
          }
        });
      });
    } else {
      self.map.getLayers().forEach(function(layer) {
        if (layer.get('layer_id') == id) {
          layer.setVisible(visible);
        }
      });
    }
  });

};


/*
*
* Handles map events
*
*/
App.prototype.wireMapEvents = function () {
  var self = this;
  var popup = new ol.Overlay.Popup();
  this.map.addOverlay(popup);

  this.map.on('click', function(evt) {
    var feature = self.map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
        return feature;
      }
    );

    if (feature) {
      var props = feature.getProperties();
      var html = '<div>'+props.name+'<br />'+props.station+'</div>' +
        '<div id="multi-chart" style="width:500px; height:300px"></div>';
      popup.show(evt.coordinate, html);

      self.chart = new ChartBuilder(props);
    } else {
      popup.hide();
    }
  });
};




/*
* Build legend based on supplied JSON
*
*/
App.prototype.createLegend = function() {
  var self = this;
  var layerIds = this.data.cases[this.page].layers;

  var checked, sublayer, display;
  $.each(layerIds, function(i, id) {
    checked = (i === 0) ? 'checked' : '';
    sublayer = self.data.layers[id].sublayers;

    var tmpl = '<li class="legend" id="legend-'+id+'">' +
      '<span class="icon icon-arrow-up-down"></span>' +
      '<a href="#info-'+id+'" class="help icon icon-help"></a>' +
      //'<input class="visibility" id="visibility-'+id+'" type="checkbox" '+checked+'/>' +
      '<div class="text">'+self.data.layers[id].title+'</div>';
        if ( sublayer ) {
          tmpl += '<div class="sublayer-slider"></div>'+
            '<div class="sublayer-range-values" id="range-'+id+'"></div>';
        }
      tmpl += '<div id="info-'+id+'" class="layer-info">'+
        '<h3>'+self.data.layers[id].title+'</h3>'+
        '<div class="opacity-slider-wrap"><h4>Layer opacity</h4><div class="opacity-slider" id="opacity-'+id+'"></div></div>' +
        '<p>'+self.data.layers[id].description+'</p>'+
        '<div class="actions">'+
          '<a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>'+
          '<a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>'+
        '</div>'+
      '</div>'+
    '</li>';

    $('#case-menu').append(tmpl);

    if ( sublayer ) {
      self.subLayers[id] = self.data.layers[id].sublayers;
      self.subLayerSlider(id, checked);
    }
  });

};



App.prototype.subLayerSlider = function(id, show) {
  var self = this;

  $('#range-'+id).html('Showing from 1 to 1 '+self.data.layers[id].defaults.units);

  $('.sublayer-slider').attr('id', id).slider({
    id: id,
    orientation: "horizontal",
    range: false,
    min: 1,
    max: self.subLayers[id].length,
    value: 1,
    slide: function( event, ui ) {
      var subs = self.subLayers[event.target.id];
      var max = ui.value;
      var visible = false;
      $('#range-'+event.target.id).html('Showing from 1 to '+max+' '+self.data.layers[event.target.id].defaults.units);
      $.each(subs, function(i, sub) {
        visible = ( i + 1 <= max ) ? true : false;
        self.map.getLayers().forEach(function(layer) {
          if (layer.get('layer_id') == sub.id) {
            layer.setVisible(visible);
          }
        });
      });
    }
  });

};




/*
* Sets zoom on map
* Triggered from custom zoom control in global_functions.js
*
*/
App.prototype.setZoom = function(zoom) {
  this.map.getView().setZoom(zoom);
};




/*
* changes layer order
* Triggered from drag and drop legend handler in global_functions.js
*
*/
App.prototype.reorderLayers = function() {
  var self = this;
  var layer;
  var ids = $('.legend').map(function() { return this.id; }).get().slice(0);
  $.each(ids.reverse(), function(i, id) {
    id = id.replace('legend-', '');
    self.map.getLayers().forEach(function(l) {
      if (l.get('layer_id') == id) {
        layer = l;
        layer.setZIndex(i);
      }
    });
  });
};





/*
* add layers to map!
*
*/
App.prototype.addLayers = function() {
  var self = this;

  var layerIds = this.data.cases[this.page].layers;
  var clone = layerIds.slice(0);

  var layer;
  $.each(clone.reverse(), function(i, id) {
    layer = null;

    //add layer with sublayers
    //i.e. sea level rise layers 1ft - 6ft
    if ( self.data.layers[id].sublayers ) {
      $.each(self.data.layers[id].sublayers, function(e, sublayer) {
        layer = new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileArcGISRest({
            url: sublayer.url,
            params: {
              'LAYERS': sublayer.options.layer || ''
            }
          })
        });

        if ( i === clone.length - 1 && e === 0 ) {
          layer.setVisible(true);
        } else {
          layer.setVisible(false);
        }

        layer.set('layer_id', sublayer.id);
        self.map.addLayer(layer);

      });
    } else {
      if ( self.data.layers[id].type === 'WMS' ) {
        layer = new ol.layer.Image({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.ImageWMS({
            url: self.data.layers[id].url,
            params: {
              'LAYERS': self.data.layers[id].options.layer,
              'VERSION': self.data.layers[id].options.version || '1.3.0'
            },
            serverType: self.data.layers[id].options.type
          })
        });
      }

      if ( self.data.layers[id].type === 'tileWMS' ) {
        layer = new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileWMS({
            url: self.data.layers[id].url,
            params: {
              'LAYERS': self.data.layers[id].options.layer,
              'VERSION': self.data.layers[id].options.version || '1.3.0'
            },
            serverType: self.data.layers[id].options.type
          })
        });
      }

      if ( self.data.layers[id].type === 'ArcGISRest' ) {
        layer = new ol.layer.Tile({
          extent: [-13884991, 2870341, -7455066, 6338219],
          source: new ol.source.TileArcGISRest({
            url: self.data.layers[id].url,
            params: {
              'LAYERS': self.data.layers[id].options.layer || ''
            }
          })
        });
      }

      if ( layer ) {
        if ( i === clone.length - 1 ) {
          layer.setVisible(true);
        } else {
          layer.setVisible(false);
        }

        layer.set('layer_id', id);
        self.map.addLayer(layer);
      }
    }

    if ( self.data.layers[id].type === 'JSON' ) {
      self.createJsonLayer(id, function(featureCollection) {
        if ( i === clone.length - 1 ) {
          featureCollection.setVisible(true);
        } else {
          featureCollection.setVisible(false);
        }

        featureCollection.set('layer_id', id);
        self.map.addLayer(featureCollection);
      });
    }

  });

};



/*
*
* creates geojson layer from JSON source
* currently used only for weather stations dataset
*
*/
App.prototype.createJsonLayer = function(id, callback) {
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

    callback(vectorLayer);

  });
};
