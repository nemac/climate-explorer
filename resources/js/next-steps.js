'use strict';

// get state location information fron URL state management
// some state management is in main.js and ce.js
// some ui utility code is in ce3-ui-components.js
$(function () {
  const cityStateCE = window.ce.ce('getLocationPageState')['city'];
  const countyCE = window.ce.ce('getLocationPageState')['county'];
  let isAlaska = false;
  let isHawaii = false;

  // make sure city state is defined
  // if so instantiate check for Alaska or Hawaii
  if (cityStateCE) {
      isAlaska = (cityStateCE.indexOf('Alaska') > 0 || cityStateCE.indexOf(', AK') > 0);
      isHawaii = (cityStateCE.indexOf('Hawaii') > 0 || cityStateCE.indexOf(', HI') > 0);
  }

  // update ui with city state or county information
  $('#default-city-state').text(cityStateCE);
  $('#default-city-county').text(countyCE);
  $('#cards-search-input').attr("placeholder", cityStateCE);

  // if city state is no defined add missing location warning
  if (!cityStateCE) {
    $('#default-city-state').addClass('d-none');
    $('#default-in').addClass('d-none');
    $('#default-city-county').addClass('d-none');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county, city, or zip code");
  }

  // if  Alaska or Hawaii disable text not applicable for locations
  if (cityStateCE) {
    if (isAlaska || isHawaii) {
      $('#default-in').html('—');
      $('.opt-not-ak').addClass('default-select-option-disabled');
      $('.card-local-maps').addClass('card-disabled');
    } else {
      $('.opt-only-ak').addClass('default-select-option-disabled');
    }

    if (isAlaska) {
      $('.card-high-tide-flooding').addClass('card-disabled');
    }

    if (cityStateCE.indexOf('County') > 0  ) {
      $('#default-in').addClass('d-none');
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }


  // adds click for cards, mosty the card is clickable to a href tag
  addCardClick('next-steps-option-1','local-climate-charts');
  addCardClick('next-steps-option-2','local-climate-maps');


  // adds clear location when x is clicked next to location search
  $('#clear-location').click( function(e){
    const target = $(e.target);
    handleClearLocationClick(target);
  })

  // adds a click event to got to card location
  function addCardClick(selctor, nav) {
    // setup some constants
    const $selectorElem = $(`.${selctor}`);
    // if disabled exit
    if ( $selectorElem.hasClass('card-disabled' )){
      return null;
    }

    // find the the nav-item and add click event
    $(`.${selctor}`).keyup( function(e) {
      if (e.keyCode === 13){
        e.stopPropagation();

        // remove existing nav search url parameters
        // otherwise we use the first one which is most likely the wrong page
        const link = document.querySelector(`#${selctor}-secretlink`);


        // set the url and search params uncomment if going to another ce3 page
        // get the invisible link just outside the element node tree
        // if inside we have issues will bubbling propagation
        // const seachParams =  removeUrlParam('nav');

        // set the url and search params uncomment if going to another ce3 page
        // const url = `${$(link).attr('href')}/${seachParams}&nav=${nav}`
        // $(link).attr('href', url);
         $(link).attr('href', link);

        // ga event action, category, label
        googleAnalyticsEvent('click-tab', 'next-steps', nav);

        // force click on invisible link
        link.click();
      }
    });

    // find the the nav-item and add click event
    $(`.${selctor}`).click( function(e) {
      e.stopPropagation();

      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const link = document.querySelector(`#${selctor}-secretlink`);

      // set the url and search params uncomment if going to another ce3 page
      // get the invisible link just outside the element node tree
      // if inside we have issues will bubbling propagation
      // const seachParams =  removeUrlParam('nav');

      // set the url and search params uncomment if going to another ce3 page
      // set the url and search params
      // const url = `${$(link).attr('href')}/${seachParams}&nav=${nav}`
      // $(link).attr('href', url);
       $(link).attr('href', link);

      // ga event action, category, label
      googleAnalyticsEvent('click-tab', 'next-steps', nav);

      // force click on invisible link
      link.click();
    });
  }

  //  TODO move this global functions so its not in several places
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
