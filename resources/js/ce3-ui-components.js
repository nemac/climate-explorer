//  when we get stations in the map extent
// the addition of the new stations removes existing click events
// so we need to re add them
function reEnableSelectNewItems(uniqueSelector){
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable pulldown
  if ( $styledSelect.hasClass( 'disabled' )){
    return null;
  }

  // get list tiems so we can add user interactions
  var $list = $(`.select.${uniqueSelector} ul`);
  var $listItems = $(`.select.${uniqueSelector} ul`).children('li');

  // enable click for options
  $listItems.click(function(e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {return null}

    e.stopPropagation();

    // option item has href make it a element so links work
    var hrefAttr = $(this).attr('href');
    if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
      $styledSelect.html(`<a href="${hrefAttr}" rel="${$(this).attr('rel')}">${$(this).text()}</a>`).removeClass('active');
    } else {
      $styledSelect.text($(this).text()).removeClass('active');
    }

    $styledSelect.attr('rel',$(this).attr('rel'))
    $styledSelect.attr('link',$(this).attr('link'))
    $styledSelect.attr('nav',$(this).attr('nav'))

    // option item has icon add it
    var iconAttr = $(this).attr('icon');
    if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
      // Element has this attribute
      var icon = `<i class="${iconAttr}"></i>`;
    } else {
      var icon = '';
    }

    $styledSelect.prepend(icon);
    $list.hide();
    // trigger custom event so we know the user changed or selected an item
    $styledSelect.trigger('cs-changed' );
  });
}

// function enables custom selection dropdown from a li element
function enableCustomSelect(uniqueSelector) {
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable pulldown
  if ( $styledSelect.hasClass( 'disabled' )){
    return null;
  }

  // enable click and show options
  $styledSelect.click(function(e) {
    e.stopPropagation();

    if ( $(e.target).hasClass( 'disabled' )){
      return null;
    }

    $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function(){
      $(this).removeClass('active').next('ul.select-options').hide();
    });
    $(this).toggleClass('active').next('ul.select-options').toggle();
  });

  // get list tiems so we can add user interactions
  var $list = $(`.select.${uniqueSelector} ul`);
  var $listItems = $(`.select.${uniqueSelector} ul`).children('li');

  // enable click for options
  $listItems.click(function(e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {return null}
    e.stopPropagation();

    // option item has href make it a element so links work
    const hrefAttr = $(this).attr('href');
    if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
      $styledSelect.html(`<a href="${hrefAttr}" rel="${$(this).attr('rel')}">${$(this).text()}</a>`).removeClass('active');
    } else {
      $styledSelect.text($(this).text()).removeClass('active');
    }

    $styledSelect.attr('rel',$(this).attr('rel'))
    $styledSelect.attr('link',$(this).attr('link'))
    $styledSelect.attr('nav',$(this).attr('nav'))

    // option item has icon add it
    const iconAttr = $(this).attr('icon');
    if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
      // Element has this attribute
      var icon = `<i class="${iconAttr}"></i>`;
    } else {
      var icon = '';
    }

    $styledSelect.prepend(icon);
    $list.hide();
    // trigger custom event so we know the user changed or selected an item
    $styledSelect.trigger('cs-changed' );
  });

  var $listTips = $(`.select.${uniqueSelector} ul`).children('span');

  $listTips.click(function(e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {return null}
    e.stopPropagation();

    const relAttr = $(this).attr('rel');
    const testItem = $(`li[rel='${relAttr}']`);
    $(testItem).click();
  });

  // hide pulldown when user clicks anywhere outside of selected area
  $(document).click(function() {
    $styledSelect.removeClass('active');
    $list.hide();
  });
}



// function changes button to selected
function toggleButton(selector){
  toggleAllButtonsOff(selector.get())
  $(selector).addClass('btn-default-selected');
}

// function changes button to selected
function toggleAllButtonsOff(btnElem){
  const parentElem = btnElem[0].parentElement;
  const elems = parentElem.childNodes;
  elems.forEach((elem) => {
    if (elem instanceof Element) {
      elem.classList.remove('btn-default-selected');
      elem.classList.add('btn-default');
    }
  });
}

// update select text
function setSelectFromButton(target) {
  const innerText = target.html().trim();
  const val = target.attr('val');
  const selector = target.attr('sel');

  $(`#${selector}`).text(innerText);
  $(`#${selector}`).attr('rel', val);
}

//  TODO move this global functions so its not in two places
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

// handles click of map/char choice button.
// requires the html element has a custom attributes:
// link - which is the element id for the hidden <a> element
// nav - contains the html page/ nav footer name
function handleChartMapClick(target) {
  const link = target.attr('link');
  const nav = target.attr('nav');
  const seachParams =  removeUrlParam('nav');
  const url = `../${nav}/${seachParams}&nav=${nav}`;
  $(`#${link}`).attr('href', url);
  $(`#${link}`).click();
  document.getElementById(link).click();
}

function handleClearLocationClick(target) {
  window.ce.ce('setVariablesMapState',{ county: null });
  window.ce.ce('setVariablesMapState',{ city: null });
  window.ce.ce('setVariablesMapState',{ fips: null });
  window.ce.ce('setStationsMapState',{ stationId: null });
  window.ce.ce('setStationsMapState',{ stationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationId: null });
  window.ce.ce('setStationsMapState',{ tidalStationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationMOverMHHW: null });
  target.val('');
  const link = target.attr('link');
  const nav = target.attr('nav');
  const seachParams =  removeUrlParam('nav');
  const url = `../${nav}/${seachParams}&nav=${nav}`;
  $(`#${link}`).attr('href', url);
  $(`#${link}`).click();
  document.getElementById(link).click();
}

function handleClearSationClick(target) {
  window.ce.ce('setStationsMapState',{ stationId: null });
  window.ce.ce('setStationsMapState',{ stationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationId: null });
  window.ce.ce('setStationsMapState',{ tidalStationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationName: null });
  window.ce.ce('setStationsMapState',{ tidalStationMOverMHHW: null });

  target.val('');
  const link = target.attr('link');
  const nav = target.attr('nav');
  const seachParams =  removeUrlParam('nav');
  const url = `../${nav}/${seachParams}&nav=${nav}`;
  $(`#${link}`).attr('href', url);
  $(`#${link}`).click();
  document.getElementById(link).click();
}


function forceResize() {
  var el = document; // This can be your element on which to trigger the event
  var event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  el.dispatchEvent(event);
}

// init tool helpers for varriables in varriable pulldowns on map and chart pages
function initVarriableToolTips() {
  // const listWidth = -500 //(document.getElementById('varriable-select-vis').offsetWidth - 24)* -1
  // // console.log('initVarriableToolTips', listWidth)
  const tmaxReference = document.getElementById('tmax-tooltip');
  makeTip(tmaxReference);

  const tminReference = document.getElementById('tmin-tooltip');
  makeTip(tminReference);

  const days_tmax_gt_90f = document.getElementById('days_tmax_gt_90f-tooltip');
  makeTip(days_tmax_gt_90f);

  const days_tmax_gt_95f = document.getElementById('days_tmax_gt_95f-tooltip');
  makeTip(days_tmax_gt_95f);

  const days_tmax_gt_100f = document.getElementById('days_tmax_gt_100f-tooltip');
  makeTip(days_tmax_gt_100f);

  const days_tmax_gt_105f = document.getElementById('days_tmax_gt_105f-tooltip');
  makeTip(days_tmax_gt_105f);

  const days_tmax_lt_32f = document.getElementById('days_tmax_lt_32f-tooltip');
  makeTip(days_tmax_lt_32f);

  const days_tmin_lt_32f = document.getElementById('days_tmin_lt_32f-tooltip');
  makeTip(days_tmin_lt_32f);

  const days_tmin_gt_80f = document.getElementById('days_tmin_gt_80f-tooltip');
  makeTip(days_tmin_gt_80f);

  const days_tmin_gt_90f = document.getElementById('days_tmin_gt_90f-tooltip');
  makeTip(days_tmin_gt_90f);

  const pcpn = document.getElementById('pcpn-tooltip');
  makeTip(pcpn);

  const days_pcpn_gt_1in = document.getElementById('days_pcpn_gt_1in-tooltip');
  makeTip(days_pcpn_gt_1in);

  const days_pcpn_gt_2in = document.getElementById('days_pcpn_gt_2in-tooltip');
  makeTip(days_pcpn_gt_2in);

  const days_pcpn_gt_3in = document.getElementById('days_pcpn_gt_3in-tooltip');
  makeTip(days_pcpn_gt_3in);

  const days_dry_days = document.getElementById('days_dry_days-tooltip');
  makeTip(days_dry_days);

  const cdd_65f = document.getElementById('cdd_65f-tooltip');
  makeTip(cdd_65f);

  const gdd = document.getElementById('gdd-tooltip');
  makeTip(gdd);

  const hdd_65f = document.getElementById('hdd_65f-tooltip');
  makeTip(hdd_65f);

  const gddmod = document.getElementById('gddmod-tooltip');
  makeTip(gddmod);
}

function makeTip(elem) {
  elem.addEventListener('mouseover', tippy( elem, {
      theme: 'ce-three',
      arrow: false,
      interactive: true,
      hideOnClick: false,
      flipOnUpdate: false
     })
   );



}
