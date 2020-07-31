'use strict';

// get state location information from URL state management
// some state management is in main.js and ce.js
// some ui utility code is in ce3-ui-components.js
$(function () {
  const topHazardsDataURLTemplate = "/resources/data/top_hazards/{fips}.json";
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
        Midwest: 'Number of <b>dry spells</b> may increase',
        Northwest: 'Number of <b>dry spells</b> may increase',
        Southeast: 'Number of <b>dry spells</b> may increase',
        Southwest: 'Number of <b>dry spells</b> may increase',
        NorthernGreatPlains: 'Number of <b>dry spells</b> may increase',
        SouthernGreatPlains: 'Number of <b>dry spells</b> may increase'
      }
    },
    extreme_precip_events: {
      icon: 'rain-storm',
      directions: ['less', 'more'],
      relative: true,
      averageLabel: ({average, dir})=>`${ average }% ${ dir } intense <b>rain storm${ average !== 1 ? "s" : "" }</b> every year`,
      rangeLabel: ({formatRange, directions, min, max})=>`Between ${ formatRange(min, max, "%", directions) } intense <b>rain storms</b> every year`,
      historicLabel: ({formatHistoric,historicMin, historicMax})=>`Historically ${ formatHistoric(historicMin, historicMax, "") } intense rain storms occur every year.`
    },
    max_consecutive_dry_days: {
      icon: 'wildfires',
      label: {
          Northwest: '<b>Wildfire</b> risk may be increased due to longer periods between preciptation events',
          Southwest: '<b>Wildfire</b> risk may be increased due to longer periods between preciptation events'
      }
    },
    max_high_temp: {
      icon: 'extreme-hot-days',
      directions: ['colder', 'hotter'],
      averageLabel: ({average, dir})=>`<b>Extreme hot days</b> that are ${ average }°F ${ dir } than the current hottest day`,
      rangeLabel: ({formatRange, directions, min, max})=>`<b>Extreme hot days</b> that are between ${ formatRange(min, max, "°F", directions) } than the current hottest day`,
      historicLabel: ({formatHistoric, historicMin, historicMax})=>`Historically the hottest day is between ${ formatHistoric(historicMin, historicMax, "°F") }`
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
          Northeast: '<b>Coastal flooding</b> may increase in part due to sea levels rising globally .5 - 2 feet, and relative sea level rise may be amplified in this region',
          Southeast: '<b>Coastal flooding</b> may increase in part due to sea levels rising globally .5 - 2 feet, and relative sea level rise may be amplified in this region',
          Southwest: '<b>Coastal flooding</b> may increase in part due to sea levels rising globally .5 - 2 feet',
          SouthernGreatPlains: '<b>Coastal flooding</b> may increase in part due to sea levels rising globally .5 - 2 feet'
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
    $.get(topHazardsDataURLTemplate.replace(/{fips}/g , fips))
      .done(data => {
          $(".next-steps-temperate #card-description").html(`
            ${data.map(indicatorData => {
              const id = indicatorData.indicator;
              const label = indicators[id].label;
              let content;
              if (typeof label === "object") {
                  const text = label[ncaRegion] || 'TEXT NEEDED';
                  content = `<div><div>${text}</div></div>`;
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
                  content = `
                    <div>
                        <span class="indicator-avg">
                            ${(((typeof indicators[id].averageLabel) === 'function') ? indicators[id].averageLabel(context) : indicators[id].averageLabel)}
                        </span>
                        <span class="indicator-range">
                            ${(((typeof indicators[id].rangeLabel) === 'function') ? indicators[id].rangeLabel(context) : indicators[id].rangeLabel)}
                        </span>
                        <div class="indicator-historic">
                            ${(((typeof indicators[id].historicLabel) === 'function') ? indicators[id].historicLabel(context) : indicators[id].historicLabel)}
                        </div>
                    </div>
                    `;
              }
              return `<div><img src="/resources/img/hazards/${indicators[id].icon}.svg" alt="">${content}</div>`
          }).join('')}
          <div class="footer">Displaying average projections for 2035-2064 (using all available models) as compared to 1961-1990. Top regional hazards identified by the <a href="https://nca2018.globalchange.gov/">2016 National Climate Assessment</a></div>
        `);

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

  function formatHistoric(minNum, maxNum, suffix) {
    const min = numFormat.format(minNum);
    const max = numFormat.format(maxNum);
    if (min === max) {
      return min + suffix;
    }
    return `${min}&nbsp;-&nbsp;${max}${suffix}`;
  }

  function formatRange(minNum, maxNum, suffix, directions) {
    const min = numFormat.format(Math.abs(minNum));
    const max = numFormat.format(Math.abs(maxNum));
    if (min === max) {
      return min + suffix;
    }
    if (minNum < 0 && maxNum > 0) {
      return `${min + suffix} ${directions[0]} and ${max}${suffix} ${directions[1]}`;
    }
    const direction = maxNum < 0 ? directions[0] : directions[1];
    return `${min}&nbsp;-&nbsp;${max}${suffix} ${direction}`;
  }

  function toggleRange() {
    const showRange = $('#temperate-show-range').is(':checked');
    $('.indicator-range').toggle(showRange);
    $('.indicator-avg').toggle(!showRange);
  }
});
