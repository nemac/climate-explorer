# Development environment
To setup your development environment use `npm install`. Additionally, for now you install php and php-cgi.

# Notes/TODO
## State variables
### Global

- d

### Page-specific
* Location:
  - city: name of city of interest
  - county: name of county of interest
  - fips: fips code for county
  - lat/lon: map center
  - temp_variable: variable for temp chart/map
  - year/year_end: year range of chart time sliders
  - anomaly: all charts show data as compared to normals
  - precip_variable: variable for precip chart/map
  - other_variable: variable for "other" chart/map
* Stations:
  - mode/case: which station map / charts to show
  - variable: the variable to show when a station is selected
  - lat/lon: map center
  - zoom: map zoom level
  - stationID: currently selected station
  - stationName: nice name of selected station
  - threshold: threshold chart value
  - threshold_window: rolling window for threshold chart
  - basemap: map basemap
* Variables:
  - variable: current variable
  - leftScenario: left scenario on map
  - rightScenario: right scenario on map
  - leftYear
  - rightYear
  - showCounties
  - county: currently selected county
  - lat/lon: map center
  - zoom: map zoom level
  

## dynamic PHP -> PHP templating only -> HTML
- Eliminate usages of `functions.php`
- Simplify `header.php`, `footer.php`, etc
- Create an inventory of all state-related query string variables
- Move state query-string variables to a single client-side module
- Replace all references to `$currentDomain` with `/` (watching for places which need client-side handling)
- Setup client-side breadcrumb handling/replace uses of variables like `$city`, `$county`, etc with client-side state handling.
- Client side meta/head handling

## bugs
- Secondary nav wraps out of container on medium width displays.
- Clicking the current page on menu reloads the page.

## improvements
- caching for stations data
- minification for js dependencies
- 

