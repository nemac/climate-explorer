'use strict';

const navConstants = {
  moreNavFooter: '#more-nav-footer',
  expandedWrapperNavFooterElem: '#expanded-wrapper-nav-footer',
  moreWrapperNavFooterElem: '#more-wrapper-nav-footer',
  navFooterRow1Elem: '.nav-footer-row-1',
  navFooterRow2Elem: '.nav-footer-row-2',
  navFooterAreaLineElem: '.nav-footer-area-line',
  navFooter: '#nav-footer',
  cardsViewport: '#cards-viewport',
  nextStepsViewport: '#next-steps-viewport',
  locationChartsViewport: '#climate-graphs-viewport',
  locationMapsViewport: '#climate-maps-viewport',
  highTideFloodingViewport: '#high-tide-flooding-viewport',
  lessWrapperNavFooterElem: '#less-wrapper-nav-footer',
  lessRow1Elem: '#less-row-1'
}

$(function () {

  const state = window.app.state;
  const area_id = state['area_id'];
  const is_alaska_area = state['is_alaska_area'];
  const is_conus_area = state['is_conus_area'];


  if (area_id) {
    if (!is_conus_area) {
      $('#climate-maps-nav-footer').addClass('nav-disabled');
    }

    if (is_alaska_area) {
      $('#high-tide-flooding-nav-footer').addClass('nav-disabled');
    }
  }

  updateNavBar();
  // setup some constants

  const moreWrapperNavFooterElem = document.querySelector(navConstants.moreWrapperNavFooterElem);



  if (moreWrapperNavFooterElem) {
    moreWrapperNavFooterElem.addEventListener('click', () => {
      document.querySelectorAll(Object.values(navConstants).join(',')).forEach((el) => {
        el.classList.add('expanded');
      });

      // ga event action, category, label
      googleAnalyticsEvent('click', 'navbar', 'more');
    });
  }
  // setup some constants


  const lessWrapperNavFooterElem = document.querySelector(navConstants.lessWrapperNavFooterElem);

  if (lessWrapperNavFooterElem) {
    lessWrapperNavFooterElem.addEventListener('click', () => {
      document.querySelectorAll(Object.values(navConstants).join(',')).forEach((el) => {
        el.classList.remove('expanded');
      });

      // ga event action, category, label
      googleAnalyticsEvent('click', 'navbar', 'less');
    });
  }

  // this function adds click event to the more nav item
  // which expands the nav footer to show the entire station based
  // options.  Trying to limit the space the navbar takes up on moblie divices
  // this function adds click event to the less nav item
  // which un-expands the nav footer to hide the  station based
  // options.  Trying to limit the space the navbar takes up on moblie divices
  // this function checks if the nav item would be hidden behind the more item
  function isMoreNav(navLocation) {
    // check if nav item is a more nav
    return jQuery.inArray(navLocation, ['-999', 'historical-thresholds', 'high-tide-flooding']);
  }

  // this function updates the nav bar so the current page is appears "selected"
  // in the footer nav bar
  function updateNavBar() {
    // setup some constants


    // get the url location from the state
    let page = window.app.state['page'];

    // make the location home if not defined in the state
    if (page === undefined || page === null) {
      page = 'home';
    }

    // check if nav item is a more nav
    const isMoreNavItem = isMoreNav(page);

    // remove all selected css class nav items from the footer
    document.querySelectorAll('.nav-footer-item-selected').forEach((elem) => {
      elem.classList.remove('nav-footer-item-selected');
    });

    // get new active nav item and chance display class
    let navLocationElem = document.querySelector(`#${page.replace(/_/g, '-')}-nav-footer`) || document.querySelector('#home-nav-footer')

    // make nav location home if element is null
    if (!!navLocationElem) {
      // turnoff unselected and add selected class
      navLocationElem.classList.remove('nav-footer-item');
      navLocationElem.classList.add('nav-footer-item-selected');

      // if the nav item is stations based it maybe hidden in more
      // in responsive mode so we should highlight also
      if (isMoreNavItem > 0) {
        const moreElem = document.querySelector(`#more-nav-footer`)
        moreElem.classList.remove('nav-footer-item');
        moreElem.classList.add(navConstants.navFooterItemSelected);
      } else {
        const moreElem = document.querySelector(`#more-nav-footer`)
        moreElem.classList.remove(navConstants.navFooterItemSelected);
      }
    }
  }
});
