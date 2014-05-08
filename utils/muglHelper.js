function MuglHelper() {
    //
}

MuglHelper.getDataRequests = function ( type, id ) {
    var payload = {
        requests: [],
        data: []
    };
    
    if ( type === 'TEMP' ) {
        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMIN.csv.gz')
            .success( function( lines ){
                payload.data['TMIN'] = lines; 
        }));

        payload.requests.push(
            $.get(NORMALS_CSV_SOURCE_URL + 'TMIN/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMIN_NORMAL'] = lines; 
        }));

        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMAX.csv.gz')
            .success( function( lines ){
                payload.data['TMAX'] = lines;
        }));

        payload.requests.push(
            $.get(NORMALS_CSV_SOURCE_URL + 'TMAX/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMAX_NORMAL'] = lines; 
        }));
            
    } else { 
        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/' + type + '.csv.gz')
            .success( function( lines ){
                payload.data[type] = lines; 
        }));

        payload.requests.push(
            $.get(NORMALS_CSV_SOURCE_URL + type + '/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data[type + '_NORMAL'] = lines; 
        }));
    }
    
    return payload;
};

MuglHelper.buildMugl = function( data, type, summary, templates ) {
    /*
    if (type === 'TEMP') {
        var minMax = Transformer.findMinMax( ['TMIN', 'TMAX'], summary );
    }
    */
    var d = new Date();
    var max = $.datepicker.formatDate( 'yymmdd', d );
    d.setFullYear( d.getFullYear() -1 );
    var min = $.datepicker.formatDate( 'yymmdd', d );

    return Mustache.render(templates['mugl'], {
        marginleft: 50,
        mindate: min,
        maxdate: max,
        verticalaxes: MuglHelper.buildVerticalAxisSection( type, 0, templates ),
        plots: MuglHelper.buildPlotSection( type, templates ),
        datas: MuglHelper.buildDataSection( type, data, templates )
    });
};

MuglHelper.buildVerticalAxisSection = function( type, position, templates ) {
    var template;
    switch ( type ) {
        case 'TEMP' :
            template = templates['vertical-axis-tempc'];
            break;
        case 'PRCP_YTD' :
            template = templates['vertical-axis-ytd-prcpmm'];
            break;
    }
    
    return Mustache.render( template, {
        position: position 
    });

};

MuglHelper.buildPlotSection = function( type, templates ) {
    var plots = [];
    switch ( type ) {
        case 'TEMP' :
            plots.push( Mustache.render( templates['plot-normal-temp'] ) );
            plots.push( Mustache.render( templates['plot-temp'] ) );
            break;
        case 'YTD_PRCP' :
            //plots.push( Mustache.render( templates['plot-normal-ytd-prcp'] ) );
            plots.push( Mustache.render( templates['plot-ytd-prcp'] ) );
            break;
    }
    
    return plots.join( '' );
};

MuglHelper.buildDataSection = function( type, payload, templates ) {
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