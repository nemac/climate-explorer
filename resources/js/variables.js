var Variables = function(page) {
  // this.page = page;
  // this.subLayers = {};
  this.createMap();
};




/*
* Creates map
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

  this.getCounties();
  this.wire();
};




Variables.prototype.wire = function() {
  var self = this;

  $('#counties-overlay-toggle').on('click', function() {
    var show = $(this).is(':checked');
    self.map.getLayers().forEach(function(layer) {
      if (layer.get('layer_id') == 'counties') {
        layer.setVisible(show);
      }
    });
  });

};




Variables.prototype.getCounties = function() {

  var self = this;

  var vectorLayer = new ol.layer.Vector({
    title: 'added Layer',
    source: new ol.source.Vector({
       url: 'resources/data/counties.json',
       format: new ol.format.GeoJSON()
    })
  });

  vectorLayer.set('layer_id', 'counties');
  self.map.addLayer(vectorLayer);

};
