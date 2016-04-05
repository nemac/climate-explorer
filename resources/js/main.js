var App = function(page) {
  this.getCountyCodes();
};




App.prototype.getCountyCodes = function() {
  var self = this;
  this.fips_codes = null;
  $.getJSON('resources/data/fips_codes.json', function(data) {
    self.fips_codes = data;
    self.locationSearch();
  });
};



App.prototype.locationSearch = function() {
  var self = this;

  $(".location-mapper").formmapper({
    details: "form"
  });

  $(".location-mapper").bind("geocode:result", function(event, result){
    console.log('result', result);
    var data = {};
    $.each(result.address_components, function(index, object){
      var name = object.types[0];
      data[name] = object.long_name;
      data[name + "_short"] = object.short_name;
    });
    var county = data.administrative_area_level_2.replace(/ /g, '+');
    var city = data.locality + ', ' + data.administrative_area_level_1_short;

    var lat, lon;
    if ( result.geometry.access_points ) {
      lat = result.geometry.access_points[0].location.lat;
      lon = result.geometry.access_points[0].location.lng;
    } else {
      lat = result.geometry.location.lat();
      lon = result.geometry.location.lng();
    }

    var fips;
    $.each(self.fips_codes[data.administrative_area_level_1_short], function(i, c) {
      if (c.label === county.replace('+', ' ')) {
        fips = c.fips;
      }
    });

    if ( data.administrative_area_level_1_short === "DC" ) { fips = '11001'; }
    console.log('data', data);

    if ( fips ) {
      window.location.href = 'location.php?county='+county+'&city='+city+'&fips='+fips+'&lat='+lat+'&lon='+lon;
    }

  });

};
