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


  if (!city_label && !area_label) {
    $('#default-dash').addClass('d-none');
    $('#cards-search-input').addClass('nosearch');
    $('#cards-search-input').attr("placeholder", "Location missing, enter a county or city name");
  }

  if (city_label || area_label) {
    if (!is_conus_area) {
      $('.opt-not-ak').addClass('default-select-option-disabled');
      $('.card-local-maps').addClass('card-disabled');  //switch to querySelector(".data-card[data-page='climate_maps']")
    }
    if (is_alaska_area) {
      $('.card-high-tide-flooding').addClass('card-disabled');
    } else {
      $('.opt-only-ak').addClass('default-select-option-disabled');
    }

    if (!!city_label && city_label.indexOf('County') > 0) {
      $('#default-dash').addClass('d-none');
      $('#default-city-county').text('');
    }
  }
});
