'use strict';

$(function () {
    // get city, state from state url
    const cityStateCE = window.ce.ce('getLocationPageState')['city'];
    const countyCE = window.ce.ce('getLocationPageState')['county'];
    let isAlaska = false;

    if (cityStateCE) {
        isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0)
    }

    $('#default-city-state').text(cityStateCE);
    $('#default-city-county').text(countyCE);
    $('#cards-search-input').val(cityStateCE);

    if (!cityStateCE) {
        $('#default-in').addClass('d-none');
        $('#default-dash').addClass('d-none');
        $('#cards-search-input').addClass('nosearch');
        $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
    }

    if (cityStateCE) {
        if (isAlaska) {
            $('#default-in').addClass('d-none');
            $('#default-city-county').addClass('d-none');
            $('#download-observed-data').addClass('disabled');
            $('.btn-histobs').addClass('disabled');
            $('.btn-lower-emissions').addClass('disabled');
            $('.btn-monthly').addClass('btn-default-disabled');
        }

        if (cityStateCE.indexOf('County') > 0) {
            $('#default-in').addClass('d-none');
            $('#default-dash').addClass('d-none');
            $('#default-city-county').text('');
        }
    }

    // enable custom selction boxes
    enableCustomSelect('download-select');
    enableCustomSelect('stations-select');
    enableCustomSelect('varriable-select');
    enableCustomSelect('chartmap-select');
    enableCustomSelect('time-select');
    enableCustomSelect('presentation-select');

    // init slider
    initSlider();
    initVarriableToolTips();
    monthlySelectOff();

    // valid monlthly varriables
    // monlthly timeperoid is only valud for limitited varriables
    // to dissable those varriabls from the user we use this constant
    const validMonthly = ['tmax', 'tmin', 'pcpn'];

    $('#clear-location').click(function (e) {
        const target = $(e.target);
        handleClearLocationClick(target);
    });

    // function to enable downloads (images and data)
    $('.download-select li a').click(function (e) {
        const downloadAction = $(this).attr('rel');
        if ( $(this).hasClass( 'disabled' )){
          return null;
        }
        // ga event action, category, label
        googleAnalyticsEvent('click', 'download', downloadAction);

        // capture what we are downloading
        switch (downloadAction) {
            case 'download-image': // download image
                window.cbl_chart.download_image(this);
                break;
            case 'download-observed-data':
                window.cbl_chart.download_hist_obs_data(this);
                break;
            case 'download-historical-modeled-data':
                window.cbl_chart.download_hist_mod_data(this);
                break;
            case 'download-projected-modeled-data':
                window.cbl_chart.download_proj_mod_data(this);
                break;
            case 'download-interpreting':
                break;
            default:
                window.cbl_chart.download_image(this);
        }
    });

    // toggle filters click
    $('#filters-toggle').click(function (e) {
        const target = $(e.target);
        if (target.hasClass('closed-filters')) {
            // ga event action, category, label
            googleAnalyticsEvent('click', 'toggle-filters', 'open');
            target.removeClass('closed-filters');
        } else {
            target.addClass('closed-filters');
            // ga event action, category, label
            googleAnalyticsEvent('click', 'toggle-filters', 'close');
        }

        const infoRowElem = $('#info-row');
        if ($(infoRowElem).hasClass('closed-filters')) {
            $(infoRowElem).removeClass('closed-filters');
        } else {
            $(infoRowElem).addClass('closed-filters');
        }

        const chartRowElem = $('#chart-row');
        if ($(chartRowElem).hasClass('closed-filters')) {
            $(chartRowElem).removeClass('closed-filters');
        } else {
            $(chartRowElem).addClass('closed-filters');
        }

        setTimeout(function () {
            window.cbl_chart.resize();
        }, 600);
    });

    // eanbles time chart, map click events
    $('#chartmap-wrapper').keyup(function (e) {
        if (e.keyCode === 13) {
            const target = $(e.target);

            // toggle button visual state
            toggleButton($(target));

            // change select pulldowns for resposnive mode
            setSelectFromButton(target);

            handleChartMapClick(target);

            // ga event action, category, label
            googleAnalyticsEvent('clickt-tab', 'chartmap', target);
        }
    });

    // eanbles time chart, map click events
    $('#chartmap-wrapper').click(function (e) {
        const target = $(e.target);

        // toggle button visual state
        toggleButton($(target));

        // change select pulldowns for resposnive mode
        setSelectFromButton(target);

        handleChartMapClick(target);

        // ga event action, category, label
        googleAnalyticsEvent('click', 'chartmap', target);
    });

    // eanbles time annual, monlthly click events
    $('#time-wrapper').click(function (e) {
        const target = $(e.target);
        const notDisabled = !target.hasClass('btn-default-disabled');

        // not all varriables can display monthly chart
        // when the varriable cannot display monthly chart do
        // do execute the click event
        if (notDisabled) {
            const val = target.attr('val');

            // toggle button visual state
            toggleButton(target);

            // update chart frequency value
            updateFrequency(val);

            // update chart frequency slider based on timeperiod
            updateFrequencySlider(val);

            // change select pulldowns for resposnive mode
            setSelectFromButton(target);

            // ga event action, category, label
            googleAnalyticsEvent('click', 'update-time', val);
        }
    });

    // eanbles time annual, monlthly click events
    $('#time-wrapper').keyup(function (e) {
        if (e.keyCode === 13) {
            const target = $(e.target);
            const notDisabled = !target.hasClass('btn-default-disabled');

            // not all varriables can display monthly chart
            // when the varriable cannot display monthly chart do
            // do execute the click event
            if (notDisabled) {
                const val = target.attr('val');

                // toggle button visual state
                toggleButton(target);

                // update chart frequency value
                updateFrequency(val);

                // update chart frequency slider based on timeperiod
                updateFrequencySlider(val);

                // change select pulldowns for resposnive mode
                setSelectFromButton(target);

                // ga event action, category, label
                googleAnalyticsEvent('click-tab', 'update-time', val);
            }
        }
    });

    // in repsonsive mode the time is a pulldown this eanbles the change of the chart map
    $('#chartmap-select-vis').bind('cs-changed', function (e) {
        const target = $(e.target);
        const notDisabled = !target.hasClass('btn-default-disabled');
        if (notDisabled) {
            const val = $('#time-select-vis').attr('rel');

            // toggle button visual state
            toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

            handleChartMapClick(target);
        }
    });

    // in repsonsive mode the time is a pulldown this eanbles the change of the timeperiod
    // to update the chart
    $('#time-select-vis').bind('cs-changed', function (e) {
        const target = $(e.target);
        const notDisabled = !target.hasClass('btn-default-disabled');
        if (notDisabled) {
            const val = $('#time-select-vis').attr('rel');

            // toggle button visual state
            toggleButton($(`.btn-${$('#time-select-vis').attr('rel')}`));

            // update chart frequency slider based on timeperiod
            updateFrequency(val);

            // update chart frequency slider based on timeperiod
            updateFrequencySlider(val);
        }
    });

    // adds a click event to turn off chart layers aka what you
    // see on the chart
    $('#legend-wrapper').click(function (e) {
        const target = $(e.target);
        const notDisabled = !target.hasClass('disabled');
        if (notDisabled) {
          // update the chart layers
          updateChartLayers(target);

          // ga event action, category, label
          googleAnalyticsEvent('click', 'legend-wrapper', target);
        }
    });

    // adds a click event to turn off chart layers aka what you
    // see on the chart
    $('#legend-wrapper').keyup(function (e) {
        if (e.keyCode === 13) {
            const target = $(e.target);
            const notDisabled = !target.hasClass('disabled');
            if (notDisabled) {
              // update the chart layers
              updateChartLayers(target);

              // ga event action, category, label
              googleAnalyticsEvent('click-tab', 'legend-wrapper', target);            
            }
        }
    });

    // adds a click event to change the presentation the chart
    // from actual to anomaly
    $('#presentation-wrapper').click(function (e) {
        const target = $(e.target);
        const val = target.attr('val');

        // toggle button visual state
        toggleButton(target);

        // updates the chart for actual to anomaly
        updatePresentation(val);

        // updates the select pulldown for repsonsive mode
        setSelectFromButton(target);

        // ga event action, category, label
        googleAnalyticsEvent('click', 'presentation', val);
    });

    // in repsonsive mode the presentation is a pulldown this eanbles the change of the presentation
    // to update the chart
    $('#presentation-select-vis').bind('cs-changed', function (e) {
        const val = $('#presentation-select-vis').attr('rel');

        // toggle button visual state
        toggleButton($(`.btn-${$('#presentation-select-vis').attr('rel')}`));

        // updates the button for when leaving repsonsive mode (small screen)
        updatePresentation(val)
    });

    // adds time perioid click
    $('#monthly-select-wrapper').click(function (e) {
        const target = $(e.target);
        const val = target.attr('val');

        // toggle button visual state
        toggleButton(target);

        // change time period
        updateTimePeriod(val);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'monthly-select-wrapper', val);
    });

    // binds update of chart varriable to change of selector
    $('#varriable-select-vis').bind('cs-changed', function (e) {
        const variable = $('#varriable-select-vis').attr('rel');
        // update the chart based on char varriable
        window.cbl_chart.set_options({
            variable
        });

        window.ce.ce('setVariablesMapState', {variable});

        // update the text
        updateTitle($('#varriable-select-vis').text());

        // disable varriablles if they are valid time period
        const isvalid = jQuery.inArray(variable, validMonthly);
        if (isvalid < 0) {
            $('[val="monthly"]').addClass('btn-default-disabled');
            $('[val="monthly"]').removeClass('btn-default')
        } else {
            $('[val="monthly"]').removeClass('btn-default-disabled');
            $('[val="monthly"]').addClass('btn-default')
        }
    });

    // this function changes chart layers based on what the user
    // clicks on
    function updateChartLayers(target) {
        target.toggleClass('selected');
        const allItems = $(target).parent().children();

        // map all buttons and get the val from html val attribute
        const valid = allItems.map(function () {
            const elAttribute = $(this).attr('val');
            var obj = Object.assign({}, this);
            obj[elAttribute] = $(this).hasClass('selected');
            return obj;
        });

        // flatten the array
        var merged = Object.assign.apply(Object, valid);
        let scenario = true;

        // check scenarios

        // both rcp45 & rcp85
        if (merged.rcp45 && merged.rcp85) {
            scenario = 'both';
        }

        // rcp45
        if (merged.rcp45 && !merged.rcp85) {
            scenario = 'rcp45';
        }

        // rcp86
        if (!merged.rcp45 && merged.rcp85) {
            scenario = 'rcp85';
        }

        // Neihter rcp45 & rcp85
        if (!merged.rcp45 && !merged.rcp85) {
            scenario = '';
        }

        // set historical
        const histmod = merged.hist_mod;
        const histobs = merged.histobs;

        // ga event action, category, label
        googleAnalyticsEvent('change', 'chart', scenario + '-' + histmod + '-' + histobs);

        // update chart
        window.cbl_chart.set_options({
            scenario,
            histmod,
            histobs
        });
    }

    // this function forces a map legend button to be selcted css class
    function forceSlected(selector) {
        $(selector).addClass('selected');
    }

    // this function firce a map legend to be "un selected" css class
    function forceUnSlected(selector) {
        $(selector).removeClass('selected');
    }

    // this function Updates the chart title.
    function updateTitle(chartText) {
        $('#default-chart-map-varriable').html(chartText);
    }

    // this function dissables varriables when monthly period is selected
    function validVarrablesDisable() {
        $('#varriable-select-wrapper .default-select-option').each(function () {
            const attribute = $(this).attr('rel');
            const isvalid = jQuery.inArray(attribute, validMonthly);
            if (isvalid < 0) {
                $(this).addClass('default-select-option-disabled');
                $(this).removeClass('default-select-option');
            }
        })
    }

    // this function enables varriables when annual period is selected
    function validVarrablesEnable() {
        $('#varriable-select-wrapper .default-select-option-disabled').each(function () {
            const attribute = $(this).attr('rel');
            $(this).removeClass('default-select-option-disabled');
            $(this).addClass('default-select-option');
        })
    }

    // update slider dispaly
    // monthly uses choice buttons
    // anuall uses slider of years 1950-2099
    function updateFrequencySlider(targetval) {
        switch (targetval) {
            case 'annual':
                annualSliderOn();
                monthlySelectOff();
                validVarrablesEnable();
                break;
            case 'monthly':
                monthlySelectOn();
                annualSliderOff();
                validVarrablesDisable();
                break;
            default:
                annualSliderOn();
                monthlySelectOff();
                validVarrablesEnable();
        }
    }

    // this function changes the frequency for the charts
    function updateFrequency(targetval) {
        window.cbl_chart.set_options({
            frequency: targetval,
            variable: $('#varriable-select-vis').attr('rel'),
            histobs: true,
        });
        forceSlected('.btn-histobs');
    }

    // this function changes the presentation (anomaly,actual) for the charts
    function updatePresentation(targetval) {
        window.cbl_chart.set_options({
            presentation: targetval
        });
    }

    // this function changes the time period for monthly chart centered on 2025, 2050, 2075
    function updateTimePeriod(targetval) {
        // ga event action, category, label
        googleAnalyticsEvent('change', 'chart-time-period', targetval);

        window.cbl_chart.set_options({
            timeperiod: targetval
        });
    }


    // This function will be called whenever the user changes the x-scale in the graph.
    function xrangesetmon() {
        // Force the slider thumbs to adjust to the appropriate place
        $("#slider-range").slider("option", "values", [0, 1]);
    }

    // this function sets the xrangeset
    function xrangeset(min, max) {
        // Force the slider thumbs to adjust to the appropriate place
        var sliderElem = document.getElementById('slider-range');
        if (sliderElem) {
            sliderElem.noUiSlider.set([min, max]);


            // ga event action, category, label
            googleAnalyticsEvent('slide', 'update-years', min + "-" + min);
        }
    }

    function initSlider() {
        annualSliderOn();
        monthlySelectOff();

        var sliderElem = document.getElementById('slider-range');
        if (sliderElem) {
            noUiSlider.create(sliderElem, {
                connect: true,
                range: {
                    'min': 1950,
                    'max': 2099
                },
                step: 1,
                // Handles start at ...
                start: [1950, 2099]
            });

            // set slider on slide event
            sliderElem.noUiSlider.on('slide', function () {
                const values = sliderElem.noUiSlider.get();
                const minValue = parseInt(values[0]);
                const maxValue = parseInt(values[1]);
                $('#slider-value-high').text(maxValue);
                $('#slider-value-low').text(minValue);

                // ga event action, category, label
                googleAnalyticsEvent('slide', 'update-years', minValue + "-" + maxValue);

                // update chart with new max min range
                return window.cbl_chart.set_x_axis_range(minValue, maxValue);
            });

            // update chart with default starting min max
            const values = sliderElem.noUiSlider.get();
            const minValue = parseInt(values[0]);
            const maxValue = parseInt(values[1]);
            $('#slider-value-high').text(maxValue);
            $('#slider-value-low').text(minValue);
        }

        $('#monthly-select-wrapper').hide();
    }

    function annualSliderOn() {
        $('#annual-slider-wrapper').removeClass('d-none');
        $('#annual-slider-wrapper').addClass('d-flex-center');
    }

    function annualSliderOff() {
        $('#annual-slider-wrapper').addClass('d-none');
        $('#annual-slider-wrapper').removeClass('d-flex-center');
    }

    function monthlySelectOn() {
        $('#monthly-select-wrapper').removeClass('d-none');
        $('#monthly-select-wrapper').addClass('d-flex-center');
    }

    function monthlySelectOff() {
        $('#monthly-select-wrapper').addClass('d-none');
        $('#monthly-select-wrapper').removeClass('d-flex-center');
    }

    window.cbl_chart = new ClimateByLocationWidget($("div#chart-123")[0], {
        'font': 'Roboto',
        'responsive': true,
        'frequency': 'annual',
        'timeperiod': '2025',
        'county': window.ce.ce('getLocationPageState')['fips'],
        'variable': window.ce.ce('getVariablesPageState')['variable'] || 'tmax',
        'scenario': 'both',
        'presentation': 'absolute',
        'pmedian': true,
        'hmedian': false,
        'histobs': false,
        'histmod': true,
        'xrangefunc': xrangeset(1950, 2099)
    });

    setTimeout(function () {
        window.cbl_chart.resize();
    }, 700);

    $(window).resize(function () {
        window.cbl_chart.resize();
    });


    const variable = window.ce.ce('getVariablesPageState')['variable'];
    if (variable !== undefined) {
        const $styledSelect = $('.select.varriable-select div.select-styled');
        $(`[rel="${variable}"]`).click();

        // // change chart varriable
        // window.cbl_chart.set_options({
        //   variable
        // });
    }

});
