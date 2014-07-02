var Transformer = require( './transformer.js' );

function MuglHelper( options ) {
    this.options = options;
}

MuglHelper.prototype.getDataRequests = function ( type, id ) {
    var payload = {
        requests: [],
        data: []
    };
    
    if ( type === 'TEMP' ) {
        payload.requests.push(
            $.get(this.options.baseUrl + id + '/TMIN.csv.gz')
            .success( function( lines ){
                payload.data['TMIN'] = lines; 
        }));

        payload.requests.push(
            $.get(this.options.normalsUrl + 'TMIN/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMIN_NORMAL'] = lines; 
        }));

        payload.requests.push(
            $.get(this.options.baseUrl + id + '/TMAX.csv.gz')
            .success( function( lines ){
                payload.data['TMAX'] = lines;
        }));

        payload.requests.push(
            $.get(this.options.normalsUrl + 'TMAX/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMAX_NORMAL'] = lines; 
        }));
            
    } else { 
        payload.requests.push(
            $.get(this.options.baseUrl + id + '/' + type + '.csv.gz')
            .success( function( lines ){
                payload.data[type] = lines; 
        }));

        payload.requests.push(
            $.get(this.options.normalsUrl + type + '/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data[type + '_NORMAL'] = lines; 
        }));
    }
    
    return payload;
};

MuglHelper.prototype.buildMugl = function( data, type, summary, templates ) {
    var d = new Date();
    var max = $.datepicker.formatDate( 'yymmdd', d );
    d.setFullYear( d.getFullYear() -1 );
    var min = $.datepicker.formatDate( 'yymmdd', d );

    return Mustache.render(templates['mugl'], {
        marginleft: 40,
        mindate: min,
        maxdate: max,
        verticalaxes: this.buildVerticalAxisSection( type, 0, templates ),
        plots: this.buildPlotSection( type, templates ),
        datas: this.buildDataSection( type, data, templates )
    });
};

MuglHelper.prototype.buildVerticalAxisSection = function( type, position, templates ) {
console.log('building a vertical axis section!');
    var template;
    switch ( type ) {
        case 'TEMP' :
            template = templates['vertical-axis-temp'];
            break;
        case 'PRCP_YTD' :
            template = templates['vertical-axis-ytd-prcp'];
            break;
    }
    
    return Mustache.render( template, {
        position: position 
    });

};

MuglHelper.prototype.buildPlotSection = function( type, templates ) {
    var plots = [];
    switch ( type ) {
        case 'TEMP' :
            plots.push( Mustache.render( templates['plot-normal-temp'] ) );
            plots.push( Mustache.render( templates['plot-temp'] ) );
            break;
        case 'PRCP_YTD' :
            plots.push( Mustache.render( templates['plot-normal-ytd-prcp'] ) );
            plots.push( Mustache.render( templates['plot-ytd-prcp'] ) );
            break;
    }
    
    return plots.join( '' );
};

MuglHelper.prototype.buildDataSection = function( type, payload, templates ) {
    var normals = [];
    var normalTemplate;
    var data = [];
    var dataTemplate;
    
    if ( type === 'TEMP' ) {
        // normals        
        normals = Transformer.mergeCSV( 
                payload['TMIN_NORMAL'], 
                payload['TMAX_NORMAL'], 
                Transformer.transformations[type + '_NORMAL'] );
        
        normalTemplate = templates['data-normal-temp'];
                
        // data
        data = Transformer.mergeCSV( 
                payload['TMIN'], 
                payload['TMAX'], 
                Transformer.transformations[type] );
                
        dataTemplate = templates['data-temp'];

    } else {
        // normals
        normals = Transformer.transformCSV(
                payload[type + '_NORMAL'],
                Transformer.transformations[type + '_NORMAL'] );

        data = Transformer.transformCSV(
                payload[type],
                Transformer.transformations[type] );
                
        switch ( type ) {
            case 'PRCP_YTD' :
                normalTemplate = templates['data-normal-ytd-prcp'];
                dataTemplate = templates['data-ytd-prcp'];
                break
        }
    }
    
    var section = [];
    
    if ( normals.length !== 0 ) {
        section.push(Mustache.render( normalTemplate, {
            values: normals
        }));
    }
    
    section.push(Mustache.render( dataTemplate, {
        values: data
    }));

    return section.join( '' );
};

// TODO: follow class with prototype

module.exports = {
    MuglHelper: MuglHelper
}
