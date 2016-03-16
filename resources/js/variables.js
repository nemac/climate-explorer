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

  //var selector
  $('.fs-dropdown-item').on('click', function(e) {
    self.selectedVariable =  $(this).data().value;
    self.updateChart();
  });

  //map click selector
  var select = new ol.interaction.Select({
    condition: ol.events.condition.click
  });

  this.map.addInteraction(select);
  select.on('select', function(e) {
    self.countySelected(e);
  });
};




/*
*
* get counties geojson and add to map
*
*/
Variables.prototype.addCounties = function() {

  var self = this;

  this.vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/counties.json',
       format: new ol.format.GeoJSON()
    })
  });

  this.vectorLayer.set('layer_id', 'counties');
  self.map.addLayer(this.vectorLayer);

};




/*
* Highlight county feature
*
*/
Variables.prototype.countySelected = function(event) {

  var feature = this.map.forEachFeatureAtPixel(event.mapBrowserEvent.pixel, function(feature, layer) {
    return feature;
  });

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
