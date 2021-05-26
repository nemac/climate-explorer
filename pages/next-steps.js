import head from '../template/head'
import secondary_header from '../template/secondary_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config)=>`

<!doctype html>
<html lang='en' class="width-100 height-100">
<head>
  ${head(config)}
  <meta property="fb:app_id" content="187816851587993">
  <meta property="og:url" content="/">
  <meta property="og:type" content="article">
  <meta property="og:title" content="Location data for Buncombe County, NC">
  <meta property="og:description"
        content="The Climate Explorer allows you to view historical and projected climate variables and assess the impacts of climate change on the things you care about">
  <meta property="og:image" content="/img/og.jpg">
</head>

<body class="width-100 height-100">

${secondary_header(config)}

<div id="next-steps-viewport" class="padding-horizontal d-flex d-flex-column">

  <div id="search-row"
       class="padding-horizontal d-flex-row flex-justify padding-top padding-bottom-half d-flex-justify">
    <div class="rounded-box-secondary input-outer padding-horizontal bottom-padding default-btn-height width-100">
      <input id="cards-search-input" type="text"
             class="location-mapper input-inner-default border-none default-btn-height width-90" autocomplete="off"
             placeholder="Enter county, city, or zip code">
      <span class="icon icon-search search-default float-right padding-default"></span>
      <div id="clear-location-wrapper" class="">
        <span id="clear-location" data-page="next-steps" class="fas fa-times-circle"></span>
      </div>
    </div>
  </div>

  <div id="info-row" class="padding-vertical width-100">
    <div class="rounded-filters-box padding-default width-100">

      <div class="d-flex-row">

        <div id="info-text-wrapper" class="width-100">
          <i class="fas fa-map-signs icon-info-box"></i>
          <span id="" class="text-info-box">Explore planning tools available from our partners</span>
        </div>
      </div>
    </div>
  </div>

  <div id="card-row" class="padding-horizontal padding-top-half padding-bottom-half d-flex-row flex-justify">

    <div tabindex="3" id="data-card" class="next-steps-temperate card-xl d-flex d-flex-column">
      <div id="card-text" class="card-text d-flex-row width-100">
        <div id="card-title-icon" class="d-flex-row width-100">
          <div class="card-title-icon-wrap">
            <img class="card-icon" src="/img/temperate-mark-neutral.svg" alt=""/>
            <div class="card-title-wrap">
                 <span class="card-title">
                     Top climate concerns
                 </span>
              <div class="help-text"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card-controls" style="display: none;">
        <input type="checkbox" class="toggle" id="temperate-show-range">
        <label for="temperate-show-range">
          Show full range of projections
        </label>
        <a href="javascript:" class="methodology-link">Methodology</a>
      </div>
      <div id="card-description" class="d-flex-column width-100">
        <div class="disabled-text">Data is not available for this location</div>
      </div>
      <div class="footer">
        <div style="flex: 1">
          Temperate guides you through assessing your vulnerability to these potential hazards.
        </div>
        <a href="https://temperate.io" target="_blank" data-value="noreferrer">Get started with Temperate</a>
      </div>
    </div>








    <div tabindex="4" id="data-card" class="next-steps-nar card-xl d-flex d-flex-column">
      <div id="card-text" class="card-text d-flex-row width-100">
        <div id="card-title-icon" class="d-flex-row width-100">
          <div class="card-title-icon-wrap">
            <i class="fas fa-map-marked-alt icon-info-box"></i>
            <div class="card-title-wrap">
                 <span class="card-title">
                     At Risk Neighborhoods
                 </span>
              <div class="help-text"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="card-controls" style="display: none;">
      </div>
      <div id="card-description" class="d-flex-column width-100" style="padding:0px;border-top:1px solid #ccc;">
        <div class="disabled-text">Data is not available for this location</div>
      </div>
      <div class="footer">
        <div style="flex: 1">
          
        </div>
        <a class="tool-link" href="https://headwaterseconomics.org/apps/neighborhoods-at-risk" target="_blank" data-rel="noreferrer">Discover more with Neighborhoods At Risk</a>
      </div>
    </div>

















    <a id="next-steps-option-2-secretlink" href="https://www.google.com/" target="_blank" class="d-none"></a>
    <div tabindex="3" id="data-card" class="card-empty-data card-xl d-flex d-flex-column">
    </div>



  </div>


</div>

${nav_footer(config)}
${footer(config)}

<script type="text/javascript" src="/js/next-steps.js"></script>
<script type="text/javascript" src="/js/ce3-ui-components.js"></script>
<script type="text/javascript" src="/js/secondary_header.js"></script>
</body>
</html>
`
