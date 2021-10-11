import head from '../template/head.js';
import footer from '../template/footer.js';
import nav_footer from '../template/nav_footer.js';
import secondary_header from "../template/nav_header.js";
import {version_suffix} from "../template/template_utils";

// language=HTML
export default (config) => `
  <!doctype html>
  <html>
  <head>
    ${head(config)}
  </head>
  <body>
  ${secondary_header(config)}
  <div class="container-fluid d-flex justify-content-center align-items-center" style="height: 100vh;">
    <div class="d-flex flex-column justify-content-center align-items-center p-5 rounded-2" style="background-color: #D3E3F9;">
      <h2>File not found.</h2>
      <h3>404</h3>
    </div>
  </div>
  ${nav_footer(config)}
  ${footer(config)}
  <script type="${config.env === 'dev' ? 'module' : 'text/javascript'}" src="/js/index.js${version_suffix()}"></script>
  </body>
  </html>
`
