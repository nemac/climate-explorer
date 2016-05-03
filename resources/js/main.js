var App = function(page) {
  this.getCountyCodes();
  this.tour();
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
    //console.log('result', result);
    var data = {};
    $.each(result.address_components, function(index, object){
      var name = object.types[0];
      data[name] = object.long_name;
      data[name + "_short"] = object.short_name;
    });
    //console.log('data', data);
    var county = (data.administrative_area_level_2) ? data.administrative_area_level_2.replace(/ /g, '+') : data.locality + '+County';
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
    //console.log('data', data, 'fips', fips);

    if ( fips ) {
      window.location.href = 'location.php?county='+county+'&city='+city+'&fips='+fips+'&lat='+lat+'&lon='+lon;
    }

  });

};




App.prototype.tour = function() {
  var tour;
  var self = this;

  $('.start-home-tour').on('click', function() {
    self.takeHomeTour();
  });

  $('#page-home #tour-this-page').on('click', function() {
    self.takeHomeTour();
  });

  $('#page-variables #tour-this-page').on('click', function() {
    self.takeVariablesTour();
  });

  $('.page-type-location #tour-this-page').on('click', function() {
    self.takeLocationTour();
  });

  $('.page-type-case #tour-this-page').on('click', function() {
    self.takeCaseTour();
  });

  $('.how-to-read').on('click', function() {
    var pre = '';
    var closest = $(this).closest('.data-chart').attr('id');
    if ( closest === 'precipitation-chart' ) { pre = 'precip-'; }
    if ( closest === 'derived-chart' ) { pre = 'derive-'; }
    console.log('pre', pre, 'closest', closest);
    self.takeGraphTour(pre);
  });

};



App.prototype.takeHomeTour = function() {
  var self = this;

  if ( this.homeTour ) {
    this.homeTour.cancel();
  } else {
    this.homeTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
        showCancelLink: false
      }
    });
  }

  var step1 = this.homeTour.addStep('search-by-location', {
    text: 'Search climate graphs and maps for any location in the United States.',
    attachTo: '#home-search-by-location left',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.homeTour.cancel
      },
      {
        text: 'Next',
        action: this.homeTour.next
      }
    ]
  });

  var step2 = this.homeTour.addStep('search-by-variable', {
    text: 'Explore climate variables across the United States.',
    attachTo: '#home-search-by-variable left',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.homeTour.cancel
      },
      {
        text: 'Next',
        action: this.homeTour.next
      }
    ]
  });

  this.homeTour.addStep('search-by-topic', {
    text: 'View climate maps by specfic topics.',
    attachTo: '#home-search-by-topic left',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.homeTour.cancel
      },
      {
        text: 'Next',
        action: this.homeTour.next
      }
    ]
  });

  this.homeTour.on('show', function() {
    console.log('show!');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.homeTour.start();

};



App.prototype.takeVariablesTour = function() {
  var self = this;

  if ( this.variablesTour ) {
    this.variablesTour.cancel();
  } else {
    this.variablesTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  }

  this.variablesTour.addStep('search-by-location', {
    text: 'Search by location in the United States to zoom to that region and explore the selected variable.',
    attachTo: '#variable-search-by-location right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      },
      {
        text: 'Next',
        action: this.variablesTour.next
      }
    ]
  });

  this.variablesTour.addStep('variable-counties-toggle', {
    text: 'Toggle on and off the counties layer to explore the selected variable for a specific U.S. county.',
    attachTo: '#variable-counties-toggle right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      },
      {
        text: 'Next',
        action: this.variablesTour.next
      }
    ]
  });

  this.variablesTour.addStep('variable-options-container', {
    text: 'Select a different climate variable to explore, from mean daily maximum temperatures to mean daily precipitation for the United States',
    attachTo: '#variable-options-container right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      },
      {
        text: 'Next',
        action: this.variablesTour.next
      }
    ]
  });

  this.variablesTour.addStep('map-seasons-container', {
    text: 'For some variables, you can explore them by season, i.e. what is the forecast for mean daily maximum temperatures in the summer of 2090?',
    attachTo: '#map-seasons-container bottom',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      },
      {
        text: 'Next',
        action: this.variablesTour.next
      }
    ]
  });

  this.variablesTour.addStep('sliderDiv', {
    text: 'Slide this bar left and right to compare the forecast for how high and low emissions would effect the selected variable over the years.',
    attachTo: '#sliderDiv right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      },
      {
        text: 'Next',
        action: this.variablesTour.next
      }
    ]
  });

  this.variablesTour.addStep('year-slider-container', {
    text: 'Use this slider to change the selected year you wish to view the current variable for.',
    attachTo: '#year-slider-container top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.variablesTour.cancel
      }
    ]
  });

  this.variablesTour.on('show', function() {
    $('.cd-cover-layer').removeClass('is-visible');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.variablesTour.start();
};



App.prototype.takeLocationTour = function() {
  var self = this;

  if ( this.locationTour ) {
    this.locationTour.cancel();
  } else {
    this.locationTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  }

  this.locationTour.addStep('location-search', {
    text: 'Here you can change what location in the United States you wish to explore.',
    attachTo: '#location-search bottom',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.locationTour.cancel
      },
      {
        text: 'Next',
        action: this.locationTour.next
      }
    ]
  });

  this.locationTour.addStep('page-nav', {
    text: 'For each location these are all the available sections one can explore. Clicking a topic will scroll you to the chart and map for this location and topic.',
    attachTo: '#page-nav bottom',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.locationTour.cancel
      },
      {
        text: 'Next',
        action: this.locationTour.next
      }
    ]
  });

  this.locationTour.addStep('temperature-data', {
    text: 'There are five sections to explore for each location, the first is temperature. Here you can change the variable to update the chart and map associated with temperatures. Scroll down to see more.',
    attachTo: '#temperature-data top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.locationTour.cancel
      }
    ]
  });


  this.locationTour.on('show', function() {
    $('.cd-cover-layer').removeClass('is-visible');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.locationTour.start();
};



App.prototype.takeCaseTour = function() {
  var self = this;

  if ( this.caseTour ) {
    this.caseTour.cancel();
  } else {
    this.caseTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  }

  this.caseTour.addStep('search-field', {
    text: 'Here you can change what location in the United States you wish to explore within the topic map.',
    attachTo: '#search-by-location right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.caseTour.cancel
      },
      {
        text: 'Next',
        action: this.caseTour.next
      }
    ]
  });

  this.caseTour.addStep('case-menu', {
    text: 'Here is the list of all available layers to show in the map. Select the "?" to view more information about each layer, as well as to toggle on and of their visibility. Lastly, click and drag to reorder the layers.',
    attachTo: '#case-menu right',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.caseTour.cancel
      }
    ]
  });

  this.caseTour.on('show', function() {
    $('.cd-cover-layer').removeClass('is-visible');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.caseTour.start();
};




App.prototype.takeGraphTour = function(pre) {
  var self = this;

  if ( this.graphTour ) {
    this.graphTour.cancel();
    this.graphTour = null;
    this.graphTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  } else {
    this.graphTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  }

  this.graphTour.addStep('historical-obs', {
    text: 'Use this to turn on and off historical observed data',
    attachTo: '#'+pre+'historical-obs top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.graphTour.cancel
      },
      {
        text: 'Next',
        action: this.graphTour.next
      }
    ]
  });


  this.graphTour.addStep('historical-range', {
    text: 'Historical range.',
    attachTo: '#'+pre+'historical-range top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.graphTour.cancel
      },
      {
        text: 'Next',
        action: this.graphTour.next
      }
    ]
  });



  this.graphTour.addStep('rcp45-range', {
    text: 'rcp45 Range',
    attachTo: '#'+pre+'rcp45-range top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.graphTour.cancel
      },
      {
        text: 'Next',
        action: this.graphTour.next
      }
    ]
  });


  this.graphTour.addStep('rcp85-range', {
    text: 'rcp85 Range',
    attachTo: '#'+pre+'rcp85-range top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.graphTour.cancel
      },
      {
        text: 'Next',
        action: this.graphTour.next
      }
    ]
  });

  this.graphTour.addStep('rcp45-mean', {
    text: 'medians of rcp45 and 85',
    attachTo: '#'+pre+'rcp45-mean top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.graphTour.cancel
      }
    ]
  });


  this.graphTour.on('start', function() {
    $('.cd-cover-layer').removeClass('is-visible');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.graphTour.start();
};
