'use strict';

// get state location information fron URL state management
// some state management is in main.js and ce.js
// some ui utility code is in ce3-ui-components.js
$(function () {
  // TODO: Replace with S3 URL
  const dataUrl = "http://localhost:8000/";
  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  const fips = window.ce.ce('getLocationPageState')['fips'];
  const stateNCARegions = {
    AL: 'Southeast',
    AR: 'Southeast',
    AZ: 'Southwest',
    CA: 'Southwest',
    CO: 'Southwest',
    CT: 'Northeast',
    DC: 'Northeast',
    DE: 'Northeast',
    FL: 'Southeast',
    GA: 'Southeast',
    IA: 'Midwest',
    ID: 'Northwest',
    IL: 'Midwest',
    IN: 'Midwest',
    KS: 'SouthernGreatPlains',
    KY: 'Southeast',
    LA: 'Southeast',
    MA: 'Northeast',
    MD: 'Northeast',
    ME: 'Northeast',
    MI: 'Midwest',
    MN: 'Midwest',
    MO: 'Midwest',
    MS: 'Southeast',
    MT: 'NorthernGreatPlains',
    NC: 'Southeast',
    ND: 'NorthernGreatPlains',
    NE: 'NorthernGreatPlains',
    NH: 'Northeast',
    NJ: 'Northeast',
    NM: 'Southwest',
    NV: 'Southwest',
    NY: 'Northeast',
    OH: 'Midwest',
    OK: 'SouthernGreatPlains',
    OR: 'Northwest',
    PA: 'Northeast',
    RI: 'Northeast',
    SC: 'Southeast',
    SD: 'NorthernGreatPlains',
    TN: 'Southeast',
    TX: 'SouthernGreatPlains',
    UT: 'Southwest',
    VA: 'Southeast',
    VT: 'Northeast',
    WA: 'Northwest',
    WI: 'Midwest',
    WV: 'Northeast',
    WY: 'NorthernGreatPlains'
  };
  const indicators = {
    changed_seasonal_patterns: {
      icon: 'changed-seasonal-patterns',
      label: {
        Midwest: '<b>Changed seasonal patterns</b> may affect agricultural productivity',
        Northeast: '<b>Changed seasonal patterns</b> may affect rural ecosystems, environments, and economies',
        Southeast: '<b>Changed seasonal patterns</b> may affect health impacts and agricultural, timber, and manufacturing sector economies',
        NorthernGreatPlains: '<b>Changed seasonal patterns</b> may affect water management systems critical to the region'
      }
    },
    dry_spells: {
      icon: 'drought',
      label: {
        Midwest: 'Number of dry spells may increase',
        Northwest: 'Number of dry spells may increase',
        Southeast: 'Number of dry spells may increase',
        Southwest: 'Number of dry spells may increase',
        NorthernGreatPlains: 'Number of dry spells may increase',
        SouthernGreatPlains: 'Number of dry spells may increase'
      }
    },
    extreme_precip_events: {
      icon: 'rain-storm',
      directions: ['less', 'more'],
      relative: true,
      averageLabel: '<%= average %>% <%= dir %> intense <b>rain storm<%= average !== 1 ? "s" : "" %></b> every year',
      rangeLabel: 'Between <%= formatRange(min, max, "%", directions) %> intense <b>rain storms</b> every year',
      historicLabel: 'Historically <%= formatHistoric(historicMin, historicMax, "") %> intense rain storms occur every year.'
    },
    max_consecutive_dry_days: {
      icon: 'wildfires',
      label: {
        Northwest: 'Wildfire risk may be increased due to longer periods between preciptation events',
        Southwest: 'Wildfire risk may be increased due to longer periods between preciptation events'
      }
    },
    max_high_temp: {
      icon: 'extreme-hot-days',
      directions: ['colder', 'hotter'],
      averageLabel: '<b>Extreme hot days</b> that are <%= average %>°F <%= dir %> than the current hottest day',
      rangeLabel: '<b>Extreme hot days</b> that are between <%= formatRange(min, max, "°F", directions) %> than the current hottest day',
      historicLabel: 'Historically the hottest day is between <%= formatHistoric(historicMin, historicMax, "°F") %>'
    },
    ocean_acidification: {
      icon: 'ocean-acidification',
      label: {
        Northeast: '<b>Ocean warming and acidification</b> may affect commerce, tourism, and recreation',
        Northwest: '<b>Ocean Acidification</b> may affect the natural resource economy, cultural heritage, built infrastructure, and recreation',
        Southeast: '<b>Ocean warming and acidification</b> may contribute to coral reef mortality and decline',
        Southwest: '<b>Ocean warming and acidification</b> may affect homes and other coastal infrastructure, marine flora and fauna, and people who depend on coastal resources',
      }
    },
    saltwater_intrusion: {
      icon: 'salt-water-intrusion',
      label: {
        SouthernGreatPlains: '<b>Saltwater intrusion</b> may threaten water supplies critical to the region'
      }
    },
    sea_level_rise: {
      icon: 'coastal-flood',
      label: {
        Northeast: 'Coastal flooding may increase in part due to sea levels rising globally .5 - 2 feet, and relative sea level rise may be amplified in this region',
        Southeast: 'Coastal flooding may increase in part due to sea levels rising globally .5 - 2 feet, and relative sea level rise may be amplified in this region',
        Southwest: 'Coastal flooding may increase in part due to sea levels rising globally .5 - 2 feet',
        SouthernGreatPlains: 'Coastal flooding may increase in part due to sea levels rising globally .5 - 2 feet'
      }
    }
  };
  const stateAbbrev = cityStateCE.substring(cityStateCE.length - 2);
  const ncaRegion = stateNCARegions[stateAbbrev];
  const numFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
  let isAlaska = false;
  let isHawaii = false;

  // make sure city state is defined
  // if so instantiate check for Alaska or Hawaii
  if (cityStateCE) {
      isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
      isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  // update ui with city state or county information
  $('#default-city-state').text(cityStateCE);
  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  // if city state is no defined add missing location warning
  if (!cityStateCE) {
    $('#default-city-state').addClass('d-none');
    $('#default-in').addClass('d-none');
    $('#default-city-county').addClass('d-none');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  // if  Alaska or Hawaii disable text not applicable for locations
  if (cityStateCE) {
    if (isAlaska || isHawaii) {
      $('#default-in').html('—');
      $('.opt-not-ak').addClass('default-select-option-disabled');
      $('.next-steps-temperate').addClass('card-disabled');
    } else {
      $('.opt-only-ak').addClass('default-select-option-disabled');
    }

    if (cityStateCE.indexOf('County') > 0) {
      $('#default-in').addClass('d-none');
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }

  if (fips) {
    $.get(dataUrl + fips + ".json")
      .done(data => {
        const indicatorElems = data.map(indicatorData => {
          const id = indicatorData.indicator;
          const label = indicators[id].label;
          let content;
          if (typeof label === "object") {
            const text = label[ncaRegion] || 'TEXT NEEDED';
            content = '<div><div>' + text + '</div></div>';
          } else {
            let average = indicatorData.future.average - indicatorData.historic.average;
            let min = indicatorData.future.minimum - indicatorData.historic.average;
            let max = indicatorData.future.maximum - indicatorData.historic.average;
            if (indicatorData.relative) {
              average = (average / indicatorData.historic.average) * 100;
              min = (min / indicatorData.historic.average) * 100;
              max = (max / indicatorData.historic.average) * 100;
            }
            average = Math.round(average);
            min = Math.round(min);
            max = Math.round(max);
            const context = {
              formatHistoric: formatHistoric,
              formatRange: formatRange,
              average: numFormat.format(Math.abs(average)),
              historicMin: indicatorData.historic.minimum,
              historicMax: indicatorData.historic.maximum,
              directions: indicators[id].directions,
              dir: indicators[id].directions[average < 0 ? 0 : 1],
              min: min,
              max: max
            };
            const avgText = _.template(indicators[id].averageLabel)(context);
            const rangeText = _.template(indicators[id].rangeLabel)(context);
            const historicText = _.template(indicators[id].historicLabel)(context);
            content = '<div><span class="indicator-avg">' + avgText + '</span>';
            content += '<span class="indicator-range">' + rangeText + '</span>';
            content += '<div class="indicator-historic">' + historicText + '</div></div>';
          }
          const img = '<img src="/resources/img/hazards/' + indicators[id].icon + '.svg">';
          return '<div>' + img + content + '</div>'
        });

        const footer = '<div class="footer">Displaying average projections for 2035-2064 (using all available models) as compared to 1961-1990. Top regional hazards identified by the <a href="https://nca2018.globalchange.gov/">2016 National Climate Assessment</a></div>';
        const html = indicatorElems.join('') + footer;
        $(".next-steps-temperate #card-description").html(html);
        $(".next-steps-temperate .card-controls").show();
        $(".next-steps-temperate .card-controls input").lc_switch('', '');
        toggleRange();
      })
      .fail(() => {
        $('.next-steps-temperate').addClass('card-disabled');
      });
  }


  // adds clear location when x is clicked next to location search
  $('#clear-location').click( function(e){
    const target = $(e.target);
    handleClearLocationClick(target);
  });

  $('#temperate-show-range').on('lcs-statuschange', toggleRange);

  //  TODO move this global functions so its not in several places
  // this function removes existing paramaters of the key undefined
  // and returns a new search param string.  We need to do this to avoid
  // mulitple nav paramaters, which would causes issues with only using the first
  // occurance of the nav parameter - aka we end up on the wrong page
  function removeUrlParam(key) {
    var params = decodeURIComponent(window.location.search.substring(1)).split('&');
    var param = void 0;
    var newParams = [],
        href = window.location.href.split('?')[0];
    var i = void 0;

    if (window.hasOwnProperty('history') === false || window.history.replaceState === false) return;

    for (i = 0; i < params.length; i++) {
      param = params[i].split('=');

      if (param[0] === key) {
        continue;
      }

      newParams.push(`${encodeURIComponent(param[0])}=${encodeURIComponent(param[1])}`);
    }

    if (params.length !== newParams.length) {
      return  `?${newParams.join('&')}`;
    }

    return `?${newParams.join('&')}`;
  }

  function formatHistoric(minNum, maxNum, suffix) {
    const min = numFormat.format(minNum);
    const max = numFormat.format(maxNum);
    if (min === max) {
      return min + suffix;
    }
    return min + '&nbsp;-&nbsp;' + max + suffix;
  }

  function formatRange(minNum, maxNum, suffix, directions) {
    const min = numFormat.format(Math.abs(minNum));
    const max = numFormat.format(Math.abs(maxNum));
    if (min === max) {
      return min + suffix;
    }
    if (minNum < 0 && maxNum > 0) {
      return min + suffix + ' ' + directions[0] + ' and ' + max + suffix + ' ' + directions[1];
    }
    const direction = maxNum < 0 ? directions[0] : directions[1];
    return min + '&nbsp;-&nbsp;' + max + suffix + ' ' + direction;
  }

  function toggleRange() {
    const showRange = $('#temperate-show-range').is(':checked');
    $('.indicator-range').toggle(showRange);
    $('.indicator-avg').toggle(!showRange);
  }
});
