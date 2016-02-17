# Climate Widget (Climate in Your Location) Graph Library

This library defines functions that create and manage interactive climate
widget graphs.

## Prerequisite

This library depends on jQuery. You should make sure that a copy of jQuery has
been loaded in your page before including the `<script>` tag below.

## Installation

To use this library, include the following script tag in your HTML file (after
loading jQuery):

```html
<script src="climate-widget-graph.js"></script>
```

The file `climate-widget-graph.js` is included in this project, in the top-level
directory, and is the only file that is needed for deployment; all other files
in this directory are only used in development, or for examples or documentation.

## Usage

The file `climate-widget-graph.js` defines the single global name "climate_widget"
which has the following function properties:

### `climate_widget.graph(OPTIONS)`

This function creates a graph according to `OPTIONS`, which should be an object with some or
all of the following properties:

  * `div`

    a string which is a CSS-style selector identifying a div
    where the graph should be drawn; this div must already
    be layed out and sized by the browser --- the graph will
    exactly fill the div. Required.

  * `dataprefix`

    A URL from which the data can be downloaded.  Required.

  * `fips`

    A 5-character fips code of a US county, as a string.  Required.

  * `variable`

    The id of the variable to display; see climate_widget.variables()
    below for a way to get a list of variable ids.  Optional; defaults
    to "tasmax".

  * `frequency`

    One of the strings "annual", "monthly", or "seasonal", indicating which
    type of data to display.  Optional; defaults to "annual".

  * `scenario`

    One of the strings "rcp45", "rcp85", or "both", indicating which
    scenario(s) to display for projection data.  Optional; defaults to "both".

  * `presentation`

    One of the strings "absolute" or "anomaly", indicating which
    presentation should be used in setting the graph's y axis scale.   Only
    relevant for annual data; ignored for monthly or seasonal. Optional;
    defaults to "absolute".

  * `timeperiod`

    One of the strings "2025", "2050", or "2075" (strings not numbers!),
    indicating which 30-year period of projection data to show for
    monthly or seasonal data.  Ignored for annual data.  Optional;
    defaults to "2025".

  * `prange`

    One of the strings "minmax", "p1090", or "both", indicating which
    range band to show for model projection data.

  * `hrange`

    One of the strings "minmax", "p1090", or "both", indicating which
    range band to show for model historical data.

  * `pmedian`

    true or false, indicating whether to show the median line(s) for
    model projection data

  * `font`

    A string giving the font-family to be used for all text in the graph.
    Optional; defaults to the browser's default canvas font (depends on
    the browser).

The `climate_widget.graph()` function returns an object which
represents the graph just created.  This object has three properties:
   1. `update` is a function that can be used to modify the graph. The `update()`
      function takes an OPTIONS object with the same properties described above
      for `climate_widget.graph()`, except that the `div` setting cannot be changed
      once a graph has been created.

   2. `dataurls` is a function that returns an object with the urls for the time
      series data that drives the graph. The object may have up to three keys:

      `hist_obs` for historical observed data

      `hist_mod` for historical modeled data

      `proj_mod` for projected modeled data

      Note that not all presentations use all datasets, so there may be graphs
      that when `dataurls()` is called do not return an object with all three keys.

    3. `downloadImage` is a callback function to an on-click event on an `<a>` tag.
      this function handles what is required to download the canvas as a PNG.

      In order to use this function, an `<a>` tag must be declared in the HTML.
      The containing application code then needs to add an event handler as follows:

      ```javascript
      $('a#download-image-link-id').click(function() {
          // cwg is the object returned by the climate_widget.graph constructor
          cwg.downloadImage(this, 'nameOfDownloadedImage.png');
          // note that the 'this' argument is important as this function modifies
          // the <a> tag to perform the download.
      });
      ```

### `climate_widget.variables(FREQUENCY)`

The function `climate_widget.variables(FREQUENCY)` will return an
array giving the ids and the titles of all the climate variables for
the given frequency; FREQUENCY should be one of the strings "annual",
"monthly", or "seasonal".

## Examples

The following will create a graph in the div with id "widget", showing
annual average daily minimum temperature for Buncombe county NC, showing
the rcp85 scenario for the projection data:

```javascript
var cwg = climate_widget.graph({
    div        : "div#widget",
    dataprefix : "http://climate-widget-data.nemac.org/data",
    font       : "Roboto",
    frequency  : "annual",
    fips       : "37021",
    variable   : "tasmin",
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
    variable : "pr"
});
```

For a more complete example, see the files `demo.html` and `demo.js` in this
directory.
