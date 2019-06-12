'use strict';

$(function () {

  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  // setup some constants
  const navFooterItemSelected = 'nav-footer-item-selected';
  const navFooterItemNOTSelected = 'nav-footer-item';
  const selectorAddOn = '-nav-footer';

  // add click events to footer
  // uses invisiable a link
  addNavlick('home', 'home', selectorAddOn);
  addNavlick('local-climate-charts', 'local-climate-charts', selectorAddOn);

  // get the url location from the state
  let navLocation = window.ce.ce('getNavFooterState')['nav'];

  // make the location home if not defined in the state
  if (navLocation === undefined || navLocation === null) {
    navLocation = 'home';
  }

  // remove all selected nav items from the footer
  const elems = document.querySelectorAll(`.${navFooterItemSelected}`);
  elems.forEach((elem) => {
    if (elem) {
      elem.classList.remove(navFooterItemSelected);
    }
  });

  // get new active nav item and chance display class
  let navLocationElem = document.querySelector(`#${navLocation}${selectorAddOn}`)

  // make nav location home if element is null
  if (navLocationElem === undefined || navLocationElem === null) {
      navLocation = 'home';
      navLocationElem = document.querySelector(`#${navLocation}${selectorAddOn}`)
  }

  // turnoff unselected and add selected class
  navLocationElem.classList.remove(navFooterItemNOTSelected);
  navLocationElem.classList.add(navFooterItemSelected);

  // adds a click event to got to card location
  function addNavlick(selector, nav, selectorAddOn) {
    // find the the nav-item and add click event
    $(`#${selector}${selectorAddOn}`).click( function(e) {
      e.stopPropagation();

      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const seachParams =  removeUrlParam('nav')

      // get the invisiable link just outside the element node tree
      // if inside we have issues will bubbling propogation
      const link = document.querySelector(`#${selector}-secretlink${selectorAddOn}`);

      // set the url and search params
      const url = `${$(link).attr('href')}/${seachParams}&nav=${nav}`
      $(link).attr('href', url);

      // force click on invisiable link
      link.click();
    });
  }

  //  TODO move this global functions so its not in two places
  // this function removes existing paramaters of the key undefined
  // and returns a new search param string.  We need to do this to avoid
  // mulitple nav paramaters, which would causes issues with only using the first
  // occurance of the nav parameter - aka we end up on the wrong page
  function removeUrlParam(key) {
    var params = decodeURIComponent(window.location.search.substring(1)).split("&");
    var param = void 0;
    var newParams = [],
        href = window.location.href.split("?")[0];
    var i = void 0;

    if (window.hasOwnProperty("history") === false || window.history.replaceState === false) return;

    for (i = 0; i < params.length; i++) {
      param = params[i].split('=');

      if (param[0] === key) {
        continue;
      }

      newParams.push(encodeURIComponent(param[0]) + "=" + encodeURIComponent(param[1]));
    }

    if (params.length !== newParams.length) {
      return  "?" + newParams.join("&");
    }

    return ""
  }

});
