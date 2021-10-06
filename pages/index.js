import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';

// language=HTML
export default (config) => `
<!doctype html>
<html lang='en' class="h-100 w-100">
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
<body class="h-100">
  ${secondary_header(config)}

  <div class="container-fluid index-page h-100 body-size w-100">
    
    <div class="body-wrapper p-4 m-md-4 m-sm-0 w-100">
    
      <div class="mt-3">
        <h2>The Climate Explorer</h2>
        <div class="title-subtext mt-2 col-12 col-xl-6 rounded-2">
          <span>Explore how climate is projected to change in any county in the United States.</span>
        </div>
      </div>
  
      <div class="d-flex-column mt-3">
        
        <div class="d-flex mb-3 search-input-group rounded-2 border border-1 mt-3 col-12 col-xl-8">
          <input class="form-control location-mapper" type="text" placeholder="To get started, enter a city or county" aria-label="Enter county or city name">
          <span class="d-flex align-items-center p-2"><span class="icon icon-search p-2"></span></span>
        </div> 
      </div>
      
      <div class="default-cities col-12 col-xl-8 row m-0 rounded-2"> 
        <div>      
          <span>or click one of these cities:</span>
        </div>
        
        <div class="mt-2 row g-1">
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?county=New%20York+County&city=New%20York,%20NY&fips=36061&lat=40.7127753&lon=-74.0059728">New York City, NY</a>
          </div>
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?county=Los+Angeles+County&city=Los%20Angeles,%20CA&fips=06037&lat=34.0522342&lon=-118.2436849">Lost Angeles, CA</a>
          </div>
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?county=Anchorage%20Municipality&city=Anchorage,%20AK&fips=02020&lat=61.2180556&lon=-149.9002778">Anchorage, AK</a>
          </div>
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?county=Maricopa+County&city=Phoenix,%20AZ&fips=04013&lat=33.4483771&lon=-112.07403729999999">Phoenix, AZ</a>
          </div>
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?county=Harris+County&city=Houston,%20TX&fips=48201&lat=29.7604267&lon=-95.3698028">Houston, TX</a>
          </div>
          <div class="col-lg-4 col-12">
            <a class="btn border w-100" href="/cards_home/?area-id=hawaii_north&area-label=Northern+Hawaiian+Islands+%28Honolulu+County%2C+Kaua%CA%BBi+County%29&zoom=8&lat=21.5925&lon=-158.999&zoom=9">Honolulu, HI</a>
          </div>
        </div>

        <div class="new-info pt-3">
          <span style="font-weight: bold;">New!</span>
          <span> Climate projection charts are now available for <a href="/faq/#supported-areas">Hawai'i and U.S. territories.</a></span>
        </div>
        
      </div>
  
      <div class="main-logos d-flex d-flex-bottom width-100" style="z-index: 99;">
        <a class="d-flex-bottom"><img src="/img/logo_noaa.png" alt='NOAA' title="NOAA"></a>
        <a class="d-flex-bottom"><img src="/img/logo_nasa.png" alt='NASA' title="NASA"></a>
        <a class="d-flex-bottom"><img src="/img/logo_usgs.png" alt='USGS' title="USGS"></a>
        <a class="d-flex-bottom"><img src="/img/logo_epa.png" alt='EPA' title="EPA"></a>
        <a class="d-flex-bottom"><img src="/img/logo_usbr.png" alt='USBR' title="USBR"></a>
        <a class="d-flex-bottom"><img src="/img/logo_nemac.png" alt='NEMAC' title="NEMAC"></a>
        <a class="d-flex-bottom" id="global-change"><img src="/img/logo_global-change.png" title="GlobalChange.gov"></a>
      </div>
    
    </div>
  
  </div>

 ${footer(config)}

  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/index.js"></script>
</body>
</html>
`
