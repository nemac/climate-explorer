var ChartBuilder = function(props) {
  var self = this;

  this.props = props;
  if ( this.props ) {
    this.getData(function() {
      self.buildChart();
    });
  }
};



ChartBuilder.prototype.getData = function (callback) {
  var self = this;

  //console.log('this.props', this.props);
  var id = this.props.station.split(':')[1];
  this.records = {
    'tmin': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/daily/'+id+'-tmin.csv.gz',
      type: 'tmin',
      data: ''
    },
    'normal_tmin': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/normals/normal_tmin/'+id+'.csv.gz',
      type: 'normal_tmin',
      data: ''
    },
    'tmax': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/daily/'+id+'-tmax.csv.gz',
      type: 'tmax',
      data: ''
    },
    'normal_tmax': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/normals/normal_tmax/'+id+'.csv.gz',
      type: 'normal_tmax',
      data: ''
    },
    'precip_ytd': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/daily/'+id+'-precip_ytd.csv.gz',
      type: 'precip_ytd',
      data: ''
    },
    'normal_precip_ytd': {
      url: 'http://climateexplorer.habitatseven.work/resources/data/stations/normals/normal_precip_ytd/'+id+'.csv.gz',
      type: 'normal_precip_ytd',
      data: ''
    }
  };

  var i = 0;
  $.each(this.records, function(key, record) {
    $.ajax({
      url: record.url
    }).done(function(data) {
      i++;
      self.records[key].data = data;
      if ( i === 6 ) { callback(); }
    });
  });

};



ChartBuilder.prototype.buildChart = function() {
  var temps = this.getTemperatureValues();
  var tmpl = this.getTemplate('temperature', temps);
  $('#multi-chart').multigraph({ 'muglString' : tmpl });


  var precip = this.getPrecipitationValues();
  //console.log('precip', precip);
  var precipTmpl = this.getTemplate('precipitation', precip);
  $('#multi-precip-chart').multigraph({ 'muglString' : precipTmpl });
};




ChartBuilder.prototype.getTemperatureValues = function() {
  var line;
  var max = {};
  $.each(this.records.tmax.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split(',');
    max[ line[0] ] = (parseInt(line[1]) / 10) * 9/5 + 32;
  });

  var min = {};
  $.each(this.records.tmin.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      min[line[0]] = (parseInt(line[1]) / 10) * 9/5 + 32;
    }
  });

  var normmax = {};
  $.each(this.records.normal_tmax.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      var c = parseFloat( line[1] );
      //var c = ( f-32.0 ) *5.0 /9.0;
      normmax[line[0].slice(-4)] = c;
    }
  });

  var normmin = {};
  $.each(this.records.normal_tmin.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      var c = parseFloat( line[1] );
      //var c = ( f-32.0 ) *5.0 /9.0;
      normmin[line[0].slice(-4)] = c;
    }
  });

  var merge = [];
  $.each( max, function ( key, value ) {
    if ( (key !== "") && min.hasOwnProperty( key ) ) {
      if ( (key !== "") && normmax.hasOwnProperty( key.slice(-4) ) ) {
        if ( (key !== "") && normmin.hasOwnProperty( key.slice(-4) ) ) {
          merge.push(key +','+ value +','+ min[key]+','+ normmax[key.slice(-4)] +',' + normmin[key.slice(-4)]);
        }
      }
    }
  });

  return merge.join( '\n' );
};



ChartBuilder.prototype.leapYear = function(year){
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
};



ChartBuilder.prototype.getPrecipitationValues = function() {
  var self = this;
  var line;
  var arr = [];
  var norm = [];
  $.each(this.records.normal_precip_ytd.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split(',');
    norm.push((25.4 * parseInt(line[1]) / 10.0) * 0.039370);
  });

  var int = 0;
  var leap = false;
  var max = 364;
  $.each(this.records.precip_ytd.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    leap = self.leapYear(line[0].slice(0,4));
    max = ( leap ) ? 365 : 364;
    if ( int > max ) { int = 0; }
    line = a.split(',');
    var val = parseFloat(line[1] / 10) * 0.039370;
    var n = ( leap ) ? 0 : norm[ int ];
    arr.push(line[0] + ',' + val + ',' + n);
    int++;
  });

  arr.pop();
  return arr.join('\n');
  //return merge.join( '\n' );
};




ChartBuilder.prototype.getTemplate = function(type, values) {
  //console.log('values', values);
  var templates = {
    'temperature': '<mugl>'+
      '<plotarea margintop="18"/>'+
      '<legend rows="1" border="0" opacity="0.0" base="0 1" anchor="0 1" position="0 25">'+
        '<icon border="0" width="30" height="30"/>'+
      '</legend>'+
      '<horizontalaxis id="date" type="datetime" min="20150101" max="20160101">'+
        '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>'+
        '<title/>'+
        '<grid/>'+
      '</horizontalaxis>'+
      '<verticalaxis id="temp" min="-10" max="110">'+
        '<title anchor="0 -1" angle="90" position="-25 0">Degrees (F)</title>'+
        '<grid/>'+
        '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>'+
      '</verticalaxis>'+
      '<plot>'+
        '<legend label="Normal Temperature Range"/>'+
        '<horizontalaxis ref="date">'+
        '<variable ref="date"/>'+
        '</horizontalaxis>'+
          '<verticalaxis ref="temp">'+
          '<variable ref="normal_mint"/>'+
          '<variable ref="normal_maxt"/>'+
        '</verticalaxis>'+
        '<renderer type="band">'+
          '<option name="fillcolor" value="0xabdda4"/>'+
          '<option name="linewidth" value="0"/>'+
          '<option name="linecolor" value="0xabdda4"/>'+
        '</renderer>'+
      '</plot>'+
      '<plot>'+
      '<legend label="Actual Temperature Range"/>'+
      '<horizontalaxis ref="date">'+
      '<variable ref="date"/>'+
      '</horizontalaxis>'+
      '<verticalaxis ref="temp">'+
      '<variable ref="mint"/>'+
      '<variable ref="maxt"/>'+
      '</verticalaxis>'+
      '<renderer type="rangebar">'+
      '<option name="fillcolor" value="0x3288bd"/>'+
      '<option name="barwidth" value="20H"/>'+
      '<option name="baroffset" value="0.5"/>'+
      '<option name="linecolor" value="0x3288bd"/>'+
      '</renderer>'+
      '</plot>'+
      '<data>'+
      '<variables missingvalue="-9000" missingop="le">'+
      '<variable column="0" id="date" type="datetime"/>'+
      '<variable column="1" id="maxt"/>'+
      '<variable column="2" id="mint"/>'+
      '<variable column="3" id="normal_maxt"/>'+
      '<variable column="4" id="normal_mint"/>'+
      '</variables>'+
      '<values>'+
        values +
      '</values>'+
      '</data>'+
      '</mugl>',
      'precipitation': '<mugl>'+
        '<plotarea margintop="18"/>'+
        '<legend rows="1" border="0" opacity="0.0" base="0 1" anchor="0 1" position="0 25">'+
          '<icon border="0" width="30" height="30"/>'+
        '</legend>'+
        '<horizontalaxis id="datetime" type="datetime" min="20100101" max="20160101">'+
          '<labels spacing="100Y 50Y 20Y 10Y 5Y 1Y 6M 3M 2M 1M 7D 1D" format="%n %d%L%Y"/>'+
          '<title/>'+
          '<grid/>'+
        '</horizontalaxis>'+
        '<verticalaxis id="precip" min="0" max="50">'+
          '<title anchor="0 -1" angle="90" position="-25 0">Inches</title>'+
          '<grid/>'+
          '<labels spacing="100 50 20 10 5 1 0.5 0.2 0.1" format="%f"/>'+
        '</verticalaxis>'+
        '<plot>'+
          '<legend label="YTD Precipitation"/>'+
          '<horizontalaxis ref="datetime">'+
          '<variable ref="datetime"/>'+
          '</horizontalaxis>'+
          '<verticalaxis ref="precip">'+
            '<variable ref="precip"/>'+
          '</verticalaxis>'+
          '<legend visible="false"/>'+
          '<renderer type="fill">'+
            '<option name="fillcolor" value="#1abc9c"/>'+
            '<option name="fillopacity" value="0.35"/>'+
          '</renderer>'+
          '<datatips format="{0}: {1}">'+
            '<variable format="%n %y"/>'+
            '<variable format="%1d"/>'+
          '</datatips>'+
        '</plot>'+
        '<plot>'+
          '<legend label="Normal YTD Precipitation"/>'+
          '<horizontalaxis ref="datetime">'+
          '<variable ref="datetime"/>'+
          '</horizontalaxis>'+
            '<verticalaxis ref="precip">'+
            '<variable ref="precip_normal"/>'+
          '</verticalaxis>'+
          '<legend label="annual"/>'+
          '<renderer type="pointline">'+
            '<option name="linecolor" value="#2c3e50"/>'+
            '<option name="linewidth" value="1.5"/>'+
          '</renderer>'+
          '</plot>'+
        '<data>'+
          '<variables missingvalue="-9000" missingop="le">'+
            '<variable column="0" id="datetime" type="datetime"/>'+
            '<variable column="1" id="precip"/>'+
            '<variable column="2" id="precip_normal"/>'+
          '</variables>'+
        '<values>'+
          values +
        '</values>'+
        '</data>'+
        '</mugl>'
    };

  return templates[type];
};
