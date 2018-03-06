var cwg = null;
var precipChart = null;
var derivedChart = null;

function populate_variables(frequency) {
    var variables = climate_widget.variables(frequency);
    $("select#variable").empty();
    $(variables.map(function (v) {
        return ('<option value="' + v.id + '"' + '>' + v.title + '</option>');
    }).join("")).appendTo($("select#variable"));
}
populate_variables('annual');

function update_frequency_ui() {
    var freq = $('#frequency').val();
    if (freq === "annual") {
        $('#timeperiod').attr("disabled", "true");
        $('label[for=timeperiod]').css("opacity", 0.5);
        $('#presentation').removeAttr("disabled");
        $('label[for=presentation]').css("opacity", 1.0);
        $('#slider-range').show();
        $('#x-axis-pan-note').hide();
    }
    if (freq === "monthly") {
        $('#timeperiod').removeAttr("disabled");
        $('label[for=timeperiod]').css("opacity", 1.0);
        $('#presentation').attr("disabled", "true");
        $('label[for=presentation]').css("opacity", 0.5);
        //$('#slider-range').hide();
        $('#x-axis-pan-note').show();
    }
    if (freq === "seasonal") {
        $('#timeperiod').removeAttr("disabled");
        $('label[for=timeperiod]').css("opacity", 1.0);
        $('#presentation').attr("disabled", "true");
        $('label[for=presentation]').css("opacity", 0.5);
        //$('#slider-range').hide();
        $('#x-axis-pan-note').show();
    }
    //populate_variables(freq);
}
update_frequency_ui();

$('#frequency').change(function () {
    update_frequency_ui();
    var id = $('#frequency').val();
    if (id !== 'annual') {
        $('#historical-range, #under-baseline-range, #over-baseline-range').hide();
        $('#temperature-chart .legend-item-line.observed').addClass('seasonal');
        if (!$('#historical-obs').hasClass('selected')) {
            $('#historical-obs').trigger('click');
        }
        if (!$('#precip-historical-obs').hasClass('selected')) {
            $('#precip-historical-obs').trigger('click');
        }
    } else {
        $('#historical-range, #under-baseline-range, #over-baseline-range').show();
        $('#temperature-chart .legend-item-line.observed').removeClass('seasonal');
    }

    if (id !== 'annual') {
        $("#slider-range").addClass('not-annual').slider('destroy').slider({
            range: false,
            min: 0,
            max: 2,
            value: 0,
            slide: function (event, ui) {
                val = (ui.value === 0) ? '2025' : '2050';
                if (ui.value === 2) {
                    val = '2075';
                }
                cwg.update({timeperiod: val});
            }
        });
        $('#temp-range-low').html('30 Years Centered in 2025');
        $('#temp-range-mid').show().html('30 Years Centered in 2050');
        $('#temp-range-high').html('30 Years Centered in 2075');
    } else {
        sliderisnotannual = $( "#slider-range" ).hasClass( "not-annual" );
        if (sliderisnotannual){
            $("#slider-range").removeClass('not-annual').slider('destroy').slider({
                range: true,
                min: 1950,
                max: 2099,
                values: [1950, 2099],
                slide: function (event, ui) {
                    return cwg.setXRange(ui.values[0], ui.values[1]);
                }
            }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
        }

        $('#temp-range-low').html('1950');
        $('#temp-range-mid').hide();
        $('#temp-range-high').html('2100');
    }

    cwg.update({
        frequency: $('#frequency').val(),
        variable: $('#variable').val()
    });
});

$('#precip-frequency').change(function () {
    update_frequency_ui();
    var id = $('#precip-frequency').val();
    if (id !== 'annual') {
        $('#precip-historical-range, #under-baseline-range, #over-baseline-range').hide();
        $('#precipitation-chart .legend-item-line.observed').addClass('seasonal');
    } else {
        $('#precip-historical-range, #under-baseline-range, #over-baseline-range').show();
        $('#precipitation-chart .legend-item-line.observed').removeClass('seasonal');
    }

    if (id !== 'annual') {
            $("#precip-slider-range").addClass('not-annual').slider('destroy').slider({
                range: false,
                min: 0,
                max: 2,
                value: 0,
                slide: function (event, ui) {
                    val = (ui.value === 0) ? '2025' : '2050';
                    if (ui.value === 2) {
                        val = '2075';
                    }
                    precipChart.update({timeperiod: val});
                }
            });
        $('#precip-range-low').html('30 Years Centered in 2025');
        $('#precip-range-mid').show().html('30 Years Centered in 2050');
        $('#precip-range-high').html('30 Years Centered in 2075');
    } else {
        psliderisnotannual = $( "#precip-slider-range" ).hasClass( "not-annual" );
        if (psliderisnotannual) {

            $("#precip-slider-range").removeClass('not-annual').slider('destroy').slider({
                range: true,
                min: 1950,
                max: 2099,
                values: [1950, 2099],
                slide: function (event, ui) {
                    return precipChart.setXRange(ui.values[0], ui.values[1]);
                }
            }).find(".ui-slider-range").html('<span class="icon icon-arrow-left-right"></span>');
        }
        $('#precip-range-low').html('1950');
        $('#precip-range-mid').hide();
        $('#precip-range-high').html('2100');
    }

    precipChart.update({
        frequency: $('#precip-frequency').val(),
        variable: $('#precip-variable').val()
    });
});

$('#timeperiod').change(function () {
    cwg.update({
        timeperiod: $('#timeperiod').val()
    });
});
$('#county').change(function () {
    cwg.update({
        fips: $('#county').val()
    });
});
$('#variable').change(function () {
    cwg.update({
        variable: $('#variable').val()
    });
});
$('#precip-variable').change(function () {
    console.log("PRECIP CHANGE");
    console.log($('#precip-variable').val());
    precipChart.update({
        variable: $('#precip-variable').val()
    });
});
$('#derived-variable').change(function () {
    derivedChart.update({
        variable: $('#derived-variable').val()
    });
});
$('#scenario').change(function () {
    cwg.update({
        scenario: $('#scenario').val()
    });
});
$('#precip-scenario').change(function () {
    precipChart.update({
        scenario: $('#precip-scenario').val()
    });
});
$('#derived-scenario').change(function () {
    derivedChart.update({
        scenario: $('#derived-scenario').val()
    });
});
$('#presentation').change(function () {
    cwg.update({
        presentation: $('#presentation').val()
    });
});
$('#precip-presentation').change(function () {
    precipChart.update({
        presentation: $('#precip-presentation').val()
    });
});
$('#derived-presentation').change(function () {
    derivedChart.update({
        presentation: $('#derived-presentation').val()
    });
});

$('#median').change(function () {
    cwg.update({
        pmedian: $('#median').val()
    });
});
$('#precip-median').change(function () {
    precipChart.update({
        pmedian: $('#precip-median').val()
    });
});
$('#derived-median').change(function () {
    derivedChart.update({
        pmedian: $('#derived-median').val()
    });
});
$('#hist-mod').change(function () {
    cwg.update({
        histmod: $('#hist-mod').val()
    });
});
$('#precip-hist-mod').change(function () {
    precipChart.update({
        histmod: $('#precip-hist-mod').val()
    });
});
$('#derived-hist-mod').change(function () {
    derivedChart.update({
        histmod: $('#derived-hist-mod').val()
    });
});
$('#hist-obs').change(function () {
    cwg.update({
        histobs: $('#hist-obs').val()
    });
});
$('#precip-hist-obs').change(function () {
    precipChart.update({
        histobs: $('#precip-hist-obs').val()
    });
});
$('#derived-hist-obs').change(function () {
    derivedChart.update({
        histobs: $('#derived-hist-obs').val()
    });
});
$('#range').change(function () {
    cwg.update({
        hrange: $('#range').val(),
        prange: $('#range').val()
    });
});
$('#temperature-data .location-resolution a').on('click', function (e) {
    if ($(this).parent().hasClass('disabled')) {
        return;
    }
    var val = $(this).html().toLowerCase();
    $('#frequency').val(val).change();
});
$('#precipitation-data .location-resolution a').on('click', function (e) {
    if ($(this).parent().hasClass('disabled')) {
        return;
    }
    var val = $(this).html().toLowerCase();
    $('#precip-frequency').val(val).change();
});
$('#temperature-data h4').on('click', function () {
    // removed - duplicate click functions in location.js
    //$('ul.data-options li').removeClass('active accent-border');
    //$(this).closest('li').addClass('active accent-border');

    var val = $(this).children('a');


    $('#temp-chart-name').html(val[0].text);
    $('#temp-map-name').html(val[0].text);

    var id = $(this).attr('id').replace('var-', '');
    $('#frequency').val('annual').change();
    $('#variable').val(id).change();
});
$('#precipitation-data h4').on('click', function () {
    // removed - duplicate click functions in location.js
    //$('ul.data-options li').removeClass('active accent-border');
    //$(this).closest('li').addClass('active accent-border');

    var val = $(this).children('a');


    $('#precip-chart-name').html(val[0].text);
    $('#precip-map-name').html(val[0].text);

    var id = $(this).attr('id').replace('var-', '');
    $('#precip-frequency').val('annual').change();
    $('#precip-variable').val(id).change();
});
$('#derived-data h4').on('click', function () {
    // removed - duplicate click functions in location.js
    //$('ul.data-options li').removeClass('active accent-border');
    //$(this).closest('li').addClass('active accent-border');

    var val = $(this).children('a');


    $('#derived-chart-name').html(val[0].text);
    $('#derived-map-name').html(val[0].text);

    var id = $(this).attr('id').replace('var-', '');
    $('#derived-frequency').val('annual').change();
    $('#derived-variable').val(id).change();
});
$('#temperature-presentation').on('change', function () {
    var val = $(this).val();
    $('#presentation').val(val).change();
});
$('#precipitation-presentation').on('change', function () {
    var val = $(this).val();
    $('#precip-presentation').val(val).change();
});
$('#der-presentation').on('change', function () {
    var val = $(this).val();
    $('#derived-presentation').val(val).change();
});
$('.legend-item-range').on('click', function (e) {
    $(this).toggleClass('selected');
    $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');
    $(this).children('.legend-item-line-container').children('.legend-item-line').toggleClass('selected');

    var pre = $(this).closest('.chart-legend').attr('id');
    if (!pre) {
        pre = '';
    } else {
        pre = pre.replace('-chart', '');
    }

    var scenario = null;
    switch (true) {
        case $('#' + pre + 'rcp85-block').hasClass('selected') && $('#' + pre + 'rcp45-block').hasClass('selected'):
            scenario = 'both';
            break;
        case $('#' + pre + 'rcp45-block').hasClass('selected'):
            scenario = 'rcp45';
            break;
        case $('#' + pre + 'rcp85-block').hasClass('selected'):
            scenario = 'rcp85';
            break;
        default:
            scenario = '';
    }
    if (pre === 'precip') {
        $('#precip-scenario').val(scenario).change();
    } else if (pre === 'derive') {
        $('#derived-scenario').val(scenario).change();
    } else {
        $('#scenario').val(scenario).change();
    }


    var median = null;
    switch (true) {
        case $('#' + pre + 'rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
            median = 'true';
            break;
        case $('#' + pre + 'rcp45-line').hasClass('selected'):
            median = 'true';
            break;
        case $('#' + pre + 'rcp85-line').hasClass('selected'):
            median = 'true';
            break;
        default:
            median = 'false';
    }

    if (pre === 'precip') {
        $('#precip-median').val(median).change();
    } else if (pre === 'derive') {
        $('#derived-median').val(median).change();
    } else {
        $('#median').val(median).change();
    }


    var histmod = null;
    switch (true) {
        case $('#' + pre + 'historical-block').hasClass('selected') && $('#historical-block').hasClass('selected'):
            histmod = 'true';
            break;
        case $('#' + pre + 'historical-block').hasClass('selected'):
            histmod = 'true';
            break;
        default:
            histmod = 'false';
    }

    if (pre === 'precip') {
        $('#precip-hist-mod').val(histmod).change();
    } else if (pre === 'derive') {
        $('#derived-hist-mod').val(histmod).change();
    } else {
        $('#hist-mod').val(histmod).change();
    }


    var histobs = null;
    switch (true) {
        case $('#' + pre + 'over-baseline-block').hasClass('selected') && $('#under-baseline-block').hasClass('selected'):
            histobs = 'true';
            break;
        case $('#' + pre + 'over-baseline-block').hasClass('selected'):
            histobs = 'true';
            break;
        case $('#' + pre + 'under-baseline-block').hasClass('selected'):
            histobs = 'true';
            break;
        default:
            histobs = 'false';
    }

    if (pre === 'precip') {
        $('#precip-hist-obs').val(histobs).change();
    } else if (pre === 'derive') {
        $('#derived-hist-obs').val(histobs).change();
    } else {
        $('#hist-obs').val(histobs).change();
    }

});
$('#temp-download-image').on('click', function (e) {
    $('#download-image-link-temp').get(0).click();
    return false;
});
$('#download-image-precip').on('click', function (e) {
    $('#download-image-link-precip').get(0).click();
    return false;
});
$('#download-image-derived').on('click', function (e) {
    $('#download-image-link-derived').get(0).click();
    return false;
});
$('#temp-download-data').click(function (e) {

    console.log('.download-data clicked');
    $('#download-panel').removeClass("hidden");

    $('#download-panel').show();
    $('#download-panel').fadeIn(250);

});


$('#precip-download-data').click(function (e) {

    precipChart.update({
        variable: $('#precip-variable').val()
    });
    $('#download-precip-panel').removeClass("hidden");
    $('#download-precip-panel').show();
    $('#download-precip-panel').fadeIn(250);

});

$('#derived-download-data').click(function (e) {

    $('#download-derived-panel').removeClass("hidden");
    $('#download-derived-panel').show();
    $('#download-derived-panel').fadeIn(250);

});

$('#download-dismiss-button').click(function () {
    $('#download-panel').fadeOut(250);
});


$('#download-precip-dismiss-button').click(function () {
    $('#download-precip-panel').fadeOut(250);
});


$('#download-derived-dismiss-button').click(function () {
    $('#download-derived-panel').fadeOut(250);
});

$('#download-image-link-temp').click(function () {
    cwg.download_image(this, 'graph.png');
});
$('#download-image-link-precip').click(function () {
    precipChart.download_image(this, 'graph.png');
});
$('#download-image-link-derived').click(function () {
    derivedChart.download_image(this, 'graph.png');
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
$("#precip-slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function (event, ui) {
        // return the return value returned by setXRange, to keep
        // the slider thumb(s) from moving into a disallowed range
        return precipChart.setXRange(ui.values[0], ui.values[1]);
    }
});
$("#derived-slider-range").slider({
    range: true,
    min: 1950,
    max: 2099,
    values: [1950, 2099],
    slide: function (event, ui) {
        // return the return value returned by setXRange, to keep
        // the slider thumb(s) from moving into a disallowed range
        return derivedChart.setXRange(ui.values[0], ui.values[1]);
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


$('#download_precip_hist_obs_data').click(function () {
    if (precipChart) {
        precipChart.download_hist_obs_data(this)
    }
});


$('#download_precip_hist_mod_data').click(function () {
    if (precipChart) {
        precipChart.download_hist_mod_data(this)
    }
});
$('#download_precip_proj_mod_data').click(function () {
    if (precipChart) {
        precipChart.download_proj_mod_data(this)
    }
});


$('#download_derived_hist_mod_data').click(function () {
    if (derivedChart) {
        derivedChart.download_hist_obs_data(this)
    }
});


$('#download_derived_hist_mod_data').click(function () {
    if (derivedChart) {
        derivedChart.download_hist_mod_data(this)
    }
});
$('#download_derived_proj_mod_data').click(function () {
    if (derivedChart) {
        derivedChart.download_proj_mod_data(this)
    }
});

// This function will be called whenever the user changes the x-scale in the graph.
function xrangeset(min, max) {
    // Force the slider thumbs to adjust to the appropriate place

    $("#slider-range").slider("option", "values", [min, max]);
}

function dxrangeset(min, max) {
    $("#derived-slider-range").slider("option", "values", [min, max]);
}

function pxrangeset(min, max) {
    $("#precip-slider-range").slider("option", "values", [min, max]);
}


cwg = climate_widget.graph({
    'div': "div#chart-123",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#frequency').val(),
    'timeperiod': $('#timeperiod').val(),
    'county': $('#county').val(),
    'variable': $('#variable').val(),
    'scenario': $('#scenario').val(),
    'presentation': $('#presentation').val(),
    'pmedian': $('#median').val(),
    'histobs': $('#hist-obs').val(),
    'xrangefunc': xrangeset
});

precipChart = climate_widget.graph({
    'div': "#chart-234",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#precip-frequency').val(),
    'timeperiod': $('#precip-timeperiod').val(),
    'county': $('#precip-county').val(),
    'variable': $('#precip-variable').val(),
    'scenario': $('#precip-scenario').val(),
    'presentation': $('#precip-presentation').val(),
    'pmedian': $('#precip-median').val(),
    'histobs': $('#precip-hist-obs').val(),
    'xrangefunc': pxrangeset
});

derivedChart = climate_widget.graph({
    'div': "#chart-345",
    'dataprefix': '/climate-explorer2-data/data',
    'font': 'Roboto',
    'responsive': true,
    'frequency': $('#derived-frequency').val(),
    'timeperiod': $('#derived-timeperiod').val(),
    'county': $('#derived-county').val(),
    'variable': $('#derived-variable').val(),
    'scenario': $('#derived-scenario').val(),
    'presentation': $('#derived-presentation').val(),
    'pmedian': $('#derived-median').val(),
    'histobs': $('#derived-hist-obs').val(),
    'xrangefunc': dxrangeset
});

setTimeout(function () {
  cwg.resize();
  precipChart.resize();
  derivedChart.resize();
}, 700);

$(window).resize(function () {
  cwg.resize();
});
$(window).resize(function () {
  precipChart.resize();
});
$(window).resize(function () {
  derivedChart.resize();
});


