'use strict';

$(function () {

  $('#default-city-state').text(window.ce.ce('getLocationPageState')['city']);
  $('#default-city-county').text(window.ce.ce('getLocationPageState')['county']);
  $('#cards-search-input').val(window.ce.ce('getLocationPageState')['city']);

  addCardClick('.card-local-charts');

  // adds a click event to got to card location
  function addCardClick(selctor) {
    $(selctor).click( function(e) {
      const link = document.querySelector(`${selctor} #secretlink`);
      const url = `${$(link).attr('href')}/${window.location.search}`;
      $(link).attr('href', url);
      link.click();
    });

  }
});
