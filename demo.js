var cwg = undefined;

$(document).ready(function () {

  function populate_variables(frequency) {
    var variables = climate_widget.variables(frequency);
    $("select#variable").empty();
    $(variables.map(function (v) {
      return ('<option value="' + v.id + '"' + '>' + v.title + '</option>');
    }).join("")).appendTo($("select#variable"));

  }

  function initGraph() {
    cwg = climate_widget.graph({
      'div': "div#widget",
      'dataprefix': 'http://climate-widget-data.nemac.org/data',
      'font': 'Roboto',
      'frequency': $('#frequency').val(),
      'timeperiod': $('#timeperiod').val(),
      'presentation': $('#presentation').val(),
      'county': $('#county').val(),
      'state': $('#state').val(),
      'variable': $('#variable').val(),
      'scenario': $('#scenario').val(),
      'xrangefunc': xrangeset,
      'pmedian': true,
      'hmedian': true
    });
    $('#county').off().change(function () {
      cwg.update({
        county: $('#county').val()
      });
    });
    $(window).resize(function () {
      cwg.resize();
    });
  }

  $('#county').change(initGraph);

  $("#countysearch").autocomplete({
    source: states.concat(newcounties),
    select: function (event, ui) {
      if (ui.item.value.length === 2){
        $('#state option[value="' + ui.item.value + '"]').prop('selected', 'selected');

        var stateCounties = counties[ui.item.value];
        var $el = $("#county");
        $el.empty();
        $el.append($('<option value="" selected></option>'));
        stateCounties.forEach(function (sc) {
          $el.append($("<option></option>")
            .attr("value", sc.fips)
            .text(sc.label))
        });
      }
      else {
        $('#state option[value="' + ui.item.label.slice(-2) + '"]').prop('selected', 'selected');
        var stateCounties = counties[ui.item.label.slice(-2)];
        var $el = $("#county");
        $el.empty();
        $el.append($('<option value=""></option>'));
        stateCounties.forEach(function (sc) {
          $el.append($("<option></option>")
            .attr("value", sc.fips)
            .text(sc.label))
        });
        $('#county option[value="' + ui.item.value + '"]').prop('selected', 'selected');
      }
      initGraph();
    }
  });

  $('#state').change(function () {
    if ($('#state').val() === '') {
      return;
    }

    if (!cwg) {
      initGraph();
    } else {
      cwg.update({
        state: $('#state').val()
      });
    }
    var stateCounties = counties[$('#state').val()];

    var $el = $("#county");
    $el.empty();
    $el.append($('<option value=""  selected></option>'));
    stateCounties.forEach(function (sc) {
      $el.append($("<option></option>")
        .attr("value", sc.fips).text(sc.label));
    });
  });

  function update_frequency_ui() {
    var freq = $('#frequency').val();
    if (freq === "annual") {
      $('#timeperiod-wrapper').hide();
      $('#slider-range').show();
      $('#x-axis-pan-note').hide();
      $('#download_hist_mod_data_li').show();
      $('#presentation-wrapper').show();
    }
    if (freq === "monthly") {
      $('#timeperiod-wrapper').show();
      $('#slider-range').hide();
      $('#x-axis-pan-note').show();
      $('#download_hist_mod_data_li').hide();
      $('#presentation-wrapper').hide();
    }
    if (freq === "seasonal") {
      $('#timeperiod-wrapper').show();
      $('#slider-range').hide();
      $('#x-axis-pan-note').show();
      $('#download_hist_mod_data_li').hide();
      $('#presentation-wrapper').hide();
    }
    populate_variables(freq);
  }

  update_frequency_ui();


  $('#frequency').change(function () {

    update_frequency_ui();
    if (cwg) {
      cwg.update({
        frequency: $('#frequency').val(),
        variable: $('#variable').val()
      });
    }
  });

  $('#presentation').change(function () {
    if (cwg) {
      cwg.update({presentation: $('#presentation').val()});
    }
  });


  $('#timeperiod').change(function () {
    if (cwg) {
      cwg.update({
        timeperiod: $('#timeperiod').val()
      });
    }
  });

  $('#variable').change(function () {
    if (cwg) {
      cwg.update({
        variable: $('#variable').val()
      });
    }
  });
  $('#rcp85, #rcp45').change(function () {
    if (cwg) {
      var scenario;
      if ($('#rcp85').prop('checked')) {
        if ($('#rcp45').prop('checked')) {
          scenario = 'both';
        } else {
          scenario = 'rcp85';
        }
      } else if ($('#rcp45').prop('checked')) {
        scenario = 'rcp45';
      }
      else {
        scenario = '';
      }
      cwg.update({
        scenario: scenario
      });
    }
  });
  $('#download-button').click(function () {
    if (cwg) {
      $('#download-panel').removeClass("hidden");
    }
  });

  $('#download-dismiss-button').click(function () {
    $('#download-panel').addClass("hidden");
  });

  // download hooks
  $('#download-image-link').click(function () {
    if (cwg) {
      cwg.download_image(this)
    }
  });
  $('#download_hist_obs_data').click(function () {
    if (cwg) {
      cwg.download_hist_obs_data(this)
    }
  });
  $('#download_hist_mod_data').click(function () {
    if (cwg) {
      cwg.download_hist_mod_data(this)
    }
  });
  $('#download_proj_mod_data').click(function () {
    if (cwg) {
      cwg.download_proj_mod_data(this)
    }
  });


  $("#slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function (event, ui) {
      // return the return value returned by setXRange, to keep
      // the slider thumb(s) from moving into a disallowed range
      return cwg.setXRange(ui.values[0], ui.values[1]);
    }
  });

  // This function will be called whenever the user changes the x-scale in the graph.
  function xrangeset(min, max) {
    // Force the slider thumbs to adjust to the appropriate place
    $("#slider-range").slider("option", "values", [min, max]);
  }

  WebFont.load({
    google: {
      families: ['Pacifico', 'Roboto']
    }
  });


});

var states = [
  {'label': "Alabama", "value": "AL"},
  {'label': "Alaska", "value": "AK"},
  {'label': "Arizona", "value": "AZ"},
  {'label': "Arkansas", "value": "AR"},
  {'label': "California", "value": "CA"},
  {'label': "Colorado", "value": "CO"},
  {'label': "Connecticut", "value": "CT"},
  {'label': "Delaware", "value": "DE"},
  {'label': "District of Columbia", "value": "DC"},
  {'label': "Florida", "value": "FL"},
  {'label': "Georgia", "value": "GA"},
  {'label': "Hawaii", "value": "HI"},
  {'label': "Idaho", "value": "ID"},
  {'label': "Illinois", "value": "IL"},
  {'label': "Indiana", "value": "IN"},
  {'label': "Iowa", "value": "IA"},
  {'label': "Kansas", "value": "KS"},
  {'label': "Kentucky", "value": "KY"},
  {'label': "Louisiana", "value": "LA"},
  {'label': "Maine", "value": "ME"},
  {'label': "Montana", "value": "MT"},
  {'label': "Nebraska", "value": "NE"},
  {'label': "Nevada", "value": "NV"},
  {'label': "New Hampshire", "value": "NH"},
  {'label': "New Jersey", "value": "NJ"},
  {'label': "New Mexico", "value": "NM"},
  {'label': "New York", "value": "NY"},
  {'label': "North Carolina", "value": "NC"},
  {'label': "North Dakota", "value": "ND"},
  {'label': "Ohio", "value": "OH"},
  {'label': "Oklahoma", "value": "OK"},
  {'label': "Oregon", "value": "OR"},
  {'label': "Maryland", "value": "MD"},
  {'label': "Massachusetts", "value": "MA"},
  {'label': "Michigan", "value": "MI"},
  {'label': "Minnesota", "value": "MN"},
  {'label': "Mississippi", "value": "MS"},
  {'label': "Missouri", "value": "MO"},
  {'label': "Pennsylvania", "value": "PA"},
  {'label': "Rhode Island", "value": "RI"},
  {'label': "South Carolina", "value": "SC"},
  {'label': "South Dakota", "value": "SD"},
  {'label': "Tennessee", "value": "TN"},
  {'label': "Texas", "value": "TX"},
  {'label': "Utah", "value": "UT"},
  {'label': "Vermont", "value": "VT"},
  {'label': "Virginia", "value": "VA"},
  {'label': "Washington", "value": "WA"},
  {'label': "West Virginia", "value": "WV"},
  {'label': "Wisconsin", "value": "WI"},
  {'label': "Wyoming", "value": "WY"},


  {'label': "AL", "value": "AL"},
  {'label': "AK", "value": "AK"},
  {'label': "AZ", "value": "AZ"},
  {'label': "AR", "value": "AR"},
  {'label': "CA", "value": "CA"},
  {'label': "CO", "value": "CO"},
  {'label': "CT", "value": "CT"},
  {'label': "DE", "value": "DE"},
  {'label': "DC", "value": "DC"},
  {'label': "FL", "value": "FL"},
  {'label': "GA", "value": "GA"},
  {'label': "HI", "value": "HI"},
  {'label': "ID", "value": "ID"},
  {'label': "IL", "value": "IL"},
  {'label': "IN", "value": "IN"},
  {'label': "IA", "value": "IA"},
  {'label': "KS", "value": "KS"},
  {'label': "KY", "value": "KY"},
  {'label': "LA", "value": "LA"},
  {'label': "ME", "value": "ME"},
  {'label': "MT", "value": "MT"},
  {'label': "NE", "value": "NE"},
  {'label': "NV", "value": "NV"},
  {'label': "NH", "value": "NH"},
  {'label': "NJ", "value": "NJ"},
  {'label': "NM", "value": "NM"},
  {'label': "NY", "value": "NY"},
  {'label': "NC", "value": "NC"},
  {'label': "ND", "value": "ND"},
  {'label': "OH", "value": "OH"},
  {'label': "OK", "value": "OK"},
  {'label': "OR", "value": "OR"},
  {'label': "MD", "value": "MD"},
  {'label': "MA", "value": "MA"},
  {'label': "MI", "value": "MI"},
  {'label': "MN", "value": "MN"},
  {'label': "MS", "value": "MS"},
  {'label': "MO", "value": "MO"},
  {'label': "PA", "value": "PA"},
  {'label': "RI", "value": "RI"},
  {'label': "SC", "value": "SC"},
  {'label': "SD", "value": "SD"},
  {'label': "TN", "value": "TN"},
  {'label': "TX", "value": "TX"},
  {'label': "UT", "value": "UT"},
  {'label': "VT", "value": "VT"},
  {'label': "VA", "value": "VA"},
  {'label': "WA", "value": "WA"},
  {'label': "WV", "value": "WV"},
  {'label': "WI", "value": "WI"},
  {'label': "WY", "value": "WY"}
  
];
//--------------------------------------------------------------------------
var counties = {
  "AL": [
    {
      "label": "Autauga County",
      "fips": "01001"
    },
    {
      "label": "Baldwin County",
      "fips": "01003"
    },
    {
      "label": "Barbour County",
      "fips": "01005"
    },
    {
      "label": "Bibb County",
      "fips": "01007"
    },
    {
      "label": "Blount County",
      "fips": "01009"
    },
    {
      "label": "Bullock County",
      "fips": "01011"
    },
    {
      "label": "Butler County",
      "fips": "01013"
    },
    {
      "label": "Calhoun County",
      "fips": "01015"
    },
    {
      "label": "Chambers County",
      "fips": "01017"
    },
    {
      "label": "Cherokee County",
      "fips": "01019"
    },
    {
      "label": "Chilton County",
      "fips": "01021"
    },
    {
      "label": "Choctaw County",
      "fips": "01023"
    },
    {
      "label": "Clarke County",
      "fips": "01025"
    },
    {
      "label": "Clay County",
      "fips": "01027"
    },
    {
      "label": "Cleburne County",
      "fips": "01029"
    },
    {
      "label": "Coffee County",
      "fips": "01031"
    },
    {
      "label": "Colbert County",
      "fips": "01033"
    },
    {
      "label": "Conecuh County",
      "fips": "01035"
    },
    {
      "label": "Coosa County",
      "fips": "01037"
    },
    {
      "label": "Covington County",
      "fips": "01039"
    },
    {
      "label": "Crenshaw County",
      "fips": "01041"
    },
    {
      "label": "Cullman County",
      "fips": "01043"
    },
    {
      "label": "Dale County",
      "fips": "01045"
    },
    {
      "label": "Dallas County",
      "fips": "01047"
    },
    {
      "label": "DeKalb County",
      "fips": "01049"
    },
    {
      "label": "Elmore County",
      "fips": "01051"
    },
    {
      "label": "Escambia County",
      "fips": "01053"
    },
    {
      "label": "Etowah County",
      "fips": "01055"
    },
    {
      "label": "Fayette County",
      "fips": "01057"
    },
    {
      "label": "Franklin County",
      "fips": "01059"
    },
    {
      "label": "Geneva County",
      "fips": "01061"
    },
    {
      "label": "Greene County",
      "fips": "01063"
    },
    {
      "label": "Hale County",
      "fips": "01065"
    },
    {
      "label": "Henry County",
      "fips": "01067"
    },
    {
      "label": "Houston County",
      "fips": "01069"
    },
    {
      "label": "Jackson County",
      "fips": "01071"
    },
    {
      "label": "Jefferson County",
      "fips": "01073"
    },
    {
      "label": "Lamar County",
      "fips": "01075"
    },
    {
      "label": "Lauderdale County",
      "fips": "01077"
    },
    {
      "label": "Lawrence County",
      "fips": "01079"
    },
    {
      "label": "Lee County",
      "fips": "01081"
    },
    {
      "label": "Limestone County",
      "fips": "01083"
    },
    {
      "label": "Lowndes County",
      "fips": "01085"
    },
    {
      "label": "Macon County",
      "fips": "01087"
    },
    {
      "label": "Madison County",
      "fips": "01089"
    },
    {
      "label": "Marengo County",
      "fips": "01091"
    },
    {
      "label": "Marion County",
      "fips": "01093"
    },
    {
      "label": "Marshall County",
      "fips": "01095"
    },
    {
      "label": "Mobile County",
      "fips": "01097"
    },
    {
      "label": "Monroe County",
      "fips": "01099"
    },
    {
      "label": "Montgomery County",
      "fips": "01101"
    },
    {
      "label": "Morgan County",
      "fips": "01103"
    },
    {
      "label": "Perry County",
      "fips": "01105"
    },
    {
      "label": "Pickens County",
      "fips": "01107"
    },
    {
      "label": "Pike County",
      "fips": "01109"
    },
    {
      "label": "Randolph County",
      "fips": "01111"
    },
    {
      "label": "Russell County",
      "fips": "01113"
    },
    {
      "label": "St. Clair County",
      "fips": "01115"
    },
    {
      "label": "Shelby County",
      "fips": "01117"
    },
    {
      "label": "Sumter County",
      "fips": "01119"
    },
    {
      "label": "Talladega County",
      "fips": "01121"
    },
    {
      "label": "Tallapoosa County",
      "fips": "01123"
    },
    {
      "label": "Tuscaloosa County",
      "fips": "01125"
    },
    {
      "label": "Walker County",
      "fips": "01127"
    },
    {
      "label": "Washington County",
      "fips": "01129"
    },
    {
      "label": "Wilcox County",
      "fips": "01131"
    },
    {
      "label": "Winston County",
      "fips": "01133"
    }
  ],
  "AZ": [
    {
      "label": "Apache County",
      "fips": "04001"
    },
    {
      "label": "Cochise County",
      "fips": "04003"
    },
    {
      "label": "Coconino County",
      "fips": "04005"
    },
    {
      "label": "Gila County",
      "fips": "04007"
    },
    {
      "label": "Graham County",
      "fips": "04009"
    },
    {
      "label": "Greenlee County",
      "fips": "04011"
    },
    {
      "label": "La Paz County",
      "fips": "04012"
    },
    {
      "label": "Maricopa County",
      "fips": "04013"
    },
    {
      "label": "Mohave County",
      "fips": "04015"
    },
    {
      "label": "Navajo County",
      "fips": "04017"
    },
    {
      "label": "Pima County",
      "fips": "04019"
    },
    {
      "label": "Pinal County",
      "fips": "04021"
    },
    {
      "label": "Santa Cruz County",
      "fips": "04023"
    },
    {
      "label": "Yavapai County",
      "fips": "04025"
    },
    {
      "label": "Yuma County",
      "fips": "04027"
    }
  ],
  "AR": [
    {
      "label": "Arkansas County",
      "fips": "05001"
    },
    {
      "label": "Ashley County",
      "fips": "05003"
    },
    {
      "label": "Baxter County",
      "fips": "05005"
    },
    {
      "label": "Benton County",
      "fips": "05007"
    },
    {
      "label": "Boone County",
      "fips": "05009"
    },
    {
      "label": "Bradley County",
      "fips": "05011"
    },
    {
      "label": "Calhoun County",
      "fips": "05013"
    },
    {
      "label": "Carroll County",
      "fips": "05015"
    },
    {
      "label": "Chicot County",
      "fips": "05017"
    },
    {
      "label": "Clark County",
      "fips": "05019"
    },
    {
      "label": "Clay County",
      "fips": "05021"
    },
    {
      "label": "Cleburne County",
      "fips": "05023"
    },
    {
      "label": "Cleveland County",
      "fips": "05025"
    },
    {
      "label": "Columbia County",
      "fips": "05027"
    },
    {
      "label": "Conway County",
      "fips": "05029"
    },
    {
      "label": "Craighead County",
      "fips": "05031"
    },
    {
      "label": "Crawford County",
      "fips": "05033"
    },
    {
      "label": "Crittenden County",
      "fips": "05035"
    },
    {
      "label": "Cross County",
      "fips": "05037"
    },
    {
      "label": "Dallas County",
      "fips": "05039"
    },
    {
      "label": "Desha County",
      "fips": "05041"
    },
    {
      "label": "Drew County",
      "fips": "05043"
    },
    {
      "label": "Faulkner County",
      "fips": "05045"
    },
    {
      "label": "Franklin County",
      "fips": "05047"
    },
    {
      "label": "Fulton County",
      "fips": "05049"
    },
    {
      "label": "Garland County",
      "fips": "05051"
    },
    {
      "label": "Grant County",
      "fips": "05053"
    },
    {
      "label": "Greene County",
      "fips": "05055"
    },
    {
      "label": "Hempstead County",
      "fips": "05057"
    },
    {
      "label": "Hot Spring County",
      "fips": "05059"
    },
    {
      "label": "Howard County",
      "fips": "05061"
    },
    {
      "label": "Independence County",
      "fips": "05063"
    },
    {
      "label": "Izard County",
      "fips": "05065"
    },
    {
      "label": "Jackson County",
      "fips": "05067"
    },
    {
      "label": "Jefferson County",
      "fips": "05069"
    },
    {
      "label": "Johnson County",
      "fips": "05071"
    },
    {
      "label": "Lafayette County",
      "fips": "05073"
    },
    {
      "label": "Lawrence County",
      "fips": "05075"
    },
    {
      "label": "Lee County",
      "fips": "05077"
    },
    {
      "label": "Lincoln County",
      "fips": "05079"
    },
    {
      "label": "Little River County",
      "fips": "05081"
    },
    {
      "label": "Logan County",
      "fips": "05083"
    },
    {
      "label": "Lonoke County",
      "fips": "05085"
    },
    {
      "label": "Madison County",
      "fips": "05087"
    },
    {
      "label": "Marion County",
      "fips": "05089"
    },
    {
      "label": "Miller County",
      "fips": "05091"
    },
    {
      "label": "Mississippi County",
      "fips": "05093"
    },
    {
      "label": "Monroe County",
      "fips": "05095"
    },
    {
      "label": "Montgomery County",
      "fips": "05097"
    },
    {
      "label": "Nevada County",
      "fips": "05099"
    },
    {
      "label": "Newton County",
      "fips": "05101"
    },
    {
      "label": "Ouachita County",
      "fips": "05103"
    },
    {
      "label": "Perry County",
      "fips": "05105"
    },
    {
      "label": "Phillips County",
      "fips": "05107"
    },
    {
      "label": "Pike County",
      "fips": "05109"
    },
    {
      "label": "Poinsett County",
      "fips": "05111"
    },
    {
      "label": "Polk County",
      "fips": "05113"
    },
    {
      "label": "Pope County",
      "fips": "05115"
    },
    {
      "label": "Prairie County",
      "fips": "05117"
    },
    {
      "label": "Pulaski County",
      "fips": "05119"
    },
    {
      "label": "Randolph County",
      "fips": "05121"
    },
    {
      "label": "St. Francis County",
      "fips": "05123"
    },
    {
      "label": "Saline County",
      "fips": "05125"
    },
    {
      "label": "Scott County",
      "fips": "05127"
    },
    {
      "label": "Searcy County",
      "fips": "05129"
    },
    {
      "label": "Sebastian County",
      "fips": "05131"
    },
    {
      "label": "Sevier County",
      "fips": "05133"
    },
    {
      "label": "Sharp County",
      "fips": "05135"
    },
    {
      "label": "Stone County",
      "fips": "05137"
    },
    {
      "label": "Union County",
      "fips": "05139"
    },
    {
      "label": "Van Buren County",
      "fips": "05141"
    },
    {
      "label": "Washington County",
      "fips": "05143"
    },
    {
      "label": "White County",
      "fips": "05145"
    },
    {
      "label": "Woodruff County",
      "fips": "05147"
    },
    {
      "label": "Yell County",
      "fips": "05149"
    }
  ],
  "CA": [
    {
      "label": "Alameda County",
      "fips": "06001"
    },
    {
      "label": "Alpine County",
      "fips": "06003"
    },
    {
      "label": "Amador County",
      "fips": "06005"
    },
    {
      "label": "Butte County",
      "fips": "06007"
    },
    {
      "label": "Calaveras County",
      "fips": "06009"
    },
    {
      "label": "Colusa County",
      "fips": "06011"
    },
    {
      "label": "Contra Costa County",
      "fips": "06013"
    },
    {
      "label": "Del Norte County",
      "fips": "06015"
    },
    {
      "label": "El Dorado County",
      "fips": "06017"
    },
    {
      "label": "Fresno County",
      "fips": "06019"
    },
    {
      "label": "Glenn County",
      "fips": "06021"
    },
    {
      "label": "Humboldt County",
      "fips": "06023"
    },
    {
      "label": "Imperial County",
      "fips": "06025"
    },
    {
      "label": "Inyo County",
      "fips": "06027"
    },
    {
      "label": "Kern County",
      "fips": "06029"
    },
    {
      "label": "Kings County",
      "fips": "06031"
    },
    {
      "label": "Lake County",
      "fips": "06033"
    },
    {
      "label": "Lassen County",
      "fips": "06035"
    },
    {
      "label": "Los Angeles County",
      "fips": "06037"
    },
    {
      "label": "Madera County",
      "fips": "06039"
    },
    {
      "label": "Marin County",
      "fips": "06041"
    },
    {
      "label": "Mariposa County",
      "fips": "06043"
    },
    {
      "label": "Mendocino County",
      "fips": "06045"
    },
    {
      "label": "Merced County",
      "fips": "06047"
    },
    {
      "label": "Modoc County",
      "fips": "06049"
    },
    {
      "label": "Mono County",
      "fips": "06051"
    },
    {
      "label": "Monterey County",
      "fips": "06053"
    },
    {
      "label": "Napa County",
      "fips": "06055"
    },
    {
      "label": "Nevada County",
      "fips": "06057"
    },
    {
      "label": "Orange County",
      "fips": "06059"
    },
    {
      "label": "Placer County",
      "fips": "06061"
    },
    {
      "label": "Plumas County",
      "fips": "06063"
    },
    {
      "label": "Riverside County",
      "fips": "06065"
    },
    {
      "label": "Sacramento County",
      "fips": "06067"
    },
    {
      "label": "San Benito County",
      "fips": "06069"
    },
    {
      "label": "San Bernardino County",
      "fips": "06071"
    },
    {
      "label": "San Diego County",
      "fips": "06073"
    },
    {
      "label": "San Francisco County",
      "fips": "06075"
    },
    {
      "label": "San Joaquin County",
      "fips": "06077"
    },
    {
      "label": "San Luis Obispo County",
      "fips": "06079"
    },
    {
      "label": "San Mateo County",
      "fips": "06081"
    },
    {
      "label": "Santa Barbara County",
      "fips": "06083"
    },
    {
      "label": "Santa Clara County",
      "fips": "06085"
    },
    {
      "label": "Santa Cruz County",
      "fips": "06087"
    },
    {
      "label": "Shasta County",
      "fips": "06089"
    },
    {
      "label": "Sierra County",
      "fips": "06091"
    },
    {
      "label": "Siskiyou County",
      "fips": "06093"
    },
    {
      "label": "Solano County",
      "fips": "06095"
    },
    {
      "label": "Sonoma County",
      "fips": "06097"
    },
    {
      "label": "Stanislaus County",
      "fips": "06099"
    },
    {
      "label": "Sutter County",
      "fips": "06101"
    },
    {
      "label": "Tehama County",
      "fips": "06103"
    },
    {
      "label": "Trinity County",
      "fips": "06105"
    },
    {
      "label": "Tulare County",
      "fips": "06107"
    },
    {
      "label": "Tuolumne County",
      "fips": "06109"
    },
    {
      "label": "Ventura County",
      "fips": "06111"
    },
    {
      "label": "Yolo County",
      "fips": "06113"
    },
    {
      "label": "Yuba County",
      "fips": "06115"
    }
  ],
  "CO": [
    {
      "label": "Adams County",
      "fips": "08001"
    },
    {
      "label": "Alamosa County",
      "fips": "08003"
    },
    {
      "label": "Arapahoe County",
      "fips": "08005"
    },
    {
      "label": "Archuleta County",
      "fips": "08007"
    },
    {
      "label": "Baca County",
      "fips": "08009"
    },
    {
      "label": "Bent County",
      "fips": "08011"
    },
    {
      "label": "Boulder County",
      "fips": "08013"
    },
    {
      "label": "Broomfield County",
      "fips": "08014"
    },
    {
      "label": "Chaffee County",
      "fips": "08015"
    },
    {
      "label": "Cheyenne County",
      "fips": "08017"
    },
    {
      "label": "Clear Creek County",
      "fips": "08019"
    },
    {
      "label": "Conejos County",
      "fips": "08021"
    },
    {
      "label": "Costilla County",
      "fips": "08023"
    },
    {
      "label": "Crowley County",
      "fips": "08025"
    },
    {
      "label": "Custer County",
      "fips": "08027"
    },
    {
      "label": "Delta County",
      "fips": "08029"
    },
    {
      "label": "Denver County",
      "fips": "08031"
    },
    {
      "label": "Dolores County",
      "fips": "08033"
    },
    {
      "label": "Douglas County",
      "fips": "08035"
    },
    {
      "label": "Eagle County",
      "fips": "08037"
    },
    {
      "label": "Elbert County",
      "fips": "08039"
    },
    {
      "label": "El Paso County",
      "fips": "08041"
    },
    {
      "label": "Fremont County",
      "fips": "08043"
    },
    {
      "label": "Garfield County",
      "fips": "08045"
    },
    {
      "label": "Gilpin County",
      "fips": "08047"
    },
    {
      "label": "Grand County",
      "fips": "08049"
    },
    {
      "label": "Gunnison County",
      "fips": "08051"
    },
    {
      "label": "Hinsdale County",
      "fips": "08053"
    },
    {
      "label": "Huerfano County",
      "fips": "08055"
    },
    {
      "label": "Jackson County",
      "fips": "08057"
    },
    {
      "label": "Jefferson County",
      "fips": "08059"
    },
    {
      "label": "Kiowa County",
      "fips": "08061"
    },
    {
      "label": "Kit Carson County",
      "fips": "08063"
    },
    {
      "label": "Lake County",
      "fips": "08065"
    },
    {
      "label": "La Plata County",
      "fips": "08067"
    },
    {
      "label": "Larimer County",
      "fips": "08069"
    },
    {
      "label": "Las Animas County",
      "fips": "08071"
    },
    {
      "label": "Lincoln County",
      "fips": "08073"
    },
    {
      "label": "Logan County",
      "fips": "08075"
    },
    {
      "label": "Mesa County",
      "fips": "08077"
    },
    {
      "label": "Mineral County",
      "fips": "08079"
    },
    {
      "label": "Moffat County",
      "fips": "08081"
    },
    {
      "label": "Montezuma County",
      "fips": "08083"
    },
    {
      "label": "Montrose County",
      "fips": "08085"
    },
    {
      "label": "Morgan County",
      "fips": "08087"
    },
    {
      "label": "Otero County",
      "fips": "08089"
    },
    {
      "label": "Ouray County",
      "fips": "08091"
    },
    {
      "label": "Park County",
      "fips": "08093"
    },
    {
      "label": "Phillips County",
      "fips": "08095"
    },
    {
      "label": "Pitkin County",
      "fips": "08097"
    },
    {
      "label": "Prowers County",
      "fips": "08099"
    },
    {
      "label": "Pueblo County",
      "fips": "08101"
    },
    {
      "label": "Rio Blanco County",
      "fips": "08103"
    },
    {
      "label": "Rio Grande County",
      "fips": "08105"
    },
    {
      "label": "Routt County",
      "fips": "08107"
    },
    {
      "label": "Saguache County",
      "fips": "08109"
    },
    {
      "label": "San Juan County",
      "fips": "08111"
    },
    {
      "label": "San Miguel County",
      "fips": "08113"
    },
    {
      "label": "Sedgwick County",
      "fips": "08115"
    },
    {
      "label": "Summit County",
      "fips": "08117"
    },
    {
      "label": "Teller County",
      "fips": "08119"
    },
    {
      "label": "Washington County",
      "fips": "08121"
    },
    {
      "label": "Weld County",
      "fips": "08123"
    },
    {
      "label": "Yuma County",
      "fips": "08125"
    }
  ],
  "CT": [
    {
      "label": "Fairfield County",
      "fips": "09001"
    },
    {
      "label": "Hartford County",
      "fips": "09003"
    },
    {
      "label": "Litchfield County",
      "fips": "09005"
    },
    {
      "label": "Middlesex County",
      "fips": "09007"
    },
    {
      "label": "New Haven County",
      "fips": "09009"
    },
    {
      "label": "New London County",
      "fips": "09011"
    },
    {
      "label": "Tolland County",
      "fips": "09013"
    },
    {
      "label": "Windham County",
      "fips": "09015"
    }
  ],
  "DE": [
    {
      "label": "Kent County",
      "fips": "10001"
    },
    {
      "label": "New Castle County",
      "fips": "10003"
    },
    {
      "label": "Sussex County",
      "fips": "10005"
    }
  ],
  "DC": [
    {
      "label": "District of Columbia",
      "fips": "11001"
    }
  ],
  "FL": [
    {
      "label": "Alachua County",
      "fips": "12001"
    },
    {
      "label": "Baker County",
      "fips": "12003"
    },
    {
      "label": "Bay County",
      "fips": "12005"
    },
    {
      "label": "Bradford County",
      "fips": "12007"
    },
    {
      "label": "Brevard County",
      "fips": "12009"
    },
    {
      "label": "Broward County",
      "fips": "12011"
    },
    {
      "label": "Calhoun County",
      "fips": "12013"
    },
    {
      "label": "Charlotte County",
      "fips": "12015"
    },
    {
      "label": "Citrus County",
      "fips": "12017"
    },
    {
      "label": "Clay County",
      "fips": "12019"
    },
    {
      "label": "Collier County",
      "fips": "12021"
    },
    {
      "label": "Columbia County",
      "fips": "12023"
    },
    {
      "label": "DeSoto County",
      "fips": "12027"
    },
    {
      "label": "Dixie County",
      "fips": "12029"
    },
    {
      "label": "Duval County",
      "fips": "12031"
    },
    {
      "label": "Escambia County",
      "fips": "12033"
    },
    {
      "label": "Flagler County",
      "fips": "12035"
    },
    {
      "label": "Franklin County",
      "fips": "12037"
    },
    {
      "label": "Gadsden County",
      "fips": "12039"
    },
    {
      "label": "Gilchrist County",
      "fips": "12041"
    },
    {
      "label": "Glades County",
      "fips": "12043"
    },
    {
      "label": "Gulf County",
      "fips": "12045"
    },
    {
      "label": "Hamilton County",
      "fips": "12047"
    },
    {
      "label": "Hardee County",
      "fips": "12049"
    },
    {
      "label": "Hendry County",
      "fips": "12051"
    },
    {
      "label": "Hernando County",
      "fips": "12053"
    },
    {
      "label": "Highlands County",
      "fips": "12055"
    },
    {
      "label": "Hillsborough County",
      "fips": "12057"
    },
    {
      "label": "Holmes County",
      "fips": "12059"
    },
    {
      "label": "Indian River County",
      "fips": "12061"
    },
    {
      "label": "Jackson County",
      "fips": "12063"
    },
    {
      "label": "Jefferson County",
      "fips": "12065"
    },
    {
      "label": "Lafayette County",
      "fips": "12067"
    },
    {
      "label": "Lake County",
      "fips": "12069"
    },
    {
      "label": "Lee County",
      "fips": "12071"
    },
    {
      "label": "Leon County",
      "fips": "12073"
    },
    {
      "label": "Levy County",
      "fips": "12075"
    },
    {
      "label": "Liberty County",
      "fips": "12077"
    },
    {
      "label": "Madison County",
      "fips": "12079"
    },
    {
      "label": "Manatee County",
      "fips": "12081"
    },
    {
      "label": "Marion County",
      "fips": "12083"
    },
    {
      "label": "Martin County",
      "fips": "12085"
    },
    {
      "label": "Miami-Dade County",
      "fips": "12086"
    },
    {
      "label": "Monroe County",
      "fips": "12087"
    },
    {
      "label": "Nassau County",
      "fips": "12089"
    },
    {
      "label": "Okaloosa County",
      "fips": "12091"
    },
    {
      "label": "Okeechobee County",
      "fips": "12093"
    },
    {
      "label": "Orange County",
      "fips": "12095"
    },
    {
      "label": "Osceola County",
      "fips": "12097"
    },
    {
      "label": "Palm Beach County",
      "fips": "12099"
    },
    {
      "label": "Pasco County",
      "fips": "12101"
    },
    {
      "label": "Pinellas County",
      "fips": "12103"
    },
    {
      "label": "Polk County",
      "fips": "12105"
    },
    {
      "label": "Putnam County",
      "fips": "12107"
    },
    {
      "label": "St. Johns County",
      "fips": "12109"
    },
    {
      "label": "St. Lucie County",
      "fips": "12111"
    },
    {
      "label": "Santa Rosa County",
      "fips": "12113"
    },
    {
      "label": "Sarasota County",
      "fips": "12115"
    },
    {
      "label": "Seminole County",
      "fips": "12117"
    },
    {
      "label": "Sumter County",
      "fips": "12119"
    },
    {
      "label": "Suwannee County",
      "fips": "12121"
    },
    {
      "label": "Taylor County",
      "fips": "12123"
    },
    {
      "label": "Union County",
      "fips": "12125"
    },
    {
      "label": "Volusia County",
      "fips": "12127"
    },
    {
      "label": "Wakulla County",
      "fips": "12129"
    },
    {
      "label": "Walton County",
      "fips": "12131"
    },
    {
      "label": "Washington County",
      "fips": "12133"
    }
  ],
  "GA": [
    {
      "label": "Appling County",
      "fips": "13001"
    },
    {
      "label": "Atkinson County",
      "fips": "13003"
    },
    {
      "label": "Bacon County",
      "fips": "13005"
    },
    {
      "label": "Baker County",
      "fips": "13007"
    },
    {
      "label": "Baldwin County",
      "fips": "13009"
    },
    {
      "label": "Banks County",
      "fips": "13011"
    },
    {
      "label": "Barrow County",
      "fips": "13013"
    },
    {
      "label": "Bartow County",
      "fips": "13015"
    },
    {
      "label": "Ben Hill County",
      "fips": "13017"
    },
    {
      "label": "Berrien County",
      "fips": "13019"
    },
    {
      "label": "Bibb County",
      "fips": "13021"
    },
    {
      "label": "Bleckley County",
      "fips": "13023"
    },
    {
      "label": "Brantley County",
      "fips": "13025"
    },
    {
      "label": "Brooks County",
      "fips": "13027"
    },
    {
      "label": "Bryan County",
      "fips": "13029"
    },
    {
      "label": "Bulloch County",
      "fips": "13031"
    },
    {
      "label": "Burke County",
      "fips": "13033"
    },
    {
      "label": "Butts County",
      "fips": "13035"
    },
    {
      "label": "Calhoun County",
      "fips": "13037"
    },
    {
      "label": "Camden County",
      "fips": "13039"
    },
    {
      "label": "Candler County",
      "fips": "13043"
    },
    {
      "label": "Carroll County",
      "fips": "13045"
    },
    {
      "label": "Catoosa County",
      "fips": "13047"
    },
    {
      "label": "Charlton County",
      "fips": "13049"
    },
    {
      "label": "Chatham County",
      "fips": "13051"
    },
    {
      "label": "Chattahoochee County",
      "fips": "13053"
    },
    {
      "label": "Chattooga County",
      "fips": "13055"
    },
    {
      "label": "Cherokee County",
      "fips": "13057"
    },
    {
      "label": "Clarke County",
      "fips": "13059"
    },
    {
      "label": "Clay County",
      "fips": "13061"
    },
    {
      "label": "Clayton County",
      "fips": "13063"
    },
    {
      "label": "Clinch County",
      "fips": "13065"
    },
    {
      "label": "Cobb County",
      "fips": "13067"
    },
    {
      "label": "Coffee County",
      "fips": "13069"
    },
    {
      "label": "Colquitt County",
      "fips": "13071"
    },
    {
      "label": "Columbia County",
      "fips": "13073"
    },
    {
      "label": "Cook County",
      "fips": "13075"
    },
    {
      "label": "Coweta County",
      "fips": "13077"
    },
    {
      "label": "Crawford County",
      "fips": "13079"
    },
    {
      "label": "Crisp County",
      "fips": "13081"
    },
    {
      "label": "Dade County",
      "fips": "13083"
    },
    {
      "label": "Dawson County",
      "fips": "13085"
    },
    {
      "label": "Decatur County",
      "fips": "13087"
    },
    {
      "label": "DeKalb County",
      "fips": "13089"
    },
    {
      "label": "Dodge County",
      "fips": "13091"
    },
    {
      "label": "Dooly County",
      "fips": "13093"
    },
    {
      "label": "Dougherty County",
      "fips": "13095"
    },
    {
      "label": "Douglas County",
      "fips": "13097"
    },
    {
      "label": "Early County",
      "fips": "13099"
    },
    {
      "label": "Echols County",
      "fips": "13101"
    },
    {
      "label": "Effingham County",
      "fips": "13103"
    },
    {
      "label": "Elbert County",
      "fips": "13105"
    },
    {
      "label": "Emanuel County",
      "fips": "13107"
    },
    {
      "label": "Evans County",
      "fips": "13109"
    },
    {
      "label": "Fannin County",
      "fips": "13111"
    },
    {
      "label": "Fayette County",
      "fips": "13113"
    },
    {
      "label": "Floyd County",
      "fips": "13115"
    },
    {
      "label": "Forsyth County",
      "fips": "13117"
    },
    {
      "label": "Franklin County",
      "fips": "13119"
    },
    {
      "label": "Fulton County",
      "fips": "13121"
    },
    {
      "label": "Gilmer County",
      "fips": "13123"
    },
    {
      "label": "Glascock County",
      "fips": "13125"
    },
    {
      "label": "Glynn County",
      "fips": "13127"
    },
    {
      "label": "Gordon County",
      "fips": "13129"
    },
    {
      "label": "Grady County",
      "fips": "13131"
    },
    {
      "label": "Greene County",
      "fips": "13133"
    },
    {
      "label": "Gwinnett County",
      "fips": "13135"
    },
    {
      "label": "Habersham County",
      "fips": "13137"
    },
    {
      "label": "Hall County",
      "fips": "13139"
    },
    {
      "label": "Hancock County",
      "fips": "13141"
    },
    {
      "label": "Haralson County",
      "fips": "13143"
    },
    {
      "label": "Harris County",
      "fips": "13145"
    },
    {
      "label": "Hart County",
      "fips": "13147"
    },
    {
      "label": "Heard County",
      "fips": "13149"
    },
    {
      "label": "Henry County",
      "fips": "13151"
    },
    {
      "label": "Houston County",
      "fips": "13153"
    },
    {
      "label": "Irwin County",
      "fips": "13155"
    },
    {
      "label": "Jackson County",
      "fips": "13157"
    },
    {
      "label": "Jasper County",
      "fips": "13159"
    },
    {
      "label": "Jeff Davis County",
      "fips": "13161"
    },
    {
      "label": "Jefferson County",
      "fips": "13163"
    },
    {
      "label": "Jenkins County",
      "fips": "13165"
    },
    {
      "label": "Johnson County",
      "fips": "13167"
    },
    {
      "label": "Jones County",
      "fips": "13169"
    },
    {
      "label": "Lamar County",
      "fips": "13171"
    },
    {
      "label": "Lanier County",
      "fips": "13173"
    },
    {
      "label": "Laurens County",
      "fips": "13175"
    },
    {
      "label": "Lee County",
      "fips": "13177"
    },
    {
      "label": "Liberty County",
      "fips": "13179"
    },
    {
      "label": "Lincoln County",
      "fips": "13181"
    },
    {
      "label": "Long County",
      "fips": "13183"
    },
    {
      "label": "Lowndes County",
      "fips": "13185"
    },
    {
      "label": "Lumpkin County",
      "fips": "13187"
    },
    {
      "label": "McDuffie County",
      "fips": "13189"
    },
    {
      "label": "McIntosh County",
      "fips": "13191"
    },
    {
      "label": "Macon County",
      "fips": "13193"
    },
    {
      "label": "Madison County",
      "fips": "13195"
    },
    {
      "label": "Marion County",
      "fips": "13197"
    },
    {
      "label": "Meriwether County",
      "fips": "13199"
    },
    {
      "label": "Miller County",
      "fips": "13201"
    },
    {
      "label": "Mitchell County",
      "fips": "13205"
    },
    {
      "label": "Monroe County",
      "fips": "13207"
    },
    {
      "label": "Montgomery County",
      "fips": "13209"
    },
    {
      "label": "Morgan County",
      "fips": "13211"
    },
    {
      "label": "Murray County",
      "fips": "13213"
    },
    {
      "label": "Muscogee County",
      "fips": "13215"
    },
    {
      "label": "Newton County",
      "fips": "13217"
    },
    {
      "label": "Oconee County",
      "fips": "13219"
    },
    {
      "label": "Oglethorpe County",
      "fips": "13221"
    },
    {
      "label": "Paulding County",
      "fips": "13223"
    },
    {
      "label": "Peach County",
      "fips": "13225"
    },
    {
      "label": "Pickens County",
      "fips": "13227"
    },
    {
      "label": "Pierce County",
      "fips": "13229"
    },
    {
      "label": "Pike County",
      "fips": "13231"
    },
    {
      "label": "Polk County",
      "fips": "13233"
    },
    {
      "label": "Pulaski County",
      "fips": "13235"
    },
    {
      "label": "Putnam County",
      "fips": "13237"
    },
    {
      "label": "Quitman County",
      "fips": "13239"
    },
    {
      "label": "Rabun County",
      "fips": "13241"
    },
    {
      "label": "Randolph County",
      "fips": "13243"
    },
    {
      "label": "Richmond County",
      "fips": "13245"
    },
    {
      "label": "Rockdale County",
      "fips": "13247"
    },
    {
      "label": "Schley County",
      "fips": "13249"
    },
    {
      "label": "Screven County",
      "fips": "13251"
    },
    {
      "label": "Seminole County",
      "fips": "13253"
    },
    {
      "label": "Spalding County",
      "fips": "13255"
    },
    {
      "label": "Stephens County",
      "fips": "13257"
    },
    {
      "label": "Stewart County",
      "fips": "13259"
    },
    {
      "label": "Sumter County",
      "fips": "13261"
    },
    {
      "label": "Talbot County",
      "fips": "13263"
    },
    {
      "label": "Taliaferro County",
      "fips": "13265"
    },
    {
      "label": "Tattnall County",
      "fips": "13267"
    },
    {
      "label": "Taylor County",
      "fips": "13269"
    },
    {
      "label": "Telfair County",
      "fips": "13271"
    },
    {
      "label": "Terrell County",
      "fips": "13273"
    },
    {
      "label": "Thomas County",
      "fips": "13275"
    },
    {
      "label": "Tift County",
      "fips": "13277"
    },
    {
      "label": "Toombs County",
      "fips": "13279"
    },
    {
      "label": "Towns County",
      "fips": "13281"
    },
    {
      "label": "Treutlen County",
      "fips": "13283"
    },
    {
      "label": "Troup County",
      "fips": "13285"
    },
    {
      "label": "Turner County",
      "fips": "13287"
    },
    {
      "label": "Twiggs County",
      "fips": "13289"
    },
    {
      "label": "Union County",
      "fips": "13291"
    },
    {
      "label": "Upson County",
      "fips": "13293"
    },
    {
      "label": "Walker County",
      "fips": "13295"
    },
    {
      "label": "Walton County",
      "fips": "13297"
    },
    {
      "label": "Ware County",
      "fips": "13299"
    },
    {
      "label": "Warren County",
      "fips": "13301"
    },
    {
      "label": "Washington County",
      "fips": "13303"
    },
    {
      "label": "Wayne County",
      "fips": "13305"
    },
    {
      "label": "Webster County",
      "fips": "13307"
    },
    {
      "label": "Wheeler County",
      "fips": "13309"
    },
    {
      "label": "White County",
      "fips": "13311"
    },
    {
      "label": "Whitfield County",
      "fips": "13313"
    },
    {
      "label": "Wilcox County",
      "fips": "13315"
    },
    {
      "label": "Wilkes County",
      "fips": "13317"
    },
    {
      "label": "Wilkinson County",
      "fips": "13319"
    },
    {
      "label": "Worth County",
      "fips": "13321"
    }
  ],
  "ID": [
    {
      "label": "Ada County",
      "fips": "16001"
    },
    {
      "label": "Adams County",
      "fips": "16003"
    },
    {
      "label": "Bannock County",
      "fips": "16005"
    },
    {
      "label": "Bear Lake County",
      "fips": "16007"
    },
    {
      "label": "Benewah County",
      "fips": "16009"
    },
    {
      "label": "Bingham County",
      "fips": "16011"
    },
    {
      "label": "Blaine County",
      "fips": "16013"
    },
    {
      "label": "Boise County",
      "fips": "16015"
    },
    {
      "label": "Bonner County",
      "fips": "16017"
    },
    {
      "label": "Bonneville County",
      "fips": "16019"
    },
    {
      "label": "Boundary County",
      "fips": "16021"
    },
    {
      "label": "Butte County",
      "fips": "16023"
    },
    {
      "label": "Camas County",
      "fips": "16025"
    },
    {
      "label": "Canyon County",
      "fips": "16027"
    },
    {
      "label": "Caribou County",
      "fips": "16029"
    },
    {
      "label": "Cassia County",
      "fips": "16031"
    },
    {
      "label": "Clark County",
      "fips": "16033"
    },
    {
      "label": "Clearwater County",
      "fips": "16035"
    },
    {
      "label": "Custer County",
      "fips": "16037"
    },
    {
      "label": "Elmore County",
      "fips": "16039"
    },
    {
      "label": "Franklin County",
      "fips": "16041"
    },
    {
      "label": "Fremont County",
      "fips": "16043"
    },
    {
      "label": "Gem County",
      "fips": "16045"
    },
    {
      "label": "Gooding County",
      "fips": "16047"
    },
    {
      "label": "Idaho County",
      "fips": "16049"
    },
    {
      "label": "Jefferson County",
      "fips": "16051"
    },
    {
      "label": "Jerome County",
      "fips": "16053"
    },
    {
      "label": "Kootenai County",
      "fips": "16055"
    },
    {
      "label": "Latah County",
      "fips": "16057"
    },
    {
      "label": "Lemhi County",
      "fips": "16059"
    },
    {
      "label": "Lewis County",
      "fips": "16061"
    },
    {
      "label": "Lincoln County",
      "fips": "16063"
    },
    {
      "label": "Madison County",
      "fips": "16065"
    },
    {
      "label": "Minidoka County",
      "fips": "16067"
    },
    {
      "label": "Nez Perce County",
      "fips": "16069"
    },
    {
      "label": "Oneida County",
      "fips": "16071"
    },
    {
      "label": "Owyhee County",
      "fips": "16073"
    },
    {
      "label": "Payette County",
      "fips": "16075"
    },
    {
      "label": "Power County",
      "fips": "16077"
    },
    {
      "label": "Shoshone County",
      "fips": "16079"
    },
    {
      "label": "Teton County",
      "fips": "16081"
    },
    {
      "label": "Twin Falls County",
      "fips": "16083"
    },
    {
      "label": "Valley County",
      "fips": "16085"
    },
    {
      "label": "Washington County",
      "fips": "16087"
    }
  ],
  "IL": [
    {
      "label": "Adams County",
      "fips": "17001"
    },
    {
      "label": "Alexander County",
      "fips": "17003"
    },
    {
      "label": "Bond County",
      "fips": "17005"
    },
    {
      "label": "Boone County",
      "fips": "17007"
    },
    {
      "label": "Brown County",
      "fips": "17009"
    },
    {
      "label": "Bureau County",
      "fips": "17011"
    },
    {
      "label": "Calhoun County",
      "fips": "17013"
    },
    {
      "label": "Carroll County",
      "fips": "17015"
    },
    {
      "label": "Cass County",
      "fips": "17017"
    },
    {
      "label": "Champaign County",
      "fips": "17019"
    },
    {
      "label": "Christian County",
      "fips": "17021"
    },
    {
      "label": "Clark County",
      "fips": "17023"
    },
    {
      "label": "Clay County",
      "fips": "17025"
    },
    {
      "label": "Clinton County",
      "fips": "17027"
    },
    {
      "label": "Coles County",
      "fips": "17029"
    },
    {
      "label": "Cook County",
      "fips": "17031"
    },
    {
      "label": "Crawford County",
      "fips": "17033"
    },
    {
      "label": "Cumberland County",
      "fips": "17035"
    },
    {
      "label": "DeKalb County",
      "fips": "17037"
    },
    {
      "label": "De Witt County",
      "fips": "17039"
    },
    {
      "label": "Douglas County",
      "fips": "17041"
    },
    {
      "label": "DuPage County",
      "fips": "17043"
    },
    {
      "label": "Edgar County",
      "fips": "17045"
    },
    {
      "label": "Edwards County",
      "fips": "17047"
    },
    {
      "label": "Effingham County",
      "fips": "17049"
    },
    {
      "label": "Fayette County",
      "fips": "17051"
    },
    {
      "label": "Ford County",
      "fips": "17053"
    },
    {
      "label": "Franklin County",
      "fips": "17055"
    },
    {
      "label": "Fulton County",
      "fips": "17057"
    },
    {
      "label": "Gallatin County",
      "fips": "17059"
    },
    {
      "label": "Greene County",
      "fips": "17061"
    },
    {
      "label": "Grundy County",
      "fips": "17063"
    },
    {
      "label": "Hamilton County",
      "fips": "17065"
    },
    {
      "label": "Hancock County",
      "fips": "17067"
    },
    {
      "label": "Hardin County",
      "fips": "17069"
    },
    {
      "label": "Henderson County",
      "fips": "17071"
    },
    {
      "label": "Henry County",
      "fips": "17073"
    },
    {
      "label": "Iroquois County",
      "fips": "17075"
    },
    {
      "label": "Jackson County",
      "fips": "17077"
    },
    {
      "label": "Jasper County",
      "fips": "17079"
    },
    {
      "label": "Jefferson County",
      "fips": "17081"
    },
    {
      "label": "Jersey County",
      "fips": "17083"
    },
    {
      "label": "Jo Daviess County",
      "fips": "17085"
    },
    {
      "label": "Johnson County",
      "fips": "17087"
    },
    {
      "label": "Kane County",
      "fips": "17089"
    },
    {
      "label": "Kankakee County",
      "fips": "17091"
    },
    {
      "label": "Kendall County",
      "fips": "17093"
    },
    {
      "label": "Knox County",
      "fips": "17095"
    },
    {
      "label": "Lake County",
      "fips": "17097"
    },
    {
      "label": "LaSalle County",
      "fips": "17099"
    },
    {
      "label": "Lawrence County",
      "fips": "17101"
    },
    {
      "label": "Lee County",
      "fips": "17103"
    },
    {
      "label": "Livingston County",
      "fips": "17105"
    },
    {
      "label": "Logan County",
      "fips": "17107"
    },
    {
      "label": "McDonough County",
      "fips": "17109"
    },
    {
      "label": "McHenry County",
      "fips": "17111"
    },
    {
      "label": "McLean County",
      "fips": "17113"
    },
    {
      "label": "Macon County",
      "fips": "17115"
    },
    {
      "label": "Macoupin County",
      "fips": "17117"
    },
    {
      "label": "Madison County",
      "fips": "17119"
    },
    {
      "label": "Marion County",
      "fips": "17121"
    },
    {
      "label": "Marshall County",
      "fips": "17123"
    },
    {
      "label": "Mason County",
      "fips": "17125"
    },
    {
      "label": "Massac County",
      "fips": "17127"
    },
    {
      "label": "Menard County",
      "fips": "17129"
    },
    {
      "label": "Mercer County",
      "fips": "17131"
    },
    {
      "label": "Monroe County",
      "fips": "17133"
    },
    {
      "label": "Montgomery County",
      "fips": "17135"
    },
    {
      "label": "Morgan County",
      "fips": "17137"
    },
    {
      "label": "Moultrie County",
      "fips": "17139"
    },
    {
      "label": "Ogle County",
      "fips": "17141"
    },
    {
      "label": "Peoria County",
      "fips": "17143"
    },
    {
      "label": "Perry County",
      "fips": "17145"
    },
    {
      "label": "Piatt County",
      "fips": "17147"
    },
    {
      "label": "Pike County",
      "fips": "17149"
    },
    {
      "label": "Pope County",
      "fips": "17151"
    },
    {
      "label": "Pulaski County",
      "fips": "17153"
    },
    {
      "label": "Putnam County",
      "fips": "17155"
    },
    {
      "label": "Randolph County",
      "fips": "17157"
    },
    {
      "label": "Richland County",
      "fips": "17159"
    },
    {
      "label": "Rock Island County",
      "fips": "17161"
    },
    {
      "label": "St. Clair County",
      "fips": "17163"
    },
    {
      "label": "Saline County",
      "fips": "17165"
    },
    {
      "label": "Sangamon County",
      "fips": "17167"
    },
    {
      "label": "Schuyler County",
      "fips": "17169"
    },
    {
      "label": "Scott County",
      "fips": "17171"
    },
    {
      "label": "Shelby County",
      "fips": "17173"
    },
    {
      "label": "Stark County",
      "fips": "17175"
    },
    {
      "label": "Stephenson County",
      "fips": "17177"
    },
    {
      "label": "Tazewell County",
      "fips": "17179"
    },
    {
      "label": "Union County",
      "fips": "17181"
    },
    {
      "label": "Vermilion County",
      "fips": "17183"
    },
    {
      "label": "Wabash County",
      "fips": "17185"
    },
    {
      "label": "Warren County",
      "fips": "17187"
    },
    {
      "label": "Washington County",
      "fips": "17189"
    },
    {
      "label": "Wayne County",
      "fips": "17191"
    },
    {
      "label": "White County",
      "fips": "17193"
    },
    {
      "label": "Whiteside County",
      "fips": "17195"
    },
    {
      "label": "Will County",
      "fips": "17197"
    },
    {
      "label": "Williamson County",
      "fips": "17199"
    },
    {
      "label": "Winnebago County",
      "fips": "17201"
    },
    {
      "label": "Woodford County",
      "fips": "17203"
    }
  ],
  "IN": [
    {
      "label": "Adams County",
      "fips": "18001"
    },
    {
      "label": "Allen County",
      "fips": "18003"
    },
    {
      "label": "Bartholomew County",
      "fips": "18005"
    },
    {
      "label": "Benton County",
      "fips": "18007"
    },
    {
      "label": "Blackford County",
      "fips": "18009"
    },
    {
      "label": "Boone County",
      "fips": "18011"
    },
    {
      "label": "Brown County",
      "fips": "18013"
    },
    {
      "label": "Carroll County",
      "fips": "18015"
    },
    {
      "label": "Cass County",
      "fips": "18017"
    },
    {
      "label": "Clark County",
      "fips": "18019"
    },
    {
      "label": "Clay County",
      "fips": "18021"
    },
    {
      "label": "Clinton County",
      "fips": "18023"
    },
    {
      "label": "Crawford County",
      "fips": "18025"
    },
    {
      "label": "Daviess County",
      "fips": "18027"
    },
    {
      "label": "Dearborn County",
      "fips": "18029"
    },
    {
      "label": "Decatur County",
      "fips": "18031"
    },
    {
      "label": "DeKalb County",
      "fips": "18033"
    },
    {
      "label": "Delaware County",
      "fips": "18035"
    },
    {
      "label": "Dubois County",
      "fips": "18037"
    },
    {
      "label": "Elkhart County",
      "fips": "18039"
    },
    {
      "label": "Fayette County",
      "fips": "18041"
    },
    {
      "label": "Floyd County",
      "fips": "18043"
    },
    {
      "label": "Fountain County",
      "fips": "18045"
    },
    {
      "label": "Franklin County",
      "fips": "18047"
    },
    {
      "label": "Fulton County",
      "fips": "18049"
    },
    {
      "label": "Gibson County",
      "fips": "18051"
    },
    {
      "label": "Grant County",
      "fips": "18053"
    },
    {
      "label": "Greene County",
      "fips": "18055"
    },
    {
      "label": "Hamilton County",
      "fips": "18057"
    },
    {
      "label": "Hancock County",
      "fips": "18059"
    },
    {
      "label": "Harrison County",
      "fips": "18061"
    },
    {
      "label": "Hendricks County",
      "fips": "18063"
    },
    {
      "label": "Henry County",
      "fips": "18065"
    },
    {
      "label": "Howard County",
      "fips": "18067"
    },
    {
      "label": "Huntington County",
      "fips": "18069"
    },
    {
      "label": "Jackson County",
      "fips": "18071"
    },
    {
      "label": "Jasper County",
      "fips": "18073"
    },
    {
      "label": "Jay County",
      "fips": "18075"
    },
    {
      "label": "Jefferson County",
      "fips": "18077"
    },
    {
      "label": "Jennings County",
      "fips": "18079"
    },
    {
      "label": "Johnson County",
      "fips": "18081"
    },
    {
      "label": "Knox County",
      "fips": "18083"
    },
    {
      "label": "Kosciusko County",
      "fips": "18085"
    },
    {
      "label": "LaGrange County",
      "fips": "18087"
    },
    {
      "label": "Lake County",
      "fips": "18089"
    },
    {
      "label": "LaPorte County",
      "fips": "18091"
    },
    {
      "label": "Lawrence County",
      "fips": "18093"
    },
    {
      "label": "Madison County",
      "fips": "18095"
    },
    {
      "label": "Marion County",
      "fips": "18097"
    },
    {
      "label": "Marshall County",
      "fips": "18099"
    },
    {
      "label": "Martin County",
      "fips": "18101"
    },
    {
      "label": "Miami County",
      "fips": "18103"
    },
    {
      "label": "Monroe County",
      "fips": "18105"
    },
    {
      "label": "Montgomery County",
      "fips": "18107"
    },
    {
      "label": "Morgan County",
      "fips": "18109"
    },
    {
      "label": "Newton County",
      "fips": "18111"
    },
    {
      "label": "Noble County",
      "fips": "18113"
    },
    {
      "label": "Ohio County",
      "fips": "18115"
    },
    {
      "label": "Orange County",
      "fips": "18117"
    },
    {
      "label": "Owen County",
      "fips": "18119"
    },
    {
      "label": "Parke County",
      "fips": "18121"
    },
    {
      "label": "Perry County",
      "fips": "18123"
    },
    {
      "label": "Pike County",
      "fips": "18125"
    },
    {
      "label": "Porter County",
      "fips": "18127"
    },
    {
      "label": "Posey County",
      "fips": "18129"
    },
    {
      "label": "Pulaski County",
      "fips": "18131"
    },
    {
      "label": "Putnam County",
      "fips": "18133"
    },
    {
      "label": "Randolph County",
      "fips": "18135"
    },
    {
      "label": "Ripley County",
      "fips": "18137"
    },
    {
      "label": "Rush County",
      "fips": "18139"
    },
    {
      "label": "St. Joseph County",
      "fips": "18141"
    },
    {
      "label": "Scott County",
      "fips": "18143"
    },
    {
      "label": "Shelby County",
      "fips": "18145"
    },
    {
      "label": "Spencer County",
      "fips": "18147"
    },
    {
      "label": "Starke County",
      "fips": "18149"
    },
    {
      "label": "Steuben County",
      "fips": "18151"
    },
    {
      "label": "Sullivan County",
      "fips": "18153"
    },
    {
      "label": "Switzerland County",
      "fips": "18155"
    },
    {
      "label": "Tippecanoe County",
      "fips": "18157"
    },
    {
      "label": "Tipton County",
      "fips": "18159"
    },
    {
      "label": "Union County",
      "fips": "18161"
    },
    {
      "label": "Vanderburgh County",
      "fips": "18163"
    },
    {
      "label": "Vermillion County",
      "fips": "18165"
    },
    {
      "label": "Vigo County",
      "fips": "18167"
    },
    {
      "label": "Wabash County",
      "fips": "18169"
    },
    {
      "label": "Warren County",
      "fips": "18171"
    },
    {
      "label": "Warrick County",
      "fips": "18173"
    },
    {
      "label": "Washington County",
      "fips": "18175"
    },
    {
      "label": "Wayne County",
      "fips": "18177"
    },
    {
      "label": "Wells County",
      "fips": "18179"
    },
    {
      "label": "White County",
      "fips": "18181"
    },
    {
      "label": "Whitley County",
      "fips": "18183"
    }
  ],
  "IA": [
    {
      "label": "Adair County",
      "fips": "19001"
    },
    {
      "label": "Adams County",
      "fips": "19003"
    },
    {
      "label": "Allamakee County",
      "fips": "19005"
    },
    {
      "label": "Appanoose County",
      "fips": "19007"
    },
    {
      "label": "Audubon County",
      "fips": "19009"
    },
    {
      "label": "Benton County",
      "fips": "19011"
    },
    {
      "label": "Black Hawk County",
      "fips": "19013"
    },
    {
      "label": "Boone County",
      "fips": "19015"
    },
    {
      "label": "Bremer County",
      "fips": "19017"
    },
    {
      "label": "Buchanan County",
      "fips": "19019"
    },
    {
      "label": "Buena Vista County",
      "fips": "19021"
    },
    {
      "label": "Butler County",
      "fips": "19023"
    },
    {
      "label": "Calhoun County",
      "fips": "19025"
    },
    {
      "label": "Carroll County",
      "fips": "19027"
    },
    {
      "label": "Cass County",
      "fips": "19029"
    },
    {
      "label": "Cedar County",
      "fips": "19031"
    },
    {
      "label": "Cerro Gordo County",
      "fips": "19033"
    },
    {
      "label": "Cherokee County",
      "fips": "19035"
    },
    {
      "label": "Chickasaw County",
      "fips": "19037"
    },
    {
      "label": "Clarke County",
      "fips": "19039"
    },
    {
      "label": "Clay County",
      "fips": "19041"
    },
    {
      "label": "Clayton County",
      "fips": "19043"
    },
    {
      "label": "Clinton County",
      "fips": "19045"
    },
    {
      "label": "Crawford County",
      "fips": "19047"
    },
    {
      "label": "Dallas County",
      "fips": "19049"
    },
    {
      "label": "Davis County",
      "fips": "19051"
    },
    {
      "label": "Decatur County",
      "fips": "19053"
    },
    {
      "label": "Delaware County",
      "fips": "19055"
    },
    {
      "label": "Des Moines County",
      "fips": "19057"
    },
    {
      "label": "Dickinson County",
      "fips": "19059"
    },
    {
      "label": "Dubuque County",
      "fips": "19061"
    },
    {
      "label": "Emmet County",
      "fips": "19063"
    },
    {
      "label": "Fayette County",
      "fips": "19065"
    },
    {
      "label": "Floyd County",
      "fips": "19067"
    },
    {
      "label": "Franklin County",
      "fips": "19069"
    },
    {
      "label": "Fremont County",
      "fips": "19071"
    },
    {
      "label": "Greene County",
      "fips": "19073"
    },
    {
      "label": "Grundy County",
      "fips": "19075"
    },
    {
      "label": "Guthrie County",
      "fips": "19077"
    },
    {
      "label": "Hamilton County",
      "fips": "19079"
    },
    {
      "label": "Hancock County",
      "fips": "19081"
    },
    {
      "label": "Hardin County",
      "fips": "19083"
    },
    {
      "label": "Harrison County",
      "fips": "19085"
    },
    {
      "label": "Henry County",
      "fips": "19087"
    },
    {
      "label": "Howard County",
      "fips": "19089"
    },
    {
      "label": "Humboldt County",
      "fips": "19091"
    },
    {
      "label": "Ida County",
      "fips": "19093"
    },
    {
      "label": "Iowa County",
      "fips": "19095"
    },
    {
      "label": "Jackson County",
      "fips": "19097"
    },
    {
      "label": "Jasper County",
      "fips": "19099"
    },
    {
      "label": "Jefferson County",
      "fips": "19101"
    },
    {
      "label": "Johnson County",
      "fips": "19103"
    },
    {
      "label": "Jones County",
      "fips": "19105"
    },
    {
      "label": "Keokuk County",
      "fips": "19107"
    },
    {
      "label": "Kossuth County",
      "fips": "19109"
    },
    {
      "label": "Lee County",
      "fips": "19111"
    },
    {
      "label": "Linn County",
      "fips": "19113"
    },
    {
      "label": "Louisa County",
      "fips": "19115"
    },
    {
      "label": "Lucas County",
      "fips": "19117"
    },
    {
      "label": "Lyon County",
      "fips": "19119"
    },
    {
      "label": "Madison County",
      "fips": "19121"
    },
    {
      "label": "Mahaska County",
      "fips": "19123"
    },
    {
      "label": "Marion County",
      "fips": "19125"
    },
    {
      "label": "Marshall County",
      "fips": "19127"
    },
    {
      "label": "Mills County",
      "fips": "19129"
    },
    {
      "label": "Mitchell County",
      "fips": "19131"
    },
    {
      "label": "Monona County",
      "fips": "19133"
    },
    {
      "label": "Monroe County",
      "fips": "19135"
    },
    {
      "label": "Montgomery County",
      "fips": "19137"
    },
    {
      "label": "Muscatine County",
      "fips": "19139"
    },
    {
      "label": "O'Brien County",
      "fips": "19141"
    },
    {
      "label": "Osceola County",
      "fips": "19143"
    },
    {
      "label": "Page County",
      "fips": "19145"
    },
    {
      "label": "Palo Alto County",
      "fips": "19147"
    },
    {
      "label": "Plymouth County",
      "fips": "19149"
    },
    {
      "label": "Pocahontas County",
      "fips": "19151"
    },
    {
      "label": "Polk County",
      "fips": "19153"
    },
    {
      "label": "Pottawattamie County",
      "fips": "19155"
    },
    {
      "label": "Poweshiek County",
      "fips": "19157"
    },
    {
      "label": "Ringgold County",
      "fips": "19159"
    },
    {
      "label": "Sac County",
      "fips": "19161"
    },
    {
      "label": "Scott County",
      "fips": "19163"
    },
    {
      "label": "Shelby County",
      "fips": "19165"
    },
    {
      "label": "Sioux County",
      "fips": "19167"
    },
    {
      "label": "Story County",
      "fips": "19169"
    },
    {
      "label": "Tama County",
      "fips": "19171"
    },
    {
      "label": "Taylor County",
      "fips": "19173"
    },
    {
      "label": "Union County",
      "fips": "19175"
    },
    {
      "label": "Van Buren County",
      "fips": "19177"
    },
    {
      "label": "Wapello County",
      "fips": "19179"
    },
    {
      "label": "Warren County",
      "fips": "19181"
    },
    {
      "label": "Washington County",
      "fips": "19183"
    },
    {
      "label": "Wayne County",
      "fips": "19185"
    },
    {
      "label": "Webster County",
      "fips": "19187"
    },
    {
      "label": "Winnebago County",
      "fips": "19189"
    },
    {
      "label": "Winneshiek County",
      "fips": "19191"
    },
    {
      "label": "Woodbury County",
      "fips": "19193"
    },
    {
      "label": "Worth County",
      "fips": "19195"
    },
    {
      "label": "Wright County",
      "fips": "19197"
    }
  ],
  "KS": [
    {
      "label": "Allen County",
      "fips": "20001"
    },
    {
      "label": "Anderson County",
      "fips": "20003"
    },
    {
      "label": "Atchison County",
      "fips": "20005"
    },
    {
      "label": "Barber County",
      "fips": "20007"
    },
    {
      "label": "Barton County",
      "fips": "20009"
    },
    {
      "label": "Bourbon County",
      "fips": "20011"
    },
    {
      "label": "Brown County",
      "fips": "20013"
    },
    {
      "label": "Butler County",
      "fips": "20015"
    },
    {
      "label": "Chase County",
      "fips": "20017"
    },
    {
      "label": "Chautauqua County",
      "fips": "20019"
    },
    {
      "label": "Cherokee County",
      "fips": "20021"
    },
    {
      "label": "Cheyenne County",
      "fips": "20023"
    },
    {
      "label": "Clark County",
      "fips": "20025"
    },
    {
      "label": "Clay County",
      "fips": "20027"
    },
    {
      "label": "Cloud County",
      "fips": "20029"
    },
    {
      "label": "Coffey County",
      "fips": "20031"
    },
    {
      "label": "Comanche County",
      "fips": "20033"
    },
    {
      "label": "Cowley County",
      "fips": "20035"
    },
    {
      "label": "Crawford County",
      "fips": "20037"
    },
    {
      "label": "Decatur County",
      "fips": "20039"
    },
    {
      "label": "Dickinson County",
      "fips": "20041"
    },
    {
      "label": "Doniphan County",
      "fips": "20043"
    },
    {
      "label": "Douglas County",
      "fips": "20045"
    },
    {
      "label": "Edwards County",
      "fips": "20047"
    },
    {
      "label": "Elk County",
      "fips": "20049"
    },
    {
      "label": "Ellis County",
      "fips": "20051"
    },
    {
      "label": "Ellsworth County",
      "fips": "20053"
    },
    {
      "label": "Finney County",
      "fips": "20055"
    },
    {
      "label": "Ford County",
      "fips": "20057"
    },
    {
      "label": "Franklin County",
      "fips": "20059"
    },
    {
      "label": "Geary County",
      "fips": "20061"
    },
    {
      "label": "Gove County",
      "fips": "20063"
    },
    {
      "label": "Graham County",
      "fips": "20065"
    },
    {
      "label": "Grant County",
      "fips": "20067"
    },
    {
      "label": "Gray County",
      "fips": "20069"
    },
    {
      "label": "Greeley County",
      "fips": "20071"
    },
    {
      "label": "Greenwood County",
      "fips": "20073"
    },
    {
      "label": "Hamilton County",
      "fips": "20075"
    },
    {
      "label": "Harper County",
      "fips": "20077"
    },
    {
      "label": "Harvey County",
      "fips": "20079"
    },
    {
      "label": "Haskell County",
      "fips": "20081"
    },
    {
      "label": "Hodgeman County",
      "fips": "20083"
    },
    {
      "label": "Jackson County",
      "fips": "20085"
    },
    {
      "label": "Jefferson County",
      "fips": "20087"
    },
    {
      "label": "Jewell County",
      "fips": "20089"
    },
    {
      "label": "Johnson County",
      "fips": "20091"
    },
    {
      "label": "Kearny County",
      "fips": "20093"
    },
    {
      "label": "Kingman County",
      "fips": "20095"
    },
    {
      "label": "Kiowa County",
      "fips": "20097"
    },
    {
      "label": "Labette County",
      "fips": "20099"
    },
    {
      "label": "Lane County",
      "fips": "20101"
    },
    {
      "label": "Leavenworth County",
      "fips": "20103"
    },
    {
      "label": "Lincoln County",
      "fips": "20105"
    },
    {
      "label": "Linn County",
      "fips": "20107"
    },
    {
      "label": "Logan County",
      "fips": "20109"
    },
    {
      "label": "Lyon County",
      "fips": "20111"
    },
    {
      "label": "McPherson County",
      "fips": "20113"
    },
    {
      "label": "Marion County",
      "fips": "20115"
    },
    {
      "label": "Marshall County",
      "fips": "20117"
    },
    {
      "label": "Meade County",
      "fips": "20119"
    },
    {
      "label": "Miami County",
      "fips": "20121"
    },
    {
      "label": "Mitchell County",
      "fips": "20123"
    },
    {
      "label": "Montgomery County",
      "fips": "20125"
    },
    {
      "label": "Morris County",
      "fips": "20127"
    },
    {
      "label": "Morton County",
      "fips": "20129"
    },
    {
      "label": "Nemaha County",
      "fips": "20131"
    },
    {
      "label": "Neosho County",
      "fips": "20133"
    },
    {
      "label": "Ness County",
      "fips": "20135"
    },
    {
      "label": "Norton County",
      "fips": "20137"
    },
    {
      "label": "Osage County",
      "fips": "20139"
    },
    {
      "label": "Osborne County",
      "fips": "20141"
    },
    {
      "label": "Ottawa County",
      "fips": "20143"
    },
    {
      "label": "Pawnee County",
      "fips": "20145"
    },
    {
      "label": "Phillips County",
      "fips": "20147"
    },
    {
      "label": "Pottawatomie County",
      "fips": "20149"
    },
    {
      "label": "Pratt County",
      "fips": "20151"
    },
    {
      "label": "Rawlins County",
      "fips": "20153"
    },
    {
      "label": "Reno County",
      "fips": "20155"
    },
    {
      "label": "Republic County",
      "fips": "20157"
    },
    {
      "label": "Rice County",
      "fips": "20159"
    },
    {
      "label": "Riley County",
      "fips": "20161"
    },
    {
      "label": "Rooks County",
      "fips": "20163"
    },
    {
      "label": "Rush County",
      "fips": "20165"
    },
    {
      "label": "Russell County",
      "fips": "20167"
    },
    {
      "label": "Saline County",
      "fips": "20169"
    },
    {
      "label": "Scott County",
      "fips": "20171"
    },
    {
      "label": "Sedgwick County",
      "fips": "20173"
    },
    {
      "label": "Seward County",
      "fips": "20175"
    },
    {
      "label": "Shawnee County",
      "fips": "20177"
    },
    {
      "label": "Sheridan County",
      "fips": "20179"
    },
    {
      "label": "Sherman County",
      "fips": "20181"
    },
    {
      "label": "Smith County",
      "fips": "20183"
    },
    {
      "label": "Stafford County",
      "fips": "20185"
    },
    {
      "label": "Stanton County",
      "fips": "20187"
    },
    {
      "label": "Stevens County",
      "fips": "20189"
    },
    {
      "label": "Sumner County",
      "fips": "20191"
    },
    {
      "label": "Thomas County",
      "fips": "20193"
    },
    {
      "label": "Trego County",
      "fips": "20195"
    },
    {
      "label": "Wabaunsee County",
      "fips": "20197"
    },
    {
      "label": "Wallace County",
      "fips": "20199"
    },
    {
      "label": "Washington County",
      "fips": "20201"
    },
    {
      "label": "Wichita County",
      "fips": "20203"
    },
    {
      "label": "Wilson County",
      "fips": "20205"
    },
    {
      "label": "Woodson County",
      "fips": "20207"
    },
    {
      "label": "Wyandotte County",
      "fips": "20209"
    }
  ],
  "KY": [
    {
      "label": "Adair County",
      "fips": "21001"
    },
    {
      "label": "Allen County",
      "fips": "21003"
    },
    {
      "label": "Anderson County",
      "fips": "21005"
    },
    {
      "label": "Ballard County",
      "fips": "21007"
    },
    {
      "label": "Barren County",
      "fips": "21009"
    },
    {
      "label": "Bath County",
      "fips": "21011"
    },
    {
      "label": "Bell County",
      "fips": "21013"
    },
    {
      "label": "Boone County",
      "fips": "21015"
    },
    {
      "label": "Bourbon County",
      "fips": "21017"
    },
    {
      "label": "Boyd County",
      "fips": "21019"
    },
    {
      "label": "Boyle County",
      "fips": "21021"
    },
    {
      "label": "Bracken County",
      "fips": "21023"
    },
    {
      "label": "Breathitt County",
      "fips": "21025"
    },
    {
      "label": "Breckinridge County",
      "fips": "21027"
    },
    {
      "label": "Bullitt County",
      "fips": "21029"
    },
    {
      "label": "Butler County",
      "fips": "21031"
    },
    {
      "label": "Caldwell County",
      "fips": "21033"
    },
    {
      "label": "Calloway County",
      "fips": "21035"
    },
    {
      "label": "Campbell County",
      "fips": "21037"
    },
    {
      "label": "Carlisle County",
      "fips": "21039"
    },
    {
      "label": "Carroll County",
      "fips": "21041"
    },
    {
      "label": "Carter County",
      "fips": "21043"
    },
    {
      "label": "Casey County",
      "fips": "21045"
    },
    {
      "label": "Christian County",
      "fips": "21047"
    },
    {
      "label": "Clark County",
      "fips": "21049"
    },
    {
      "label": "Clay County",
      "fips": "21051"
    },
    {
      "label": "Clinton County",
      "fips": "21053"
    },
    {
      "label": "Crittenden County",
      "fips": "21055"
    },
    {
      "label": "Cumberland County",
      "fips": "21057"
    },
    {
      "label": "Daviess County",
      "fips": "21059"
    },
    {
      "label": "Edmonson County",
      "fips": "21061"
    },
    {
      "label": "Elliott County",
      "fips": "21063"
    },
    {
      "label": "Estill County",
      "fips": "21065"
    },
    {
      "label": "Fayette County",
      "fips": "21067"
    },
    {
      "label": "Fleming County",
      "fips": "21069"
    },
    {
      "label": "Floyd County",
      "fips": "21071"
    },
    {
      "label": "Franklin County",
      "fips": "21073"
    },
    {
      "label": "Fulton County",
      "fips": "21075"
    },
    {
      "label": "Gallatin County",
      "fips": "21077"
    },
    {
      "label": "Garrard County",
      "fips": "21079"
    },
    {
      "label": "Grant County",
      "fips": "21081"
    },
    {
      "label": "Graves County",
      "fips": "21083"
    },
    {
      "label": "Grayson County",
      "fips": "21085"
    },
    {
      "label": "Green County",
      "fips": "21087"
    },
    {
      "label": "Greenup County",
      "fips": "21089"
    },
    {
      "label": "Hancock County",
      "fips": "21091"
    },
    {
      "label": "Hardin County",
      "fips": "21093"
    },
    {
      "label": "Harlan County",
      "fips": "21095"
    },
    {
      "label": "Harrison County",
      "fips": "21097"
    },
    {
      "label": "Hart County",
      "fips": "21099"
    },
    {
      "label": "Henderson County",
      "fips": "21101"
    },
    {
      "label": "Henry County",
      "fips": "21103"
    },
    {
      "label": "Hickman County",
      "fips": "21105"
    },
    {
      "label": "Hopkins County",
      "fips": "21107"
    },
    {
      "label": "Jackson County",
      "fips": "21109"
    },
    {
      "label": "Jefferson County",
      "fips": "21111"
    },
    {
      "label": "Jessamine County",
      "fips": "21113"
    },
    {
      "label": "Johnson County",
      "fips": "21115"
    },
    {
      "label": "Kenton County",
      "fips": "21117"
    },
    {
      "label": "Knott County",
      "fips": "21119"
    },
    {
      "label": "Knox County",
      "fips": "21121"
    },
    {
      "label": "Larue County",
      "fips": "21123"
    },
    {
      "label": "Laurel County",
      "fips": "21125"
    },
    {
      "label": "Lawrence County",
      "fips": "21127"
    },
    {
      "label": "Lee County",
      "fips": "21129"
    },
    {
      "label": "Leslie County",
      "fips": "21131"
    },
    {
      "label": "Letcher County",
      "fips": "21133"
    },
    {
      "label": "Lewis County",
      "fips": "21135"
    },
    {
      "label": "Lincoln County",
      "fips": "21137"
    },
    {
      "label": "Livingston County",
      "fips": "21139"
    },
    {
      "label": "Logan County",
      "fips": "21141"
    },
    {
      "label": "Lyon County",
      "fips": "21143"
    },
    {
      "label": "McCracken County",
      "fips": "21145"
    },
    {
      "label": "McCreary County",
      "fips": "21147"
    },
    {
      "label": "McLean County",
      "fips": "21149"
    },
    {
      "label": "Madison County",
      "fips": "21151"
    },
    {
      "label": "Magoffin County",
      "fips": "21153"
    },
    {
      "label": "Marion County",
      "fips": "21155"
    },
    {
      "label": "Marshall County",
      "fips": "21157"
    },
    {
      "label": "Martin County",
      "fips": "21159"
    },
    {
      "label": "Mason County",
      "fips": "21161"
    },
    {
      "label": "Meade County",
      "fips": "21163"
    },
    {
      "label": "Menifee County",
      "fips": "21165"
    },
    {
      "label": "Mercer County",
      "fips": "21167"
    },
    {
      "label": "Metcalfe County",
      "fips": "21169"
    },
    {
      "label": "Monroe County",
      "fips": "21171"
    },
    {
      "label": "Montgomery County",
      "fips": "21173"
    },
    {
      "label": "Morgan County",
      "fips": "21175"
    },
    {
      "label": "Muhlenberg County",
      "fips": "21177"
    },
    {
      "label": "Nelson County",
      "fips": "21179"
    },
    {
      "label": "Nicholas County",
      "fips": "21181"
    },
    {
      "label": "Ohio County",
      "fips": "21183"
    },
    {
      "label": "Oldham County",
      "fips": "21185"
    },
    {
      "label": "Owen County",
      "fips": "21187"
    },
    {
      "label": "Owsley County",
      "fips": "21189"
    },
    {
      "label": "Pendleton County",
      "fips": "21191"
    },
    {
      "label": "Perry County",
      "fips": "21193"
    },
    {
      "label": "Pike County",
      "fips": "21195"
    },
    {
      "label": "Powell County",
      "fips": "21197"
    },
    {
      "label": "Pulaski County",
      "fips": "21199"
    },
    {
      "label": "Robertson County",
      "fips": "21201"
    },
    {
      "label": "Rockcastle County",
      "fips": "21203"
    },
    {
      "label": "Rowan County",
      "fips": "21205"
    },
    {
      "label": "Russell County",
      "fips": "21207"
    },
    {
      "label": "Scott County",
      "fips": "21209"
    },
    {
      "label": "Shelby County",
      "fips": "21211"
    },
    {
      "label": "Simpson County",
      "fips": "21213"
    },
    {
      "label": "Spencer County",
      "fips": "21215"
    },
    {
      "label": "Taylor County",
      "fips": "21217"
    },
    {
      "label": "Todd County",
      "fips": "21219"
    },
    {
      "label": "Trigg County",
      "fips": "21221"
    },
    {
      "label": "Trimble County",
      "fips": "21223"
    },
    {
      "label": "Union County",
      "fips": "21225"
    },
    {
      "label": "Warren County",
      "fips": "21227"
    },
    {
      "label": "Washington County",
      "fips": "21229"
    },
    {
      "label": "Wayne County",
      "fips": "21231"
    },
    {
      "label": "Webster County",
      "fips": "21233"
    },
    {
      "label": "Whitley County",
      "fips": "21235"
    },
    {
      "label": "Wolfe County",
      "fips": "21237"
    },
    {
      "label": "Woodford County",
      "fips": "21239"
    }
  ],
  "LA": [
    {
      "label": "Acadia Parish",
      "fips": "22001"
    },
    {
      "label": "Allen Parish",
      "fips": "22003"
    },
    {
      "label": "Ascension Parish",
      "fips": "22005"
    },
    {
      "label": "Assumption Parish",
      "fips": "22007"
    },
    {
      "label": "Avoyelles Parish",
      "fips": "22009"
    },
    {
      "label": "Beauregard Parish",
      "fips": "22011"
    },
    {
      "label": "Bienville Parish",
      "fips": "22013"
    },
    {
      "label": "Bossier Parish",
      "fips": "22015"
    },
    {
      "label": "Caddo Parish",
      "fips": "22017"
    },
    {
      "label": "Calcasieu Parish",
      "fips": "22019"
    },
    {
      "label": "Caldwell Parish",
      "fips": "22021"
    },
    {
      "label": "Cameron Parish",
      "fips": "22023"
    },
    {
      "label": "Catahoula Parish",
      "fips": "22025"
    },
    {
      "label": "Claiborne Parish",
      "fips": "22027"
    },
    {
      "label": "Concordia Parish",
      "fips": "22029"
    },
    {
      "label": "De Soto Parish",
      "fips": "22031"
    },
    {
      "label": "East Baton Rouge Parish",
      "fips": "22033"
    },
    {
      "label": "East Carroll Parish",
      "fips": "22035"
    },
    {
      "label": "East Feliciana Parish",
      "fips": "22037"
    },
    {
      "label": "Evangeline Parish",
      "fips": "22039"
    },
    {
      "label": "Franklin Parish",
      "fips": "22041"
    },
    {
      "label": "Grant Parish",
      "fips": "22043"
    },
    {
      "label": "Iberia Parish",
      "fips": "22045"
    },
    {
      "label": "Iberville Parish",
      "fips": "22047"
    },
    {
      "label": "Jackson Parish",
      "fips": "22049"
    },
    {
      "label": "Jefferson Parish",
      "fips": "22051"
    },
    {
      "label": "Jefferson Davis Parish",
      "fips": "22053"
    },
    {
      "label": "Lafayette Parish",
      "fips": "22055"
    },
    {
      "label": "Lafourche Parish",
      "fips": "22057"
    },
    {
      "label": "La Salle Parish",
      "fips": "22059"
    },
    {
      "label": "Lincoln Parish",
      "fips": "22061"
    },
    {
      "label": "Livingston Parish",
      "fips": "22063"
    },
    {
      "label": "Madison Parish",
      "fips": "22065"
    },
    {
      "label": "Morehouse Parish",
      "fips": "22067"
    },
    {
      "label": "Natchitoches Parish",
      "fips": "22069"
    },
    {
      "label": "Orleans Parish",
      "fips": "22071"
    },
    {
      "label": "Ouachita Parish",
      "fips": "22073"
    },
    {
      "label": "Plaquemines Parish",
      "fips": "22075"
    },
    {
      "label": "Pointe Coupee Parish",
      "fips": "22077"
    },
    {
      "label": "Rapides Parish",
      "fips": "22079"
    },
    {
      "label": "Red River Parish",
      "fips": "22081"
    },
    {
      "label": "Richland Parish",
      "fips": "22083"
    },
    {
      "label": "Sabine Parish",
      "fips": "22085"
    },
    {
      "label": "St. Bernard Parish",
      "fips": "22087"
    },
    {
      "label": "St. Charles Parish",
      "fips": "22089"
    },
    {
      "label": "St. Helena Parish",
      "fips": "22091"
    },
    {
      "label": "St. James Parish",
      "fips": "22093"
    },
    {
      "label": "St. John the Baptist Parish",
      "fips": "22095"
    },
    {
      "label": "St. Landry Parish",
      "fips": "22097"
    },
    {
      "label": "St. Martin Parish",
      "fips": "22099"
    },
    {
      "label": "St. Mary Parish",
      "fips": "22101"
    },
    {
      "label": "St. Tammany Parish",
      "fips": "22103"
    },
    {
      "label": "Tangipahoa Parish",
      "fips": "22105"
    },
    {
      "label": "Tensas Parish",
      "fips": "22107"
    },
    {
      "label": "Terrebonne Parish",
      "fips": "22109"
    },
    {
      "label": "Union Parish",
      "fips": "22111"
    },
    {
      "label": "Vermilion Parish",
      "fips": "22113"
    },
    {
      "label": "Vernon Parish",
      "fips": "22115"
    },
    {
      "label": "Washington Parish",
      "fips": "22117"
    },
    {
      "label": "Webster Parish",
      "fips": "22119"
    },
    {
      "label": "West Baton Rouge Parish",
      "fips": "22121"
    },
    {
      "label": "West Carroll Parish",
      "fips": "22123"
    },
    {
      "label": "West Feliciana Parish",
      "fips": "22125"
    },
    {
      "label": "Winn Parish",
      "fips": "22127"
    }
  ],
  "ME": [
    {
      "label": "Androscoggin County",
      "fips": "23001"
    },
    {
      "label": "Aroostook County",
      "fips": "23003"
    },
    {
      "label": "Cumberland County",
      "fips": "23005"
    },
    {
      "label": "Franklin County",
      "fips": "23007"
    },
    {
      "label": "Hancock County",
      "fips": "23009"
    },
    {
      "label": "Kennebec County",
      "fips": "23011"
    },
    {
      "label": "Knox County",
      "fips": "23013"
    },
    {
      "label": "Lincoln County",
      "fips": "23015"
    },
    {
      "label": "Oxford County",
      "fips": "23017"
    },
    {
      "label": "Penobscot County",
      "fips": "23019"
    },
    {
      "label": "Piscataquis County",
      "fips": "23021"
    },
    {
      "label": "Sagadahoc County",
      "fips": "23023"
    },
    {
      "label": "Somerset County",
      "fips": "23025"
    },
    {
      "label": "Waldo County",
      "fips": "23027"
    },
    {
      "label": "Washington County",
      "fips": "23029"
    },
    {
      "label": "York County",
      "fips": "23031"
    }
  ],
  "MD": [
    {
      "label": "Allegany County",
      "fips": "24001"
    },
    {
      "label": "Anne Arundel County",
      "fips": "24003"
    },
    {
      "label": "Baltimore County",
      "fips": "24005"
    },
    {
      "label": "Calvert County",
      "fips": "24009"
    },
    {
      "label": "Caroline County",
      "fips": "24011"
    },
    {
      "label": "Carroll County",
      "fips": "24013"
    },
    {
      "label": "Cecil County",
      "fips": "24015"
    },
    {
      "label": "Charles County",
      "fips": "24017"
    },
    {
      "label": "Dorchester County",
      "fips": "24019"
    },
    {
      "label": "Frederick County",
      "fips": "24021"
    },
    {
      "label": "Garrett County",
      "fips": "24023"
    },
    {
      "label": "Harford County",
      "fips": "24025"
    },
    {
      "label": "Howard County",
      "fips": "24027"
    },
    {
      "label": "Kent County",
      "fips": "24029"
    },
    {
      "label": "Montgomery County",
      "fips": "24031"
    },
    {
      "label": "Prince George's County",
      "fips": "24033"
    },
    {
      "label": "Queen Anne's County",
      "fips": "24035"
    },
    {
      "label": "St. Mary's County",
      "fips": "24037"
    },
    {
      "label": "Somerset County",
      "fips": "24039"
    },
    {
      "label": "Talbot County",
      "fips": "24041"
    },
    {
      "label": "Washington County",
      "fips": "24043"
    },
    {
      "label": "Wicomico County",
      "fips": "24045"
    },
    {
      "label": "Worcester County",
      "fips": "24047"
    },
    {
      "label": "Baltimore city",
      "fips": "24510"
    }
  ],
  "MA": [
    {
      "label": "Barnstable County",
      "fips": "25001"
    },
    {
      "label": "Berkshire County",
      "fips": "25003"
    },
    {
      "label": "Bristol County",
      "fips": "25005"
    },
    {
      "label": "Dukes County",
      "fips": "25007"
    },
    {
      "label": "Essex County",
      "fips": "25009"
    },
    {
      "label": "Franklin County",
      "fips": "25011"
    },
    {
      "label": "Hampden County",
      "fips": "25013"
    },
    {
      "label": "Hampshire County",
      "fips": "25015"
    },
    {
      "label": "Middlesex County",
      "fips": "25017"
    },
    {
      "label": "Nantucket County",
      "fips": "25019"
    },
    {
      "label": "Norfolk County",
      "fips": "25021"
    },
    {
      "label": "Plymouth County",
      "fips": "25023"
    },
    {
      "label": "Suffolk County",
      "fips": "25025"
    },
    {
      "label": "Worcester County",
      "fips": "25027"
    }
  ],
  "MI": [
    {
      "label": "Alcona County",
      "fips": "26001"
    },
    {
      "label": "Alger County",
      "fips": "26003"
    },
    {
      "label": "Allegan County",
      "fips": "26005"
    },
    {
      "label": "Alpena County",
      "fips": "26007"
    },
    {
      "label": "Antrim County",
      "fips": "26009"
    },
    {
      "label": "Arenac County",
      "fips": "26011"
    },
    {
      "label": "Baraga County",
      "fips": "26013"
    },
    {
      "label": "Barry County",
      "fips": "26015"
    },
    {
      "label": "Bay County",
      "fips": "26017"
    },
    {
      "label": "Benzie County",
      "fips": "26019"
    },
    {
      "label": "Berrien County",
      "fips": "26021"
    },
    {
      "label": "Branch County",
      "fips": "26023"
    },
    {
      "label": "Calhoun County",
      "fips": "26025"
    },
    {
      "label": "Cass County",
      "fips": "26027"
    },
    {
      "label": "Charlevoix County",
      "fips": "26029"
    },
    {
      "label": "Cheboygan County",
      "fips": "26031"
    },
    {
      "label": "Chippewa County",
      "fips": "26033"
    },
    {
      "label": "Clare County",
      "fips": "26035"
    },
    {
      "label": "Clinton County",
      "fips": "26037"
    },
    {
      "label": "Crawford County",
      "fips": "26039"
    },
    {
      "label": "Delta County",
      "fips": "26041"
    },
    {
      "label": "Dickinson County",
      "fips": "26043"
    },
    {
      "label": "Eaton County",
      "fips": "26045"
    },
    {
      "label": "Emmet County",
      "fips": "26047"
    },
    {
      "label": "Genesee County",
      "fips": "26049"
    },
    {
      "label": "Gladwin County",
      "fips": "26051"
    },
    {
      "label": "Gogebic County",
      "fips": "26053"
    },
    {
      "label": "Grand Traverse County",
      "fips": "26055"
    },
    {
      "label": "Gratiot County",
      "fips": "26057"
    },
    {
      "label": "Hillsdale County",
      "fips": "26059"
    },
    {
      "label": "Houghton County",
      "fips": "26061"
    },
    {
      "label": "Huron County",
      "fips": "26063"
    },
    {
      "label": "Ingham County",
      "fips": "26065"
    },
    {
      "label": "Ionia County",
      "fips": "26067"
    },
    {
      "label": "Iosco County",
      "fips": "26069"
    },
    {
      "label": "Iron County",
      "fips": "26071"
    },
    {
      "label": "Isabella County",
      "fips": "26073"
    },
    {
      "label": "Jackson County",
      "fips": "26075"
    },
    {
      "label": "Kalamazoo County",
      "fips": "26077"
    },
    {
      "label": "Kalkaska County",
      "fips": "26079"
    },
    {
      "label": "Kent County",
      "fips": "26081"
    },
    {
      "label": "Keweenaw County",
      "fips": "26083"
    },
    {
      "label": "Lake County",
      "fips": "26085"
    },
    {
      "label": "Lapeer County",
      "fips": "26087"
    },
    {
      "label": "Leelanau County",
      "fips": "26089"
    },
    {
      "label": "Lenawee County",
      "fips": "26091"
    },
    {
      "label": "Livingston County",
      "fips": "26093"
    },
    {
      "label": "Luce County",
      "fips": "26095"
    },
    {
      "label": "Mackinac County",
      "fips": "26097"
    },
    {
      "label": "Macomb County",
      "fips": "26099"
    },
    {
      "label": "Manistee County",
      "fips": "26101"
    },
    {
      "label": "Marquette County",
      "fips": "26103"
    },
    {
      "label": "Mason County",
      "fips": "26105"
    },
    {
      "label": "Mecosta County",
      "fips": "26107"
    },
    {
      "label": "Menominee County",
      "fips": "26109"
    },
    {
      "label": "Midland County",
      "fips": "26111"
    },
    {
      "label": "Missaukee County",
      "fips": "26113"
    },
    {
      "label": "Monroe County",
      "fips": "26115"
    },
    {
      "label": "Montcalm County",
      "fips": "26117"
    },
    {
      "label": "Montmorency County",
      "fips": "26119"
    },
    {
      "label": "Muskegon County",
      "fips": "26121"
    },
    {
      "label": "Newaygo County",
      "fips": "26123"
    },
    {
      "label": "Oakland County",
      "fips": "26125"
    },
    {
      "label": "Oceana County",
      "fips": "26127"
    },
    {
      "label": "Ogemaw County",
      "fips": "26129"
    },
    {
      "label": "Ontonagon County",
      "fips": "26131"
    },
    {
      "label": "Osceola County",
      "fips": "26133"
    },
    {
      "label": "Oscoda County",
      "fips": "26135"
    },
    {
      "label": "Otsego County",
      "fips": "26137"
    },
    {
      "label": "Ottawa County",
      "fips": "26139"
    },
    {
      "label": "Presque Isle County",
      "fips": "26141"
    },
    {
      "label": "Roscommon County",
      "fips": "26143"
    },
    {
      "label": "Saginaw County",
      "fips": "26145"
    },
    {
      "label": "St. Clair County",
      "fips": "26147"
    },
    {
      "label": "St. Joseph County",
      "fips": "26149"
    },
    {
      "label": "Sanilac County",
      "fips": "26151"
    },
    {
      "label": "Schoolcraft County",
      "fips": "26153"
    },
    {
      "label": "Shiawassee County",
      "fips": "26155"
    },
    {
      "label": "Tuscola County",
      "fips": "26157"
    },
    {
      "label": "Van Buren County",
      "fips": "26159"
    },
    {
      "label": "Washtenaw County",
      "fips": "26161"
    },
    {
      "label": "Wayne County",
      "fips": "26163"
    },
    {
      "label": "Wexford County",
      "fips": "26165"
    }
  ],
  "MN": [
    {
      "label": "Aitkin County",
      "fips": "27001"
    },
    {
      "label": "Anoka County",
      "fips": "27003"
    },
    {
      "label": "Becker County",
      "fips": "27005"
    },
    {
      "label": "Beltrami County",
      "fips": "27007"
    },
    {
      "label": "Benton County",
      "fips": "27009"
    },
    {
      "label": "Big Stone County",
      "fips": "27011"
    },
    {
      "label": "Blue Earth County",
      "fips": "27013"
    },
    {
      "label": "Brown County",
      "fips": "27015"
    },
    {
      "label": "Carlton County",
      "fips": "27017"
    },
    {
      "label": "Carver County",
      "fips": "27019"
    },
    {
      "label": "Cass County",
      "fips": "27021"
    },
    {
      "label": "Chippewa County",
      "fips": "27023"
    },
    {
      "label": "Chisago County",
      "fips": "27025"
    },
    {
      "label": "Clay County",
      "fips": "27027"
    },
    {
      "label": "Clearwater County",
      "fips": "27029"
    },
    {
      "label": "Cook County",
      "fips": "27031"
    },
    {
      "label": "Cottonwood County",
      "fips": "27033"
    },
    {
      "label": "Crow Wing County",
      "fips": "27035"
    },
    {
      "label": "Dakota County",
      "fips": "27037"
    },
    {
      "label": "Dodge County",
      "fips": "27039"
    },
    {
      "label": "Douglas County",
      "fips": "27041"
    },
    {
      "label": "Faribault County",
      "fips": "27043"
    },
    {
      "label": "Fillmore County",
      "fips": "27045"
    },
    {
      "label": "Freeborn County",
      "fips": "27047"
    },
    {
      "label": "Goodhue County",
      "fips": "27049"
    },
    {
      "label": "Grant County",
      "fips": "27051"
    },
    {
      "label": "Hennepin County",
      "fips": "27053"
    },
    {
      "label": "Houston County",
      "fips": "27055"
    },
    {
      "label": "Hubbard County",
      "fips": "27057"
    },
    {
      "label": "Isanti County",
      "fips": "27059"
    },
    {
      "label": "Itasca County",
      "fips": "27061"
    },
    {
      "label": "Jackson County",
      "fips": "27063"
    },
    {
      "label": "Kanabec County",
      "fips": "27065"
    },
    {
      "label": "Kandiyohi County",
      "fips": "27067"
    },
    {
      "label": "Kittson County",
      "fips": "27069"
    },
    {
      "label": "Koochiching County",
      "fips": "27071"
    },
    {
      "label": "Lac qui Parle County",
      "fips": "27073"
    },
    {
      "label": "Lake County",
      "fips": "27075"
    },
    {
      "label": "Lake of the Woods County",
      "fips": "27077"
    },
    {
      "label": "Le Sueur County",
      "fips": "27079"
    },
    {
      "label": "Lincoln County",
      "fips": "27081"
    },
    {
      "label": "Lyon County",
      "fips": "27083"
    },
    {
      "label": "McLeod County",
      "fips": "27085"
    },
    {
      "label": "Mahnomen County",
      "fips": "27087"
    },
    {
      "label": "Marshall County",
      "fips": "27089"
    },
    {
      "label": "Martin County",
      "fips": "27091"
    },
    {
      "label": "Meeker County",
      "fips": "27093"
    },
    {
      "label": "Mille Lacs County",
      "fips": "27095"
    },
    {
      "label": "Morrison County",
      "fips": "27097"
    },
    {
      "label": "Mower County",
      "fips": "27099"
    },
    {
      "label": "Murray County",
      "fips": "27101"
    },
    {
      "label": "Nicollet County",
      "fips": "27103"
    },
    {
      "label": "Nobles County",
      "fips": "27105"
    },
    {
      "label": "Norman County",
      "fips": "27107"
    },
    {
      "label": "Olmsted County",
      "fips": "27109"
    },
    {
      "label": "Otter Tail County",
      "fips": "27111"
    },
    {
      "label": "Pennington County",
      "fips": "27113"
    },
    {
      "label": "Pine County",
      "fips": "27115"
    },
    {
      "label": "Pipestone County",
      "fips": "27117"
    },
    {
      "label": "Polk County",
      "fips": "27119"
    },
    {
      "label": "Pope County",
      "fips": "27121"
    },
    {
      "label": "Ramsey County",
      "fips": "27123"
    },
    {
      "label": "Red Lake County",
      "fips": "27125"
    },
    {
      "label": "Redwood County",
      "fips": "27127"
    },
    {
      "label": "Renville County",
      "fips": "27129"
    },
    {
      "label": "Rice County",
      "fips": "27131"
    },
    {
      "label": "Rock County",
      "fips": "27133"
    },
    {
      "label": "Roseau County",
      "fips": "27135"
    },
    {
      "label": "St. Louis County",
      "fips": "27137"
    },
    {
      "label": "Scott County",
      "fips": "27139"
    },
    {
      "label": "Sherburne County",
      "fips": "27141"
    },
    {
      "label": "Sibley County",
      "fips": "27143"
    },
    {
      "label": "Stearns County",
      "fips": "27145"
    },
    {
      "label": "Steele County",
      "fips": "27147"
    },
    {
      "label": "Stevens County",
      "fips": "27149"
    },
    {
      "label": "Swift County",
      "fips": "27151"
    },
    {
      "label": "Todd County",
      "fips": "27153"
    },
    {
      "label": "Traverse County",
      "fips": "27155"
    },
    {
      "label": "Wabasha County",
      "fips": "27157"
    },
    {
      "label": "Wadena County",
      "fips": "27159"
    },
    {
      "label": "Waseca County",
      "fips": "27161"
    },
    {
      "label": "Washington County",
      "fips": "27163"
    },
    {
      "label": "Watonwan County",
      "fips": "27165"
    },
    {
      "label": "Wilkin County",
      "fips": "27167"
    },
    {
      "label": "Winona County",
      "fips": "27169"
    },
    {
      "label": "Wright County",
      "fips": "27171"
    },
    {
      "label": "Yellow Medicine County",
      "fips": "27173"
    }
  ],
  "MS": [
    {
      "label": "Adams County",
      "fips": "28001"
    },
    {
      "label": "Alcorn County",
      "fips": "28003"
    },
    {
      "label": "Amite County",
      "fips": "28005"
    },
    {
      "label": "Attala County",
      "fips": "28007"
    },
    {
      "label": "Benton County",
      "fips": "28009"
    },
    {
      "label": "Bolivar County",
      "fips": "28011"
    },
    {
      "label": "Calhoun County",
      "fips": "28013"
    },
    {
      "label": "Carroll County",
      "fips": "28015"
    },
    {
      "label": "Chickasaw County",
      "fips": "28017"
    },
    {
      "label": "Choctaw County",
      "fips": "28019"
    },
    {
      "label": "Claiborne County",
      "fips": "28021"
    },
    {
      "label": "Clarke County",
      "fips": "28023"
    },
    {
      "label": "Clay County",
      "fips": "28025"
    },
    {
      "label": "Coahoma County",
      "fips": "28027"
    },
    {
      "label": "Copiah County",
      "fips": "28029"
    },
    {
      "label": "Covington County",
      "fips": "28031"
    },
    {
      "label": "DeSoto County",
      "fips": "28033"
    },
    {
      "label": "Forrest County",
      "fips": "28035"
    },
    {
      "label": "Franklin County",
      "fips": "28037"
    },
    {
      "label": "George County",
      "fips": "28039"
    },
    {
      "label": "Greene County",
      "fips": "28041"
    },
    {
      "label": "Grenada County",
      "fips": "28043"
    },
    {
      "label": "Hancock County",
      "fips": "28045"
    },
    {
      "label": "Harrison County",
      "fips": "28047"
    },
    {
      "label": "Hinds County",
      "fips": "28049"
    },
    {
      "label": "Holmes County",
      "fips": "28051"
    },
    {
      "label": "Humphreys County",
      "fips": "28053"
    },
    {
      "label": "Issaquena County",
      "fips": "28055"
    },
    {
      "label": "Itawamba County",
      "fips": "28057"
    },
    {
      "label": "Jackson County",
      "fips": "28059"
    },
    {
      "label": "Jasper County",
      "fips": "28061"
    },
    {
      "label": "Jefferson County",
      "fips": "28063"
    },
    {
      "label": "Jefferson Davis County",
      "fips": "28065"
    },
    {
      "label": "Jones County",
      "fips": "28067"
    },
    {
      "label": "Kemper County",
      "fips": "28069"
    },
    {
      "label": "Lafayette County",
      "fips": "28071"
    },
    {
      "label": "Lamar County",
      "fips": "28073"
    },
    {
      "label": "Lauderdale County",
      "fips": "28075"
    },
    {
      "label": "Lawrence County",
      "fips": "28077"
    },
    {
      "label": "Leake County",
      "fips": "28079"
    },
    {
      "label": "Lee County",
      "fips": "28081"
    },
    {
      "label": "Leflore County",
      "fips": "28083"
    },
    {
      "label": "Lincoln County",
      "fips": "28085"
    },
    {
      "label": "Lowndes County",
      "fips": "28087"
    },
    {
      "label": "Madison County",
      "fips": "28089"
    },
    {
      "label": "Marion County",
      "fips": "28091"
    },
    {
      "label": "Marshall County",
      "fips": "28093"
    },
    {
      "label": "Monroe County",
      "fips": "28095"
    },
    {
      "label": "Montgomery County",
      "fips": "28097"
    },
    {
      "label": "Neshoba County",
      "fips": "28099"
    },
    {
      "label": "Newton County",
      "fips": "28101"
    },
    {
      "label": "Noxubee County",
      "fips": "28103"
    },
    {
      "label": "Oktibbeha County",
      "fips": "28105"
    },
    {
      "label": "Panola County",
      "fips": "28107"
    },
    {
      "label": "Pearl River County",
      "fips": "28109"
    },
    {
      "label": "Perry County",
      "fips": "28111"
    },
    {
      "label": "Pike County",
      "fips": "28113"
    },
    {
      "label": "Pontotoc County",
      "fips": "28115"
    },
    {
      "label": "Prentiss County",
      "fips": "28117"
    },
    {
      "label": "Quitman County",
      "fips": "28119"
    },
    {
      "label": "Rankin County",
      "fips": "28121"
    },
    {
      "label": "Scott County",
      "fips": "28123"
    },
    {
      "label": "Sharkey County",
      "fips": "28125"
    },
    {
      "label": "Simpson County",
      "fips": "28127"
    },
    {
      "label": "Smith County",
      "fips": "28129"
    },
    {
      "label": "Stone County",
      "fips": "28131"
    },
    {
      "label": "Sunflower County",
      "fips": "28133"
    },
    {
      "label": "Tallahatchie County",
      "fips": "28135"
    },
    {
      "label": "Tate County",
      "fips": "28137"
    },
    {
      "label": "Tippah County",
      "fips": "28139"
    },
    {
      "label": "Tishomingo County",
      "fips": "28141"
    },
    {
      "label": "Tunica County",
      "fips": "28143"
    },
    {
      "label": "Union County",
      "fips": "28145"
    },
    {
      "label": "Walthall County",
      "fips": "28147"
    },
    {
      "label": "Warren County",
      "fips": "28149"
    },
    {
      "label": "Washington County",
      "fips": "28151"
    },
    {
      "label": "Wayne County",
      "fips": "28153"
    },
    {
      "label": "Webster County",
      "fips": "28155"
    },
    {
      "label": "Wilkinson County",
      "fips": "28157"
    },
    {
      "label": "Winston County",
      "fips": "28159"
    },
    {
      "label": "Yalobusha County",
      "fips": "28161"
    },
    {
      "label": "Yazoo County",
      "fips": "28163"
    }
  ],
  "MO": [
    {
      "label": "Adair County",
      "fips": "29001"
    },
    {
      "label": "Andrew County",
      "fips": "29003"
    },
    {
      "label": "Atchison County",
      "fips": "29005"
    },
    {
      "label": "Audrain County",
      "fips": "29007"
    },
    {
      "label": "Barry County",
      "fips": "29009"
    },
    {
      "label": "Barton County",
      "fips": "29011"
    },
    {
      "label": "Bates County",
      "fips": "29013"
    },
    {
      "label": "Benton County",
      "fips": "29015"
    },
    {
      "label": "Bollinger County",
      "fips": "29017"
    },
    {
      "label": "Boone County",
      "fips": "29019"
    },
    {
      "label": "Buchanan County",
      "fips": "29021"
    },
    {
      "label": "Butler County",
      "fips": "29023"
    },
    {
      "label": "Caldwell County",
      "fips": "29025"
    },
    {
      "label": "Callaway County",
      "fips": "29027"
    },
    {
      "label": "Camden County",
      "fips": "29029"
    },
    {
      "label": "Cape Girardeau County",
      "fips": "29031"
    },
    {
      "label": "Carroll County",
      "fips": "29033"
    },
    {
      "label": "Carter County",
      "fips": "29035"
    },
    {
      "label": "Cass County",
      "fips": "29037"
    },
    {
      "label": "Cedar County",
      "fips": "29039"
    },
    {
      "label": "Chariton County",
      "fips": "29041"
    },
    {
      "label": "Christian County",
      "fips": "29043"
    },
    {
      "label": "Clark County",
      "fips": "29045"
    },
    {
      "label": "Clay County",
      "fips": "29047"
    },
    {
      "label": "Clinton County",
      "fips": "29049"
    },
    {
      "label": "Cole County",
      "fips": "29051"
    },
    {
      "label": "Cooper County",
      "fips": "29053"
    },
    {
      "label": "Crawford County",
      "fips": "29055"
    },
    {
      "label": "Dade County",
      "fips": "29057"
    },
    {
      "label": "Dallas County",
      "fips": "29059"
    },
    {
      "label": "Daviess County",
      "fips": "29061"
    },
    {
      "label": "DeKalb County",
      "fips": "29063"
    },
    {
      "label": "Dent County",
      "fips": "29065"
    },
    {
      "label": "Douglas County",
      "fips": "29067"
    },
    {
      "label": "Dunklin County",
      "fips": "29069"
    },
    {
      "label": "Franklin County",
      "fips": "29071"
    },
    {
      "label": "Gasconade County",
      "fips": "29073"
    },
    {
      "label": "Gentry County",
      "fips": "29075"
    },
    {
      "label": "Greene County",
      "fips": "29077"
    },
    {
      "label": "Grundy County",
      "fips": "29079"
    },
    {
      "label": "Harrison County",
      "fips": "29081"
    },
    {
      "label": "Henry County",
      "fips": "29083"
    },
    {
      "label": "Hickory County",
      "fips": "29085"
    },
    {
      "label": "Holt County",
      "fips": "29087"
    },
    {
      "label": "Howard County",
      "fips": "29089"
    },
    {
      "label": "Howell County",
      "fips": "29091"
    },
    {
      "label": "Iron County",
      "fips": "29093"
    },
    {
      "label": "Jackson County",
      "fips": "29095"
    },
    {
      "label": "Jasper County",
      "fips": "29097"
    },
    {
      "label": "Jefferson County",
      "fips": "29099"
    },
    {
      "label": "Johnson County",
      "fips": "29101"
    },
    {
      "label": "Knox County",
      "fips": "29103"
    },
    {
      "label": "Laclede County",
      "fips": "29105"
    },
    {
      "label": "Lafayette County",
      "fips": "29107"
    },
    {
      "label": "Lawrence County",
      "fips": "29109"
    },
    {
      "label": "Lewis County",
      "fips": "29111"
    },
    {
      "label": "Lincoln County",
      "fips": "29113"
    },
    {
      "label": "Linn County",
      "fips": "29115"
    },
    {
      "label": "Livingston County",
      "fips": "29117"
    },
    {
      "label": "McDonald County",
      "fips": "29119"
    },
    {
      "label": "Macon County",
      "fips": "29121"
    },
    {
      "label": "Madison County",
      "fips": "29123"
    },
    {
      "label": "Maries County",
      "fips": "29125"
    },
    {
      "label": "Marion County",
      "fips": "29127"
    },
    {
      "label": "Mercer County",
      "fips": "29129"
    },
    {
      "label": "Miller County",
      "fips": "29131"
    },
    {
      "label": "Mississippi County",
      "fips": "29133"
    },
    {
      "label": "Moniteau County",
      "fips": "29135"
    },
    {
      "label": "Monroe County",
      "fips": "29137"
    },
    {
      "label": "Montgomery County",
      "fips": "29139"
    },
    {
      "label": "Morgan County",
      "fips": "29141"
    },
    {
      "label": "New Madrid County",
      "fips": "29143"
    },
    {
      "label": "Newton County",
      "fips": "29145"
    },
    {
      "label": "Nodaway County",
      "fips": "29147"
    },
    {
      "label": "Oregon County",
      "fips": "29149"
    },
    {
      "label": "Osage County",
      "fips": "29151"
    },
    {
      "label": "Ozark County",
      "fips": "29153"
    },
    {
      "label": "Pemiscot County",
      "fips": "29155"
    },
    {
      "label": "Perry County",
      "fips": "29157"
    },
    {
      "label": "Pettis County",
      "fips": "29159"
    },
    {
      "label": "Phelps County",
      "fips": "29161"
    },
    {
      "label": "Pike County",
      "fips": "29163"
    },
    {
      "label": "Platte County",
      "fips": "29165"
    },
    {
      "label": "Polk County",
      "fips": "29167"
    },
    {
      "label": "Pulaski County",
      "fips": "29169"
    },
    {
      "label": "Putnam County",
      "fips": "29171"
    },
    {
      "label": "Ralls County",
      "fips": "29173"
    },
    {
      "label": "Randolph County",
      "fips": "29175"
    },
    {
      "label": "Ray County",
      "fips": "29177"
    },
    {
      "label": "Reynolds County",
      "fips": "29179"
    },
    {
      "label": "Ripley County",
      "fips": "29181"
    },
    {
      "label": "St. Charles County",
      "fips": "29183"
    },
    {
      "label": "St. Clair County",
      "fips": "29185"
    },
    {
      "label": "Ste. Genevieve County",
      "fips": "29186"
    },
    {
      "label": "St. Francois County",
      "fips": "29187"
    },
    {
      "label": "St. Louis County",
      "fips": "29189"
    },
    {
      "label": "Saline County",
      "fips": "29195"
    },
    {
      "label": "Schuyler County",
      "fips": "29197"
    },
    {
      "label": "Scotland County",
      "fips": "29199"
    },
    {
      "label": "Scott County",
      "fips": "29201"
    },
    {
      "label": "Shannon County",
      "fips": "29203"
    },
    {
      "label": "Shelby County",
      "fips": "29205"
    },
    {
      "label": "Stoddard County",
      "fips": "29207"
    },
    {
      "label": "Stone County",
      "fips": "29209"
    },
    {
      "label": "Sullivan County",
      "fips": "29211"
    },
    {
      "label": "Taney County",
      "fips": "29213"
    },
    {
      "label": "Texas County",
      "fips": "29215"
    },
    {
      "label": "Vernon County",
      "fips": "29217"
    },
    {
      "label": "Warren County",
      "fips": "29219"
    },
    {
      "label": "Washington County",
      "fips": "29221"
    },
    {
      "label": "Wayne County",
      "fips": "29223"
    },
    {
      "label": "Webster County",
      "fips": "29225"
    },
    {
      "label": "Worth County",
      "fips": "29227"
    },
    {
      "label": "Wright County",
      "fips": "29229"
    },
    {
      "label": "St. Louis city",
      "fips": "29510"
    }
  ],
  "MT": [
    {
      "label": "Beaverhead County",
      "fips": "30001"
    },
    {
      "label": "Big Horn County",
      "fips": "30003"
    },
    {
      "label": "Blaine County",
      "fips": "30005"
    },
    {
      "label": "Broadwater County",
      "fips": "30007"
    },
    {
      "label": "Carbon County",
      "fips": "30009"
    },
    {
      "label": "Carter County",
      "fips": "30011"
    },
    {
      "label": "Cascade County",
      "fips": "30013"
    },
    {
      "label": "Chouteau County",
      "fips": "30015"
    },
    {
      "label": "Custer County",
      "fips": "30017"
    },
    {
      "label": "Daniels County",
      "fips": "30019"
    },
    {
      "label": "Dawson County",
      "fips": "30021"
    },
    {
      "label": "Deer Lodge County",
      "fips": "30023"
    },
    {
      "label": "Fallon County",
      "fips": "30025"
    },
    {
      "label": "Fergus County",
      "fips": "30027"
    },
    {
      "label": "Flathead County",
      "fips": "30029"
    },
    {
      "label": "Gallatin County",
      "fips": "30031"
    },
    {
      "label": "Garfield County",
      "fips": "30033"
    },
    {
      "label": "Glacier County",
      "fips": "30035"
    },
    {
      "label": "Golden Valley County",
      "fips": "30037"
    },
    {
      "label": "Granite County",
      "fips": "30039"
    },
    {
      "label": "Hill County",
      "fips": "30041"
    },
    {
      "label": "Jefferson County",
      "fips": "30043"
    },
    {
      "label": "Judith Basin County",
      "fips": "30045"
    },
    {
      "label": "Lake County",
      "fips": "30047"
    },
    {
      "label": "Lewis and Clark County",
      "fips": "30049"
    },
    {
      "label": "Liberty County",
      "fips": "30051"
    },
    {
      "label": "Lincoln County",
      "fips": "30053"
    },
    {
      "label": "McCone County",
      "fips": "30055"
    },
    {
      "label": "Madison County",
      "fips": "30057"
    },
    {
      "label": "Meagher County",
      "fips": "30059"
    },
    {
      "label": "Mineral County",
      "fips": "30061"
    },
    {
      "label": "Missoula County",
      "fips": "30063"
    },
    {
      "label": "Musselshell County",
      "fips": "30065"
    },
    {
      "label": "Park County",
      "fips": "30067"
    },
    {
      "label": "Petroleum County",
      "fips": "30069"
    },
    {
      "label": "Phillips County",
      "fips": "30071"
    },
    {
      "label": "Pondera County",
      "fips": "30073"
    },
    {
      "label": "Powder River County",
      "fips": "30075"
    },
    {
      "label": "Powell County",
      "fips": "30077"
    },
    {
      "label": "Prairie County",
      "fips": "30079"
    },
    {
      "label": "Ravalli County",
      "fips": "30081"
    },
    {
      "label": "Richland County",
      "fips": "30083"
    },
    {
      "label": "Roosevelt County",
      "fips": "30085"
    },
    {
      "label": "Rosebud County",
      "fips": "30087"
    },
    {
      "label": "Sanders County",
      "fips": "30089"
    },
    {
      "label": "Sheridan County",
      "fips": "30091"
    },
    {
      "label": "Silver Bow County",
      "fips": "30093"
    },
    {
      "label": "Stillwater County",
      "fips": "30095"
    },
    {
      "label": "Sweet Grass County",
      "fips": "30097"
    },
    {
      "label": "Teton County",
      "fips": "30099"
    },
    {
      "label": "Toole County",
      "fips": "30101"
    },
    {
      "label": "Treasure County",
      "fips": "30103"
    },
    {
      "label": "Valley County",
      "fips": "30105"
    },
    {
      "label": "Wheatland County",
      "fips": "30107"
    },
    {
      "label": "Wibaux County",
      "fips": "30109"
    },
    {
      "label": "Yellowstone County",
      "fips": "30111"
    }
  ],
  "NE": [
    {
      "label": "Adams County",
      "fips": "31001"
    },
    {
      "label": "Antelope County",
      "fips": "31003"
    },
    {
      "label": "Arthur County",
      "fips": "31005"
    },
    {
      "label": "Banner County",
      "fips": "31007"
    },
    {
      "label": "Blaine County",
      "fips": "31009"
    },
    {
      "label": "Boone County",
      "fips": "31011"
    },
    {
      "label": "Box Butte County",
      "fips": "31013"
    },
    {
      "label": "Boyd County",
      "fips": "31015"
    },
    {
      "label": "Brown County",
      "fips": "31017"
    },
    {
      "label": "Buffalo County",
      "fips": "31019"
    },
    {
      "label": "Burt County",
      "fips": "31021"
    },
    {
      "label": "Butler County",
      "fips": "31023"
    },
    {
      "label": "Cass County",
      "fips": "31025"
    },
    {
      "label": "Cedar County",
      "fips": "31027"
    },
    {
      "label": "Chase County",
      "fips": "31029"
    },
    {
      "label": "Cherry County",
      "fips": "31031"
    },
    {
      "label": "Cheyenne County",
      "fips": "31033"
    },
    {
      "label": "Clay County",
      "fips": "31035"
    },
    {
      "label": "Colfax County",
      "fips": "31037"
    },
    {
      "label": "Cuming County",
      "fips": "31039"
    },
    {
      "label": "Custer County",
      "fips": "31041"
    },
    {
      "label": "Dakota County",
      "fips": "31043"
    },
    {
      "label": "Dawes County",
      "fips": "31045"
    },
    {
      "label": "Dawson County",
      "fips": "31047"
    },
    {
      "label": "Deuel County",
      "fips": "31049"
    },
    {
      "label": "Dixon County",
      "fips": "31051"
    },
    {
      "label": "Dodge County",
      "fips": "31053"
    },
    {
      "label": "Douglas County",
      "fips": "31055"
    },
    {
      "label": "Dundy County",
      "fips": "31057"
    },
    {
      "label": "Fillmore County",
      "fips": "31059"
    },
    {
      "label": "Franklin County",
      "fips": "31061"
    },
    {
      "label": "Frontier County",
      "fips": "31063"
    },
    {
      "label": "Furnas County",
      "fips": "31065"
    },
    {
      "label": "Gage County",
      "fips": "31067"
    },
    {
      "label": "Garden County",
      "fips": "31069"
    },
    {
      "label": "Garfield County",
      "fips": "31071"
    },
    {
      "label": "Gosper County",
      "fips": "31073"
    },
    {
      "label": "Grant County",
      "fips": "31075"
    },
    {
      "label": "Greeley County",
      "fips": "31077"
    },
    {
      "label": "Hall County",
      "fips": "31079"
    },
    {
      "label": "Hamilton County",
      "fips": "31081"
    },
    {
      "label": "Harlan County",
      "fips": "31083"
    },
    {
      "label": "Hayes County",
      "fips": "31085"
    },
    {
      "label": "Hitchcock County",
      "fips": "31087"
    },
    {
      "label": "Holt County",
      "fips": "31089"
    },
    {
      "label": "Hooker County",
      "fips": "31091"
    },
    {
      "label": "Howard County",
      "fips": "31093"
    },
    {
      "label": "Jefferson County",
      "fips": "31095"
    },
    {
      "label": "Johnson County",
      "fips": "31097"
    },
    {
      "label": "Kearney County",
      "fips": "31099"
    },
    {
      "label": "Keith County",
      "fips": "31101"
    },
    {
      "label": "Keya Paha County",
      "fips": "31103"
    },
    {
      "label": "Kimball County",
      "fips": "31105"
    },
    {
      "label": "Knox County",
      "fips": "31107"
    },
    {
      "label": "Lancaster County",
      "fips": "31109"
    },
    {
      "label": "Lincoln County",
      "fips": "31111"
    },
    {
      "label": "Logan County",
      "fips": "31113"
    },
    {
      "label": "Loup County",
      "fips": "31115"
    },
    {
      "label": "McPherson County",
      "fips": "31117"
    },
    {
      "label": "Madison County",
      "fips": "31119"
    },
    {
      "label": "Merrick County",
      "fips": "31121"
    },
    {
      "label": "Morrill County",
      "fips": "31123"
    },
    {
      "label": "Nance County",
      "fips": "31125"
    },
    {
      "label": "Nemaha County",
      "fips": "31127"
    },
    {
      "label": "Nuckolls County",
      "fips": "31129"
    },
    {
      "label": "Otoe County",
      "fips": "31131"
    },
    {
      "label": "Pawnee County",
      "fips": "31133"
    },
    {
      "label": "Perkins County",
      "fips": "31135"
    },
    {
      "label": "Phelps County",
      "fips": "31137"
    },
    {
      "label": "Pierce County",
      "fips": "31139"
    },
    {
      "label": "Platte County",
      "fips": "31141"
    },
    {
      "label": "Polk County",
      "fips": "31143"
    },
    {
      "label": "Red Willow County",
      "fips": "31145"
    },
    {
      "label": "Richardson County",
      "fips": "31147"
    },
    {
      "label": "Rock County",
      "fips": "31149"
    },
    {
      "label": "Saline County",
      "fips": "31151"
    },
    {
      "label": "Sarpy County",
      "fips": "31153"
    },
    {
      "label": "Saunders County",
      "fips": "31155"
    },
    {
      "label": "Scotts Bluff County",
      "fips": "31157"
    },
    {
      "label": "Seward County",
      "fips": "31159"
    },
    {
      "label": "Sheridan County",
      "fips": "31161"
    },
    {
      "label": "Sherman County",
      "fips": "31163"
    },
    {
      "label": "Sioux County",
      "fips": "31165"
    },
    {
      "label": "Stanton County",
      "fips": "31167"
    },
    {
      "label": "Thayer County",
      "fips": "31169"
    },
    {
      "label": "Thomas County",
      "fips": "31171"
    },
    {
      "label": "Thurston County",
      "fips": "31173"
    },
    {
      "label": "Valley County",
      "fips": "31175"
    },
    {
      "label": "Washington County",
      "fips": "31177"
    },
    {
      "label": "Wayne County",
      "fips": "31179"
    },
    {
      "label": "Webster County",
      "fips": "31181"
    },
    {
      "label": "Wheeler County",
      "fips": "31183"
    },
    {
      "label": "York County",
      "fips": "31185"
    }
  ],
  "NV": [
    {
      "label": "Churchill County",
      "fips": "32001"
    },
    {
      "label": "Clark County",
      "fips": "32003"
    },
    {
      "label": "Douglas County",
      "fips": "32005"
    },
    {
      "label": "Elko County",
      "fips": "32007"
    },
    {
      "label": "Esmeralda County",
      "fips": "32009"
    },
    {
      "label": "Eureka County",
      "fips": "32011"
    },
    {
      "label": "Humboldt County",
      "fips": "32013"
    },
    {
      "label": "Lander County",
      "fips": "32015"
    },
    {
      "label": "Lincoln County",
      "fips": "32017"
    },
    {
      "label": "Lyon County",
      "fips": "32019"
    },
    {
      "label": "Mineral County",
      "fips": "32021"
    },
    {
      "label": "Nye County",
      "fips": "32023"
    },
    {
      "label": "Pershing County",
      "fips": "32027"
    },
    {
      "label": "Storey County",
      "fips": "32029"
    },
    {
      "label": "Washoe County",
      "fips": "32031"
    },
    {
      "label": "White Pine County",
      "fips": "32033"
    },
    {
      "label": "Carson City",
      "fips": "32510"
    }
  ],
  "NH": [
    {
      "label": "Belknap County",
      "fips": "33001"
    },
    {
      "label": "Carroll County",
      "fips": "33003"
    },
    {
      "label": "Cheshire County",
      "fips": "33005"
    },
    {
      "label": "Coos County",
      "fips": "33007"
    },
    {
      "label": "Grafton County",
      "fips": "33009"
    },
    {
      "label": "Hillsborough County",
      "fips": "33011"
    },
    {
      "label": "Merrimack County",
      "fips": "33013"
    },
    {
      "label": "Rockingham County",
      "fips": "33015"
    },
    {
      "label": "Strafford County",
      "fips": "33017"
    },
    {
      "label": "Sullivan County",
      "fips": "33019"
    }
  ],
  "NJ": [
    {
      "label": "Atlantic County",
      "fips": "34001"
    },
    {
      "label": "Bergen County",
      "fips": "34003"
    },
    {
      "label": "Burlington County",
      "fips": "34005"
    },
    {
      "label": "Camden County",
      "fips": "34007"
    },
    {
      "label": "Cape May County",
      "fips": "34009"
    },
    {
      "label": "Cumberland County",
      "fips": "34011"
    },
    {
      "label": "Essex County",
      "fips": "34013"
    },
    {
      "label": "Gloucester County",
      "fips": "34015"
    },
    {
      "label": "Hudson County",
      "fips": "34017"
    },
    {
      "label": "Hunterdon County",
      "fips": "34019"
    },
    {
      "label": "Mercer County",
      "fips": "34021"
    },
    {
      "label": "Middlesex County",
      "fips": "34023"
    },
    {
      "label": "Monmouth County",
      "fips": "34025"
    },
    {
      "label": "Morris County",
      "fips": "34027"
    },
    {
      "label": "Ocean County",
      "fips": "34029"
    },
    {
      "label": "Passaic County",
      "fips": "34031"
    },
    {
      "label": "Salem County",
      "fips": "34033"
    },
    {
      "label": "Somerset County",
      "fips": "34035"
    },
    {
      "label": "Sussex County",
      "fips": "34037"
    },
    {
      "label": "Union County",
      "fips": "34039"
    },
    {
      "label": "Warren County",
      "fips": "34041"
    }
  ],
  "NM": [
    {
      "label": "Bernalillo County",
      "fips": "35001"
    },
    {
      "label": "Catron County",
      "fips": "35003"
    },
    {
      "label": "Chaves County",
      "fips": "35005"
    },
    {
      "label": "Cibola County",
      "fips": "35006"
    },
    {
      "label": "Colfax County",
      "fips": "35007"
    },
    {
      "label": "Curry County",
      "fips": "35009"
    },
    {
      "label": "De Baca County",
      "fips": "35011"
    },
    {
      "label": "Dona Ana County",
      "fips": "35013"
    },
    {
      "label": "Eddy County",
      "fips": "35015"
    },
    {
      "label": "Grant County",
      "fips": "35017"
    },
    {
      "label": "Guadalupe County",
      "fips": "35019"
    },
    {
      "label": "Harding County",
      "fips": "35021"
    },
    {
      "label": "Hidalgo County",
      "fips": "35023"
    },
    {
      "label": "Lea County",
      "fips": "35025"
    },
    {
      "label": "Lincoln County",
      "fips": "35027"
    },
    {
      "label": "Los Alamos County",
      "fips": "35028"
    },
    {
      "label": "Luna County",
      "fips": "35029"
    },
    {
      "label": "McKinley County",
      "fips": "35031"
    },
    {
      "label": "Mora County",
      "fips": "35033"
    },
    {
      "label": "Otero County",
      "fips": "35035"
    },
    {
      "label": "Quay County",
      "fips": "35037"
    },
    {
      "label": "Rio Arriba County",
      "fips": "35039"
    },
    {
      "label": "Roosevelt County",
      "fips": "35041"
    },
    {
      "label": "Sandoval County",
      "fips": "35043"
    },
    {
      "label": "San Juan County",
      "fips": "35045"
    },
    {
      "label": "San Miguel County",
      "fips": "35047"
    },
    {
      "label": "Santa Fe County",
      "fips": "35049"
    },
    {
      "label": "Sierra County",
      "fips": "35051"
    },
    {
      "label": "Socorro County",
      "fips": "35053"
    },
    {
      "label": "Taos County",
      "fips": "35055"
    },
    {
      "label": "Torrance County",
      "fips": "35057"
    },
    {
      "label": "Union County",
      "fips": "35059"
    },
    {
      "label": "Valencia County",
      "fips": "35061"
    }
  ],
  "NY": [
    {
      "label": "Albany County",
      "fips": "36001"
    },
    {
      "label": "Allegany County",
      "fips": "36003"
    },
    {
      "label": "Bronx County",
      "fips": "36005"
    },
    {
      "label": "Broome County",
      "fips": "36007"
    },
    {
      "label": "Cattaraugus County",
      "fips": "36009"
    },
    {
      "label": "Cayuga County",
      "fips": "36011"
    },
    {
      "label": "Chautauqua County",
      "fips": "36013"
    },
    {
      "label": "Chemung County",
      "fips": "36015"
    },
    {
      "label": "Chenango County",
      "fips": "36017"
    },
    {
      "label": "Clinton County",
      "fips": "36019"
    },
    {
      "label": "Columbia County",
      "fips": "36021"
    },
    {
      "label": "Cortland County",
      "fips": "36023"
    },
    {
      "label": "Delaware County",
      "fips": "36025"
    },
    {
      "label": "Dutchess County",
      "fips": "36027"
    },
    {
      "label": "Erie County",
      "fips": "36029"
    },
    {
      "label": "Essex County",
      "fips": "36031"
    },
    {
      "label": "Franklin County",
      "fips": "36033"
    },
    {
      "label": "Fulton County",
      "fips": "36035"
    },
    {
      "label": "Genesee County",
      "fips": "36037"
    },
    {
      "label": "Greene County",
      "fips": "36039"
    },
    {
      "label": "Hamilton County",
      "fips": "36041"
    },
    {
      "label": "Herkimer County",
      "fips": "36043"
    },
    {
      "label": "Jefferson County",
      "fips": "36045"
    },
    {
      "label": "Kings County",
      "fips": "36047"
    },
    {
      "label": "Lewis County",
      "fips": "36049"
    },
    {
      "label": "Livingston County",
      "fips": "36051"
    },
    {
      "label": "Madison County",
      "fips": "36053"
    },
    {
      "label": "Monroe County",
      "fips": "36055"
    },
    {
      "label": "Montgomery County",
      "fips": "36057"
    },
    {
      "label": "Nassau County",
      "fips": "36059"
    },
    {
      "label": "New York County",
      "fips": "36061"
    },
    {
      "label": "Niagara County",
      "fips": "36063"
    },
    {
      "label": "Oneida County",
      "fips": "36065"
    },
    {
      "label": "Onondaga County",
      "fips": "36067"
    },
    {
      "label": "Ontario County",
      "fips": "36069"
    },
    {
      "label": "Orange County",
      "fips": "36071"
    },
    {
      "label": "Orleans County",
      "fips": "36073"
    },
    {
      "label": "Oswego County",
      "fips": "36075"
    },
    {
      "label": "Otsego County",
      "fips": "36077"
    },
    {
      "label": "Putnam County",
      "fips": "36079"
    },
    {
      "label": "Queens County",
      "fips": "36081"
    },
    {
      "label": "Rensselaer County",
      "fips": "36083"
    },
    {
      "label": "Richmond County",
      "fips": "36085"
    },
    {
      "label": "Rockland County",
      "fips": "36087"
    },
    {
      "label": "St. Lawrence County",
      "fips": "36089"
    },
    {
      "label": "Saratoga County",
      "fips": "36091"
    },
    {
      "label": "Schenectady County",
      "fips": "36093"
    },
    {
      "label": "Schoharie County",
      "fips": "36095"
    },
    {
      "label": "Schuyler County",
      "fips": "36097"
    },
    {
      "label": "Seneca County",
      "fips": "36099"
    },
    {
      "label": "Steuben County",
      "fips": "36101"
    },
    {
      "label": "Suffolk County",
      "fips": "36103"
    },
    {
      "label": "Sullivan County",
      "fips": "36105"
    },
    {
      "label": "Tioga County",
      "fips": "36107"
    },
    {
      "label": "Tompkins County",
      "fips": "36109"
    },
    {
      "label": "Ulster County",
      "fips": "36111"
    },
    {
      "label": "Warren County",
      "fips": "36113"
    },
    {
      "label": "Washington County",
      "fips": "36115"
    },
    {
      "label": "Wayne County",
      "fips": "36117"
    },
    {
      "label": "Westchester County",
      "fips": "36119"
    },
    {
      "label": "Wyoming County",
      "fips": "36121"
    },
    {
      "label": "Yates County",
      "fips": "36123"
    }
  ],
  "NC": [
    {
      "label": "Alamance County",
      "fips": "37001"
    },
    {
      "label": "Alexander County",
      "fips": "37003"
    },
    {
      "label": "Alleghany County",
      "fips": "37005"
    },
    {
      "label": "Anson County",
      "fips": "37007"
    },
    {
      "label": "Ashe County",
      "fips": "37009"
    },
    {
      "label": "Avery County",
      "fips": "37011"
    },
    {
      "label": "Beaufort County",
      "fips": "37013"
    },
    {
      "label": "Bertie County",
      "fips": "37015"
    },
    {
      "label": "Bladen County",
      "fips": "37017"
    },
    {
      "label": "Brunswick County",
      "fips": "37019"
    },
    {
      "label": "Buncombe County",
      "fips": "37021"
    },
    {
      "label": "Burke County",
      "fips": "37023"
    },
    {
      "label": "Cabarrus County",
      "fips": "37025"
    },
    {
      "label": "Caldwell County",
      "fips": "37027"
    },
    {
      "label": "Camden County",
      "fips": "37029"
    },
    {
      "label": "Carteret County",
      "fips": "37031"
    },
    {
      "label": "Caswell County",
      "fips": "37033"
    },
    {
      "label": "Catawba County",
      "fips": "37035"
    },
    {
      "label": "Chatham County",
      "fips": "37037"
    },
    {
      "label": "Cherokee County",
      "fips": "37039"
    },
    {
      "label": "Chowan County",
      "fips": "37041"
    },
    {
      "label": "Clay County",
      "fips": "37043"
    },
    {
      "label": "Cleveland County",
      "fips": "37045"
    },
    {
      "label": "Columbus County",
      "fips": "37047"
    },
    {
      "label": "Craven County",
      "fips": "37049"
    },
    {
      "label": "Cumberland County",
      "fips": "37051"
    },
    {
      "label": "Currituck County",
      "fips": "37053"
    },
    {
      "label": "Dare County",
      "fips": "37055"
    },
    {
      "label": "Davidson County",
      "fips": "37057"
    },
    {
      "label": "Davie County",
      "fips": "37059"
    },
    {
      "label": "Duplin County",
      "fips": "37061"
    },
    {
      "label": "Durham County",
      "fips": "37063"
    },
    {
      "label": "Edgecombe County",
      "fips": "37065"
    },
    {
      "label": "Forsyth County",
      "fips": "37067"
    },
    {
      "label": "Franklin County",
      "fips": "37069"
    },
    {
      "label": "Gaston County",
      "fips": "37071"
    },
    {
      "label": "Gates County",
      "fips": "37073"
    },
    {
      "label": "Graham County",
      "fips": "37075"
    },
    {
      "label": "Granville County",
      "fips": "37077"
    },
    {
      "label": "Greene County",
      "fips": "37079"
    },
    {
      "label": "Guilford County",
      "fips": "37081"
    },
    {
      "label": "Halifax County",
      "fips": "37083"
    },
    {
      "label": "Harnett County",
      "fips": "37085"
    },
    {
      "label": "Haywood County",
      "fips": "37087"
    },
    {
      "label": "Henderson County",
      "fips": "37089"
    },
    {
      "label": "Hertford County",
      "fips": "37091"
    },
    {
      "label": "Hoke County",
      "fips": "37093"
    },
    {
      "label": "Hyde County",
      "fips": "37095"
    },
    {
      "label": "Iredell County",
      "fips": "37097"
    },
    {
      "label": "Jackson County",
      "fips": "37099"
    },
    {
      "label": "Johnston County",
      "fips": "37101"
    },
    {
      "label": "Jones County",
      "fips": "37103"
    },
    {
      "label": "Lee County",
      "fips": "37105"
    },
    {
      "label": "Lenoir County",
      "fips": "37107"
    },
    {
      "label": "Lincoln County",
      "fips": "37109"
    },
    {
      "label": "McDowell County",
      "fips": "37111"
    },
    {
      "label": "Macon County",
      "fips": "37113"
    },
    {
      "label": "Madison County",
      "fips": "37115"
    },
    {
      "label": "Martin County",
      "fips": "37117"
    },
    {
      "label": "Mecklenburg County",
      "fips": "37119"
    },
    {
      "label": "Mitchell County",
      "fips": "37121"
    },
    {
      "label": "Montgomery County",
      "fips": "37123"
    },
    {
      "label": "Moore County",
      "fips": "37125"
    },
    {
      "label": "Nash County",
      "fips": "37127"
    },
    {
      "label": "New Hanover County",
      "fips": "37129"
    },
    {
      "label": "Northampton County",
      "fips": "37131"
    },
    {
      "label": "Onslow County",
      "fips": "37133"
    },
    {
      "label": "Orange County",
      "fips": "37135"
    },
    {
      "label": "Pamlico County",
      "fips": "37137"
    },
    {
      "label": "Pasquotank County",
      "fips": "37139"
    },
    {
      "label": "Pender County",
      "fips": "37141"
    },
    {
      "label": "Perquimans County",
      "fips": "37143"
    },
    {
      "label": "Person County",
      "fips": "37145"
    },
    {
      "label": "Pitt County",
      "fips": "37147"
    },
    {
      "label": "Polk County",
      "fips": "37149"
    },
    {
      "label": "Randolph County",
      "fips": "37151"
    },
    {
      "label": "Richmond County",
      "fips": "37153"
    },
    {
      "label": "Robeson County",
      "fips": "37155"
    },
    {
      "label": "Rockingham County",
      "fips": "37157"
    },
    {
      "label": "Rowan County",
      "fips": "37159"
    },
    {
      "label": "Rutherford County",
      "fips": "37161"
    },
    {
      "label": "Sampson County",
      "fips": "37163"
    },
    {
      "label": "Scotland County",
      "fips": "37165"
    },
    {
      "label": "Stanly County",
      "fips": "37167"
    },
    {
      "label": "Stokes County",
      "fips": "37169"
    },
    {
      "label": "Surry County",
      "fips": "37171"
    },
    {
      "label": "Swain County",
      "fips": "37173"
    },
    {
      "label": "Transylvania County",
      "fips": "37175"
    },
    {
      "label": "Tyrrell County",
      "fips": "37177"
    },
    {
      "label": "Union County",
      "fips": "37179"
    },
    {
      "label": "Vance County",
      "fips": "37181"
    },
    {
      "label": "Wake County",
      "fips": "37183"
    },
    {
      "label": "Warren County",
      "fips": "37185"
    },
    {
      "label": "Washington County",
      "fips": "37187"
    },
    {
      "label": "Watauga County",
      "fips": "37189"
    },
    {
      "label": "Wayne County",
      "fips": "37191"
    },
    {
      "label": "Wilkes County",
      "fips": "37193"
    },
    {
      "label": "Wilson County",
      "fips": "37195"
    },
    {
      "label": "Yadkin County",
      "fips": "37197"
    },
    {
      "label": "Yancey County",
      "fips": "37199"
    }
  ],
  "ND": [
    {
      "label": "Adams County",
      "fips": "38001"
    },
    {
      "label": "Barnes County",
      "fips": "38003"
    },
    {
      "label": "Benson County",
      "fips": "38005"
    },
    {
      "label": "Billings County",
      "fips": "38007"
    },
    {
      "label": "Bottineau County",
      "fips": "38009"
    },
    {
      "label": "Bowman County",
      "fips": "38011"
    },
    {
      "label": "Burke County",
      "fips": "38013"
    },
    {
      "label": "Burleigh County",
      "fips": "38015"
    },
    {
      "label": "Cass County",
      "fips": "38017"
    },
    {
      "label": "Cavalier County",
      "fips": "38019"
    },
    {
      "label": "Dickey County",
      "fips": "38021"
    },
    {
      "label": "Divide County",
      "fips": "38023"
    },
    {
      "label": "Dunn County",
      "fips": "38025"
    },
    {
      "label": "Eddy County",
      "fips": "38027"
    },
    {
      "label": "Emmons County",
      "fips": "38029"
    },
    {
      "label": "Foster County",
      "fips": "38031"
    },
    {
      "label": "Golden Valley County",
      "fips": "38033"
    },
    {
      "label": "Grand Forks County",
      "fips": "38035"
    },
    {
      "label": "Grant County",
      "fips": "38037"
    },
    {
      "label": "Griggs County",
      "fips": "38039"
    },
    {
      "label": "Hettinger County",
      "fips": "38041"
    },
    {
      "label": "Kidder County",
      "fips": "38043"
    },
    {
      "label": "LaMoure County",
      "fips": "38045"
    },
    {
      "label": "Logan County",
      "fips": "38047"
    },
    {
      "label": "McHenry County",
      "fips": "38049"
    },
    {
      "label": "McIntosh County",
      "fips": "38051"
    },
    {
      "label": "McKenzie County",
      "fips": "38053"
    },
    {
      "label": "McLean County",
      "fips": "38055"
    },
    {
      "label": "Mercer County",
      "fips": "38057"
    },
    {
      "label": "Morton County",
      "fips": "38059"
    },
    {
      "label": "Mountrail County",
      "fips": "38061"
    },
    {
      "label": "Nelson County",
      "fips": "38063"
    },
    {
      "label": "Oliver County",
      "fips": "38065"
    },
    {
      "label": "Pembina County",
      "fips": "38067"
    },
    {
      "label": "Pierce County",
      "fips": "38069"
    },
    {
      "label": "Ramsey County",
      "fips": "38071"
    },
    {
      "label": "Ransom County",
      "fips": "38073"
    },
    {
      "label": "Renville County",
      "fips": "38075"
    },
    {
      "label": "Richland County",
      "fips": "38077"
    },
    {
      "label": "Rolette County",
      "fips": "38079"
    },
    {
      "label": "Sargent County",
      "fips": "38081"
    },
    {
      "label": "Sheridan County",
      "fips": "38083"
    },
    {
      "label": "Sioux County",
      "fips": "38085"
    },
    {
      "label": "Slope County",
      "fips": "38087"
    },
    {
      "label": "Stark County",
      "fips": "38089"
    },
    {
      "label": "Steele County",
      "fips": "38091"
    },
    {
      "label": "Stutsman County",
      "fips": "38093"
    },
    {
      "label": "Towner County",
      "fips": "38095"
    },
    {
      "label": "Traill County",
      "fips": "38097"
    },
    {
      "label": "Walsh County",
      "fips": "38099"
    },
    {
      "label": "Ward County",
      "fips": "38101"
    },
    {
      "label": "Wells County",
      "fips": "38103"
    },
    {
      "label": "Williams County",
      "fips": "38105"
    }
  ],
  "OH": [
    {
      "label": "Adams County",
      "fips": "39001"
    },
    {
      "label": "Allen County",
      "fips": "39003"
    },
    {
      "label": "Ashland County",
      "fips": "39005"
    },
    {
      "label": "Ashtabula County",
      "fips": "39007"
    },
    {
      "label": "Athens County",
      "fips": "39009"
    },
    {
      "label": "Auglaize County",
      "fips": "39011"
    },
    {
      "label": "Belmont County",
      "fips": "39013"
    },
    {
      "label": "Brown County",
      "fips": "39015"
    },
    {
      "label": "Butler County",
      "fips": "39017"
    },
    {
      "label": "Carroll County",
      "fips": "39019"
    },
    {
      "label": "Champaign County",
      "fips": "39021"
    },
    {
      "label": "Clark County",
      "fips": "39023"
    },
    {
      "label": "Clermont County",
      "fips": "39025"
    },
    {
      "label": "Clinton County",
      "fips": "39027"
    },
    {
      "label": "Columbiana County",
      "fips": "39029"
    },
    {
      "label": "Coshocton County",
      "fips": "39031"
    },
    {
      "label": "Crawford County",
      "fips": "39033"
    },
    {
      "label": "Cuyahoga County",
      "fips": "39035"
    },
    {
      "label": "Darke County",
      "fips": "39037"
    },
    {
      "label": "Defiance County",
      "fips": "39039"
    },
    {
      "label": "Delaware County",
      "fips": "39041"
    },
    {
      "label": "Erie County",
      "fips": "39043"
    },
    {
      "label": "Fairfield County",
      "fips": "39045"
    },
    {
      "label": "Fayette County",
      "fips": "39047"
    },
    {
      "label": "Franklin County",
      "fips": "39049"
    },
    {
      "label": "Fulton County",
      "fips": "39051"
    },
    {
      "label": "Gallia County",
      "fips": "39053"
    },
    {
      "label": "Geauga County",
      "fips": "39055"
    },
    {
      "label": "Greene County",
      "fips": "39057"
    },
    {
      "label": "Guernsey County",
      "fips": "39059"
    },
    {
      "label": "Hamilton County",
      "fips": "39061"
    },
    {
      "label": "Hancock County",
      "fips": "39063"
    },
    {
      "label": "Hardin County",
      "fips": "39065"
    },
    {
      "label": "Harrison County",
      "fips": "39067"
    },
    {
      "label": "Henry County",
      "fips": "39069"
    },
    {
      "label": "Highland County",
      "fips": "39071"
    },
    {
      "label": "Hocking County",
      "fips": "39073"
    },
    {
      "label": "Holmes County",
      "fips": "39075"
    },
    {
      "label": "Huron County",
      "fips": "39077"
    },
    {
      "label": "Jackson County",
      "fips": "39079"
    },
    {
      "label": "Jefferson County",
      "fips": "39081"
    },
    {
      "label": "Knox County",
      "fips": "39083"
    },
    {
      "label": "Lake County",
      "fips": "39085"
    },
    {
      "label": "Lawrence County",
      "fips": "39087"
    },
    {
      "label": "Licking County",
      "fips": "39089"
    },
    {
      "label": "Logan County",
      "fips": "39091"
    },
    {
      "label": "Lorain County",
      "fips": "39093"
    },
    {
      "label": "Lucas County",
      "fips": "39095"
    },
    {
      "label": "Madison County",
      "fips": "39097"
    },
    {
      "label": "Mahoning County",
      "fips": "39099"
    },
    {
      "label": "Marion County",
      "fips": "39101"
    },
    {
      "label": "Medina County",
      "fips": "39103"
    },
    {
      "label": "Meigs County",
      "fips": "39105"
    },
    {
      "label": "Mercer County",
      "fips": "39107"
    },
    {
      "label": "Miami County",
      "fips": "39109"
    },
    {
      "label": "Monroe County",
      "fips": "39111"
    },
    {
      "label": "Montgomery County",
      "fips": "39113"
    },
    {
      "label": "Morgan County",
      "fips": "39115"
    },
    {
      "label": "Morrow County",
      "fips": "39117"
    },
    {
      "label": "Muskingum County",
      "fips": "39119"
    },
    {
      "label": "Noble County",
      "fips": "39121"
    },
    {
      "label": "Ottawa County",
      "fips": "39123"
    },
    {
      "label": "Paulding County",
      "fips": "39125"
    },
    {
      "label": "Perry County",
      "fips": "39127"
    },
    {
      "label": "Pickaway County",
      "fips": "39129"
    },
    {
      "label": "Pike County",
      "fips": "39131"
    },
    {
      "label": "Portage County",
      "fips": "39133"
    },
    {
      "label": "Preble County",
      "fips": "39135"
    },
    {
      "label": "Putnam County",
      "fips": "39137"
    },
    {
      "label": "Richland County",
      "fips": "39139"
    },
    {
      "label": "Ross County",
      "fips": "39141"
    },
    {
      "label": "Sandusky County",
      "fips": "39143"
    },
    {
      "label": "Scioto County",
      "fips": "39145"
    },
    {
      "label": "Seneca County",
      "fips": "39147"
    },
    {
      "label": "Shelby County",
      "fips": "39149"
    },
    {
      "label": "Stark County",
      "fips": "39151"
    },
    {
      "label": "Summit County",
      "fips": "39153"
    },
    {
      "label": "Trumbull County",
      "fips": "39155"
    },
    {
      "label": "Tuscarawas County",
      "fips": "39157"
    },
    {
      "label": "Union County",
      "fips": "39159"
    },
    {
      "label": "Van Wert County",
      "fips": "39161"
    },
    {
      "label": "Vinton County",
      "fips": "39163"
    },
    {
      "label": "Warren County",
      "fips": "39165"
    },
    {
      "label": "Washington County",
      "fips": "39167"
    },
    {
      "label": "Wayne County",
      "fips": "39169"
    },
    {
      "label": "Williams County",
      "fips": "39171"
    },
    {
      "label": "Wood County",
      "fips": "39173"
    },
    {
      "label": "Wyandot County",
      "fips": "39175"
    }
  ],
  "OK": [
    {
      "label": "Adair County",
      "fips": "40001"
    },
    {
      "label": "Alfalfa County",
      "fips": "40003"
    },
    {
      "label": "Atoka County",
      "fips": "40005"
    },
    {
      "label": "Beaver County",
      "fips": "40007"
    },
    {
      "label": "Beckham County",
      "fips": "40009"
    },
    {
      "label": "Blaine County",
      "fips": "40011"
    },
    {
      "label": "Bryan County",
      "fips": "40013"
    },
    {
      "label": "Caddo County",
      "fips": "40015"
    },
    {
      "label": "Canadian County",
      "fips": "40017"
    },
    {
      "label": "Carter County",
      "fips": "40019"
    },
    {
      "label": "Cherokee County",
      "fips": "40021"
    },
    {
      "label": "Choctaw County",
      "fips": "40023"
    },
    {
      "label": "Cimarron County",
      "fips": "40025"
    },
    {
      "label": "Cleveland County",
      "fips": "40027"
    },
    {
      "label": "Coal County",
      "fips": "40029"
    },
    {
      "label": "Comanche County",
      "fips": "40031"
    },
    {
      "label": "Cotton County",
      "fips": "40033"
    },
    {
      "label": "Craig County",
      "fips": "40035"
    },
    {
      "label": "Creek County",
      "fips": "40037"
    },
    {
      "label": "Custer County",
      "fips": "40039"
    },
    {
      "label": "Delaware County",
      "fips": "40041"
    },
    {
      "label": "Dewey County",
      "fips": "40043"
    },
    {
      "label": "Ellis County",
      "fips": "40045"
    },
    {
      "label": "Garfield County",
      "fips": "40047"
    },
    {
      "label": "Garvin County",
      "fips": "40049"
    },
    {
      "label": "Grady County",
      "fips": "40051"
    },
    {
      "label": "Grant County",
      "fips": "40053"
    },
    {
      "label": "Greer County",
      "fips": "40055"
    },
    {
      "label": "Harmon County",
      "fips": "40057"
    },
    {
      "label": "Harper County",
      "fips": "40059"
    },
    {
      "label": "Haskell County",
      "fips": "40061"
    },
    {
      "label": "Hughes County",
      "fips": "40063"
    },
    {
      "label": "Jackson County",
      "fips": "40065"
    },
    {
      "label": "Jefferson County",
      "fips": "40067"
    },
    {
      "label": "Johnston County",
      "fips": "40069"
    },
    {
      "label": "Kay County",
      "fips": "40071"
    },
    {
      "label": "Kingfisher County",
      "fips": "40073"
    },
    {
      "label": "Kiowa County",
      "fips": "40075"
    },
    {
      "label": "Latimer County",
      "fips": "40077"
    },
    {
      "label": "Le Flore County",
      "fips": "40079"
    },
    {
      "label": "Lincoln County",
      "fips": "40081"
    },
    {
      "label": "Logan County",
      "fips": "40083"
    },
    {
      "label": "Love County",
      "fips": "40085"
    },
    {
      "label": "McClain County",
      "fips": "40087"
    },
    {
      "label": "McCurtain County",
      "fips": "40089"
    },
    {
      "label": "McIntosh County",
      "fips": "40091"
    },
    {
      "label": "Major County",
      "fips": "40093"
    },
    {
      "label": "Marshall County",
      "fips": "40095"
    },
    {
      "label": "Mayes County",
      "fips": "40097"
    },
    {
      "label": "Murray County",
      "fips": "40099"
    },
    {
      "label": "Muskogee County",
      "fips": "40101"
    },
    {
      "label": "Noble County",
      "fips": "40103"
    },
    {
      "label": "Nowata County",
      "fips": "40105"
    },
    {
      "label": "Okfuskee County",
      "fips": "40107"
    },
    {
      "label": "Oklahoma County",
      "fips": "40109"
    },
    {
      "label": "Okmulgee County",
      "fips": "40111"
    },
    {
      "label": "Osage County",
      "fips": "40113"
    },
    {
      "label": "Ottawa County",
      "fips": "40115"
    },
    {
      "label": "Pawnee County",
      "fips": "40117"
    },
    {
      "label": "Payne County",
      "fips": "40119"
    },
    {
      "label": "Pittsburg County",
      "fips": "40121"
    },
    {
      "label": "Pontotoc County",
      "fips": "40123"
    },
    {
      "label": "Pottawatomie County",
      "fips": "40125"
    },
    {
      "label": "Pushmataha County",
      "fips": "40127"
    },
    {
      "label": "Roger Mills County",
      "fips": "40129"
    },
    {
      "label": "Rogers County",
      "fips": "40131"
    },
    {
      "label": "Seminole County",
      "fips": "40133"
    },
    {
      "label": "Sequoyah County",
      "fips": "40135"
    },
    {
      "label": "Stephens County",
      "fips": "40137"
    },
    {
      "label": "Texas County",
      "fips": "40139"
    },
    {
      "label": "Tillman County",
      "fips": "40141"
    },
    {
      "label": "Tulsa County",
      "fips": "40143"
    },
    {
      "label": "Wagoner County",
      "fips": "40145"
    },
    {
      "label": "Washington County",
      "fips": "40147"
    },
    {
      "label": "Washita County",
      "fips": "40149"
    },
    {
      "label": "Woods County",
      "fips": "40151"
    },
    {
      "label": "Woodward County",
      "fips": "40153"
    }
  ],
  "OR": [
    {
      "label": "Baker County",
      "fips": "41001"
    },
    {
      "label": "Benton County",
      "fips": "41003"
    },
    {
      "label": "Clackamas County",
      "fips": "41005"
    },
    {
      "label": "Clatsop County",
      "fips": "41007"
    },
    {
      "label": "Columbia County",
      "fips": "41009"
    },
    {
      "label": "Coos County",
      "fips": "41011"
    },
    {
      "label": "Crook County",
      "fips": "41013"
    },
    {
      "label": "Curry County",
      "fips": "41015"
    },
    {
      "label": "Deschutes County",
      "fips": "41017"
    },
    {
      "label": "Douglas County",
      "fips": "41019"
    },
    {
      "label": "Gilliam County",
      "fips": "41021"
    },
    {
      "label": "Grant County",
      "fips": "41023"
    },
    {
      "label": "Harney County",
      "fips": "41025"
    },
    {
      "label": "Hood River County",
      "fips": "41027"
    },
    {
      "label": "Jackson County",
      "fips": "41029"
    },
    {
      "label": "Jefferson County",
      "fips": "41031"
    },
    {
      "label": "Josephine County",
      "fips": "41033"
    },
    {
      "label": "Klamath County",
      "fips": "41035"
    },
    {
      "label": "Lake County",
      "fips": "41037"
    },
    {
      "label": "Lane County",
      "fips": "41039"
    },
    {
      "label": "Lincoln County",
      "fips": "41041"
    },
    {
      "label": "Linn County",
      "fips": "41043"
    },
    {
      "label": "Malheur County",
      "fips": "41045"
    },
    {
      "label": "Marion County",
      "fips": "41047"
    },
    {
      "label": "Morrow County",
      "fips": "41049"
    },
    {
      "label": "Multnomah County",
      "fips": "41051"
    },
    {
      "label": "Polk County",
      "fips": "41053"
    },
    {
      "label": "Sherman County",
      "fips": "41055"
    },
    {
      "label": "Tillamook County",
      "fips": "41057"
    },
    {
      "label": "Umatilla County",
      "fips": "41059"
    },
    {
      "label": "Union County",
      "fips": "41061"
    },
    {
      "label": "Wallowa County",
      "fips": "41063"
    },
    {
      "label": "Wasco County",
      "fips": "41065"
    },
    {
      "label": "Washington County",
      "fips": "41067"
    },
    {
      "label": "Wheeler County",
      "fips": "41069"
    },
    {
      "label": "Yamhill County",
      "fips": "41071"
    }
  ],
  "PA": [
    {
      "label": "Adams County",
      "fips": "42001"
    },
    {
      "label": "Allegheny County",
      "fips": "42003"
    },
    {
      "label": "Armstrong County",
      "fips": "42005"
    },
    {
      "label": "Beaver County",
      "fips": "42007"
    },
    {
      "label": "Bedford County",
      "fips": "42009"
    },
    {
      "label": "Berks County",
      "fips": "42011"
    },
    {
      "label": "Blair County",
      "fips": "42013"
    },
    {
      "label": "Bradford County",
      "fips": "42015"
    },
    {
      "label": "Bucks County",
      "fips": "42017"
    },
    {
      "label": "Butler County",
      "fips": "42019"
    },
    {
      "label": "Cambria County",
      "fips": "42021"
    },
    {
      "label": "Cameron County",
      "fips": "42023"
    },
    {
      "label": "Carbon County",
      "fips": "42025"
    },
    {
      "label": "Centre County",
      "fips": "42027"
    },
    {
      "label": "Chester County",
      "fips": "42029"
    },
    {
      "label": "Clarion County",
      "fips": "42031"
    },
    {
      "label": "Clearfield County",
      "fips": "42033"
    },
    {
      "label": "Clinton County",
      "fips": "42035"
    },
    {
      "label": "Columbia County",
      "fips": "42037"
    },
    {
      "label": "Crawford County",
      "fips": "42039"
    },
    {
      "label": "Cumberland County",
      "fips": "42041"
    },
    {
      "label": "Dauphin County",
      "fips": "42043"
    },
    {
      "label": "Delaware County",
      "fips": "42045"
    },
    {
      "label": "Elk County",
      "fips": "42047"
    },
    {
      "label": "Erie County",
      "fips": "42049"
    },
    {
      "label": "Fayette County",
      "fips": "42051"
    },
    {
      "label": "Forest County",
      "fips": "42053"
    },
    {
      "label": "Franklin County",
      "fips": "42055"
    },
    {
      "label": "Fulton County",
      "fips": "42057"
    },
    {
      "label": "Greene County",
      "fips": "42059"
    },
    {
      "label": "Huntingdon County",
      "fips": "42061"
    },
    {
      "label": "Indiana County",
      "fips": "42063"
    },
    {
      "label": "Jefferson County",
      "fips": "42065"
    },
    {
      "label": "Juniata County",
      "fips": "42067"
    },
    {
      "label": "Lackawanna County",
      "fips": "42069"
    },
    {
      "label": "Lancaster County",
      "fips": "42071"
    },
    {
      "label": "Lawrence County",
      "fips": "42073"
    },
    {
      "label": "Lebanon County",
      "fips": "42075"
    },
    {
      "label": "Lehigh County",
      "fips": "42077"
    },
    {
      "label": "Luzerne County",
      "fips": "42079"
    },
    {
      "label": "Lycoming County",
      "fips": "42081"
    },
    {
      "label": "McKean County",
      "fips": "42083"
    },
    {
      "label": "Mercer County",
      "fips": "42085"
    },
    {
      "label": "Mifflin County",
      "fips": "42087"
    },
    {
      "label": "Monroe County",
      "fips": "42089"
    },
    {
      "label": "Montgomery County",
      "fips": "42091"
    },
    {
      "label": "Montour County",
      "fips": "42093"
    },
    {
      "label": "Northampton County",
      "fips": "42095"
    },
    {
      "label": "Northumberland County",
      "fips": "42097"
    },
    {
      "label": "Perry County",
      "fips": "42099"
    },
    {
      "label": "Philadelphia County",
      "fips": "42101"
    },
    {
      "label": "Pike County",
      "fips": "42103"
    },
    {
      "label": "Potter County",
      "fips": "42105"
    },
    {
      "label": "Schuylkill County",
      "fips": "42107"
    },
    {
      "label": "Snyder County",
      "fips": "42109"
    },
    {
      "label": "Somerset County",
      "fips": "42111"
    },
    {
      "label": "Sullivan County",
      "fips": "42113"
    },
    {
      "label": "Susquehanna County",
      "fips": "42115"
    },
    {
      "label": "Tioga County",
      "fips": "42117"
    },
    {
      "label": "Union County",
      "fips": "42119"
    },
    {
      "label": "Venango County",
      "fips": "42121"
    },
    {
      "label": "Warren County",
      "fips": "42123"
    },
    {
      "label": "Washington County",
      "fips": "42125"
    },
    {
      "label": "Wayne County",
      "fips": "42127"
    },
    {
      "label": "Westmoreland County",
      "fips": "42129"
    },
    {
      "label": "Wyoming County",
      "fips": "42131"
    },
    {
      "label": "York County",
      "fips": "42133"
    }
  ],
  "RI": [
    {
      "label": "Bristol County",
      "fips": "44001"
    },
    {
      "label": "Kent County",
      "fips": "44003"
    },
    {
      "label": "Newport County",
      "fips": "44005"
    },
    {
      "label": "Providence County",
      "fips": "44007"
    },
    {
      "label": "Washington County",
      "fips": "44009"
    }
  ],
  "SC": [
    {
      "label": "Abbeville County",
      "fips": "45001"
    },
    {
      "label": "Aiken County",
      "fips": "45003"
    },
    {
      "label": "Allendale County",
      "fips": "45005"
    },
    {
      "label": "Anderson County",
      "fips": "45007"
    },
    {
      "label": "Bamberg County",
      "fips": "45009"
    },
    {
      "label": "Barnwell County",
      "fips": "45011"
    },
    {
      "label": "Beaufort County",
      "fips": "45013"
    },
    {
      "label": "Berkeley County",
      "fips": "45015"
    },
    {
      "label": "Calhoun County",
      "fips": "45017"
    },
    {
      "label": "Charleston County",
      "fips": "45019"
    },
    {
      "label": "Cherokee County",
      "fips": "45021"
    },
    {
      "label": "Chester County",
      "fips": "45023"
    },
    {
      "label": "Chesterfield County",
      "fips": "45025"
    },
    {
      "label": "Clarendon County",
      "fips": "45027"
    },
    {
      "label": "Colleton County",
      "fips": "45029"
    },
    {
      "label": "Darlington County",
      "fips": "45031"
    },
    {
      "label": "Dillon County",
      "fips": "45033"
    },
    {
      "label": "Dorchester County",
      "fips": "45035"
    },
    {
      "label": "Edgefield County",
      "fips": "45037"
    },
    {
      "label": "Fairfield County",
      "fips": "45039"
    },
    {
      "label": "Florence County",
      "fips": "45041"
    },
    {
      "label": "Georgetown County",
      "fips": "45043"
    },
    {
      "label": "Greenville County",
      "fips": "45045"
    },
    {
      "label": "Greenwood County",
      "fips": "45047"
    },
    {
      "label": "Hampton County",
      "fips": "45049"
    },
    {
      "label": "Horry County",
      "fips": "45051"
    },
    {
      "label": "Jasper County",
      "fips": "45053"
    },
    {
      "label": "Kershaw County",
      "fips": "45055"
    },
    {
      "label": "Lancaster County",
      "fips": "45057"
    },
    {
      "label": "Laurens County",
      "fips": "45059"
    },
    {
      "label": "Lee County",
      "fips": "45061"
    },
    {
      "label": "Lexington County",
      "fips": "45063"
    },
    {
      "label": "McCormick County",
      "fips": "45065"
    },
    {
      "label": "Marion County",
      "fips": "45067"
    },
    {
      "label": "Marlboro County",
      "fips": "45069"
    },
    {
      "label": "Newberry County",
      "fips": "45071"
    },
    {
      "label": "Oconee County",
      "fips": "45073"
    },
    {
      "label": "Orangeburg County",
      "fips": "45075"
    },
    {
      "label": "Pickens County",
      "fips": "45077"
    },
    {
      "label": "Richland County",
      "fips": "45079"
    },
    {
      "label": "Saluda County",
      "fips": "45081"
    },
    {
      "label": "Spartanburg County",
      "fips": "45083"
    },
    {
      "label": "Sumter County",
      "fips": "45085"
    },
    {
      "label": "Union County",
      "fips": "45087"
    },
    {
      "label": "Williamsburg County",
      "fips": "45089"
    },
    {
      "label": "York County",
      "fips": "45091"
    }
  ],
  "SD": [
    {
      "label": "Aurora County",
      "fips": "46003"
    },
    {
      "label": "Beadle County",
      "fips": "46005"
    },
    {
      "label": "Bennett County",
      "fips": "46007"
    },
    {
      "label": "Bon Homme County",
      "fips": "46009"
    },
    {
      "label": "Brookings County",
      "fips": "46011"
    },
    {
      "label": "Brown County",
      "fips": "46013"
    },
    {
      "label": "Brule County",
      "fips": "46015"
    },
    {
      "label": "Buffalo County",
      "fips": "46017"
    },
    {
      "label": "Butte County",
      "fips": "46019"
    },
    {
      "label": "Campbell County",
      "fips": "46021"
    },
    {
      "label": "Charles Mix County",
      "fips": "46023"
    },
    {
      "label": "Clark County",
      "fips": "46025"
    },
    {
      "label": "Clay County",
      "fips": "46027"
    },
    {
      "label": "Codington County",
      "fips": "46029"
    },
    {
      "label": "Corson County",
      "fips": "46031"
    },
    {
      "label": "Custer County",
      "fips": "46033"
    },
    {
      "label": "Davison County",
      "fips": "46035"
    },
    {
      "label": "Day County",
      "fips": "46037"
    },
    {
      "label": "Deuel County",
      "fips": "46039"
    },
    {
      "label": "Dewey County",
      "fips": "46041"
    },
    {
      "label": "Douglas County",
      "fips": "46043"
    },
    {
      "label": "Edmunds County",
      "fips": "46045"
    },
    {
      "label": "Fall River County",
      "fips": "46047"
    },
    {
      "label": "Faulk County",
      "fips": "46049"
    },
    {
      "label": "Grant County",
      "fips": "46051"
    },
    {
      "label": "Gregory County",
      "fips": "46053"
    },
    {
      "label": "Haakon County",
      "fips": "46055"
    },
    {
      "label": "Hamlin County",
      "fips": "46057"
    },
    {
      "label": "Hand County",
      "fips": "46059"
    },
    {
      "label": "Hanson County",
      "fips": "46061"
    },
    {
      "label": "Harding County",
      "fips": "46063"
    },
    {
      "label": "Hughes County",
      "fips": "46065"
    },
    {
      "label": "Hutchinson County",
      "fips": "46067"
    },
    {
      "label": "Hyde County",
      "fips": "46069"
    },
    {
      "label": "Jackson County",
      "fips": "46071"
    },
    {
      "label": "Jerauld County",
      "fips": "46073"
    },
    {
      "label": "Jones County",
      "fips": "46075"
    },
    {
      "label": "Kingsbury County",
      "fips": "46077"
    },
    {
      "label": "Lake County",
      "fips": "46079"
    },
    {
      "label": "Lawrence County",
      "fips": "46081"
    },
    {
      "label": "Lincoln County",
      "fips": "46083"
    },
    {
      "label": "Lyman County",
      "fips": "46085"
    },
    {
      "label": "McCook County",
      "fips": "46087"
    },
    {
      "label": "McPherson County",
      "fips": "46089"
    },
    {
      "label": "Marshall County",
      "fips": "46091"
    },
    {
      "label": "Meade County",
      "fips": "46093"
    },
    {
      "label": "Mellette County",
      "fips": "46095"
    },
    {
      "label": "Miner County",
      "fips": "46097"
    },
    {
      "label": "Minnehaha County",
      "fips": "46099"
    },
    {
      "label": "Moody County",
      "fips": "46101"
    },
    {
      "label": "Pennington County",
      "fips": "46103"
    },
    {
      "label": "Perkins County",
      "fips": "46105"
    },
    {
      "label": "Potter County",
      "fips": "46107"
    },
    {
      "label": "Roberts County",
      "fips": "46109"
    },
    {
      "label": "Sanborn County",
      "fips": "46111"
    },
    {
      "label": "Shannon County",
      "fips": "46113"
    },
    {
      "label": "Spink County",
      "fips": "46115"
    },
    {
      "label": "Stanley County",
      "fips": "46117"
    },
    {
      "label": "Sully County",
      "fips": "46119"
    },
    {
      "label": "Todd County",
      "fips": "46121"
    },
    {
      "label": "Tripp County",
      "fips": "46123"
    },
    {
      "label": "Turner County",
      "fips": "46125"
    },
    {
      "label": "Union County",
      "fips": "46127"
    },
    {
      "label": "Walworth County",
      "fips": "46129"
    },
    {
      "label": "Yankton County",
      "fips": "46135"
    },
    {
      "label": "Ziebach County",
      "fips": "46137"
    }
  ],
  "TN": [
    {
      "label": "Anderson County",
      "fips": "47001"
    },
    {
      "label": "Bedford County",
      "fips": "47003"
    },
    {
      "label": "Benton County",
      "fips": "47005"
    },
    {
      "label": "Bledsoe County",
      "fips": "47007"
    },
    {
      "label": "Blount County",
      "fips": "47009"
    },
    {
      "label": "Bradley County",
      "fips": "47011"
    },
    {
      "label": "Campbell County",
      "fips": "47013"
    },
    {
      "label": "Cannon County",
      "fips": "47015"
    },
    {
      "label": "Carroll County",
      "fips": "47017"
    },
    {
      "label": "Carter County",
      "fips": "47019"
    },
    {
      "label": "Cheatham County",
      "fips": "47021"
    },
    {
      "label": "Chester County",
      "fips": "47023"
    },
    {
      "label": "Claiborne County",
      "fips": "47025"
    },
    {
      "label": "Clay County",
      "fips": "47027"
    },
    {
      "label": "Cocke County",
      "fips": "47029"
    },
    {
      "label": "Coffee County",
      "fips": "47031"
    },
    {
      "label": "Crockett County",
      "fips": "47033"
    },
    {
      "label": "Cumberland County",
      "fips": "47035"
    },
    {
      "label": "Davidson County",
      "fips": "47037"
    },
    {
      "label": "Decatur County",
      "fips": "47039"
    },
    {
      "label": "DeKalb County",
      "fips": "47041"
    },
    {
      "label": "Dickson County",
      "fips": "47043"
    },
    {
      "label": "Dyer County",
      "fips": "47045"
    },
    {
      "label": "Fayette County",
      "fips": "47047"
    },
    {
      "label": "Fentress County",
      "fips": "47049"
    },
    {
      "label": "Franklin County",
      "fips": "47051"
    },
    {
      "label": "Gibson County",
      "fips": "47053"
    },
    {
      "label": "Giles County",
      "fips": "47055"
    },
    {
      "label": "Grainger County",
      "fips": "47057"
    },
    {
      "label": "Greene County",
      "fips": "47059"
    },
    {
      "label": "Grundy County",
      "fips": "47061"
    },
    {
      "label": "Hamblen County",
      "fips": "47063"
    },
    {
      "label": "Hamilton County",
      "fips": "47065"
    },
    {
      "label": "Hancock County",
      "fips": "47067"
    },
    {
      "label": "Hardeman County",
      "fips": "47069"
    },
    {
      "label": "Hardin County",
      "fips": "47071"
    },
    {
      "label": "Hawkins County",
      "fips": "47073"
    },
    {
      "label": "Haywood County",
      "fips": "47075"
    },
    {
      "label": "Henderson County",
      "fips": "47077"
    },
    {
      "label": "Henry County",
      "fips": "47079"
    },
    {
      "label": "Hickman County",
      "fips": "47081"
    },
    {
      "label": "Houston County",
      "fips": "47083"
    },
    {
      "label": "Humphreys County",
      "fips": "47085"
    },
    {
      "label": "Jackson County",
      "fips": "47087"
    },
    {
      "label": "Jefferson County",
      "fips": "47089"
    },
    {
      "label": "Johnson County",
      "fips": "47091"
    },
    {
      "label": "Knox County",
      "fips": "47093"
    },
    {
      "label": "Lake County",
      "fips": "47095"
    },
    {
      "label": "Lauderdale County",
      "fips": "47097"
    },
    {
      "label": "Lawrence County",
      "fips": "47099"
    },
    {
      "label": "Lewis County",
      "fips": "47101"
    },
    {
      "label": "Lincoln County",
      "fips": "47103"
    },
    {
      "label": "Loudon County",
      "fips": "47105"
    },
    {
      "label": "McMinn County",
      "fips": "47107"
    },
    {
      "label": "McNairy County",
      "fips": "47109"
    },
    {
      "label": "Macon County",
      "fips": "47111"
    },
    {
      "label": "Madison County",
      "fips": "47113"
    },
    {
      "label": "Marion County",
      "fips": "47115"
    },
    {
      "label": "Marshall County",
      "fips": "47117"
    },
    {
      "label": "Maury County",
      "fips": "47119"
    },
    {
      "label": "Meigs County",
      "fips": "47121"
    },
    {
      "label": "Monroe County",
      "fips": "47123"
    },
    {
      "label": "Montgomery County",
      "fips": "47125"
    },
    {
      "label": "Moore County",
      "fips": "47127"
    },
    {
      "label": "Morgan County",
      "fips": "47129"
    },
    {
      "label": "Obion County",
      "fips": "47131"
    },
    {
      "label": "Overton County",
      "fips": "47133"
    },
    {
      "label": "Perry County",
      "fips": "47135"
    },
    {
      "label": "Pickett County",
      "fips": "47137"
    },
    {
      "label": "Polk County",
      "fips": "47139"
    },
    {
      "label": "Putnam County",
      "fips": "47141"
    },
    {
      "label": "Rhea County",
      "fips": "47143"
    },
    {
      "label": "Roane County",
      "fips": "47145"
    },
    {
      "label": "Robertson County",
      "fips": "47147"
    },
    {
      "label": "Rutherford County",
      "fips": "47149"
    },
    {
      "label": "Scott County",
      "fips": "47151"
    },
    {
      "label": "Sequatchie County",
      "fips": "47153"
    },
    {
      "label": "Sevier County",
      "fips": "47155"
    },
    {
      "label": "Shelby County",
      "fips": "47157"
    },
    {
      "label": "Smith County",
      "fips": "47159"
    },
    {
      "label": "Stewart County",
      "fips": "47161"
    },
    {
      "label": "Sullivan County",
      "fips": "47163"
    },
    {
      "label": "Sumner County",
      "fips": "47165"
    },
    {
      "label": "Tipton County",
      "fips": "47167"
    },
    {
      "label": "Trousdale County",
      "fips": "47169"
    },
    {
      "label": "Unicoi County",
      "fips": "47171"
    },
    {
      "label": "Union County",
      "fips": "47173"
    },
    {
      "label": "Van Buren County",
      "fips": "47175"
    },
    {
      "label": "Warren County",
      "fips": "47177"
    },
    {
      "label": "Washington County",
      "fips": "47179"
    },
    {
      "label": "Wayne County",
      "fips": "47181"
    },
    {
      "label": "Weakley County",
      "fips": "47183"
    },
    {
      "label": "White County",
      "fips": "47185"
    },
    {
      "label": "Williamson County",
      "fips": "47187"
    },
    {
      "label": "Wilson County",
      "fips": "47189"
    }
  ],
  "TX": [
    {
      "label": "Anderson County",
      "fips": "48001"
    },
    {
      "label": "Andrews County",
      "fips": "48003"
    },
    {
      "label": "Angelina County",
      "fips": "48005"
    },
    {
      "label": "Aransas County",
      "fips": "48007"
    },
    {
      "label": "Archer County",
      "fips": "48009"
    },
    {
      "label": "Armstrong County",
      "fips": "48011"
    },
    {
      "label": "Atascosa County",
      "fips": "48013"
    },
    {
      "label": "Austin County",
      "fips": "48015"
    },
    {
      "label": "Bailey County",
      "fips": "48017"
    },
    {
      "label": "Bandera County",
      "fips": "48019"
    },
    {
      "label": "Bastrop County",
      "fips": "48021"
    },
    {
      "label": "Baylor County",
      "fips": "48023"
    },
    {
      "label": "Bee County",
      "fips": "48025"
    },
    {
      "label": "Bell County",
      "fips": "48027"
    },
    {
      "label": "Bexar County",
      "fips": "48029"
    },
    {
      "label": "Blanco County",
      "fips": "48031"
    },
    {
      "label": "Borden County",
      "fips": "48033"
    },
    {
      "label": "Bosque County",
      "fips": "48035"
    },
    {
      "label": "Bowie County",
      "fips": "48037"
    },
    {
      "label": "Brazoria County",
      "fips": "48039"
    },
    {
      "label": "Brazos County",
      "fips": "48041"
    },
    {
      "label": "Brewster County",
      "fips": "48043"
    },
    {
      "label": "Briscoe County",
      "fips": "48045"
    },
    {
      "label": "Brooks County",
      "fips": "48047"
    },
    {
      "label": "Brown County",
      "fips": "48049"
    },
    {
      "label": "Burleson County",
      "fips": "48051"
    },
    {
      "label": "Burnet County",
      "fips": "48053"
    },
    {
      "label": "Caldwell County",
      "fips": "48055"
    },
    {
      "label": "Calhoun County",
      "fips": "48057"
    },
    {
      "label": "Callahan County",
      "fips": "48059"
    },
    {
      "label": "Cameron County",
      "fips": "48061"
    },
    {
      "label": "Camp County",
      "fips": "48063"
    },
    {
      "label": "Carson County",
      "fips": "48065"
    },
    {
      "label": "Cass County",
      "fips": "48067"
    },
    {
      "label": "Castro County",
      "fips": "48069"
    },
    {
      "label": "Chambers County",
      "fips": "48071"
    },
    {
      "label": "Cherokee County",
      "fips": "48073"
    },
    {
      "label": "Childress County",
      "fips": "48075"
    },
    {
      "label": "Clay County",
      "fips": "48077"
    },
    {
      "label": "Cochran County",
      "fips": "48079"
    },
    {
      "label": "Coke County",
      "fips": "48081"
    },
    {
      "label": "Coleman County",
      "fips": "48083"
    },
    {
      "label": "Collin County",
      "fips": "48085"
    },
    {
      "label": "Collingsworth County",
      "fips": "48087"
    },
    {
      "label": "Colorado County",
      "fips": "48089"
    },
    {
      "label": "Comal County",
      "fips": "48091"
    },
    {
      "label": "Comanche County",
      "fips": "48093"
    },
    {
      "label": "Concho County",
      "fips": "48095"
    },
    {
      "label": "Cooke County",
      "fips": "48097"
    },
    {
      "label": "Coryell County",
      "fips": "48099"
    },
    {
      "label": "Cottle County",
      "fips": "48101"
    },
    {
      "label": "Crane County",
      "fips": "48103"
    },
    {
      "label": "Crockett County",
      "fips": "48105"
    },
    {
      "label": "Crosby County",
      "fips": "48107"
    },
    {
      "label": "Culberson County",
      "fips": "48109"
    },
    {
      "label": "Dallam County",
      "fips": "48111"
    },
    {
      "label": "Dallas County",
      "fips": "48113"
    },
    {
      "label": "Dawson County",
      "fips": "48115"
    },
    {
      "label": "Deaf Smith County",
      "fips": "48117"
    },
    {
      "label": "Delta County",
      "fips": "48119"
    },
    {
      "label": "Denton County",
      "fips": "48121"
    },
    {
      "label": "DeWitt County",
      "fips": "48123"
    },
    {
      "label": "Dickens County",
      "fips": "48125"
    },
    {
      "label": "Dimmit County",
      "fips": "48127"
    },
    {
      "label": "Donley County",
      "fips": "48129"
    },
    {
      "label": "Duval County",
      "fips": "48131"
    },
    {
      "label": "Eastland County",
      "fips": "48133"
    },
    {
      "label": "Ector County",
      "fips": "48135"
    },
    {
      "label": "Edwards County",
      "fips": "48137"
    },
    {
      "label": "Ellis County",
      "fips": "48139"
    },
    {
      "label": "El Paso County",
      "fips": "48141"
    },
    {
      "label": "Erath County",
      "fips": "48143"
    },
    {
      "label": "Falls County",
      "fips": "48145"
    },
    {
      "label": "Fannin County",
      "fips": "48147"
    },
    {
      "label": "Fayette County",
      "fips": "48149"
    },
    {
      "label": "Fisher County",
      "fips": "48151"
    },
    {
      "label": "Floyd County",
      "fips": "48153"
    },
    {
      "label": "Foard County",
      "fips": "48155"
    },
    {
      "label": "Fort Bend County",
      "fips": "48157"
    },
    {
      "label": "Franklin County",
      "fips": "48159"
    },
    {
      "label": "Freestone County",
      "fips": "48161"
    },
    {
      "label": "Frio County",
      "fips": "48163"
    },
    {
      "label": "Gaines County",
      "fips": "48165"
    },
    {
      "label": "Galveston County",
      "fips": "48167"
    },
    {
      "label": "Garza County",
      "fips": "48169"
    },
    {
      "label": "Gillespie County",
      "fips": "48171"
    },
    {
      "label": "Glasscock County",
      "fips": "48173"
    },
    {
      "label": "Goliad County",
      "fips": "48175"
    },
    {
      "label": "Gonzales County",
      "fips": "48177"
    },
    {
      "label": "Gray County",
      "fips": "48179"
    },
    {
      "label": "Grayson County",
      "fips": "48181"
    },
    {
      "label": "Gregg County",
      "fips": "48183"
    },
    {
      "label": "Grimes County",
      "fips": "48185"
    },
    {
      "label": "Guadalupe County",
      "fips": "48187"
    },
    {
      "label": "Hale County",
      "fips": "48189"
    },
    {
      "label": "Hall County",
      "fips": "48191"
    },
    {
      "label": "Hamilton County",
      "fips": "48193"
    },
    {
      "label": "Hansford County",
      "fips": "48195"
    },
    {
      "label": "Hardeman County",
      "fips": "48197"
    },
    {
      "label": "Hardin County",
      "fips": "48199"
    },
    {
      "label": "Harris County",
      "fips": "48201"
    },
    {
      "label": "Harrison County",
      "fips": "48203"
    },
    {
      "label": "Hartley County",
      "fips": "48205"
    },
    {
      "label": "Haskell County",
      "fips": "48207"
    },
    {
      "label": "Hays County",
      "fips": "48209"
    },
    {
      "label": "Hemphill County",
      "fips": "48211"
    },
    {
      "label": "Henderson County",
      "fips": "48213"
    },
    {
      "label": "Hidalgo County",
      "fips": "48215"
    },
    {
      "label": "Hill County",
      "fips": "48217"
    },
    {
      "label": "Hockley County",
      "fips": "48219"
    },
    {
      "label": "Hood County",
      "fips": "48221"
    },
    {
      "label": "Hopkins County",
      "fips": "48223"
    },
    {
      "label": "Houston County",
      "fips": "48225"
    },
    {
      "label": "Howard County",
      "fips": "48227"
    },
    {
      "label": "Hudspeth County",
      "fips": "48229"
    },
    {
      "label": "Hunt County",
      "fips": "48231"
    },
    {
      "label": "Hutchinson County",
      "fips": "48233"
    },
    {
      "label": "Irion County",
      "fips": "48235"
    },
    {
      "label": "Jack County",
      "fips": "48237"
    },
    {
      "label": "Jackson County",
      "fips": "48239"
    },
    {
      "label": "Jasper County",
      "fips": "48241"
    },
    {
      "label": "Jeff Davis County",
      "fips": "48243"
    },
    {
      "label": "Jefferson County",
      "fips": "48245"
    },
    {
      "label": "Jim Hogg County",
      "fips": "48247"
    },
    {
      "label": "Jim Wells County",
      "fips": "48249"
    },
    {
      "label": "Johnson County",
      "fips": "48251"
    },
    {
      "label": "Jones County",
      "fips": "48253"
    },
    {
      "label": "Karnes County",
      "fips": "48255"
    },
    {
      "label": "Kaufman County",
      "fips": "48257"
    },
    {
      "label": "Kendall County",
      "fips": "48259"
    },
    {
      "label": "Kenedy County",
      "fips": "48261"
    },
    {
      "label": "Kent County",
      "fips": "48263"
    },
    {
      "label": "Kerr County",
      "fips": "48265"
    },
    {
      "label": "Kimble County",
      "fips": "48267"
    },
    {
      "label": "King County",
      "fips": "48269"
    },
    {
      "label": "Kinney County",
      "fips": "48271"
    },
    {
      "label": "Kleberg County",
      "fips": "48273"
    },
    {
      "label": "Knox County",
      "fips": "48275"
    },
    {
      "label": "Lamar County",
      "fips": "48277"
    },
    {
      "label": "Lamb County",
      "fips": "48279"
    },
    {
      "label": "Lampasas County",
      "fips": "48281"
    },
    {
      "label": "La Salle County",
      "fips": "48283"
    },
    {
      "label": "Lavaca County",
      "fips": "48285"
    },
    {
      "label": "Lee County",
      "fips": "48287"
    },
    {
      "label": "Leon County",
      "fips": "48289"
    },
    {
      "label": "Liberty County",
      "fips": "48291"
    },
    {
      "label": "Limestone County",
      "fips": "48293"
    },
    {
      "label": "Lipscomb County",
      "fips": "48295"
    },
    {
      "label": "Live Oak County",
      "fips": "48297"
    },
    {
      "label": "Llano County",
      "fips": "48299"
    },
    {
      "label": "Loving County",
      "fips": "48301"
    },
    {
      "label": "Lubbock County",
      "fips": "48303"
    },
    {
      "label": "Lynn County",
      "fips": "48305"
    },
    {
      "label": "McCulloch County",
      "fips": "48307"
    },
    {
      "label": "McLennan County",
      "fips": "48309"
    },
    {
      "label": "McMullen County",
      "fips": "48311"
    },
    {
      "label": "Madison County",
      "fips": "48313"
    },
    {
      "label": "Marion County",
      "fips": "48315"
    },
    {
      "label": "Martin County",
      "fips": "48317"
    },
    {
      "label": "Mason County",
      "fips": "48319"
    },
    {
      "label": "Matagorda County",
      "fips": "48321"
    },
    {
      "label": "Maverick County",
      "fips": "48323"
    },
    {
      "label": "Medina County",
      "fips": "48325"
    },
    {
      "label": "Menard County",
      "fips": "48327"
    },
    {
      "label": "Midland County",
      "fips": "48329"
    },
    {
      "label": "Milam County",
      "fips": "48331"
    },
    {
      "label": "Mills County",
      "fips": "48333"
    },
    {
      "label": "Mitchell County",
      "fips": "48335"
    },
    {
      "label": "Montague County",
      "fips": "48337"
    },
    {
      "label": "Montgomery County",
      "fips": "48339"
    },
    {
      "label": "Moore County",
      "fips": "48341"
    },
    {
      "label": "Morris County",
      "fips": "48343"
    },
    {
      "label": "Motley County",
      "fips": "48345"
    },
    {
      "label": "Nacogdoches County",
      "fips": "48347"
    },
    {
      "label": "Navarro County",
      "fips": "48349"
    },
    {
      "label": "Newton County",
      "fips": "48351"
    },
    {
      "label": "Nolan County",
      "fips": "48353"
    },
    {
      "label": "Nueces County",
      "fips": "48355"
    },
    {
      "label": "Ochiltree County",
      "fips": "48357"
    },
    {
      "label": "Oldham County",
      "fips": "48359"
    },
    {
      "label": "Orange County",
      "fips": "48361"
    },
    {
      "label": "Palo Pinto County",
      "fips": "48363"
    },
    {
      "label": "Panola County",
      "fips": "48365"
    },
    {
      "label": "Parker County",
      "fips": "48367"
    },
    {
      "label": "Parmer County",
      "fips": "48369"
    },
    {
      "label": "Pecos County",
      "fips": "48371"
    },
    {
      "label": "Polk County",
      "fips": "48373"
    },
    {
      "label": "Potter County",
      "fips": "48375"
    },
    {
      "label": "Presidio County",
      "fips": "48377"
    },
    {
      "label": "Rains County",
      "fips": "48379"
    },
    {
      "label": "Randall County",
      "fips": "48381"
    },
    {
      "label": "Reagan County",
      "fips": "48383"
    },
    {
      "label": "Real County",
      "fips": "48385"
    },
    {
      "label": "Red River County",
      "fips": "48387"
    },
    {
      "label": "Reeves County",
      "fips": "48389"
    },
    {
      "label": "Refugio County",
      "fips": "48391"
    },
    {
      "label": "Roberts County",
      "fips": "48393"
    },
    {
      "label": "Robertson County",
      "fips": "48395"
    },
    {
      "label": "Rockwall County",
      "fips": "48397"
    },
    {
      "label": "Runnels County",
      "fips": "48399"
    },
    {
      "label": "Rusk County",
      "fips": "48401"
    },
    {
      "label": "Sabine County",
      "fips": "48403"
    },
    {
      "label": "San Augustine County",
      "fips": "48405"
    },
    {
      "label": "San Jacinto County",
      "fips": "48407"
    },
    {
      "label": "San Patricio County",
      "fips": "48409"
    },
    {
      "label": "San Saba County",
      "fips": "48411"
    },
    {
      "label": "Schleicher County",
      "fips": "48413"
    },
    {
      "label": "Scurry County",
      "fips": "48415"
    },
    {
      "label": "Shackelford County",
      "fips": "48417"
    },
    {
      "label": "Shelby County",
      "fips": "48419"
    },
    {
      "label": "Sherman County",
      "fips": "48421"
    },
    {
      "label": "Smith County",
      "fips": "48423"
    },
    {
      "label": "Somervell County",
      "fips": "48425"
    },
    {
      "label": "Starr County",
      "fips": "48427"
    },
    {
      "label": "Stephens County",
      "fips": "48429"
    },
    {
      "label": "Sterling County",
      "fips": "48431"
    },
    {
      "label": "Stonewall County",
      "fips": "48433"
    },
    {
      "label": "Sutton County",
      "fips": "48435"
    },
    {
      "label": "Swisher County",
      "fips": "48437"
    },
    {
      "label": "Tarrant County",
      "fips": "48439"
    },
    {
      "label": "Taylor County",
      "fips": "48441"
    },
    {
      "label": "Terrell County",
      "fips": "48443"
    },
    {
      "label": "Terry County",
      "fips": "48445"
    },
    {
      "label": "Throckmorton County",
      "fips": "48447"
    },
    {
      "label": "Titus County",
      "fips": "48449"
    },
    {
      "label": "Tom Green County",
      "fips": "48451"
    },
    {
      "label": "Travis County",
      "fips": "48453"
    },
    {
      "label": "Trinity County",
      "fips": "48455"
    },
    {
      "label": "Tyler County",
      "fips": "48457"
    },
    {
      "label": "Upshur County",
      "fips": "48459"
    },
    {
      "label": "Upton County",
      "fips": "48461"
    },
    {
      "label": "Uvalde County",
      "fips": "48463"
    },
    {
      "label": "Val Verde County",
      "fips": "48465"
    },
    {
      "label": "Van Zandt County",
      "fips": "48467"
    },
    {
      "label": "Victoria County",
      "fips": "48469"
    },
    {
      "label": "Walker County",
      "fips": "48471"
    },
    {
      "label": "Waller County",
      "fips": "48473"
    },
    {
      "label": "Ward County",
      "fips": "48475"
    },
    {
      "label": "Washington County",
      "fips": "48477"
    },
    {
      "label": "Webb County",
      "fips": "48479"
    },
    {
      "label": "Wharton County",
      "fips": "48481"
    },
    {
      "label": "Wheeler County",
      "fips": "48483"
    },
    {
      "label": "Wichita County",
      "fips": "48485"
    },
    {
      "label": "Wilbarger County",
      "fips": "48487"
    },
    {
      "label": "Willacy County",
      "fips": "48489"
    },
    {
      "label": "Williamson County",
      "fips": "48491"
    },
    {
      "label": "Wilson County",
      "fips": "48493"
    },
    {
      "label": "Winkler County",
      "fips": "48495"
    },
    {
      "label": "Wise County",
      "fips": "48497"
    },
    {
      "label": "Wood County",
      "fips": "48499"
    },
    {
      "label": "Yoakum County",
      "fips": "48501"
    },
    {
      "label": "Young County",
      "fips": "48503"
    },
    {
      "label": "Zapata County",
      "fips": "48505"
    },
    {
      "label": "Zavala County",
      "fips": "48507"
    }
  ],
  "UT": [
    {
      "label": "Beaver County",
      "fips": "49001"
    },
    {
      "label": "Box Elder County",
      "fips": "49003"
    },
    {
      "label": "Cache County",
      "fips": "49005"
    },
    {
      "label": "Carbon County",
      "fips": "49007"
    },
    {
      "label": "Daggett County",
      "fips": "49009"
    },
    {
      "label": "Davis County",
      "fips": "49011"
    },
    {
      "label": "Duchesne County",
      "fips": "49013"
    },
    {
      "label": "Emery County",
      "fips": "49015"
    },
    {
      "label": "Garfield County",
      "fips": "49017"
    },
    {
      "label": "Grand County",
      "fips": "49019"
    },
    {
      "label": "Iron County",
      "fips": "49021"
    },
    {
      "label": "Juab County",
      "fips": "49023"
    },
    {
      "label": "Kane County",
      "fips": "49025"
    },
    {
      "label": "Millard County",
      "fips": "49027"
    },
    {
      "label": "Morgan County",
      "fips": "49029"
    },
    {
      "label": "Piute County",
      "fips": "49031"
    },
    {
      "label": "Rich County",
      "fips": "49033"
    },
    {
      "label": "Salt Lake County",
      "fips": "49035"
    },
    {
      "label": "San Juan County",
      "fips": "49037"
    },
    {
      "label": "Sanpete County",
      "fips": "49039"
    },
    {
      "label": "Sevier County",
      "fips": "49041"
    },
    {
      "label": "Summit County",
      "fips": "49043"
    },
    {
      "label": "Tooele County",
      "fips": "49045"
    },
    {
      "label": "Uintah County",
      "fips": "49047"
    },
    {
      "label": "Utah County",
      "fips": "49049"
    },
    {
      "label": "Wasatch County",
      "fips": "49051"
    },
    {
      "label": "Washington County",
      "fips": "49053"
    },
    {
      "label": "Wayne County",
      "fips": "49055"
    },
    {
      "label": "Weber County",
      "fips": "49057"
    }
  ],
  "VT": [
    {
      "label": "Addison County",
      "fips": "50001"
    },
    {
      "label": "Bennington County",
      "fips": "50003"
    },
    {
      "label": "Caledonia County",
      "fips": "50005"
    },
    {
      "label": "Chittenden County",
      "fips": "50007"
    },
    {
      "label": "Essex County",
      "fips": "50009"
    },
    {
      "label": "Franklin County",
      "fips": "50011"
    },
    {
      "label": "Grand Isle County",
      "fips": "50013"
    },
    {
      "label": "Lamoille County",
      "fips": "50015"
    },
    {
      "label": "Orange County",
      "fips": "50017"
    },
    {
      "label": "Orleans County",
      "fips": "50019"
    },
    {
      "label": "Rutland County",
      "fips": "50021"
    },
    {
      "label": "Washington County",
      "fips": "50023"
    },
    {
      "label": "Windham County",
      "fips": "50025"
    },
    {
      "label": "Windsor County",
      "fips": "50027"
    }
  ],
  "VA": [
    {
      "label": "Accomack County",
      "fips": "51001"
    },
    {
      "label": "Albemarle County",
      "fips": "51003"
    },
    {
      "label": "Alleghany County",
      "fips": "51005"
    },
    {
      "label": "Amelia County",
      "fips": "51007"
    },
    {
      "label": "Amherst County",
      "fips": "51009"
    },
    {
      "label": "Appomattox County",
      "fips": "51011"
    },
    {
      "label": "Arlington County",
      "fips": "51013"
    },
    {
      "label": "Augusta County",
      "fips": "51015"
    },
    {
      "label": "Bath County",
      "fips": "51017"
    },
    {
      "label": "Bedford County",
      "fips": "51019"
    },
    {
      "label": "Bland County",
      "fips": "51021"
    },
    {
      "label": "Botetourt County",
      "fips": "51023"
    },
    {
      "label": "Brunswick County",
      "fips": "51025"
    },
    {
      "label": "Buchanan County",
      "fips": "51027"
    },
    {
      "label": "Buckingham County",
      "fips": "51029"
    },
    {
      "label": "Campbell County",
      "fips": "51031"
    },
    {
      "label": "Caroline County",
      "fips": "51033"
    },
    {
      "label": "Carroll County",
      "fips": "51035"
    },
    {
      "label": "Charles City County",
      "fips": "51036"
    },
    {
      "label": "Charlotte County",
      "fips": "51037"
    },
    {
      "label": "Chesterfield County",
      "fips": "51041"
    },
    {
      "label": "Clarke County",
      "fips": "51043"
    },
    {
      "label": "Craig County",
      "fips": "51045"
    },
    {
      "label": "Culpeper County",
      "fips": "51047"
    },
    {
      "label": "Cumberland County",
      "fips": "51049"
    },
    {
      "label": "Dickenson County",
      "fips": "51051"
    },
    {
      "label": "Dinwiddie County",
      "fips": "51053"
    },
    {
      "label": "Essex County",
      "fips": "51057"
    },
    {
      "label": "Fairfax County",
      "fips": "51059"
    },
    {
      "label": "Fauquier County",
      "fips": "51061"
    },
    {
      "label": "Floyd County",
      "fips": "51063"
    },
    {
      "label": "Fluvanna County",
      "fips": "51065"
    },
    {
      "label": "Franklin County",
      "fips": "51067"
    },
    {
      "label": "Frederick County",
      "fips": "51069"
    },
    {
      "label": "Giles County",
      "fips": "51071"
    },
    {
      "label": "Gloucester County",
      "fips": "51073"
    },
    {
      "label": "Goochland County",
      "fips": "51075"
    },
    {
      "label": "Grayson County",
      "fips": "51077"
    },
    {
      "label": "Greene County",
      "fips": "51079"
    },
    {
      "label": "Greensville County",
      "fips": "51081"
    },
    {
      "label": "Halifax County",
      "fips": "51083"
    },
    {
      "label": "Hanover County",
      "fips": "51085"
    },
    {
      "label": "Henrico County",
      "fips": "51087"
    },
    {
      "label": "Henry County",
      "fips": "51089"
    },
    {
      "label": "Highland County",
      "fips": "51091"
    },
    {
      "label": "Isle of Wight County",
      "fips": "51093"
    },
    {
      "label": "James City County",
      "fips": "51095"
    },
    {
      "label": "King and Queen County",
      "fips": "51097"
    },
    {
      "label": "King George County",
      "fips": "51099"
    },
    {
      "label": "King William County",
      "fips": "51101"
    },
    {
      "label": "Lancaster County",
      "fips": "51103"
    },
    {
      "label": "Lee County",
      "fips": "51105"
    },
    {
      "label": "Loudoun County",
      "fips": "51107"
    },
    {
      "label": "Louisa County",
      "fips": "51109"
    },
    {
      "label": "Lunenburg County",
      "fips": "51111"
    },
    {
      "label": "Madison County",
      "fips": "51113"
    },
    {
      "label": "Mathews County",
      "fips": "51115"
    },
    {
      "label": "Mecklenburg County",
      "fips": "51117"
    },
    {
      "label": "Middlesex County",
      "fips": "51119"
    },
    {
      "label": "Montgomery County",
      "fips": "51121"
    },
    {
      "label": "Nelson County",
      "fips": "51125"
    },
    {
      "label": "New Kent County",
      "fips": "51127"
    },
    {
      "label": "Northampton County",
      "fips": "51131"
    },
    {
      "label": "Northumberland County",
      "fips": "51133"
    },
    {
      "label": "Nottoway County",
      "fips": "51135"
    },
    {
      "label": "Orange County",
      "fips": "51137"
    },
    {
      "label": "Page County",
      "fips": "51139"
    },
    {
      "label": "Patrick County",
      "fips": "51141"
    },
    {
      "label": "Pittsylvania County",
      "fips": "51143"
    },
    {
      "label": "Powhatan County",
      "fips": "51145"
    },
    {
      "label": "Prince Edward County",
      "fips": "51147"
    },
    {
      "label": "Prince George County",
      "fips": "51149"
    },
    {
      "label": "Prince William County",
      "fips": "51153"
    },
    {
      "label": "Pulaski County",
      "fips": "51155"
    },
    {
      "label": "Rappahannock County",
      "fips": "51157"
    },
    {
      "label": "Richmond County",
      "fips": "51159"
    },
    {
      "label": "Roanoke County",
      "fips": "51161"
    },
    {
      "label": "Rockbridge County",
      "fips": "51163"
    },
    {
      "label": "Rockingham County",
      "fips": "51165"
    },
    {
      "label": "Russell County",
      "fips": "51167"
    },
    {
      "label": "Scott County",
      "fips": "51169"
    },
    {
      "label": "Shenandoah County",
      "fips": "51171"
    },
    {
      "label": "Smyth County",
      "fips": "51173"
    },
    {
      "label": "Southampton County",
      "fips": "51175"
    },
    {
      "label": "Spotsylvania County",
      "fips": "51177"
    },
    {
      "label": "Stafford County",
      "fips": "51179"
    },
    {
      "label": "Surry County",
      "fips": "51181"
    },
    {
      "label": "Sussex County",
      "fips": "51183"
    },
    {
      "label": "Tazewell County",
      "fips": "51185"
    },
    {
      "label": "Warren County",
      "fips": "51187"
    },
    {
      "label": "Washington County",
      "fips": "51191"
    },
    {
      "label": "Westmoreland County",
      "fips": "51193"
    },
    {
      "label": "Wise County",
      "fips": "51195"
    },
    {
      "label": "Wythe County",
      "fips": "51197"
    },
    {
      "label": "York County",
      "fips": "51199"
    },
    {
      "label": "Alexandria city",
      "fips": "51510"
    },
    {
      "label": "Bedford city",
      "fips": "51515"
    },
    {
      "label": "Bristol city",
      "fips": "51520"
    },
    {
      "label": "Buena Vista city",
      "fips": "51530"
    },
    {
      "label": "Charlottesville city",
      "fips": "51540"
    },
    {
      "label": "Chesapeake city",
      "fips": "51550"
    },
    {
      "label": "Colonial Heights city",
      "fips": "51570"
    },
    {
      "label": "Covington city",
      "fips": "51580"
    },
    {
      "label": "Danville city",
      "fips": "51590"
    },
    {
      "label": "Emporia city",
      "fips": "51595"
    },
    {
      "label": "Fairfax city",
      "fips": "51600"
    },
    {
      "label": "Falls Church city",
      "fips": "51610"
    },
    {
      "label": "Franklin city",
      "fips": "51620"
    },
    {
      "label": "Fredericksburg city",
      "fips": "51630"
    },
    {
      "label": "Galax city",
      "fips": "51640"
    },
    {
      "label": "Hampton city",
      "fips": "51650"
    },
    {
      "label": "Harrisonburg city",
      "fips": "51660"
    },
    {
      "label": "Hopewell city",
      "fips": "51670"
    },
    {
      "label": "Lexington city",
      "fips": "51678"
    },
    {
      "label": "Lynchburg city",
      "fips": "51680"
    },
    {
      "label": "Manassas city",
      "fips": "51683"
    },
    {
      "label": "Manassas Park city",
      "fips": "51685"
    },
    {
      "label": "Martinsville city",
      "fips": "51690"
    },
    {
      "label": "Newport News city",
      "fips": "51700"
    },
    {
      "label": "Norfolk city",
      "fips": "51710"
    },
    {
      "label": "Norton city",
      "fips": "51720"
    },
    {
      "label": "Petersburg city",
      "fips": "51730"
    },
    {
      "label": "Poquoson city",
      "fips": "51735"
    },
    {
      "label": "Portsmouth city",
      "fips": "51740"
    },
    {
      "label": "Radford city",
      "fips": "51750"
    },
    {
      "label": "Richmond city",
      "fips": "51760"
    },
    {
      "label": "Roanoke city",
      "fips": "51770"
    },
    {
      "label": "Salem city",
      "fips": "51775"
    },
    {
      "label": "Staunton city",
      "fips": "51790"
    },
    {
      "label": "Suffolk city",
      "fips": "51800"
    },
    {
      "label": "Virginia Beach city",
      "fips": "51810"
    },
    {
      "label": "Waynesboro city",
      "fips": "51820"
    },
    {
      "label": "Williamsburg city",
      "fips": "51830"
    },
    {
      "label": "Winchester city",
      "fips": "51840"
    }
  ],
  "WA": [
    {
      "label": "Adams County",
      "fips": "53001"
    },
    {
      "label": "Asotin County",
      "fips": "53003"
    },
    {
      "label": "Benton County",
      "fips": "53005"
    },
    {
      "label": "Chelan County",
      "fips": "53007"
    },
    {
      "label": "Clallam County",
      "fips": "53009"
    },
    {
      "label": "Clark County",
      "fips": "53011"
    },
    {
      "label": "Columbia County",
      "fips": "53013"
    },
    {
      "label": "Cowlitz County",
      "fips": "53015"
    },
    {
      "label": "Douglas County",
      "fips": "53017"
    },
    {
      "label": "Ferry County",
      "fips": "53019"
    },
    {
      "label": "Franklin County",
      "fips": "53021"
    },
    {
      "label": "Garfield County",
      "fips": "53023"
    },
    {
      "label": "Grant County",
      "fips": "53025"
    },
    {
      "label": "Grays Harbor County",
      "fips": "53027"
    },
    {
      "label": "Island County",
      "fips": "53029"
    },
    {
      "label": "Jefferson County",
      "fips": "53031"
    },
    {
      "label": "King County",
      "fips": "53033"
    },
    {
      "label": "Kitsap County",
      "fips": "53035"
    },
    {
      "label": "Kittitas County",
      "fips": "53037"
    },
    {
      "label": "Klickitat County",
      "fips": "53039"
    },
    {
      "label": "Lewis County",
      "fips": "53041"
    },
    {
      "label": "Lincoln County",
      "fips": "53043"
    },
    {
      "label": "Mason County",
      "fips": "53045"
    },
    {
      "label": "Okanogan County",
      "fips": "53047"
    },
    {
      "label": "Pacific County",
      "fips": "53049"
    },
    {
      "label": "Pend Oreille County",
      "fips": "53051"
    },
    {
      "label": "Pierce County",
      "fips": "53053"
    },
    {
      "label": "San Juan County",
      "fips": "53055"
    },
    {
      "label": "Skagit County",
      "fips": "53057"
    },
    {
      "label": "Skamania County",
      "fips": "53059"
    },
    {
      "label": "Snohomish County",
      "fips": "53061"
    },
    {
      "label": "Spokane County",
      "fips": "53063"
    },
    {
      "label": "Stevens County",
      "fips": "53065"
    },
    {
      "label": "Thurston County",
      "fips": "53067"
    },
    {
      "label": "Wahkiakum County",
      "fips": "53069"
    },
    {
      "label": "Walla Walla County",
      "fips": "53071"
    },
    {
      "label": "Whatcom County",
      "fips": "53073"
    },
    {
      "label": "Whitman County",
      "fips": "53075"
    },
    {
      "label": "Yakima County",
      "fips": "53077"
    }
  ],
  "WV": [
    {
      "label": "Barbour County",
      "fips": "54001"
    },
    {
      "label": "Berkeley County",
      "fips": "54003"
    },
    {
      "label": "Boone County",
      "fips": "54005"
    },
    {
      "label": "Braxton County",
      "fips": "54007"
    },
    {
      "label": "Brooke County",
      "fips": "54009"
    },
    {
      "label": "Cabell County",
      "fips": "54011"
    },
    {
      "label": "Calhoun County",
      "fips": "54013"
    },
    {
      "label": "Clay County",
      "fips": "54015"
    },
    {
      "label": "Doddridge County",
      "fips": "54017"
    },
    {
      "label": "Fayette County",
      "fips": "54019"
    },
    {
      "label": "Gilmer County",
      "fips": "54021"
    },
    {
      "label": "Grant County",
      "fips": "54023"
    },
    {
      "label": "Greenbrier County",
      "fips": "54025"
    },
    {
      "label": "Hampshire County",
      "fips": "54027"
    },
    {
      "label": "Hancock County",
      "fips": "54029"
    },
    {
      "label": "Hardy County",
      "fips": "54031"
    },
    {
      "label": "Harrison County",
      "fips": "54033"
    },
    {
      "label": "Jackson County",
      "fips": "54035"
    },
    {
      "label": "Jefferson County",
      "fips": "54037"
    },
    {
      "label": "Kanawha County",
      "fips": "54039"
    },
    {
      "label": "Lewis County",
      "fips": "54041"
    },
    {
      "label": "Lincoln County",
      "fips": "54043"
    },
    {
      "label": "Logan County",
      "fips": "54045"
    },
    {
      "label": "McDowell County",
      "fips": "54047"
    },
    {
      "label": "Marion County",
      "fips": "54049"
    },
    {
      "label": "Marshall County",
      "fips": "54051"
    },
    {
      "label": "Mason County",
      "fips": "54053"
    },
    {
      "label": "Mercer County",
      "fips": "54055"
    },
    {
      "label": "Mineral County",
      "fips": "54057"
    },
    {
      "label": "Mingo County",
      "fips": "54059"
    },
    {
      "label": "Monongalia County",
      "fips": "54061"
    },
    {
      "label": "Monroe County",
      "fips": "54063"
    },
    {
      "label": "Morgan County",
      "fips": "54065"
    },
    {
      "label": "Nicholas County",
      "fips": "54067"
    },
    {
      "label": "Ohio County",
      "fips": "54069"
    },
    {
      "label": "Pendleton County",
      "fips": "54071"
    },
    {
      "label": "Pleasants County",
      "fips": "54073"
    },
    {
      "label": "Pocahontas County",
      "fips": "54075"
    },
    {
      "label": "Preston County",
      "fips": "54077"
    },
    {
      "label": "Putnam County",
      "fips": "54079"
    },
    {
      "label": "Raleigh County",
      "fips": "54081"
    },
    {
      "label": "Randolph County",
      "fips": "54083"
    },
    {
      "label": "Ritchie County",
      "fips": "54085"
    },
    {
      "label": "Roane County",
      "fips": "54087"
    },
    {
      "label": "Summers County",
      "fips": "54089"
    },
    {
      "label": "Taylor County",
      "fips": "54091"
    },
    {
      "label": "Tucker County",
      "fips": "54093"
    },
    {
      "label": "Tyler County",
      "fips": "54095"
    },
    {
      "label": "Upshur County",
      "fips": "54097"
    },
    {
      "label": "Wayne County",
      "fips": "54099"
    },
    {
      "label": "Webster County",
      "fips": "54101"
    },
    {
      "label": "Wetzel County",
      "fips": "54103"
    },
    {
      "label": "Wirt County",
      "fips": "54105"
    },
    {
      "label": "Wood County",
      "fips": "54107"
    },
    {
      "label": "Wyoming County",
      "fips": "54109"
    }
  ],
  "WI": [
    {
      "label": "Adams County",
      "fips": "55001"
    },
    {
      "label": "Ashland County",
      "fips": "55003"
    },
    {
      "label": "Barron County",
      "fips": "55005"
    },
    {
      "label": "Bayfield County",
      "fips": "55007"
    },
    {
      "label": "Brown County",
      "fips": "55009"
    },
    {
      "label": "Buffalo County",
      "fips": "55011"
    },
    {
      "label": "Burnett County",
      "fips": "55013"
    },
    {
      "label": "Calumet County",
      "fips": "55015"
    },
    {
      "label": "Chippewa County",
      "fips": "55017"
    },
    {
      "label": "Clark County",
      "fips": "55019"
    },
    {
      "label": "Columbia County",
      "fips": "55021"
    },
    {
      "label": "Crawford County",
      "fips": "55023"
    },
    {
      "label": "Dane County",
      "fips": "55025"
    },
    {
      "label": "Dodge County",
      "fips": "55027"
    },
    {
      "label": "Door County",
      "fips": "55029"
    },
    {
      "label": "Douglas County",
      "fips": "55031"
    },
    {
      "label": "Dunn County",
      "fips": "55033"
    },
    {
      "label": "Eau Claire County",
      "fips": "55035"
    },
    {
      "label": "Florence County",
      "fips": "55037"
    },
    {
      "label": "Fond du Lac County",
      "fips": "55039"
    },
    {
      "label": "Forest County",
      "fips": "55041"
    },
    {
      "label": "Grant County",
      "fips": "55043"
    },
    {
      "label": "Green County",
      "fips": "55045"
    },
    {
      "label": "Green Lake County",
      "fips": "55047"
    },
    {
      "label": "Iowa County",
      "fips": "55049"
    },
    {
      "label": "Iron County",
      "fips": "55051"
    },
    {
      "label": "Jackson County",
      "fips": "55053"
    },
    {
      "label": "Jefferson County",
      "fips": "55055"
    },
    {
      "label": "Juneau County",
      "fips": "55057"
    },
    {
      "label": "Kenosha County",
      "fips": "55059"
    },
    {
      "label": "Kewaunee County",
      "fips": "55061"
    },
    {
      "label": "La Crosse County",
      "fips": "55063"
    },
    {
      "label": "Lafayette County",
      "fips": "55065"
    },
    {
      "label": "Langlade County",
      "fips": "55067"
    },
    {
      "label": "Lincoln County",
      "fips": "55069"
    },
    {
      "label": "Manitowoc County",
      "fips": "55071"
    },
    {
      "label": "Marathon County",
      "fips": "55073"
    },
    {
      "label": "Marinette County",
      "fips": "55075"
    },
    {
      "label": "Marquette County",
      "fips": "55077"
    },
    {
      "label": "Menominee County",
      "fips": "55078"
    },
    {
      "label": "Milwaukee County",
      "fips": "55079"
    },
    {
      "label": "Monroe County",
      "fips": "55081"
    },
    {
      "label": "Oconto County",
      "fips": "55083"
    },
    {
      "label": "Oneida County",
      "fips": "55085"
    },
    {
      "label": "Outagamie County",
      "fips": "55087"
    },
    {
      "label": "Ozaukee County",
      "fips": "55089"
    },
    {
      "label": "Pepin County",
      "fips": "55091"
    },
    {
      "label": "Pierce County",
      "fips": "55093"
    },
    {
      "label": "Polk County",
      "fips": "55095"
    },
    {
      "label": "Portage County",
      "fips": "55097"
    },
    {
      "label": "Price County",
      "fips": "55099"
    },
    {
      "label": "Racine County",
      "fips": "55101"
    },
    {
      "label": "Richland County",
      "fips": "55103"
    },
    {
      "label": "Rock County",
      "fips": "55105"
    },
    {
      "label": "Rusk County",
      "fips": "55107"
    },
    {
      "label": "St. Croix County",
      "fips": "55109"
    },
    {
      "label": "Sauk County",
      "fips": "55111"
    },
    {
      "label": "Sawyer County",
      "fips": "55113"
    },
    {
      "label": "Shawano County",
      "fips": "55115"
    },
    {
      "label": "Sheboygan County",
      "fips": "55117"
    },
    {
      "label": "Taylor County",
      "fips": "55119"
    },
    {
      "label": "Trempealeau County",
      "fips": "55121"
    },
    {
      "label": "Vernon County",
      "fips": "55123"
    },
    {
      "label": "Vilas County",
      "fips": "55125"
    },
    {
      "label": "Walworth County",
      "fips": "55127"
    },
    {
      "label": "Washburn County",
      "fips": "55129"
    },
    {
      "label": "Washington County",
      "fips": "55131"
    },
    {
      "label": "Waukesha County",
      "fips": "55133"
    },
    {
      "label": "Waupaca County",
      "fips": "55135"
    },
    {
      "label": "Waushara County",
      "fips": "55137"
    },
    {
      "label": "Winnebago County",
      "fips": "55139"
    },
    {
      "label": "Wood County",
      "fips": "55141"
    }
  ],
  "WY": [
    {
      "label": "Albany County",
      "fips": "56001"
    },
    {
      "label": "Big Horn County",
      "fips": "56003"
    },
    {
      "label": "Campbell County",
      "fips": "56005"
    },
    {
      "label": "Carbon County",
      "fips": "56007"
    },
    {
      "label": "Converse County",
      "fips": "56009"
    },
    {
      "label": "Crook County",
      "fips": "56011"
    },
    {
      "label": "Fremont County",
      "fips": "56013"
    },
    {
      "label": "Goshen County",
      "fips": "56015"
    },
    {
      "label": "Hot Springs County",
      "fips": "56017"
    },
    {
      "label": "Johnson County",
      "fips": "56019"
    },
    {
      "label": "Laramie County",
      "fips": "56021"
    },
    {
      "label": "Lincoln County",
      "fips": "56023"
    },
    {
      "label": "Natrona County",
      "fips": "56025"
    },
    {
      "label": "Niobrara County",
      "fips": "56027"
    },
    {
      "label": "Park County",
      "fips": "56029"
    },
    {
      "label": "Platte County",
      "fips": "56031"
    },
    {
      "label": "Sheridan County",
      "fips": "56033"
    },
    {
      "label": "Sublette County",
      "fips": "56035"
    },
    {
      "label": "Sweetwater County",
      "fips": "56037"
    },
    {
      "label": "Teton County",
      "fips": "56039"
    },
    {
      "label": "Uinta County",
      "fips": "56041"
    },
    {
      "label": "Washakie County",
      "fips": "56043"
    },
    {
      "label": "Weston County",
      "fips": "56045"
    }
  ]
};

var newcounties = [{"label": "Autauga County, AL", "value": "01001"}, {
  "label": "Baldwin County, AL",
  "value": "01003"
}, {"label": "Barbour County, AL", "value": "01005"}, {
  "label": "Bibb County, AL",
  "value": "01007"
}, {"label": "Blount County, AL", "value": "01009"}, {
  "label": "Bullock County, AL",
  "value": "01011"
}, {"label": "Butler County, AL", "value": "01013"}, {
  "label": "Calhoun County, AL",
  "value": "01015"
}, {"label": "Chambers County, AL", "value": "01017"}, {
  "label": "Cherokee County, AL",
  "value": "01019"
}, {"label": "Chilton County, AL", "value": "01021"}, {
  "label": "Choctaw County, AL",
  "value": "01023"
}, {"label": "Clarke County, AL", "value": "01025"}, {
  "label": "Clay County, AL",
  "value": "01027"
}, {"label": "Cleburne County, AL", "value": "01029"}, {
  "label": "Coffee County, AL",
  "value": "01031"
}, {"label": "Colbert County, AL", "value": "01033"}, {
  "label": "Conecuh County, AL",
  "value": "01035"
}, {"label": "Coosa County, AL", "value": "01037"}, {
  "label": "Covington County, AL",
  "value": "01039"
}, {"label": "Crenshaw County, AL", "value": "01041"}, {
  "label": "Cullman County, AL",
  "value": "01043"
}, {"label": "Dale County, AL", "value": "01045"}, {
  "label": "Dallas County, AL",
  "value": "01047"
}, {"label": "DeKalb County, AL", "value": "01049"}, {
  "label": "Elmore County, AL",
  "value": "01051"
}, {"label": "Escambia County, AL", "value": "01053"}, {
  "label": "Etowah County, AL",
  "value": "01055"
}, {"label": "Fayette County, AL", "value": "01057"}, {
  "label": "Franklin County, AL",
  "value": "01059"
}, {"label": "Geneva County, AL", "value": "01061"}, {
  "label": "Greene County, AL",
  "value": "01063"
}, {"label": "Hale County, AL", "value": "01065"}, {
  "label": "Henry County, AL",
  "value": "01067"
}, {"label": "Houston County, AL", "value": "01069"}, {
  "label": "Jackson County, AL",
  "value": "01071"
}, {"label": "Jefferson County, AL", "value": "01073"}, {
  "label": "Lamar County, AL",
  "value": "01075"
}, {"label": "Lauderdale County, AL", "value": "01077"}, {
  "label": "Lawrence County, AL",
  "value": "01079"
}, {"label": "Lee County, AL", "value": "01081"}, {
  "label": "Limestone County, AL",
  "value": "01083"
}, {"label": "Lowndes County, AL", "value": "01085"}, {
  "label": "Macon County, AL",
  "value": "01087"
}, {"label": "Madison County, AL", "value": "01089"}, {
  "label": "Marengo County, AL",
  "value": "01091"
}, {"label": "Marion County, AL", "value": "01093"}, {
  "label": "Marshall County, AL",
  "value": "01095"
}, {"label": "Mobile County, AL", "value": "01097"}, {
  "label": "Monroe County, AL",
  "value": "01099"
}, {"label": "Montgomery County, AL", "value": "01101"}, {
  "label": "Morgan County, AL",
  "value": "01103"
}, {"label": "Perry County, AL", "value": "01105"}, {
  "label": "Pickens County, AL",
  "value": "01107"
}, {"label": "Pike County, AL", "value": "01109"}, {
  "label": "Randolph County, AL",
  "value": "01111"
}, {"label": "Russell County, AL", "value": "01113"}, {
  "label": "St. Clair County, AL",
  "value": "01115"
}, {"label": "Shelby County, AL", "value": "01117"}, {
  "label": "Sumter County, AL",
  "value": "01119"
}, {"label": "Talladega County, AL", "value": "01121"}, {
  "label": "Tallapoosa County, AL",
  "value": "01123"
}, {"label": "Tuscaloosa County, AL", "value": "01125"}, {
  "label": "Walker County, AL",
  "value": "01127"
}, {"label": "Washington County, AL", "value": "01129"}, {
  "label": "Wilcox County, AL",
  "value": "01131"
}, {"label": "Winston County, AL", "value": "01133"}, {
  "label": "Apache County, AZ",
  "value": "04001"
}, {"label": "Cochise County, AZ", "value": "04003"}, {
  "label": "Coconino County, AZ",
  "value": "04005"
}, {"label": "Gila County, AZ", "value": "04007"}, {
  "label": "Graham County, AZ",
  "value": "04009"
}, {"label": "Greenlee County, AZ", "value": "04011"}, {
  "label": "La Paz County, AZ",
  "value": "04012"
}, {"label": "Maricopa County, AZ", "value": "04013"}, {
  "label": "Mohave County, AZ",
  "value": "04015"
}, {"label": "Navajo County, AZ", "value": "04017"}, {
  "label": "Pima County, AZ",
  "value": "04019"
}, {"label": "Pinal County, AZ", "value": "04021"}, {
  "label": "Santa Cruz County, AZ",
  "value": "04023"
}, {"label": "Yavapai County, AZ", "value": "04025"}, {
  "label": "Yuma County, AZ",
  "value": "04027"
}, {"label": "Arkansas County, AR", "value": "05001"}, {
  "label": "Ashley County, AR",
  "value": "05003"
}, {"label": "Baxter County, AR", "value": "05005"}, {
  "label": "Benton County, AR",
  "value": "05007"
}, {"label": "Boone County, AR", "value": "05009"}, {
  "label": "Bradley County, AR",
  "value": "05011"
}, {"label": "Calhoun County, AR", "value": "05013"}, {
  "label": "Carroll County, AR",
  "value": "05015"
}, {"label": "Chicot County, AR", "value": "05017"}, {
  "label": "Clark County, AR",
  "value": "05019"
}, {"label": "Clay County, AR", "value": "05021"}, {
  "label": "Cleburne County, AR",
  "value": "05023"
}, {"label": "Cleveland County, AR", "value": "05025"}, {
  "label": "Columbia County, AR",
  "value": "05027"
}, {"label": "Conway County, AR", "value": "05029"}, {
  "label": "Craighead County, AR",
  "value": "05031"
}, {"label": "Crawford County, AR", "value": "05033"}, {
  "label": "Crittenden County, AR",
  "value": "05035"
}, {"label": "Cross County, AR", "value": "05037"}, {
  "label": "Dallas County, AR",
  "value": "05039"
}, {"label": "Desha County, AR", "value": "05041"}, {
  "label": "Drew County, AR",
  "value": "05043"
}, {"label": "Faulkner County, AR", "value": "05045"}, {
  "label": "Franklin County, AR",
  "value": "05047"
}, {"label": "Fulton County, AR", "value": "05049"}, {
  "label": "Garland County, AR",
  "value": "05051"
}, {"label": "Grant County, AR", "value": "05053"}, {
  "label": "Greene County, AR",
  "value": "05055"
}, {"label": "Hempstead County, AR", "value": "05057"}, {
  "label": "Hot Spring County, AR",
  "value": "05059"
}, {"label": "Howard County, AR", "value": "05061"}, {
  "label": "Independence County, AR",
  "value": "05063"
}, {"label": "Izard County, AR", "value": "05065"}, {
  "label": "Jackson County, AR",
  "value": "05067"
}, {"label": "Jefferson County, AR", "value": "05069"}, {
  "label": "Johnson County, AR",
  "value": "05071"
}, {"label": "Lafayette County, AR", "value": "05073"}, {
  "label": "Lawrence County, AR",
  "value": "05075"
}, {"label": "Lee County, AR", "value": "05077"}, {
  "label": "Lincoln County, AR",
  "value": "05079"
}, {"label": "Little River County, AR", "value": "05081"}, {
  "label": "Logan County, AR",
  "value": "05083"
}, {"label": "Lonoke County, AR", "value": "05085"}, {
  "label": "Madison County, AR",
  "value": "05087"
}, {"label": "Marion County, AR", "value": "05089"}, {
  "label": "Miller County, AR",
  "value": "05091"
}, {"label": "Mississippi County, AR", "value": "05093"}, {
  "label": "Monroe County, AR",
  "value": "05095"
}, {"label": "Montgomery County, AR", "value": "05097"}, {
  "label": "Nevada County, AR",
  "value": "05099"
}, {"label": "Newton County, AR", "value": "05101"}, {
  "label": "Ouachita County, AR",
  "value": "05103"
}, {"label": "Perry County, AR", "value": "05105"}, {
  "label": "Phillips County, AR",
  "value": "05107"
}, {"label": "Pike County, AR", "value": "05109"}, {
  "label": "Poinsett County, AR",
  "value": "05111"
}, {"label": "Polk County, AR", "value": "05113"}, {
  "label": "Pope County, AR",
  "value": "05115"
}, {"label": "Prairie County, AR", "value": "05117"}, {
  "label": "Pulaski County, AR",
  "value": "05119"
}, {"label": "Randolph County, AR", "value": "05121"}, {
  "label": "St. Francis County, AR",
  "value": "05123"
}, {"label": "Saline County, AR", "value": "05125"}, {
  "label": "Scott County, AR",
  "value": "05127"
}, {"label": "Searcy County, AR", "value": "05129"}, {
  "label": "Sebastian County, AR",
  "value": "05131"
}, {"label": "Sevier County, AR", "value": "05133"}, {
  "label": "Sharp County, AR",
  "value": "05135"
}, {"label": "Stone County, AR", "value": "05137"}, {
  "label": "Union County, AR",
  "value": "05139"
}, {"label": "Van Buren County, AR", "value": "05141"}, {
  "label": "Washington County, AR",
  "value": "05143"
}, {"label": "White County, AR", "value": "05145"}, {
  "label": "Woodruff County, AR",
  "value": "05147"
}, {"label": "Yell County, AR", "value": "05149"}, {
  "label": "Alameda County, CA",
  "value": "06001"
}, {"label": "Alpine County, CA", "value": "06003"}, {
  "label": "Amador County, CA",
  "value": "06005"
}, {"label": "Butte County, CA", "value": "06007"}, {
  "label": "Calaveras County, CA",
  "value": "06009"
}, {"label": "Colusa County, CA", "value": "06011"}, {
  "label": "Contra Costa County, CA",
  "value": "06013"
}, {"label": "Del Norte County, CA", "value": "06015"}, {
  "label": "El Dorado County, CA",
  "value": "06017"
}, {"label": "Fresno County, CA", "value": "06019"}, {
  "label": "Glenn County, CA",
  "value": "06021"
}, {"label": "Humboldt County, CA", "value": "06023"}, {
  "label": "Imperial County, CA",
  "value": "06025"
}, {"label": "Inyo County, CA", "value": "06027"}, {
  "label": "Kern County, CA",
  "value": "06029"
}, {"label": "Kings County, CA", "value": "06031"}, {
  "label": "Lake County, CA",
  "value": "06033"
}, {"label": "Lassen County, CA", "value": "06035"}, {
  "label": "Los Angeles County, CA",
  "value": "06037"
}, {"label": "Madera County, CA", "value": "06039"}, {
  "label": "Marin County, CA",
  "value": "06041"
}, {"label": "Mariposa County, CA", "value": "06043"}, {
  "label": "Mendocino County, CA",
  "value": "06045"
}, {"label": "Merced County, CA", "value": "06047"}, {
  "label": "Modoc County, CA",
  "value": "06049"
}, {"label": "Mono County, CA", "value": "06051"}, {
  "label": "Monterey County, CA",
  "value": "06053"
}, {"label": "Napa County, CA", "value": "06055"}, {
  "label": "Nevada County, CA",
  "value": "06057"
}, {"label": "Orange County, CA", "value": "06059"}, {
  "label": "Placer County, CA",
  "value": "06061"
}, {"label": "Plumas County, CA", "value": "06063"}, {
  "label": "Riverside County, CA",
  "value": "06065"
}, {"label": "Sacramento County, CA", "value": "06067"}, {
  "label": "San Benito County, CA",
  "value": "06069"
}, {"label": "San Bernardino County, CA", "value": "06071"}, {
  "label": "San Diego County, CA",
  "value": "06073"
}, {"label": "San Francisco County, CA", "value": "06075"}, {
  "label": "San Joaquin County, CA",
  "value": "06077"
}, {"label": "San Luis Obispo County, CA", "value": "06079"}, {
  "label": "San Mateo County, CA",
  "value": "06081"
}, {"label": "Santa Barbara County, CA", "value": "06083"}, {
  "label": "Santa Clara County, CA",
  "value": "06085"
}, {"label": "Santa Cruz County, CA", "value": "06087"}, {
  "label": "Shasta County, CA",
  "value": "06089"
}, {"label": "Sierra County, CA", "value": "06091"}, {
  "label": "Siskiyou County, CA",
  "value": "06093"
}, {"label": "Solano County, CA", "value": "06095"}, {
  "label": "Sonoma County, CA",
  "value": "06097"
}, {"label": "Stanislaus County, CA", "value": "06099"}, {
  "label": "Sutter County, CA",
  "value": "06101"
}, {"label": "Tehama County, CA", "value": "06103"}, {
  "label": "Trinity County, CA",
  "value": "06105"
}, {"label": "Tulare County, CA", "value": "06107"}, {
  "label": "Tuolumne County, CA",
  "value": "06109"
}, {"label": "Ventura County, CA", "value": "06111"}, {
  "label": "Yolo County, CA",
  "value": "06113"
}, {"label": "Yuba County, CA", "value": "06115"}, {
  "label": "Adams County, CO",
  "value": "08001"
}, {"label": "Alamosa County, CO", "value": "08003"}, {
  "label": "Arapahoe County, CO",
  "value": "08005"
}, {"label": "Archuleta County, CO", "value": "08007"}, {
  "label": "Baca County, CO",
  "value": "08009"
}, {"label": "Bent County, CO", "value": "08011"}, {
  "label": "Boulder County, CO",
  "value": "08013"
}, {"label": "Broomfield County, CO", "value": "08014"}, {
  "label": "Chaffee County, CO",
  "value": "08015"
}, {"label": "Cheyenne County, CO", "value": "08017"}, {
  "label": "Clear Creek County, CO",
  "value": "08019"
}, {"label": "Conejos County, CO", "value": "08021"}, {
  "label": "Costilla County, CO",
  "value": "08023"
}, {"label": "Crowley County, CO", "value": "08025"}, {
  "label": "Custer County, CO",
  "value": "08027"
}, {"label": "Delta County, CO", "value": "08029"}, {
  "label": "Denver County, CO",
  "value": "08031"
}, {"label": "Dolores County, CO", "value": "08033"}, {
  "label": "Douglas County, CO",
  "value": "08035"
}, {"label": "Eagle County, CO", "value": "08037"}, {
  "label": "Elbert County, CO",
  "value": "08039"
}, {"label": "El Paso County, CO", "value": "08041"}, {
  "label": "Fremont County, CO",
  "value": "08043"
}, {"label": "Garfield County, CO", "value": "08045"}, {
  "label": "Gilpin County, CO",
  "value": "08047"
}, {"label": "Grand County, CO", "value": "08049"}, {
  "label": "Gunnison County, CO",
  "value": "08051"
}, {"label": "Hinsdale County, CO", "value": "08053"}, {
  "label": "Huerfano County, CO",
  "value": "08055"
}, {"label": "Jackson County, CO", "value": "08057"}, {
  "label": "Jefferson County, CO",
  "value": "08059"
}, {"label": "Kiowa County, CO", "value": "08061"}, {
  "label": "Kit Carson County, CO",
  "value": "08063"
}, {"label": "Lake County, CO", "value": "08065"}, {
  "label": "La Plata County, CO",
  "value": "08067"
}, {"label": "Larimer County, CO", "value": "08069"}, {
  "label": "Las Animas County, CO",
  "value": "08071"
}, {"label": "Lincoln County, CO", "value": "08073"}, {
  "label": "Logan County, CO",
  "value": "08075"
}, {"label": "Mesa County, CO", "value": "08077"}, {
  "label": "Mineral County, CO",
  "value": "08079"
}, {"label": "Moffat County, CO", "value": "08081"}, {
  "label": "Montezuma County, CO",
  "value": "08083"
}, {"label": "Montrose County, CO", "value": "08085"}, {
  "label": "Morgan County, CO",
  "value": "08087"
}, {"label": "Otero County, CO", "value": "08089"}, {
  "label": "Ouray County, CO",
  "value": "08091"
}, {"label": "Park County, CO", "value": "08093"}, {
  "label": "Phillips County, CO",
  "value": "08095"
}, {"label": "Pitkin County, CO", "value": "08097"}, {
  "label": "Prowers County, CO",
  "value": "08099"
}, {"label": "Pueblo County, CO", "value": "08101"}, {
  "label": "Rio Blanco County, CO",
  "value": "08103"
}, {"label": "Rio Grande County, CO", "value": "08105"}, {
  "label": "Routt County, CO",
  "value": "08107"
}, {"label": "Saguache County, CO", "value": "08109"}, {
  "label": "San Juan County, CO",
  "value": "08111"
}, {"label": "San Miguel County, CO", "value": "08113"}, {
  "label": "Sedgwick County, CO",
  "value": "08115"
}, {"label": "Summit County, CO", "value": "08117"}, {
  "label": "Teller County, CO",
  "value": "08119"
}, {"label": "Washington County, CO", "value": "08121"}, {
  "label": "Weld County, CO",
  "value": "08123"
}, {"label": "Yuma County, CO", "value": "08125"}, {
  "label": "Fairfield County, CT",
  "value": "09001"
}, {"label": "Hartford County, CT", "value": "09003"}, {
  "label": "Litchfield County, CT",
  "value": "09005"
}, {"label": "Middlesex County, CT", "value": "09007"}, {
  "label": "New Haven County, CT",
  "value": "09009"
}, {"label": "New London County, CT", "value": "09011"}, {
  "label": "Tolland County, CT",
  "value": "09013"
}, {"label": "Windham County, CT", "value": "09015"}, {
  "label": "Kent County, DE",
  "value": "10001"
}, {"label": "New Castle County, DE", "value": "10003"}, {
  "label": "Sussex County, DE",
  "value": "10005"
}, {"label": "District of Columbia, DC", "value": "11001"}, {
  "label": "Alachua County, FL",
  "value": "12001"
}, {"label": "Baker County, FL", "value": "12003"}, {
  "label": "Bay County, FL",
  "value": "12005"
}, {"label": "Bradford County, FL", "value": "12007"}, {
  "label": "Brevard County, FL",
  "value": "12009"
}, {"label": "Broward County, FL", "value": "12011"}, {
  "label": "Calhoun County, FL",
  "value": "12013"
}, {"label": "Charlotte County, FL", "value": "12015"}, {
  "label": "Citrus County, FL",
  "value": "12017"
}, {"label": "Clay County, FL", "value": "12019"}, {
  "label": "Collier County, FL",
  "value": "12021"
}, {"label": "Columbia County, FL", "value": "12023"}, {
  "label": "DeSoto County, FL",
  "value": "12027"
}, {"label": "Dixie County, FL", "value": "12029"}, {
  "label": "Duval County, FL",
  "value": "12031"
}, {"label": "Escambia County, FL", "value": "12033"}, {
  "label": "Flagler County, FL",
  "value": "12035"
}, {"label": "Franklin County, FL", "value": "12037"}, {
  "label": "Gadsden County, FL",
  "value": "12039"
}, {"label": "Gilchrist County, FL", "value": "12041"}, {
  "label": "Glades County, FL",
  "value": "12043"
}, {"label": "Gulf County, FL", "value": "12045"}, {
  "label": "Hamilton County, FL",
  "value": "12047"
}, {"label": "Hardee County, FL", "value": "12049"}, {
  "label": "Hendry County, FL",
  "value": "12051"
}, {"label": "Hernando County, FL", "value": "12053"}, {
  "label": "Highlands County, FL",
  "value": "12055"
}, {"label": "Hillsborough County, FL", "value": "12057"}, {
  "label": "Holmes County, FL",
  "value": "12059"
}, {"label": "Indian River County, FL", "value": "12061"}, {
  "label": "Jackson County, FL",
  "value": "12063"
}, {"label": "Jefferson County, FL", "value": "12065"}, {
  "label": "Lafayette County, FL",
  "value": "12067"
}, {"label": "Lake County, FL", "value": "12069"}, {
  "label": "Lee County, FL",
  "value": "12071"
}, {"label": "Leon County, FL", "value": "12073"}, {
  "label": "Levy County, FL",
  "value": "12075"
}, {"label": "Liberty County, FL", "value": "12077"}, {
  "label": "Madison County, FL",
  "value": "12079"
}, {"label": "Manatee County, FL", "value": "12081"}, {
  "label": "Marion County, FL",
  "value": "12083"
}, {"label": "Martin County, FL", "value": "12085"}, {
  "label": "Miami-Dade County, FL",
  "value": "12086"
}, {"label": "Monroe County, FL", "value": "12087"}, {
  "label": "Nassau County, FL",
  "value": "12089"
}, {"label": "Okaloosa County, FL", "value": "12091"}, {
  "label": "Okeechobee County, FL",
  "value": "12093"
}, {"label": "Orange County, FL", "value": "12095"}, {
  "label": "Osceola County, FL",
  "value": "12097"
}, {"label": "Palm Beach County, FL", "value": "12099"}, {
  "label": "Pasco County, FL",
  "value": "12101"
}, {"label": "Pinellas County, FL", "value": "12103"}, {
  "label": "Polk County, FL",
  "value": "12105"
}, {"label": "Putnam County, FL", "value": "12107"}, {
  "label": "St. Johns County, FL",
  "value": "12109"
}, {"label": "St. Lucie County, FL", "value": "12111"}, {
  "label": "Santa Rosa County, FL",
  "value": "12113"
}, {"label": "Sarasota County, FL", "value": "12115"}, {
  "label": "Seminole County, FL",
  "value": "12117"
}, {"label": "Sumter County, FL", "value": "12119"}, {
  "label": "Suwannee County, FL",
  "value": "12121"
}, {"label": "Taylor County, FL", "value": "12123"}, {
  "label": "Union County, FL",
  "value": "12125"
}, {"label": "Volusia County, FL", "value": "12127"}, {
  "label": "Wakulla County, FL",
  "value": "12129"
}, {"label": "Walton County, FL", "value": "12131"}, {
  "label": "Washington County, FL",
  "value": "12133"
}, {"label": "Appling County, GA", "value": "13001"}, {
  "label": "Atkinson County, GA",
  "value": "13003"
}, {"label": "Bacon County, GA", "value": "13005"}, {
  "label": "Baker County, GA",
  "value": "13007"
}, {"label": "Baldwin County, GA", "value": "13009"}, {
  "label": "Banks County, GA",
  "value": "13011"
}, {"label": "Barrow County, GA", "value": "13013"}, {
  "label": "Bartow County, GA",
  "value": "13015"
}, {"label": "Ben Hill County, GA", "value": "13017"}, {
  "label": "Berrien County, GA",
  "value": "13019"
}, {"label": "Bibb County, GA", "value": "13021"}, {
  "label": "Bleckley County, GA",
  "value": "13023"
}, {"label": "Brantley County, GA", "value": "13025"}, {
  "label": "Brooks County, GA",
  "value": "13027"
}, {"label": "Bryan County, GA", "value": "13029"}, {
  "label": "Bulloch County, GA",
  "value": "13031"
}, {"label": "Burke County, GA", "value": "13033"}, {
  "label": "Butts County, GA",
  "value": "13035"
}, {"label": "Calhoun County, GA", "value": "13037"}, {
  "label": "Camden County, GA",
  "value": "13039"
}, {"label": "Candler County, GA", "value": "13043"}, {
  "label": "Carroll County, GA",
  "value": "13045"
}, {"label": "Catoosa County, GA", "value": "13047"}, {
  "label": "Charlton County, GA",
  "value": "13049"
}, {"label": "Chatham County, GA", "value": "13051"}, {
  "label": "Chattahoochee County, GA",
  "value": "13053"
}, {"label": "Chattooga County, GA", "value": "13055"}, {
  "label": "Cherokee County, GA",
  "value": "13057"
}, {"label": "Clarke County, GA", "value": "13059"}, {
  "label": "Clay County, GA",
  "value": "13061"
}, {"label": "Clayton County, GA", "value": "13063"}, {
  "label": "Clinch County, GA",
  "value": "13065"
}, {"label": "Cobb County, GA", "value": "13067"}, {
  "label": "Coffee County, GA",
  "value": "13069"
}, {"label": "Colquitt County, GA", "value": "13071"}, {
  "label": "Columbia County, GA",
  "value": "13073"
}, {"label": "Cook County, GA", "value": "13075"}, {
  "label": "Coweta County, GA",
  "value": "13077"
}, {"label": "Crawford County, GA", "value": "13079"}, {
  "label": "Crisp County, GA",
  "value": "13081"
}, {"label": "Dade County, GA", "value": "13083"}, {
  "label": "Dawson County, GA",
  "value": "13085"
}, {"label": "Decatur County, GA", "value": "13087"}, {
  "label": "DeKalb County, GA",
  "value": "13089"
}, {"label": "Dodge County, GA", "value": "13091"}, {
  "label": "Dooly County, GA",
  "value": "13093"
}, {"label": "Dougherty County, GA", "value": "13095"}, {
  "label": "Douglas County, GA",
  "value": "13097"
}, {"label": "Early County, GA", "value": "13099"}, {
  "label": "Echols County, GA",
  "value": "13101"
}, {"label": "Effingham County, GA", "value": "13103"}, {
  "label": "Elbert County, GA",
  "value": "13105"
}, {"label": "Emanuel County, GA", "value": "13107"}, {
  "label": "Evans County, GA",
  "value": "13109"
}, {"label": "Fannin County, GA", "value": "13111"}, {
  "label": "Fayette County, GA",
  "value": "13113"
}, {"label": "Floyd County, GA", "value": "13115"}, {
  "label": "Forsyth County, GA",
  "value": "13117"
}, {"label": "Franklin County, GA", "value": "13119"}, {
  "label": "Fulton County, GA",
  "value": "13121"
}, {"label": "Gilmer County, GA", "value": "13123"}, {
  "label": "Glascock County, GA",
  "value": "13125"
}, {"label": "Glynn County, GA", "value": "13127"}, {
  "label": "Gordon County, GA",
  "value": "13129"
}, {"label": "Grady County, GA", "value": "13131"}, {
  "label": "Greene County, GA",
  "value": "13133"
}, {"label": "Gwinnett County, GA", "value": "13135"}, {
  "label": "Habersham County, GA",
  "value": "13137"
}, {"label": "Hall County, GA", "value": "13139"}, {
  "label": "Hancock County, GA",
  "value": "13141"
}, {"label": "Haralson County, GA", "value": "13143"}, {
  "label": "Harris County, GA",
  "value": "13145"
}, {"label": "Hart County, GA", "value": "13147"}, {
  "label": "Heard County, GA",
  "value": "13149"
}, {"label": "Henry County, GA", "value": "13151"}, {
  "label": "Houston County, GA",
  "value": "13153"
}, {"label": "Irwin County, GA", "value": "13155"}, {
  "label": "Jackson County, GA",
  "value": "13157"
}, {"label": "Jasper County, GA", "value": "13159"}, {
  "label": "Jeff Davis County, GA",
  "value": "13161"
}, {"label": "Jefferson County, GA", "value": "13163"}, {
  "label": "Jenkins County, GA",
  "value": "13165"
}, {"label": "Johnson County, GA", "value": "13167"}, {
  "label": "Jones County, GA",
  "value": "13169"
}, {"label": "Lamar County, GA", "value": "13171"}, {
  "label": "Lanier County, GA",
  "value": "13173"
}, {"label": "Laurens County, GA", "value": "13175"}, {
  "label": "Lee County, GA",
  "value": "13177"
}, {"label": "Liberty County, GA", "value": "13179"}, {
  "label": "Lincoln County, GA",
  "value": "13181"
}, {"label": "Long County, GA", "value": "13183"}, {
  "label": "Lowndes County, GA",
  "value": "13185"
}, {"label": "Lumpkin County, GA", "value": "13187"}, {
  "label": "McDuffie County, GA",
  "value": "13189"
}, {"label": "McIntosh County, GA", "value": "13191"}, {
  "label": "Macon County, GA",
  "value": "13193"
}, {"label": "Madison County, GA", "value": "13195"}, {
  "label": "Marion County, GA",
  "value": "13197"
}, {"label": "Meriwether County, GA", "value": "13199"}, {
  "label": "Miller County, GA",
  "value": "13201"
}, {"label": "Mitchell County, GA", "value": "13205"}, {
  "label": "Monroe County, GA",
  "value": "13207"
}, {"label": "Montgomery County, GA", "value": "13209"}, {
  "label": "Morgan County, GA",
  "value": "13211"
}, {"label": "Murray County, GA", "value": "13213"}, {
  "label": "Muscogee County, GA",
  "value": "13215"
}, {"label": "Newton County, GA", "value": "13217"}, {
  "label": "Oconee County, GA",
  "value": "13219"
}, {"label": "Oglethorpe County, GA", "value": "13221"}, {
  "label": "Paulding County, GA",
  "value": "13223"
}, {"label": "Peach County, GA", "value": "13225"}, {
  "label": "Pickens County, GA",
  "value": "13227"
}, {"label": "Pierce County, GA", "value": "13229"}, {
  "label": "Pike County, GA",
  "value": "13231"
}, {"label": "Polk County, GA", "value": "13233"}, {
  "label": "Pulaski County, GA",
  "value": "13235"
}, {"label": "Putnam County, GA", "value": "13237"}, {
  "label": "Quitman County, GA",
  "value": "13239"
}, {"label": "Rabun County, GA", "value": "13241"}, {
  "label": "Randolph County, GA",
  "value": "13243"
}, {"label": "Richmond County, GA", "value": "13245"}, {
  "label": "Rockdale County, GA",
  "value": "13247"
}, {"label": "Schley County, GA", "value": "13249"}, {
  "label": "Screven County, GA",
  "value": "13251"
}, {"label": "Seminole County, GA", "value": "13253"}, {
  "label": "Spalding County, GA",
  "value": "13255"
}, {"label": "Stephens County, GA", "value": "13257"}, {
  "label": "Stewart County, GA",
  "value": "13259"
}, {"label": "Sumter County, GA", "value": "13261"}, {
  "label": "Talbot County, GA",
  "value": "13263"
}, {"label": "Taliaferro County, GA", "value": "13265"}, {
  "label": "Tattnall County, GA",
  "value": "13267"
}, {"label": "Taylor County, GA", "value": "13269"}, {
  "label": "Telfair County, GA",
  "value": "13271"
}, {"label": "Terrell County, GA", "value": "13273"}, {
  "label": "Thomas County, GA",
  "value": "13275"
}, {"label": "Tift County, GA", "value": "13277"}, {
  "label": "Toombs County, GA",
  "value": "13279"
}, {"label": "Towns County, GA", "value": "13281"}, {
  "label": "Treutlen County, GA",
  "value": "13283"
}, {"label": "Troup County, GA", "value": "13285"}, {
  "label": "Turner County, GA",
  "value": "13287"
}, {"label": "Twiggs County, GA", "value": "13289"}, {
  "label": "Union County, GA",
  "value": "13291"
}, {"label": "Upson County, GA", "value": "13293"}, {
  "label": "Walker County, GA",
  "value": "13295"
}, {"label": "Walton County, GA", "value": "13297"}, {
  "label": "Ware County, GA",
  "value": "13299"
}, {"label": "Warren County, GA", "value": "13301"}, {
  "label": "Washington County, GA",
  "value": "13303"
}, {"label": "Wayne County, GA", "value": "13305"}, {
  "label": "Webster County, GA",
  "value": "13307"
}, {"label": "Wheeler County, GA", "value": "13309"}, {
  "label": "White County, GA",
  "value": "13311"
}, {"label": "Whitfield County, GA", "value": "13313"}, {
  "label": "Wilcox County, GA",
  "value": "13315"
}, {"label": "Wilkes County, GA", "value": "13317"}, {
  "label": "Wilkinson County, GA",
  "value": "13319"
}, {"label": "Worth County, GA", "value": "13321"}, {
  "label": "Ada County, ID",
  "value": "16001"
}, {"label": "Adams County, ID", "value": "16003"}, {
  "label": "Bannock County, ID",
  "value": "16005"
}, {"label": "Bear Lake County, ID", "value": "16007"}, {
  "label": "Benewah County, ID",
  "value": "16009"
}, {"label": "Bingham County, ID", "value": "16011"}, {
  "label": "Blaine County, ID",
  "value": "16013"
}, {"label": "Boise County, ID", "value": "16015"}, {
  "label": "Bonner County, ID",
  "value": "16017"
}, {"label": "Bonneville County, ID", "value": "16019"}, {
  "label": "Boundary County, ID",
  "value": "16021"
}, {"label": "Butte County, ID", "value": "16023"}, {
  "label": "Camas County, ID",
  "value": "16025"
}, {"label": "Canyon County, ID", "value": "16027"}, {
  "label": "Caribou County, ID",
  "value": "16029"
}, {"label": "Cassia County, ID", "value": "16031"}, {
  "label": "Clark County, ID",
  "value": "16033"
}, {"label": "Clearwater County, ID", "value": "16035"}, {
  "label": "Custer County, ID",
  "value": "16037"
}, {"label": "Elmore County, ID", "value": "16039"}, {
  "label": "Franklin County, ID",
  "value": "16041"
}, {"label": "Fremont County, ID", "value": "16043"}, {
  "label": "Gem County, ID",
  "value": "16045"
}, {"label": "Gooding County, ID", "value": "16047"}, {
  "label": "Idaho County, ID",
  "value": "16049"
}, {"label": "Jefferson County, ID", "value": "16051"}, {
  "label": "Jerome County, ID",
  "value": "16053"
}, {"label": "Kootenai County, ID", "value": "16055"}, {
  "label": "Latah County, ID",
  "value": "16057"
}, {"label": "Lemhi County, ID", "value": "16059"}, {
  "label": "Lewis County, ID",
  "value": "16061"
}, {"label": "Lincoln County, ID", "value": "16063"}, {
  "label": "Madison County, ID",
  "value": "16065"
}, {"label": "Minidoka County, ID", "value": "16067"}, {
  "label": "Nez Perce County, ID",
  "value": "16069"
}, {"label": "Oneida County, ID", "value": "16071"}, {
  "label": "Owyhee County, ID",
  "value": "16073"
}, {"label": "Payette County, ID", "value": "16075"}, {
  "label": "Power County, ID",
  "value": "16077"
}, {"label": "Shoshone County, ID", "value": "16079"}, {
  "label": "Teton County, ID",
  "value": "16081"
}, {"label": "Twin Falls County, ID", "value": "16083"}, {
  "label": "Valley County, ID",
  "value": "16085"
}, {"label": "Washington County, ID", "value": "16087"}, {
  "label": "Adams County, IL",
  "value": "17001"
}, {"label": "Alexander County, IL", "value": "17003"}, {
  "label": "Bond County, IL",
  "value": "17005"
}, {"label": "Boone County, IL", "value": "17007"}, {
  "label": "Brown County, IL",
  "value": "17009"
}, {"label": "Bureau County, IL", "value": "17011"}, {
  "label": "Calhoun County, IL",
  "value": "17013"
}, {"label": "Carroll County, IL", "value": "17015"}, {
  "label": "Cass County, IL",
  "value": "17017"
}, {"label": "Champaign County, IL", "value": "17019"}, {
  "label": "Christian County, IL",
  "value": "17021"
}, {"label": "Clark County, IL", "value": "17023"}, {
  "label": "Clay County, IL",
  "value": "17025"
}, {"label": "Clinton County, IL", "value": "17027"}, {
  "label": "Coles County, IL",
  "value": "17029"
}, {"label": "Cook County, IL", "value": "17031"}, {
  "label": "Crawford County, IL",
  "value": "17033"
}, {"label": "Cumberland County, IL", "value": "17035"}, {
  "label": "DeKalb County, IL",
  "value": "17037"
}, {"label": "De Witt County, IL", "value": "17039"}, {
  "label": "Douglas County, IL",
  "value": "17041"
}, {"label": "DuPage County, IL", "value": "17043"}, {
  "label": "Edgar County, IL",
  "value": "17045"
}, {"label": "Edwards County, IL", "value": "17047"}, {
  "label": "Effingham County, IL",
  "value": "17049"
}, {"label": "Fayette County, IL", "value": "17051"}, {
  "label": "Ford County, IL",
  "value": "17053"
}, {"label": "Franklin County, IL", "value": "17055"}, {
  "label": "Fulton County, IL",
  "value": "17057"
}, {"label": "Gallatin County, IL", "value": "17059"}, {
  "label": "Greene County, IL",
  "value": "17061"
}, {"label": "Grundy County, IL", "value": "17063"}, {
  "label": "Hamilton County, IL",
  "value": "17065"
}, {"label": "Hancock County, IL", "value": "17067"}, {
  "label": "Hardin County, IL",
  "value": "17069"
}, {"label": "Henderson County, IL", "value": "17071"}, {
  "label": "Henry County, IL",
  "value": "17073"
}, {"label": "Iroquois County, IL", "value": "17075"}, {
  "label": "Jackson County, IL",
  "value": "17077"
}, {"label": "Jasper County, IL", "value": "17079"}, {
  "label": "Jefferson County, IL",
  "value": "17081"
}, {"label": "Jersey County, IL", "value": "17083"}, {
  "label": "Jo Daviess County, IL",
  "value": "17085"
}, {"label": "Johnson County, IL", "value": "17087"}, {
  "label": "Kane County, IL",
  "value": "17089"
}, {"label": "Kankakee County, IL", "value": "17091"}, {
  "label": "Kendall County, IL",
  "value": "17093"
}, {"label": "Knox County, IL", "value": "17095"}, {
  "label": "Lake County, IL",
  "value": "17097"
}, {"label": "LaSalle County, IL", "value": "17099"}, {
  "label": "Lawrence County, IL",
  "value": "17101"
}, {"label": "Lee County, IL", "value": "17103"}, {
  "label": "Livingston County, IL",
  "value": "17105"
}, {"label": "Logan County, IL", "value": "17107"}, {
  "label": "McDonough County, IL",
  "value": "17109"
}, {"label": "McHenry County, IL", "value": "17111"}, {
  "label": "McLean County, IL",
  "value": "17113"
}, {"label": "Macon County, IL", "value": "17115"}, {
  "label": "Macoupin County, IL",
  "value": "17117"
}, {"label": "Madison County, IL", "value": "17119"}, {
  "label": "Marion County, IL",
  "value": "17121"
}, {"label": "Marshall County, IL", "value": "17123"}, {
  "label": "Mason County, IL",
  "value": "17125"
}, {"label": "Massac County, IL", "value": "17127"}, {
  "label": "Menard County, IL",
  "value": "17129"
}, {"label": "Mercer County, IL", "value": "17131"}, {
  "label": "Monroe County, IL",
  "value": "17133"
}, {"label": "Montgomery County, IL", "value": "17135"}, {
  "label": "Morgan County, IL",
  "value": "17137"
}, {"label": "Moultrie County, IL", "value": "17139"}, {
  "label": "Ogle County, IL",
  "value": "17141"
}, {"label": "Peoria County, IL", "value": "17143"}, {
  "label": "Perry County, IL",
  "value": "17145"
}, {"label": "Piatt County, IL", "value": "17147"}, {
  "label": "Pike County, IL",
  "value": "17149"
}, {"label": "Pope County, IL", "value": "17151"}, {
  "label": "Pulaski County, IL",
  "value": "17153"
}, {"label": "Putnam County, IL", "value": "17155"}, {
  "label": "Randolph County, IL",
  "value": "17157"
}, {"label": "Richland County, IL", "value": "17159"}, {
  "label": "Rock Island County, IL",
  "value": "17161"
}, {"label": "St. Clair County, IL", "value": "17163"}, {
  "label": "Saline County, IL",
  "value": "17165"
}, {"label": "Sangamon County, IL", "value": "17167"}, {
  "label": "Schuyler County, IL",
  "value": "17169"
}, {"label": "Scott County, IL", "value": "17171"}, {
  "label": "Shelby County, IL",
  "value": "17173"
}, {"label": "Stark County, IL", "value": "17175"}, {
  "label": "Stephenson County, IL",
  "value": "17177"
}, {"label": "Tazewell County, IL", "value": "17179"}, {
  "label": "Union County, IL",
  "value": "17181"
}, {"label": "Vermilion County, IL", "value": "17183"}, {
  "label": "Wabash County, IL",
  "value": "17185"
}, {"label": "Warren County, IL", "value": "17187"}, {
  "label": "Washington County, IL",
  "value": "17189"
}, {"label": "Wayne County, IL", "value": "17191"}, {
  "label": "White County, IL",
  "value": "17193"
}, {"label": "Whiteside County, IL", "value": "17195"}, {
  "label": "Will County, IL",
  "value": "17197"
}, {"label": "Williamson County, IL", "value": "17199"}, {
  "label": "Winnebago County, IL",
  "value": "17201"
}, {"label": "Woodford County, IL", "value": "17203"}, {
  "label": "Adams County, IN",
  "value": "18001"
}, {"label": "Allen County, IN", "value": "18003"}, {
  "label": "Bartholomew County, IN",
  "value": "18005"
}, {"label": "Benton County, IN", "value": "18007"}, {
  "label": "Blackford County, IN",
  "value": "18009"
}, {"label": "Boone County, IN", "value": "18011"}, {
  "label": "Brown County, IN",
  "value": "18013"
}, {"label": "Carroll County, IN", "value": "18015"}, {
  "label": "Cass County, IN",
  "value": "18017"
}, {"label": "Clark County, IN", "value": "18019"}, {
  "label": "Clay County, IN",
  "value": "18021"
}, {"label": "Clinton County, IN", "value": "18023"}, {
  "label": "Crawford County, IN",
  "value": "18025"
}, {"label": "Daviess County, IN", "value": "18027"}, {
  "label": "Dearborn County, IN",
  "value": "18029"
}, {"label": "Decatur County, IN", "value": "18031"}, {
  "label": "DeKalb County, IN",
  "value": "18033"
}, {"label": "Delaware County, IN", "value": "18035"}, {
  "label": "Dubois County, IN",
  "value": "18037"
}, {"label": "Elkhart County, IN", "value": "18039"}, {
  "label": "Fayette County, IN",
  "value": "18041"
}, {"label": "Floyd County, IN", "value": "18043"}, {
  "label": "Fountain County, IN",
  "value": "18045"
}, {"label": "Franklin County, IN", "value": "18047"}, {
  "label": "Fulton County, IN",
  "value": "18049"
}, {"label": "Gibson County, IN", "value": "18051"}, {
  "label": "Grant County, IN",
  "value": "18053"
}, {"label": "Greene County, IN", "value": "18055"}, {
  "label": "Hamilton County, IN",
  "value": "18057"
}, {"label": "Hancock County, IN", "value": "18059"}, {
  "label": "Harrison County, IN",
  "value": "18061"
}, {"label": "Hendricks County, IN", "value": "18063"}, {
  "label": "Henry County, IN",
  "value": "18065"
}, {"label": "Howard County, IN", "value": "18067"}, {
  "label": "Huntington County, IN",
  "value": "18069"
}, {"label": "Jackson County, IN", "value": "18071"}, {
  "label": "Jasper County, IN",
  "value": "18073"
}, {"label": "Jay County, IN", "value": "18075"}, {
  "label": "Jefferson County, IN",
  "value": "18077"
}, {"label": "Jennings County, IN", "value": "18079"}, {
  "label": "Johnson County, IN",
  "value": "18081"
}, {"label": "Knox County, IN", "value": "18083"}, {
  "label": "Kosciusko County, IN",
  "value": "18085"
}, {"label": "LaGrange County, IN", "value": "18087"}, {
  "label": "Lake County, IN",
  "value": "18089"
}, {"label": "LaPorte County, IN", "value": "18091"}, {
  "label": "Lawrence County, IN",
  "value": "18093"
}, {"label": "Madison County, IN", "value": "18095"}, {
  "label": "Marion County, IN",
  "value": "18097"
}, {"label": "Marshall County, IN", "value": "18099"}, {
  "label": "Martin County, IN",
  "value": "18101"
}, {"label": "Miami County, IN", "value": "18103"}, {
  "label": "Monroe County, IN",
  "value": "18105"
}, {"label": "Montgomery County, IN", "value": "18107"}, {
  "label": "Morgan County, IN",
  "value": "18109"
}, {"label": "Newton County, IN", "value": "18111"}, {
  "label": "Noble County, IN",
  "value": "18113"
}, {"label": "Ohio County, IN", "value": "18115"}, {
  "label": "Orange County, IN",
  "value": "18117"
}, {"label": "Owen County, IN", "value": "18119"}, {
  "label": "Parke County, IN",
  "value": "18121"
}, {"label": "Perry County, IN", "value": "18123"}, {
  "label": "Pike County, IN",
  "value": "18125"
}, {"label": "Porter County, IN", "value": "18127"}, {
  "label": "Posey County, IN",
  "value": "18129"
}, {"label": "Pulaski County, IN", "value": "18131"}, {
  "label": "Putnam County, IN",
  "value": "18133"
}, {"label": "Randolph County, IN", "value": "18135"}, {
  "label": "Ripley County, IN",
  "value": "18137"
}, {"label": "Rush County, IN", "value": "18139"}, {
  "label": "St. Joseph County, IN",
  "value": "18141"
}, {"label": "Scott County, IN", "value": "18143"}, {
  "label": "Shelby County, IN",
  "value": "18145"
}, {"label": "Spencer County, IN", "value": "18147"}, {
  "label": "Starke County, IN",
  "value": "18149"
}, {"label": "Steuben County, IN", "value": "18151"}, {
  "label": "Sullivan County, IN",
  "value": "18153"
}, {"label": "Switzerland County, IN", "value": "18155"}, {
  "label": "Tippecanoe County, IN",
  "value": "18157"
}, {"label": "Tipton County, IN", "value": "18159"}, {
  "label": "Union County, IN",
  "value": "18161"
}, {"label": "Vanderburgh County, IN", "value": "18163"}, {
  "label": "Vermillion County, IN",
  "value": "18165"
}, {"label": "Vigo County, IN", "value": "18167"}, {
  "label": "Wabash County, IN",
  "value": "18169"
}, {"label": "Warren County, IN", "value": "18171"}, {
  "label": "Warrick County, IN",
  "value": "18173"
}, {"label": "Washington County, IN", "value": "18175"}, {
  "label": "Wayne County, IN",
  "value": "18177"
}, {"label": "Wells County, IN", "value": "18179"}, {
  "label": "White County, IN",
  "value": "18181"
}, {"label": "Whitley County, IN", "value": "18183"}, {
  "label": "Adair County, IA",
  "value": "19001"
}, {"label": "Adams County, IA", "value": "19003"}, {
  "label": "Allamakee County, IA",
  "value": "19005"
}, {"label": "Appanoose County, IA", "value": "19007"}, {
  "label": "Audubon County, IA",
  "value": "19009"
}, {"label": "Benton County, IA", "value": "19011"}, {
  "label": "Black Hawk County, IA",
  "value": "19013"
}, {"label": "Boone County, IA", "value": "19015"}, {
  "label": "Bremer County, IA",
  "value": "19017"
}, {"label": "Buchanan County, IA", "value": "19019"}, {
  "label": "Buena Vista County, IA",
  "value": "19021"
}, {"label": "Butler County, IA", "value": "19023"}, {
  "label": "Calhoun County, IA",
  "value": "19025"
}, {"label": "Carroll County, IA", "value": "19027"}, {
  "label": "Cass County, IA",
  "value": "19029"
}, {"label": "Cedar County, IA", "value": "19031"}, {
  "label": "Cerro Gordo County, IA",
  "value": "19033"
}, {"label": "Cherokee County, IA", "value": "19035"}, {
  "label": "Chickasaw County, IA",
  "value": "19037"
}, {"label": "Clarke County, IA", "value": "19039"}, {
  "label": "Clay County, IA",
  "value": "19041"
}, {"label": "Clayton County, IA", "value": "19043"}, {
  "label": "Clinton County, IA",
  "value": "19045"
}, {"label": "Crawford County, IA", "value": "19047"}, {
  "label": "Dallas County, IA",
  "value": "19049"
}, {"label": "Davis County, IA", "value": "19051"}, {
  "label": "Decatur County, IA",
  "value": "19053"
}, {"label": "Delaware County, IA", "value": "19055"}, {
  "label": "Des Moines County, IA",
  "value": "19057"
}, {"label": "Dickinson County, IA", "value": "19059"}, {
  "label": "Dubuque County, IA",
  "value": "19061"
}, {"label": "Emmet County, IA", "value": "19063"}, {
  "label": "Fayette County, IA",
  "value": "19065"
}, {"label": "Floyd County, IA", "value": "19067"}, {
  "label": "Franklin County, IA",
  "value": "19069"
}, {"label": "Fremont County, IA", "value": "19071"}, {
  "label": "Greene County, IA",
  "value": "19073"
}, {"label": "Grundy County, IA", "value": "19075"}, {
  "label": "Guthrie County, IA",
  "value": "19077"
}, {"label": "Hamilton County, IA", "value": "19079"}, {
  "label": "Hancock County, IA",
  "value": "19081"
}, {"label": "Hardin County, IA", "value": "19083"}, {
  "label": "Harrison County, IA",
  "value": "19085"
}, {"label": "Henry County, IA", "value": "19087"}, {
  "label": "Howard County, IA",
  "value": "19089"
}, {"label": "Humboldt County, IA", "value": "19091"}, {
  "label": "Ida County, IA",
  "value": "19093"
}, {"label": "Iowa County, IA", "value": "19095"}, {
  "label": "Jackson County, IA",
  "value": "19097"
}, {"label": "Jasper County, IA", "value": "19099"}, {
  "label": "Jefferson County, IA",
  "value": "19101"
}, {"label": "Johnson County, IA", "value": "19103"}, {
  "label": "Jones County, IA",
  "value": "19105"
}, {"label": "Keokuk County, IA", "value": "19107"}, {
  "label": "Kossuth County, IA",
  "value": "19109"
}, {"label": "Lee County, IA", "value": "19111"}, {
  "label": "Linn County, IA",
  "value": "19113"
}, {"label": "Louisa County, IA", "value": "19115"}, {
  "label": "Lucas County, IA",
  "value": "19117"
}, {"label": "Lyon County, IA", "value": "19119"}, {
  "label": "Madison County, IA",
  "value": "19121"
}, {"label": "Mahaska County, IA", "value": "19123"}, {
  "label": "Marion County, IA",
  "value": "19125"
}, {"label": "Marshall County, IA", "value": "19127"}, {
  "label": "Mills County, IA",
  "value": "19129"
}, {"label": "Mitchell County, IA", "value": "19131"}, {
  "label": "Monona County, IA",
  "value": "19133"
}, {"label": "Monroe County, IA", "value": "19135"}, {
  "label": "Montgomery County, IA",
  "value": "19137"
}, {"label": "Muscatine County, IA", "value": "19139"}, {
  "label": "O'Brien County, IA",
  "value": "19141"
}, {"label": "Osceola County, IA", "value": "19143"}, {
  "label": "Page County, IA",
  "value": "19145"
}, {"label": "Palo Alto County, IA", "value": "19147"}, {
  "label": "Plymouth County, IA",
  "value": "19149"
}, {"label": "Pocahontas County, IA", "value": "19151"}, {
  "label": "Polk County, IA",
  "value": "19153"
}, {"label": "Pottawattamie County, IA", "value": "19155"}, {
  "label": "Poweshiek County, IA",
  "value": "19157"
}, {"label": "Ringgold County, IA", "value": "19159"}, {
  "label": "Sac County, IA",
  "value": "19161"
}, {"label": "Scott County, IA", "value": "19163"}, {
  "label": "Shelby County, IA",
  "value": "19165"
}, {"label": "Sioux County, IA", "value": "19167"}, {
  "label": "Story County, IA",
  "value": "19169"
}, {"label": "Tama County, IA", "value": "19171"}, {
  "label": "Taylor County, IA",
  "value": "19173"
}, {"label": "Union County, IA", "value": "19175"}, {
  "label": "Van Buren County, IA",
  "value": "19177"
}, {"label": "Wapello County, IA", "value": "19179"}, {
  "label": "Warren County, IA",
  "value": "19181"
}, {"label": "Washington County, IA", "value": "19183"}, {
  "label": "Wayne County, IA",
  "value": "19185"
}, {"label": "Webster County, IA", "value": "19187"}, {
  "label": "Winnebago County, IA",
  "value": "19189"
}, {"label": "Winneshiek County, IA", "value": "19191"}, {
  "label": "Woodbury County, IA",
  "value": "19193"
}, {"label": "Worth County, IA", "value": "19195"}, {
  "label": "Wright County, IA",
  "value": "19197"
}, {"label": "Allen County, KS", "value": "20001"}, {
  "label": "Anderson County, KS",
  "value": "20003"
}, {"label": "Atchison County, KS", "value": "20005"}, {
  "label": "Barber County, KS",
  "value": "20007"
}, {"label": "Barton County, KS", "value": "20009"}, {
  "label": "Bourbon County, KS",
  "value": "20011"
}, {"label": "Brown County, KS", "value": "20013"}, {
  "label": "Butler County, KS",
  "value": "20015"
}, {"label": "Chase County, KS", "value": "20017"}, {
  "label": "Chautauqua County, KS",
  "value": "20019"
}, {"label": "Cherokee County, KS", "value": "20021"}, {
  "label": "Cheyenne County, KS",
  "value": "20023"
}, {"label": "Clark County, KS", "value": "20025"}, {
  "label": "Clay County, KS",
  "value": "20027"
}, {"label": "Cloud County, KS", "value": "20029"}, {
  "label": "Coffey County, KS",
  "value": "20031"
}, {"label": "Comanche County, KS", "value": "20033"}, {
  "label": "Cowley County, KS",
  "value": "20035"
}, {"label": "Crawford County, KS", "value": "20037"}, {
  "label": "Decatur County, KS",
  "value": "20039"
}, {"label": "Dickinson County, KS", "value": "20041"}, {
  "label": "Doniphan County, KS",
  "value": "20043"
}, {"label": "Douglas County, KS", "value": "20045"}, {
  "label": "Edwards County, KS",
  "value": "20047"
}, {"label": "Elk County, KS", "value": "20049"}, {
  "label": "Ellis County, KS",
  "value": "20051"
}, {"label": "Ellsworth County, KS", "value": "20053"}, {
  "label": "Finney County, KS",
  "value": "20055"
}, {"label": "Ford County, KS", "value": "20057"}, {
  "label": "Franklin County, KS",
  "value": "20059"
}, {"label": "Geary County, KS", "value": "20061"}, {
  "label": "Gove County, KS",
  "value": "20063"
}, {"label": "Graham County, KS", "value": "20065"}, {
  "label": "Grant County, KS",
  "value": "20067"
}, {"label": "Gray County, KS", "value": "20069"}, {
  "label": "Greeley County, KS",
  "value": "20071"
}, {"label": "Greenwood County, KS", "value": "20073"}, {
  "label": "Hamilton County, KS",
  "value": "20075"
}, {"label": "Harper County, KS", "value": "20077"}, {
  "label": "Harvey County, KS",
  "value": "20079"
}, {"label": "Haskell County, KS", "value": "20081"}, {
  "label": "Hodgeman County, KS",
  "value": "20083"
}, {"label": "Jackson County, KS", "value": "20085"}, {
  "label": "Jefferson County, KS",
  "value": "20087"
}, {"label": "Jewell County, KS", "value": "20089"}, {
  "label": "Johnson County, KS",
  "value": "20091"
}, {"label": "Kearny County, KS", "value": "20093"}, {
  "label": "Kingman County, KS",
  "value": "20095"
}, {"label": "Kiowa County, KS", "value": "20097"}, {
  "label": "Labette County, KS",
  "value": "20099"
}, {"label": "Lane County, KS", "value": "20101"}, {
  "label": "Leavenworth County, KS",
  "value": "20103"
}, {"label": "Lincoln County, KS", "value": "20105"}, {
  "label": "Linn County, KS",
  "value": "20107"
}, {"label": "Logan County, KS", "value": "20109"}, {
  "label": "Lyon County, KS",
  "value": "20111"
}, {"label": "McPherson County, KS", "value": "20113"}, {
  "label": "Marion County, KS",
  "value": "20115"
}, {"label": "Marshall County, KS", "value": "20117"}, {
  "label": "Meade County, KS",
  "value": "20119"
}, {"label": "Miami County, KS", "value": "20121"}, {
  "label": "Mitchell County, KS",
  "value": "20123"
}, {"label": "Montgomery County, KS", "value": "20125"}, {
  "label": "Morris County, KS",
  "value": "20127"
}, {"label": "Morton County, KS", "value": "20129"}, {
  "label": "Nemaha County, KS",
  "value": "20131"
}, {"label": "Neosho County, KS", "value": "20133"}, {
  "label": "Ness County, KS",
  "value": "20135"
}, {"label": "Norton County, KS", "value": "20137"}, {
  "label": "Osage County, KS",
  "value": "20139"
}, {"label": "Osborne County, KS", "value": "20141"}, {
  "label": "Ottawa County, KS",
  "value": "20143"
}, {"label": "Pawnee County, KS", "value": "20145"}, {
  "label": "Phillips County, KS",
  "value": "20147"
}, {"label": "Pottawatomie County, KS", "value": "20149"}, {
  "label": "Pratt County, KS",
  "value": "20151"
}, {"label": "Rawlins County, KS", "value": "20153"}, {
  "label": "Reno County, KS",
  "value": "20155"
}, {"label": "Republic County, KS", "value": "20157"}, {
  "label": "Rice County, KS",
  "value": "20159"
}, {"label": "Riley County, KS", "value": "20161"}, {
  "label": "Rooks County, KS",
  "value": "20163"
}, {"label": "Rush County, KS", "value": "20165"}, {
  "label": "Russell County, KS",
  "value": "20167"
}, {"label": "Saline County, KS", "value": "20169"}, {
  "label": "Scott County, KS",
  "value": "20171"
}, {"label": "Sedgwick County, KS", "value": "20173"}, {
  "label": "Seward County, KS",
  "value": "20175"
}, {"label": "Shawnee County, KS", "value": "20177"}, {
  "label": "Sheridan County, KS",
  "value": "20179"
}, {"label": "Sherman County, KS", "value": "20181"}, {
  "label": "Smith County, KS",
  "value": "20183"
}, {"label": "Stafford County, KS", "value": "20185"}, {
  "label": "Stanton County, KS",
  "value": "20187"
}, {"label": "Stevens County, KS", "value": "20189"}, {
  "label": "Sumner County, KS",
  "value": "20191"
}, {"label": "Thomas County, KS", "value": "20193"}, {
  "label": "Trego County, KS",
  "value": "20195"
}, {"label": "Wabaunsee County, KS", "value": "20197"}, {
  "label": "Wallace County, KS",
  "value": "20199"
}, {"label": "Washington County, KS", "value": "20201"}, {
  "label": "Wichita County, KS",
  "value": "20203"
}, {"label": "Wilson County, KS", "value": "20205"}, {
  "label": "Woodson County, KS",
  "value": "20207"
}, {"label": "Wyandotte County, KS", "value": "20209"}, {
  "label": "Adair County, KY",
  "value": "21001"
}, {"label": "Allen County, KY", "value": "21003"}, {
  "label": "Anderson County, KY",
  "value": "21005"
}, {"label": "Ballard County, KY", "value": "21007"}, {
  "label": "Barren County, KY",
  "value": "21009"
}, {"label": "Bath County, KY", "value": "21011"}, {
  "label": "Bell County, KY",
  "value": "21013"
}, {"label": "Boone County, KY", "value": "21015"}, {
  "label": "Bourbon County, KY",
  "value": "21017"
}, {"label": "Boyd County, KY", "value": "21019"}, {
  "label": "Boyle County, KY",
  "value": "21021"
}, {"label": "Bracken County, KY", "value": "21023"}, {
  "label": "Breathitt County, KY",
  "value": "21025"
}, {"label": "Breckinridge County, KY", "value": "21027"}, {
  "label": "Bullitt County, KY",
  "value": "21029"
}, {"label": "Butler County, KY", "value": "21031"}, {
  "label": "Caldwell County, KY",
  "value": "21033"
}, {"label": "Calloway County, KY", "value": "21035"}, {
  "label": "Campbell County, KY",
  "value": "21037"
}, {"label": "Carlisle County, KY", "value": "21039"}, {
  "label": "Carroll County, KY",
  "value": "21041"
}, {"label": "Carter County, KY", "value": "21043"}, {
  "label": "Casey County, KY",
  "value": "21045"
}, {"label": "Christian County, KY", "value": "21047"}, {
  "label": "Clark County, KY",
  "value": "21049"
}, {"label": "Clay County, KY", "value": "21051"}, {
  "label": "Clinton County, KY",
  "value": "21053"
}, {"label": "Crittenden County, KY", "value": "21055"}, {
  "label": "Cumberland County, KY",
  "value": "21057"
}, {"label": "Daviess County, KY", "value": "21059"}, {
  "label": "Edmonson County, KY",
  "value": "21061"
}, {"label": "Elliott County, KY", "value": "21063"}, {
  "label": "Estill County, KY",
  "value": "21065"
}, {"label": "Fayette County, KY", "value": "21067"}, {
  "label": "Fleming County, KY",
  "value": "21069"
}, {"label": "Floyd County, KY", "value": "21071"}, {
  "label": "Franklin County, KY",
  "value": "21073"
}, {"label": "Fulton County, KY", "value": "21075"}, {
  "label": "Gallatin County, KY",
  "value": "21077"
}, {"label": "Garrard County, KY", "value": "21079"}, {
  "label": "Grant County, KY",
  "value": "21081"
}, {"label": "Graves County, KY", "value": "21083"}, {
  "label": "Grayson County, KY",
  "value": "21085"
}, {"label": "Green County, KY", "value": "21087"}, {
  "label": "Greenup County, KY",
  "value": "21089"
}, {"label": "Hancock County, KY", "value": "21091"}, {
  "label": "Hardin County, KY",
  "value": "21093"
}, {"label": "Harlan County, KY", "value": "21095"}, {
  "label": "Harrison County, KY",
  "value": "21097"
}, {"label": "Hart County, KY", "value": "21099"}, {
  "label": "Henderson County, KY",
  "value": "21101"
}, {"label": "Henry County, KY", "value": "21103"}, {
  "label": "Hickman County, KY",
  "value": "21105"
}, {"label": "Hopkins County, KY", "value": "21107"}, {
  "label": "Jackson County, KY",
  "value": "21109"
}, {"label": "Jefferson County, KY", "value": "21111"}, {
  "label": "Jessamine County, KY",
  "value": "21113"
}, {"label": "Johnson County, KY", "value": "21115"}, {
  "label": "Kenton County, KY",
  "value": "21117"
}, {"label": "Knott County, KY", "value": "21119"}, {
  "label": "Knox County, KY",
  "value": "21121"
}, {"label": "Larue County, KY", "value": "21123"}, {
  "label": "Laurel County, KY",
  "value": "21125"
}, {"label": "Lawrence County, KY", "value": "21127"}, {
  "label": "Lee County, KY",
  "value": "21129"
}, {"label": "Leslie County, KY", "value": "21131"}, {
  "label": "Letcher County, KY",
  "value": "21133"
}, {"label": "Lewis County, KY", "value": "21135"}, {
  "label": "Lincoln County, KY",
  "value": "21137"
}, {"label": "Livingston County, KY", "value": "21139"}, {
  "label": "Logan County, KY",
  "value": "21141"
}, {"label": "Lyon County, KY", "value": "21143"}, {
  "label": "McCracken County, KY",
  "value": "21145"
}, {"label": "McCreary County, KY", "value": "21147"}, {
  "label": "McLean County, KY",
  "value": "21149"
}, {"label": "Madison County, KY", "value": "21151"}, {
  "label": "Magoffin County, KY",
  "value": "21153"
}, {"label": "Marion County, KY", "value": "21155"}, {
  "label": "Marshall County, KY",
  "value": "21157"
}, {"label": "Martin County, KY", "value": "21159"}, {
  "label": "Mason County, KY",
  "value": "21161"
}, {"label": "Meade County, KY", "value": "21163"}, {
  "label": "Menifee County, KY",
  "value": "21165"
}, {"label": "Mercer County, KY", "value": "21167"}, {
  "label": "Metcalfe County, KY",
  "value": "21169"
}, {"label": "Monroe County, KY", "value": "21171"}, {
  "label": "Montgomery County, KY",
  "value": "21173"
}, {"label": "Morgan County, KY", "value": "21175"}, {
  "label": "Muhlenberg County, KY",
  "value": "21177"
}, {"label": "Nelson County, KY", "value": "21179"}, {
  "label": "Nicholas County, KY",
  "value": "21181"
}, {"label": "Ohio County, KY", "value": "21183"}, {
  "label": "Oldham County, KY",
  "value": "21185"
}, {"label": "Owen County, KY", "value": "21187"}, {
  "label": "Owsley County, KY",
  "value": "21189"
}, {"label": "Pendleton County, KY", "value": "21191"}, {
  "label": "Perry County, KY",
  "value": "21193"
}, {"label": "Pike County, KY", "value": "21195"}, {
  "label": "Powell County, KY",
  "value": "21197"
}, {"label": "Pulaski County, KY", "value": "21199"}, {
  "label": "Robertson County, KY",
  "value": "21201"
}, {"label": "Rockcastle County, KY", "value": "21203"}, {
  "label": "Rowan County, KY",
  "value": "21205"
}, {"label": "Russell County, KY", "value": "21207"}, {
  "label": "Scott County, KY",
  "value": "21209"
}, {"label": "Shelby County, KY", "value": "21211"}, {
  "label": "Simpson County, KY",
  "value": "21213"
}, {"label": "Spencer County, KY", "value": "21215"}, {
  "label": "Taylor County, KY",
  "value": "21217"
}, {"label": "Todd County, KY", "value": "21219"}, {
  "label": "Trigg County, KY",
  "value": "21221"
}, {"label": "Trimble County, KY", "value": "21223"}, {
  "label": "Union County, KY",
  "value": "21225"
}, {"label": "Warren County, KY", "value": "21227"}, {
  "label": "Washington County, KY",
  "value": "21229"
}, {"label": "Wayne County, KY", "value": "21231"}, {
  "label": "Webster County, KY",
  "value": "21233"
}, {"label": "Whitley County, KY", "value": "21235"}, {
  "label": "Wolfe County, KY",
  "value": "21237"
}, {"label": "Woodford County, KY", "value": "21239"}, {
  "label": "Acadia Parish, LA",
  "value": "22001"
}, {"label": "Allen Parish, LA", "value": "22003"}, {
  "label": "Ascension Parish, LA",
  "value": "22005"
}, {"label": "Assumption Parish, LA", "value": "22007"}, {
  "label": "Avoyelles Parish, LA",
  "value": "22009"
}, {"label": "Beauregard Parish, LA", "value": "22011"}, {
  "label": "Bienville Parish, LA",
  "value": "22013"
}, {"label": "Bossier Parish, LA", "value": "22015"}, {
  "label": "Caddo Parish, LA",
  "value": "22017"
}, {"label": "Calcasieu Parish, LA", "value": "22019"}, {
  "label": "Caldwell Parish, LA",
  "value": "22021"
}, {"label": "Cameron Parish, LA", "value": "22023"}, {
  "label": "Catahoula Parish, LA",
  "value": "22025"
}, {"label": "Claiborne Parish, LA", "value": "22027"}, {
  "label": "Concordia Parish, LA",
  "value": "22029"
}, {"label": "De Soto Parish, LA", "value": "22031"}, {
  "label": "East Baton Rouge Parish, LA",
  "value": "22033"
}, {"label": "East Carroll Parish, LA", "value": "22035"}, {
  "label": "East Feliciana Parish, LA",
  "value": "22037"
}, {"label": "Evangeline Parish, LA", "value": "22039"}, {
  "label": "Franklin Parish, LA",
  "value": "22041"
}, {"label": "Grant Parish, LA", "value": "22043"}, {
  "label": "Iberia Parish, LA",
  "value": "22045"
}, {"label": "Iberville Parish, LA", "value": "22047"}, {
  "label": "Jackson Parish, LA",
  "value": "22049"
}, {"label": "Jefferson Parish, LA", "value": "22051"}, {
  "label": "Jefferson Davis Parish, LA",
  "value": "22053"
}, {"label": "Lafayette Parish, LA", "value": "22055"}, {
  "label": "Lafourche Parish, LA",
  "value": "22057"
}, {"label": "La Salle Parish, LA", "value": "22059"}, {
  "label": "Lincoln Parish, LA",
  "value": "22061"
}, {"label": "Livingston Parish, LA", "value": "22063"}, {
  "label": "Madison Parish, LA",
  "value": "22065"
}, {"label": "Morehouse Parish, LA", "value": "22067"}, {
  "label": "Natchitoches Parish, LA",
  "value": "22069"
}, {"label": "Orleans Parish, LA", "value": "22071"}, {
  "label": "Ouachita Parish, LA",
  "value": "22073"
}, {"label": "Plaquemines Parish, LA", "value": "22075"}, {
  "label": "Pointe Coupee Parish, LA",
  "value": "22077"
}, {"label": "Rapides Parish, LA", "value": "22079"}, {
  "label": "Red River Parish, LA",
  "value": "22081"
}, {"label": "Richland Parish, LA", "value": "22083"}, {
  "label": "Sabine Parish, LA",
  "value": "22085"
}, {"label": "St. Bernard Parish, LA", "value": "22087"}, {
  "label": "St. Charles Parish, LA",
  "value": "22089"
}, {"label": "St. Helena Parish, LA", "value": "22091"}, {
  "label": "St. James Parish, LA",
  "value": "22093"
}, {"label": "St. John the Baptist Parish, LA", "value": "22095"}, {
  "label": "St. Landry Parish, LA",
  "value": "22097"
}, {"label": "St. Martin Parish, LA", "value": "22099"}, {
  "label": "St. Mary Parish, LA",
  "value": "22101"
}, {"label": "St. Tammany Parish, LA", "value": "22103"}, {
  "label": "Tangipahoa Parish, LA",
  "value": "22105"
}, {"label": "Tensas Parish, LA", "value": "22107"}, {
  "label": "Terrebonne Parish, LA",
  "value": "22109"
}, {"label": "Union Parish, LA", "value": "22111"}, {
  "label": "Vermilion Parish, LA",
  "value": "22113"
}, {"label": "Vernon Parish, LA", "value": "22115"}, {
  "label": "Washington Parish, LA",
  "value": "22117"
}, {"label": "Webster Parish, LA", "value": "22119"}, {
  "label": "West Baton Rouge Parish, LA",
  "value": "22121"
}, {"label": "West Carroll Parish, LA", "value": "22123"}, {
  "label": "West Feliciana Parish, LA",
  "value": "22125"
}, {"label": "Winn Parish, LA", "value": "22127"}, {
  "label": "Androscoggin County, ME",
  "value": "23001"
}, {"label": "Aroostook County, ME", "value": "23003"}, {
  "label": "Cumberland County, ME",
  "value": "23005"
}, {"label": "Franklin County, ME", "value": "23007"}, {
  "label": "Hancock County, ME",
  "value": "23009"
}, {"label": "Kennebec County, ME", "value": "23011"}, {
  "label": "Knox County, ME",
  "value": "23013"
}, {"label": "Lincoln County, ME", "value": "23015"}, {
  "label": "Oxford County, ME",
  "value": "23017"
}, {"label": "Penobscot County, ME", "value": "23019"}, {
  "label": "Piscataquis County, ME",
  "value": "23021"
}, {"label": "Sagadahoc County, ME", "value": "23023"}, {
  "label": "Somerset County, ME",
  "value": "23025"
}, {"label": "Waldo County, ME", "value": "23027"}, {
  "label": "Washington County, ME",
  "value": "23029"
}, {"label": "York County, ME", "value": "23031"}, {
  "label": "Allegany County, MD",
  "value": "24001"
}, {"label": "Anne Arundel County, MD", "value": "24003"}, {
  "label": "Baltimore County, MD",
  "value": "24005"
}, {"label": "Calvert County, MD", "value": "24009"}, {
  "label": "Caroline County, MD",
  "value": "24011"
}, {"label": "Carroll County, MD", "value": "24013"}, {
  "label": "Cecil County, MD",
  "value": "24015"
}, {"label": "Charles County, MD", "value": "24017"}, {
  "label": "Dorchester County, MD",
  "value": "24019"
}, {"label": "Frederick County, MD", "value": "24021"}, {
  "label": "Garrett County, MD",
  "value": "24023"
}, {"label": "Harford County, MD", "value": "24025"}, {
  "label": "Howard County, MD",
  "value": "24027"
}, {"label": "Kent County, MD", "value": "24029"}, {
  "label": "Montgomery County, MD",
  "value": "24031"
}, {"label": "Prince George's County, MD", "value": "24033"}, {
  "label": "Queen Anne's County, MD",
  "value": "24035"
}, {"label": "St. Mary's County, MD", "value": "24037"}, {
  "label": "Somerset County, MD",
  "value": "24039"
}, {"label": "Talbot County, MD", "value": "24041"}, {
  "label": "Washington County, MD",
  "value": "24043"
}, {"label": "Wicomico County, MD", "value": "24045"}, {
  "label": "Worcester County, MD",
  "value": "24047"
}, {"label": "Baltimore city, MD", "value": "24510"}, {
  "label": "Barnstable County, MA",
  "value": "25001"
}, {"label": "Berkshire County, MA", "value": "25003"}, {
  "label": "Bristol County, MA",
  "value": "25005"
}, {"label": "Dukes County, MA", "value": "25007"}, {
  "label": "Essex County, MA",
  "value": "25009"
}, {"label": "Franklin County, MA", "value": "25011"}, {
  "label": "Hampden County, MA",
  "value": "25013"
}, {"label": "Hampshire County, MA", "value": "25015"}, {
  "label": "Middlesex County, MA",
  "value": "25017"
}, {"label": "Nantucket County, MA", "value": "25019"}, {
  "label": "Norfolk County, MA",
  "value": "25021"
}, {"label": "Plymouth County, MA", "value": "25023"}, {
  "label": "Suffolk County, MA",
  "value": "25025"
}, {"label": "Worcester County, MA", "value": "25027"}, {
  "label": "Alcona County, MI",
  "value": "26001"
}, {"label": "Alger County, MI", "value": "26003"}, {
  "label": "Allegan County, MI",
  "value": "26005"
}, {"label": "Alpena County, MI", "value": "26007"}, {
  "label": "Antrim County, MI",
  "value": "26009"
}, {"label": "Arenac County, MI", "value": "26011"}, {
  "label": "Baraga County, MI",
  "value": "26013"
}, {"label": "Barry County, MI", "value": "26015"}, {
  "label": "Bay County, MI",
  "value": "26017"
}, {"label": "Benzie County, MI", "value": "26019"}, {
  "label": "Berrien County, MI",
  "value": "26021"
}, {"label": "Branch County, MI", "value": "26023"}, {
  "label": "Calhoun County, MI",
  "value": "26025"
}, {"label": "Cass County, MI", "value": "26027"}, {
  "label": "Charlevoix County, MI",
  "value": "26029"
}, {"label": "Cheboygan County, MI", "value": "26031"}, {
  "label": "Chippewa County, MI",
  "value": "26033"
}, {"label": "Clare County, MI", "value": "26035"}, {
  "label": "Clinton County, MI",
  "value": "26037"
}, {"label": "Crawford County, MI", "value": "26039"}, {
  "label": "Delta County, MI",
  "value": "26041"
}, {"label": "Dickinson County, MI", "value": "26043"}, {
  "label": "Eaton County, MI",
  "value": "26045"
}, {"label": "Emmet County, MI", "value": "26047"}, {
  "label": "Genesee County, MI",
  "value": "26049"
}, {"label": "Gladwin County, MI", "value": "26051"}, {
  "label": "Gogebic County, MI",
  "value": "26053"
}, {"label": "Grand Traverse County, MI", "value": "26055"}, {
  "label": "Gratiot County, MI",
  "value": "26057"
}, {"label": "Hillsdale County, MI", "value": "26059"}, {
  "label": "Houghton County, MI",
  "value": "26061"
}, {"label": "Huron County, MI", "value": "26063"}, {
  "label": "Ingham County, MI",
  "value": "26065"
}, {"label": "Ionia County, MI", "value": "26067"}, {
  "label": "Iosco County, MI",
  "value": "26069"
}, {"label": "Iron County, MI", "value": "26071"}, {
  "label": "Isabella County, MI",
  "value": "26073"
}, {"label": "Jackson County, MI", "value": "26075"}, {
  "label": "Kalamazoo County, MI",
  "value": "26077"
}, {"label": "Kalkaska County, MI", "value": "26079"}, {
  "label": "Kent County, MI",
  "value": "26081"
}, {"label": "Keweenaw County, MI", "value": "26083"}, {
  "label": "Lake County, MI",
  "value": "26085"
}, {"label": "Lapeer County, MI", "value": "26087"}, {
  "label": "Leelanau County, MI",
  "value": "26089"
}, {"label": "Lenawee County, MI", "value": "26091"}, {
  "label": "Livingston County, MI",
  "value": "26093"
}, {"label": "Luce County, MI", "value": "26095"}, {
  "label": "Mackinac County, MI",
  "value": "26097"
}, {"label": "Macomb County, MI", "value": "26099"}, {
  "label": "Manistee County, MI",
  "value": "26101"
}, {"label": "Marquette County, MI", "value": "26103"}, {
  "label": "Mason County, MI",
  "value": "26105"
}, {"label": "Mecosta County, MI", "value": "26107"}, {
  "label": "Menominee County, MI",
  "value": "26109"
}, {"label": "Midland County, MI", "value": "26111"}, {
  "label": "Missaukee County, MI",
  "value": "26113"
}, {"label": "Monroe County, MI", "value": "26115"}, {
  "label": "Montcalm County, MI",
  "value": "26117"
}, {"label": "Montmorency County, MI", "value": "26119"}, {
  "label": "Muskegon County, MI",
  "value": "26121"
}, {"label": "Newaygo County, MI", "value": "26123"}, {
  "label": "Oakland County, MI",
  "value": "26125"
}, {"label": "Oceana County, MI", "value": "26127"}, {
  "label": "Ogemaw County, MI",
  "value": "26129"
}, {"label": "Ontonagon County, MI", "value": "26131"}, {
  "label": "Osceola County, MI",
  "value": "26133"
}, {"label": "Oscoda County, MI", "value": "26135"}, {
  "label": "Otsego County, MI",
  "value": "26137"
}, {"label": "Ottawa County, MI", "value": "26139"}, {
  "label": "Presque Isle County, MI",
  "value": "26141"
}, {"label": "Roscommon County, MI", "value": "26143"}, {
  "label": "Saginaw County, MI",
  "value": "26145"
}, {"label": "St. Clair County, MI", "value": "26147"}, {
  "label": "St. Joseph County, MI",
  "value": "26149"
}, {"label": "Sanilac County, MI", "value": "26151"}, {
  "label": "Schoolcraft County, MI",
  "value": "26153"
}, {"label": "Shiawassee County, MI", "value": "26155"}, {
  "label": "Tuscola County, MI",
  "value": "26157"
}, {"label": "Van Buren County, MI", "value": "26159"}, {
  "label": "Washtenaw County, MI",
  "value": "26161"
}, {"label": "Wayne County, MI", "value": "26163"}, {
  "label": "Wexford County, MI",
  "value": "26165"
}, {"label": "Aitkin County, MN", "value": "27001"}, {
  "label": "Anoka County, MN",
  "value": "27003"
}, {"label": "Becker County, MN", "value": "27005"}, {
  "label": "Beltrami County, MN",
  "value": "27007"
}, {"label": "Benton County, MN", "value": "27009"}, {
  "label": "Big Stone County, MN",
  "value": "27011"
}, {"label": "Blue Earth County, MN", "value": "27013"}, {
  "label": "Brown County, MN",
  "value": "27015"
}, {"label": "Carlton County, MN", "value": "27017"}, {
  "label": "Carver County, MN",
  "value": "27019"
}, {"label": "Cass County, MN", "value": "27021"}, {
  "label": "Chippewa County, MN",
  "value": "27023"
}, {"label": "Chisago County, MN", "value": "27025"}, {
  "label": "Clay County, MN",
  "value": "27027"
}, {"label": "Clearwater County, MN", "value": "27029"}, {
  "label": "Cook County, MN",
  "value": "27031"
}, {"label": "Cottonwood County, MN", "value": "27033"}, {
  "label": "Crow Wing County, MN",
  "value": "27035"
}, {"label": "Dakota County, MN", "value": "27037"}, {
  "label": "Dodge County, MN",
  "value": "27039"
}, {"label": "Douglas County, MN", "value": "27041"}, {
  "label": "Faribault County, MN",
  "value": "27043"
}, {"label": "Fillmore County, MN", "value": "27045"}, {
  "label": "Freeborn County, MN",
  "value": "27047"
}, {"label": "Goodhue County, MN", "value": "27049"}, {
  "label": "Grant County, MN",
  "value": "27051"
}, {"label": "Hennepin County, MN", "value": "27053"}, {
  "label": "Houston County, MN",
  "value": "27055"
}, {"label": "Hubbard County, MN", "value": "27057"}, {
  "label": "Isanti County, MN",
  "value": "27059"
}, {"label": "Itasca County, MN", "value": "27061"}, {
  "label": "Jackson County, MN",
  "value": "27063"
}, {"label": "Kanabec County, MN", "value": "27065"}, {
  "label": "Kandiyohi County, MN",
  "value": "27067"
}, {"label": "Kittson County, MN", "value": "27069"}, {
  "label": "Koochiching County, MN",
  "value": "27071"
}, {"label": "Lac qui Parle County, MN", "value": "27073"}, {
  "label": "Lake County, MN",
  "value": "27075"
}, {"label": "Lake of the Woods County, MN", "value": "27077"}, {
  "label": "Le Sueur County, MN",
  "value": "27079"
}, {"label": "Lincoln County, MN", "value": "27081"}, {
  "label": "Lyon County, MN",
  "value": "27083"
}, {"label": "McLeod County, MN", "value": "27085"}, {
  "label": "Mahnomen County, MN",
  "value": "27087"
}, {"label": "Marshall County, MN", "value": "27089"}, {
  "label": "Martin County, MN",
  "value": "27091"
}, {"label": "Meeker County, MN", "value": "27093"}, {
  "label": "Mille Lacs County, MN",
  "value": "27095"
}, {"label": "Morrison County, MN", "value": "27097"}, {
  "label": "Mower County, MN",
  "value": "27099"
}, {"label": "Murray County, MN", "value": "27101"}, {
  "label": "Nicollet County, MN",
  "value": "27103"
}, {"label": "Nobles County, MN", "value": "27105"}, {
  "label": "Norman County, MN",
  "value": "27107"
}, {"label": "Olmsted County, MN", "value": "27109"}, {
  "label": "Otter Tail County, MN",
  "value": "27111"
}, {"label": "Pennington County, MN", "value": "27113"}, {
  "label": "Pine County, MN",
  "value": "27115"
}, {"label": "Pipestone County, MN", "value": "27117"}, {
  "label": "Polk County, MN",
  "value": "27119"
}, {"label": "Pope County, MN", "value": "27121"}, {
  "label": "Ramsey County, MN",
  "value": "27123"
}, {"label": "Red Lake County, MN", "value": "27125"}, {
  "label": "Redwood County, MN",
  "value": "27127"
}, {"label": "Renville County, MN", "value": "27129"}, {
  "label": "Rice County, MN",
  "value": "27131"
}, {"label": "Rock County, MN", "value": "27133"}, {
  "label": "Roseau County, MN",
  "value": "27135"
}, {"label": "St. Louis County, MN", "value": "27137"}, {
  "label": "Scott County, MN",
  "value": "27139"
}, {"label": "Sherburne County, MN", "value": "27141"}, {
  "label": "Sibley County, MN",
  "value": "27143"
}, {"label": "Stearns County, MN", "value": "27145"}, {
  "label": "Steele County, MN",
  "value": "27147"
}, {"label": "Stevens County, MN", "value": "27149"}, {
  "label": "Swift County, MN",
  "value": "27151"
}, {"label": "Todd County, MN", "value": "27153"}, {
  "label": "Traverse County, MN",
  "value": "27155"
}, {"label": "Wabasha County, MN", "value": "27157"}, {
  "label": "Wadena County, MN",
  "value": "27159"
}, {"label": "Waseca County, MN", "value": "27161"}, {
  "label": "Washington County, MN",
  "value": "27163"
}, {"label": "Watonwan County, MN", "value": "27165"}, {
  "label": "Wilkin County, MN",
  "value": "27167"
}, {"label": "Winona County, MN", "value": "27169"}, {
  "label": "Wright County, MN",
  "value": "27171"
}, {"label": "Yellow Medicine County, MN", "value": "27173"}, {
  "label": "Adams County, MS",
  "value": "28001"
}, {"label": "Alcorn County, MS", "value": "28003"}, {
  "label": "Amite County, MS",
  "value": "28005"
}, {"label": "Attala County, MS", "value": "28007"}, {
  "label": "Benton County, MS",
  "value": "28009"
}, {"label": "Bolivar County, MS", "value": "28011"}, {
  "label": "Calhoun County, MS",
  "value": "28013"
}, {"label": "Carroll County, MS", "value": "28015"}, {
  "label": "Chickasaw County, MS",
  "value": "28017"
}, {"label": "Choctaw County, MS", "value": "28019"}, {
  "label": "Claiborne County, MS",
  "value": "28021"
}, {"label": "Clarke County, MS", "value": "28023"}, {
  "label": "Clay County, MS",
  "value": "28025"
}, {"label": "Coahoma County, MS", "value": "28027"}, {
  "label": "Copiah County, MS",
  "value": "28029"
}, {"label": "Covington County, MS", "value": "28031"}, {
  "label": "DeSoto County, MS",
  "value": "28033"
}, {"label": "Forrest County, MS", "value": "28035"}, {
  "label": "Franklin County, MS",
  "value": "28037"
}, {"label": "George County, MS", "value": "28039"}, {
  "label": "Greene County, MS",
  "value": "28041"
}, {"label": "Grenada County, MS", "value": "28043"}, {
  "label": "Hancock County, MS",
  "value": "28045"
}, {"label": "Harrison County, MS", "value": "28047"}, {
  "label": "Hinds County, MS",
  "value": "28049"
}, {"label": "Holmes County, MS", "value": "28051"}, {
  "label": "Humphreys County, MS",
  "value": "28053"
}, {"label": "Issaquena County, MS", "value": "28055"}, {
  "label": "Itawamba County, MS",
  "value": "28057"
}, {"label": "Jackson County, MS", "value": "28059"}, {
  "label": "Jasper County, MS",
  "value": "28061"
}, {"label": "Jefferson County, MS", "value": "28063"}, {
  "label": "Jefferson Davis County, MS",
  "value": "28065"
}, {"label": "Jones County, MS", "value": "28067"}, {
  "label": "Kemper County, MS",
  "value": "28069"
}, {"label": "Lafayette County, MS", "value": "28071"}, {
  "label": "Lamar County, MS",
  "value": "28073"
}, {"label": "Lauderdale County, MS", "value": "28075"}, {
  "label": "Lawrence County, MS",
  "value": "28077"
}, {"label": "Leake County, MS", "value": "28079"}, {
  "label": "Lee County, MS",
  "value": "28081"
}, {"label": "Leflore County, MS", "value": "28083"}, {
  "label": "Lincoln County, MS",
  "value": "28085"
}, {"label": "Lowndes County, MS", "value": "28087"}, {
  "label": "Madison County, MS",
  "value": "28089"
}, {"label": "Marion County, MS", "value": "28091"}, {
  "label": "Marshall County, MS",
  "value": "28093"
}, {"label": "Monroe County, MS", "value": "28095"}, {
  "label": "Montgomery County, MS",
  "value": "28097"
}, {"label": "Neshoba County, MS", "value": "28099"}, {
  "label": "Newton County, MS",
  "value": "28101"
}, {"label": "Noxubee County, MS", "value": "28103"}, {
  "label": "Oktibbeha County, MS",
  "value": "28105"
}, {"label": "Panola County, MS", "value": "28107"}, {
  "label": "Pearl River County, MS",
  "value": "28109"
}, {"label": "Perry County, MS", "value": "28111"}, {
  "label": "Pike County, MS",
  "value": "28113"
}, {"label": "Pontotoc County, MS", "value": "28115"}, {
  "label": "Prentiss County, MS",
  "value": "28117"
}, {"label": "Quitman County, MS", "value": "28119"}, {
  "label": "Rankin County, MS",
  "value": "28121"
}, {"label": "Scott County, MS", "value": "28123"}, {
  "label": "Sharkey County, MS",
  "value": "28125"
}, {"label": "Simpson County, MS", "value": "28127"}, {
  "label": "Smith County, MS",
  "value": "28129"
}, {"label": "Stone County, MS", "value": "28131"}, {
  "label": "Sunflower County, MS",
  "value": "28133"
}, {"label": "Tallahatchie County, MS", "value": "28135"}, {
  "label": "Tate County, MS",
  "value": "28137"
}, {"label": "Tippah County, MS", "value": "28139"}, {
  "label": "Tishomingo County, MS",
  "value": "28141"
}, {"label": "Tunica County, MS", "value": "28143"}, {
  "label": "Union County, MS",
  "value": "28145"
}, {"label": "Walthall County, MS", "value": "28147"}, {
  "label": "Warren County, MS",
  "value": "28149"
}, {"label": "Washington County, MS", "value": "28151"}, {
  "label": "Wayne County, MS",
  "value": "28153"
}, {"label": "Webster County, MS", "value": "28155"}, {
  "label": "Wilkinson County, MS",
  "value": "28157"
}, {"label": "Winston County, MS", "value": "28159"}, {
  "label": "Yalobusha County, MS",
  "value": "28161"
}, {"label": "Yazoo County, MS", "value": "28163"}, {
  "label": "Adair County, MO",
  "value": "29001"
}, {"label": "Andrew County, MO", "value": "29003"}, {
  "label": "Atchison County, MO",
  "value": "29005"
}, {"label": "Audrain County, MO", "value": "29007"}, {
  "label": "Barry County, MO",
  "value": "29009"
}, {"label": "Barton County, MO", "value": "29011"}, {
  "label": "Bates County, MO",
  "value": "29013"
}, {"label": "Benton County, MO", "value": "29015"}, {
  "label": "Bollinger County, MO",
  "value": "29017"
}, {"label": "Boone County, MO", "value": "29019"}, {
  "label": "Buchanan County, MO",
  "value": "29021"
}, {"label": "Butler County, MO", "value": "29023"}, {
  "label": "Caldwell County, MO",
  "value": "29025"
}, {"label": "Callaway County, MO", "value": "29027"}, {
  "label": "Camden County, MO",
  "value": "29029"
}, {"label": "Cape Girardeau County, MO", "value": "29031"}, {
  "label": "Carroll County, MO",
  "value": "29033"
}, {"label": "Carter County, MO", "value": "29035"}, {
  "label": "Cass County, MO",
  "value": "29037"
}, {"label": "Cedar County, MO", "value": "29039"}, {
  "label": "Chariton County, MO",
  "value": "29041"
}, {"label": "Christian County, MO", "value": "29043"}, {
  "label": "Clark County, MO",
  "value": "29045"
}, {"label": "Clay County, MO", "value": "29047"}, {
  "label": "Clinton County, MO",
  "value": "29049"
}, {"label": "Cole County, MO", "value": "29051"}, {
  "label": "Cooper County, MO",
  "value": "29053"
}, {"label": "Crawford County, MO", "value": "29055"}, {
  "label": "Dade County, MO",
  "value": "29057"
}, {"label": "Dallas County, MO", "value": "29059"}, {
  "label": "Daviess County, MO",
  "value": "29061"
}, {"label": "DeKalb County, MO", "value": "29063"}, {
  "label": "Dent County, MO",
  "value": "29065"
}, {"label": "Douglas County, MO", "value": "29067"}, {
  "label": "Dunklin County, MO",
  "value": "29069"
}, {"label": "Franklin County, MO", "value": "29071"}, {
  "label": "Gasconade County, MO",
  "value": "29073"
}, {"label": "Gentry County, MO", "value": "29075"}, {
  "label": "Greene County, MO",
  "value": "29077"
}, {"label": "Grundy County, MO", "value": "29079"}, {
  "label": "Harrison County, MO",
  "value": "29081"
}, {"label": "Henry County, MO", "value": "29083"}, {
  "label": "Hickory County, MO",
  "value": "29085"
}, {"label": "Holt County, MO", "value": "29087"}, {
  "label": "Howard County, MO",
  "value": "29089"
}, {"label": "Howell County, MO", "value": "29091"}, {
  "label": "Iron County, MO",
  "value": "29093"
}, {"label": "Jackson County, MO", "value": "29095"}, {
  "label": "Jasper County, MO",
  "value": "29097"
}, {"label": "Jefferson County, MO", "value": "29099"}, {
  "label": "Johnson County, MO",
  "value": "29101"
}, {"label": "Knox County, MO", "value": "29103"}, {
  "label": "Laclede County, MO",
  "value": "29105"
}, {"label": "Lafayette County, MO", "value": "29107"}, {
  "label": "Lawrence County, MO",
  "value": "29109"
}, {"label": "Lewis County, MO", "value": "29111"}, {
  "label": "Lincoln County, MO",
  "value": "29113"
}, {"label": "Linn County, MO", "value": "29115"}, {
  "label": "Livingston County, MO",
  "value": "29117"
}, {"label": "McDonald County, MO", "value": "29119"}, {
  "label": "Macon County, MO",
  "value": "29121"
}, {"label": "Madison County, MO", "value": "29123"}, {
  "label": "Maries County, MO",
  "value": "29125"
}, {"label": "Marion County, MO", "value": "29127"}, {
  "label": "Mercer County, MO",
  "value": "29129"
}, {"label": "Miller County, MO", "value": "29131"}, {
  "label": "Mississippi County, MO",
  "value": "29133"
}, {"label": "Moniteau County, MO", "value": "29135"}, {
  "label": "Monroe County, MO",
  "value": "29137"
}, {"label": "Montgomery County, MO", "value": "29139"}, {
  "label": "Morgan County, MO",
  "value": "29141"
}, {"label": "New Madrid County, MO", "value": "29143"}, {
  "label": "Newton County, MO",
  "value": "29145"
}, {"label": "Nodaway County, MO", "value": "29147"}, {
  "label": "Oregon County, MO",
  "value": "29149"
}, {"label": "Osage County, MO", "value": "29151"}, {
  "label": "Ozark County, MO",
  "value": "29153"
}, {"label": "Pemiscot County, MO", "value": "29155"}, {
  "label": "Perry County, MO",
  "value": "29157"
}, {"label": "Pettis County, MO", "value": "29159"}, {
  "label": "Phelps County, MO",
  "value": "29161"
}, {"label": "Pike County, MO", "value": "29163"}, {
  "label": "Platte County, MO",
  "value": "29165"
}, {"label": "Polk County, MO", "value": "29167"}, {
  "label": "Pulaski County, MO",
  "value": "29169"
}, {"label": "Putnam County, MO", "value": "29171"}, {
  "label": "Ralls County, MO",
  "value": "29173"
}, {"label": "Randolph County, MO", "value": "29175"}, {
  "label": "Ray County, MO",
  "value": "29177"
}, {"label": "Reynolds County, MO", "value": "29179"}, {
  "label": "Ripley County, MO",
  "value": "29181"
}, {"label": "St. Charles County, MO", "value": "29183"}, {
  "label": "St. Clair County, MO",
  "value": "29185"
}, {"label": "Ste. Genevieve County, MO", "value": "29186"}, {
  "label": "St. Francois County, MO",
  "value": "29187"
}, {"label": "St. Louis County, MO", "value": "29189"}, {
  "label": "Saline County, MO",
  "value": "29195"
}, {"label": "Schuyler County, MO", "value": "29197"}, {
  "label": "Scotland County, MO",
  "value": "29199"
}, {"label": "Scott County, MO", "value": "29201"}, {
  "label": "Shannon County, MO",
  "value": "29203"
}, {"label": "Shelby County, MO", "value": "29205"}, {
  "label": "Stoddard County, MO",
  "value": "29207"
}, {"label": "Stone County, MO", "value": "29209"}, {
  "label": "Sullivan County, MO",
  "value": "29211"
}, {"label": "Taney County, MO", "value": "29213"}, {
  "label": "Texas County, MO",
  "value": "29215"
}, {"label": "Vernon County, MO", "value": "29217"}, {
  "label": "Warren County, MO",
  "value": "29219"
}, {"label": "Washington County, MO", "value": "29221"}, {
  "label": "Wayne County, MO",
  "value": "29223"
}, {"label": "Webster County, MO", "value": "29225"}, {
  "label": "Worth County, MO",
  "value": "29227"
}, {"label": "Wright County, MO", "value": "29229"}, {
  "label": "St. Louis city, MO",
  "value": "29510"
}, {"label": "Beaverhead County, MT", "value": "30001"}, {
  "label": "Big Horn County, MT",
  "value": "30003"
}, {"label": "Blaine County, MT", "value": "30005"}, {
  "label": "Broadwater County, MT",
  "value": "30007"
}, {"label": "Carbon County, MT", "value": "30009"}, {
  "label": "Carter County, MT",
  "value": "30011"
}, {"label": "Cascade County, MT", "value": "30013"}, {
  "label": "Chouteau County, MT",
  "value": "30015"
}, {"label": "Custer County, MT", "value": "30017"}, {
  "label": "Daniels County, MT",
  "value": "30019"
}, {"label": "Dawson County, MT", "value": "30021"}, {
  "label": "Deer Lodge County, MT",
  "value": "30023"
}, {"label": "Fallon County, MT", "value": "30025"}, {
  "label": "Fergus County, MT",
  "value": "30027"
}, {"label": "Flathead County, MT", "value": "30029"}, {
  "label": "Gallatin County, MT",
  "value": "30031"
}, {"label": "Garfield County, MT", "value": "30033"}, {
  "label": "Glacier County, MT",
  "value": "30035"
}, {"label": "Golden Valley County, MT", "value": "30037"}, {
  "label": "Granite County, MT",
  "value": "30039"
}, {"label": "Hill County, MT", "value": "30041"}, {
  "label": "Jefferson County, MT",
  "value": "30043"
}, {"label": "Judith Basin County, MT", "value": "30045"}, {
  "label": "Lake County, MT",
  "value": "30047"
}, {"label": "Lewis and Clark County, MT", "value": "30049"}, {
  "label": "Liberty County, MT",
  "value": "30051"
}, {"label": "Lincoln County, MT", "value": "30053"}, {
  "label": "McCone County, MT",
  "value": "30055"
}, {"label": "Madison County, MT", "value": "30057"}, {
  "label": "Meagher County, MT",
  "value": "30059"
}, {"label": "Mineral County, MT", "value": "30061"}, {
  "label": "Missoula County, MT",
  "value": "30063"
}, {"label": "Musselshell County, MT", "value": "30065"}, {
  "label": "Park County, MT",
  "value": "30067"
}, {"label": "Petroleum County, MT", "value": "30069"}, {
  "label": "Phillips County, MT",
  "value": "30071"
}, {"label": "Pondera County, MT", "value": "30073"}, {
  "label": "Powder River County, MT",
  "value": "30075"
}, {"label": "Powell County, MT", "value": "30077"}, {
  "label": "Prairie County, MT",
  "value": "30079"
}, {"label": "Ravalli County, MT", "value": "30081"}, {
  "label": "Richland County, MT",
  "value": "30083"
}, {"label": "Roosevelt County, MT", "value": "30085"}, {
  "label": "Rosebud County, MT",
  "value": "30087"
}, {"label": "Sanders County, MT", "value": "30089"}, {
  "label": "Sheridan County, MT",
  "value": "30091"
}, {"label": "Silver Bow County, MT", "value": "30093"}, {
  "label": "Stillwater County, MT",
  "value": "30095"
}, {"label": "Sweet Grass County, MT", "value": "30097"}, {
  "label": "Teton County, MT",
  "value": "30099"
}, {"label": "Toole County, MT", "value": "30101"}, {
  "label": "Treasure County, MT",
  "value": "30103"
}, {"label": "Valley County, MT", "value": "30105"}, {
  "label": "Wheatland County, MT",
  "value": "30107"
}, {"label": "Wibaux County, MT", "value": "30109"}, {
  "label": "Yellowstone County, MT",
  "value": "30111"
}, {"label": "Adams County, NE", "value": "31001"}, {
  "label": "Antelope County, NE",
  "value": "31003"
}, {"label": "Arthur County, NE", "value": "31005"}, {
  "label": "Banner County, NE",
  "value": "31007"
}, {"label": "Blaine County, NE", "value": "31009"}, {
  "label": "Boone County, NE",
  "value": "31011"
}, {"label": "Box Butte County, NE", "value": "31013"}, {
  "label": "Boyd County, NE",
  "value": "31015"
}, {"label": "Brown County, NE", "value": "31017"}, {
  "label": "Buffalo County, NE",
  "value": "31019"
}, {"label": "Burt County, NE", "value": "31021"}, {
  "label": "Butler County, NE",
  "value": "31023"
}, {"label": "Cass County, NE", "value": "31025"}, {
  "label": "Cedar County, NE",
  "value": "31027"
}, {"label": "Chase County, NE", "value": "31029"}, {
  "label": "Cherry County, NE",
  "value": "31031"
}, {"label": "Cheyenne County, NE", "value": "31033"}, {
  "label": "Clay County, NE",
  "value": "31035"
}, {"label": "Colfax County, NE", "value": "31037"}, {
  "label": "Cuming County, NE",
  "value": "31039"
}, {"label": "Custer County, NE", "value": "31041"}, {
  "label": "Dakota County, NE",
  "value": "31043"
}, {"label": "Dawes County, NE", "value": "31045"}, {
  "label": "Dawson County, NE",
  "value": "31047"
}, {"label": "Deuel County, NE", "value": "31049"}, {
  "label": "Dixon County, NE",
  "value": "31051"
}, {"label": "Dodge County, NE", "value": "31053"}, {
  "label": "Douglas County, NE",
  "value": "31055"
}, {"label": "Dundy County, NE", "value": "31057"}, {
  "label": "Fillmore County, NE",
  "value": "31059"
}, {"label": "Franklin County, NE", "value": "31061"}, {
  "label": "Frontier County, NE",
  "value": "31063"
}, {"label": "Furnas County, NE", "value": "31065"}, {
  "label": "Gage County, NE",
  "value": "31067"
}, {"label": "Garden County, NE", "value": "31069"}, {
  "label": "Garfield County, NE",
  "value": "31071"
}, {"label": "Gosper County, NE", "value": "31073"}, {
  "label": "Grant County, NE",
  "value": "31075"
}, {"label": "Greeley County, NE", "value": "31077"}, {
  "label": "Hall County, NE",
  "value": "31079"
}, {"label": "Hamilton County, NE", "value": "31081"}, {
  "label": "Harlan County, NE",
  "value": "31083"
}, {"label": "Hayes County, NE", "value": "31085"}, {
  "label": "Hitchcock County, NE",
  "value": "31087"
}, {"label": "Holt County, NE", "value": "31089"}, {
  "label": "Hooker County, NE",
  "value": "31091"
}, {"label": "Howard County, NE", "value": "31093"}, {
  "label": "Jefferson County, NE",
  "value": "31095"
}, {"label": "Johnson County, NE", "value": "31097"}, {
  "label": "Kearney County, NE",
  "value": "31099"
}, {"label": "Keith County, NE", "value": "31101"}, {
  "label": "Keya Paha County, NE",
  "value": "31103"
}, {"label": "Kimball County, NE", "value": "31105"}, {
  "label": "Knox County, NE",
  "value": "31107"
}, {"label": "Lancaster County, NE", "value": "31109"}, {
  "label": "Lincoln County, NE",
  "value": "31111"
}, {"label": "Logan County, NE", "value": "31113"}, {
  "label": "Loup County, NE",
  "value": "31115"
}, {"label": "McPherson County, NE", "value": "31117"}, {
  "label": "Madison County, NE",
  "value": "31119"
}, {"label": "Merrick County, NE", "value": "31121"}, {
  "label": "Morrill County, NE",
  "value": "31123"
}, {"label": "Nance County, NE", "value": "31125"}, {
  "label": "Nemaha County, NE",
  "value": "31127"
}, {"label": "Nuckolls County, NE", "value": "31129"}, {
  "label": "Otoe County, NE",
  "value": "31131"
}, {"label": "Pawnee County, NE", "value": "31133"}, {
  "label": "Perkins County, NE",
  "value": "31135"
}, {"label": "Phelps County, NE", "value": "31137"}, {
  "label": "Pierce County, NE",
  "value": "31139"
}, {"label": "Platte County, NE", "value": "31141"}, {
  "label": "Polk County, NE",
  "value": "31143"
}, {"label": "Red Willow County, NE", "value": "31145"}, {
  "label": "Richardson County, NE",
  "value": "31147"
}, {"label": "Rock County, NE", "value": "31149"}, {
  "label": "Saline County, NE",
  "value": "31151"
}, {"label": "Sarpy County, NE", "value": "31153"}, {
  "label": "Saunders County, NE",
  "value": "31155"
}, {"label": "Scotts Bluff County, NE", "value": "31157"}, {
  "label": "Seward County, NE",
  "value": "31159"
}, {"label": "Sheridan County, NE", "value": "31161"}, {
  "label": "Sherman County, NE",
  "value": "31163"
}, {"label": "Sioux County, NE", "value": "31165"}, {
  "label": "Stanton County, NE",
  "value": "31167"
}, {"label": "Thayer County, NE", "value": "31169"}, {
  "label": "Thomas County, NE",
  "value": "31171"
}, {"label": "Thurston County, NE", "value": "31173"}, {
  "label": "Valley County, NE",
  "value": "31175"
}, {"label": "Washington County, NE", "value": "31177"}, {
  "label": "Wayne County, NE",
  "value": "31179"
}, {"label": "Webster County, NE", "value": "31181"}, {
  "label": "Wheeler County, NE",
  "value": "31183"
}, {"label": "York County, NE", "value": "31185"}, {
  "label": "Churchill County, NV",
  "value": "32001"
}, {"label": "Clark County, NV", "value": "32003"}, {
  "label": "Douglas County, NV",
  "value": "32005"
}, {"label": "Elko County, NV", "value": "32007"}, {
  "label": "Esmeralda County, NV",
  "value": "32009"
}, {"label": "Eureka County, NV", "value": "32011"}, {
  "label": "Humboldt County, NV",
  "value": "32013"
}, {"label": "Lander County, NV", "value": "32015"}, {
  "label": "Lincoln County, NV",
  "value": "32017"
}, {"label": "Lyon County, NV", "value": "32019"}, {
  "label": "Mineral County, NV",
  "value": "32021"
}, {"label": "Nye County, NV", "value": "32023"}, {
  "label": "Pershing County, NV",
  "value": "32027"
}, {"label": "Storey County, NV", "value": "32029"}, {
  "label": "Washoe County, NV",
  "value": "32031"
}, {"label": "White Pine County, NV", "value": "32033"}, {
  "label": "Carson City, NV",
  "value": "32510"
}, {"label": "Belknap County, NH", "value": "33001"}, {
  "label": "Carroll County, NH",
  "value": "33003"
}, {"label": "Cheshire County, NH", "value": "33005"}, {
  "label": "Coos County, NH",
  "value": "33007"
}, {"label": "Grafton County, NH", "value": "33009"}, {
  "label": "Hillsborough County, NH",
  "value": "33011"
}, {"label": "Merrimack County, NH", "value": "33013"}, {
  "label": "Rockingham County, NH",
  "value": "33015"
}, {"label": "Strafford County, NH", "value": "33017"}, {
  "label": "Sullivan County, NH",
  "value": "33019"
}, {"label": "Atlantic County, NJ", "value": "34001"}, {
  "label": "Bergen County, NJ",
  "value": "34003"
}, {"label": "Burlington County, NJ", "value": "34005"}, {
  "label": "Camden County, NJ",
  "value": "34007"
}, {"label": "Cape May County, NJ", "value": "34009"}, {
  "label": "Cumberland County, NJ",
  "value": "34011"
}, {"label": "Essex County, NJ", "value": "34013"}, {
  "label": "Gloucester County, NJ",
  "value": "34015"
}, {"label": "Hudson County, NJ", "value": "34017"}, {
  "label": "Hunterdon County, NJ",
  "value": "34019"
}, {"label": "Mercer County, NJ", "value": "34021"}, {
  "label": "Middlesex County, NJ",
  "value": "34023"
}, {"label": "Monmouth County, NJ", "value": "34025"}, {
  "label": "Morris County, NJ",
  "value": "34027"
}, {"label": "Ocean County, NJ", "value": "34029"}, {
  "label": "Passaic County, NJ",
  "value": "34031"
}, {"label": "Salem County, NJ", "value": "34033"}, {
  "label": "Somerset County, NJ",
  "value": "34035"
}, {"label": "Sussex County, NJ", "value": "34037"}, {
  "label": "Union County, NJ",
  "value": "34039"
}, {"label": "Warren County, NJ", "value": "34041"}, {
  "label": "Bernalillo County, NM",
  "value": "35001"
}, {"label": "Catron County, NM", "value": "35003"}, {
  "label": "Chaves County, NM",
  "value": "35005"
}, {"label": "Cibola County, NM", "value": "35006"}, {
  "label": "Colfax County, NM",
  "value": "35007"
}, {"label": "Curry County, NM", "value": "35009"}, {
  "label": "De Baca County, NM",
  "value": "35011"
}, {"label": "Dona Ana County, NM", "value": "35013"}, {
  "label": "Eddy County, NM",
  "value": "35015"
}, {"label": "Grant County, NM", "value": "35017"}, {
  "label": "Guadalupe County, NM",
  "value": "35019"
}, {"label": "Harding County, NM", "value": "35021"}, {
  "label": "Hidalgo County, NM",
  "value": "35023"
}, {"label": "Lea County, NM", "value": "35025"}, {
  "label": "Lincoln County, NM",
  "value": "35027"
}, {"label": "Los Alamos County, NM", "value": "35028"}, {
  "label": "Luna County, NM",
  "value": "35029"
}, {"label": "McKinley County, NM", "value": "35031"}, {
  "label": "Mora County, NM",
  "value": "35033"
}, {"label": "Otero County, NM", "value": "35035"}, {
  "label": "Quay County, NM",
  "value": "35037"
}, {"label": "Rio Arriba County, NM", "value": "35039"}, {
  "label": "Roosevelt County, NM",
  "value": "35041"
}, {"label": "Sandoval County, NM", "value": "35043"}, {
  "label": "San Juan County, NM",
  "value": "35045"
}, {"label": "San Miguel County, NM", "value": "35047"}, {
  "label": "Santa Fe County, NM",
  "value": "35049"
}, {"label": "Sierra County, NM", "value": "35051"}, {
  "label": "Socorro County, NM",
  "value": "35053"
}, {"label": "Taos County, NM", "value": "35055"}, {
  "label": "Torrance County, NM",
  "value": "35057"
}, {"label": "Union County, NM", "value": "35059"}, {
  "label": "Valencia County, NM",
  "value": "35061"
}, {"label": "Albany County, NY", "value": "36001"}, {
  "label": "Allegany County, NY",
  "value": "36003"
}, {"label": "Bronx County, NY", "value": "36005"}, {
  "label": "Broome County, NY",
  "value": "36007"
}, {"label": "Cattaraugus County, NY", "value": "36009"}, {
  "label": "Cayuga County, NY",
  "value": "36011"
}, {"label": "Chautauqua County, NY", "value": "36013"}, {
  "label": "Chemung County, NY",
  "value": "36015"
}, {"label": "Chenango County, NY", "value": "36017"}, {
  "label": "Clinton County, NY",
  "value": "36019"
}, {"label": "Columbia County, NY", "value": "36021"}, {
  "label": "Cortland County, NY",
  "value": "36023"
}, {"label": "Delaware County, NY", "value": "36025"}, {
  "label": "Dutchess County, NY",
  "value": "36027"
}, {"label": "Erie County, NY", "value": "36029"}, {
  "label": "Essex County, NY",
  "value": "36031"
}, {"label": "Franklin County, NY", "value": "36033"}, {
  "label": "Fulton County, NY",
  "value": "36035"
}, {"label": "Genesee County, NY", "value": "36037"}, {
  "label": "Greene County, NY",
  "value": "36039"
}, {"label": "Hamilton County, NY", "value": "36041"}, {
  "label": "Herkimer County, NY",
  "value": "36043"
}, {"label": "Jefferson County, NY", "value": "36045"}, {
  "label": "Kings County, NY",
  "value": "36047"
}, {"label": "Lewis County, NY", "value": "36049"}, {
  "label": "Livingston County, NY",
  "value": "36051"
}, {"label": "Madison County, NY", "value": "36053"}, {
  "label": "Monroe County, NY",
  "value": "36055"
}, {"label": "Montgomery County, NY", "value": "36057"}, {
  "label": "Nassau County, NY",
  "value": "36059"
}, {"label": "New York County, NY", "value": "36061"}, {
  "label": "Niagara County, NY",
  "value": "36063"
}, {"label": "Oneida County, NY", "value": "36065"}, {
  "label": "Onondaga County, NY",
  "value": "36067"
}, {"label": "Ontario County, NY", "value": "36069"}, {
  "label": "Orange County, NY",
  "value": "36071"
}, {"label": "Orleans County, NY", "value": "36073"}, {
  "label": "Oswego County, NY",
  "value": "36075"
}, {"label": "Otsego County, NY", "value": "36077"}, {
  "label": "Putnam County, NY",
  "value": "36079"
}, {"label": "Queens County, NY", "value": "36081"}, {
  "label": "Rensselaer County, NY",
  "value": "36083"
}, {"label": "Richmond County, NY", "value": "36085"}, {
  "label": "Rockland County, NY",
  "value": "36087"
}, {"label": "St. Lawrence County, NY", "value": "36089"}, {
  "label": "Saratoga County, NY",
  "value": "36091"
}, {"label": "Schenectady County, NY", "value": "36093"}, {
  "label": "Schoharie County, NY",
  "value": "36095"
}, {"label": "Schuyler County, NY", "value": "36097"}, {
  "label": "Seneca County, NY",
  "value": "36099"
}, {"label": "Steuben County, NY", "value": "36101"}, {
  "label": "Suffolk County, NY",
  "value": "36103"
}, {"label": "Sullivan County, NY", "value": "36105"}, {
  "label": "Tioga County, NY",
  "value": "36107"
}, {"label": "Tompkins County, NY", "value": "36109"}, {
  "label": "Ulster County, NY",
  "value": "36111"
}, {"label": "Warren County, NY", "value": "36113"}, {
  "label": "Washington County, NY",
  "value": "36115"
}, {"label": "Wayne County, NY", "value": "36117"}, {
  "label": "Westchester County, NY",
  "value": "36119"
}, {"label": "Wyoming County, NY", "value": "36121"}, {
  "label": "Yates County, NY",
  "value": "36123"
}, {"label": "Alamance County, NC", "value": "37001"}, {
  "label": "Alexander County, NC",
  "value": "37003"
}, {"label": "Alleghany County, NC", "value": "37005"}, {
  "label": "Anson County, NC",
  "value": "37007"
}, {"label": "Ashe County, NC", "value": "37009"}, {
  "label": "Avery County, NC",
  "value": "37011"
}, {"label": "Beaufort County, NC", "value": "37013"}, {
  "label": "Bertie County, NC",
  "value": "37015"
}, {"label": "Bladen County, NC", "value": "37017"}, {
  "label": "Brunswick County, NC",
  "value": "37019"
}, {"label": "Buncombe County, NC", "value": "37021"}, {
  "label": "Burke County, NC",
  "value": "37023"
}, {"label": "Cabarrus County, NC", "value": "37025"}, {
  "label": "Caldwell County, NC",
  "value": "37027"
}, {"label": "Camden County, NC", "value": "37029"}, {
  "label": "Carteret County, NC",
  "value": "37031"
}, {"label": "Caswell County, NC", "value": "37033"}, {
  "label": "Catawba County, NC",
  "value": "37035"
}, {"label": "Chatham County, NC", "value": "37037"}, {
  "label": "Cherokee County, NC",
  "value": "37039"
}, {"label": "Chowan County, NC", "value": "37041"}, {
  "label": "Clay County, NC",
  "value": "37043"
}, {"label": "Cleveland County, NC", "value": "37045"}, {
  "label": "Columbus County, NC",
  "value": "37047"
}, {"label": "Craven County, NC", "value": "37049"}, {
  "label": "Cumberland County, NC",
  "value": "37051"
}, {"label": "Currituck County, NC", "value": "37053"}, {
  "label": "Dare County, NC",
  "value": "37055"
}, {"label": "Davidson County, NC", "value": "37057"}, {
  "label": "Davie County, NC",
  "value": "37059"
}, {"label": "Duplin County, NC", "value": "37061"}, {
  "label": "Durham County, NC",
  "value": "37063"
}, {"label": "Edgecombe County, NC", "value": "37065"}, {
  "label": "Forsyth County, NC",
  "value": "37067"
}, {"label": "Franklin County, NC", "value": "37069"}, {
  "label": "Gaston County, NC",
  "value": "37071"
}, {"label": "Gates County, NC", "value": "37073"}, {
  "label": "Graham County, NC",
  "value": "37075"
}, {"label": "Granville County, NC", "value": "37077"}, {
  "label": "Greene County, NC",
  "value": "37079"
}, {"label": "Guilford County, NC", "value": "37081"}, {
  "label": "Halifax County, NC",
  "value": "37083"
}, {"label": "Harnett County, NC", "value": "37085"}, {
  "label": "Haywood County, NC",
  "value": "37087"
}, {"label": "Henderson County, NC", "value": "37089"}, {
  "label": "Hertford County, NC",
  "value": "37091"
}, {"label": "Hoke County, NC", "value": "37093"}, {
  "label": "Hyde County, NC",
  "value": "37095"
}, {"label": "Iredell County, NC", "value": "37097"}, {
  "label": "Jackson County, NC",
  "value": "37099"
}, {"label": "Johnston County, NC", "value": "37101"}, {
  "label": "Jones County, NC",
  "value": "37103"
}, {"label": "Lee County, NC", "value": "37105"}, {
  "label": "Lenoir County, NC",
  "value": "37107"
}, {"label": "Lincoln County, NC", "value": "37109"}, {
  "label": "McDowell County, NC",
  "value": "37111"
}, {"label": "Macon County, NC", "value": "37113"}, {
  "label": "Madison County, NC",
  "value": "37115"
}, {"label": "Martin County, NC", "value": "37117"}, {
  "label": "Mecklenburg County, NC",
  "value": "37119"
}, {"label": "Mitchell County, NC", "value": "37121"}, {
  "label": "Montgomery County, NC",
  "value": "37123"
}, {"label": "Moore County, NC", "value": "37125"}, {
  "label": "Nash County, NC",
  "value": "37127"
}, {"label": "New Hanover County, NC", "value": "37129"}, {
  "label": "Northampton County, NC",
  "value": "37131"
}, {"label": "Onslow County, NC", "value": "37133"}, {
  "label": "Orange County, NC",
  "value": "37135"
}, {"label": "Pamlico County, NC", "value": "37137"}, {
  "label": "Pasquotank County, NC",
  "value": "37139"
}, {"label": "Pender County, NC", "value": "37141"}, {
  "label": "Perquimans County, NC",
  "value": "37143"
}, {"label": "Person County, NC", "value": "37145"}, {
  "label": "Pitt County, NC",
  "value": "37147"
}, {"label": "Polk County, NC", "value": "37149"}, {
  "label": "Randolph County, NC",
  "value": "37151"
}, {"label": "Richmond County, NC", "value": "37153"}, {
  "label": "Robeson County, NC",
  "value": "37155"
}, {"label": "Rockingham County, NC", "value": "37157"}, {
  "label": "Rowan County, NC",
  "value": "37159"
}, {"label": "Rutherford County, NC", "value": "37161"}, {
  "label": "Sampson County, NC",
  "value": "37163"
}, {"label": "Scotland County, NC", "value": "37165"}, {
  "label": "Stanly County, NC",
  "value": "37167"
}, {"label": "Stokes County, NC", "value": "37169"}, {
  "label": "Surry County, NC",
  "value": "37171"
}, {"label": "Swain County, NC", "value": "37173"}, {
  "label": "Transylvania County, NC",
  "value": "37175"
}, {"label": "Tyrrell County, NC", "value": "37177"}, {
  "label": "Union County, NC",
  "value": "37179"
}, {"label": "Vance County, NC", "value": "37181"}, {
  "label": "Wake County, NC",
  "value": "37183"
}, {"label": "Warren County, NC", "value": "37185"}, {
  "label": "Washington County, NC",
  "value": "37187"
}, {"label": "Watauga County, NC", "value": "37189"}, {
  "label": "Wayne County, NC",
  "value": "37191"
}, {"label": "Wilkes County, NC", "value": "37193"}, {
  "label": "Wilson County, NC",
  "value": "37195"
}, {"label": "Yadkin County, NC", "value": "37197"}, {
  "label": "Yancey County, NC",
  "value": "37199"
}, {"label": "Adams County, ND", "value": "38001"}, {
  "label": "Barnes County, ND",
  "value": "38003"
}, {"label": "Benson County, ND", "value": "38005"}, {
  "label": "Billings County, ND",
  "value": "38007"
}, {"label": "Bottineau County, ND", "value": "38009"}, {
  "label": "Bowman County, ND",
  "value": "38011"
}, {"label": "Burke County, ND", "value": "38013"}, {
  "label": "Burleigh County, ND",
  "value": "38015"
}, {"label": "Cass County, ND", "value": "38017"}, {
  "label": "Cavalier County, ND",
  "value": "38019"
}, {"label": "Dickey County, ND", "value": "38021"}, {
  "label": "Divide County, ND",
  "value": "38023"
}, {"label": "Dunn County, ND", "value": "38025"}, {
  "label": "Eddy County, ND",
  "value": "38027"
}, {"label": "Emmons County, ND", "value": "38029"}, {
  "label": "Foster County, ND",
  "value": "38031"
}, {"label": "Golden Valley County, ND", "value": "38033"}, {
  "label": "Grand Forks County, ND",
  "value": "38035"
}, {"label": "Grant County, ND", "value": "38037"}, {
  "label": "Griggs County, ND",
  "value": "38039"
}, {"label": "Hettinger County, ND", "value": "38041"}, {
  "label": "Kidder County, ND",
  "value": "38043"
}, {"label": "LaMoure County, ND", "value": "38045"}, {
  "label": "Logan County, ND",
  "value": "38047"
}, {"label": "McHenry County, ND", "value": "38049"}, {
  "label": "McIntosh County, ND",
  "value": "38051"
}, {"label": "McKenzie County, ND", "value": "38053"}, {
  "label": "McLean County, ND",
  "value": "38055"
}, {"label": "Mercer County, ND", "value": "38057"}, {
  "label": "Morton County, ND",
  "value": "38059"
}, {"label": "Mountrail County, ND", "value": "38061"}, {
  "label": "Nelson County, ND",
  "value": "38063"
}, {"label": "Oliver County, ND", "value": "38065"}, {
  "label": "Pembina County, ND",
  "value": "38067"
}, {"label": "Pierce County, ND", "value": "38069"}, {
  "label": "Ramsey County, ND",
  "value": "38071"
}, {"label": "Ransom County, ND", "value": "38073"}, {
  "label": "Renville County, ND",
  "value": "38075"
}, {"label": "Richland County, ND", "value": "38077"}, {
  "label": "Rolette County, ND",
  "value": "38079"
}, {"label": "Sargent County, ND", "value": "38081"}, {
  "label": "Sheridan County, ND",
  "value": "38083"
}, {"label": "Sioux County, ND", "value": "38085"}, {
  "label": "Slope County, ND",
  "value": "38087"
}, {"label": "Stark County, ND", "value": "38089"}, {
  "label": "Steele County, ND",
  "value": "38091"
}, {"label": "Stutsman County, ND", "value": "38093"}, {
  "label": "Towner County, ND",
  "value": "38095"
}, {"label": "Traill County, ND", "value": "38097"}, {
  "label": "Walsh County, ND",
  "value": "38099"
}, {"label": "Ward County, ND", "value": "38101"}, {
  "label": "Wells County, ND",
  "value": "38103"
}, {"label": "Williams County, ND", "value": "38105"}, {
  "label": "Adams County, OH",
  "value": "39001"
}, {"label": "Allen County, OH", "value": "39003"}, {
  "label": "Ashland County, OH",
  "value": "39005"
}, {"label": "Ashtabula County, OH", "value": "39007"}, {
  "label": "Athens County, OH",
  "value": "39009"
}, {"label": "Auglaize County, OH", "value": "39011"}, {
  "label": "Belmont County, OH",
  "value": "39013"
}, {"label": "Brown County, OH", "value": "39015"}, {
  "label": "Butler County, OH",
  "value": "39017"
}, {"label": "Carroll County, OH", "value": "39019"}, {
  "label": "Champaign County, OH",
  "value": "39021"
}, {"label": "Clark County, OH", "value": "39023"}, {
  "label": "Clermont County, OH",
  "value": "39025"
}, {"label": "Clinton County, OH", "value": "39027"}, {
  "label": "Columbiana County, OH",
  "value": "39029"
}, {"label": "Coshocton County, OH", "value": "39031"}, {
  "label": "Crawford County, OH",
  "value": "39033"
}, {"label": "Cuyahoga County, OH", "value": "39035"}, {
  "label": "Darke County, OH",
  "value": "39037"
}, {"label": "Defiance County, OH", "value": "39039"}, {
  "label": "Delaware County, OH",
  "value": "39041"
}, {"label": "Erie County, OH", "value": "39043"}, {
  "label": "Fairfield County, OH",
  "value": "39045"
}, {"label": "Fayette County, OH", "value": "39047"}, {
  "label": "Franklin County, OH",
  "value": "39049"
}, {"label": "Fulton County, OH", "value": "39051"}, {
  "label": "Gallia County, OH",
  "value": "39053"
}, {"label": "Geauga County, OH", "value": "39055"}, {
  "label": "Greene County, OH",
  "value": "39057"
}, {"label": "Guernsey County, OH", "value": "39059"}, {
  "label": "Hamilton County, OH",
  "value": "39061"
}, {"label": "Hancock County, OH", "value": "39063"}, {
  "label": "Hardin County, OH",
  "value": "39065"
}, {"label": "Harrison County, OH", "value": "39067"}, {
  "label": "Henry County, OH",
  "value": "39069"
}, {"label": "Highland County, OH", "value": "39071"}, {
  "label": "Hocking County, OH",
  "value": "39073"
}, {"label": "Holmes County, OH", "value": "39075"}, {
  "label": "Huron County, OH",
  "value": "39077"
}, {"label": "Jackson County, OH", "value": "39079"}, {
  "label": "Jefferson County, OH",
  "value": "39081"
}, {"label": "Knox County, OH", "value": "39083"}, {
  "label": "Lake County, OH",
  "value": "39085"
}, {"label": "Lawrence County, OH", "value": "39087"}, {
  "label": "Licking County, OH",
  "value": "39089"
}, {"label": "Logan County, OH", "value": "39091"}, {
  "label": "Lorain County, OH",
  "value": "39093"
}, {"label": "Lucas County, OH", "value": "39095"}, {
  "label": "Madison County, OH",
  "value": "39097"
}, {"label": "Mahoning County, OH", "value": "39099"}, {
  "label": "Marion County, OH",
  "value": "39101"
}, {"label": "Medina County, OH", "value": "39103"}, {
  "label": "Meigs County, OH",
  "value": "39105"
}, {"label": "Mercer County, OH", "value": "39107"}, {
  "label": "Miami County, OH",
  "value": "39109"
}, {"label": "Monroe County, OH", "value": "39111"}, {
  "label": "Montgomery County, OH",
  "value": "39113"
}, {"label": "Morgan County, OH", "value": "39115"}, {
  "label": "Morrow County, OH",
  "value": "39117"
}, {"label": "Muskingum County, OH", "value": "39119"}, {
  "label": "Noble County, OH",
  "value": "39121"
}, {"label": "Ottawa County, OH", "value": "39123"}, {
  "label": "Paulding County, OH",
  "value": "39125"
}, {"label": "Perry County, OH", "value": "39127"}, {
  "label": "Pickaway County, OH",
  "value": "39129"
}, {"label": "Pike County, OH", "value": "39131"}, {
  "label": "Portage County, OH",
  "value": "39133"
}, {"label": "Preble County, OH", "value": "39135"}, {
  "label": "Putnam County, OH",
  "value": "39137"
}, {"label": "Richland County, OH", "value": "39139"}, {
  "label": "Ross County, OH",
  "value": "39141"
}, {"label": "Sandusky County, OH", "value": "39143"}, {
  "label": "Scioto County, OH",
  "value": "39145"
}, {"label": "Seneca County, OH", "value": "39147"}, {
  "label": "Shelby County, OH",
  "value": "39149"
}, {"label": "Stark County, OH", "value": "39151"}, {
  "label": "Summit County, OH",
  "value": "39153"
}, {"label": "Trumbull County, OH", "value": "39155"}, {
  "label": "Tuscarawas County, OH",
  "value": "39157"
}, {"label": "Union County, OH", "value": "39159"}, {
  "label": "Van Wert County, OH",
  "value": "39161"
}, {"label": "Vinton County, OH", "value": "39163"}, {
  "label": "Warren County, OH",
  "value": "39165"
}, {"label": "Washington County, OH", "value": "39167"}, {
  "label": "Wayne County, OH",
  "value": "39169"
}, {"label": "Williams County, OH", "value": "39171"}, {
  "label": "Wood County, OH",
  "value": "39173"
}, {"label": "Wyandot County, OH", "value": "39175"}, {
  "label": "Adair County, OK",
  "value": "40001"
}, {"label": "Alfalfa County, OK", "value": "40003"}, {
  "label": "Atoka County, OK",
  "value": "40005"
}, {"label": "Beaver County, OK", "value": "40007"}, {
  "label": "Beckham County, OK",
  "value": "40009"
}, {"label": "Blaine County, OK", "value": "40011"}, {
  "label": "Bryan County, OK",
  "value": "40013"
}, {"label": "Caddo County, OK", "value": "40015"}, {
  "label": "Canadian County, OK",
  "value": "40017"
}, {"label": "Carter County, OK", "value": "40019"}, {
  "label": "Cherokee County, OK",
  "value": "40021"
}, {"label": "Choctaw County, OK", "value": "40023"}, {
  "label": "Cimarron County, OK",
  "value": "40025"
}, {"label": "Cleveland County, OK", "value": "40027"}, {
  "label": "Coal County, OK",
  "value": "40029"
}, {"label": "Comanche County, OK", "value": "40031"}, {
  "label": "Cotton County, OK",
  "value": "40033"
}, {"label": "Craig County, OK", "value": "40035"}, {
  "label": "Creek County, OK",
  "value": "40037"
}, {"label": "Custer County, OK", "value": "40039"}, {
  "label": "Delaware County, OK",
  "value": "40041"
}, {"label": "Dewey County, OK", "value": "40043"}, {
  "label": "Ellis County, OK",
  "value": "40045"
}, {"label": "Garfield County, OK", "value": "40047"}, {
  "label": "Garvin County, OK",
  "value": "40049"
}, {"label": "Grady County, OK", "value": "40051"}, {
  "label": "Grant County, OK",
  "value": "40053"
}, {"label": "Greer County, OK", "value": "40055"}, {
  "label": "Harmon County, OK",
  "value": "40057"
}, {"label": "Harper County, OK", "value": "40059"}, {
  "label": "Haskell County, OK",
  "value": "40061"
}, {"label": "Hughes County, OK", "value": "40063"}, {
  "label": "Jackson County, OK",
  "value": "40065"
}, {"label": "Jefferson County, OK", "value": "40067"}, {
  "label": "Johnston County, OK",
  "value": "40069"
}, {"label": "Kay County, OK", "value": "40071"}, {
  "label": "Kingfisher County, OK",
  "value": "40073"
}, {"label": "Kiowa County, OK", "value": "40075"}, {
  "label": "Latimer County, OK",
  "value": "40077"
}, {"label": "Le Flore County, OK", "value": "40079"}, {
  "label": "Lincoln County, OK",
  "value": "40081"
}, {"label": "Logan County, OK", "value": "40083"}, {
  "label": "Love County, OK",
  "value": "40085"
}, {"label": "McClain County, OK", "value": "40087"}, {
  "label": "McCurtain County, OK",
  "value": "40089"
}, {"label": "McIntosh County, OK", "value": "40091"}, {
  "label": "Major County, OK",
  "value": "40093"
}, {"label": "Marshall County, OK", "value": "40095"}, {
  "label": "Mayes County, OK",
  "value": "40097"
}, {"label": "Murray County, OK", "value": "40099"}, {
  "label": "Muskogee County, OK",
  "value": "40101"
}, {"label": "Noble County, OK", "value": "40103"}, {
  "label": "Nowata County, OK",
  "value": "40105"
}, {"label": "Okfuskee County, OK", "value": "40107"}, {
  "label": "Oklahoma County, OK",
  "value": "40109"
}, {"label": "Okmulgee County, OK", "value": "40111"}, {
  "label": "Osage County, OK",
  "value": "40113"
}, {"label": "Ottawa County, OK", "value": "40115"}, {
  "label": "Pawnee County, OK",
  "value": "40117"
}, {"label": "Payne County, OK", "value": "40119"}, {
  "label": "Pittsburg County, OK",
  "value": "40121"
}, {"label": "Pontotoc County, OK", "value": "40123"}, {
  "label": "Pottawatomie County, OK",
  "value": "40125"
}, {"label": "Pushmataha County, OK", "value": "40127"}, {
  "label": "Roger Mills County, OK",
  "value": "40129"
}, {"label": "Rogers County, OK", "value": "40131"}, {
  "label": "Seminole County, OK",
  "value": "40133"
}, {"label": "Sequoyah County, OK", "value": "40135"}, {
  "label": "Stephens County, OK",
  "value": "40137"
}, {"label": "Texas County, OK", "value": "40139"}, {
  "label": "Tillman County, OK",
  "value": "40141"
}, {"label": "Tulsa County, OK", "value": "40143"}, {
  "label": "Wagoner County, OK",
  "value": "40145"
}, {"label": "Washington County, OK", "value": "40147"}, {
  "label": "Washita County, OK",
  "value": "40149"
}, {"label": "Woods County, OK", "value": "40151"}, {
  "label": "Woodward County, OK",
  "value": "40153"
}, {"label": "Baker County, OR", "value": "41001"}, {
  "label": "Benton County, OR",
  "value": "41003"
}, {"label": "Clackamas County, OR", "value": "41005"}, {
  "label": "Clatsop County, OR",
  "value": "41007"
}, {"label": "Columbia County, OR", "value": "41009"}, {
  "label": "Coos County, OR",
  "value": "41011"
}, {"label": "Crook County, OR", "value": "41013"}, {
  "label": "Curry County, OR",
  "value": "41015"
}, {"label": "Deschutes County, OR", "value": "41017"}, {
  "label": "Douglas County, OR",
  "value": "41019"
}, {"label": "Gilliam County, OR", "value": "41021"}, {
  "label": "Grant County, OR",
  "value": "41023"
}, {"label": "Harney County, OR", "value": "41025"}, {
  "label": "Hood River County, OR",
  "value": "41027"
}, {"label": "Jackson County, OR", "value": "41029"}, {
  "label": "Jefferson County, OR",
  "value": "41031"
}, {"label": "Josephine County, OR", "value": "41033"}, {
  "label": "Klamath County, OR",
  "value": "41035"
}, {"label": "Lake County, OR", "value": "41037"}, {
  "label": "Lane County, OR",
  "value": "41039"
}, {"label": "Lincoln County, OR", "value": "41041"}, {
  "label": "Linn County, OR",
  "value": "41043"
}, {"label": "Malheur County, OR", "value": "41045"}, {
  "label": "Marion County, OR",
  "value": "41047"
}, {"label": "Morrow County, OR", "value": "41049"}, {
  "label": "Multnomah County, OR",
  "value": "41051"
}, {"label": "Polk County, OR", "value": "41053"}, {
  "label": "Sherman County, OR",
  "value": "41055"
}, {"label": "Tillamook County, OR", "value": "41057"}, {
  "label": "Umatilla County, OR",
  "value": "41059"
}, {"label": "Union County, OR", "value": "41061"}, {
  "label": "Wallowa County, OR",
  "value": "41063"
}, {"label": "Wasco County, OR", "value": "41065"}, {
  "label": "Washington County, OR",
  "value": "41067"
}, {"label": "Wheeler County, OR", "value": "41069"}, {
  "label": "Yamhill County, OR",
  "value": "41071"
}, {"label": "Adams County, PA", "value": "42001"}, {
  "label": "Allegheny County, PA",
  "value": "42003"
}, {"label": "Armstrong County, PA", "value": "42005"}, {
  "label": "Beaver County, PA",
  "value": "42007"
}, {"label": "Bedford County, PA", "value": "42009"}, {
  "label": "Berks County, PA",
  "value": "42011"
}, {"label": "Blair County, PA", "value": "42013"}, {
  "label": "Bradford County, PA",
  "value": "42015"
}, {"label": "Bucks County, PA", "value": "42017"}, {
  "label": "Butler County, PA",
  "value": "42019"
}, {"label": "Cambria County, PA", "value": "42021"}, {
  "label": "Cameron County, PA",
  "value": "42023"
}, {"label": "Carbon County, PA", "value": "42025"}, {
  "label": "Centre County, PA",
  "value": "42027"
}, {"label": "Chester County, PA", "value": "42029"}, {
  "label": "Clarion County, PA",
  "value": "42031"
}, {"label": "Clearfield County, PA", "value": "42033"}, {
  "label": "Clinton County, PA",
  "value": "42035"
}, {"label": "Columbia County, PA", "value": "42037"}, {
  "label": "Crawford County, PA",
  "value": "42039"
}, {"label": "Cumberland County, PA", "value": "42041"}, {
  "label": "Dauphin County, PA",
  "value": "42043"
}, {"label": "Delaware County, PA", "value": "42045"}, {
  "label": "Elk County, PA",
  "value": "42047"
}, {"label": "Erie County, PA", "value": "42049"}, {
  "label": "Fayette County, PA",
  "value": "42051"
}, {"label": "Forest County, PA", "value": "42053"}, {
  "label": "Franklin County, PA",
  "value": "42055"
}, {"label": "Fulton County, PA", "value": "42057"}, {
  "label": "Greene County, PA",
  "value": "42059"
}, {"label": "Huntingdon County, PA", "value": "42061"}, {
  "label": "Indiana County, PA",
  "value": "42063"
}, {"label": "Jefferson County, PA", "value": "42065"}, {
  "label": "Juniata County, PA",
  "value": "42067"
}, {"label": "Lackawanna County, PA", "value": "42069"}, {
  "label": "Lancaster County, PA",
  "value": "42071"
}, {"label": "Lawrence County, PA", "value": "42073"}, {
  "label": "Lebanon County, PA",
  "value": "42075"
}, {"label": "Lehigh County, PA", "value": "42077"}, {
  "label": "Luzerne County, PA",
  "value": "42079"
}, {"label": "Lycoming County, PA", "value": "42081"}, {
  "label": "McKean County, PA",
  "value": "42083"
}, {"label": "Mercer County, PA", "value": "42085"}, {
  "label": "Mifflin County, PA",
  "value": "42087"
}, {"label": "Monroe County, PA", "value": "42089"}, {
  "label": "Montgomery County, PA",
  "value": "42091"
}, {"label": "Montour County, PA", "value": "42093"}, {
  "label": "Northampton County, PA",
  "value": "42095"
}, {"label": "Northumberland County, PA", "value": "42097"}, {
  "label": "Perry County, PA",
  "value": "42099"
}, {"label": "Philadelphia County, PA", "value": "42101"}, {
  "label": "Pike County, PA",
  "value": "42103"
}, {"label": "Potter County, PA", "value": "42105"}, {
  "label": "Schuylkill County, PA",
  "value": "42107"
}, {"label": "Snyder County, PA", "value": "42109"}, {
  "label": "Somerset County, PA",
  "value": "42111"
}, {"label": "Sullivan County, PA", "value": "42113"}, {
  "label": "Susquehanna County, PA",
  "value": "42115"
}, {"label": "Tioga County, PA", "value": "42117"}, {
  "label": "Union County, PA",
  "value": "42119"
}, {"label": "Venango County, PA", "value": "42121"}, {
  "label": "Warren County, PA",
  "value": "42123"
}, {"label": "Washington County, PA", "value": "42125"}, {
  "label": "Wayne County, PA",
  "value": "42127"
}, {"label": "Westmoreland County, PA", "value": "42129"}, {
  "label": "Wyoming County, PA",
  "value": "42131"
}, {"label": "York County, PA", "value": "42133"}, {
  "label": "Bristol County, RI",
  "value": "44001"
}, {"label": "Kent County, RI", "value": "44003"}, {
  "label": "Newport County, RI",
  "value": "44005"
}, {"label": "Providence County, RI", "value": "44007"}, {
  "label": "Washington County, RI",
  "value": "44009"
}, {"label": "Abbeville County, SC", "value": "45001"}, {
  "label": "Aiken County, SC",
  "value": "45003"
}, {"label": "Allendale County, SC", "value": "45005"}, {
  "label": "Anderson County, SC",
  "value": "45007"
}, {"label": "Bamberg County, SC", "value": "45009"}, {
  "label": "Barnwell County, SC",
  "value": "45011"
}, {"label": "Beaufort County, SC", "value": "45013"}, {
  "label": "Berkeley County, SC",
  "value": "45015"
}, {"label": "Calhoun County, SC", "value": "45017"}, {
  "label": "Charleston County, SC",
  "value": "45019"
}, {"label": "Cherokee County, SC", "value": "45021"}, {
  "label": "Chester County, SC",
  "value": "45023"
}, {"label": "Chesterfield County, SC", "value": "45025"}, {
  "label": "Clarendon County, SC",
  "value": "45027"
}, {"label": "Colleton County, SC", "value": "45029"}, {
  "label": "Darlington County, SC",
  "value": "45031"
}, {"label": "Dillon County, SC", "value": "45033"}, {
  "label": "Dorchester County, SC",
  "value": "45035"
}, {"label": "Edgefield County, SC", "value": "45037"}, {
  "label": "Fairfield County, SC",
  "value": "45039"
}, {"label": "Florence County, SC", "value": "45041"}, {
  "label": "Georgetown County, SC",
  "value": "45043"
}, {"label": "Greenville County, SC", "value": "45045"}, {
  "label": "Greenwood County, SC",
  "value": "45047"
}, {"label": "Hampton County, SC", "value": "45049"}, {
  "label": "Horry County, SC",
  "value": "45051"
}, {"label": "Jasper County, SC", "value": "45053"}, {
  "label": "Kershaw County, SC",
  "value": "45055"
}, {"label": "Lancaster County, SC", "value": "45057"}, {
  "label": "Laurens County, SC",
  "value": "45059"
}, {"label": "Lee County, SC", "value": "45061"}, {
  "label": "Lexington County, SC",
  "value": "45063"
}, {"label": "McCormick County, SC", "value": "45065"}, {
  "label": "Marion County, SC",
  "value": "45067"
}, {"label": "Marlboro County, SC", "value": "45069"}, {
  "label": "Newberry County, SC",
  "value": "45071"
}, {"label": "Oconee County, SC", "value": "45073"}, {
  "label": "Orangeburg County, SC",
  "value": "45075"
}, {"label": "Pickens County, SC", "value": "45077"}, {
  "label": "Richland County, SC",
  "value": "45079"
}, {"label": "Saluda County, SC", "value": "45081"}, {
  "label": "Spartanburg County, SC",
  "value": "45083"
}, {"label": "Sumter County, SC", "value": "45085"}, {
  "label": "Union County, SC",
  "value": "45087"
}, {"label": "Williamsburg County, SC", "value": "45089"}, {
  "label": "York County, SC",
  "value": "45091"
}, {"label": "Aurora County, SD", "value": "46003"}, {
  "label": "Beadle County, SD",
  "value": "46005"
}, {"label": "Bennett County, SD", "value": "46007"}, {
  "label": "Bon Homme County, SD",
  "value": "46009"
}, {"label": "Brookings County, SD", "value": "46011"}, {
  "label": "Brown County, SD",
  "value": "46013"
}, {"label": "Brule County, SD", "value": "46015"}, {
  "label": "Buffalo County, SD",
  "value": "46017"
}, {"label": "Butte County, SD", "value": "46019"}, {
  "label": "Campbell County, SD",
  "value": "46021"
}, {"label": "Charles Mix County, SD", "value": "46023"}, {
  "label": "Clark County, SD",
  "value": "46025"
}, {"label": "Clay County, SD", "value": "46027"}, {
  "label": "Codington County, SD",
  "value": "46029"
}, {"label": "Corson County, SD", "value": "46031"}, {
  "label": "Custer County, SD",
  "value": "46033"
}, {"label": "Davison County, SD", "value": "46035"}, {
  "label": "Day County, SD",
  "value": "46037"
}, {"label": "Deuel County, SD", "value": "46039"}, {
  "label": "Dewey County, SD",
  "value": "46041"
}, {"label": "Douglas County, SD", "value": "46043"}, {
  "label": "Edmunds County, SD",
  "value": "46045"
}, {"label": "Fall River County, SD", "value": "46047"}, {
  "label": "Faulk County, SD",
  "value": "46049"
}, {"label": "Grant County, SD", "value": "46051"}, {
  "label": "Gregory County, SD",
  "value": "46053"
}, {"label": "Haakon County, SD", "value": "46055"}, {
  "label": "Hamlin County, SD",
  "value": "46057"
}, {"label": "Hand County, SD", "value": "46059"}, {
  "label": "Hanson County, SD",
  "value": "46061"
}, {"label": "Harding County, SD", "value": "46063"}, {
  "label": "Hughes County, SD",
  "value": "46065"
}, {"label": "Hutchinson County, SD", "value": "46067"}, {
  "label": "Hyde County, SD",
  "value": "46069"
}, {"label": "Jackson County, SD", "value": "46071"}, {
  "label": "Jerauld County, SD",
  "value": "46073"
}, {"label": "Jones County, SD", "value": "46075"}, {
  "label": "Kingsbury County, SD",
  "value": "46077"
}, {"label": "Lake County, SD", "value": "46079"}, {
  "label": "Lawrence County, SD",
  "value": "46081"
}, {"label": "Lincoln County, SD", "value": "46083"}, {
  "label": "Lyman County, SD",
  "value": "46085"
}, {"label": "McCook County, SD", "value": "46087"}, {
  "label": "McPherson County, SD",
  "value": "46089"
}, {"label": "Marshall County, SD", "value": "46091"}, {
  "label": "Meade County, SD",
  "value": "46093"
}, {"label": "Mellette County, SD", "value": "46095"}, {
  "label": "Miner County, SD",
  "value": "46097"
}, {"label": "Minnehaha County, SD", "value": "46099"}, {
  "label": "Moody County, SD",
  "value": "46101"
}, {"label": "Pennington County, SD", "value": "46103"}, {
  "label": "Perkins County, SD",
  "value": "46105"
}, {"label": "Potter County, SD", "value": "46107"}, {
  "label": "Roberts County, SD",
  "value": "46109"
}, {"label": "Sanborn County, SD", "value": "46111"}, {
  "label": "Shannon County, SD",
  "value": "46113"
}, {"label": "Spink County, SD", "value": "46115"}, {
  "label": "Stanley County, SD",
  "value": "46117"
}, {"label": "Sully County, SD", "value": "46119"}, {
  "label": "Todd County, SD",
  "value": "46121"
}, {"label": "Tripp County, SD", "value": "46123"}, {
  "label": "Turner County, SD",
  "value": "46125"
}, {"label": "Union County, SD", "value": "46127"}, {
  "label": "Walworth County, SD",
  "value": "46129"
}, {"label": "Yankton County, SD", "value": "46135"}, {
  "label": "Ziebach County, SD",
  "value": "46137"
}, {"label": "Anderson County, TN", "value": "47001"}, {
  "label": "Bedford County, TN",
  "value": "47003"
}, {"label": "Benton County, TN", "value": "47005"}, {
  "label": "Bledsoe County, TN",
  "value": "47007"
}, {"label": "Blount County, TN", "value": "47009"}, {
  "label": "Bradley County, TN",
  "value": "47011"
}, {"label": "Campbell County, TN", "value": "47013"}, {
  "label": "Cannon County, TN",
  "value": "47015"
}, {"label": "Carroll County, TN", "value": "47017"}, {
  "label": "Carter County, TN",
  "value": "47019"
}, {"label": "Cheatham County, TN", "value": "47021"}, {
  "label": "Chester County, TN",
  "value": "47023"
}, {"label": "Claiborne County, TN", "value": "47025"}, {
  "label": "Clay County, TN",
  "value": "47027"
}, {"label": "Cocke County, TN", "value": "47029"}, {
  "label": "Coffee County, TN",
  "value": "47031"
}, {"label": "Crockett County, TN", "value": "47033"}, {
  "label": "Cumberland County, TN",
  "value": "47035"
}, {"label": "Davidson County, TN", "value": "47037"}, {
  "label": "Decatur County, TN",
  "value": "47039"
}, {"label": "DeKalb County, TN", "value": "47041"}, {
  "label": "Dickson County, TN",
  "value": "47043"
}, {"label": "Dyer County, TN", "value": "47045"}, {
  "label": "Fayette County, TN",
  "value": "47047"
}, {"label": "Fentress County, TN", "value": "47049"}, {
  "label": "Franklin County, TN",
  "value": "47051"
}, {"label": "Gibson County, TN", "value": "47053"}, {
  "label": "Giles County, TN",
  "value": "47055"
}, {"label": "Grainger County, TN", "value": "47057"}, {
  "label": "Greene County, TN",
  "value": "47059"
}, {"label": "Grundy County, TN", "value": "47061"}, {
  "label": "Hamblen County, TN",
  "value": "47063"
}, {"label": "Hamilton County, TN", "value": "47065"}, {
  "label": "Hancock County, TN",
  "value": "47067"
}, {"label": "Hardeman County, TN", "value": "47069"}, {
  "label": "Hardin County, TN",
  "value": "47071"
}, {"label": "Hawkins County, TN", "value": "47073"}, {
  "label": "Haywood County, TN",
  "value": "47075"
}, {"label": "Henderson County, TN", "value": "47077"}, {
  "label": "Henry County, TN",
  "value": "47079"
}, {"label": "Hickman County, TN", "value": "47081"}, {
  "label": "Houston County, TN",
  "value": "47083"
}, {"label": "Humphreys County, TN", "value": "47085"}, {
  "label": "Jackson County, TN",
  "value": "47087"
}, {"label": "Jefferson County, TN", "value": "47089"}, {
  "label": "Johnson County, TN",
  "value": "47091"
}, {"label": "Knox County, TN", "value": "47093"}, {
  "label": "Lake County, TN",
  "value": "47095"
}, {"label": "Lauderdale County, TN", "value": "47097"}, {
  "label": "Lawrence County, TN",
  "value": "47099"
}, {"label": "Lewis County, TN", "value": "47101"}, {
  "label": "Lincoln County, TN",
  "value": "47103"
}, {"label": "Loudon County, TN", "value": "47105"}, {
  "label": "McMinn County, TN",
  "value": "47107"
}, {"label": "McNairy County, TN", "value": "47109"}, {
  "label": "Macon County, TN",
  "value": "47111"
}, {"label": "Madison County, TN", "value": "47113"}, {
  "label": "Marion County, TN",
  "value": "47115"
}, {"label": "Marshall County, TN", "value": "47117"}, {
  "label": "Maury County, TN",
  "value": "47119"
}, {"label": "Meigs County, TN", "value": "47121"}, {
  "label": "Monroe County, TN",
  "value": "47123"
}, {"label": "Montgomery County, TN", "value": "47125"}, {
  "label": "Moore County, TN",
  "value": "47127"
}, {"label": "Morgan County, TN", "value": "47129"}, {
  "label": "Obion County, TN",
  "value": "47131"
}, {"label": "Overton County, TN", "value": "47133"}, {
  "label": "Perry County, TN",
  "value": "47135"
}, {"label": "Pickett County, TN", "value": "47137"}, {
  "label": "Polk County, TN",
  "value": "47139"
}, {"label": "Putnam County, TN", "value": "47141"}, {
  "label": "Rhea County, TN",
  "value": "47143"
}, {"label": "Roane County, TN", "value": "47145"}, {
  "label": "Robertson County, TN",
  "value": "47147"
}, {"label": "Rutherford County, TN", "value": "47149"}, {
  "label": "Scott County, TN",
  "value": "47151"
}, {"label": "Sequatchie County, TN", "value": "47153"}, {
  "label": "Sevier County, TN",
  "value": "47155"
}, {"label": "Shelby County, TN", "value": "47157"}, {
  "label": "Smith County, TN",
  "value": "47159"
}, {"label": "Stewart County, TN", "value": "47161"}, {
  "label": "Sullivan County, TN",
  "value": "47163"
}, {"label": "Sumner County, TN", "value": "47165"}, {
  "label": "Tipton County, TN",
  "value": "47167"
}, {"label": "Trousdale County, TN", "value": "47169"}, {
  "label": "Unicoi County, TN",
  "value": "47171"
}, {"label": "Union County, TN", "value": "47173"}, {
  "label": "Van Buren County, TN",
  "value": "47175"
}, {"label": "Warren County, TN", "value": "47177"}, {
  "label": "Washington County, TN",
  "value": "47179"
}, {"label": "Wayne County, TN", "value": "47181"}, {
  "label": "Weakley County, TN",
  "value": "47183"
}, {"label": "White County, TN", "value": "47185"}, {
  "label": "Williamson County, TN",
  "value": "47187"
}, {"label": "Wilson County, TN", "value": "47189"}, {
  "label": "Anderson County, TX",
  "value": "48001"
}, {"label": "Andrews County, TX", "value": "48003"}, {
  "label": "Angelina County, TX",
  "value": "48005"
}, {"label": "Aransas County, TX", "value": "48007"}, {
  "label": "Archer County, TX",
  "value": "48009"
}, {"label": "Armstrong County, TX", "value": "48011"}, {
  "label": "Atascosa County, TX",
  "value": "48013"
}, {"label": "Austin County, TX", "value": "48015"}, {
  "label": "Bailey County, TX",
  "value": "48017"
}, {"label": "Bandera County, TX", "value": "48019"}, {
  "label": "Bastrop County, TX",
  "value": "48021"
}, {"label": "Baylor County, TX", "value": "48023"}, {
  "label": "Bee County, TX",
  "value": "48025"
}, {"label": "Bell County, TX", "value": "48027"}, {
  "label": "Bexar County, TX",
  "value": "48029"
}, {"label": "Blanco County, TX", "value": "48031"}, {
  "label": "Borden County, TX",
  "value": "48033"
}, {"label": "Bosque County, TX", "value": "48035"}, {
  "label": "Bowie County, TX",
  "value": "48037"
}, {"label": "Brazoria County, TX", "value": "48039"}, {
  "label": "Brazos County, TX",
  "value": "48041"
}, {"label": "Brewster County, TX", "value": "48043"}, {
  "label": "Briscoe County, TX",
  "value": "48045"
}, {"label": "Brooks County, TX", "value": "48047"}, {
  "label": "Brown County, TX",
  "value": "48049"
}, {"label": "Burleson County, TX", "value": "48051"}, {
  "label": "Burnet County, TX",
  "value": "48053"
}, {"label": "Caldwell County, TX", "value": "48055"}, {
  "label": "Calhoun County, TX",
  "value": "48057"
}, {"label": "Callahan County, TX", "value": "48059"}, {
  "label": "Cameron County, TX",
  "value": "48061"
}, {"label": "Camp County, TX", "value": "48063"}, {
  "label": "Carson County, TX",
  "value": "48065"
}, {"label": "Cass County, TX", "value": "48067"}, {
  "label": "Castro County, TX",
  "value": "48069"
}, {"label": "Chambers County, TX", "value": "48071"}, {
  "label": "Cherokee County, TX",
  "value": "48073"
}, {"label": "Childress County, TX", "value": "48075"}, {
  "label": "Clay County, TX",
  "value": "48077"
}, {"label": "Cochran County, TX", "value": "48079"}, {
  "label": "Coke County, TX",
  "value": "48081"
}, {"label": "Coleman County, TX", "value": "48083"}, {
  "label": "Collin County, TX",
  "value": "48085"
}, {"label": "Collingsworth County, TX", "value": "48087"}, {
  "label": "Colorado County, TX",
  "value": "48089"
}, {"label": "Comal County, TX", "value": "48091"}, {
  "label": "Comanche County, TX",
  "value": "48093"
}, {"label": "Concho County, TX", "value": "48095"}, {
  "label": "Cooke County, TX",
  "value": "48097"
}, {"label": "Coryell County, TX", "value": "48099"}, {
  "label": "Cottle County, TX",
  "value": "48101"
}, {"label": "Crane County, TX", "value": "48103"}, {
  "label": "Crockett County, TX",
  "value": "48105"
}, {"label": "Crosby County, TX", "value": "48107"}, {
  "label": "Culberson County, TX",
  "value": "48109"
}, {"label": "Dallam County, TX", "value": "48111"}, {
  "label": "Dallas County, TX",
  "value": "48113"
}, {"label": "Dawson County, TX", "value": "48115"}, {
  "label": "Deaf Smith County, TX",
  "value": "48117"
}, {"label": "Delta County, TX", "value": "48119"}, {
  "label": "Denton County, TX",
  "value": "48121"
}, {"label": "DeWitt County, TX", "value": "48123"}, {
  "label": "Dickens County, TX",
  "value": "48125"
}, {"label": "Dimmit County, TX", "value": "48127"}, {
  "label": "Donley County, TX",
  "value": "48129"
}, {"label": "Duval County, TX", "value": "48131"}, {
  "label": "Eastland County, TX",
  "value": "48133"
}, {"label": "Ector County, TX", "value": "48135"}, {
  "label": "Edwards County, TX",
  "value": "48137"
}, {"label": "Ellis County, TX", "value": "48139"}, {
  "label": "El Paso County, TX",
  "value": "48141"
}, {"label": "Erath County, TX", "value": "48143"}, {
  "label": "Falls County, TX",
  "value": "48145"
}, {"label": "Fannin County, TX", "value": "48147"}, {
  "label": "Fayette County, TX",
  "value": "48149"
}, {"label": "Fisher County, TX", "value": "48151"}, {
  "label": "Floyd County, TX",
  "value": "48153"
}, {"label": "Foard County, TX", "value": "48155"}, {
  "label": "Fort Bend County, TX",
  "value": "48157"
}, {"label": "Franklin County, TX", "value": "48159"}, {
  "label": "Freestone County, TX",
  "value": "48161"
}, {"label": "Frio County, TX", "value": "48163"}, {
  "label": "Gaines County, TX",
  "value": "48165"
}, {"label": "Galveston County, TX", "value": "48167"}, {
  "label": "Garza County, TX",
  "value": "48169"
}, {"label": "Gillespie County, TX", "value": "48171"}, {
  "label": "Glasscock County, TX",
  "value": "48173"
}, {"label": "Goliad County, TX", "value": "48175"}, {
  "label": "Gonzales County, TX",
  "value": "48177"
}, {"label": "Gray County, TX", "value": "48179"}, {
  "label": "Grayson County, TX",
  "value": "48181"
}, {"label": "Gregg County, TX", "value": "48183"}, {
  "label": "Grimes County, TX",
  "value": "48185"
}, {"label": "Guadalupe County, TX", "value": "48187"}, {
  "label": "Hale County, TX",
  "value": "48189"
}, {"label": "Hall County, TX", "value": "48191"}, {
  "label": "Hamilton County, TX",
  "value": "48193"
}, {"label": "Hansford County, TX", "value": "48195"}, {
  "label": "Hardeman County, TX",
  "value": "48197"
}, {"label": "Hardin County, TX", "value": "48199"}, {
  "label": "Harris County, TX",
  "value": "48201"
}, {"label": "Harrison County, TX", "value": "48203"}, {
  "label": "Hartley County, TX",
  "value": "48205"
}, {"label": "Haskell County, TX", "value": "48207"}, {
  "label": "Hays County, TX",
  "value": "48209"
}, {"label": "Hemphill County, TX", "value": "48211"}, {
  "label": "Henderson County, TX",
  "value": "48213"
}, {"label": "Hidalgo County, TX", "value": "48215"}, {
  "label": "Hill County, TX",
  "value": "48217"
}, {"label": "Hockley County, TX", "value": "48219"}, {
  "label": "Hood County, TX",
  "value": "48221"
}, {"label": "Hopkins County, TX", "value": "48223"}, {
  "label": "Houston County, TX",
  "value": "48225"
}, {"label": "Howard County, TX", "value": "48227"}, {
  "label": "Hudspeth County, TX",
  "value": "48229"
}, {"label": "Hunt County, TX", "value": "48231"}, {
  "label": "Hutchinson County, TX",
  "value": "48233"
}, {"label": "Irion County, TX", "value": "48235"}, {
  "label": "Jack County, TX",
  "value": "48237"
}, {"label": "Jackson County, TX", "value": "48239"}, {
  "label": "Jasper County, TX",
  "value": "48241"
}, {"label": "Jeff Davis County, TX", "value": "48243"}, {
  "label": "Jefferson County, TX",
  "value": "48245"
}, {"label": "Jim Hogg County, TX", "value": "48247"}, {
  "label": "Jim Wells County, TX",
  "value": "48249"
}, {"label": "Johnson County, TX", "value": "48251"}, {
  "label": "Jones County, TX",
  "value": "48253"
}, {"label": "Karnes County, TX", "value": "48255"}, {
  "label": "Kaufman County, TX",
  "value": "48257"
}, {"label": "Kendall County, TX", "value": "48259"}, {
  "label": "Kenedy County, TX",
  "value": "48261"
}, {"label": "Kent County, TX", "value": "48263"}, {
  "label": "Kerr County, TX",
  "value": "48265"
}, {"label": "Kimble County, TX", "value": "48267"}, {
  "label": "King County, TX",
  "value": "48269"
}, {"label": "Kinney County, TX", "value": "48271"}, {
  "label": "Kleberg County, TX",
  "value": "48273"
}, {"label": "Knox County, TX", "value": "48275"}, {
  "label": "Lamar County, TX",
  "value": "48277"
}, {"label": "Lamb County, TX", "value": "48279"}, {
  "label": "Lampasas County, TX",
  "value": "48281"
}, {"label": "La Salle County, TX", "value": "48283"}, {
  "label": "Lavaca County, TX",
  "value": "48285"
}, {"label": "Lee County, TX", "value": "48287"}, {
  "label": "Leon County, TX",
  "value": "48289"
}, {"label": "Liberty County, TX", "value": "48291"}, {
  "label": "Limestone County, TX",
  "value": "48293"
}, {"label": "Lipscomb County, TX", "value": "48295"}, {
  "label": "Live Oak County, TX",
  "value": "48297"
}, {"label": "Llano County, TX", "value": "48299"}, {
  "label": "Loving County, TX",
  "value": "48301"
}, {"label": "Lubbock County, TX", "value": "48303"}, {
  "label": "Lynn County, TX",
  "value": "48305"
}, {"label": "McCulloch County, TX", "value": "48307"}, {
  "label": "McLennan County, TX",
  "value": "48309"
}, {"label": "McMullen County, TX", "value": "48311"}, {
  "label": "Madison County, TX",
  "value": "48313"
}, {"label": "Marion County, TX", "value": "48315"}, {
  "label": "Martin County, TX",
  "value": "48317"
}, {"label": "Mason County, TX", "value": "48319"}, {
  "label": "Matagorda County, TX",
  "value": "48321"
}, {"label": "Maverick County, TX", "value": "48323"}, {
  "label": "Medina County, TX",
  "value": "48325"
}, {"label": "Menard County, TX", "value": "48327"}, {
  "label": "Midland County, TX",
  "value": "48329"
}, {"label": "Milam County, TX", "value": "48331"}, {
  "label": "Mills County, TX",
  "value": "48333"
}, {"label": "Mitchell County, TX", "value": "48335"}, {
  "label": "Montague County, TX",
  "value": "48337"
}, {"label": "Montgomery County, TX", "value": "48339"}, {
  "label": "Moore County, TX",
  "value": "48341"
}, {"label": "Morris County, TX", "value": "48343"}, {
  "label": "Motley County, TX",
  "value": "48345"
}, {"label": "Nacogdoches County, TX", "value": "48347"}, {
  "label": "Navarro County, TX",
  "value": "48349"
}, {"label": "Newton County, TX", "value": "48351"}, {
  "label": "Nolan County, TX",
  "value": "48353"
}, {"label": "Nueces County, TX", "value": "48355"}, {
  "label": "Ochiltree County, TX",
  "value": "48357"
}, {"label": "Oldham County, TX", "value": "48359"}, {
  "label": "Orange County, TX",
  "value": "48361"
}, {"label": "Palo Pinto County, TX", "value": "48363"}, {
  "label": "Panola County, TX",
  "value": "48365"
}, {"label": "Parker County, TX", "value": "48367"}, {
  "label": "Parmer County, TX",
  "value": "48369"
}, {"label": "Pecos County, TX", "value": "48371"}, {
  "label": "Polk County, TX",
  "value": "48373"
}, {"label": "Potter County, TX", "value": "48375"}, {
  "label": "Presidio County, TX",
  "value": "48377"
}, {"label": "Rains County, TX", "value": "48379"}, {
  "label": "Randall County, TX",
  "value": "48381"
}, {"label": "Reagan County, TX", "value": "48383"}, {
  "label": "Real County, TX",
  "value": "48385"
}, {"label": "Red River County, TX", "value": "48387"}, {
  "label": "Reeves County, TX",
  "value": "48389"
}, {"label": "Refugio County, TX", "value": "48391"}, {
  "label": "Roberts County, TX",
  "value": "48393"
}, {"label": "Robertson County, TX", "value": "48395"}, {
  "label": "Rockwall County, TX",
  "value": "48397"
}, {"label": "Runnels County, TX", "value": "48399"}, {
  "label": "Rusk County, TX",
  "value": "48401"
}, {"label": "Sabine County, TX", "value": "48403"}, {
  "label": "San Augustine County, TX",
  "value": "48405"
}, {"label": "San Jacinto County, TX", "value": "48407"}, {
  "label": "San Patricio County, TX",
  "value": "48409"
}, {"label": "San Saba County, TX", "value": "48411"}, {
  "label": "Schleicher County, TX",
  "value": "48413"
}, {"label": "Scurry County, TX", "value": "48415"}, {
  "label": "Shackelford County, TX",
  "value": "48417"
}, {"label": "Shelby County, TX", "value": "48419"}, {
  "label": "Sherman County, TX",
  "value": "48421"
}, {"label": "Smith County, TX", "value": "48423"}, {
  "label": "Somervell County, TX",
  "value": "48425"
}, {"label": "Starr County, TX", "value": "48427"}, {
  "label": "Stephens County, TX",
  "value": "48429"
}, {"label": "Sterling County, TX", "value": "48431"}, {
  "label": "Stonewall County, TX",
  "value": "48433"
}, {"label": "Sutton County, TX", "value": "48435"}, {
  "label": "Swisher County, TX",
  "value": "48437"
}, {"label": "Tarrant County, TX", "value": "48439"}, {
  "label": "Taylor County, TX",
  "value": "48441"
}, {"label": "Terrell County, TX", "value": "48443"}, {
  "label": "Terry County, TX",
  "value": "48445"
}, {"label": "Throckmorton County, TX", "value": "48447"}, {
  "label": "Titus County, TX",
  "value": "48449"
}, {"label": "Tom Green County, TX", "value": "48451"}, {
  "label": "Travis County, TX",
  "value": "48453"
}, {"label": "Trinity County, TX", "value": "48455"}, {
  "label": "Tyler County, TX",
  "value": "48457"
}, {"label": "Upshur County, TX", "value": "48459"}, {
  "label": "Upton County, TX",
  "value": "48461"
}, {"label": "Uvalde County, TX", "value": "48463"}, {
  "label": "Val Verde County, TX",
  "value": "48465"
}, {"label": "Van Zandt County, TX", "value": "48467"}, {
  "label": "Victoria County, TX",
  "value": "48469"
}, {"label": "Walker County, TX", "value": "48471"}, {
  "label": "Waller County, TX",
  "value": "48473"
}, {"label": "Ward County, TX", "value": "48475"}, {
  "label": "Washington County, TX",
  "value": "48477"
}, {"label": "Webb County, TX", "value": "48479"}, {
  "label": "Wharton County, TX",
  "value": "48481"
}, {"label": "Wheeler County, TX", "value": "48483"}, {
  "label": "Wichita County, TX",
  "value": "48485"
}, {"label": "Wilbarger County, TX", "value": "48487"}, {
  "label": "Willacy County, TX",
  "value": "48489"
}, {"label": "Williamson County, TX", "value": "48491"}, {
  "label": "Wilson County, TX",
  "value": "48493"
}, {"label": "Winkler County, TX", "value": "48495"}, {
  "label": "Wise County, TX",
  "value": "48497"
}, {"label": "Wood County, TX", "value": "48499"}, {
  "label": "Yoakum County, TX",
  "value": "48501"
}, {"label": "Young County, TX", "value": "48503"}, {
  "label": "Zapata County, TX",
  "value": "48505"
}, {"label": "Zavala County, TX", "value": "48507"}, {
  "label": "Beaver County, UT",
  "value": "49001"
}, {"label": "Box Elder County, UT", "value": "49003"}, {
  "label": "Cache County, UT",
  "value": "49005"
}, {"label": "Carbon County, UT", "value": "49007"}, {
  "label": "Daggett County, UT",
  "value": "49009"
}, {"label": "Davis County, UT", "value": "49011"}, {
  "label": "Duchesne County, UT",
  "value": "49013"
}, {"label": "Emery County, UT", "value": "49015"}, {
  "label": "Garfield County, UT",
  "value": "49017"
}, {"label": "Grand County, UT", "value": "49019"}, {
  "label": "Iron County, UT",
  "value": "49021"
}, {"label": "Juab County, UT", "value": "49023"}, {
  "label": "Kane County, UT",
  "value": "49025"
}, {"label": "Millard County, UT", "value": "49027"}, {
  "label": "Morgan County, UT",
  "value": "49029"
}, {"label": "Piute County, UT", "value": "49031"}, {
  "label": "Rich County, UT",
  "value": "49033"
}, {"label": "Salt Lake County, UT", "value": "49035"}, {
  "label": "San Juan County, UT",
  "value": "49037"
}, {"label": "Sanpete County, UT", "value": "49039"}, {
  "label": "Sevier County, UT",
  "value": "49041"
}, {"label": "Summit County, UT", "value": "49043"}, {
  "label": "Tooele County, UT",
  "value": "49045"
}, {"label": "Uintah County, UT", "value": "49047"}, {
  "label": "Utah County, UT",
  "value": "49049"
}, {"label": "Wasatch County, UT", "value": "49051"}, {
  "label": "Washington County, UT",
  "value": "49053"
}, {"label": "Wayne County, UT", "value": "49055"}, {
  "label": "Weber County, UT",
  "value": "49057"
}, {"label": "Addison County, VT", "value": "50001"}, {
  "label": "Bennington County, VT",
  "value": "50003"
}, {"label": "Caledonia County, VT", "value": "50005"}, {
  "label": "Chittenden County, VT",
  "value": "50007"
}, {"label": "Essex County, VT", "value": "50009"}, {
  "label": "Franklin County, VT",
  "value": "50011"
}, {"label": "Grand Isle County, VT", "value": "50013"}, {
  "label": "Lamoille County, VT",
  "value": "50015"
}, {"label": "Orange County, VT", "value": "50017"}, {
  "label": "Orleans County, VT",
  "value": "50019"
}, {"label": "Rutland County, VT", "value": "50021"}, {
  "label": "Washington County, VT",
  "value": "50023"
}, {"label": "Windham County, VT", "value": "50025"}, {
  "label": "Windsor County, VT",
  "value": "50027"
}, {"label": "Accomack County, VA", "value": "51001"}, {
  "label": "Albemarle County, VA",
  "value": "51003"
}, {"label": "Alleghany County, VA", "value": "51005"}, {
  "label": "Amelia County, VA",
  "value": "51007"
}, {"label": "Amherst County, VA", "value": "51009"}, {
  "label": "Appomattox County, VA",
  "value": "51011"
}, {"label": "Arlington County, VA", "value": "51013"}, {
  "label": "Augusta County, VA",
  "value": "51015"
}, {"label": "Bath County, VA", "value": "51017"}, {
  "label": "Bedford County, VA",
  "value": "51019"
}, {"label": "Bland County, VA", "value": "51021"}, {
  "label": "Botetourt County, VA",
  "value": "51023"
}, {"label": "Brunswick County, VA", "value": "51025"}, {
  "label": "Buchanan County, VA",
  "value": "51027"
}, {"label": "Buckingham County, VA", "value": "51029"}, {
  "label": "Campbell County, VA",
  "value": "51031"
}, {"label": "Caroline County, VA", "value": "51033"}, {
  "label": "Carroll County, VA",
  "value": "51035"
}, {"label": "Charles City County, VA", "value": "51036"}, {
  "label": "Charlotte County, VA",
  "value": "51037"
}, {"label": "Chesterfield County, VA", "value": "51041"}, {
  "label": "Clarke County, VA",
  "value": "51043"
}, {"label": "Craig County, VA", "value": "51045"}, {
  "label": "Culpeper County, VA",
  "value": "51047"
}, {"label": "Cumberland County, VA", "value": "51049"}, {
  "label": "Dickenson County, VA",
  "value": "51051"
}, {"label": "Dinwiddie County, VA", "value": "51053"}, {
  "label": "Essex County, VA",
  "value": "51057"
}, {"label": "Fairfax County, VA", "value": "51059"}, {
  "label": "Fauquier County, VA",
  "value": "51061"
}, {"label": "Floyd County, VA", "value": "51063"}, {
  "label": "Fluvanna County, VA",
  "value": "51065"
}, {"label": "Franklin County, VA", "value": "51067"}, {
  "label": "Frederick County, VA",
  "value": "51069"
}, {"label": "Giles County, VA", "value": "51071"}, {
  "label": "Gloucester County, VA",
  "value": "51073"
}, {"label": "Goochland County, VA", "value": "51075"}, {
  "label": "Grayson County, VA",
  "value": "51077"
}, {"label": "Greene County, VA", "value": "51079"}, {
  "label": "Greensville County, VA",
  "value": "51081"
}, {"label": "Halifax County, VA", "value": "51083"}, {
  "label": "Hanover County, VA",
  "value": "51085"
}, {"label": "Henrico County, VA", "value": "51087"}, {
  "label": "Henry County, VA",
  "value": "51089"
}, {"label": "Highland County, VA", "value": "51091"}, {
  "label": "Isle of Wight County, VA",
  "value": "51093"
}, {"label": "James City County, VA", "value": "51095"}, {
  "label": "King and Queen County, VA",
  "value": "51097"
}, {"label": "King George County, VA", "value": "51099"}, {
  "label": "King William County, VA",
  "value": "51101"
}, {"label": "Lancaster County, VA", "value": "51103"}, {
  "label": "Lee County, VA",
  "value": "51105"
}, {"label": "Loudoun County, VA", "value": "51107"}, {
  "label": "Louisa County, VA",
  "value": "51109"
}, {"label": "Lunenburg County, VA", "value": "51111"}, {
  "label": "Madison County, VA",
  "value": "51113"
}, {"label": "Mathews County, VA", "value": "51115"}, {
  "label": "Mecklenburg County, VA",
  "value": "51117"
}, {"label": "Middlesex County, VA", "value": "51119"}, {
  "label": "Montgomery County, VA",
  "value": "51121"
}, {"label": "Nelson County, VA", "value": "51125"}, {
  "label": "New Kent County, VA",
  "value": "51127"
}, {"label": "Northampton County, VA", "value": "51131"}, {
  "label": "Northumberland County, VA",
  "value": "51133"
}, {"label": "Nottoway County, VA", "value": "51135"}, {
  "label": "Orange County, VA",
  "value": "51137"
}, {"label": "Page County, VA", "value": "51139"}, {
  "label": "Patrick County, VA",
  "value": "51141"
}, {"label": "Pittsylvania County, VA", "value": "51143"}, {
  "label": "Powhatan County, VA",
  "value": "51145"
}, {"label": "Prince Edward County, VA", "value": "51147"}, {
  "label": "Prince George County, VA",
  "value": "51149"
}, {"label": "Prince William County, VA", "value": "51153"}, {
  "label": "Pulaski County, VA",
  "value": "51155"
}, {"label": "Rappahannock County, VA", "value": "51157"}, {
  "label": "Richmond County, VA",
  "value": "51159"
}, {"label": "Roanoke County, VA", "value": "51161"}, {
  "label": "Rockbridge County, VA",
  "value": "51163"
}, {"label": "Rockingham County, VA", "value": "51165"}, {
  "label": "Russell County, VA",
  "value": "51167"
}, {"label": "Scott County, VA", "value": "51169"}, {
  "label": "Shenandoah County, VA",
  "value": "51171"
}, {"label": "Smyth County, VA", "value": "51173"}, {
  "label": "Southampton County, VA",
  "value": "51175"
}, {"label": "Spotsylvania County, VA", "value": "51177"}, {
  "label": "Stafford County, VA",
  "value": "51179"
}, {"label": "Surry County, VA", "value": "51181"}, {
  "label": "Sussex County, VA",
  "value": "51183"
}, {"label": "Tazewell County, VA", "value": "51185"}, {
  "label": "Warren County, VA",
  "value": "51187"
}, {"label": "Washington County, VA", "value": "51191"}, {
  "label": "Westmoreland County, VA",
  "value": "51193"
}, {"label": "Wise County, VA", "value": "51195"}, {
  "label": "Wythe County, VA",
  "value": "51197"
}, {"label": "York County, VA", "value": "51199"}, {
  "label": "Alexandria city, VA",
  "value": "51510"
}, {"label": "Bedford city, VA", "value": "51515"}, {
  "label": "Bristol city, VA",
  "value": "51520"
}, {"label": "Buena Vista city, VA", "value": "51530"}, {
  "label": "Charlottesville city, VA",
  "value": "51540"
}, {"label": "Chesapeake city, VA", "value": "51550"}, {
  "label": "Colonial Heights city, VA",
  "value": "51570"
}, {"label": "Covington city, VA", "value": "51580"}, {
  "label": "Danville city, VA",
  "value": "51590"
}, {"label": "Emporia city, VA", "value": "51595"}, {
  "label": "Fairfax city, VA",
  "value": "51600"
}, {"label": "Falls Church city, VA", "value": "51610"}, {
  "label": "Franklin city, VA",
  "value": "51620"
}, {"label": "Fredericksburg city, VA", "value": "51630"}, {
  "label": "Galax city, VA",
  "value": "51640"
}, {"label": "Hampton city, VA", "value": "51650"}, {
  "label": "Harrisonburg city, VA",
  "value": "51660"
}, {"label": "Hopewell city, VA", "value": "51670"}, {
  "label": "Lexington city, VA",
  "value": "51678"
}, {"label": "Lynchburg city, VA", "value": "51680"}, {
  "label": "Manassas city, VA",
  "value": "51683"
}, {"label": "Manassas Park city, VA", "value": "51685"}, {
  "label": "Martinsville city, VA",
  "value": "51690"
}, {"label": "Newport News city, VA", "value": "51700"}, {
  "label": "Norfolk city, VA",
  "value": "51710"
}, {"label": "Norton city, VA", "value": "51720"}, {
  "label": "Petersburg city, VA",
  "value": "51730"
}, {"label": "Poquoson city, VA", "value": "51735"}, {
  "label": "Portsmouth city, VA",
  "value": "51740"
}, {"label": "Radford city, VA", "value": "51750"}, {
  "label": "Richmond city, VA",
  "value": "51760"
}, {"label": "Roanoke city, VA", "value": "51770"}, {
  "label": "Salem city, VA",
  "value": "51775"
}, {"label": "Staunton city, VA", "value": "51790"}, {
  "label": "Suffolk city, VA",
  "value": "51800"
}, {"label": "Virginia Beach city, VA", "value": "51810"}, {
  "label": "Waynesboro city, VA",
  "value": "51820"
}, {"label": "Williamsburg city, VA", "value": "51830"}, {
  "label": "Winchester city, VA",
  "value": "51840"
}, {"label": "Adams County, WA", "value": "53001"}, {
  "label": "Asotin County, WA",
  "value": "53003"
}, {"label": "Benton County, WA", "value": "53005"}, {
  "label": "Chelan County, WA",
  "value": "53007"
}, {"label": "Clallam County, WA", "value": "53009"}, {
  "label": "Clark County, WA",
  "value": "53011"
}, {"label": "Columbia County, WA", "value": "53013"}, {
  "label": "Cowlitz County, WA",
  "value": "53015"
}, {"label": "Douglas County, WA", "value": "53017"}, {
  "label": "Ferry County, WA",
  "value": "53019"
}, {"label": "Franklin County, WA", "value": "53021"}, {
  "label": "Garfield County, WA",
  "value": "53023"
}, {"label": "Grant County, WA", "value": "53025"}, {
  "label": "Grays Harbor County, WA",
  "value": "53027"
}, {"label": "Island County, WA", "value": "53029"}, {
  "label": "Jefferson County, WA",
  "value": "53031"
}, {"label": "King County, WA", "value": "53033"}, {
  "label": "Kitsap County, WA",
  "value": "53035"
}, {"label": "Kittitas County, WA", "value": "53037"}, {
  "label": "Klickitat County, WA",
  "value": "53039"
}, {"label": "Lewis County, WA", "value": "53041"}, {
  "label": "Lincoln County, WA",
  "value": "53043"
}, {"label": "Mason County, WA", "value": "53045"}, {
  "label": "Okanogan County, WA",
  "value": "53047"
}, {"label": "Pacific County, WA", "value": "53049"}, {
  "label": "Pend Oreille County, WA",
  "value": "53051"
}, {"label": "Pierce County, WA", "value": "53053"}, {
  "label": "San Juan County, WA",
  "value": "53055"
}, {"label": "Skagit County, WA", "value": "53057"}, {
  "label": "Skamania County, WA",
  "value": "53059"
}, {"label": "Snohomish County, WA", "value": "53061"}, {
  "label": "Spokane County, WA",
  "value": "53063"
}, {"label": "Stevens County, WA", "value": "53065"}, {
  "label": "Thurston County, WA",
  "value": "53067"
}, {"label": "Wahkiakum County, WA", "value": "53069"}, {
  "label": "Walla Walla County, WA",
  "value": "53071"
}, {"label": "Whatcom County, WA", "value": "53073"}, {
  "label": "Whitman County, WA",
  "value": "53075"
}, {"label": "Yakima County, WA", "value": "53077"}, {
  "label": "Barbour County, WV",
  "value": "54001"
}, {"label": "Berkeley County, WV", "value": "54003"}, {
  "label": "Boone County, WV",
  "value": "54005"
}, {"label": "Braxton County, WV", "value": "54007"}, {
  "label": "Brooke County, WV",
  "value": "54009"
}, {"label": "Cabell County, WV", "value": "54011"}, {
  "label": "Calhoun County, WV",
  "value": "54013"
}, {"label": "Clay County, WV", "value": "54015"}, {
  "label": "Doddridge County, WV",
  "value": "54017"
}, {"label": "Fayette County, WV", "value": "54019"}, {
  "label": "Gilmer County, WV",
  "value": "54021"
}, {"label": "Grant County, WV", "value": "54023"}, {
  "label": "Greenbrier County, WV",
  "value": "54025"
}, {"label": "Hampshire County, WV", "value": "54027"}, {
  "label": "Hancock County, WV",
  "value": "54029"
}, {"label": "Hardy County, WV", "value": "54031"}, {
  "label": "Harrison County, WV",
  "value": "54033"
}, {"label": "Jackson County, WV", "value": "54035"}, {
  "label": "Jefferson County, WV",
  "value": "54037"
}, {"label": "Kanawha County, WV", "value": "54039"}, {
  "label": "Lewis County, WV",
  "value": "54041"
}, {"label": "Lincoln County, WV", "value": "54043"}, {
  "label": "Logan County, WV",
  "value": "54045"
}, {"label": "McDowell County, WV", "value": "54047"}, {
  "label": "Marion County, WV",
  "value": "54049"
}, {"label": "Marshall County, WV", "value": "54051"}, {
  "label": "Mason County, WV",
  "value": "54053"
}, {"label": "Mercer County, WV", "value": "54055"}, {
  "label": "Mineral County, WV",
  "value": "54057"
}, {"label": "Mingo County, WV", "value": "54059"}, {
  "label": "Monongalia County, WV",
  "value": "54061"
}, {"label": "Monroe County, WV", "value": "54063"}, {
  "label": "Morgan County, WV",
  "value": "54065"
}, {"label": "Nicholas County, WV", "value": "54067"}, {
  "label": "Ohio County, WV",
  "value": "54069"
}, {"label": "Pendleton County, WV", "value": "54071"}, {
  "label": "Pleasants County, WV",
  "value": "54073"
}, {"label": "Pocahontas County, WV", "value": "54075"}, {
  "label": "Preston County, WV",
  "value": "54077"
}, {"label": "Putnam County, WV", "value": "54079"}, {
  "label": "Raleigh County, WV",
  "value": "54081"
}, {"label": "Randolph County, WV", "value": "54083"}, {
  "label": "Ritchie County, WV",
  "value": "54085"
}, {"label": "Roane County, WV", "value": "54087"}, {
  "label": "Summers County, WV",
  "value": "54089"
}, {"label": "Taylor County, WV", "value": "54091"}, {
  "label": "Tucker County, WV",
  "value": "54093"
}, {"label": "Tyler County, WV", "value": "54095"}, {
  "label": "Upshur County, WV",
  "value": "54097"
}, {"label": "Wayne County, WV", "value": "54099"}, {
  "label": "Webster County, WV",
  "value": "54101"
}, {"label": "Wetzel County, WV", "value": "54103"}, {
  "label": "Wirt County, WV",
  "value": "54105"
}, {"label": "Wood County, WV", "value": "54107"}, {
  "label": "Wyoming County, WV",
  "value": "54109"
}, {"label": "Adams County, WI", "value": "55001"}, {
  "label": "Ashland County, WI",
  "value": "55003"
}, {"label": "Barron County, WI", "value": "55005"}, {
  "label": "Bayfield County, WI",
  "value": "55007"
}, {"label": "Brown County, WI", "value": "55009"}, {
  "label": "Buffalo County, WI",
  "value": "55011"
}, {"label": "Burnett County, WI", "value": "55013"}, {
  "label": "Calumet County, WI",
  "value": "55015"
}, {"label": "Chippewa County, WI", "value": "55017"}, {
  "label": "Clark County, WI",
  "value": "55019"
}, {"label": "Columbia County, WI", "value": "55021"}, {
  "label": "Crawford County, WI",
  "value": "55023"
}, {"label": "Dane County, WI", "value": "55025"}, {
  "label": "Dodge County, WI",
  "value": "55027"
}, {"label": "Door County, WI", "value": "55029"}, {
  "label": "Douglas County, WI",
  "value": "55031"
}, {"label": "Dunn County, WI", "value": "55033"}, {
  "label": "Eau Claire County, WI",
  "value": "55035"
}, {"label": "Florence County, WI", "value": "55037"}, {
  "label": "Fond du Lac County, WI",
  "value": "55039"
}, {"label": "Forest County, WI", "value": "55041"}, {
  "label": "Grant County, WI",
  "value": "55043"
}, {"label": "Green County, WI", "value": "55045"}, {
  "label": "Green Lake County, WI",
  "value": "55047"
}, {"label": "Iowa County, WI", "value": "55049"}, {
  "label": "Iron County, WI",
  "value": "55051"
}, {"label": "Jackson County, WI", "value": "55053"}, {
  "label": "Jefferson County, WI",
  "value": "55055"
}, {"label": "Juneau County, WI", "value": "55057"}, {
  "label": "Kenosha County, WI",
  "value": "55059"
}, {"label": "Kewaunee County, WI", "value": "55061"}, {
  "label": "La Crosse County, WI",
  "value": "55063"
}, {"label": "Lafayette County, WI", "value": "55065"}, {
  "label": "Langlade County, WI",
  "value": "55067"
}, {"label": "Lincoln County, WI", "value": "55069"}, {
  "label": "Manitowoc County, WI",
  "value": "55071"
}, {"label": "Marathon County, WI", "value": "55073"}, {
  "label": "Marinette County, WI",
  "value": "55075"
}, {"label": "Marquette County, WI", "value": "55077"}, {
  "label": "Menominee County, WI",
  "value": "55078"
}, {"label": "Milwaukee County, WI", "value": "55079"}, {
  "label": "Monroe County, WI",
  "value": "55081"
}, {"label": "Oconto County, WI", "value": "55083"}, {
  "label": "Oneida County, WI",
  "value": "55085"
}, {"label": "Outagamie County, WI", "value": "55087"}, {
  "label": "Ozaukee County, WI",
  "value": "55089"
}, {"label": "Pepin County, WI", "value": "55091"}, {
  "label": "Pierce County, WI",
  "value": "55093"
}, {"label": "Polk County, WI", "value": "55095"}, {
  "label": "Portage County, WI",
  "value": "55097"
}, {"label": "Price County, WI", "value": "55099"}, {
  "label": "Racine County, WI",
  "value": "55101"
}, {"label": "Richland County, WI", "value": "55103"}, {
  "label": "Rock County, WI",
  "value": "55105"
}, {"label": "Rusk County, WI", "value": "55107"}, {
  "label": "St. Croix County, WI",
  "value": "55109"
}, {"label": "Sauk County, WI", "value": "55111"}, {
  "label": "Sawyer County, WI",
  "value": "55113"
}, {"label": "Shawano County, WI", "value": "55115"}, {
  "label": "Sheboygan County, WI",
  "value": "55117"
}, {"label": "Taylor County, WI", "value": "55119"}, {
  "label": "Trempealeau County, WI",
  "value": "55121"
}, {"label": "Vernon County, WI", "value": "55123"}, {
  "label": "Vilas County, WI",
  "value": "55125"
}, {"label": "Walworth County, WI", "value": "55127"}, {
  "label": "Washburn County, WI",
  "value": "55129"
}, {"label": "Washington County, WI", "value": "55131"}, {
  "label": "Waukesha County, WI",
  "value": "55133"
}, {"label": "Waupaca County, WI", "value": "55135"}, {
  "label": "Waushara County, WI",
  "value": "55137"
}, {"label": "Winnebago County, WI", "value": "55139"}, {
  "label": "Wood County, WI",
  "value": "55141"
}, {"label": "Albany County, WY", "value": "56001"}, {
  "label": "Big Horn County, WY",
  "value": "56003"
}, {"label": "Campbell County, WY", "value": "56005"}, {
  "label": "Carbon County, WY",
  "value": "56007"
}, {"label": "Converse County, WY", "value": "56009"}, {
  "label": "Crook County, WY",
  "value": "56011"
}, {"label": "Fremont County, WY", "value": "56013"}, {
  "label": "Goshen County, WY",
  "value": "56015"
}, {"label": "Hot Springs County, WY", "value": "56017"}, {
  "label": "Johnson County, WY",
  "value": "56019"
}, {"label": "Laramie County, WY", "value": "56021"}, {
  "label": "Lincoln County, WY",
  "value": "56023"
}, {"label": "Natrona County, WY", "value": "56025"}, {
  "label": "Niobrara County, WY",
  "value": "56027"
}, {"label": "Park County, WY", "value": "56029"}, {
  "label": "Platte County, WY",
  "value": "56031"
}, {"label": "Sheridan County, WY", "value": "56033"}, {
  "label": "Sublette County, WY",
  "value": "56035"
}, {"label": "Sweetwater County, WY", "value": "56037"}, {
  "label": "Teton County, WY",
  "value": "56039"
}, {"label": "Uinta County, WY", "value": "56041"}, {
  "label": "Washakie County, WY",
  "value": "56043"
}, {"label": "Weston County, WY", "value": "56045"}];

