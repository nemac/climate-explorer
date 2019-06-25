'use strict';

$(function () {
  var activeVariableTemperature = 'tmax';
  var activeVariablePrecipitation = 'pcpn';
  var activeVariableDerived = 'hdd';

  // get city, state from state url
  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  // enable custom selction boxes
  enableCustomSelect('download-select');
  enableCustomSelect('stations-select');
  enableCustomSelect('varriable-select');
  enableCustomSelect('chartmap-select');
  enableCustomSelect('time-select');

  // // $('#chartmap-btn-chart-link').click(handleChartLink)
  //  $('#chartmap-wrapper').parent.click(handleChartLink);
  //
  // $('#chartmap-select-chart-link').click(handleChartLink);
  //
  // $('#chartmap-btn-map-link').click( handleMapLink);
  // $('#chartmap-select-map-link').click( handleMapLink);


  // toggle filters click
  $('#filters-toggle').click( function(e) {
      const target = $(e.target);
      if (target.hasClass('closed-filters')) {
        target.removeClass('closed-filters');
      } else {
        target.addClass('closed-filters');
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
  })

  // eanbles time chart, map click events
  $('#chartmap-wrapper').click( function(e) {
    const target = $(e.target);

    // toggle button visual state
    toggleButton($(target));

    // change select pulldowns for resposnive mode
    setSelectFromButton(target);


    handleChartMapClick(target);
  })

  // eanbles time annual, monlthly click events
  $('#time-wrapper').click( function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');

    // not all varriables can display monthly chart
    // when the varriable cannot display monthly chart do
    // do execute the click event
    if ( notDisabled ) {
      const val = target.attr('val')

      // toggle button visual state
      toggleButton(target);

      // change select pulldowns for resposnive mode
      setSelectFromButton(target);
    }
  })


  // in repsonsive mode the time is a pulldown this eanbles the change of the chart map
  $('#chartmap-select-vis').bind('cs-changed', function(e) {
    const target = $(e.target);
    const notDisabled = !target.hasClass('btn-default-disabled');
    if ( notDisabled ) {
      const val = $('#time-select-vis').attr('rel')

      // toggle button visual state
      toggleButton($(`.btn-${$('#chartmap-select-vis').attr('rel')}`));

      handleChartMapClick(target);
    }
  })

});
