# jQuery Interactive Timeline Exceedance Module

This widget displays threshold exceedance over time for weather stations. Note that threshold exceedance analysis is sensitive to gaps/missing data in weather station history.


## Usage
1. Load dependencies using the versions shown below:
	
	```html
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js" integrity="sha256-N4u5BjTLNwmGul6RgLoESPNqDFVUibVuOYhP4gJgrew=" crossorigin="anonymous"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js" integrity="sha256-8E6QUcFg1KTnpEU8TFGhpTGHw5fJqB9vCms3OhAYLqw=" crossorigin="anonymous"></script>
	```

2. Load the widget:

	```html
	<script src="jquery.fl-item.min.js"></script>
	<link rel="stylesheet" href="fl-item.css" />
	```

3. Call the widget with desired options on a container element:

	```javascript
	$("#widget-div").item({
		station: $('#station').val(), // GHCN-D Station id (required)
		variable: 'precipitation', // Valid values: 'precipitation', 'tmax', 'tmin', 'tavg'
		threshold: 1.0, 
		thresholdOperator: '>', // Valid values: '==', '>=', '>', '<=', '<'
		thresholdFilter: '', // Transformations/Filters to support additional units. Valid Values: 'KtoC','CtoK','FtoC','CtoF','InchToCM','CMtoInch'
		thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
		window: 1, // Rolling window size in days.
		dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
		yearValidator: undefined, // Similar to dailyValueValidator
		dataAPIEndpoint: "https://data.rcc-acis.org/", 
		barColor: '#307bda' // Color for bars.
	});
	```

3. Hook ui change events to pass updates to the widget (more examples at the end of `demo.js`):
```javascript
$('#station').change(() => {
		$("#output").item('option', 'station', $('#station').val()).item('update');
	});
$('#threshold').change(function () {
	$("#output").item({threshold: parseFloat($('#threshold').val())}).item('update');
});
$('#percentileThreshold').change(() => {
	let value = $('#percentileThreshold').val();
	if (value === '') {
		return;
	}
	if (value <= 0 || value >= 100) {
		$('#percentileThreshold').addClass('form-control-danger');
		return;
	}
	$('#threshold').val($("#output").item('getPercentileValue', value)).trigger('change');
});
```

### Widget methods:
There are a handful of widget methods that may be useful:

**getPercentileValue** - Given a value between 0 and 100, returns the percentile value (which can then be used to set the threshold)

**getDailyValues** - Returns the daily value data that is currently being shown.

**getYearlyExceedance** - Returns a collection of counts of days which exceeded threshold in year.

Call any of these methods like this: `$("#output").item('getPercentileValue', value)`



