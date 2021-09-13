import './main.js';

$(function () {
  const state = window.app.state;
  const city_label = state['city'];
  const county_label = state['county'];
  const area_label = state['area_label'];
  const is_alaska_area = state['is_alaska_area'];
  const is_conus_area = state['is_conus_area'];

  $('#default-city-county').text(county_label || area_label);
  $('#cards-search-input').attr("placeholder", city_label || area_label);


  $('.footer-button').removeClass('footer-button-selected');
  $('[data-page="cards_home"]').addClass('footer-button-selected');

  if (!city_label && !area_label) {
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }

  /**
   * Disable specific cards/footer_nav items for different regions.
   *  ex: Disable climate_maps and high_tide_flooding for Alaska regions.
   */
  if (city_label || area_label) {
    if (!is_conus_area) {
      $('[data-page="climate_maps"]').addClass('disabled');
      $('[data-page="climate_maps"]').find(".disabled-text").removeClass("d-none");
    }
    if (is_alaska_area) {
      $('[data-page="high_tide_flooding"]').addClass('disabled');
      $('[data-page="high_tide_flooding"]').find(".disabled-text").removeClass("d-none");
    } else {
      $('.opt-only-ak').addClass('default-select-option-disabled');
    }

    if (!!city_label && city_label.indexOf('County') > 0) {
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }
});
