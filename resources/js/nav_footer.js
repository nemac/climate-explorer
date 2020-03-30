'use strict';

$(function () {

  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  let isAlaska = false;
  let isHawaii = false;

  if (cityStateCE) {
      isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
      isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  // setup some constants
  const navConstants = setNavItemsCostants();

  if (cityStateCE) {
    if (isAlaska || isHawaii) {
      $('#local-climate-maps-nav-footer').addClass('nav-disabled');
    }

    if (isAlaska ) {
      $('#high-tide-flooding-nav-footer').addClass('nav-disabled');
    }
  }

  // add click events to footer
  // uses invisible a link
  addNavClick('home', 'home', navConstants.selectorAddOn);
  addNavClick('local-climate-charts', 'local-climate-charts', navConstants.selectorAddOn);
  addNavClick('local-climate-maps', 'local-climate-maps', navConstants.selectorAddOn);
  addNavClick('national-climate-maps', 'national-climate-maps', navConstants.selectorAddOn);
  addNavClick('historical-weather-data', 'historical-weather-data', navConstants.selectorAddOn);
  addNavClick('high-tide-flooding', 'high-tide-flooding', navConstants.selectorAddOn);
  addNavClick('historical-thresholds', 'historical-thresholds', navConstants.selectorAddOn);
  addNavClick('next-steps', 'next-steps', navConstants.selectorAddOn);

  updateNavBar();
  addMoreClickEvent();
  addLessClickEvent();

  // this function adds click event to the more nav item
  // which expands the nav footer to show the entire station based
  // otpions.  Trying to limit the space the navbar takes up on moblie divices
  function addMoreClickEvent() {
    // setup some constants
    const navConstants = setNavItemsCostants();

    const moreWrapperNavFooterElem = document.getElementById(navConstants.moreWrapperNavFooterElem);

    if (moreWrapperNavFooterElem) {
      moreWrapperNavFooterElem.addEventListener('click', addMoreClickEventHandle);
    }
  }

  // this function adds click event to the less nav item
  // which un-expands the nav footer to hide the  station based
  // otpions.  Trying to limit the space the navbar takes up on moblie divices
  function addLessClickEvent() {
    // setup some constants
    const navConstants = setNavItemsCostants();

    const lessWrapperNavFooterElem = document.getElementById(navConstants.lessWrapperNavFooterElem);

    if (lessWrapperNavFooterElem) {
      lessWrapperNavFooterElem.addEventListener('click', addLessClickEventHandle);
    }
  }

  function nullString(checkString) {
    if (checkString === undefined || checkString === null) {
      return '';
    }
    return checkString;
  }

  function addClass(elem, cssClass) {
    if (elem) {
      elem.classList.add(cssClass);
    }
  }

  function removeClass(elem, cssClass) {
    if (elem) {
      elem.classList.remove(cssClass);
    }
  }

  function addClassAll(elems, cssClass) {
    if (elems) {
      elems.forEach((elem) => {
        if (elem) {
          elem.classList.add(cssClass);
        }
      });
    }
  }

  function removeClassAll(elems, cssClass) {
    if (elems) {
      elems.forEach((elem) => {
        if (elem) {
          elem.classList.remove(cssClass);
        }
      });
    }
  }

  // this function adds click event handler
  function addMoreClickEventHandle(e) {
    // setup some constants
    const navConstants = setNavItemsCostants();
    const navFooterRow2Elem = document.querySelector(`.${navConstants.navFooterRow2Elem}`);
    const expandedWrapperNavFooterElem = document.getElementById(navConstants.expandedWrapperNavFooterElem);
    const moreWrapperNavFooterElem = document.getElementById(navConstants.moreWrapperNavFooterElem);
    const navFooter = document.getElementById(navConstants.navFooter);
    const locationChartsViewport = document.getElementById(navConstants.locationChartsViewport);
    const historicalWeatherDataViewport = document.getElementById(navConstants.historicalWeatherDataViewport);
    const historicalThresholdsViewport = document.getElementById(navConstants.historicalThresholdsViewport);
    const highTideFloodingViewport = document.getElementById(navConstants.highTideFloodingViewport);
    const locationMapsViewport = document.getElementById(navConstants.locationMapsViewport);
    const cardsViewport = document.getElementById(navConstants.cardsViewport);
    const lessWrapperNavFooterElem = document.getElementById(navConstants.lessWrapperNavFooterElem);
    const navFooterAreaLineElem = document.querySelectorAll(`.${navConstants.navFooterAreaLineElem}`);
    const lessRow1Elem = document.getElementById(navConstants.lessRow1Elem);

    addClass(navFooterRow2Elem, 'expanded');
    addClass(expandedWrapperNavFooterElem, 'expanded');
    addClass(moreWrapperNavFooterElem, 'expanded');
    addClass(navFooter, 'expanded');
    addClass(locationChartsViewport, 'expanded');
    addClass(locationMapsViewport, 'expanded');
    addClass(historicalWeatherDataViewport, 'expanded');
    addClass(historicalThresholdsViewport, 'expanded');
    addClass(highTideFloodingViewport, 'expanded');
    addClass(cardsViewport, 'expanded');
    addClass(lessWrapperNavFooterElem, 'expanded');
    addClass(lessRow1Elem, 'expanded');

    addClassAll(navFooterAreaLineElem, 'expanded');

    // ga event action, category, label
    googleAnalyticsEvent('click', 'navbar', 'more');
  }

    // this function adds click event handler
    function addLessClickEventHandle(e) {
      // setup some constants
      const navConstants = setNavItemsCostants();
      const navFooterRow2Elem = document.querySelector(`.${navConstants.navFooterRow2Elem}`);
      const expandedWrapperNavFooterElem = document.getElementById(navConstants.expandedWrapperNavFooterElem);
      const moreWrapperNavFooterElem = document.getElementById(navConstants.moreWrapperNavFooterElem);
      const navFooter = document.getElementById(navConstants.navFooter);
      const locationChartsViewport = document.getElementById(navConstants.locationChartsViewport);
      const locationMapsViewport = document.getElementById(navConstants.locationMapsViewport);
      const historicalWeatherDataViewport = document.getElementById(navConstants.historicalWeatherDataViewport);
      const historicalThresholdsViewport = document.getElementById(navConstants.historicalThresholdsViewport);
      const highTideFloodingViewport = document.getElementById(navConstants.highTideFloodingViewport);
      const cardsViewport = document.getElementById(navConstants.cardsViewport);
      const lessWrapperNavFooterElem = document.getElementById(navConstants.lessWrapperNavFooterElem);
      const navFooterAreaLineElem = document.querySelectorAll(`.${navConstants.navFooterAreaLineElem}`);
      const lessRow1Elem = document.getElementById(navConstants.lessRow1Elem);

      removeClass(navFooterRow2Elem, 'expanded');
      removeClass(expandedWrapperNavFooterElem, 'expanded');
      removeClass(moreWrapperNavFooterElem, 'expanded');
      removeClass(navFooter, 'expanded');
      removeClass(locationChartsViewport, 'expanded');
      removeClass(locationMapsViewport, 'expanded');
      removeClass(historicalWeatherDataViewport, 'expanded');
      removeClass(historicalThresholdsViewport, 'expanded');
      removeClass(highTideFloodingViewport, 'expanded');
      removeClass(cardsViewport, 'expanded');
      removeClass(lessWrapperNavFooterElem, 'expanded');
      removeClass(lessRow1Elem, 'expanded');

      removeClassAll(navFooterAreaLineElem, 'expanded');

      // ga event action, category, label
      googleAnalyticsEvent('click', 'navbar', 'less');
    }

  // this function checks if the nav item would be hidden behind the more item
  function isMoreNav(navLocation) {
    const navConstants = setNavItemsCostants();

    // check if nav item is a more nav
    return jQuery.inArray( navLocation, navConstants.moreNavs);
  }

  // remove all selected css class nav items from the footer
  function removeSelectedNavItemClass(selector) {
    // remove all selected css class nav items from the footer
    const elems = document.querySelectorAll(`.${selector}`);
    if (elems) return null;
    elems.forEach((elem) => {
      if (elem) {
        elem.classList.remove(selector);
      }
    });
  }

  function setNavItemsCostants() {
    return {
      navFooterItemSelected: 'nav-footer-item-selected',
      navFooterItemNOTSelected: 'nav-footer-item',
      selectorAddOn: '-nav-footer',
      moreNavs: ['-999', 'historical-weather-data', 'historical-thresholds', 'high-tide-flooding'],
      moreNavFooter: 'more-nav-footer',
      expandedWrapperNavFooterElem: 'expanded-wrapper-nav-footer',
      moreWrapperNavFooterElem: 'more-wrapper-nav-footer',
      navFooterRow1Elem: 'nav-footer-row-1',
      navFooterRow2Elem: 'nav-footer-row-2',
      navFooterAreaLineElem: 'nav-footer-area-line',
      navFooter: 'nav-footer',
      cardsViewport: 'cards-viewport',
      locationChartsViewport: 'local-climate-charts-viewport',
      locationMapsViewport: 'local-climate-maps-viewport',
      historicalWeatherDataViewport: 'historical-weather-data-viewport',
      historicalThresholdsViewport: 'historical-thresholds-viewport',
      highTideFloodingViewport: 'high-tide-flooding-viewport',
      lessWrapperNavFooterElem: 'less-wrapper-nav-footer',
      lessRow1Elem: 'less-row-1'
    }
  }

  // make the location home if not defined in the state
  function ensureNavLocIsValid(navLocation) {
    // make the location home if not defined in the state
    if (navLocation === undefined || navLocation === null) {
      return 'home';
    }
    return navLocation;
  }

  // this function updates the nav bar so the current page is appears "selected"
  // in the footer nav bar
  function updateNavBar() {
      // setup some constants
      const navConstants = setNavItemsCostants();

      // get the url location from the state
      let navLocation = window.ce.ce('getNavFooterState')['nav'];

      // make the location home if not defined in the state
      navLocation = ensureNavLocIsValid(navLocation)

      // check if nav item is a more nav
      const isMoreNavItem = isMoreNav(navLocation);

      // remove all selected css class nav items from the footer
      removeSelectedNavItemClass(navConstants.navFooterItemSelected);

      // get new active nav item and chance display class
      let navLocationElem = document.querySelector(`#${navLocation}${navConstants.selectorAddOn}`)

      // make nav location home if element is null
      if (navLocationElem === undefined || navLocationElem === null) {
          navLocation = 'home';
          navLocationElem = document.querySelector(`#${navLocation}${navConstants.selectorAddOn}`)
      }

      // turnoff unselected and add selected class
      navLocationElem.classList.remove(navConstants.navFooterItemNOTSelected);
      navLocationElem.classList.add(navConstants.navFooterItemSelected);

      // if the nav item is stations based it maybe hidden in more
      // in responsive mode so we should highlight also
      if (isMoreNavItem > 0) {
        const moreElem = document.querySelector(`#more${navConstants.selectorAddOn}`)
        moreElem.classList.remove(navConstants.navFooterItemNOTSelected);
        moreElem.classList.add(navConstants.navFooterItemSelected);
      } else {
        const moreElem = document.querySelector(`#more${navConstants.selectorAddOn}`)
        moreElem.classList.remove(navConstants.navFooterItemSelected);
      }
  }


  // adds a click event to got to card location
  function addNavClick(selector, nav, selectorAddOn) {
    // setup some constants
    const navConstants = setNavItemsCostants();
    const $selectorElem = $(`#${selector}${navConstants.selectorAddOn}`);
    // if disabled exit
    if ( $selectorElem.hasClass('nav-disabled' )){
      return null;
    }

    // find the the nav-item and add click event
    $(`#${selector}${selectorAddOn}`).keyup( function(e) {
      if (e.keyCode === 13){
        e.stopPropagation();
        // remove existing nav search url parameters
        // otherwise we use the first one which is most likely the wrong page
        const seachParams = removeUrlParam('nav')

        // get the invisible link just outside the element node tree
        // if inside we have issues will bubbling propagation
        const link = document.querySelector(`#${selector}-secretlink${navConstants.selectorAddOn}`);

        // set the url and search params
        const url = `${$(link).attr('href')}/${seachParams}&nav=${nav}`
        $(link).attr('href', url);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'navbar', nav);

        // force click on invisible link
        link.click();
      }
    });

    // find the the nav-item and add click event
    $(`#${selector}${selectorAddOn}`).click( function(e) {
      e.stopPropagation();
      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const seachParams = removeUrlParam('nav')

      // get the invisible link just outside the element node tree
      // if inside we have issues will bubbling propagation
      const link = document.querySelector(`#${selector}-secretlink${navConstants.selectorAddOn}`);

      // set the url and search params
      const url = `${$(link).attr('href')}/${seachParams}&nav=${nav}`
      $(link).attr('href', url);

      // ga event action, category, label
      googleAnalyticsEvent('click', 'navbar', nav);

      // force click on invisible link
      link.click();
    });
  }


  // check if a parentelemet contains a dom id
  // deals with event bubbling so we can check
  // if the child is in a specific parent
  function ParentContains(target, id) {
    for (let p = target && target.parentElement; p; p = p.parentElement) {
      if (p.id === id) { return true; }
    }
    return false;
  }
});
