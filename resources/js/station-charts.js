//todo refactor to jquery widget

const ChartBuilder = function (props, stations_base_url) {
  const self = this;

  this.stations_base_url = stations_base_url;

  this.props = props;
  if (this.props) {
    this.getData(function () {
      self.buildChart();
    });
  }

};


ChartBuilder.prototype.getData = function (callback) {
  const self = this;

  const id = this.props.station;
  const year = new Date().getFullYear();
  this.records = {
    'temp': {
      url: this.stations_base_url,
      type: 'temp',
      params: {
        "sid": id,
        "sdate": "por",
        "edate": "por",
        "elems": [
          {"name": "maxt", "prec": 1},
          {"name": "mint", "prec": 1}
        ]
      },
      data: []
    },
    'temp_normal': {
      url: this.stations_base_url,
      type: 'temp_normal',
      params: {
        "sid": id,
        "sdate": (year - 3) + "-1-1",
        "edate": year + "-12-31",
        "elems": [
          {"name": "maxt", "normal": "1", "prec": 1},
          {"name": "mint", "normal": "1", "prec": 1}
        ]
      },
      data: []
    },
    'precip_ytd': {
      url: this.stations_base_url,
      type: 'precip_ytd',
      params: {
        "sid": id,
        "sdate": "por",
        "edate": "por",
        "elems": [
          {"name": "pcpn", "prec": 2, "interval": "dly", "duration": "ytd", "reduce": "sum"}
        ]
      },
      data: []
    },
    'precip_ytd_normal': {
      url: this.stations_base_url,
      type: 'precip_ytd_normal',
      params: {
        "sid": id,
        "sdate": (year - 3) + "-1-1",
        "edate": year + "-12-31",
        "elems": [
          {"name": "pcpn", "normal": "1", "prec": 2, "interval": "dly", "duration": "ytd", "reduce": "sum"}
        ]
      },
      data: []
    }
  };

  let i = 0;
  $.each(this.records, function (key, record) {
    $.ajax({
      url: record.url,
      type: "POST",
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify(record.params)
    }).done(function (data) {
      i++;
      self.records[key].data = data.data;
      if (i === 4) {
        callback();
      }
    });
  });

};


ChartBuilder.prototype.buildChart = function () {
  const temps = this.getTemperatureValues();
  this.temperatureData = temps.data;
  const tmpl = this.getTemplate('temperature', temps.data, temps.min - 10, temps.max + 10, temps.endpor);
  $('#multi-chart').multigraph({'muglString': tmpl});
  $('#multi-chart').multigraph('done', function (m) {
    $(window).resize(function () {
      m.resize();
    });
  });


  const precip = this.getPrecipitationValues();
  this.precipitationData = precip.data;
  //console.log('precip', precip);
  const precipTmpl = this.getTemplate('precipitation', precip.data, precip.min, precip.max + 5, precip.endpor);
  $('#multi-precip-chart').multigraph({'muglString': precipTmpl});
  $('#multi-precip-chart').multigraph('done', function (m) {
    $(window).resize(function () {
      m.resize();
    });
  });

};

ChartBuilder.prototype.downloadTemperatureData = function (link) {
  link.href = 'data:text/csv;base64,' + window.btoa(('date,min,max,normal_min,normal_max' + '\n' + this.temperatureData));
  link.download = [
    this.props.station,
    "temperature",
    'degreeF'
  ].join('-').replace(/ /g, '_') + '.csv';
};

ChartBuilder.prototype.downloadPrecipitationData = function (link) {
  link.href = 'data:text/csv;base64,' + window.btoa(('date,precipitation,precipitation_normal' + '\n' + this.precipitationData));
  link.download = [
    this.props.station,
    "precipitation",
    'inch'
  ].join('-').replace(/ /g, '_') + '.csv';
};


ChartBuilder.prototype.getTemperatureValues = function () {

  const max = {};
  const min = {};
  $.each(this.records.temp.data, function (i, a) {
    //discard missing values
    if (a.indexOf('M') !== -1) {
      return;
    }
    max[a[0].replace(/-/g, '')] = a[1];
    min[a[0].replace(/-/g, '')] = a[2];
  });

  const normmax = {};
  const normmin = {};
  $.each(this.records.temp_normal.data, function (i, a) {
    //discard missing values
    if (a.indexOf('M') !== -1) {
      return;
    }
    normmax[a[0].replace(/-/g, '')] = a[1];
    normmin[a[0].replace(/-/g, '')] = a[2];
  });

  const year = new Date().getFullYear();
  const merge = [];
  let startdate = String(Math.min(parseInt(Object.keys(max)[0]), parseInt(Object.keys(min)[0]), parseInt(Object.keys(normmax)[0]), parseInt(Object.keys(normmin)[0])));
  startdate = new Date(startdate.slice(0, 4), parseInt(startdate.slice(4, 6)) - 1, startdate.slice(6, 8));
  let enddate = String(Math.max(parseInt(Object.keys(max)[Object.keys(max).length - 1]), parseInt(Object.keys(min)[Object.keys(min).length - 1]), parseInt(Object.keys(normmax)[Object.keys(normmax).length - 1]), parseInt(Object.keys(normmin)[Object.keys(normmin).length - 1])));
  enddate = new Date(enddate.slice(0, 4), parseInt(enddate.slice(4, 6) - 1), enddate.slice(6, 8));
  const idate = new Date(startdate.getTime());
  let dmin, dmax, dnormmin, dnormmax, key;
  let ymin = 0;
  let ymax = 90;
  let endpor;
  dmin = dmax = dnormmax = dnormmin = key = '';
  while (idate < enddate) {
    key = [
      idate.getFullYear(),
      ('0' + (idate.getMonth() + 1)).slice(-2),
      ('0' + idate.getDate()).slice(-2)
    ].join('');
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
    let normdate = String(year - ((year - parseInt(key.slice(0, 4))) % 4)) + key.slice(-4);
    if (normmax.hasOwnProperty(normdate) && normmin.hasOwnProperty(normdate)) {
      dnormmax = normmax[normdate];
      dnormmin = normmin[normdate];
    }

    merge.push(key + ',' + dmax + ',' + dmin + ',' + dnormmax + ',' + dnormmin);

    dmin = dmax = dnormmax = dnormmin = key = '';
    idate.setDate(idate.getDate() + 1)
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
  const lastnormal = parseInt(merge[merge.length - 1].slice(0, 8));
  for (let i = 0; i < (8 + year - parseInt(String(lastnormal).slice(0, 4))); i += 4) {
    $.each(normmin, function (key, value) {
      const normdate = String(parseInt(key.slice(0, 4)) + i) + key.slice(-4);
      if (parseInt(normdate) > lastnormal && !min.hasOwnProperty(normdate) && normmax.hasOwnProperty(key)) {
        merge.push(normdate + ',,,' + normmax[key] + ',' + value);
      }
    });
  }

  return {data: merge.join('\n'), min: ymin, max: ymax, endpor: endpor};
};

ChartBuilder.prototype.getPrecipitationValues = function () {
  const precip = {};
  $.each(this.records.precip_ytd.data, function (i, a) {
    //discard missing values, zero Jan 1 if missing.
    if (a.indexOf('M') !== -1) {
      if (String(a[0].slice(-5)) === '01-01') {
        a[1] = '0'
      } else {
        return;
      }
    }
    precip[a[0].replace(/-/g, '')] = a[1];
  });
  const normprecip = {};
  $.each(this.records.precip_ytd_normal.data, function (i, a) {
    //discard missing values, zero Jan 1 if missing.
    if (a.indexOf('M') !== -1 || a.indexOf('T') !== -1) {
      if (String(a[0].slice(-5)) === '01-01') {
        a[1] = '0'
      } else {
        return;
      }
    }
    normprecip[a[0].replace(/-/g, '')] = a[1];
  });
  const year = new Date().getFullYear();
  const merge = [];

  let startdate = String(Math.min(parseInt(Object.keys(precip)[0]), parseInt(Object.keys(normprecip)[0])));
  startdate = new Date(startdate.slice(0, 4), parseInt(startdate.slice(4, 6)) - 1, startdate.slice(6, 8));
  let enddate = String(Math.max(parseInt(Object.keys(precip)[Object.keys(precip).length - 1]), parseInt(Object.keys(normprecip)[Object.keys(normprecip).length - 1])));
  enddate = new Date(enddate.slice(0, 4), parseInt(enddate.slice(4, 6)) - 1, enddate.slice(6, 8));
  const idate = new Date(startdate.getTime());
  let dprecip, dnormprecip, key;
  dprecip = dnormprecip = key = '';
  let ymin = 0;
  let ymax = 45;
  let endpor;
  while (idate < enddate) {
    key = [
      idate.getFullYear(),
      ('0' + (idate.getMonth() + 1)).slice(-2),
      ('0' + idate.getDate()).slice(-2)
    ].join('');
    if (precip.hasOwnProperty(key)) {
      dprecip = precip[key];
      if (isFinite(dprecip)) {
        ymax = Math.max(ymax, parseFloat(dprecip));
        if(parseFloat(dprecip) > 0){
          endpor = key;
        }
      }
    }
    let normdate = String(year - ((year - parseInt(key.slice(0, 4))) % 4)) + key.slice(-4);
    if (normprecip.hasOwnProperty(normdate)) {
      dnormprecip = normprecip[normdate];
    }

    merge.push(key + ',' + dprecip + ',' + dnormprecip);

    dprecip = dnormprecip = key = '';
    idate.setDate(idate.getDate() + 1)
  }

  //append ~8 years of normals
  const lastnormal = parseInt(merge[merge.length - 1].slice(0, 8));
  for (let i = 0; i < (8 + year - parseInt(String(lastnormal).slice(0, 4))); i += 4) {
    $.each(normprecip, function (key, value) {
      const normdate = String(parseInt(key.slice(0, 4)) + i) + key.slice(-4);
      if (parseInt(normdate) > lastnormal && !precip.hasOwnProperty(normdate)) {
        merge.push(normdate + ',' + ',' + value);
      }
    });
  }

  return {data: merge.join('\n'), min: ymin, max: ymax, endpor: endpor};
};

ChartBuilder.prototype.getTemplate = function (type, values, ymin, ymax, endpor) {
  endpor = endpor || new Date().toISOString().slice(0, 10).replace(/-/g, '');
  let addMonth = function(d){ d.setMonth(d.getMonth() + 1); return d;}
  endpor = (addMonth(new Date(endpor.slice(0, 4), parseInt(endpor.slice(4, 6) - 1), endpor.slice(6, 8)))).toISOString().slice(0, 10).replace(/-/g, '');
  //console.log('values', values);
  const templates = {
    'temperature': '<mugl>' +
      '<plotarea margintop="18"/>' +
      '<legend rows="1" border="0" opacity="0.0" base="0 1" anchor="0 1" position="0 25">' +
      '<icon border="0" width="30" height="30"/>' +
      '</legend>' +
      '<horizontalaxis id="date" type="datetime" min="' + (parseFloat(endpor.slice(0, 4)) - 2) + '0501" max="' + endpor + '">' +
      '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>' +
      '<title/>' +
      '<grid/>' +
      '<binding id="time-binding" min="19000101" max="20000101"/>' +
      '</horizontalaxis>' +
      '<verticalaxis id="temp" min="' + ymin + '" max="' + ymax + '">' +
      '<title anchor="0 -1" angle="90" position="-30 0">Degrees (F)</title>' +
      '<grid/>' +
      '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>' +
      '<pan min="'+ (Math.floor(ymin) - 15) +'" max="'+ (Math.ceil(ymax) + 15) +'" />' +
      '</verticalaxis>' +
      '<plot>' +
      '<legend label="Normal Temperature Range"/>' +
      '<horizontalaxis ref="date">' +
      '<variable ref="date"/>' +
      '</horizontalaxis>' +
      '<verticalaxis ref="temp">' +
      '<variable ref="normal_mint"/>' +
      '<variable ref="normal_maxt"/>' +
      '</verticalaxis>' +
      '<renderer type="band">' +
      '<option name="fillcolor" value="0xabdda4"/>' +
      '<option name="linewidth" value="0"/>' +
      '<option name="linecolor" value="0xabdda4"/>' +
      '</renderer>' +
      '</plot>' +
      '<plot>' +
      '<legend label="Actual Temperature Range"/>' +
      '<horizontalaxis ref="date">' +
      '<variable ref="date"/>' +
      '</horizontalaxis>' +
      '<verticalaxis ref="temp">' +
      '<variable ref="mint"/>' +
      '<variable ref="maxt"/>' +
      '</verticalaxis>' +
      '<renderer type="rangebar">' +
      '<option name="fillcolor" value="0x3288bd"/>' +
      '<option name="barwidth" value="20H"/>' +
      '<option name="baroffset" value="0.5"/>' +
      '<option name="linecolor" value="0x3288bd"/>' +
      '</renderer>' +
      '</plot>' +
      '<data>' +
      '<variables missingvalue="-9000" missingop="le">' +
      '<variable column="0" id="date" type="datetime"/>' +
      '<variable column="1" id="maxt"/>' +
      '<variable column="2" id="mint"/>' +
      '<variable column="3" id="normal_maxt"/>' +
      '<variable column="4" id="normal_mint"/>' +
      '</variables>' +
      '<values>' +
      values +
      '</values>' +
      '</data>' +
      '</mugl>',
    'precipitation': '<mugl>' +
      '<plotarea margintop="18"/>' +
      '<legend rows="1" border="0" opacity="0.0" base="0 1" anchor="0 1" position="0 25">' +
      '<icon border="0" width="30" height="30"/>' +
      '</legend>' +
      '<horizontalaxis id="datetime" type="datetime" min="'+(parseFloat(endpor .slice(0, 4)) - 2)+'" max="' + endpor + '">' +
      '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>' +
      '<title/>' +
      '<grid/>' +
      '<binding id="time-binding" min="19000101" max="20000101"/>' +
      '</horizontalaxis>' +
      '<verticalaxis id="precip" min="' + ymin + '" max="' + ymax + '">' +
      '<title anchor="0, -1" angle="90" position="-30, 0">Inches</title>' +
      '<grid/>' +
      '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>' +
      '<pan min="0" max="'+ (Math.round(ymax) + 10) +'" />' +
      '<zoom min="0" />' +
      '</verticalaxis>' +
      '<plot>' +
      '<legend label="Normal YTD Precipitation" />' +
      '<horizontalaxis ref="datetime">' +
      '<variable ref="datetime"/>' +
      '</horizontalaxis>' +
      '<verticalaxis ref="precip">' +
      '<variable ref="precip_normal"/>' +
      '</verticalaxis>' +
      '<legend label="annual"/>' +
      '<renderer type="pointline">' +
      '<option name="linecolor" value="#2c3e50"/>' +
      '<option name="linewidth" value="1.5"/>' +
      '</renderer>' +
      '</plot>' +
      '<plot>' +
      '<legend label="YTD Precipitation"/>' +
      '<horizontalaxis ref="datetime">' +
      '<variable ref="datetime"/>' +
      '</horizontalaxis>' +
      '<verticalaxis ref="precip">' +
      '<variable ref="precip"/>' +
      '</verticalaxis>' +
      '<legend visible="false"/>' +
      '<renderer type="fill">' +
      '<option name="fillcolor" value="0x3288bd"/>' +
      '<option name="fillopacity" value="0.5"/>' +
      '<option name="linecolor" value="0x3288bd"/>' +
      '</renderer>' +
      '<datatips format="{0}: {1}">' +
      '<variable format="%n %y"/>' +
      '<variable format="%1d"/>' +
      '</datatips>' +
      '</plot>' +
      '<data>' +
      '<variables missingvalue="-9000" missingop="le">' +
      '<variable column="0" id="datetime" type="datetime"/>' +
      '<variable column="1" id="precip"/>' +
      '<variable column="2" id="precip_normal"/>' +
      '</variables>' +
      '<values>' +
      values +
      '</values>' +
      '</data>' +
      '</mugl>'
  };

  return templates[type];
};

function show_spinner($div) {
  hide_spinner($div);
  var style = "<style>.cwg-spinner { margin-top: -2.5rem; border-radius: 100%;border-style: solid;border-width: 0.25rem;height: 5rem;width: 5rem;animation: basic 1s infinite linear; border-color: rgba(0, 0, 0, 0.2);border-top-color: rgba(0, 0, 0, 1); }@keyframes basic {0%   { transform: rotate(0); }100% { transform: rotate(359.9deg); }} .cwg-spinner-wrapper {display:flex; align-items: center; justify-content: center; }</style>";
  $("<div class='cwg-spinner-wrapper'><div class='cwg-spinner'></div></div>").css({
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    top: 0,
    zIndex: 1000000
  }).append(style).appendTo($div.css("position", "relative"));
}

function hide_spinner($div) {
  $div.children('.cwg-spinner-wrapper').remove();
}