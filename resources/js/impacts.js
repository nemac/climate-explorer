var Impacts = function(page) {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  this.activeYear = qs.active_year || 2010;
  this.page = page;
  this.subLayers = {};
  this.mapVariables();
  this.createMap();
};



/*
* Lots of inconsistencies in naming, so here I map all the variables to one another
*
*/
Impacts.prototype.mapVariables = function() {
  this.varMapping = {
    'mean_daily_max': 'Mean Daily Maximum Temperature',
    'mean_daily_min': 'Mean Daily Minimum Temperature',
    'days_tmin_blw_0.0': 'Days With Minimum Below 32F&deg; F',
    'days_tmax_abv_35.0': 'Days With Minimum Below 95&deg; F',
    'pr': 'Mean Daily Precipitation',
    'pr_above': 'Days of Precipitation Above 1 Inch',
    'cooling_degree_day_18.3': 'Cooling Degree Days',
    'heating_degree_day_18.3': 'Heating Degree Days'
  };

  this.tilesHistMapping = {
    'mean_daily_max': '_hist_prism_tmax',
    'mean_daily_min': '_hist_prism_tmin',
    'days_tmin_blw_0.0': '_annual_hist_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_hist_days-tmax-abv',
    'pr': '_hist_prism_pr',
    'cooling_degree_day_18.3': '_annual_hist_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_hist_heating-degree-day'
  };

  this.tilesMapping = {
    'mean_daily_max': '_summer_rcp45_ea_tasmax',
    'mean_daily_min': '_summer_rcp45_ea_tasmin',
    'days_tmin_blw_0.0': '_annual_rcp45_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_rcp45_days-tmax-abv',
    'pr': '_rcp45_ea_pr',
    'cooling_degree_day_18.3': '_annual_rcp45_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_rcp45_heating-degree-day'
  };

  this.tilesMapping85 = {
    'mean_daily_max': '_summer_rcp85_ea_tasmax',
    'mean_daily_min': '_summer_rcp85_ea_tasmin',
    'days_tmin_blw_0.0': '_annual_rcp85_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_rcp85_days-tmax-abv',
    'pr': '_rcp85_ea_pr',
    'cooling_degree_day_18.3': '_annual_rcp85_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_rcp85_heating-degree-day'
  };
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
      })
      // new ol.layer.Tile({
      //   source: new ol.source.XYZ({
      //     url: 'http://habitatseven.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      //     attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
      //   })
      // })
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
      var layer_id = layer.get('layer_id');
      var id_val, val;
      if (layer.get('layer_id') == id) {
        layer.setVisible(visible);
        self.updateUrl();
      } else if ( id === 'cooling_degree_day_18' || id === 'heating_degree_day_18' || id === 'mean_daily_min' || id === 'mean_daily_max' || id === 'days_tmin_blw_0' || id === 'days_tmax_abv_35') {
        if ( self.tileLayer ) {
          self.tileLayer.setVisible(visible); }
        if ( self.tileLayer85 ) { self.tileLayer85.setVisible(visible); }
        self.updateUrl();
      } else if ( id === 'sea_level_rise' && layer_id && layer_id.match('sea_level_rise')) {
        id_val = parseInt(layer_id.split('_')[3]);
        val = $('.sublayer-slider').slider('value');
        if ( id_val <= val ) {
          layer.setVisible(visible);
          self.updateUrl();
        }
      } else if ( id === 'storm_surge' && layer_id && layer_id.match('storm_surge')) {
        id_val = parseInt(layer_id.split('_')[2]);
        val = $('.sublayer-slider').slider('value');
        if ( id_val <= val ) {
          layer.setVisible(visible);
          self.updateUrl();
        }
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
    min: 0.1,
    max: 1,
    step: 0.05,
    value: 1,
    slide: function (event, ui) {
      var id = $(this).attr('id').replace('opacity-', '');
      //var visible = ( ui.value > 0 ) ? true : false;

      self.map.getLayers().forEach(function(layer) {
        var layer_id = layer.get('layer_id');
        if (layer.get('layer_id') == id) {
          //layer.setVisible(visible);
          layer.setOpacity(ui.value);
          //self.updateUrl();
        } else if ( id === 'sea_level_rise' && layer_id && layer_id.match('sea_level_rise')) {
          layer.setOpacity(ui.value);
        } else if ( id === 'storm_surge' && layer_id && layer_id.match('storm_surge')) {
          layer.setOpacity(ui.value);
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
  var layerIds = ( this.group === 'all' ) ? this.getLayerIds() : this.data.topics[this.page].groups[this.group].layers;

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
      if ( id === 'sea_level_rise' || id === 'storm_surge' ) {
        $.each(self.visibleLayers, function(e, vis) {
          if ( id === 'sea_level_rise' && vis.match('sea_level_rise')) {
            icon_class = "icon-view-on";
          } else if ( id === 'storm_surge' && vis.match('storm_surge')) {
            icon_class = "icon-view-on";
          }
        });
      }
    } else {
      icon_class = 'icon-view-on';
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
          tmpl += '<div class="sublayer-slider" id="slider-'+id+'"></div>'+
            '<div class="sublayer-range-values" id="range-'+id+'"></div>';
        }
      tmpl += '<div id="info-'+id+'" class="layer-info">'+
        '<h3>'+self.data.layers[id].title+'</h3>'+

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
        '<div class="opacity-slider-wrap"><h4>Layer opacity</h4><div class="opacity-slider" id="opacity-'+id+'"></div></div>' +

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
  var val = 0;
  if ( this.visibleLayers ) {
    $.each(this.visibleLayers, function(i, layer) {
      if ( layer.match(id) ) {
        val++;
      }
    });
  }
  if ( val < 1 ) val = 1;

  $('#range-'+id).html('Showing from 1 to '+ val + ' ' +self.data.layers[id].defaults.units);

  $('.sublayer-slider#slider-'+id).attr('id', id).slider({
    id: id,
    orientation: "horizontal",
    range: false,
    min: 1,
    max: self.subLayers[id].length,
    value: val,
    slide: function( event, ui ) {
      var subs = self.subLayers[event.target.id];
      var max = ui.value;
      var visible = false;
      $('#range-'+event.target.id).html('Showing from 1 to '+max+' '+self.data.layers[event.target.id].defaults.units);
      $.each(subs, function(i, sub) {
        visible = ( i + 1 <= max ) ? true : false;
        self.map.getLayers().forEach(function(layer) {
          if ( $('#legend-'+id+' .layer-toggle').hasClass('icon-view-on') ) {
            if (layer.get('layer_id') == sub.id) {
              layer.setVisible(visible);
            }
            self.updateUrl();
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

  if ( this.activeYear ) {
    qs.active_year = this.activeYear;
  }

  var str = $.param( qs );

  history.replaceState(null, "", 'case.php?'+str);
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



Impacts.prototype.getLayerIds = function() {
  var layerIds = [];

  $.each(this.data.topics[this.page].groups, function(i, group) {
    layerIds = layerIds.concat(group.layers);
  });

  layerIds = _.remove(layerIds, function(n) {
    if ( n !== 'cooling_degree_day_18' && n !== 'heating_degree_day_18' && n !== 'mean_daily_min' && n !== 'mean_daily_max' && n !== 'days_tmin_blw_0' && n !== 'days_tmax_abv_35') {
      return n;
    }
  });

  return _.uniq(layerIds);
}




/*
* add layers to map!
*
*/
Impacts.prototype.addLayers = function() {
  var self = this;

  var layerIds = ( this.group === 'all' ) ? this.getLayerIds() : this.data.topics[this.page].groups[this.group].layers;
  var clone = layerIds.slice(0);

  var layer;
  $.each(clone.reverse(), function(i, id) {
    layer = null;

    var n = self.data.layers[id].id;
    if ( n !== 'cooling_degree_day_18.3' && n !== 'heating_degree_day_18.3' && n !== 'mean_daily_min' && n !== 'mean_daily_max' && n !== 'days_tmin_blw_0.0' && n !== 'days_tmax_abv_35.0') {
      //add layer with sublayers
      //i.e. sea level rise layers 1ft - 6ft
      if ( self.data.layers[id].sublayers ) {
        $.each(self.data.layers[id].sublayers, function(e, sublayer) {

          if ( self.data.layers[id].type === 'StormSurge' ) {
            var resolutions = [19567.87924099992, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.992452562495, 611.4962262813797, 305.74811314055756, 152.87405657041106, 76.43702828507324, 38.21851414253662];

            var tilegrid = new ol.tilegrid.TileGrid({
                resolutions: resolutions,
                origin: [-2.0037508342787E7, 2.0037508342787E7]
            })
            layer = new ol.layer.Tile({
              extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
              source: new ol.source.XYZ({
                  url: sublayer.url,
                  projection: 'EPSG:102100',
                  tileGrid: tilegrid
              })
            });
          } else {
            layer = new ol.layer.Tile({
              extent: [-32629438.63437604, -2729719.1541202106, 1966571.863721013, 14705261.249615353],
              source: new ol.source.TileArcGISRest({
                url: sublayer.url,
                params: {
                  'LAYERS': sublayer.options.layer || ''
                }
              })
            });
          }


          if ( self.visibleLayers ) {
            if ( self.visibleLayers.indexOf(sublayer.id) !== -1 ) {
              layer.setVisible(true);
            } else {
              layer.setVisible(false);
            }
          } else if (e === 0){
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
          //var pr = proj4('EPSG:4326', [-13884991, 2870341, -7455066, 6338219]);
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

        if ( self.data.layers[id].type === 'StormSurge' ) {
          var resolutions = [19567.87924099992, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.992452562495, 611.4962262813797, 305.74811314055756, 152.87405657041106, 76.43702828507324, 38.21851414253662];

          var tilegrid = new ol.tilegrid.TileGrid({
              resolutions: resolutions,
              origin: [-2.0037508342787E7, 2.0037508342787E7]
          })
          layer = new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: self.data.layers[id].url,
                projection: 'EPSG:102100',
                tileGrid: tilegrid
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

          if ( self.visibleLayers ) {
            if ( self.visibleLayers.indexOf(id) !== -1 ) {
              layer.setVisible(true);
            } else {
              layer.setVisible(false);
            }
          } else if ( self.group === 'all' ) {
            if ( i === clone.length - 1 ) {
              self.visibleLayers = [id];
              layer.setVisible(true);
            } else {
              layer.setVisible(false);
            }
          }

          layer.set('layer_id', id);
          self.map.addLayer(layer);
        }
      }
    } else {
      self.addClimateLayer(true, self.data.layers[id]);
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




Impacts.prototype.addClimateLayer = function(replace, layer, preserveTime) {
  var self = this;

  this.selectedVariable = layer.id;

  var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
  var seasons = ['mean_daily_min', 'mean_daily_max', 'pr'];

  var extent = ol.proj.transformExtent([-135,11.3535322866,-56.25,49.5057345956],'EPSG:4326', 'EPSG:3857');

  var hist = null;
  //var season = '_summer';
  var season = ( seasons.indexOf(this.selectedVariable) !== -1 ) ? '_summer' : '';

  var src, src85;
  if ( histYears.indexOf(parseFloat(this.activeYear)) !== -1 ) {
    src = this.activeYear + season + this.tilesHistMapping[ this.selectedVariable ];
    src85 = null;
  } else {
    src = this.activeYear + this.tilesMapping[ this.selectedVariable ];
    src85 = this.activeYear + this.tilesMapping85[ this.selectedVariable ];
  }

  /*
  * Replace! So we set existing tiles to "old", and wait a second to remove
  * this means no flashing between layers – new one is drawn, old is removed a second later
  */
  if ( replace ) {
    this.removeOldTiles();
  }


  /*
  * Create the rcp45 tile layer
  */
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

  //add rcp45 tile layer to map
  this.tileLayer.set('layer_id', 'tile_layer');
  this.map.addLayer(this.tileLayer);

  /*
  * if after 2010, add the rcp85 tile layer to map as well!
  */
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
    this.map.addLayer(this.tileLayer85);
  }


  /*
  * We want map names to be on top of climate tiles, so add to map at end!
  */
  if ( this.nameLayer ) { this.map.removeLayer(this.nameLayer); } //don't add twice!
  this.nameLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: 'http://habitatseven.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
      attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
    })
  });

  this.nameLayer.set('layer_id', 'name_layer');
  this.map.addLayer(this.nameLayer);


  //here we have to move some layers around so ordering remains right
  this.tileLayer.setZIndex(0);
  if ( src85 ) { this.tileLayer85.setZIndex(0); }
  this.nameLayer.setZIndex(6);

  //IF after 2010, add the high/low swiper to map
  if ( src85 ) {
    $( "#sliderDiv" ).show();
    this.setSwipeMap();
  } else {
    //else hide it
    $( "#sliderDiv" ).hide();
  }

  $('#year-slider-container').show();

  //If new map tiles, reset time slider
  if ( replace && !preserveTime ) {
    this.setSlider(layer);
  }
  this.reorderLayers();
}



/*
* Removes old climate tiles from map
* Timeout means new tiles will load before we remove old, so there isn't a
* flash of map with no tiles at all
*
*/
Impacts.prototype.removeOldTiles = function() {
  var self = this;

  this.oldTile = this.tileLayer;
  this.oldTile85 = this.tileLayer85;

  setTimeout(function() {
    if ( self.oldTile ) {
      self.map.removeLayer(self.oldTile);
      self.oldTile = null;
    }
    if ( self.oldTile85 ) {
      self.map.removeLayer(self.oldTile85);
      self.oldTile85 = null;
    }
  },900);
};




/*
*
* Logic for high/low emissions swiper
*
*
*/
Impacts.prototype.setSwipeMap = function() {
  var self = this;
  var swipeVal = null, pos, wrapper;

  $('#sliderDiv').show();
  $( "#sliderDiv" ).draggable({
    axis: "x",
    containment: "#map",
    scroll: false,
    drag: function(event,ui) {
      pos = ui.helper.offset();
      swipeVal = (pos.left - 20);
      self.tileLayer.dispatchEvent('change');
      $(".emissions-low").fadeOut();
			$(".emissions-high").fadeOut();
    },
    stop: function(event, ui) {
      pos = ui.helper.offset();
      swipeVal = (pos.left - 20);
      self.tileLayer.dispatchEvent('change');
      $(".emissions-low").fadeIn();
			$(".emissions-high").fadeIn();
    }
  });

  this.tileLayer85.on('precompose', function(event) {
    var ctx = event.context;
    var wrapper = $("#map").width();
    if(swipeVal === null) {
      pos = $("#sliderDiv").offset(); //ui.helper.offset();
      swipeVal = (pos.left - 20);
    }
    var screenPercent = swipeVal / wrapper;
		var width = ctx.canvas.width * screenPercent;
    ctx.save();
		ctx.beginPath();
		ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
		ctx.clip();
  });

  this.tileLayer85.on('postcompose', function(event) {
    var ctx = event.context;
    ctx.restore();
  });
};




/*
*
* Creates time slider
*
*/
Impacts.prototype.setSlider = function(layer) {
    var self = this;
    var year_slider = $('#variable-time-slider');

    var tooltip = $('<span class="tooltip">' + self.activeYear + '</span>').hide();

    var year_min = parseInt($('#year-slider-container').find('.year-min').text());
    var year_max = parseInt($('#year-slider-container').find('.year-max').text());

    year_slider.slider({
        range: false,
        min: year_min,
        max: year_max,
        step: 10,
        value: self.activeYear,
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
          self.addClimateLayer(true, layer, true);
          self.updateUrl();
          tooltip.fadeOut(200);
        }
    }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);

    $(this).hover(function () {
        tooltip.fadeIn(200);
    }, function () {
        tooltip.fadeOut(100);
    });

    tooltip.fadeIn(200);

}



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
      //if ( d.weight < 2 ) {
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
      //}
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
