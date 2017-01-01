var ChartBuilder = function (props, stations_base_url) {
    var self = this;

    this.stations_base_url = stations_base_url;

    this.props = props;
    if (this.props) {
        this.getData(function () {
            self.buildChart();
        });
    }
};


ChartBuilder.prototype.getData = function (callback) {
    var self = this;

    //console.log('this.props', this.props);
    var id = this.props.station.split(':')[1];
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
                "sdate": "2015-1-1",
                "edate": "2015-12-31",
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
                "sdate": "2015-1-1",
                "edate": "2015-12-31",
                "elems": [
                    {"name": "pcpn", "normal": "1", "prec": 2, "interval": "dly", "duration": "ytd", "reduce": "sum"}
                ]
            },
            data: []
        }
    };

    var i = 0;
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
    var temps = this.getTemperatureValues();
    var tmpl = this.getTemplate('temperature', temps);
    $('#multi-chart').multigraph({'muglString': tmpl});


    var precip = this.getPrecipitationValues();
    //console.log('precip', precip);
    var precipTmpl = this.getTemplate('precipitation', precip);
    $('#multi-precip-chart').multigraph({'muglString': precipTmpl});
};


ChartBuilder.prototype.getTemperatureValues = function () {

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
        normmax[a[0].replace(/-/g, '').slice(-4)] = a[1];
        normmin[a[0].replace(/-/g, '').slice(-4)] = a[2];
    });

    var merge = [];
    $.each(max, function (key, value) {
        if ((key !== "")
            && min.hasOwnProperty(key)
            && normmax.hasOwnProperty(key.slice(-4))
            && normmin.hasOwnProperty(key.slice(-4))) {
            merge.push(key + ',' + value + ',' + min[key] + ',' + normmax[key.slice(-4)] + ',' + normmin[key.slice(-4)]);
        }
    });

    return merge.join('\n');
};

ChartBuilder.prototype.getPrecipitationValues = function () {
    var precip = {};
    $.each(this.records.precip_ytd.data, function (i, a) {
        //discard missing values
        if (a.indexOf('M') !== -1) {
            return;
        }
        precip[a[0].replace(/-/g, '')] = a[1];
    });
    var normprecip = {};
    $.each(this.records.precip_ytd_normal.data, function (i, a) {
        //discard missing values
        if (a.indexOf('M') !== -1) {
            return;
        }
        normprecip[a[0].replace(/-/g, '').slice(-4)] = a[1];
    });

    var merge = [];
    $.each(precip, function (key, value) {
        if ((key !== "")
            && normprecip.hasOwnProperty(key.slice(-4))) {
            merge.push(key + ',' + value + ',' + normprecip[key.slice(-4)]);
        }
    });

    return merge.join('\n');
};

ChartBuilder.prototype.getTemplate = function (type, values) {
    //console.log('values', values);
    var templates = {
        'temperature': '<mugl>' +
        '<plotarea margintop="18"/>' +
        '<legend rows="1" border="0" opacity="0.0" base="0 1" anchor="0 1" position="0 25">' +
        '<icon border="0" width="30" height="30"/>' +
        '</legend>' +
        '<horizontalaxis id="date" type="datetime" min="20150101" max="20160716">' +
        '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>' +
        '<title/>' +
        '<grid/>' +
        '<binding id="time-binding" min="19000101" max="20000101"/>' +
        '</horizontalaxis>' +
        '<verticalaxis id="temp" min="-10" max="110">' +
        '<title anchor="0 -1" angle="90" position="-25 0">Degrees (F)</title>' +
        '<grid/>' +
        '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>' +
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
        '<horizontalaxis id="datetime" type="datetime" min="20100101" max="20160716">' +
        '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>' +
        '<title/>' +
        '<grid/>' +
        '<binding id="time-binding" min="19000101" max="20000101"/>' +
        '</horizontalaxis>' +
        '<verticalaxis id="precip" min="0" max="60">' +
        '<title anchor="0 -1" angle="90" position="-25 0">Inches</title>' +
        '<grid/>' +
        '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>' +
        '</verticalaxis>' +
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
        '<option name="fillcolor" value="#1abc9c"/>' +
        '<option name="fillopacity" value="0.35"/>' +
        '</renderer>' +
        '<datatips format="{0}: {1}">' +
        '<variable format="%n %y"/>' +
        '<variable format="%1d"/>' +
        '</datatips>' +
        '</plot>' +
        '<plot>' +
        '<legend label="Normal YTD Precipitation"/>' +
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
