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
      url: 'https://toolkit.climate.gov/climate-explorer-data/ghcnd/'+id+'/TMIN.csv.gz',
      type: 'tmin',
      data: ''
    },
    'normal_tmin': {
      url: 'https://toolkit.climate.gov/climate-explorer-data/normals/NORMAL_TMIN/'+id+'.csv.gz',
      type: 'normal_tmin',
      data: ''
    },
    'tmax': {
      url: 'https://toolkit.climate.gov/climate-explorer-data/ghcnd/'+id+'/TMAX.csv.gz',
      type: 'tmax',
      data: ''
    },
    'normal_tmax': {
      url: 'https://toolkit.climate.gov/climate-explorer-data/normals/NORMAL_TMAX/'+id+'.csv.gz',
      type: 'normal_tmax',
      data: ''
    },
    'precip_ytd': {
      url: 'https://toolkit.climate.gov/climate-explorer-data/ghcnd/'+id+'/PRCP_YTD.csv.gz',
      type: 'precip_ytd',
      data: ''
    },
    'normal_precip_ytd': {
      url: 'https://toolkit.climate.gov/climate-explorer-data/normals/NORMAL_PRCP_YTD/'+id+'.csv.gz',
      type: 'normal_precip_ytd',
      data: ''
    }
  };

  var i = 0;
  $.each(this.records, function(key, record) {
    console.log('record', record, 'key', key);
    $.ajax({
      url: record.url
    }).done(function(data) {
      i++;
      self.records[key].data = data;
      if ( i === 6 ) { callback(); }
      //console.log('data', data);
    });
  });

};



ChartBuilder.prototype.buildChart = function() {
  var temps = this.getTemperatureValues();
  var tmpl = this.getTemplate('temperature', temps);
  $('#multi-chart').multigraph({ 'muglString' : tmpl });
};




ChartBuilder.prototype.getTemperatureValues = function() {
  var line;

  var max = {};
  $.each(this.records.tmax.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split(',');
    max[ line[0] ] = parseInt(line[1]) / 10;
  });

  var min = {};
  $.each(this.records.tmin.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      min[line[0]] = parseInt(line[1]) / 10;
    }
  });

  var normmax = {};
  $.each(this.records.normal_tmax.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      var f = parseFloat( line[1] );
      var c = ( f-32.0 ) *5.0 /9.0;
      normmax[line[0].slice(-4)] = c;
    }
  });

  var normmin = {};
  $.each(this.records.normal_tmin.data.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(i, a) {
    line = a.split( ',' );
    if ( max.hasOwnProperty( line[0] ) ) {
      var f = parseFloat( line[1] );
      var c = ( f-32.0 ) *5.0 /9.0;
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
      '<verticalaxis id="temp" min="-30" max="50">'+
        '<title anchor="0 -1" angle="90" position="-25 0">Degrees (C)</title>'+
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
      '</mugl>'
    };

  return templates[type];
};
