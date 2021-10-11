import head from '../template/head'
import secondary_header from '../template/nav_header';
import share from '../template/share';
import footer from '../template/footer';

import {version_suffix} from "../template/template_utils";
export default (config) => `
<!doctype html>
<html>
<head>
  ${head(config)}
</head>

<body id="page-about" class="page-type-text">
<div class="cd-cover-layer"></div>
${secondary_header(config)}

<div id="viewport">
  <div id="main-content-wrap">

    ${share(config)}

    <section id="standard-splash" class="page-splash">
      <div class="splash-text">
        <h1>ERROR</h1>
      </div>
    </section>

    <section id="standard-body" class="page-text">
      <hr>


      <p>The URL you accessed did not pass our validation tests. Please make sure you are clicking on a valid URL.</p>

    </section>


  </div>
</div>

${footer(config)}
<script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/index.js${version_suffix()}"></script>
</body>
</html>
`
