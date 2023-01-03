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
10. Use the full file path in module imports `import get from '../node_modules/lodash/get.js` not `import get from 'lodash/get'`.


## Development environment
To set up your development environment use `npm install` then run `npm run build` to build and `npm run start` to start the development server. Changes to html or js may require you to re-run `npm run build`. Alternatively, run `npm run start:dev` to symlink `/dist/js/` to `/js/` so you don't have to re-build for js file changes.


#### Additional tools and what they do

* The package `template-literal-cli` provides static templating. All files in the `/pages/` directory are those templates. Running `npm run build:html` will build the page templates using the config file `config.yml`.
* Sass/SCSS is used for styling and node-sass is used to build the styles. Running `npm run build:css` will build the stylesheets used in this project, or running `npm run watch:css` will automatically build the stylesheets when the source '.scss' files have changed.
* All javascript in this project is written to be ES5-compatible, whether directly, or by using ES6 and a transpiling process.
* At least Node `v16.0.0` and npm `7.10.0` are required to build the project. 

## Deployment notes

This project is intended for deployment as a static site, but there are a handful of services aside from the code in this repo that are expected:
- Most climate graphs depend on either a NOAA or ACIS API.
- Climate maps depend on TMS webtile services hosted at `https://crt-climate-explorer.nemac.org/webtiles/*`.
- The "Next Steps" page depends on third party data and APIs.  
- Google Analytics has been included at the bottom of `/template/footer.js`. It can be removed, or the account it is attached to can be changed via "google_analytics_id" in `config.yml`

As of 2021, many data JSON files have been moved out of the Climate Explorer source repo to be hosted at `https://crt-climate-explorer.nemac.org/data/`


## State variables
This project has a number of url-persisted state variables that are passed from page to page when applicable. Primarily these variables are managed by `/js/main.js` as a form of global state management, but it depends on each page to give it variables and not all pages use this convention.

# Changelog

## 3.1.0

- (breaking) Moved pages `local-climate-charts`, `local-climate-maps` to `climate_graphs` and `climate_maps`, respectively. All other pages now use underscores (`_`) instead of dashes (`-`).
- (breaking) Revised global state management to use `/js/main.js` (formerly `ce.js`). All url updates should now happen in `main.js`.
- Added support for Alaska Boroughs and many US Island Territories via `area_id` instead of relying only on fips codes (see also: `main.js`). Currently `climate_maps` is not available for either, and `high_tide_flooding` is not available for AK areas.
- Changed area search to allow searching any type of places supported by the Google Places API so that places like "wake atoll" can be searched. Not all islands are searchable, see full list in FAQ page. Note that some areas support variables not available for CONUS.
- Merged many dependency project updates to switch graphs from MultiGraph and Chart.js to Plotly.js.
- Added the Headwaters Economics "Neighborhoods At Risk" (NAR) project as a new card on the "Take Action" page (formerly "Next Steps").  
- Added new "area inspection" functionality to the `climate_maps` page to support clicking a county to get more information in the map.
- Changed High tide flooding to use the NOAA CO-OPS Derived Product API (DPAPI) for observations and projections. This also switches the high tide flooding to count years as Jan-Dec instead of using Meterological years. 

## 3.0

Complete user interface revamp for improved responsiveness and added limited mobile device compatibility. 

