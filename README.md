# Climate By Location (formerly Climate Widget Graph)

This library defines functions that create and manage interactive climate
widget graphs.

## Powered by ACIS
This module relies on the dataservices provided by the [Applied Climate Information System (ACIS)](http://www.rcc-acis.org/index.html).

## Dependencies

This library depends on jQuery 3.2+ being loaded prior to `climate-widget-graph.js`. Using an older version of jQuery can result in unpredictable outputs.

## Installation

To use this library, include the following script tag in your HTML file (after
loading jQuery):

```html
<script src="climate-widget-graph.js"></script>
```

The file `climate-widget-graph.js` is the only file that is needed for deployment.

## Usage

The file `climate-widget-graph.js` defines the single global name "climate_widget"
which has the following function properties:

### `climate_widget.graph(OPTIONS)`

This function creates a graph according to `OPTIONS`, which should be an object with some or
all of the following properties:

| Option | Description |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| div | a string which is a CSS-style selector identifying a div where the graph should be drawn; this div must already be layed out and sized by the browser --- the graph will exactly fill the div. Required. |
| data_api_endpoint | The endpoint for the data api. |
| state | A 2-character state abbreviation code of a US state, as a string.  Required if `county` not specified. |
| county | A 5-character fips code of a US county, as a string.  Required if `state` not specified. |
| variable | The id of the variable to display; see climate_widget.variables() below for a way to get a list of variable ids.  Optional; defaults to "tmax". |
| frequency | One of the strings "annual", "monthly", or "seasonal", indicating which type of data to display.  Optional; defaults to "annual". |
| scenario | One of the strings "rcp45", "rcp85", or "both", indicating which scenario(s) to display for projection data.  Optional; defaults to "both". |
| timeperiod | One of the strings "2025", "2050", or "2075" (strings not numbers!), indicating which 30-year period of projection data to show for monthly or seasonal data.  Ignored for annual data.  Optional; defaults to "2025". |
| pmedian | true or false, indicating whether to show the median line(s) for model projection data |
| hmedian | true or false, indicating whether to show the median line(s) for annual historical model data (applies to annual data only; there is no historical model data for monthly or seasonal data) |
| histobs | true or false, indicating whether to show historical observed data |
| histmod | true or false, indicating whether to show annual historical model data (applies to annual data only; there is no historical model data for monthly or seasonal data) |
| yzoom | true or false, indicating whether to allow the user to zoom along the graph's y-axis; defaults to true |
| font | A string giving the font-family to be used for all text in the graph. Optional; defaults to the browser's default canvas font (depends on the browser). |
| xrangefunc | A function to be called whenever the user changes the scale on the horizontal annual data axis (horizontal scale changes are not allowed in the monthly or seasonal graphs).  This function will receive two arguments, which are the new minimum and maximum values along the axis. |

The `climate_widget.graph()` function returns an object which
represents the graph just created.  This object has three properties:

   1. `update` is a function that can be used to modify the graph. The `update()`
      function takes an OPTIONS object with the same properties described above
      for `climate_widget.graph()`, except that the `div` setting cannot be changed
      once a graph has been created.

   2. `download_image` is a function that the containing application may call
      in its click-event-handling code for an `<a>` element, in order to modify that
      `<a>` element so that clicking on it will download the current canvas image.
      The first argument should be the `<a>` element to modify
      
      For example:

      ```javascript
      $('a#download-image-link-id').click(function() {
          // cwg is the object returned by the climate_widget.graph constructor
          if (cwg) { // ensure widget exists
            cwg.download_image(this);
          }
          // note that the 'this' argument is important as this function modifies
          // the <a> tag
      });
      ```
    
   3. `download_hist_obs_data`, `download_hist_mod_data`, and `download_proj_mod_data` are functions that modifies a `<a>` with data urls for the time series data that drives the graph. These functions behave the same as `download_image`. Note that monthly/seasonal presentations do not use historical modeled data, so calling `download_hist_mod_data` will do nothing.   
      
   4. `setXRange` is a function that will set the range of data visible on the
      graph's x-axis when an annual data graph is displayed (monthly and seasonal
      data graphs have fixed x-axes).  It takes two arguments, which are the
      desired minimum and maximum values for the axis.  `setXRange` returns either
      true or false, depending on whether the specified range is allowed according
      to whatever pan and/or zoom limits have been specified for the axis:  if
      the specified range is allowed, the axis is adjusted and true is returned;
      if the specified range is not allowed, the axis is unchanged and false is
      returned.
      
   5. `resize` is a function that will cause the graph to resize itself to fit
      the `<div>` that contains it; you can call this function to adjust the size
      of the graph if the `<div>` changes size after the graph has been displayed.
      `resize` takes no arguments; just call it like `cwg.resize()` and the
      graph will adjust to fit its container.

### `climate_widget.variables(FREQUENCY)`

The function `climate_widget.variables(FREQUENCY)` will return an
array giving the ids and the titles of all the climate variables for
the given frequency; FREQUENCY should be one of the strings "annual",
"monthly", or "seasonal".

Here is a list of all possible variables:

| Variable            | Description                                              |
|:--------------------|:---------------------------------------------------------|
| tmax                | mean daily maximum temperature (°F)                      |
| tmin                | mean daily minimum temperature (°F)                      |
| days_tmax_gt_90f    | count of days with maximum temperature over 90°F (days)  |
| days_tmax_gt_95f    | count of days with maximum temperature over 95°F (days)  |
| days_tmax_gt_100f   | count of days with maximum temperature over 100°F (days) |
| days_tmax_gt_105f   | count of days with maximum temperature over 105°F (days) |
| days_tmax_lt_32f    | count of days with maximum temperature below 32°F (days) |
| days_tmin_lt_32f    | days with minimum temps below 32°F (days)                |
| days_tmin_gt_80f    | count of days with minimum temperature above 80°F (days) |
| days_tmin_gt_90f    | count of days with minimum temperature above 90°F (days) |
| hdd_65f             | days * degrees below 65°F (°F-days)                      |
| cdd_65f             | days * degrees above 65°F (°F-days)                      |
| gdd                 | growing degree days (°F-days)                            |
| gddmod              | modified growing degree days (°F-days)                   |
| days_dry_days       | dry days (days)                                          |
| pcpn                | total precipitation (inches)                             |
| days_pcpn_gt_1in    | days with more than 1 inch of precipitation (days)       |
| days_pcpn_gt_2in    | days with more than 2 inch of precipitation (days)       |
| days_pcpn_gt_3in    | days with more than 3 inch of precipitation (days)       |
| days_pcpn_gt_4in    | days with more than 4 inch of precipitation (days)       |

## Examples

The following will create a graph in the div with id "widget", showing
annual average daily minimum temperature for Buncombe county NC, showing
the rcp85 scenario for the projection data:

```javascript
var cwg = climate_widget.graph({
    div        : "div#widget",
    data_api_endpoint: 'https://grid2.rcc-acis.org/GridData',
    font       : "Roboto",
    frequency  : "annual",
    county       : "37021",
    variable   : "tmin",
    scenario   : "rcp85"    
});
```

The following will modify the above graph to show both the rcp45 and rcp85
scenarios:

```javascript
cwg.update({
    scenario : "both"
});
```

The following will modify the above graph to show annual average daily precipitation:

```javascript
cwg.update({
    variable : "pcpn"
});
```

For a more complete example, see the files `index.html` and `demo.js` in this
directory.
