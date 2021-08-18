
export default (config) => `
<!-- BEGIN SECONDARY_HEADER TEMPLATE -->

<nav class="navbar navbar-expand">
  <div class="container-fluid">
    <a class="navbar-brand p-2 rounded-3" href="/">
      <i class="fas fa-home"></i>
    </a>
    
    <h2>Climate Explorer</h2>
    
    <div class="ms-auto d-flex flex-row">
    
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#aboutDataDropdown" aria-controls="aboutDataDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse me-2" id="aboutDataDropdown">
          <ul class="navbar-nav">
            <li class="nav-item dropdown rounded-3">
              <a class="nav-link dropdown-toggle" href="#" id="aboutDataDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="fas fa-info-circle share-icon"></span>
                About the data
              </a>
              <ul class="dropdown-menu" aria-labelledby="aboutDataDropdownMenuLink">
                <li><a class="dropdown-item" href="/about"><span class="icon fas fa-info-circle me-1"></span> About</a></li>
                <li><a class="dropdown-item" href="/glossary"><span class="icon fas fa-book me-1"></span> Glossary</a></li>
                <li><a class="dropdown-item" href="/faq"><span class="icon fas fa-question-circle me-1"></span> FAQ</a></li>
              </ul>
            </li>
          </ul>
        </div>
          
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#socialMediaDropdown" aria-controls="socialMediaDropdown" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse me-2" id="socialMediaDropdown">
          <ul class="navbar-nav">
            <li class="nav-item dropdown rounded-3">
              <a class="nav-link dropdown-toggle" href="#" id="socialMediaDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span class="fa fa-share-alt"></span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="socialMediaDropdownMenuLink">
                <li><a class="dropdown-item" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" target="_blank"><span class="icon-facebook me-1"></span> Facebook</a></li>
                <li><a class="dropdown-item" href="https://twitter.com/intent/tweet?text=https%3A%2F%2Fcrt-climate-explorer.nemac.org%2Fstations%2F%3Fid%3Dhigh_tide_flooding%26extent%3D-86.27%252C-71.21%252C32.47%252C38.43%26zoom%3D7%26station-mhhw%3D0.54" target="_blank"><span class="icon-twitter me-1"></span> Twitter</a></li>
                <li><a class="dropdown-item" href="#"><span class="icon-link me-1"></span> Copy Permalink</a></li>
              </ul>
            </li>
          </ul>
        </div>
    
        <a id="crt-logo" href="https://toolkit.climate.gov/" target="_blank"">
          <img src="/img/crt-logo-mobile.png" alt="U.S. Climate Resilience Toolkit, Climate Explorer" class="d-inline-block align-text-top">
        </a>
    
    </div>
    
      
  </div>
</nav>

<!-- END SECONDARY_HEADER TEMPLATE -->
`
