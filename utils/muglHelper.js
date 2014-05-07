function MuglHelper() {
    //
}

MuglHelper.getDataRequests = function ( type, id ) {
    var payload = {
        requests: [],
        data: []
    };
    
    if (type === "TEMP") {
        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMIN.csv.gz')
            .success( function( lines ){
                payload.data['TMIN'] = lines;
            })
        );

        payload.requests.push(
            $.get(NORMALS_CSV_SOURCE_URL + 'TMIN/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMIN_NORMAL'] = lines;
            })
        );

        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMAX.csv.gz')
            .success( function( lines ){
                payload.data['TMAX'] = lines;
            })
        );

        payload.requests.push(
            $.get(NORMALS_CSV_SOURCE_URL + 'TMAX/' + id + '.csv.gz')
            .success( function( lines ){
                payload.data['TMAX_NORMAL'] = lines;
            })
        );
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
    if ( type === 'TEMP' ) {
        return Mustache.render( templates['vertical-axis-tempc'], {
            position: position
        });
    }
};

MuglHelper.buildPlotSection = function( type, templates ) {
    var plots = [];
    if ( type === 'TEMP' ) {
        plots.push( Mustache.render( templates['plot-normal-temp'] ) );
        plots.push( Mustache.render( templates['plot-temp'] ) );
    }
    
    return plots.join( '' );
};

MuglHelper.buildDataSection = function( type, payload, templates ) {
    var section = [];
    
    if ( type === 'TEMP' ) {
        // normals        
        var normals = Transformer.mergeCSV( 
                payload['TMIN_NORMAL'], 
                payload['TMAX_NORMAL'], 
                Transformer.normalTempTransform);
        
        section.push(Mustache.render( templates['data-normal-temp'], {
            values: normals
        }));
        
        // data
        var data = Transformer.mergeCSV( 
                payload['TMIN'], 
                payload['TMAX'], 
                Transformer.tempTransform );

        section.push(Mustache.render( templates['data-temp'], {
            values: data
        }));
    }

    return section.join( '' );
};