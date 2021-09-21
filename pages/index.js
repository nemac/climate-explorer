import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';

// language=HTML
export default (config) => `
<!doctype html>
<html lang='en' class="width-100">
<head>

  ${head(config)}

  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Climate Explorer">
  <meta property="og:description" content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body id="page-home" class="width-100 height-100">
  ${secondary_header(config)}


  <div id="home-viewport" class="home-container padding-default d-flex-left d-flex-column" >
    <div id="home-text" class="d-flex d-flex-column width-80 padding-bottom">
      <span class="describe-title padding-horizontal padding-bottom-half width-100">The Climate Explorer</span>
      <div class="home-text-box d-flex">
        <div class="describe-main padding-horizontal padding-bottom-half width-100">Explore how climate is projected to change in your county.</div>
        <div class="describe-main-secondary d-flex-center d-flex-wrap padding-horizontal padding-bottom-half">
          <h4 class="d-flex-center">New!</h4>
          <h5>Climate projection charts are now available for <a href="/faq/#supported-areas" style="color: white; text-decoration: underline;
">Hawai'i and U.S. territories</a>.</h5>
        </div>
      </div>
    </div>

    <div class="search-row d-flex d-flex-column d-flex-left w-100 padding-bottom">
      <div class="rounded-box input-outer-main padding-horizontal bottom-padding main-btn-height w-75">
        <input id="location-search-input" type="text" class="location-mapper input-inner border-none main-btn-height w-75" autocomplete="off" placeholder="To get started, enter a city, county, or other placename" aria-label="To get started, enter a city, county, or other placename">
          <span id="location-search-icon" class="icon icon-search search-main float-right padding-default"></span>
      </div>
      <div id="suggested-cities" class="padding-default w-75">
        <div class="suggested-cities-desc" >or click one of these cities:</div>
        <a href="/cards_home/?county=New%20York+County&city=New%20York,%20NY&fips=36061&lat=40.7127753&lon=-74.0059728">New York City, NY</a>
        <a href="/cards_home/?county=Los+Angeles+County&city=Los%20Angeles,%20CA&fips=06037&lat=34.0522342&lon=-118.2436849">Los Angeles, CA</a>
        <a href="/cards_home/?county=Anchorage%20Municipality&city=Anchorage,%20AK&fips=02020&lat=61.2180556&lon=-149.9002778">Anchorage, AK</a>
        <a href="/cards_home/?county=Maricopa+County&city=Phoenix,%20AZ&fips=04013&lat=33.4483771&lon=-112.07403729999999">Phoenix, AZ</a>
        <a href="/cards_home/?county=Harris+County&city=Houston,%20TX&fips=48201&lat=29.7604267&lon=-95.3698028">Houston, TX</a>
        <a href="/cards_home/?area-id=hawaii_north&area-label=Northern+Hawaiian+Islands+%28Honolulu+County%2C+Kaua%CA%BBi+County%29&zoom=8&lat=21.5925&lon=-158.999&zoom=9">Honolulu, HI</a>
      </div>
    </div>
  </div>

  ${footer(config)}

  <div class="main-logos padding-horizontal d-flex d-flex-bottom width-100" style="z-index: 99;">
    <a class="d-flex-bottom"><img src="/img/logo_noaa.png" alt='NOAA' title="NOAA"></a>
    <a class="d-flex-bottom"><img src="/img/logo_nasa.png" alt='NASA' title="NASA"></a>
    <a class="d-flex-bottom"><img src="/img/logo_usgs.png" alt='USGS' title="USGS"></a>
    <a class="d-flex-bottom"><img src="/img/logo_epa.png" alt='EPA' title="EPA"></a>
    <a class="d-flex-bottom"><img src="/img/logo_usbr.png" alt='USBR' title="USBR"></a>
    <a class="d-flex-bottom"><img src="/img/logo_nemac.png" alt='NEMAC' title="NEMAC"></a>
    <a class="d-flex-bottom" id="global-change"><img src="/img/logo_global-change.png" title="GlobalChange.gov"></a>
  </div>

  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/index.js"></script>
</body>
</html>
`
