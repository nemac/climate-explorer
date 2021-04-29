# jQuery Tidal Stations Widget

This widget displays a timeline of high-tide flooding with historical observations from 1950-2016, and modeled projections from 2000-2100. The included data is from Billy Sweet at NOAA; see also Sweet and Park (2014).

## Files needed for deployment
- tidalstationswidget.js (the widget code)
- tidal_data.json (time series data for high-tide flooding)
- tidal_stations.json (these are the stations that can be plotted on the map, and drive graph selection)

## Usage

1. Include plugin's code:
```html
<script src="tidalstationswidget.js"></script>
```

2. Define a container element for the widget to deploy into:

```html
<div id="chart" style="position: relative; height:100%; width: 100%;"></div>
```

3. Initialize the plugin:

```javascript
$("#chart").tidalstationwidget({
  station: '8665530',
  data_url: 'tidal_data.json', // defaults to tidal_data.json
  responsive: true // set to false to disable ChartJS responsive sizing.
});
```

4. Hook ui change events to pass updates to the widget:
```javascript
$( "#chart" ).tidalstationwidget("update", {station: 'station'}) // presumably from a map interface, using the `id` value from `tidal_stations.json`
```
