'use strict';

$(function () {

  addAboutlick('credits');
  addAboutlick('about');
  addAboutlick('definitions');
  addAboutlick('faq');


  // adds a click event to got to card location
  function addAboutlick(selector) {
    // find the the about-item and add click event
    $(`.about-${selector}-link`).click( function(e) {
      e.stopPropagation();

      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const seachParams = window.location.search.substring(1)

      // get the invisiable link just outside the element node tree
      // if inside we have issues will bubbling propogation
      const link = document.querySelector(`.about-${selector}-link`);

      // set the url and search params
      const url = `/${selector}/?${seachParams}`


      $(link).attr('href', url);

      // force click on invisible link
      link.click();
    });
  }

});
