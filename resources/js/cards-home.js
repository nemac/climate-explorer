'use strict';

$(function () {

  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  addCardClick('card-local-charts','local-climate-charts');

  // adds a click event to got to card location
  function addCardClick(selctor, nav) {
    // find the the nav-item and add click event
    $(`.${selctor}`).click( function(e) {
      e.stopPropagation();

      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const link = document.querySelector(`#${selctor}-secretlink`);

      // get the invisiable link just outside the element node tree
      // if inside we have issues will bubbling propogation
      const seachParams =  removeUrlParam('nav');

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
});
