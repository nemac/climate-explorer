// Use AMD loader if present, if not use global jQuery
// TODO un-build this
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else {
    // Browser globals
    factory(root.jQuery);
  }
})(window, function ($) {
  $.widget("ce.stationAnnualGraph", {
    options: {
      variable: 'temperature', // temperature, precipitation
      station: null,
      stationName: null,
      annualStationsDataURL: "https://data.rcc-acis.org/StnData"
    },
    _create: function _create() {
      this.temperatureData = null;
      this.precipitationData = null;
      this._update();
    },
    _update: function _update() {
      var _this = this;
      if (this.options.variable === 'temperature') {
        this.show_spinner();
        this.getTemperatureData().then(function () {
          _this.hide_spinner();
          _this.buildTemperatureChart();
        });
      } else if (this.options.variable === 'precipitation') {
        this.show_spinner();
        this.getPrecipitationData().then(function () {
          _this.hide_spinner();
          _this.buildPrecipitationChart();
        });
      } else {
        throw 'invalid variable for annual station chart';
      }
    },
    _setOption: function _setOption(key, value) {
      if (key === "value") {
        value = this._constrain(value);
      }
      this._super(key, value);
    },
    _setOptions: function _setOptions(options) {
      this._super(options);
      this._update();
      // this.refresh();
    },

    getTemperatureData: function getTemperatureData() {
      var _this2 = this;

      var id = this.options.station;
      var year = new Date().getFullYear();
      this.records = {
        'temp': {
          url: this.options.annualStationsDataURL,
          type: 'temp',
          params: {
            "sid": id,
            "sdate": "por",
            "edate": "por",
            "elems": [{ "name": "maxt", "prec": 1 }, { "name": "mint", "prec": 1 }]
          },
          data: []
        },
        'temp_normal': {
          url: this.options.annualStationsDataURL,
          type: 'temp_normal',
          params: {
            "sid": id,
            "sdate": year - 3 + "-1-1",
            "edate": year + "-12-31",
            "elems": [{ "name": "maxt", "normal": "1", "prec": 1 }, { "name": "mint", "normal": "1", "prec": 1 }]
          },
          data: []
        }
      };

      return Promise.all(Object.entries(this.records).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            record = _ref2[1];

        return new Promise(function (resolve) {
          $.ajax({
            url: record.url,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(record.params)
          }).done(function (data) {
            this.records[key].data = data.data;
            resolve();
          }.bind(_this2));
        });
      }));
    },
    getPrecipitationData: function getPrecipitationData() {
      var _this3 = this;

      var id = this.options.station;
      var year = new Date().getFullYear();
      this.records = {
        'precip_ytd': {
          url: this.options.annualStationsDataURL,
          type: 'precip_ytd',
          params: {
            "sid": id,
            "sdate": "por",
            "edate": "por",
            "elems": [{ "name": "pcpn", "prec": 2, "interval": "dly", "duration": "ytd", "reduce": "sum" }]
          },
          data: []
        },
        'precip_ytd_normal': {
          url: this.options.annualStationsDataURL,
          type: 'precip_ytd_normal',
          params: {
            "sid": id,
            "sdate": year - 3 + "-1-1",
            "edate": year + "-12-31",
            "elems": [{ "name": "pcpn", "normal": "1", "prec": 2, "interval": "dly", "duration": "ytd", "reduce": "sum" }]
          },
          data: []
        }
      };

      return Promise.all(Object.entries(this.records).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            key = _ref4[0],
            record = _ref4[1];

        return new Promise(function (resolve) {
          $.ajax({
            url: record.url,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(record.params)
          }).done(function (data) {
            this.records[key].data = data.data;
            resolve();
          }.bind(_this3));
        });
      }));
    },

    buildPrecipitationChart: function buildPrecipitationChart() {
      var precip = this.getPrecipitationValues();
      this.precipitationData = precip.data;
      var precipTmpl = this.getTemplate('precipitation', precip.data, precip.min, precip.max + 5, precip.endpor);
      $(this.element).multigraph({ 'muglString': precipTmpl });
      $(this.element).multigraph('done', function (m) {
        $(window).resize(function () {
          m.resize();
        });
      });
    },


    buildTemperatureChart: function buildTemperatureChart() {
      var temps = this.getTemperatureValues();
      this.temperatureData = temps.data;
      $(this.element).multigraph({ 'muglString': this.getTemplate('temperature', temps.data, temps.min - 10, temps.max + 10, temps.endpor) });
      $(this.element).multigraph('done', function (m) {
        $(window).resize(function () {
          m.resize();
        });
      });
    },

    downloadTemperatureData: function downloadTemperatureData(link) {
      link.href = 'data:text/csv;base64,' + window.btoa('date,min,max,normal_min,normal_max' + '\n' + this.temperatureData);
      link.download = [this.options.station, "temperature", 'degreeF'].join('-').replace(/ /g, '_') + '.csv';
    },

    downloadPrecipitationData: function downloadPrecipitationData(link) {
      link.href = 'data:text/csv;base64,' + window.btoa('date,precipitation,precipitation_normal' + '\n' + this.precipitationData);
      link.download = [this.options.station, this.options.stationName || '', "precipitation", 'inch'].join('-').replace(/ /g, '_') + '.csv';
    },

    getTemperatureValues: function getTemperatureValues() {

      var max = {};
      var min = {};
      $.each(this.records.temp.data, function (i, a) {
        //discard missing values
        if (a.indexOf('M') !== -1) {
          return;
        }
        max[a[0].replace(/-/g, '')] = a[1];
        min[a[0].replace(/-/g, '')] = a[2];
      });

      var normmax = {};
      var normmin = {};
      $.each(this.records.temp_normal.data, function (i, a) {
        //discard missing values
        if (a.indexOf('M') !== -1) {
          return;
        }
        normmax[a[0].replace(/-/g, '')] = a[1];
        normmin[a[0].replace(/-/g, '')] = a[2];
      });

      var year = new Date().getFullYear();
      var merge = [];
      var startdate = String(Math.min(parseInt(Object.keys(max)[0]), parseInt(Object.keys(min)[0]), parseInt(Object.keys(normmax)[0]), parseInt(Object.keys(normmin)[0])));
      startdate = new Date(startdate.slice(0, 4), parseInt(startdate.slice(4, 6)) - 1, startdate.slice(6, 8));
      var enddate = String(Math.max(parseInt(Object.keys(max)[Object.keys(max).length - 1]), parseInt(Object.keys(min)[Object.keys(min).length - 1]), parseInt(Object.keys(normmax)[Object.keys(normmax).length - 1]), parseInt(Object.keys(normmin)[Object.keys(normmin).length - 1])));
      enddate = new Date(enddate.slice(0, 4), parseInt(enddate.slice(4, 6) - 1), enddate.slice(6, 8));
      var idate = new Date(startdate.getTime());
      var dmin = void 0,
          dmax = void 0,
          dnormmin = void 0,
          dnormmax = void 0,
          key = void 0;
      var ymin = 0;
      var ymax = 90;
      var endpor = void 0;
      dmin = dmax = dnormmax = dnormmin = key = '';
      while (idate < enddate) {
        key = [idate.getFullYear(), ('0' + (idate.getMonth() + 1)).slice(-2), ('0' + idate.getDate()).slice(-2)].join('');
        if (max.hasOwnProperty(key) && min.hasOwnProperty(key)) {
          dmax = max[key];
          dmin = min[key];
          if (isFinite(dmin)) {
            ymin = Math.min(ymin, parseFloat(dmin));
          }
          if (isFinite(dmax)) {
            ymax = Math.max(ymax, parseFloat(dmax));
          }
          if (parseFloat(dmin) < 0 || parseFloat(dmax) > 0) {
            endpor = key;
          }
        }
        var normdate = String(year - (year - parseInt(key.slice(0, 4))) % 4) + key.slice(-4);
        if (normmax.hasOwnProperty(normdate) && normmin.hasOwnProperty(normdate)) {
          dnormmax = normmax[normdate];
          dnormmin = normmin[normdate];
        }

        merge.push(key + ',' + dmax + ',' + dmin + ',' + dnormmax + ',' + dnormmin);

        dmin = dmax = dnormmax = dnormmin = key = '';
        idate.setDate(idate.getDate() + 1);
      }
      //
      //
      // $.each(max, function (key, value) {
      //       if (key !== "" && min.hasOwnProperty(key)) {
      //           var normdate = String(year - ((year - parseInt(key.slice(0, 4))) % 4)) + key.slice(-4);
      //           if (normmax.hasOwnProperty(normdate) && normmin.hasOwnProperty(normdate)) {
      //               merge.push(key + ',' + value + ',' + min[key] + ',' + normmax[normdate] + ',' + normmin[normdate]);
      //           }
      //       }
      //   });

      //append ~8 years of normals
      var lastnormal = parseInt(merge[merge.length - 1].slice(0, 8));

      var _loop = function _loop(i) {
        $.each(normmin, function (key, value) {
          var normdate = String(parseInt(key.slice(0, 4)) + i) + key.slice(-4);
          if (parseInt(normdate) > lastnormal && !min.hasOwnProperty(normdate) && normmax.hasOwnProperty(key)) {
            merge.push(normdate + ',,,' + normmax[key] + ',' + value);
          }
        });
      };

      for (var i = 0; i < 8 + year - parseInt(String(lastnormal).slice(0, 4)); i += 4) {
        _loop(i);
      }

      return { data: merge.join('\n'), min: ymin, max: ymax, endpor: endpor };
    },

    getPrecipitationValues: function getPrecipitationValues() {
      var precip = {};
      $.each(this.records.precip_ytd.data, function (i, a) {
        //discard missing values, zero Jan 1 if missing.
        if (a.indexOf('M') !== -1) {
          if (String(a[0].slice(-5)) === '01-01') {
            a[1] = '0';
          } else {
            return;
          }
        }
        precip[a[0].replace(/-/g, '')] = a[1];
      });
      var normprecip = {};
      $.each(this.records.precip_ytd_normal.data, function (i, a) {
        //discard missing values, zero Jan 1 if missing.
        if (a.indexOf('M') !== -1 || a.indexOf('T') !== -1) {
          if (String(a[0].slice(-5)) === '01-01') {
            a[1] = '0';
          } else {
            return;
          }
        }
        normprecip[a[0].replace(/-/g, '')] = a[1];
      });
      var year = new Date().getFullYear();
      var merge = [];

      var startdate = String(Math.min(parseInt(Object.keys(precip)[0]), parseInt(Object.keys(normprecip)[0])));
      startdate = new Date(startdate.slice(0, 4), parseInt(startdate.slice(4, 6)) - 1, startdate.slice(6, 8));
      var enddate = String(Math.max(parseInt(Object.keys(precip)[Object.keys(precip).length - 1]), parseInt(Object.keys(normprecip)[Object.keys(normprecip).length - 1])));
      enddate = new Date(enddate.slice(0, 4), parseInt(enddate.slice(4, 6)) - 1, enddate.slice(6, 8));
      var idate = new Date(startdate.getTime());
      var dprecip = void 0,
          dnormprecip = void 0,
          key = void 0;
      dprecip = dnormprecip = key = '';
      var ymin = 0;
      var ymax = 45;
      var endpor = void 0;
      while (idate < enddate) {
        key = [idate.getFullYear(), ('0' + (idate.getMonth() + 1)).slice(-2), ('0' + idate.getDate()).slice(-2)].join('');
        if (precip.hasOwnProperty(key)) {
          dprecip = precip[key];
          if (isFinite(dprecip)) {
            ymax = Math.max(ymax, parseFloat(dprecip));
            if (parseFloat(dprecip) > 0) {
              endpor = key;
            }
          }
        }
        var normdate = String(year - (year - parseInt(key.slice(0, 4))) % 4) + key.slice(-4);
        if (normprecip.hasOwnProperty(normdate)) {
          dnormprecip = normprecip[normdate];
        }

        merge.push(key + ',' + dprecip + ',' + dnormprecip);

        dprecip = dnormprecip = key = '';
        idate.setDate(idate.getDate() + 1);
      }

      //append ~8 years of normals
      var lastnormal = parseInt(merge[merge.length - 1].slice(0, 8));

      var _loop2 = function _loop2(i) {
        $.each(normprecip, function (key, value) {
          var normdate = String(parseInt(key.slice(0, 4)) + i) + key.slice(-4);
          if (parseInt(normdate) > lastnormal && !precip.hasOwnProperty(normdate)) {
            merge.push(normdate + ',' + ',' + value);
          }
        });
      };

      for (var i = 0; i < 8 + year - parseInt(String(lastnormal).slice(0, 4)); i += 4) {
        _loop2(i);
      }

      return { data: merge.join('\n'), min: ymin, max: ymax, endpor: endpor };
    },

    getTemplate: function getTemplate(type, values, ymin, ymax, endpor) {
      endpor = endpor || new Date().toISOString().slice(0, 10).replace(/-/g, '');
      var addMonth = function addMonth(d) {
        d.setMonth(d.getMonth() + 1);
        return d;
      };
      endpor = addMonth(new Date(endpor.slice(0, 4), parseInt(endpor.slice(4, 6) - 1), endpor.slice(6, 8))).toISOString().slice(0, 10).replace(/-/g, '');
      var templates = {
        'temperature': '          \n          <mugl>\n            <plotarea margintop=\'18\'/>\n            <legend rows=\'1\' border=\'0\' opacity=\'0.0\' base=\'0 1\' anchor=\'0 1\' position=\'0 25\'>\n              <icon border=\'0\' width=\'30\' height=\'30\'/>\n            </legend>\n            <horizontalaxis id=\'date\' type=\'datetime\' min=\'' + (parseFloat(endpor.slice(0, 4)) - 2 + '0501') + '\' max=\'' + endpor + '\'>\n              <labels spacing=\'100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D\' format=\'%n %d%L%Y\'/>\n              <title/>\n              <grid/>\n              <binding id=\'time-binding\' min=\'19000101\' max=\'20000101\'/>\n            </horizontalaxis>\n            <verticalaxis id=\'temp\' min=\'' + ymin + '\' max=\'' + ymax + '\'>\n              <title anchor=\'0 -1\' angle=\'90\' position=\'-30 0\'>Degrees (F)</title>\n              <grid/>\n              <labels spacing=\'100 50 20 10 5 1 0.5 0.2 0.1\' format=\'%f\'/>\n              <pan min=\'' + (Math.floor(ymin) - 15) + '\' max=\'' + (Math.ceil(ymax) + 15) + '\'/>\n            </verticalaxis>\n            <plot>\n              <legend label=\'Normal Temperature Range\'/>\n              <horizontalaxis ref=\'date\'>\n                <variable ref=\'date\'/>\n              </horizontalaxis>\n              <verticalaxis ref=\'temp\'>\n                <variable ref=\'normal_mint\'/>\n                <variable ref=\'normal_maxt\'/>\n              </verticalaxis>\n              <renderer type=\'band\'>\n                <option name=\'fillcolor\' value=\'0xabdda4\'/>\n                <option name=\'linewidth\' value=\'0\'/>\n                <option name=\'linecolor\' value=\'0xabdda4\'/>\n              </renderer>\n            </plot>\n            <plot>\n              <legend label=\'Actual Temperature Range\'/>\n              <horizontalaxis ref=\'date\'>\n                <variable ref=\'date\'/>\n              </horizontalaxis>\n              <verticalaxis ref=\'temp\'>\n                <variable ref=\'mint\'/>\n                <variable ref=\'maxt\'/>\n              </verticalaxis>\n              <renderer type=\'rangebar\'>\n                <option name=\'fillcolor\' value=\'0x3288bd\'/>\n                <option name=\'barwidth\' value=\'20H\'/>\n                <option name=\'baroffset\' value=\'0.5\'/>\n                <option name=\'linecolor\' value=\'0x3288bd\'/>\n              </renderer>\n            </plot>\n            <data>\n              <variables missingvalue=\'-9000\' missingop=\'le\'>\n                <variable column=\'0\' id=\'date\' type=\'datetime\'/>\n                <variable column=\'1\' id=\'maxt\'/>\n                <variable column=\'2\' id=\'mint\'/>\n                <variable column=\'3\' id=\'normal_maxt\'/>\n                <variable column=\'4\' id=\'normal_mint\'/>\n              </variables>\n              <values>\n                ' + values + '\n              </values>\n            </data>\n          </mugl>',
        'precipitation': '          \n          <mugl>\n            <plotarea margintop=\'18\'/>\n            <legend rows=\'1\' border=\'0\' opacity=\'0.0\' base=\'0 1\' anchor=\'0 1\' position=\'0 25\'>\n              <icon border=\'0\' width=\'30\' height=\'30\'/>\n            </legend>\n            <horizontalaxis id=\'datetime\' type=\'datetime\' min=\'' + (parseFloat(endpor.slice(0, 4)) - 2) + '\' max=\'' + endpor + '\'>\n              <labels spacing=\'100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D\' format=\'%n %d%L%Y\'/>\n              <title/>\n              <grid/>\n              <binding id=\'time-binding\' min=\'19000101\' max=\'20000101\'/>\n            </horizontalaxis>\n            <verticalaxis id=\'precip\' min=\'' + ymin + '\' max=\'' + ymax + '\'>\n              <title anchor=\'0, -1\' angle=\'90\' position=\'-30, 0\'>Inches</title>\n              <grid/>\n              <labels spacing=\'100 50 20 10 5 1 0.5 0.2 0.1\' format=\'%f\'/>\n              <pan min=\'0\' max=\'' + (Math.round(ymax) + 10) + '\'/>\n              <zoom min=\'0\'/>\n            </verticalaxis>\n            <plot>\n              <legend label=\'Normal YTD Precipitation\'/>\n              <horizontalaxis ref=\'datetime\'>\n                <variable ref=\'datetime\'/>\n              </horizontalaxis>\n              <verticalaxis ref=\'precip\'>\n                <variable ref=\'precip_normal\'/>\n              </verticalaxis>\n              <legend label=\'annual\'/>\n              <renderer type=\'pointline\'>\n                <option name=\'linecolor\' value=\'#2c3e50\'/>\n                <option name=\'linewidth\' value=\'1.5\'/>\n              </renderer>\n            </plot>\n            <plot>\n              <legend label=\'YTD Precipitation\'/>\n              <horizontalaxis ref=\'datetime\'>\n                <variable ref=\'datetime\'/>\n              </horizontalaxis>\n              <verticalaxis ref=\'precip\'>\n                <variable ref=\'precip\'/>\n              </verticalaxis>\n              <legend visible=\'false\'/>\n              <renderer type=\'fill\'>\n                <option name=\'fillcolor\' value=\'0x3288bd\'/>\n                <option name=\'fillopacity\' value=\'0.5\'/>\n                <option name=\'linecolor\' value=\'0x3288bd\'/>\n              </renderer>\n              <datatips format=\'{0}: {1}\'>\n                <variable format=\'%n %y\'/>\n                <variable format=\'%1d\'/>\n              </datatips>\n            </plot>\n            <data>\n              <variables missingvalue=\'-9000\' missingop=\'le\'>\n                <variable column=\'0\' id=\'datetime\' type=\'datetime\'/>\n                <variable column=\'1\' id=\'precip\'/>\n                <variable column=\'2\' id=\'precip_normal\'/>\n              </variables>\n              <values>\n                ' + values + '\n              </values>\n            </data>\n          </mugl>'
      };

      return templates[type];
    },

    show_spinner: function show_spinner() {
      this.hide_spinner();
      var style = "<style>.ce-stationgraph-spinner { " + "position: absolute;" + "top: 40%;" + "left: 42%;" + "border-radius: 100%;" + "border-style: solid;" + "border-width: 0.25rem;" + "height: 5rem;width: 5rem;" + "animation: basic 1s infinite linear;" + "border-color: rgba(0, 0, 0, 0.2);" + "border-top-color: rgba(0, 0, 0, 1);}" + "@keyframes basic {0%   { transform: rotate(0); }100% { transform: rotate(359.9deg); }} .ce-stationgraph-spinner-wrapper {display:flex; align-items: center; justify-content: center; }</style>";
      $("<div class='ce-stationgraph-wrapper'><div class='ce-stationgraph-spinner'></div></div>").css({
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        zIndex: 1000000
      }).append(style).appendTo($(this.element).css("position", "relative"));
    },

    hide_spinner: function hide_spinner() {
      $(this.element).children('.ce-stationgraph-wrapper').remove();
    }
  });
});
