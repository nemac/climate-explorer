'use strict';

// get state location information from URL state management
// some state management is in main.js and ce.js
// some ui utility code is in ce3-ui-components.js
$(function() {
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
        Midwest: '<b>Changed seasonal patterns</b> may affect agricultural productivity.',
        Northeast: '<b>Changed seasonal patterns</b> may affect rural ecosystems, environments, and economies.',
        Southeast: '<b>Changed seasonal patterns</b> may affect public health and may lead to economic impacts through disruptions in agriculture and manufacturing.',
        NorthernGreatPlains: '<b>Changed seasonal patterns</b> may affect water management systems critical to the region.'
      }
    },
    dry_spells: {
      icon: 'drought',
      directions: ['fewer', 'more'],
      averageLabel: ({ average, dir }) => `An average of ${average} ${dir} <b>dry spell${average !== "1" ? "s" : ""}</b> — periods of consecutive days without precipitation — are projected per year.`,
      rangeLabel: ({ formatMoreFewer, min, max }) => `Between ${formatMoreFewer(min, max, "")} <b>dry spells</b> — periods of consecutive days without precipitation — are projected per year.`,
      historicAvgLabel: ({ historicAvg, location }) => `Historically, ${location} averaged ${historicAvg} dry spells per year.`,
      historicRangeLabel: ({ historicAvg, historicMin, historicMax, location }) => `Historically, ${location} averaged ${historicAvg} (${historicMin}&nbsp;-&nbsp;${historicMax}) dry spells per year.`
    },
    extreme_precip_events: {
      icon: 'rain-storm',
      directions: ['decrease', 'increase'],
      relative: true,
      averageLabel: ({ average, dir }) => `Annual counts of <b>intense rainstorms</b> – those that drop two or more inches in one day — are projected to ${dir} by ${average}%.`,
      rangeLabel: ({ formatIncreaseDecrease, min, max }) => `Annual counts of <b>intense rainstorms</b> — those that drop two or more inches in one day – are projected to ${formatIncreaseDecrease(min, max, "%")}.`,
      historicAvgLabel: ({ historicAvg, location }) => `Historically, ${location} averaged ${historicAvg} intense rainstorms per year.`,
      historicRangeLabel: ({ historicAvg, historicMin, historicMax, location }) => `Historically, ${location} averaged ${historicAvg} (${historicMin}&nbsp;-&nbsp;${historicMax}) intense rainstorms per year.`
    },
    max_consecutive_dry_days: {
      icon: 'wildfires',
      directions: ['decrease', 'increase'],
      averageLabel: ({ average, dir }) => `<b>Wildfire</b> risk may increase with longer periods between precipitation events, which are projected to ${dir} by ${average} days.`,
      rangeLabel: ({ formatIncreaseDecrease, min, max }) => `<b>Wildfire</b> risk may increase with longer periods between precipitation events, which are projected to ${formatIncreaseDecrease(min, max, [" day", " days"])}.`,
      historicAvgLabel: ({ historicAvg, location }) => `Historically, the longest yearly dry spell in ${location} averaged ${historicAvg} days.`,
      historicRangeLabel: ({ historicAvg, historicMin, historicMax, location }) => `Historically, the longest yearly dry spell in ${location} averaged ${historicAvg} (${historicMin}&nbsp;-&nbsp;${historicMax}) days.`
    },
    max_high_temp: {
      icon: 'extreme-hot-days',
      directions: ['decrease', 'increase'],
      averageLabel: ({average, dir}) => `<b>Extreme temperatures</b> on the hottest days of the year are projected to ${dir} by ${average}°F.`,
      rangeLabel: ({ formatIncreaseDecrease, min, max }) => `<b>Extreme temperatures</b> on the hottest days of the year are projected to ${formatIncreaseDecrease(min, max, "°F")}.`,
      historicAvgLabel: ({ historicAvg, location }) => `Historically, extreme temperatures in ${location} averaged ${historicAvg}°F.`,
      historicRangeLabel: ({ historicAvg, historicMin, historicMax, location }) => `Historically, extreme temperatures in ${location} averaged ${historicAvg}°F (${historicMin}&nbsp;-&nbsp;${historicMax}°F).`
    },
    ocean_acidification: {
      icon: 'ocean-acidification',
      label: {
        Northeast: '<b>Ocean warming and acidification</b> may affect commerce, tourism, and recreation.',
        Northwest: '<b>Ocean Acidification</b> may affect the natural resource economy, cultural heritage, built infrastructure, and recreation.',
        Southeast: '<b>Ocean warming and acidification</b> may contribute to coral reef mortality and decline.',
        Southwest: '<b>Ocean warming and acidification</b> may affect homes and other coastal infrastructure, marine flora and fauna, and people who depend on coastal resources.',
      }
    },
    saltwater_intrusion: {
      icon: 'salt-water-intrusion',
      label: {
        SouthernGreatPlains: '<b>Saltwater intrusion</b> into underground water supplies may occur as sea level rises in the Southern Great Plains of the United States'
      }
    },
    sea_level_rise: {
      icon: 'coastal-flood',
      label: {
        Northeast: 'Frequency of <b>coastal flooding</b> may increase as global sea level rises 0.5 - 2 feet, and relative sea level rise may be amplified in the Northeastern United States',
        Southeast: 'Frequency of <b>coastal flooding</b> may increase as global sea level rises 0.5 - 2 feet, and relative sea level rise may be amplified in the Southeastern United States',
        Southwest: 'Frequency of <b>coastal flooding</b> may increase as global sea level rises 0.5 - 2 feet',
        SouthernGreatPlains: 'Frequency of <b>coastal flooding</b> may increase as global sea level rises 0.5 - 2 feet'
      }
    }
  };
  const stateAbbrev = cityStateCE.substring(cityStateCE.length - 2);
  const location = cityStateCE.substring(0, cityStateCE.length - 4);
  const ncaRegion = stateNCARegions[stateAbbrev];
  const numFormat = new Intl.NumberFormat(undefined, {maximumFractionDigits: 0});
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
    $.get(topHazardsDataURLTemplate.replace(/{fips}/g, fips))
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
                formatIncreaseDecrease: formatIncreaseDecrease,
                formatMoreFewer: formatMoreFewer,
                average: numFormat.format(Math.abs(average)),
                historicAvg: numFormat.format(indicatorData.historic.average),
                historicMin: numFormat.format(indicatorData.historic.minimum),
                historicMax: numFormat.format(indicatorData.historic.maximum),
                directions: indicators[id].directions,
                dir: indicators[id].directions[average < 0 ? 0 : 1],
                location: location,
                min: min,
                max: max
              };
              content = `
                    <div>
                        <span class="indicator-avg">
                            ${indicators[id].averageLabel(context)}
                        </span>
                        <span class="indicator-range">
                            ${indicators[id].rangeLabel(context)}
                        </span>
                        <div class="indicator-historic historic-avg">
                            ${indicators[id].historicAvgLabel(context)}
                        </div>
                        <div class="indicator-historic historic-range">
                            ${indicators[id].historicRangeLabel(context)}
                        </div>
                    </div>
                    `;
            }
            return `<div><img src="/resources/img/hazards/${indicators[id].icon}.svg" alt="">${content}</div>`
          }).join('')}
        `);

          $(".next-steps-temperate .help-text").html(`
            Top regional hazards for ${cityStateCE}, according to the <a href="https://nca2018.globalchange.gov/">2018 National Climate Assessment.</a> These statements compare projections for the middle third of this century (2035-2064) with average conditions observed from 1961-1990.
        `)

          tippy($(".next-steps-temperate .methodology-link")[0], {
            theme: 'ce-three-main',
            allowHTML: true,
            content: `
              <div style="padding: 10px">
                  <p>The Top Hazards displays some potential future climate hazards for the selected location, based on the geographic regions and findings included in the 2018 National Climate Assessment.</p>
                  <p>Each Top Hazard is backed by one of the Climate indicators available in the <a href=\"http://www.rcc-acis.org/\" target=\"_blank\">Applied Climate Information System</a> (ACIS) Web Services. To calculate the value shown, we take the difference of the average value between two 30-year periods: 1961–1990 and 2035–2064. For each 30-year period, the value is calculated using a weighted average of all available models across the entire period, which is then averaged for each grid cell in the LOCA dataset within the selected county.</p>
              </div>`,
            arrow: false,
            trigger: "click",
            animateFill: false,
            interactive: true,
            hideOnClick: true,
            flipOnUpdate: false,
            offset: "1,0"
          });
          $(".next-steps-temperate .card-controls").show();
          $(".next-steps-temperate .card-controls input").lc_switch('', '');
          toggleRange();
        })
        .fail(() => {
          $('.next-steps-temperate').addClass('card-disabled');
        });
  }

  // adds clear location when x is clicked next to location search
  $('#clear-location').click(function (e) {
    const target = $(e.target);
    handleClearLocationClick(target);
  });

  $('#temperate-show-range').on('lcs-statuschange', toggleRange);

  function formatIncreaseDecrease(minNum, maxNum, suffix) {
    const min = numFormat.format(Math.abs(minNum));
    const max = numFormat.format(Math.abs(maxNum));
    const [rangeSuffix, singularSuffix] = Array.isArray(suffix) ? suffix : [suffix, suffix];
    if (numFormat.format(minNum) === numFormat.format(maxNum)) {
      return `be ${min}${singularSuffix}`;
    }
    if (minNum < 0 && maxNum > 0) {
      return `have between a ${min}${rangeSuffix} decrease and a ${max}${rangeSuffix} increase`;
    }
    const direction = maxNum < 0 ? "decrease" : "increase";
    return `${direction} between ${min}&nbsp;-&nbsp;${max}${singularSuffix}`;
  }

  function formatMoreFewer(minNum, maxNum, suffix) {
    const min = numFormat.format(Math.abs(minNum));
    const max = numFormat.format(Math.abs(maxNum));
    if (numFormat.format(minNum) === numFormat.format(maxNum)) {
      return min + suffix;
    }
    if (minNum < 0 && maxNum > 0) {
      return `${min + suffix} fewer and ${max}${suffix} more`;
    }
    const direction = maxNum < 0 ? "fewer" : "more";
    return `${min}&nbsp;-&nbsp;${max}${suffix} ${direction}`;
  }

  function toggleRange() {
    const showRange = $('#temperate-show-range').is(':checked');
    $('.indicator-range,.historic-range').toggle(showRange);
    $('.indicator-avg,.historic-avg').toggle(!showRange);
  }
});
