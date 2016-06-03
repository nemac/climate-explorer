var Variables = function(id) {
  // this.page = page;
  // this.subLayers = {};
  switch(true) {
    case (id === 'days_tmax_abv_35'):
      id = 'days_tmax_abv_35.0';
      break;
    case (id === 'days_tmin_blw_0'):
      id = 'days_tmin_blw_0.0';
      break;
    case (id === 'heating_degree_day_18'):
      id = 'heating_degree_day_18.3';
      break;
    case (id === 'cooling_degree_day_18'):
      id = 'cooling_degree_day_18.3';
      break;
  }

  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  this.mapVariables();
  this.selectedVariable = id || 'tasmax';
  this.activeYear = qs.year || 2010;
  this.selectedSeason = 'summer';

  $(".level-1").html(this.varMapping[ this.selectedVariable ]);

  $('#about-variable-link').html('About ' + this.varMapping[ this.selectedVariable ]);
  $('#about-variable-link').prop('href', '#detail-'+this.selectedVariable.split('.')[0]);

  $('#variable-options').val(id).attr('selected', true).change();

  $('#vars-legend .legend #legend-container').html('<img class="legend-image" src="resources/img/'+ this.selectedVariable +'.png"></img>');

  this.createMap();
  this.wireSearch();
};



/*
* Lots of inconsistencies in naming, so here I map all the variables to one another
*
*/
Variables.prototype.mapVariables = function() {
  this.varMapping = {
    'tasmax': 'Mean Daily Maximum',
    'tasmin': 'Mean Daily Minimum',
    'days_tmin_blw_0.0': 'Days below 32&deg; F',
    'days_tmax_abv_35.0': 'Days over 95&deg; F',
    'pr': 'Mean Daily Precipitation',
    'cooling_degree_day_18.3': 'Cooling Degree Days',
    'heating_degree_day_18.3': 'Heating Degree Days'
  };

  this.tilesHistMapping = {
    'tasmax': '_hist_prism_tmax',
    'tasmin': '_hist_prism_tmin',
    'days_tmin_blw_0.0': '_annual_hist_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_hist_days-tmax-abv',
    'pr': '_hist_prism_pr',
    'cooling_degree_day_18.3': '_annual_hist_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_hist_heating-degree-day'
  };

  this.tilesMapping = {
    'tasmax': '_rcp45_ea_tasmax',
    'tasmin': '_rcp45_ea_tasmin',
    'days_tmin_blw_0.0': '_annual_rcp45_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_rcp45_days-tmax-abv',
    'pr': '_rcp45_ea_pr',
    'cooling_degree_day_18.3': '_annual_rcp45_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_rcp45_heating-degree-day'
  };

  this.tilesMapping85 = {
    'tasmax': '_rcp85_ea_tasmax',
    'tasmin': '_rcp85_ea_tasmin',
    'days_tmin_blw_0.0': '_annual_rcp85_days-tmin-blw',
    'days_tmax_abv_35.0': '_annual_rcp85_days-tmax-abv',
    'pr': '_rcp85_ea_pr',
    'cooling_degree_day_18.3': '_annual_rcp85_cooling-degree-day',
    'heating_degree_day_18.3': '_annual_rcp85_heating-degree-day'
  };
};




/*
* Creates MAIN map
*
*
*/
Variables.prototype.createMap = function() {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  var center = ( qs.center ) ? qs.center.split(',') : null;
  var view = new ol.View({
    center: center || ol.proj.transform([-105.21, 37.42], 'EPSG:4326', 'EPSG:3857'),
    zoom: qs.zoom || 5,
    minZoom: 5,
    maxZoom: 12
  });

  var scaleLineControl = new ol.control.ScaleLine();

  this.map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
        collapsible: false
      })
    }).extend([
      scaleLineControl
    ]),
    target: 'variable-map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'http://habitatseven.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: [new ol.Attribution({ html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'] })]
        })
      })
    ],
    view: view
  });

  this.popup = new ol.Overlay.Popup();
  this.map.addOverlay(this.popup);

  //add layers to map and wire events
  this.updateTiledLayer(true);
  this.addCounties();
  this.addStates();
  this.wire();
};




/*
*
* Wires up search so user can use sidebar search for location in map
*
*/
Variables.prototype.wireSearch = function() {
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

    setTimeout(function() {
      var center = self.map.getView().getCenter();
      xy = self.map.getPixelFromCoordinate(center);

      var feature = self.map.forEachFeatureAtPixel(xy, function(feature, layer) {
        var id = layer.get('layer_id');
        if ( id === 'states' ) {
          return null;
        } else {
          return feature;
        }
      });

      var e = {};
      e.mapBrowserEvent = {};
      e.mapBrowserEvent.coordinate = center;
      if (feature) {
        self.selected_collection.clear();
        self.selected_collection.push(feature);
        var props = feature.getProperties();
        self.countySelected(feature, e);
      } else {
        self.popup.hide();
      }
    },200);

  });
};




/*
* Wire map and UI events
*
*
*/
Variables.prototype.wire = function() {
  var self = this;

  this.map.getView().on('change:resolution', function(){
    var zoom = self.map.getView().getZoom();
    $('.page-type-variables .zoom-slider').slider('value', zoom);
  });

  this.map.on('moveend', function() {
    self.updateUrl();
  });

  $('.page-type-variables .zoom-slider').attr('data-value', 4);
  $('.page-type-variables .zoom-slider').slider({
      orientation: "vertical",
      range: false,
      min: 5,
      max: 15,
      value: 5,
      slide: function( event, ui ) {
        $(this).attr('data-value', ui.value);
        self.setZoom(ui.value);
      },
      change: function (event, ui) {
        $(this).attr('data-value', ui.value);
        self.setZoom(ui.value);
      }
  });

  // help icon
  $('#vars-menu .help').click(function (e) {
    e.preventDefault();
    var current_legend = $(this).parents('.legend');
    if (current_legend.hasClass('info-on')) {
      $('body').close_layer_info();
    } else {
      current_legend.open_layer_info();
    }
  });


  //layer show / hide handlers
  $('#counties-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'counties') {
        if ( show ) {
          layer.setOpacity(1);
        }
        layer.setVisible(show);
      }
    });
  });


  //var selector
  $('#variable-options-container .fs-dropdown-item').on('click', function(e) {
    self.selectedVariable =  $(this).data().value;
    $('#vars-legend .legend #legend-container').html('<img class="legend-image" src="resources/img/'+ self.selectedVariable +'.png"></img>');

    $('#about-variable-link').html('About ' + self.varMapping[ self.selectedVariable ]);
    $('#about-variable-link').prop('href', '#detail-'+self.selectedVariable.split('.')[0]);

    $(".level-1").html(self.varMapping[ self.selectedVariable ]);

    self.updateUrl();
    self.updateTiledLayer(true, true);
    self.updateChart();
  });


  $('#map-seasons-container .fs-dropdown-item').on('click', function(e) {
    self.selectedSeason =  $(this).data().value;
    self.updateTiledLayer(true);
  });

  $('#variable-options').on('change', function() {
    $("#chart-name").html( $('.fs-dropdown-selected').html() );
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

  this.selected_collection = select.getFeatures();

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
      self.countySelected(feature, e);
    } else {
      self.popup.hide();
    }

  });
};




Variables.prototype.parseQueryString = function(qstr) {
  var query = {};
  var a = qstr.substr(1).split('&');
  for (var i = 0; i < a.length; i++) {
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
  }
  return query;
};



Variables.prototype.updateUrl = function() {
  var qtrs = location.search;
  var qs = this.parseQueryString(qtrs);

  //history.pushState(null, "", "?id="+self.selectedVariable);
  qs.id = this.selectedVariable;
  qs.zoom = this.map.getView().getZoom();
  qs.center = this.map.getView().getCenter().toString();
  qs.year = this.activeYear;

  var str = $.param( qs );

  history.pushState(null, "", 'variables.php?'+str);
};




/*
* Sets zoom on map
* Triggered from custom zoom control in global_functions.js
*
*/
Variables.prototype.setZoom = function(zoom) {
  this.map.getView().setZoom(zoom);
  this.updateUrl();
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
        color: 'rgba(255, 255, 255, 0.1)'
      }),
      stroke: new ol.style.Stroke({
        //color: '#2980b9',
        color: '#444',
        width: 0.2
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
  //this.vectorLayer.setVisible(false);
  this.vectorLayer.setOpacity(0);
  self.map.addLayer(this.vectorLayer);

  setTimeout(function() {
    self.vectorLayer.setVisible(false);
  },500)
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
        color: '#444',
        width: 0.8
      })
    })];

  };

  this.statesLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/states.json',
       format: new ol.format.GeoJSON()
    }),
    style: style
  });

  this.statesLayer.set('layer_id', 'states');
  this.map.addLayer(this.statesLayer);

};





/*
* Highlight county feature
* Also shows popup with the climate widget chart inside
* Have to build chart UI dynamically
*
*/
Variables.prototype.countySelected = function(feature, event) {
  var self = this;

  if (feature) {
    var props = feature.getProperties();
    var fips = props.STATE + props.COUNTY;
    var lonlat = ol.proj.transform(event.mapBrowserEvent.coordinate, 'EPSG:3857', 'EPSG:4326');
    var lon = lonlat[0];
    var lat = lonlat[1];
    var state = this.stateFips[ props.STATE ];

    var html = '<span class="text">'+
          'Chart<span class="full-title">: <a href="location.php?county='+props.NAME+'+County&city='+props.NAME+', '+state+'&fips='+fips+'&lat='+lat+'&lon='+lon+'">'+props.NAME+' County</a></span><br />'+
          '<span class="source" id="chart-name">'+$('.fs-dropdown-selected').html()+'</span>'+
        '</span>' +
        '<div class="data-accordion-actions">' +
          '<a href="#" class="how-to-read"><span class="icon icon-help"></span>How to read this</a>' +
          '<a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>' +
          '<a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>' +
        '</div>' +
      '</header>' +
      '<div id="climate-chart" style="width:800px; height:420px"></div>'+
      '<div class="chart-legend">'+
        '<div id="historical-obs" class="legend-item legend-item-range">'+
          '<div class="legend-item-line-container">'+
            '<div class="legend-item-line observed" id="over-baseline-block"></div>'+
          '</div>'+
          '<span class="legend-item-line-label">Observations</span>'+
        '</div>'+
        '<div id="historical-range" class="legend-item legend-item-range selected">'+
          '<div class="legend-item-block selected" id="historical-block"></div>'+
          'Historical (Modelled)'+
        '</div>'+
        '<div id="rcp45-range" class="legend-item legend-item-range selected">'+
          '<div class="legend-item-block selected" id="rcp45-block"></div>'+
          'Lower Emissions'+
        '</div>'+
        '<div id="rcp85-range" class="legend-item legend-item-range selected">'+
          '<div class="legend-item-block selected" id="rcp85-block"></div>'+
          'Higher Emissions'+
        '</div>'+
        '<div id="rcp45-mean" class="legend-item legend-item-range selected">'+
          '<div class="legend-item-line-container">'+
            '<div class="legend-item-line selected" id="rcp85-line"></div>'+
            '<div class="legend-item-line selected" id="rcp45-line"></div>'+
          '</div>'+
          '<span class="legend-item-line-label">Medians</span>'+
        '</div>'+
      '</div>'+
      '<div class="range" id="variable-slider">'+
        '<div id="slider-range"></div>'+
        '<div class="ui-slider-label range-label min" id="range-low">2010</div>'+
        '<div class="ui-slider-label range-label max" id="range-high">2100</div>'+
      '</div>';
    this.popup.show(event.mapBrowserEvent.coordinate, html);

    this.cwg = climate_widget.graph({
      div        : "div#climate-chart",
      dataprefix : "http://climateexplorer.habitatseven.work/data",
      font       : "Roboto",
      frequency  : "annual",
      fips       : fips,
      variable   : this.selectedVariable,
      scenario   : "both",
      pmedian    : "true",
      histobs    : "false"
    });

    $('.legend-item-range').on('click', function() {
      $(this).toggleClass('selected');
      $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');
      $(this).children('.legend-item-line-container').children('.legend-item-line').toggleClass('selected');

      var scenario = null;
      switch(true) {
        case $('#rcp85-block').hasClass('selected') && $('#rcp45-block').hasClass('selected'):
          scenario = 'both';
          break;
        case $('#rcp45-block').hasClass('selected'):
          scenario = 'rcp45';
          break;
        case $('#rcp85-block').hasClass('selected'):
          scenario = 'rcp85';
          break;
        default:
          scenario = '';
      }

      var median = null;
      switch(true) {
        case $('#rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#rcp45-line').hasClass('selected'):
          median = 'true';
          break;
        case $('#rcp85-line').hasClass('selected'):
          median = 'true';
          break;
        default:
          median = 'false';
      }

      var histmod = null;
      switch(true) {
        case $('#historical-block').hasClass('selected') && $('#historical-block').hasClass('selected'):
          histmod = 'true';
          break;
        case $('#historical-block').hasClass('selected'):
          histmod = 'true';
          break;
        default:
          histmod = 'false';
      }


      var histobs = null;
      switch(true) {
        case $('#over-baseline-block').hasClass('selected') && $('#under-baseline-block').hasClass('selected'):
          histobs = 'true';
          break;
        case $('#over-baseline-block').hasClass('selected'):
          histobs = 'true';
          break;
        case $('#under-baseline-block').hasClass('selected'):
          histobs = 'true';
          break;
        default:
          histobs = 'false';
      }

      self.cwg.update({
        pmedian: median,
        scenario: scenario,
        histobs: histobs,
        histmod: histmod
      });

    });

    $('.download-image').click(function() {
      self.cwg.downloadImage(this, 'graph.png');
    });

    $('.download-data').click(function(e) {
      var $ul = $('#download-panel').find('ul');
      $ul.empty();
      var dataurls = self.cwg.dataurls();
      if (dataurls.hist_obs) {
          $ul.append($("<li><a href='"+dataurls.hist_obs+"'>Observed Data</a></li>"));
      }
      if (dataurls.hist_mod) {
          $ul.append($("<li><a href='"+dataurls.hist_mod+"'>Historical Modeled Data</a></li>"));
      }
      if (dataurls.proj_mod) {
          $ul.append($("<li><a href='"+dataurls.proj_mod+"'>Projected Modeled Data</a></li>"));
      }
      $('#download-panel').removeClass("hidden");

    });

    $('#download-dismiss-button').click(function() {
      $('#download-panel').addClass("hidden");
    });

    $('.how-to-read').on('click', function() {
      var pre = '';
      var closest = $(this).closest('.data-chart').attr('id');
      if ( closest === 'precipitation-chart' ) { pre = 'precip-'; }
      if ( closest === 'derived-chart' ) { pre = 'derive-'; }
      if ( app ) {
        app.takeGraphTour(pre);
      }
    });

    $("#slider-range").slider({
      range: true,
      min: 1950,
      max: 2099,
      values: [ 1950, 2099 ],
      slide: function( event, ui ) {
        return self.cwg.setXRange(ui.values[0], ui.values[1]);
      }
    });

  } else {
    this.cwg = null;
    this.popup.hide();
  }
};






/*
*
* Main tile layer for all the climate tiles
* Replace indicates if we are updating existing tiles, or if we are starting new variable
* Given a "replace" we re-create slider / swiper at end of function
*
*/
Variables.prototype.updateTiledLayer = function(replace, preserveTime) {
  var self = this;
  var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
  var seasons = ['tasmax', 'tasmin', 'pr'];

  var extent = ol.proj.transformExtent([-135,11.3535322866,-56.25,49.5057345956],'EPSG:4326', 'EPSG:3857');

  var hist = null;
  var season = ( seasons.indexOf(this.selectedVariable) !== -1 ) ? '_'+this.selectedSeason : '';

  if ( season === '' ) {
     $('#map-seasons-container .fs-dropdown-selected').hide();
  } else {
    $('#map-seasons-container .fs-dropdown-selected').show();
  }

  var src, src85;
  if ( histYears.indexOf(this.activeYear) !== -1 ) {
    src = this.activeYear + season + this.tilesHistMapping[ this.selectedVariable ];
    src85 = null;
  } else {
    src = this.activeYear +  season + this.tilesMapping[ this.selectedVariable ];
    src85 = this.activeYear + season + this.tilesMapping85[ this.selectedVariable ];
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
  if ( this.statesLayer) { this.statesLayer.setZIndex(4); }
  if ( this.vectorLayer) { this.vectorLayer.setZIndex(5); }
  this.nameLayer.setZIndex(6);

  //IF after 2010, add the high/low swiper to map
  if ( src85 ) {
    $( "#sliderDiv" ).show();
    this.setSwipeMap();
  } else {
    //else hide it
    $( "#sliderDiv" ).hide();
  }

  //If new map tiles, reset time slider
  if ( replace && !preserveTime ) {
    this.setSlider();
  }

};


/*
* Removes old climate tiles from map
* Timeout means new tiles will load before we remove old, so there isn't a
* flash of map with no tiles at all
*
*/
Variables.prototype.removeOldTiles = function() {
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
Variables.prototype.setSwipeMap = function() {
  var self = this;
  var swipeVal = null, pos, wrapper;

  $( "#sliderDiv" ).draggable({
    axis: "x",
    containment: "#variable-map",
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
    var wrapper = $("#variable-map").width();
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
Variables.prototype.setSlider = function() {
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
          self.updateTiledLayer(true, true);
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




/*
* State fips for use in UI
*
*/
Variables.prototype.stateFips = {
  "02": "AK",
  "01": "AL",
  "05": "AR",
  "60": "AS",
  "04": "AZ",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "11": "DC",
  "10": "DE",
  "12": "FL",
  "13": "GA",
  "66": "GU",
  "15": "HI",
  "19": "IA",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "25": "MA",
  "24": "MD",
  "23": "ME",
  "26": "MI",
  "27": "MN",
  "29": "MO",
  "28": "MS",
  "30": "MT",
  "37": "NC",
  "38": "ND",
  "31": "NE",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "32": "NV",
  "36": "NY",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "72": "PR",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "51": "VA",
  "78": "VI",
  "50": "VT",
  "53": "WA",
  "55": "WI",
  "54": "WV",
  "56": "WY"
}
