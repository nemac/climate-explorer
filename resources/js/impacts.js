var Impacts = function(page) {
  this.page = page;
  this.subLayers = {};
  this.createMap();
};




/*
* Creates map
*
*
*/
Impacts.prototype.createMap = function() {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  this.visibleLayers = ( qs.layers ) ? qs.layers.split(',') : null;
  this.group = ( qs.group ) ? qs.group : '';

  var zoom = ( this.page === 'drought' ) ? 4 : 5;
  zoom = ( qs.zoom ) ? qs.zoom : zoom;

  var view;

  var center = ( qs.center ) ? qs.center.split(',') : null;
  if ( this.page === 'arctic' && !center ) {
    view = new ol.View({
      center: ol.proj.transform([-160.41, 60.75], 'EPSG:4326', 'EPSG:3857'),
      zoom: 4
    });
  } else {
    view = new ol.View({
      center: center || ol.proj.transform([-105.41, 35.42], 'EPSG:4326', 'EPSG:3857'),
      zoom: zoom
    });
  }

  this.map = new ol.Map({
    target: 'map',
    layers: [
      // new ol.layer.Tile({
      //   source: new ol.source.MapQuest({layer: 'osm'})
      // })
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'http://habitatseven.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
          attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
        })
      }),
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'http://habitatseven.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
          attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
        })
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
Impacts.prototype.getData = function() {
  var self = this;

  $.getJSON('./resources/data/data-grouped.json', function(data) {
    self.data = data;

    //self.createJsonLayer('weather_stations');
    self.addLayers();
    self.createLegend();
    self.wireEvents();
    self.wireSearch();
  });

};




Impacts.prototype.wireSearch = function() {
  var self = this;

  $("#formmapper").formmapper({
      details: "form"
  });

  $("#formmapper").bind("geocode:result", function(event, result){
    var lat, lon;
    if ( result.geometry.access_points ) {
      lat = result.geometry.access_points[0].location.lat;
      lon = result.geometry.access_points[0].location.lng;
    } else {
      lat = result.geometry.location.lat();
      lon = result.geometry.location.lng();
    }

    var conv = ol.proj.transform([lon, lat], 'EPSG:4326','EPSG:3857');
    var xy = self.map.getPixelFromCoordinate(conv);

    self.map.getView().setZoom(8);
    self.map.getView().setCenter(conv);

  });
};


/*
* Now that we are building legend dynamically needed to pull in some
* of the events from global_functions to handle events
* after legend is rendered
*
*/
Impacts.prototype.wireEvents = function() {
  var self = this;

  $('.layer-toggle').on('click', function() {
    self.visibleLayers = [];

    var visible;
    if ( $(this).hasClass('icon-view-on') ) {
      visible = false;
      $(this).removeClass('icon-view-on').addClass('icon-view-off');
    } else {
      visible = true;
      $(this).removeClass('icon-view-off').addClass('icon-view-on');
    }

    var id = $(this).closest('.legend').attr('id').replace('legend-', '');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == id) {
        layer.setVisible(visible);
        self.updateUrl();
      }
    });

  });

  this.map.getView().on('change:resolution', function(){
    var zoom = self.map.getView().getZoom();
    $('.page-type-case .zoom-slider').slider('value', zoom);
  });


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
    value: 1,
    slide: function (event, ui) {
      var id = $(this).attr('id').replace('opacity-', '');
      var visible = ( ui.value > 0 ) ? true : false;

      self.map.getLayers().forEach(function(layer) {
        if (layer.get('layer_id') == id) {
          layer.setVisible(visible);
          layer.setOpacity(ui.value);
          self.updateUrl();
        }
      });

    }
  });
  //$('.opacity-slider').first().slider('value', 1);


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
Impacts.prototype.wireMapEvents = function () {
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
      var html = '<div>'+props.name+'<br /></div>' +
        '<div id="multi-chart" style="width:500px; height:300px"></div>'+
        '<div id="multi-precip-chart" style="width:500px; height:300px"></div>';
      popup.show(evt.coordinate, html);

      self.chart = new ChartBuilder(props);
    } else {
      popup.hide();
    }
  });

  this.map.on('moveend', function() {
    self.updateUrl();
  });
};




/*
* Build legend based on supplied JSON
*
*/
Impacts.prototype.createLegend = function() {
  var self = this;
  var layerIds = this.data.topics[this.page].groups[this.group].layers;

  var checked, sublayer, display;

  $.each(layerIds, function(i, id) {
    checked = (i === 0) ? 'checked' : '';
    sublayer = self.data.layers[id].sublayers;

    var icon_class;
    if ( self.visibleLayers ) {
      if ( self.visibleLayers.indexOf(id) !== -1 ) {
        icon_class = "icon-view-on";
      } else {
        icon_class = "icon-view-off";
      }
    } else {
      icon_class = (i === 0) ? 'icon-view-on' : 'icon-view-off';
    }

    var tmpl = '<li class="legend" id="legend-'+id+'">' +
      '<div class="text">'+self.data.layers[id].title+'</div>' +
      '<div class="icons">' +
      '<span class="icon layer-order icon-arrow-up-down"></span>' +
      '<span class="icon layer-toggle ' + icon_class + '"></span>' +
      '<a href="#info-'+id+'" class="help icon icon-help"></a>' +
      '</div>';

      //'<input class="visibility" id="visibility-'+id+'" type="checkbox" '+checked+'/>' +

        if ( sublayer ) {
          tmpl += '<div class="sublayer-slider"></div>'+
            '<div class="sublayer-range-values" id="range-'+id+'"></div>';
        }
      tmpl += '<div id="info-'+id+'" class="layer-info">'+
        '<h3>'+self.data.layers[id].title+'</h3>'+
        '<div class="opacity-slider-wrap"><h4>Layer opacity</h4><div class="opacity-slider" id="opacity-'+id+'"></div></div>' +

        '<div class="info-accordion">'+
          '<h4>Layer description</h4>'+
          '<div>'+
            '<p>'+self.data.layers[id].description+'</p>'+
          '</div>'+

          '<h4>Legend</h4>'+
          '<div>'+
            '<img src="resources/img/legend_dummy.png">'+
          '</div>'+
        '</div>'+

        '<div class="actions">'+
          '<a href="#" class="layer-info-close"><span class="icon icon-close"></span>Close</a>'+
          '<a href="#" class="layer-info-next"><span class="icon icon-arrow-right"></span>Next</a>'+
        '</div>'+
      '</div>'+
    '</li>';

    $('#case-menu').append(tmpl);

    $('#case-menu').find('.layer-info').find('.info-accordion').accordion({
      header: 'h4',
      heightStyle: 'content',
      collapsible: true,
      icons: {
        "header": "icon-arrow-right",
        "activeHeader": "icon-arrow-down"
      }
    });

    if ( sublayer ) {
      self.subLayers[id] = self.data.layers[id].sublayers;
      self.subLayerSlider(id, checked);
    }
  });

};



Impacts.prototype.subLayerSlider = function(id, show) {
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


Impacts.prototype.parseQueryString = function(qstr) {
  var query = {};
  var a = qstr.substr(1).split('&');
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
};



Impacts.prototype.updateUrl = function() {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  qs.zoom = this.map.getView().getZoom();
  qs.center = this.map.getView().getCenter().toString();

  var layers = [];
  this.map.getLayers().forEach(function(l) {
    if ( l.getVisible() && l.get('layer_id') !== undefined ) { layers.push(l.get('layer_id')); }
  });

  if ( !layers.length ) { layers = this.visibleLayers; }

  if ( layers ) {
    qs.layers = layers.toString();
  } else {
    qs.layers = '';
  }

  var str = $.param( qs );

  history.pushState(null, "", 'case.php?'+str);
};



/*
* Sets zoom on map
* Triggered from custom zoom control in global_functions.js
*
*/
Impacts.prototype.setZoom = function(zoom) {
  this.map.getView().setZoom(zoom);
  this.updateUrl();
};




/*
* changes layer order
* Triggered from drag and drop legend handler in global_functions.js
*
*/
Impacts.prototype.reorderLayers = function() {
  var self = this;
  var layer;
  var ids = $('.legend').map(function() { return this.id; }).get().slice(0);
  $.each(ids.reverse(), function(i, id) {
    id = id.replace('legend-', '');
    self.map.getLayers().forEach(function(l) {
      if ( l.get('layer_id') ) {
        if (l.get('layer_id') == id) {
          l.setZIndex(i);
        } else if ( l.get('layer_id').match(id) ) {
          l.setZIndex(i);
        }
      }
    });
  });
};





/*
* add layers to map!
*
*/
Impacts.prototype.addLayers = function() {
  var self = this;

  var layerIds = this.data.topics[this.page].groups[this.group].layers;
  var clone = layerIds.slice(0);

  var layer;
  $.each(clone.reverse(), function(i, id) {
    layer = null;

    //add layer with sublayers
    //i.e. sea level rise layers 1ft - 6ft
    if ( self.data.layers[id].sublayers ) {
      $.each(self.data.layers[id].sublayers, function(e, sublayer) {
        layer = new ol.layer.Tile({
          extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
          source: new ol.source.TileArcGISRest({
            url: sublayer.url,
            params: {
              'LAYERS': sublayer.options.layer || ''
            }
          })
        });


        if ( !self.visibleLayers ) {
          if ( i === clone.length - 1 && e === 0 ) {
            layer.setVisible(true);
          } else {
            layer.setVisible(false);
          }
        } else {
          if ( self.visibleLayers.indexOf(sublayer.id) !== -1 ) {
            layer.setVisible(true);
          } else {
            layer.setVisible(false);
          }
        }

        layer.set('layer_id', sublayer.id);
        self.map.addLayer(layer);

      });
    } else {
      if ( self.data.layers[id].type === 'WMS' ) {
        layer = new ol.layer.Image({
          extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
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
          extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
          source: new ol.source.TileArcGISRest({
            url: self.data.layers[id].url,
            params: {
              'LAYERS': self.data.layers[id].options.layer || ''
            }
          })
        });
      }

      if ( self.data.layers[id].type === 'Tile' ) {
        layer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            urls:[
              self.data.layers[id].url
            ],
            extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
            minZoom: 0,
            maxZoom: 5,
            tilePixelRatio: 1
          })
        });
      }

      if ( layer ) {

        if ( !self.visibleLayers ) {
          if ( i === clone.length - 1 ) {
            layer.setVisible(true);
          } else {
            layer.setVisible(false);
          }
        } else {
          if ( self.visibleLayers.indexOf(id) !== -1 ) {
            layer.setVisible(true);
          } else {
            layer.setVisible(false);
          }
        }

        layer.set('layer_id', id);
        self.map.addLayer(layer);
      }
    }

    if ( self.data.layers[id].type === 'JSON' ) {
      self.createJsonLayer(id, function(featureCollection) {
        if ( !self.visibleLayers ) {
          if ( i === clone.length - 1 ) {
            featureCollection.setVisible(true);
          } else {
            featureCollection.setVisible(false);
          }
        } else {
          if ( self.visibleLayers.indexOf(id) !== -1 ) {
            featureCollection.setVisible(true);
          } else {
            featureCollection.setVisible(false);
          }
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
Impacts.prototype.createJsonLayer = function(id, callback) {
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
