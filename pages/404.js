import head from '../template/head';
import main_header from '../template/main_header';
import share from '../template/share';
import footer from '../template/footer';

export default (config) => `
<!doctype html>
<html>
<head>
  ${head(config)}
</head>

<body id="page-about" class="page-type-text">
<div class="cd-cover-layer"></div>
${main_header(config)}

<div id="viewport">
  <div id="main-content-wrap">

    ${share(config)}

    <section id="standard-splash" class="page-splash">
      <div class="splash-text">
        <h1>404</h1>
      </div>
    </section>

    <section id="standard-body" class="page-text">
      <hr>
      <h2>File Not Found</h2>
    </section>


  </div>
</div>

${footer(config)}
<script type="${config.env === 'dev'? 'module':  'text/javascript'}" src="/js/index.js"></script>
</body>
</html>
`
