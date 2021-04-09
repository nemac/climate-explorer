'use strict';

$(function () {

  addAboutlick('credits');
  addAboutlick('about');
  addAboutlick('glossary');
  addAboutlick('faq');


  // adds a click event to got to card location
  function addAboutlick(selector) {
    // find the the about-item and add click event
    $(`.about-${selector}-link`).click( function(e) {
      e.stopPropagation();

      // remove existing nav search url parameters
      // otherwise we use the first one which is most likely the wrong page
      const searchParams = window.location.search.substring(1)

      // get the invisible link just outside the element node tree
      // if inside we have issues will bubbling propagation
      const link = document.querySelector(`.about-${selector}-link`);
      // set the url and search params
      const url = `/${selector}/?${searchParams}`


      $(link).attr('href', url);

      // force click on invisible link
      link.click();
    });
  }

});
