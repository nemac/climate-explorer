
export default (config) => `
<!-- BEGIN SECONDARY_HEADER TEMPLATE -->

<nav class="navbar fixed-top navbar-expand-sm navbar-element">
  <div class="container-fluid">
    
    <a class="navbar-brand p-2 rounded-3" href="/">
      <i class="fas fa-home"></i>
    </a>
    
    <h2>Climate Explorer</h2>
    
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon">
        <i class="fas fa-bars" style="color:#fff; font-size:28px;"></i>
      </span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item dropdown m-2 rounded-3">
            <a class="nav-link dropdown-toggle p-2" href="#" id="about-data-dropdown-menu-link" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="fas fa-info-circle share-icon"></span>
              About the data
            </a>
            <ul class="dropdown-menu" aria-labelledby="about-data-dropdown-menu-link">
              <li><a class="dropdown-item" href="/about"><span class="icon fas fa-info-circle me-1"></span> About</a></li>
              <li><a class="dropdown-item" href="/glossary"><span class="icon fas fa-book me-1"></span> Glossary</a></li>
              <li><a class="dropdown-item" href="/faq"><span class="icon fas fa-question-circle me-1"></span> FAQ</a></li>
            </ul>
        </li>
        <li class="nav-item dropdown m-2 rounded-3">
            <a class="nav-link dropdown-toggle p-2" href="#" id="social-media-dropdown-menu-link" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span class="fa fa-share-alt"></span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="social-media-dropdown-menu-link">
              <li><a class="dropdown-item" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" target="_blank"><span class="icon-facebook me-1"></span> Facebook</a></li>
              <li><a class="dropdown-item" href="https://twitter.com/intent/tweet?text=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" target="_blank"><span class="icon-twitter me-1"></span> Twitter</a></li>
              <li><a class="dropdown-item" href="#"><span class="icon-link me-1"></span> Copy Permalink</a></li>
            </ul>
          </li>
        <li id="crt-logo" class="dropdown m-2 rounded-3">
          <a href="https://toolkit.climate.gov/" target="_blank"">
            <img src="/img/crt-logo-mobile.png" alt="U.S. Climate Resilience Toolkit, Climate Explorer" class="d-inline-block align-text-top">
          </a>
        </li>
      </ul>
    </div>
    
  </div>
</nav>

<!-- END SECONDARY_HEADER TEMPLATE -->
`
