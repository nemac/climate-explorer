
export default (config) => `
<!-- BEGIN HEADER TEMPLATE -->

<header id="secondary-header" class="flex-container  padding-default-half width-100 ">
    <span id="secondary-nav" class="topnav d-flex width-100" >
        <a href="/" class="secondary-home-logo padding-horizontal d-flex-center" title="The Climate Explorer">
          <i class="fas fa-home"></i>
        </a>

        <div class="secondary-font-title float-left d-flex-nowrap padding-horizontal">
          <span class="extra-title">The </span>Climate Explorer
        </div>

        <div id="about-widget-wrapper" class="padding-horizontal default-btn-height top-select-wrapper-minor d-flex-center">
          <div class="share-widget about">
            <a href="#" class="share-trigger">
              <span class="fas fa-info-circle share-icon"></span>
              <span class="a-share-label">About the data</span>
            </a>
            <ul class="about">
              <li>
                <a href="/about" id="about" class="about-about-link">
                  <span class="icon fas fa-info-circle"></span>
                  <span class="a-share-label">About</span>
                </a>
              </li>
              <li>
                <a href="/glossary" id="glossary" class="about-glossary-link">
                  <span class="icon fas fa-book"></span>
                  <span class="a-share-label">Glossary</span>
                </a>
              </li>
              <li>
                <a href="/faq" id="faq" class="about-faq-link">
                  <span class="icon fas fa-question-circle"></span>
                  <span class="a-share-label">FAQ</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div id="share-widget-wrapper" class="padding-horizontal default-btn-height top-select-wrapper-minor d-flex-center">
          <div class="share-widget">
            <a href="#" class="share-trigger">
              <span class="fa fa-share-alt share-icon"></span>
              <span class="a-share-label"></span>
              <!-- Share -->
            </a>
            <ul >
              <li><a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" id="share_facebook" class="share-link share-facebook" target="_blank">
                <span class="icon icon-facebook share-icon"></span>
                <span class="a-share-label">Facebook</span>
              </a>
            </li>
              <li><a href="https://twitter.com/intent/tweet?text=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" id="share_twitter" class="share-link share-twitter" target="_blank">
                <span class="icon icon-twitter"></span><span class="a-share-label">Twitter</span></a></li>
              <li id="share-permalink"><a href="#" class="share-link share-permalink">
                <span class="icon icon-link"></span><span class="a-share-label">Copy Permalink</span></a></li>
            </ul>

            <div id="share-permalink-input">
              <input type="text" id="share_link" value="">
            </div>
          </div>
        </div>

        <a href="https://toolkit.climate.gov/" target="_blank" class="secondary-logo padding-horizontal d-flex-left" title="U.S. Climate Resilience Toolkit, Climate Explorer">
            <picture>
              <source media="(max-width: 599px)" srcset="/img/crt-logo-mobile.png">
              <source media="(min-width: 600px)" srcset="/img/crt-logo-mobile.png">
              <img alt="U.S. Climate Resilience Toolkit, Climate Explorer">
            </picture>
          </a>

    </span>
</header>
<!-- END HEADER TEMPLATE -->
`
