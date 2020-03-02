// TO DO Need to revist this so tab, return on pulldowns are not duplicated code aka needs a function
// that also deals with this contexts

//  when we get stations in the map extent
// the addition of the new stations removes existing click events
// so we need to re add them
function reEnableSelectNewItems(uniqueSelector){
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable dropdown
  if ( $styledSelect.hasClass( 'disabled' )){
    return null;
  }

  // get list tiems so we can add user interactions
  var $list = $(`.select.${uniqueSelector} ul`);
  var $listItems = $(`.select.${uniqueSelector} ul`).children('li');

  // enable click for options
  $listItems.keyup(function(e){
     if (e.keyCode === 13){
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
     }
  });

  // enable key down for options
  $listItems.click(function(e){
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


  var $listTips = $(`.select.${uniqueSelector} ul`).children('span');

  $listTips.click(function(e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {return null}
    e.stopPropagation();

    // ga event action, category, label
    googleAnalyticsEvent('click', 'dropdown-tip', relAttr);

    const relAttr = $(this).attr('rel');
    const testItem = $(`li[rel='${relAttr}']`);
    $(testItem).click();
  });


  $listTips.keyup(function(e) {
    if (e.keyCode === 13){
      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {return null}
      e.stopPropagation();

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'dropdown-tip', relAttr);

      const relAttr = $(this).attr('rel');
      const testItem = $(`li[rel='${relAttr}']`);
      $(testItem).click();
    }
  });
}

// function enables custom selection dropdown from a li element
function enableCustomSelect(uniqueSelector) {
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable dropdown
  if ( $styledSelect.hasClass( 'disabled' )){
    return null;
  }

  // enable click and show options
  $styledSelect.keyup(function(e) {
    if (e.keyCode === 13){
      if ( $(e.target).hasClass( 'disabled' )){
        return null;
      }

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'dropdown', uniqueSelector);

      $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function(){
        $(this).removeClass('active').next('ul.select-options').hide();
      });
      $(this).toggleClass('active').next('ul.select-options').toggle();
    }

    e.stopPropagation();
  });

  // enable click and show options
  $styledSelect.click(function(e) {
    e.stopPropagation();

    if ( $(e.target).hasClass( 'disabled' )){
      return null;
    }

    // ga event action, category, label
    googleAnalyticsEvent('click', 'dropdown', uniqueSelector);

    $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function(){
      $(this).removeClass('active').next('ul.select-options').hide();
    });
    $(this).toggleClass('active').next('ul.select-options').toggle();
  });

  // get list tiems so we can add user interactions
  var $list = $(`.select.${uniqueSelector} ul`);
  var $listItems = $(`.select.${uniqueSelector} ul`).children('li');

  // enable click for options
  $listItems.keyup(function(e){
     if (e.keyCode === 13){
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

       // ga event action, category, label
       googleAnalyticsEvent('click-tab', 'listitem', $(this).text());

       $styledSelect.prepend(icon);
       $list.hide();
       // trigger custom event so we know the user changed or selected an item
       $styledSelect.trigger('cs-changed' );
     }
  });

  // enable key down for options
  $listItems.click(function(e){
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
      // ga event action, category, label
      googleAnalyticsEvent('click', 'listitem', $(this).text());

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

    // ga event action, category, label
    googleAnalyticsEvent('click', 'select-list', relAttr);

    $(testItem).click();
  });


  $listTips.keyup(function(e) {
    if (e.keyCode === 13){
      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {return null}
      e.stopPropagation();

      const relAttr = $(this).attr('rel');
      const testItem = $(`li[rel='${relAttr}']`);

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'select-list', relAttr);

      $(testItem).click();
    }
  });

  // hide dropdown when user clicks anywhere outside of selected area
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

  // ga event action, category, label
  googleAnalyticsEvent('click', 'chartmap', nav);
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

  // ga event action, category, label
  googleAnalyticsEvent('click', 'location', 'clear');
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

  // ga event action, category, label
  googleAnalyticsEvent('click', 'station', 'clear');
}


function forceResize() {
  var el = document; // This can be your element on which to trigger the event
  var event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  el.dispatchEvent(event);
}

// init tool helpers for variables in variable pulldowns on map and chart pages
function initVarriableToolTips() {
  // const listWidth = -500 //(document.getElementById('variable-select-vis').offsetWidth - 24)* -1
  const tmaxReference = document.getElementById('tmax-tooltip');
  makeTip(tmaxReference);

  const tminReference = document.getElementById('tmin-tooltip');
  makeTip(tminReference);

  const days_tmax_gt_50f = document.getElementById('days_tmax_gt_50f-tooltip');
  makeTip(days_tmax_gt_50f);

  const days_tmax_gt_60f = document.getElementById('days_tmax_gt_60f-tooltip');
  makeTip(days_tmax_gt_60f);

  const days_tmax_gt_70f = document.getElementById('days_tmax_gt_70f-tooltip');
  makeTip(days_tmax_gt_70f);

  const days_tmax_gt_80f = document.getElementById('days_tmax_gt_80f-tooltip');
  makeTip(days_tmax_gt_80f);

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

  const days_tmin_lt_minus_40f = document.getElementById('days_tmin_lt_minus_40f-tooltip');
  makeTip(days_tmin_lt_minus_40f);

  const days_tmin_gt_60f = document.getElementById('days_tmin_gt_60f-tooltip');
  makeTip(days_tmin_gt_60f);

  const pcpn = document.getElementById('pcpn-tooltip');
  makeTip(pcpn);

  const days_pcpn_gt_0_25in = document.getElementById('days_pcpn_gt_0_25in-tooltip');
  makeTip(days_pcpn_gt_0_25in);

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

  const hdd_32f = document.getElementById('hdd_32f-tooltip');
  makeTip(hdd_32f);

  const gdd_32f = document.getElementById('gdd_32f-tooltip');
  makeTip(gdd_32f);
}

function makeTip(elem) {
  if (elem) {
    elem.addEventListener('mouseover', tippy( elem, {
      theme: 'ce-three',
      arrow: false,
      interactive: false,
      hideOnClick: false,
      flipOnUpdate: false
    }));
  }
}

// adds a custom google events
function googleAnalyticsEvent(action = '', category = '', label = '', value = 0) {
  gtag('event', action, {  // eslint-disable-line
    event_category: category,
    event_label: label,
    value: `${value}`,
    uuid: getUUID()
  });
}


// feedback for beta. remove after we go live?
function storageAvailable() {
  const type = 'localStorage';
  let storage;
  try {
    storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0;
  }
}

const feedbackElem = document.getElementById('feedback-trigger');
const feedbackSmallElem = document.getElementById('feedback-trigger-small');
const feedbackYesElem = document.getElementById('feedback-close-button-yes');
const feedbackNoElem = document.getElementById('feedback-close-button-no');
const feedbackLinkElem = document.getElementById('feedback-link');

if (storageAvailable()) {
  const localStorage = window.localStorage;
}

function neverShowFeedbackAgain() {
  if (storageAvailable()) {
    localStorage.setItem('showfeedback', 'no');
  }
}

function uuid() {
  return crypto.getRandomValues(new Uint32Array(4)).join('-');
}

// ensure the object or variable is valid...
// TODO: This should probably be looking for positives rather than checking it
// isn't one of a few negatives. For example this will let booleans, malformed
// lat/long objects, arrays and floats through when it probably shouldn't. The
// code doesn't really say what a valid object is other than not undefined,
// null, empty arrays, empty objects and empty strings.
//
// @param obj - typeless
function checkValidObject(obj) {
  if (obj === undefined || obj === null) { return false; }
  if (typeof obj === 'object' && Object.keys(obj).length === 0) { return false; }
  if (typeof obj === 'string' && obj.length === 0) { return false; }

  return true;
}

function setUUID() {
  if (storageAvailable()) {
    if (!checkValidObject(localStorage.getItem('uuid'))) {
      localStorage.setItem('uuid', uuid());
    }
  }
}

function getUUID() {
  if (storageAvailable()) {
    if (checkValidObject(localStorage.getItem('uuid'))) {
      return localStorage.getItem('uuid');
    } else {
      return 'uuid not available';
    }
  } else {
    return 'uuid not available';
  }
  return 'uuid not available';
}

function offFeedbackAsk() {
  if (feedbackElem) {
    feedbackElem.classList.add('d-none')
  }
}

function onFeedbackAsk() {
  if (feedbackElem) {
    feedbackElem.classList.remove('d-none')
  }
}

function onFeedbackSmall() {
  if (feedbackSmallElem) {
    feedbackSmallElem.classList.remove('d-none')
  }
}

function offFeedbackSmall() {
  if (feedbackSmallElem) {
    feedbackSmallElem.classList.add('d-none')
  }
}

if (feedbackYesElem) {
  feedbackYesElem.addEventListener('click', function() {
    if (feedbackLinkElem) {
      feedbackLinkElem.click();
    }
    offFeedbackAsk();
    onFeedbackSmall();
    neverShowFeedbackAgain();
  })
}

if (feedbackNoElem) {
  feedbackNoElem.addEventListener('click', function() {
    offFeedbackAsk();
    onFeedbackSmall();
    neverShowFeedbackAgain();
  })
}

if (feedbackSmallElem) {
  feedbackSmallElem.addEventListener('click', function() {
    localStorage.removeItem('showfeedback');
    onFeedbackAsk();
    offFeedbackSmall();
  })
}


if (storageAvailable()) {
  const showStorage = localStorage.getItem('showfeedback');
  if (showStorage === 'no') {
    offFeedbackAsk();
    onFeedbackSmall();
  } else {
    onFeedbackAsk();
    offFeedbackSmall();
  }
}

function updateValidVarriable() {
  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  let isAlaska = false;
  let isHawaii = false;

  if (cityStateCE) {
      isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
      isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  if (cityStateCE) {
      if (isAlaska || isHawaii) {
           $('#default-in').html('—');
          $('#download-observed-data').addClass('default-select-option-disabled');
          $('#download-observed-data').addClass('disabled');
          $('.btn-histobs').addClass('disabled');
          $('.inner-histobs').addClass('disabled');
          $('.btn-lower-emissions').addClass('disabled');
          $('.inner-lower-emmisions').addClass('disabled');
          $('.btn-lower-emissions').removeClass('selected');
          $('.opt-not-ak').removeClass('default-select-option-disabled');
          $('.btn-monthly').addClass('btn-default-disabled');
          $('.btn-map').addClass('btn-default-disabled');
          $('#more-info-description .btn-histobs').removeClass('disabled');
          $('#more-info-description .btn-lower-emissions').removeClass('disabled');
          $('#more-info-description .btn-lower-emissions').addClass('selected');

          // temporary fix for Aleutians West and Hawaii
          if (cityStateCE.includes('Aleutians West') > 0 || countyCE.includes('Aleutians West') > 0 || isHawaii) {
            const messsageElemChart = document.getElementById('chart-message');
            if (messsageElemChart) {
              const rect = document.getElementById('chart-wrap').getBoundingClientRect();;
              messsageElemChart.style.left = `${(rect.right - rect.left)/4}px`;
              messsageElemChart.style.top = `${((rect.bottom + rect.top)/2.5)}px`;
              messsageElemChart.innerHTML = `The chart and data for ${cityStateCE}, is currently not available.`
              messsageElemChart.classList.remove('d-none');
            }
          }

      } else {
        $('.opt-only-ak').addClass('default-select-option-disabled');
      }
  }
}

// when user clicks on search icon switch focus to location search box
const searchIconElem = document.getElementById('location-search-icon');
if(searchIconElem) {
  searchIconElem.addEventListener('click', function() {
    $('#location-search-input').focus();
  });
}

setUUID();
