import head from '../template/head'
import secondary_header from '../template/nav_header';
import footer from '../template/footer';
import nav_footer from '../template/nav_footer';

export default (config) => `

<!doctype html>
<html lang='en'>
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

<body>

${secondary_header(config)}

<div id="next-steps-viewport" class="container-fluid d-flex flex-column body-size">

  <div class="d-flex flex-row mt-2"> 
      <div class="input-group search-input-group rounded-2 border border-1 w-100">
        <button id="clear-location" class="btn search-icons" type="button"><span class="fas fa-times-circle"></span></button>
        <input id="cards-search-input" class="form-control location-mapper" type="text" placeholder="Enter county or city name" aria-label="Enter county or city name">
      </div>
  </div>

  <div class="info-section mt-2">
      <div class="d-flex border border-1 rounded-2"> 
        
        <div class="m-2 btn p-0">
            <i class="fas fa-map-signs me-2"></i>
            <span id="default-chart-map-variable" style="font-weight: normal !important;">Explore planning tools available from our partners</span>
        </div>
      </div>
  </div>

  <div id="card-row" class="d-flex flex-justify mt-2">

    <div tabindex="3" id="data-card" class="next-steps-temperate card-xl d-flex flex-column">
      <div id="card-text" class="card-text d-flex w-100">
        <div id="card-title-icon" class="d-flex w-100">
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
      <div id="card-description" class="d-flex flex-column w-100">
        <div class="disabled-text">Data is not available for this location</div>
      </div>
      <div class="footer">
        <div style="flex: 1">
          Temperate guides you through assessing your vulnerability to these potential hazards.
        </div>
        <a href="https://temperate.io" target="_blank" data-value="noreferrer">Get started with Temperate</a>
      </div>
    </div>

    <div tabindex="4" id="data-card" class="next-steps-nar card-xl d-flex flex-column" style="margin-left: 1rem;">
      <div id="card-text" class="card-text d-flex w-100" style="flex-grow: 0 !important;">
        <div id="card-title-icon" class="d-flex w-100">
          <div class="card-title-icon-wrap">
            <img src="/img/logo-HE-NAR.png" class="card-icon" alt="HeadWater Economics Neighborhoods at Risk"/>
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
      <div id="card-description" class="d-flex flex-column w-100" style="padding:0px;border-top:1px solid #ccc;flex-grow:1 !important;">
        <div class="disabled-text">Data is not available for this location</div>
      </div>
      <div class="footer">
        <div style="flex: 1">
         Neighborhoods at Risk provides neighborhood-level information (by census-tract) about potentially vulnerable people and climate change.
        </div>
        <a class="tool-link" href="https://headwaterseconomics.org/apps/neighborhoods-at-risk" target="_blank" data-rel="noreferrer">Explore Neighborhoods At Risk</a>
      </div>
    </div>

    <a id="next-steps-option-2-secretlink" href="https://www.google.com/" target="_blank" class="d-none"></a>
    <div tabindex="3" id="data-card" class="card-empty-data card-xl d-flex flex-column">
    </div>

  </div>
</div>

${nav_footer(config)}
${footer(config)}

<script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/next_steps.js"></script>
</body>
</html>
`
