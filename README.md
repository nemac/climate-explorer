# jQuery Tidal Stations Widget

This widget displays a timeline of high-tide flooding with historical observations from 1950-2016, and modeled projections from 2000-2100. The data are from Billy Sweet at NOAA; see also Sweet and Park (2014).

## Files needed for deployment
- tidalstationswidget.js (the widget code)
- tidal_data.json (time series data for high-tide flooding)
- tidal_stations.json (these are the stations that can be plotted on the map, and drive graph selection)

## Usage

1. Include plugin's code:

	```html
	<script src="tidalstationswidget.js"></script>
	```

2. Define a div for the chart to deploy into:

  ```html
  <div id="chart"></div>
  ```


3. Initialize the plugin:

	```javascript
  $("#chart").tidalstationwidget({
    data_url: 'tidal_data.json' // defaults to tidal_data.json
  });
	```

4. Hook ui change events to pass updates to the widget:
```javascript
	$( "#chart" ).tidalstationwidget("update", {station: station}) // presumably from a map interface, using the "station" key on the stations file
```
