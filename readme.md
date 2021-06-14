# Climate Explorer
Built to accompany the U.S. Climate Resilience Toolkit, the Climate Explorer offers graphs and maps of observed and projected temperature, precipitation, and related climate variables for every county in the contiguous United States.

The live version of this project can be found at [crt-climate-explorer.nemac.org](https://crt-climate-explorer.nemac.org/)

## Coding Conventions
Climate Explorer is a large web application and was (mostly) developed before modern web frameworks existed, which is to say much of its codebase uses outdated patterns and different areas of the project may use different naming conventions.

Here are a few rules to make the future of the application a little brighter:

1. Use let/const appropriately, not var.
2. Name variables and functions with snake_case.
3. Name JS classes with TitleCase.
4. Name CSS classes with kebab-case.
5. Explicitly set global variables using `window.my_var = my_var`.
6. *No hidden* links, buttons, or form control elements. 
7. Clean up derelict code immediately. Do not comment things out for later, just remove them, you can always look up the history in git later. Make sure to look for related HTML/JS/CSS that may also be removed.
8. Use a spellchecker in addition to a linter, clean code is easier to maintain.
9. Do not modify files in `/vendor/` or `/node_modules/`.


## Development environment
To set up your development environment use `npm install` then run `npm run build` to build and `npm run start` to start the development server. Changes to html may require you to re-run `npm run build`.


#### Additional tools and what they do

* The package `template-literal-cli` provides static templating. All files in the pages directory are those templates. Running `npm run build:html` will build the page templates using the config file `config.yml`.
* Sass/SCSS is used for styling and node-sass is used to build the styles. Running `npm run build:css` will build the stylesheets used in this project, or running `npm run watch:css` will automatically build the stylesheets when the source '.scss' files have changed.
* All javascript in this project is written to be ES5-compatible, whether directly, or by using ES6 and a transpiling process.

###Node version

This current build of the project is using node version `v16.0.0` and npm version `7.10.0`.

## Deployment notes

This project is intended for deployment as a static site, but there are a handful of services aside from the code in this repo that are expected. Most notably, the "Variables" page depends on TMS webtile services for all of its maps. <del>Additionally, Google Analytics has been included at the bottom of `footer.hbs`. It can be removed, or the account it is attached to can be changed via "google_analytics_id" in `config.yml`</del>


## State variables
This project has a number of url-persisted state variables that are passed from page to page when applicable. Primarily these variables are managed by `/js/main.js`, but it depends on each page to give it variables and not all pages use this convention.
