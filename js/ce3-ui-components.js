//  when we get stations in the map extent
// the addition of the new stations removes existing click events
// so we need to re add them
function reEnableSelectNewItems(uniqueSelector) {
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable dropdown
  if ($styledSelect.hasClass('disabled')) {
    return null;
  }

  // get list items so we can add user interactions
  const $list = $(`.select.${uniqueSelector} ul`);
  const $listItems = $(`.select.${uniqueSelector} ul`).children('li[role="option"]');

  // enable click for options

  $listItems.on('click keyup keydown', ((e) => {
        // suppress scrolling on spacebar
        if (e.type === 'keydown' && e.keyCode === 32) {
          e.preventDefault();
          return;
        }
        // trigger navigation
        const value = $(e.currentTarget).data('value');
        if (e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13))) {
          // check if disabled exit if it is
          if ($(e.currentTarget).hasClass('default-select-option-disabled')) {
            return null
          }

          recreateToolTip(e.currentTarget);

          e.stopPropagation();
          // option item has href make it a element so links work
          if (uniqueSelector !== 'download-select') {
            const hrefAttr = $(e.currentTarget).attr('href');
            if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
              $styledSelect.html(`<a href="${hrefAttr}" data-value="${value}">${$(e.currentTarget).text().trim()}</a>`).removeClass('active');
            } else {
              $styledSelect.text($(e.currentTarget).text().trim()).removeClass('active');
            }
          }

          $styledSelect.data('value', value)
          $styledSelect.data('link', $(e.currentTarget).data('link'))
          $styledSelect.data('nav', $(e.currentTarget).data('nav'))
          // option item has icon add it
          let icon = '';
          if (uniqueSelector !== 'download-select') {
            const iconAttr = $(e.currentTarget).data('icon');
            if (!!iconAttr) {
              // Element has e.currentTarget attribute
              icon = `<i class="${iconAttr}"></i>`;
            }
          }
          $styledSelect.prepend(icon);
          $list.hide();
          // trigger custom event so we know the user changed or selected an item
          $styledSelect.trigger('cs-changed');

        }
      }).bind(this)
  );

  const $listTips = $(`.select.${uniqueSelector} ul`).children('span');

  $listTips.click(function (e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {
      return null
    }
    e.stopPropagation();

    const value = $(this).data('value');
    // ga event action, category, label
    googleAnalyticsEvent('click', 'dropdown-tip', value);

    const testItem = $(`li[data-value='${value}']`);
    $(testItem).click();
  });


  $listTips.keyup(function (e) {
    if (e.keyCode === 13) {
      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {
        return null
      }
      e.stopPropagation();

      const value = $(this).data('value');
      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'dropdown-tip', value);

      const testItem = $(`li[data-value='${value}']`);
      $(testItem).click();
    }
  });

}

// function enables custom selection dropdown from a li element
function enableCustomSelect(uniqueSelector) {
  const $styledSelect = $(`.select.${uniqueSelector} div.select-styled`);
  // if disabled exit and do not enable dropdown
  if ($styledSelect.hasClass('disabled')) {
    return null;
  }

  // enable click and show options
  $styledSelect.keyup(function (e) {
    if (e.keyCode === 13) {
      if ($(e.target).hasClass('disabled')) {
        return null;
      }

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'dropdown', uniqueSelector);

      $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function () {
        $(this).removeClass('active').next('ul.select-options').hide();
      });
      $(this).toggleClass('active').next('ul.select-options').toggle();
    }

    e.stopPropagation();
  });

  // enable click and show options
  $styledSelect.click(function (e) {
    e.stopPropagation();

    if ($(e.target).hasClass('disabled')) {
      return null;
    }

    // ga event action, category, label
    googleAnalyticsEvent('click', 'dropdown', uniqueSelector);

    $(`.select.${uniqueSelector} div.select-styled.active`).not(this).each(function () {
      $(this).removeClass('active').next('ul.select-options').hide();
    });
    $(this).toggleClass('active').next('ul.select-options').toggle();
  });

  // get list items so we can add user interactions
  const $list = $(`.select.${uniqueSelector} ul`);
  const $listItems = $list.children('li[role="option"]');

  // enable click for options
  $listItems.keyup(function (e) {
    if (e.keyCode === 13) {
      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {
        return null
      }
      recreateToolTip(this);

      e.stopPropagation();
      // option item has href make it a element so links work
      if (uniqueSelector !== 'download-select') { // do not update label text for download-select
        const hrefAttr = $(this).attr('href');
        if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
          $styledSelect.html(`<a href="${hrefAttr}" data-value="${$(this).data('value')}">${$(this).text().trim()}</a>`).removeClass('active');
        } else {
          $styledSelect.text($(this).text().trim()).removeClass('active');
        }
      }

      $styledSelect.data('value', $(this).data('value'))
      $styledSelect.data('link', $(this).data('link'))
      $styledSelect.data('nav', $(this).data('nav'))

      // option item has icon add it
      let icon;
      if (uniqueSelector !== 'download-select') {
        const iconAttr = $(this).data('icon');
        if (typeof iconAttr !== typeof undefined && iconAttr !== false) {
          // Element has this attribute
          icon = `<i class="${iconAttr}"></i>`;
        } else {
          icon = '';
        }
      }

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'listitem', $(this).text());

      $styledSelect.prepend(icon);
      $list.hide();
      // trigger custom event so we know the user changed or selected an item
      $styledSelect.trigger('cs-changed');
    }
  });

  // enable key down for options
  $listItems.click(function (e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {
      return null
    }
    recreateToolTip(this);

    e.stopPropagation();
    // option item has href make it a element so links work
    if (uniqueSelector !== 'download-select') {
      const hrefAttr = $(this).attr('href');
      if (typeof hrefAttr !== typeof undefined && hrefAttr !== false) {
        $styledSelect.html(`<a href="${hrefAttr}" data-value="${$(this).data('value')}">${$(this).text().trim()}</a>`).removeClass('active');
      } else {
        $styledSelect.text($(this).text().trim()).removeClass('active');
      }
    }

    $styledSelect.data('value', $(this).data('value'))
    $styledSelect.data('link', $(this).data('link'))
    $styledSelect.data('nav', $(this).data('nav'))

    // ga event action, category, label
    googleAnalyticsEvent('click', 'listitem', $(this).text());

    // $styledSelect.prepend(icon);
    $list.hide();
    // trigger custom event so we know the user changed or selected an item
    $styledSelect.trigger('cs-changed');
  });

  const $listTips = $(`.select.${uniqueSelector} ul`).children('span');
  $listTips.click(function (e) {
    // check if disabled exit if it is
    if ($(this).hasClass('default-select-option-disabled')) {
      return null
    }
    e.stopPropagation();

    const value = $(this).data('value');
    const testItem = $(`li[data-value='${value}']`);

    // ga event action, category, label
    googleAnalyticsEvent('click', 'select-list', value);

    $(testItem).click();
  });


  $listTips.keyup(function (e) {
    if (e.keyCode === 13) {
      // check if disabled exit if it is
      if ($(this).hasClass('default-select-option-disabled')) {
        return null
      }
      e.stopPropagation();

      const value = $(this).data('value');
      const testItem = $(`li[data-value='${value}']`);

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'select-list', value);

      $(testItem).click();
    }
  });

  // hide dropdown when user clicks anywhere outside of selected area
  $(document).one('click', function () {
    $styledSelect.removeClass('active');
    $list.hide();
  });
}

// function recreates tool tip for selected variable
function recreateToolTip(elem) {
  const listTips = $(elem).children('span.variable-option-tooltip')[0];
  const tipContent = $(listTips).attr('data-tippy-content');
  const selectedTipHolderElem = document.getElementById('select-tip-holder');

  if (selectedTipHolderElem) {
    const tipInnerHTML = selectedTipHolderElem.innerHTML;
    selectedTipHolderElem.innerHTML = '';
    selectedTipHolderElem.innerHTML = tipInnerHTML;

    const selectedTipElem = document.getElementById('select-tip');
    if (selectedTipElem) {
      $(selectedTipElem).attr('data-tippy-content', tipContent);
      makeMainTip(selectedTipElem);
    }
  }
}

// function changes selector button to selected
function toggleButton(selector) {
  toggleAllButtonsOff(selector.get())
  $(selector).addClass('btn-default-selected');
}

// function changes selector buttons to off
function toggleAllButtonsOff(btnElem) {
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
  const val = target.data('value');
  const selector = target.data('sel');

  $(`#${selector}`).text(innerText);
  $(`#${selector}`).data('value', val);
}

//
// // handles click of map/char choice button.
// // requires the html element has a custom attributes:
// // link - which is the element id for the hidden <a> element
// // nav - contains the html page/ nav footer name
// function handleChartMapClick(target) {
//   window.app.update({page:'local-climate-maps'});
//
//   // ga event action, category, label
//   googleAnalyticsEvent('click', 'chartmap', nav);
// }

function forceResize() {
  const el = document; // This can be your element on which to trigger the event
  const event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, false);
  el.dispatchEvent(event);
}

// init tool helpers for variables in variable dropdowns on map and chart pages
function initVariableToolTips() {
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

  const select_tip = document.getElementById('select-tip');
  makeMainTip(select_tip);
}

function makeMainTip(elem) {
  if (elem) {
    elem.addEventListener('mouseover', tippy(elem, {
      theme: 'ce-three-main',
      arrow: false,
      trigger: "mouseenter click",
      animateFill: false,
      interactive: true,
      hideOnClick: true,
      flipOnUpdate: false,
      offset: "1,0"
    }));
  }
}

function makeTip(elem) {
  if (elem) {
    elem.addEventListener('mouseover', tippy(elem, {
      theme: 'ce-three',
      arrow: false,
      interactive: false,
      hideOnClick: false,
      flipOnUpdate: false,
      offset: "1,0"
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
        storage &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage.length !== 0;
  }
}

const feedbackElem = document.getElementById('feedback-trigger');
const feedbackSmallElem = document.getElementById('feedback-trigger-small');
const feedbackYesElem = document.getElementById('feedback-close-button-yes');
const feedbackNoElem = document.getElementById('feedback-close-button-no');
const feedbackLinkElem = document.getElementById('feedback-link');
let localStorage;
if (storageAvailable()) {
  localStorage = window.localStorage;
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
  if (obj === undefined || obj === null) {
    return false;
  }
  if (typeof obj === 'object' && Object.keys(obj).length === 0) {
    return false;
  }
  return !(typeof obj === 'string' && obj.length === 0);


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
    }
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
  feedbackYesElem.addEventListener('click', function () {
    if (feedbackLinkElem) {
      feedbackLinkElem.click();
    }
    offFeedbackAsk();
    onFeedbackSmall();
    neverShowFeedbackAgain();
  })
}

if (feedbackNoElem) {
  feedbackNoElem.addEventListener('click', function () {
    offFeedbackAsk();
    onFeedbackSmall();
    neverShowFeedbackAgain();
  })
}

if (feedbackSmallElem) {
  feedbackSmallElem.addEventListener('click', function () {
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

function updateValidVariable() {
  console.log("updateValidVariable()");
  const state = window.app.state
  const cityStateCE = state['city'];
  const countyCE = state['county'];
  const is_conus_area = state['is_conus_area'];
  const is_island_area = state['is_island_area'];
  const is_alaska_area = state['is_alaska_area'];

  $('body').toggleClass('is-ak-area', is_alaska_area).toggleClass('is-island-area', is_island_area);

  if (cityStateCE) {
    if (!is_conus_area) {
      $('#default-in').html('—');
      $('#download-observed-data').addClass('default-select-option-disabled');
      $('#download-observed-data').addClass('disabled');
      $('.btn-histobs').addClass('disabled');
      $('.inner-histobs').addClass('disabled');
      $('.btn-lower-emissions').addClass('disabled');
      $('.inner-lower-emissions').addClass('disabled');
      $('.btn-lower-emissions').removeClass('selected');
      // $('.opt-not-ak').removeClass('default-select-option-disabled');
      $('.not-ak-last').removeClass('last-variable-space');

      $('.btn-monthly').addClass('btn-default-disabled');
      $('[data-value="monthly"]').addClass('default-select-option-disabled');
      $('[data-value="monthly"]').addClass('disabled');
      $('.btn-selector[data-value="map"]').addClass('btn-default-disabled');
      $('#more-info-description .btn-histobs').removeClass('disabled');
      $('#more-info-description .btn-lower-emissions').removeClass('disabled');
      $('#more-info-description .btn-lower-emissions').addClass('selected');

      // temporary fix for Aleutians West
      if (cityStateCE.includes('Aleutians West') > 0 || countyCE.includes('Aleutians West') > 0) {
        const messageElemChart = document.getElementById('chart-message');
        if (messageElemChart) {
          const rect = document.getElementById('chart-wrap').getBoundingClientRect();

          messageElemChart.style.left = `${(rect.right - rect.left) / 4}px`;
          messageElemChart.style.top = `${((rect.bottom + rect.top) / 2.5)}px`;
          messageElemChart.innerHTML = `The chart and data for ${cityStateCE}, is currently not available.`
          messageElemChart.classList.remove('d-none');
        }
      }

    } else {
      // $('.opt-only-ak').addClass('default-select-option-disabled');
      $('.not-ak-last').addClass('last-variable-space');
    }


    if (!!state['variable']) {
      const selected_list_item = $(`.variable-select li[data-value="${state["variable"]}"]`);
      if (!!selected_list_item) {
        $(`.select.variable-select div.select-styled`).text(selected_list_item.text().trim()).removeClass('active');
      }
    }
    // $('.opt-not-ak').toggleClass('d-none', is_ak_area);
    // $('.opt-only-ak').removeClass('d-none', !is_ak_area);
    // $('.opt-not-island').toggleClass('d-none', is_island_area);
    // $('.opt-only-island').removeClass('d-none', !is_island_area);
  }
}

// when user clicks on search icon switch focus to location search box
const searchIconElem = document.getElementById('location-search-icon');
if (searchIconElem) {
  searchIconElem.addEventListener('click', function () {
    if ($('#location-search-input').val().length > 0) {

    } else {
      $('#location-search-input').focus();
    }
  });
}

// when user clicks on search icon switch focus to location search box
const searchIconElems = document.querySelectorAll('.icon-search');
searchIconElems.forEach((searchIconElem) => {
  if (searchIconElem) {
    searchIconElem.addEventListener('click', function () {
      if ($('#cards-search-input').val().length > 0) {

      } else {
        $('#cards-search-input').focus();
      }
    });
  }
})

setUUID();

$('.share-trigger').click(function (e) {
  e.preventDefault();

  if ($(this).hasClass('open')) {
    $(this).removeClass('open').siblings('ul').animate({
      height: '0'
    }, 500);

    $('#share-permalink').removeClass('open');
    $('#share-permalink-input').fadeOut(250);
  } else {
    $(this).addClass('open').siblings('ul').animate({
      height: '180px'
    }, 200);
    $(this).addClass('open').siblings('ul.about').animate({
      height: '180px'
    }, 200);
  }
});

$('.share-link').click(function (e) {
  if ($(this).hasClass('share-facebook')) return;

  e.preventDefault();

  if ($(this).hasClass('share-permalink')) {
    if ($('#share-permalink').hasClass('open')) {
      $('#share-permalink').removeClass('open');
      $('#share-permalink-input').fadeOut(250);
    } else {
      $('#share-permalink').addClass('open');

      $('#share-permalink-input').show()
          .position({
            my: 'right',
            at: 'left-10',
            of: $('#share-permalink')
          });

      // copy url to clipboard
      const textArea = document.getElementById('share_link');
      if (textArea) {
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
      }

    }
  } else {
    const width = 575,
        height = 320,
        left = ($(window).width() - width) / 2,
        top = ($(window).height() - height) / 2,
        url = this.href,
        opts = 'status=0' + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;

    window.open(url, 'sharepopup', opts);
  }
})


// todo cleanup global functions
window.googleAnalyticsEvent = googleAnalyticsEvent;
window.enableCustomSelect = enableCustomSelect;
window.initVariableToolTips = initVariableToolTips;
window.updateValidVariable = updateValidVariable;
window.toggleButton = toggleButton;
window.setSelectFromButton = setSelectFromButton;
window.forceResize = forceResize;
window.reEnableSelectNewItems = reEnableSelectNewItems;
