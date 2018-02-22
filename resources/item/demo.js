(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Demo = global.Demo || {})));
}(this, (function (exports) { 'use strict';

// uncomment if you want to use jspm module loading instead of cdn/manual loading
// import _ from "lodash";
// import $ from "jquery";
// import Chart from "chart.js";
// import "jquery-ui";
// import "jquery-ui/ui/unique-id";
// import "chart.js";


$.widget("fernleaf.item", {
	options: {
		station: '',
		sdate: 'por',
		edate: '2016-12-31',
		variable: 'precipitation',
		threshold: 1.0,
		thresholdOperator: '>',
		thresholdFilter: '',
		thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
		window: 1,
		dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
		yearValidator: undefined,
		barColor: "#307bda",
		dataAPIEndpoint: "https://data.rcc-acis.org/"
	},
	_variables: {
		precipitation: {
			queryElements: [{ "name": "pcpn", 'units': 'inch' }],
			windowBehavior: 'rollingSum'
		},
		tmax: {
			queryElements: [{ "name": "maxt", "units": "degreeF" }],
			windowBehavior: 'all'
		},
		tmin: {
			queryElements: [{ "name": "mint", "units": "degreeF" }],
			windowBehavior: 'all'
		},
		tavg: {
			queryElements: [{ "name": "avgt", "units": "degreeF" }],
			windowBehavior: 'all'
		}
	},
	_dailyValues: null, //{date:{value: 1.0, valid: true}}

	_operators: {
		'==': function _(o1, o2) {
			return o1 == o2;
		},
		'>=': function _(o1, o2) {
			return o1 >= o2;
		},
		'>': function _(o1, o2) {
			return o1 > o2;
		},
		'<=': function _(o1, o2) {
			return o1 <= o2;
		},
		'<': function _(o1, o2) {
			return o1 < o2;
		}
	},
	_views: {},
	_filters: {
		KtoC: function KtoC(v) {
			return v + 273.15;
		},
		CtoK: function CtoK(v) {
			return v - 273.15;
		},
		FtoC: function FtoC(v) {
			return v * 9 / 5 + 32;
		},
		CtoF: function CtoF(v) {
			return (v - 32) * 5 / 9;
		},
		InchToCM: function InchToCM(v) {
			return v * 2.54;
		},
		CMtoInch: function CMtoInch(v) {
			return v / 2.54;
		},
		DaytoWeek: function DaytoWeek(v) {
			return v / 7;
		},
		WeektoDay: function WeektoDay(v) {
			return v * 7;
		},
		DaytoYear: function DaytoYear(v) {
			return v / 365;
		},
		YeartoDay: function YeartoDay(v) {
			return v * 365;
		}
	},
	/**
  * Constructor for the widget.
  * @private
  */
	_create: function _create() {
		$(this.element).addClass("fl-item");
		this.update();
	},

	/**
  * Updates data and re-draws graph as needed.
  */
	update: function update() {
		var _this = this;

		//clear views
		_.forEach(this._views, function ($view) {
			$view.remove();
		});
		this._views = {};

		var dataPromise = void 0;
		if (this._dailyValues === null) {
			dataPromise = Promise.resolve(this._getDailyValuesByStation()).then(function (dailyValues) {
				_this._dailyValues = dailyValues;
			});
		}
		Promise.resolve(dataPromise).then(function () {
			_this._showExceedanceTimelineGraph(_this._dailyValues);
		});
	},

	/**
  * Setter for option values.
  * @param key option name
  * @param value new value
  * @private
  */
	_setOption: function _setOption(key, value) {
		//Apply filters to threshold as needed.
		if (key === 'threshold' && this.options.thresholdFilter in this._filters) {
			value = this._filters[this.options.thresholdFilter](value);
		}
		//change dates to acis format
		if (key === 'sdate') {
			value = value ? String(value).slice(0, 4) + '-01-01' : 'por';
		}
		if (key === 'edate') {
			if (undefined === value || parseInt(String(value).slice(0, 4)) >= parseInt(new Date().getFullYear())) {
				value = String(parseInt(new Date().getFullYear()) - 1) + '-12-31';
			} else {
				value = String(value).slice(0, 4) + '-12-31';
			}
		}
		this._super(key, value);
		//clear data if any of these options change. On next update() new data will be requested.
		if (['station', 'variable', 'sdate', 'edate'].includes(key)) {
			this._clearData();
		}
	},
	getDailyValues: function getDailyValues() {
		return this._dailyValues;
	},

	/**
  * Gets daily values for a given the current this.options. Results stored in this._dailyValues.
  * @returns {Promise}
  * @private
  */
	_getDailyValuesByStation: function _getDailyValuesByStation() {
		var _this2 = this;

		this._updateSpinner('loading data...');
		return Promise.resolve($.ajax({
			url: this.options.dataAPIEndpoint + 'StnData',
			type: "POST",
			context: this,
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify({
				sid: this.options.station,
				sdate: this.options.sdate,
				edate: this.options.edate,
				elems: this._variables[this.options.variable].queryElements
			})
		})).then(function (response) {
			var validator = typeof _this2.options.dailyValueValidator === 'function' ? _this2.options.dailyValueValidator : function (value, date, dailyValues) {
				return Number.isFinite(value);
			};
			return _.mapValues(_.fromPairs(response.data), function (value, date, dailyValues) {
				value = Number.parseFloat(value);
				return { value: value, valid: validator(value, date, dailyValues) };
			});
		});
	},

	/**
  * Gets a collection of counts of days which exceeded threshold in year.
  * @returns {Object} Ex: {'2016':22,'2015': 11}
  */
	getYearExceedance: function getYearExceedance(dailyValues) {
		var _this3 = this;

		var validator = typeof this.options.yearValidator === 'function' ? this.options.yearValidator : function () {
			return true;
		};

		return _.chain(dailyValues
		// Group daily values by year
		).reduce(function (dailyValuesByYear, value, date) {
			var year = String(date).slice(0, 4);
			dailyValuesByYear[year] = dailyValuesByYear[year] || {};
			dailyValuesByYear[year][date] = value;
			return dailyValuesByYear;
		}, {}
		// For each year group...
		).mapValues(function (dailyValuesByYear, year, allDailyValuesByYear) {
			// Sum the number of days which exceeded the threshold.
			var exceedance = _.reduce(dailyValuesByYear, function (exceedance, value, date) {
				//gather values from window
				var valuesInWindow = [];
				if (value.valid) {
					valuesInWindow.push(value.value);
				}
				for (var i = _this3.options.window - 1; i > 0; i--) {
					var newdate = new Date(date);
					newdate.setDate(newdate.getDate() - i);
					newdate = newdate.toISOString().slice(0, 10);
					if (undefined !== dailyValues[newdate] && dailyValues[newdate].valid) {
						valuesInWindow.push(dailyValues[newdate].value);
					}
				}
				if (valuesInWindow.length > 0 && _this3._thresholdFunction(valuesInWindow)) {
					return exceedance + 1;
				}
				return exceedance;
			}, 0);
			// Validate year
			var valid = validator(exceedance, dailyValuesByYear, year, allDailyValuesByYear, dailyValues);
			return {
				exceedance: exceedance,
				valid: valid,
				dailyValues: dailyValuesByYear
			};
		}).value();
	},

	/**
  * Applies threshold function or comparison operator to given values (array of values in window).
  * @param values
  * @returns {boolean}
  * @private
  */
	_thresholdFunction: function _thresholdFunction(values) {
		var _this4 = this;

		if ('function' === this.options.thresholdFunction) {
			return this.options.thresholdFunction(this, values);
		}
		var operator = this._operators[this.options.thresholdOperator];
		switch (this._variables[this.options.variable].windowBehavior) {
			case 'rollingSum':
				return operator(_.sum(values), this.options.threshold);
				break;
			case 'any':
				return _.any(values, function (value) {
					return operator(value, _this4.options.threshold);
				});
				break;
			case 'all':
				return _.every(values, function (value) {
					return operator(value, _this4.options.threshold);
				});
				break;
		}
	},
	_updateSpinner: function _updateSpinner() {
		var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

		var spinner = $(this.element).children('div.spinner');
		if (spinner.length) {
			if (msg === '' || msg === false) {
				spinner.remove();
			} else {
				spinner.children('.msg').text(msg);
			}
		} else {
			if (msg !== false) {
				$(this.element).append("<div class=\"spinner\"><i class=\"spinner-icon\"></i><span class=\"sr-only\">Loading...</span><span class=\"msg\">" + msg + "</span></div>");
			}
		}
	},
	_showExceedanceTimelineGraph: function _showExceedanceTimelineGraph(dailyValues) {
		this._updateSpinner(false);
		_.forEach(this._views, function ($view) {
			$view.hide();
		});
		if (undefined !== this._views.$yearlyExceedanceGraph) {
			this._views.$yearlyExceedanceGraph.show();
			return;
		}
		var yearExceedance = this.getYearExceedance(dailyValues);
		var exceedanceBars = _(yearExceedance).toPairs().map(function (v) {
			return { x: String(v[0]), y: v[1].valid ? v[1].exceedance : Number.NaN };
		}).sortBy('x').value();
		this._views.$yearlyExceedanceGraph = $('<canvas></canvas>').uniqueId().appendTo(this.element);
		this.chart = new Chart(this._views.$yearlyExceedanceGraph, {
			label: "Yearly Exceedance",
			type: 'bar',
			animationEnabled: false,
			data: {
				datasets: [{
					label: "Yearly Exceedance",
					data: exceedanceBars ? exceedanceBars : [],
					fill: true,
					backgroundColor: this.options.barColor ? this.options.barColor : "#307bda"
				}]
			},
			options: {
				animation: {
					duration: 0
				},
				scales: {
					xAxes: [{
						type: 'time',
						display: true,
						distribution: 'linear',
						time: {
							unit: 'year',
							unitStepSize: 3,
							max: String(parseInt(String(this.options.edate).slice(0, 4)) + 1)
						},
						scaleLabel: {
							display: true,
							labelString: 'Year'
						},
						position: 'bottom'
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: true,
							labelString: 'Events per Year Above Threshold'
						}, ticks: {
							beginAtZero: true
						}
					}]
				},
				tooltips: {
					callbacks: {
						afterLabel: function afterLabel(tooltipItem, data) {
							if (tooltipItem.datasetIndex === 0) {
								return 'Invalid/missing daily values: ' + _.size(_.filter(yearExceedance[data.datasets[0].data[tooltipItem.index].x].dailyValues, function (v) {
									return v.valid === false;
								}));
							}
							return '';
						}
					}
				}
			}
		});
	},

	/**
  * Gets the value of the given percentile of daily values.
  * @param percentile 0-100
  * @returns {number}
  */
	getPercentileValue: function getPercentileValue(percentile) {
		//get all valid values from _dailyValues
		var dailyValues = _(this._dailyValues).filter(function (v) {
			return v.valid && v.value > 0;
		}).sortBy(function (v) {
			return v.value;
		}).value();
		var len = dailyValues.length;
		var index = void 0;
		percentile = percentile / 100;
		// [0] 0th percentile is the minimum value...
		if (percentile <= 0.0) {
			return dailyValues[0].value;
		}
		// [1] 100th percentile is the maximum value...
		if (percentile >= 1.0) {
			return dailyValues[len - 1].value;
		}
		// Calculate the vector index marking the percentile:
		index = len * percentile - 1;

		// [2] Is the index an integer?
		if (index === Math.floor(index)) {
			// Value is the average between the value at index and index+1:
			return _.round((dailyValues[index].value + dailyValues[index + 1].value) / 2.0, 3);
		}
		// [3] Round up to the next index:
		index = Math.ceil(index);
		return _.round(dailyValues[index].value, 3);
	},
	_clearData: function _clearData() {
		this._dailyValues = null;
	}
});

// uncomment if you want to use jspm module loading instead of cdn.
// import $ from "jquery";
// import _ from 'lodash';
function demo() {
	$("#output").item({
		station: $('#station').val(),
		// This example year validator ignores years which have less than 293 (80%) valid daily values.
		// A more advanced validator might ignore years before 1940, or years with more than 30 days of contiguous missing data.
		yearValidator: function yearValidator(exceedance, dailyValuesByYear, year, allDailyValuesByYear, allDailyValues) {
			return _.size(_.filter(dailyValuesByYear, function (value) {
				return value.valid;
			})) >= 293;
		}
	});
	$('#station').change(function () {
		$("#output").item('option', 'station', $('#station').val()).item('update');
	});
	$('#threshold').change(function () {
		$("#output").item({ threshold: parseFloat($('#threshold').val()) }).item('update');
	});

	// when #variable changes, update ui units and apply sensible defaults.
	$('#variable').change(function () {
		var queryElements = void 0,
		    missingValueTreatment = void 0,
		    windowFunction = void 0;
		switch ($('#variable').val()) {
			case 'precipitation':
				$('#thresholdUnits').text('in');
				$('#threshold').val(1.0);
				break;
			case 'tmax':
				$('#thresholdUnits').text('F');
				$('#threshold').val(95);
				break;
			case 'tmin':
				$('#thresholdUnits').text('F');
				$('#threshold').val(32);
				break;
			case 'tavg':
				$('#thresholdUnits').text('F');
				$('#threshold').val(70);
				break;
		}
		$("#output").item({ threshold: parseFloat($('#threshold').val()), variable: $('#variable').val() }).item('update');
	});

	$('#percentileThreshold').change(function () {
		var value = $('#percentileThreshold').val();
		if (value === '') {
			return;
		}
		if (value <= 0 || value >= 100) {
			$('#percentileThreshold').addClass('form-control-danger');
			return;
		}
		$('#threshold').val($("#output").item('getPercentileValue', value)).trigger('change');
	});
	$('#95ththreshold').click(function () {
		$('#percentileThreshold').val(95).trigger('change');
	});
	$('#90ththreshold').click(function () {
		$('#percentileThreshold').val(90).trigger('change');
	});
	$('#80ththreshold').click(function () {
		$('#percentileThreshold').val(80).trigger('change');
	});
	$('#window').change(function () {
		$("#output").item({ window: parseInt($('#window').val()) });
		$("#output").item('update');
	});
}

exports['default'] = demo;

Object.defineProperty(exports, '__esModule', { value: true });

})));
