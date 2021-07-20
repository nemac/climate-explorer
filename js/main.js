import './ce3_ui_components.js';
import './secondary_header.js';
import './nav_footer.js';


const url_param_names = {
  'variable': 'id',
  'city': 'city',
  'county': 'county',
  'area_id': 'area-id',
  'area_label': 'area-label',
  'fips': 'fips',
  'stationId': 'station',
  'stationName': 'station-name',
  'tidalStationId': 'tidal-station',
  'tidalStationName': 'tidal-station-name',
  'tidalStationMOverMHHW': 'tidal-station-mhhw',
  'mode': 'mode',
  'zoom': 'zoom',
  'lat': 'lat',
  'lon': 'lon',
  'threshold': 'threshold',
  'window': 'window',
  'thresholdVariable': 'threshold-variable',
  // page
};


class App {
  constructor() {
    this.data_base_url = 'https://crt-climate-explorer.nemac.org/data/';
    this._state = {};
    //if(top != this) {
    //  window.open(location.href, '_top');
    // }
    this.doSearch = true;
    this.frequency = {
      'temperature-chart': 'annual',
      'precipitation-chart': 'annual',
      'derived-chart': 'annual'
    };
    this.fetchCountyCodes();

    $('[data-page]').on('click keyup keydown', function (e) {
      // suppress scrolling on spacebar
      if (e.type === 'keydown' && e.keyCode === 32) {
        e.preventDefault();
        return;
      }

      if($(e.currentTarget).hasClass('nav-disabled') || $(e.currentTarget).hasClass('btn-default-disabled') || $(e.currentTarget).hasClass('card-disabled')) {
        return;
      }

      // trigger navigation
      if (e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13))) {
        window.app.update({page: $(e.currentTarget).data('page')});
      }
    });

    $('#clear-location').on('click keyup keydown', function (e) {
      // suppress scrolling on spacebar
      if (e.type === 'keydown' && e.keyCode === 32) {
        e.preventDefault();
        return;
      }

      // trigger navigation
      if (e.type === 'click' || (e.type === 'keyup' && (e.keyCode === 32 || e.keyCode === 13))) {
        this.update({
          page: null,
          county: null,
          city: null,
          fips: null,
          stationId: null,
          stationName: null,
          tidalStationId: null,
          tidalStationName: null,
          tidalStationMOverMHHW: null
        });
        // ga event action, category, label
        googleAnalyticsEvent('click', 'location', 'clear');
      }
    }.bind(this));

    // restore state from url
    const url_search_params = new URLSearchParams(window.location.search);
    for (const k of Object.keys(url_param_names)) {
      this._state[k] = url_search_params.get(url_param_names[k]) || null;
    }
    this._state.page = window.location.pathname.replace(/\//g, '') || null;

    // this.tour();
  }

  // pass the mutated part of the state
  update(state) {

    const old_state = this._state;
    if (!('page' in old_state)) {
      old_state.page = window.location.pathname.replace(/\//g, '') || null;
    }
    this._state = Object.assign({}, old_state, state);

    // serialize state to url, forcing page change as needed
    const url_search_params = new URLSearchParams(window.location.search);
    for (const k of Object.keys(url_param_names)) {
      if (k in this._state) {
        if (typeof this._state[k] === "undefined" || this._state[k] === null) {
          url_search_params.delete(k)
        } else {
          url_search_params.set(url_param_names[k], this._state[k])
        }
      }
    }

    const url = new URL(window.location);
    url.search = '?' + url_search_params.toString();
    if (old_state['page'] !== this._state['page'] || old_state['area_id'] !== this._state['area_id']) {
      if (!!state['page']) {
        url.pathname = '/' + state['page'] + '/';
      } else {
        url.pathname = '/'
      }
      window.location.href = url;
    } else {
      window.history.replaceState(null, document.title, url.toString())
    }
  }

  get state() {
    const state = Object.assign({}, this._state);

    // computed state variables
    if (state.lat && state.lon) {
      state.center = [state.lon, state.lat];
    }

    if (state.county) {
      state.county = state.county.replace(/\+/g, ' ');
    }
    if (state.city) {
      state.city = state.city.replace(/\+/g, ' ');
    }

    if (state.extent && typeof state.extent === "string") {
      const _extent = state.extent.split(",");
      state.extent = {
        xmin: _extent[0],
        xmax: _extent[1],
        ymin: _extent[2],
        ymax: _extent[3]
      };
    }


    // todo remove backwards compatibility fix
    if (state.fips) {
      state.area_id = state.fips
    }

    state.is_alaska_area = (state.area_id || '').slice(0, 2) === '02';
    state.is_hawaii_area = (state.area_id || '').slice(0, 2) === '15';
    // since all other areas use fips codes as ids, anything which is *not* a fips code can be assumed to be an island area.
    state.is_island_area = Number.isNaN(Number.parseInt((state.area_id || '').slice(0, 2)));
    state.is_conus_area = !(state.is_alaska_area || state.is_island_area);

    return state

  }

  updateSharing() {
    $('#share_facebook').prop('href', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href));
    $('#share_twitter').prop('href', 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(window.location.href));
    $('#share_link').val(window.location.href);
  }


  fetchCountyCodes() {
    this.fips_codes = null;
    $.getJSON(this.data_base_url + 'fips_codes.json', (function (data) {
      this.fips_codes = data;
      this.initLocationSearch.bind(this)();
    }).bind(this));
  }

  initLocationSearch() {
    $(".location-mapper").formmapper({
      details: "form"
    });

    const resetResultsStyle = function () {
      const elem = document.querySelector('.location-mapper').parentElement;
      const rect = elem.getBoundingClientRect();
      const offsetTop = elem.offsetTop;
      const pacWidth = rect.width;
      setTimeout(function () {
        const pacElem = document.querySelector('.pac-container');
        pacElem.classList.remove('d-none');
        pacElem.setAttribute('style',
            `width: ${pacWidth}px !important; left: ${rect.left}px !important; top: ${offsetTop + rect.height + 1}px;`
        );
      }, 1);
    }
    // TODO figure out what the heck this does
    const resetResultsStyleOff = function () {
      setTimeout(function () {
        const pacElem = document.querySelector('.pac-container');
        if (!pacElem.classList.contains('d-none')) {
          pacElem.classList.add('d-none');
        }
        pacElem.setAttribute('style',
            `width: 0px !important; left: -99999px !important; top:  -99999px;`
        );
      }, 1);
    }
    // suppress geocode:result events while the box has focus
    // $('.location-mapper').focus(function (e) {
    //   this.doSearch = false;
    //   resetResultsStyleOff();
    // }.bind(this))
    //
    // $('.location-mapper').focusout(function () {
    //   resetResultsStyleOff();
    // })
    //
    // $('.location-mapper').on('keydown keyup keypress change', function () {
    //   this.doSearch = true;
    //   resetResultsStyle();
    // }.bind(this))

    // adds events for geocodeing locations - this gets the city, county, fips code
    $(".location-mapper").bind("geocode:result", function (event, result) {
      if (!this.doSearch) {
        return null;
      }
      const data = {
        locality: null,
        administrative_area_level_1_short: null,
        administrative_area_level_2: null,
      };
      for (const obj of result.address_components) {
        const name = obj.types[0];
        data[name] = obj.long_name;
        data[name + "_short"] = obj.short_name;
      }
      let county = data.administrative_area_level_2 ? data.administrative_area_level_2.replace(/ /g, '+') : data.locality + '+County';

      county = to_latin(county);
      let city = data.locality + ', ' + data.administrative_area_level_1_short;

      if (!data.locality) {
        city = county + ', ' + data.administrative_area_level_1_short;
      }

      let lat;
      let lon;
      if (result.geometry.access_points) {
        lat = result.geometry.access_points[0].location.lat;
        lon = result.geometry.access_points[0].location.lng;
      } else {
        lat = result.geometry.location.lat();
        lon = result.geometry.location.lng();
      }

      let fips;
      if (data.administrative_area_level_1_short === 'AK') {
        // temporary fix for Petersburg Alaska
        if (city.includes('Petersburg')) {
          fips = '02280';
        }

        // temporary fix for Hoonah-Angoon Alaska
        if (city.includes('Hoonah-Angoon')) {
          fips = '02232';
        }

        // temporary fix for Skagway Alaska
        if (city.includes('Skagway')) {
          fips = '02232';
        }
      }
      if (data.administrative_area_level_1_short === "DC") {
        fips = '11001';
      }
      if (!fips) {
        let city_replace_pattern = /\+County/g
        if (data.administrative_area_level_1_short === 'AK') {
          city_replace_pattern = /\+(Borough|Census Area|Municipality|City and Borough)/g;
        }

        if (data.administrative_area_level_1_short in this.fips_codes) {
          const county_with_spaces = county.replace(/\+/g, ' ')
          for (const c of this.fips_codes[data.administrative_area_level_1_short]) {
            // Cities that have the same boundary as their county (as is seen in the state of Virginia)
            if (data.locality === undefined && c.label === county_with_spaces) {
              fips = c.fips;
              break
              // Normal counties
            }
            if (c.label === county_with_spaces || c.label === county.replace(city_replace_pattern, ' city')) {
              fips = c.fips;
              if (c.label.match('city')) {
                county = county.replace('+County', '+City');
              }
              break
            }
          }
          if (!fips && data.administrative_area_level_1_short === 'AK' && data.administrative_area_level_2) {
            const borough = data.administrative_area_level_2.replace(city_replace_pattern, '')
            const borough_replace_pattern = /\s(Borough|Census Area|Municipality|City and Borough)/g;
            for (const c of this.fips_codes[data.administrative_area_level_1_short]) {
              if (c.label.replace(borough_replace_pattern, '') === borough) {
                fips = c.fips;
                break;
              }
            }
          }
        }
      }


      let page = window.location.pathname.replace(/\//g, '');
      if (!page) {
        page = 'cards_home';
      }

      let area_id, area_label;
      if (!!fips && fips.slice(0, 2) !== '15') {
        // ga event action, category, label
        googleAnalyticsEvent('search', 'location', fips + '-' + city + '-' + county);
        const leftMapDoneEvent = new CustomEvent('location-changed');
        window.dispatchEvent(leftMapDoneEvent);
        const zoom = 7;
        this.update({page, county, city, fips, area_id: fips, lat, lon, zoom, area_label:null});
      } else if (lat && lon) {
        // try to look up the location based on bboxes of known areas

        const bbox_length = bbox_areas.length;
        for (let i = 0; i < bbox_length; i++) {
          const bboxArea = bbox_areas[i];
          if (bboxArea[0] <= lon && bboxArea[1] <= lat && bboxArea[2] >= lon && bboxArea[3] >= lat) {
            area_id = bboxArea[4];
            area_label = bboxArea[5];
            break
          }
        }

        if (!!area_id) {
          // ga event action, category, label
          googleAnalyticsEvent('search', 'location', 'area_id-' + area_id);
          const leftMapDoneEvent = new CustomEvent('location-changed');
          window.dispatchEvent(leftMapDoneEvent);
          const zoom = 8;
          this.update({page, area_label, area_id, lat, lon, zoom, fips: null, county: null, city: null});
        }
      }
      if (!fips && !area_id){
        // do nothing, let the user search for something else.
        $('#location-search-input').css('transition','color ease-in 0.7s').css('color','#f5652d');
        setTimeout(()=>{
          $('#location-search-input').css('transition','').css('color','').val('');
        }, 1000)
      }

    }.bind(this));
  }
}

// this lives in bbox_areas.json, copied here to save a request.
// a 2d-array of the shape [[xmin, ymin, xmax,ymax, area_id]] for areas which don't have FIPS codes in CONUS + AK
// problem areas which do not show up in google Places: Howland island, Northern Mariana Islands (Google calls this CNMI, but "Saipan" also works), Baker Island
const bbox_areas = [
  [-64.927612, 17.596903, -64.464813, 18.34, "us_virgin_islands", "US Virgin Islands"],
  [-66.3373, 18.03356, -64.0679, 18.9505, "puerto_rico_ne", "Northeastern Puerto Rico (San Juan, Caguas)"],
  [-68.0816, 17.454, -66.3073, 18.5588, "puerto_rico_sw", "Southwestern Puerto Rico (Mayaguez, Ponce)"],
  [-157.4, 18.7, -153.9, 21.3, "hawaii_south", "Southern Hawaiian Islands (Hawai'i, Maui, Molokai)"],
  [-160.029977994, -0.388767184358, -159.9, -0.372491143352, "jarvis_island", "Jarvis Island (uninhabited)"],
  [-160.8, 20.4, -157.3, 23.0, "hawaii_north", "Northern Hawaiian Islands (Honolulu County, Kauaʻi County)"],
  [-162.877808, 5.550381, -161.600647, 6.820080, "palmyra_atoll_kingman_reef", "Palmyra Atoll and Kingman Reef (uninhabited)"],
  [-169.549509244, 16.7210147164, -169.51276608, 16.7626000027, "johnston_atoll", "Johnston Atoll (uninhabited)"],
  [-170.874588, -14.552944, -168.17131, -14.159583, "american_samoa", "American Samoa"],
  [-176.485829231, 0.19033437683, -176.459177213, 0.225897528448, "baker_island", "Baker Island (uninhabited)"],
  [-176.640492317, 0.790187893157, -176.636097785, 0.806952216572, "howland_island", "Howland Island (uninhabited)"],
  [-177.389597134, 28.1576585966, -177.29, 28.2153181015, "midway_islands", "Midway Islands"],
  [143.51, 14.0, 147.37, 21.58, "northern_mariana_islands", "Northern Mariana Islands"],
  [144.4, 13.2, 145.1, 13.7, "guam", "Guam"],
  [166.619395379, 19.2755801457, 166.652354363, 19.3057315127, "wake_island", "Wake Island"]
];

const latin_map = {
  "Á": "A",
  "Ă": "A",
  "Ắ": "A",
  "Ặ": "A",
  "Ằ": "A",
  "Ẳ": "A",
  "Ẵ": "A",
  "Ǎ": "A",
  "Â": "A",
  "Ấ": "A",
  "Ậ": "A",
  "Ầ": "A",
  "Ẩ": "A",
  "Ẫ": "A",
  "Ä": "A",
  "Ǟ": "A",
  "Ȧ": "A",
  "Ǡ": "A",
  "Ạ": "A",
  "Ȁ": "A",
  "À": "A",
  "Ả": "A",
  "Ȃ": "A",
  "Ā": "A",
  "Ą": "A",
  "Å": "A",
  "Ǻ": "A",
  "Ḁ": "A",
  "Ⱥ": "A",
  "Ã": "A",
  "Ꜳ": "AA",
  "Æ": "AE",
  "Ǽ": "AE",
  "Ǣ": "AE",
  "Ꜵ": "AO",
  "Ꜷ": "AU",
  "Ꜹ": "AV",
  "Ꜻ": "AV",
  "Ꜽ": "AY",
  "Ḃ": "B",
  "Ḅ": "B",
  "Ɓ": "B",
  "Ḇ": "B",
  "Ƀ": "B",
  "Ƃ": "B",
  "Ć": "C",
  "Č": "C",
  "Ç": "C",
  "Ḉ": "C",
  "Ĉ": "C",
  "Ċ": "C",
  "Ƈ": "C",
  "Ȼ": "C",
  "Ď": "D",
  "Ḑ": "D",
  "Ḓ": "D",
  "Ḋ": "D",
  "Ḍ": "D",
  "Ɗ": "D",
  "Ḏ": "D",
  "ǲ": "D",
  "ǅ": "D",
  "Đ": "D",
  "Ƌ": "D",
  "Ǳ": "DZ",
  "Ǆ": "DZ",
  "É": "E",
  "Ĕ": "E",
  "Ě": "E",
  "Ȩ": "E",
  "Ḝ": "E",
  "Ê": "E",
  "Ế": "E",
  "Ệ": "E",
  "Ề": "E",
  "Ể": "E",
  "Ễ": "E",
  "Ḙ": "E",
  "Ë": "E",
  "Ė": "E",
  "Ẹ": "E",
  "Ȅ": "E",
  "È": "E",
  "Ẻ": "E",
  "Ȇ": "E",
  "Ē": "E",
  "Ḗ": "E",
  "Ḕ": "E",
  "Ę": "E",
  "Ɇ": "E",
  "Ẽ": "E",
  "Ḛ": "E",
  "Ꝫ": "ET",
  "Ḟ": "F",
  "Ƒ": "F",
  "Ǵ": "G",
  "Ğ": "G",
  "Ǧ": "G",
  "Ģ": "G",
  "Ĝ": "G",
  "Ġ": "G",
  "Ɠ": "G",
  "Ḡ": "G",
  "Ǥ": "G",
  "Ḫ": "H",
  "Ȟ": "H",
  "Ḩ": "H",
  "Ĥ": "H",
  "Ⱨ": "H",
  "Ḧ": "H",
  "Ḣ": "H",
  "Ḥ": "H",
  "Ħ": "H",
  "Í": "I",
  "Ĭ": "I",
  "Ǐ": "I",
  "Î": "I",
  "Ï": "I",
  "Ḯ": "I",
  "İ": "I",
  "Ị": "I",
  "Ȉ": "I",
  "Ì": "I",
  "Ỉ": "I",
  "Ȋ": "I",
  "Ī": "I",
  "Į": "I",
  "Ɨ": "I",
  "Ĩ": "I",
  "Ḭ": "I",
  "Ꝺ": "D",
  "Ꝼ": "F",
  "Ᵹ": "G",
  "Ꞃ": "R",
  "Ꞅ": "S",
  "Ꞇ": "T",
  "Ꝭ": "IS",
  "Ĵ": "J",
  "Ɉ": "J",
  "Ḱ": "K",
  "Ǩ": "K",
  "Ķ": "K",
  "Ⱪ": "K",
  "Ꝃ": "K",
  "Ḳ": "K",
  "Ƙ": "K",
  "Ḵ": "K",
  "Ꝁ": "K",
  "Ꝅ": "K",
  "Ĺ": "L",
  "Ƚ": "L",
  "Ľ": "L",
  "Ļ": "L",
  "Ḽ": "L",
  "Ḷ": "L",
  "Ḹ": "L",
  "Ⱡ": "L",
  "Ꝉ": "L",
  "Ḻ": "L",
  "Ŀ": "L",
  "Ɫ": "L",
  "ǈ": "L",
  "Ł": "L",
  "Ǉ": "LJ",
  "Ḿ": "M",
  "Ṁ": "M",
  "Ṃ": "M",
  "Ɱ": "M",
  "Ń": "N",
  "Ň": "N",
  "Ņ": "N",
  "Ṋ": "N",
  "Ṅ": "N",
  "Ṇ": "N",
  "Ǹ": "N",
  "Ɲ": "N",
  "Ṉ": "N",
  "Ƞ": "N",
  "ǋ": "N",
  "Ñ": "N",
  "Ǌ": "NJ",
  "Ó": "O",
  "Ŏ": "O",
  "Ǒ": "O",
  "Ô": "O",
  "Ố": "O",
  "Ộ": "O",
  "Ồ": "O",
  "Ổ": "O",
  "Ỗ": "O",
  "Ö": "O",
  "Ȫ": "O",
  "Ȯ": "O",
  "Ȱ": "O",
  "Ọ": "O",
  "Ő": "O",
  "Ȍ": "O",
  "Ò": "O",
  "Ỏ": "O",
  "Ơ": "O",
  "Ớ": "O",
  "Ợ": "O",
  "Ờ": "O",
  "Ở": "O",
  "Ỡ": "O",
  "Ȏ": "O",
  "Ꝋ": "O",
  "Ꝍ": "O",
  "Ō": "O",
  "Ṓ": "O",
  "Ṑ": "O",
  "Ɵ": "O",
  "Ǫ": "O",
  "Ǭ": "O",
  "Ø": "O",
  "Ǿ": "O",
  "Õ": "O",
  "Ṍ": "O",
  "Ṏ": "O",
  "Ȭ": "O",
  "Ƣ": "OI",
  "Ꝏ": "OO",
  "Ɛ": "E",
  "Ɔ": "O",
  "Ȣ": "OU",
  "Ṕ": "P",
  "Ṗ": "P",
  "Ꝓ": "P",
  "Ƥ": "P",
  "Ꝕ": "P",
  "Ᵽ": "P",
  "Ꝑ": "P",
  "Ꝙ": "Q",
  "Ꝗ": "Q",
  "Ŕ": "R",
  "Ř": "R",
  "Ŗ": "R",
  "Ṙ": "R",
  "Ṛ": "R",
  "Ṝ": "R",
  "Ȑ": "R",
  "Ȓ": "R",
  "Ṟ": "R",
  "Ɍ": "R",
  "Ɽ": "R",
  "Ꜿ": "C",
  "Ǝ": "E",
  "Ś": "S",
  "Ṥ": "S",
  "Š": "S",
  "Ṧ": "S",
  "Ş": "S",
  "Ŝ": "S",
  "Ș": "S",
  "Ṡ": "S",
  "Ṣ": "S",
  "Ṩ": "S",
  "Ť": "T",
  "Ţ": "T",
  "Ṱ": "T",
  "Ț": "T",
  "Ⱦ": "T",
  "Ṫ": "T",
  "Ṭ": "T",
  "Ƭ": "T",
  "Ṯ": "T",
  "Ʈ": "T",
  "Ŧ": "T",
  "Ɐ": "A",
  "Ꞁ": "L",
  "Ɯ": "M",
  "Ʌ": "V",
  "Ꜩ": "TZ",
  "Ú": "U",
  "Ŭ": "U",
  "Ǔ": "U",
  "Û": "U",
  "Ṷ": "U",
  "Ü": "U",
  "Ǘ": "U",
  "Ǚ": "U",
  "Ǜ": "U",
  "Ǖ": "U",
  "Ṳ": "U",
  "Ụ": "U",
  "Ű": "U",
  "Ȕ": "U",
  "Ù": "U",
  "Ủ": "U",
  "Ư": "U",
  "Ứ": "U",
  "Ự": "U",
  "Ừ": "U",
  "Ử": "U",
  "Ữ": "U",
  "Ȗ": "U",
  "Ū": "U",
  "Ṻ": "U",
  "Ų": "U",
  "Ů": "U",
  "Ũ": "U",
  "Ṹ": "U",
  "Ṵ": "U",
  "Ꝟ": "V",
  "Ṿ": "V",
  "Ʋ": "V",
  "Ṽ": "V",
  "Ꝡ": "VY",
  "Ẃ": "W",
  "Ŵ": "W",
  "Ẅ": "W",
  "Ẇ": "W",
  "Ẉ": "W",
  "Ẁ": "W",
  "Ⱳ": "W",
  "Ẍ": "X",
  "Ẋ": "X",
  "Ý": "Y",
  "Ŷ": "Y",
  "Ÿ": "Y",
  "Ẏ": "Y",
  "Ỵ": "Y",
  "Ỳ": "Y",
  "Ƴ": "Y",
  "Ỷ": "Y",
  "Ỿ": "Y",
  "Ȳ": "Y",
  "Ɏ": "Y",
  "Ỹ": "Y",
  "Ź": "Z",
  "Ž": "Z",
  "Ẑ": "Z",
  "Ⱬ": "Z",
  "Ż": "Z",
  "Ẓ": "Z",
  "Ȥ": "Z",
  "Ẕ": "Z",
  "Ƶ": "Z",
  "Ĳ": "IJ",
  "Œ": "OE",
  "ᴀ": "A",
  "ᴁ": "AE",
  "ʙ": "B",
  "ᴃ": "B",
  "ᴄ": "C",
  "ᴅ": "D",
  "ᴇ": "E",
  "ꜰ": "F",
  "ɢ": "G",
  "ʛ": "G",
  "ʜ": "H",
  "ɪ": "I",
  "ʁ": "R",
  "ᴊ": "J",
  "ᴋ": "K",
  "ʟ": "L",
  "ᴌ": "L",
  "ᴍ": "M",
  "ɴ": "N",
  "ᴏ": "O",
  "ɶ": "OE",
  "ᴐ": "O",
  "ᴕ": "OU",
  "ᴘ": "P",
  "ʀ": "R",
  "ᴎ": "N",
  "ᴙ": "R",
  "ꜱ": "S",
  "ᴛ": "T",
  "ⱻ": "E",
  "ᴚ": "R",
  "ᴜ": "U",
  "ᴠ": "V",
  "ᴡ": "W",
  "ʏ": "Y",
  "ᴢ": "Z",
  "á": "a",
  "ă": "a",
  "ắ": "a",
  "ặ": "a",
  "ằ": "a",
  "ẳ": "a",
  "ẵ": "a",
  "ǎ": "a",
  "â": "a",
  "ấ": "a",
  "ậ": "a",
  "ầ": "a",
  "ẩ": "a",
  "ẫ": "a",
  "ä": "a",
  "ǟ": "a",
  "ȧ": "a",
  "ǡ": "a",
  "ạ": "a",
  "ȁ": "a",
  "à": "a",
  "ả": "a",
  "ȃ": "a",
  "ā": "a",
  "ą": "a",
  "ᶏ": "a",
  "ẚ": "a",
  "å": "a",
  "ǻ": "a",
  "ḁ": "a",
  "ⱥ": "a",
  "ã": "a",
  "ꜳ": "aa",
  "æ": "ae",
  "ǽ": "ae",
  "ǣ": "ae",
  "ꜵ": "ao",
  "ꜷ": "au",
  "ꜹ": "av",
  "ꜻ": "av",
  "ꜽ": "ay",
  "ḃ": "b",
  "ḅ": "b",
  "ɓ": "b",
  "ḇ": "b",
  "ᵬ": "b",
  "ᶀ": "b",
  "ƀ": "b",
  "ƃ": "b",
  "ɵ": "o",
  "ć": "c",
  "č": "c",
  "ç": "c",
  "ḉ": "c",
  "ĉ": "c",
  "ɕ": "c",
  "ċ": "c",
  "ƈ": "c",
  "ȼ": "c",
  "ď": "d",
  "ḑ": "d",
  "ḓ": "d",
  "ȡ": "d",
  "ḋ": "d",
  "ḍ": "d",
  "ɗ": "d",
  "ᶑ": "d",
  "ḏ": "d",
  "ᵭ": "d",
  "ᶁ": "d",
  "đ": "d",
  "ɖ": "d",
  "ƌ": "d",
  "ı": "i",
  "ȷ": "j",
  "ɟ": "j",
  "ʄ": "j",
  "ǳ": "dz",
  "ǆ": "dz",
  "é": "e",
  "ĕ": "e",
  "ě": "e",
  "ȩ": "e",
  "ḝ": "e",
  "ê": "e",
  "ế": "e",
  "ệ": "e",
  "ề": "e",
  "ể": "e",
  "ễ": "e",
  "ḙ": "e",
  "ë": "e",
  "ė": "e",
  "ẹ": "e",
  "ȅ": "e",
  "è": "e",
  "ẻ": "e",
  "ȇ": "e",
  "ē": "e",
  "ḗ": "e",
  "ḕ": "e",
  "ⱸ": "e",
  "ę": "e",
  "ᶒ": "e",
  "ɇ": "e",
  "ẽ": "e",
  "ḛ": "e",
  "ꝫ": "et",
  "ḟ": "f",
  "ƒ": "f",
  "ᵮ": "f",
  "ᶂ": "f",
  "ǵ": "g",
  "ğ": "g",
  "ǧ": "g",
  "ģ": "g",
  "ĝ": "g",
  "ġ": "g",
  "ɠ": "g",
  "ḡ": "g",
  "ᶃ": "g",
  "ǥ": "g",
  "ḫ": "h",
  "ȟ": "h",
  "ḩ": "h",
  "ĥ": "h",
  "ⱨ": "h",
  "ḧ": "h",
  "ḣ": "h",
  "ḥ": "h",
  "ɦ": "h",
  "ẖ": "h",
  "ħ": "h",
  "ƕ": "hv",
  "í": "i",
  "ĭ": "i",
  "ǐ": "i",
  "î": "i",
  "ï": "i",
  "ḯ": "i",
  "ị": "i",
  "ȉ": "i",
  "ì": "i",
  "ỉ": "i",
  "ȋ": "i",
  "ī": "i",
  "į": "i",
  "ᶖ": "i",
  "ɨ": "i",
  "ĩ": "i",
  "ḭ": "i",
  "ꝺ": "d",
  "ꝼ": "f",
  "ᵹ": "g",
  "ꞃ": "r",
  "ꞅ": "s",
  "ꞇ": "t",
  "ꝭ": "is",
  "ǰ": "j",
  "ĵ": "j",
  "ʝ": "j",
  "ɉ": "j",
  "ḱ": "k",
  "ǩ": "k",
  "ķ": "k",
  "ⱪ": "k",
  "ꝃ": "k",
  "ḳ": "k",
  "ƙ": "k",
  "ḵ": "k",
  "ᶄ": "k",
  "ꝁ": "k",
  "ꝅ": "k",
  "ĺ": "l",
  "ƚ": "l",
  "ɬ": "l",
  "ľ": "l",
  "ļ": "l",
  "ḽ": "l",
  "ȴ": "l",
  "ḷ": "l",
  "ḹ": "l",
  "ⱡ": "l",
  "ꝉ": "l",
  "ḻ": "l",
  "ŀ": "l",
  "ɫ": "l",
  "ᶅ": "l",
  "ɭ": "l",
  "ł": "l",
  "ǉ": "lj",
  "ſ": "s",
  "ẜ": "s",
  "ẛ": "s",
  "ẝ": "s",
  "ḿ": "m",
  "ṁ": "m",
  "ṃ": "m",
  "ɱ": "m",
  "ᵯ": "m",
  "ᶆ": "m",
  "ń": "n",
  "ň": "n",
  "ņ": "n",
  "ṋ": "n",
  "ȵ": "n",
  "ṅ": "n",
  "ṇ": "n",
  "ǹ": "n",
  "ɲ": "n",
  "ṉ": "n",
  "ƞ": "n",
  "ᵰ": "n",
  "ᶇ": "n",
  "ɳ": "n",
  "ñ": "n",
  "ǌ": "nj",
  "ó": "o",
  "ŏ": "o",
  "ǒ": "o",
  "ô": "o",
  "ố": "o",
  "ộ": "o",
  "ồ": "o",
  "ổ": "o",
  "ỗ": "o",
  "ö": "o",
  "ȫ": "o",
  "ȯ": "o",
  "ȱ": "o",
  "ọ": "o",
  "ő": "o",
  "ȍ": "o",
  "ò": "o",
  "ỏ": "o",
  "ơ": "o",
  "ớ": "o",
  "ợ": "o",
  "ờ": "o",
  "ở": "o",
  "ỡ": "o",
  "ȏ": "o",
  "ꝋ": "o",
  "ꝍ": "o",
  "ⱺ": "o",
  "ō": "o",
  "ṓ": "o",
  "ṑ": "o",
  "ǫ": "o",
  "ǭ": "o",
  "ø": "o",
  "ǿ": "o",
  "õ": "o",
  "ṍ": "o",
  "ṏ": "o",
  "ȭ": "o",
  "ƣ": "oi",
  "ꝏ": "oo",
  "ɛ": "e",
  "ᶓ": "e",
  "ɔ": "o",
  "ᶗ": "o",
  "ȣ": "ou",
  "ṕ": "p",
  "ṗ": "p",
  "ꝓ": "p",
  "ƥ": "p",
  "ᵱ": "p",
  "ᶈ": "p",
  "ꝕ": "p",
  "ᵽ": "p",
  "ꝑ": "p",
  "ꝙ": "q",
  "ʠ": "q",
  "ɋ": "q",
  "ꝗ": "q",
  "ŕ": "r",
  "ř": "r",
  "ŗ": "r",
  "ṙ": "r",
  "ṛ": "r",
  "ṝ": "r",
  "ȑ": "r",
  "ɾ": "r",
  "ᵳ": "r",
  "ȓ": "r",
  "ṟ": "r",
  "ɼ": "r",
  "ᵲ": "r",
  "ᶉ": "r",
  "ɍ": "r",
  "ɽ": "r",
  "ↄ": "c",
  "ꜿ": "c",
  "ɘ": "e",
  "ɿ": "r",
  "ś": "s",
  "ṥ": "s",
  "š": "s",
  "ṧ": "s",
  "ş": "s",
  "ŝ": "s",
  "ș": "s",
  "ṡ": "s",
  "ṣ": "s",
  "ṩ": "s",
  "ʂ": "s",
  "ᵴ": "s",
  "ᶊ": "s",
  "ȿ": "s",
  "ɡ": "g",
  "ᴑ": "o",
  "ᴓ": "o",
  "ᴝ": "u",
  "ť": "t",
  "ţ": "t",
  "ṱ": "t",
  "ț": "t",
  "ȶ": "t",
  "ẗ": "t",
  "ⱦ": "t",
  "ṫ": "t",
  "ṭ": "t",
  "ƭ": "t",
  "ṯ": "t",
  "ᵵ": "t",
  "ƫ": "t",
  "ʈ": "t",
  "ŧ": "t",
  "ᵺ": "th",
  "ɐ": "a",
  "ᴂ": "ae",
  "ǝ": "e",
  "ᵷ": "g",
  "ɥ": "h",
  "ʮ": "h",
  "ʯ": "h",
  "ᴉ": "i",
  "ʞ": "k",
  "ꞁ": "l",
  "ɯ": "m",
  "ɰ": "m",
  "ᴔ": "oe",
  "ɹ": "r",
  "ɻ": "r",
  "ɺ": "r",
  "ⱹ": "r",
  "ʇ": "t",
  "ʌ": "v",
  "ʍ": "w",
  "ʎ": "y",
  "ꜩ": "tz",
  "ú": "u",
  "ŭ": "u",
  "ǔ": "u",
  "û": "u",
  "ṷ": "u",
  "ü": "u",
  "ǘ": "u",
  "ǚ": "u",
  "ǜ": "u",
  "ǖ": "u",
  "ṳ": "u",
  "ụ": "u",
  "ű": "u",
  "ȕ": "u",
  "ù": "u",
  "ủ": "u",
  "ư": "u",
  "ứ": "u",
  "ự": "u",
  "ừ": "u",
  "ử": "u",
  "ữ": "u",
  "ȗ": "u",
  "ū": "u",
  "ṻ": "u",
  "ų": "u",
  "ᶙ": "u",
  "ů": "u",
  "ũ": "u",
  "ṹ": "u",
  "ṵ": "u",
  "ᵫ": "ue",
  "ꝸ": "um",
  "ⱴ": "v",
  "ꝟ": "v",
  "ṿ": "v",
  "ʋ": "v",
  "ᶌ": "v",
  "ⱱ": "v",
  "ṽ": "v",
  "ꝡ": "vy",
  "ẃ": "w",
  "ŵ": "w",
  "ẅ": "w",
  "ẇ": "w",
  "ẉ": "w",
  "ẁ": "w",
  "ⱳ": "w",
  "ẘ": "w",
  "ẍ": "x",
  "ẋ": "x",
  "ᶍ": "x",
  "ý": "y",
  "ŷ": "y",
  "ÿ": "y",
  "ẏ": "y",
  "ỵ": "y",
  "ỳ": "y",
  "ƴ": "y",
  "ỷ": "y",
  "ỿ": "y",
  "ȳ": "y",
  "ẙ": "y",
  "ɏ": "y",
  "ỹ": "y",
  "ź": "z",
  "ž": "z",
  "ẑ": "z",
  "ʑ": "z",
  "ⱬ": "z",
  "ż": "z",
  "ẓ": "z",
  "ȥ": "z",
  "ẕ": "z",
  "ᵶ": "z",
  "ᶎ": "z",
  "ʐ": "z",
  "ƶ": "z",
  "ɀ": "z",
  "ﬀ": "ff",
  "ﬃ": "ffi",
  "ﬄ": "ffl",
  "ﬁ": "fi",
  "ﬂ": "fl",
  "ĳ": "ij",
  "œ": "oe",
  "ﬆ": "st",
  "ₐ": "a",
  "ₑ": "e",
  "ᵢ": "i",
  "ⱼ": "j",
  "ₒ": "o",
  "ᵣ": "r",
  "ᵤ": "u",
  "ᵥ": "v",
  "ₓ": "x"
};

function to_latin(value) {
  return value.replace(/[^A-Za-z0-9\[\] ]/g, function (a) {
    return latin_map[a] || a;
  });
}


// IIFE
if (typeof window.app === "undefined") {
  window.app = new App();
}
