## Development environment
To setup your development environment use `npm install` then run `npm run build` to build and `npm run start` to start the development server. Changes to html may require you to re-run `npm run build`.

#### Additional tools and what they do

* handlebars/bundlebars provides static templating. All files ending in '.hbs' are handlebars templates. Running `npm run html:build` will build the templates using the config file `config.yml`.
* Sass/SCSS is used for styling and node-sass is used to build the styles. Running `npm run css:build` will build the stylesheets used in this project, or running `npm run css:watch` will automatically build the stylesheets when the source '.scss' files have changed.
* All javascript in this project is either directly written to be ES5-compatible, whether directly, or by using ES6 and a transpiling process.  


# Deployment notes

This project is intended for deployment as a static site, but there are a handful of services aside from the code in this repo that are expected. Most notably, the "Variables" page depends on TMS webtile services for all of its maps. Additionally, Google Analytics has been included at the bottom of `footer.hbs`. It can be removed, or the account it is attached to can be changed via "google_analytics_id" in `config.yml`


## State variables
This project has a number of url-persisted state variables that are passed from page to page when applicable. Primarily these variables are managed by `resources/js/ce.js`, but it depends on each page to give it variables and not all pages use this convention.

#### Page-specific state variables
* Location page:
  - city: name of city of interest
  - county: name of county of interest
  - fips: fips code for county
  - lat/lon: map center
  - temp_variable: variable for temp chart/map
  - year/year_end: year range of chart time sliders
  - anomaly: all charts show data as compared to normals
  - precip_variable: variable for precip chart/map
  - other_variable: variable for "other" chart/map
* Stations page:
  - mode/case: which station map / charts to show
  - variable: the variable to show when a station is selected
  - lat/lon: map center
  - zoom: map zoom level
  - stationID: currently selected station
  - stationName: nice name of selected station
  - threshold: threshold chart value
  - threshold_window: rolling window for threshold chart
  - basemap: map basemap
* Variables page:
  - variable: current variable
  - leftScenario: left scenario on map
  - rightScenario: right scenario on map
  - leftYear
  - rightYear
  - showCounties
  - county: currently selected county
  - lat/lon: map center
  - zoom: map zoom level
  
  

## 3rd Party Resources/Attribution
- nav home icon from Material Design