var App = function(page) {
  this.frequency = {
    'temperature-chart': 'annual',
    'precipitation-chart': 'annual',
    'derived-chart': 'annual'
  };
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

  $('#temperature-data .location-resolution a').on('click', function(e) {
    var val = $(this).html().toLowerCase();
    self.frequency['temperature-chart'] = val;
  });

  $('#precipitation-data .location-resolution a').on('click', function(e) {
    var val = $(this).html().toLowerCase();
    self.frequency['precipitation-chart'] = val;
  });


  $('.how-to-read').on('click', function() {
    var pre = '';
    var closest = $(this).closest('.data-chart').attr('id');
    if ( closest === 'precipitation-chart' ) { pre = 'precip-'; }
    if ( closest === 'derived-chart' ) { pre = 'derive-'; }

    if ( self.frequency[closest] === 'annual' ) {
      self.takeGraphTour(pre);
    } else {
      self.takeSeasonalGraphTour(pre);
    }
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
    text: 'Red and blue bars show observed values for each year, displayed as the difference from the average from 1960 to 1989. The horizontal line from which bars extend is the 1960-1989 average. Red bars show years when observed measurements were above the long-term average; blue bars show years when observed measurements were below the long-term average.',
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
    text: 'The grey band shows the range of model results at each time step from 1950 to 2010. Note that observed year-to-year variability (indicated by the red and blue bars) is generally within the range of model results.',
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
    text: 'Model results for a scenario in which emissions from burning fossil fuels stabilize around 2100 and radiative forcing reaches 4.5 Watts per meter squared. This scenario is known as RCP 4.5, where RCP stands for Representative Concentration Pathway.',
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
    text: 'Model results for a possible future in which emissions from burning fossil fuels continue to increase. The atmosphere’s ability to trap heat, a measure called radiative forcing, reaches 8.5 Watts per meter squared in the year 2100. This scenario is known as RCP 8.5, where RCP stands for Representative Concentration Pathway.',
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
    text: 'For future projections, median lines highlight the middle result from all models at each time step. Though the median is no more or less likely to predict actual values than any of the other models, it can highlight the trend over time.',
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




App.prototype.takeSeasonalGraphTour = function(pre) {
  var self = this;

  if ( this.seasonalTour ) {
    this.seasonalTour.cancel();
    this.seasonalTour = null;
    this.seasonalTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  } else {
    this.seasonalTour = new Shepherd.Tour({
      defaults: {
        classes: 'shepherd-theme-arrows',
        scrollTo: false
      }
    });
  }

  this.seasonalTour.addStep('historical-obs', {
    text: 'Black lines represent the mean daily temperature observed during each season from 1960-1989.',
    attachTo: '#'+pre+'historical-obs top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.seasonalTour.cancel
      },
      {
        text: 'Next',
        action: this.seasonalTour.next
      }
    ]
  });



  this.seasonalTour.addStep('rcp45-range', {
    text: 'Blue bands show the range of projections for a stabilized emissions scenario (RCP 4.5).',
    attachTo: '#'+pre+'rcp45-range top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.seasonalTour.cancel
      },
      {
        text: 'Next',
        action: this.seasonalTour.next
      }
    ]
  });


  this.seasonalTour.addStep('rcp85-range', {
    text: 'Red bands show the range projections for an increasing emissions scenario (RCP 8.5).',
    attachTo: '#'+pre+'rcp85-range top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.seasonalTour.cancel
      },
      {
        text: 'Next',
        action: this.seasonalTour.next
      }
    ]
  });

  this.seasonalTour.addStep('rcp45-mean', {
    text: 'Red and blue lines show the median projection for each scenario.',
    attachTo: '#'+pre+'rcp45-mean top',
    buttons: [
      {
        text: 'Close',
        classes: 'shepherd-button-secondary',
        action: this.seasonalTour.cancel
      }
    ]
  });


  this.seasonalTour.on('start', function() {
    $('.cd-cover-layer').removeClass('is-visible');
    $('.cd-cover-layer').addClass('is-visible');
    setTimeout(function() {
      $('.cd-cover-layer').removeClass('is-visible');
    },4000);
  });

  this.seasonalTour.start();
};
