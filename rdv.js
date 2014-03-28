//
// constants
//
var BUILD_BASE_PATH = 'build/asset/';
var ID_DELIMITER = '-';
var TEMPLATE_LOCATION = 'detail.tpl.html';
var STATION_DETAIL_TEMPLATE;
var MAX_SELECTED_STATIONS = 6;
var BASE_CSV_SOURCE_URL = 'https://s3.amazonaws.com/geogaddi/';

//
// globals
//
var selectedStationCount = 0;
var stationAndGraphLinkHash = [];
var dataSummary = {};

//
// Init
//
$(function(){
    // TODO combine into deferreds
    $.getJSON( BASE_CSV_SOURCE_URL + 'summary.json', function( data ) {
        dataSummary = data;
    });

    $.get( TEMPLATE_LOCATION, function( template ) {
        STATION_DETAIL_TEMPLATE = template;
        
        // deploy map now that the template is ready
        $( '#map' ).mapLite({
            layers: [
                new MapliteDataSource(
                    'testdata/stations1.json',
                    'Stream Gauges',
                    'lyr_stream',
                    MARKER_COLORS.YELLOW,
                    'EPSG:4326'
                )
                /*
                ,
                new MapliteDataSource(
                    'testdata/stations2.json',
                    'Precipitation Gauges',
                    'lyr_precip',
                    MARKER_COLORS.GREEN,
                    'EPSG:4326'
                )
                */
            ],
            iconPath: BUILD_BASE_PATH + 'img/',
            selectCallback: clickPoint,
            zoomPriorities: [ 0, 5, 7, 9 ]
        });
    });
    
    $( '#stationDetail' ).drawerPanel({
        state: 'closed',
        position: 'right',
        color: '#fee',
        title: 'Station Detail',
        resizable: true,
        width: 600,
        minWidth: 400,
        maxWidth: 800,
        onResizeStop: resizePanel,
        templateLocation: BUILD_BASE_PATH + 'tpl/panel.tpl.html'
    });
});

//
// Interactions
//
function clickPoint( point ) {
    var attr = point.attributes;
    
    if ( selectedStationCount >= MAX_SELECTED_STATIONS ) {
        return;
    }

    if ( attr.selected ) {
        return;
    }
    
    var index = ++selectedStationCount;
    attr.label = index;
    attr.selected = true;
    
    var sanitizedId = sanitizeString( attr.id );
    
    var contents = Mustache.render(
            STATION_DETAIL_TEMPLATE, {
                id: sanitizedId,
                index: index,
                name: attr.name.toCapitalCase(),
                lat: attr.lat,
                lon: attr.lon
            }
    );
    
    stationAndGraphLinkHash[index] = {
        id: sanitizedId,
        point: point
    };

    $( '#stationDetail' ).drawerPanel( 'appendContents', contents );
    $( '#stationDetail' ).drawerPanel( 'open' );

    // TODO: legit parameterize
    deployGraph( 'TEMP', sanitizedId );
}

function removeGraph( ind ) {
    var index = parseInt( ind );
    
    // decrement any items greater than the removed
    for (var i = selectedStationCount; i > index ; i--) {        
        var shift = stationAndGraphLinkHash[i];
        // update graph label
        var newIndex = i -1;
        $( 'span.point-index', 'div#' + shift.id + '-detail' ).html( '(' + newIndex + ')' );
        $( 'div.remove', 'div#' + shift.id + '-detail' ).attr( 'onclick', "removeGraph('" + newIndex + "')" );
        
        // update point label
        shift.point.attributes.label = newIndex;
        shift.point.layer.redraw();
    }
    
    // remove the selected item
    var point = stationAndGraphLinkHash[index].point;
    $('div#' + stationAndGraphLinkHash[index].id + '-detail', '#stationDetail' ).remove();
    point.attributes.label = '';
    point.attributes.selected = false;
    point.layer.redraw();
    stationAndGraphLinkHash.splice(index, 1);

    selectedStationCount--;
}

function resizePanel() {
    $.each(stationAndGraphLinkHash, function() {
        var id = this.id;
        (function(window) {
            var _jq = window.multigraph.jQuery;
            var width = _jq( "#" + id + '-graph' ).width();
            var height = _jq( "#" + id + '-graph' ).height();
            _jq( "#" + id + '-graph' ).multigraph( 'done', function( m ) {
                m.resizeSurface( width, height );
                m.width( width ).height( height );
                m.redraw();
            });
        })(window);
    });
}

//
// Multigraph builders
//
function deployGraph( type, id ) {
    // TODO: pass ID once data is in place
    var payload = buildRequests( type, id );
    $.when.apply( $, payload.requests ).done( function(){
        var mugl = buildMugl( payload.data, type, id );
        
        $( "#" + id + '-graph' ).empty();
        (function( window ) {
            var _jq  = window.multigraph.jQuery;
            _jq ( "#" + id + '-graph' ).multigraph( { muglString: mugl } );
        })( window );
    });
}

function buildMugl( data, type, id ) {
    var verticalAxisPosition = 50;
    var minMax = buildMinMax( type, id );
    var verticalAxisSection = buildVerticalAxisSection( type, 0 );
    var plotSection = buildPlotSection( type );
    var dataSection = buildDataSection( type, data );
    
    return Mustache.render(rdvMuglTemplates['mugl'], {
        marginleft: verticalAxisPosition,
        mindate: minMax.min,
        maxdate: minMax.max,
        verticalaxes: verticalAxisSection,
        plots: plotSection,
        datas: dataSection
    });
}

function buildRequests( type, id ) {
    var payload = {
        requests: [],
        data: []
    };
    
    if (type === "TEMP") {
        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMIN.csv')
            .success( function( lines ){
                payload.data['TMIN'] = lines;
            })
        );

        payload.requests.push(
            $.get(BASE_CSV_SOURCE_URL + id + '/TMAX.csv')
            .success( function( lines ){
                payload.data['TMAX'] = lines;
            })
        );
    }
    
    return payload;
}

function buildMinMax( type, id ) {
    var summary = {};

    if ( type === 'TEMP' ) {        
        var mins = [];
        mins.push( parseInt( dataSummary[id]['TMIN'].min ) );
        mins.push( parseInt( dataSummary[id]['TMAX'].min ) );
        var maxs = [];
        maxs.push( parseInt( dataSummary[id]['TMIN'].max ) );
        maxs.push( parseInt( dataSummary[id]['TMAX'].max ) );

        summary.min = $.apply( Math.max, mins )[0]; // take greater of two minima
        summary.max = $.apply( Math.min, maxs )[0]; // take lesser of two maxima
    }
    
    return summary;
}

function buildVerticalAxisSection( type, position ) {
    if ( type === 'TEMP' ) {
        return Mustache.render(rdvMuglTemplates['vertical-axis-tempc'], {
            position: position
        });
    }
}

function buildPlotSection( type ) {
    var plots = [];
    if ( type === 'TEMP' ) {
        plots.push(Mustache.render(rdvMuglTemplates['plot-temp']));
    }
    
    return plots.join( '' );
}

function buildDataSection( type, dataPayload ) {
    var section = [];
    if ( type === 'TEMP' ) {
        var data = [];
        
        var tmin = {};
        $.each( dataPayload['TMIN'].replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(){
            tmin[this.split( ',' )[0]] = this;
        });

        // only append the value portion - not the date
        var tmax = {};
        $.each( dataPayload['TMAX'].replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(){
            var ln = this.split( ',' );
            if ( tmin.hasOwnProperty( ln[0] ) ) {
                tmax[ln[0]] += ',' + ln[1];
            }
        });
                
        // back-check tmin, merge and push common keys
        $.each( tmin, function ( key, value ) {
            if ( tmax.hasOwnProperty( key ) ) {
                data.push( tmin[key] + ',' + value );
            }
        });

        section.push(Mustache.render( rdvMuglTemplates['data-temp'], {
            values: data.join( '\n' )
        }));
        
        // TODO: add normals
    }

    return section.join( '' );
}

//
// Helpers
//
function sanitizeString( input ) {
    //return input.replace( /\W/g, ID_DELIMITER );
    return input.split( /\W/g )[1];
}

String.prototype.toCapitalCase = function( allCapsWordLength ) {
    if ( isNaN( parseInt( allCapsWordLength ) ) ) {
        allCapsWordLength = 3;
    }
    
    var words = this.split(' ');
    var capitalCaseString = '';
    
    for ( var i = 0; i < words.length; i++ ) {
        var word = words[i];
        if (word.length > allCapsWordLength) {
            capitalCaseString += word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase() + ' ';
        } else {
            capitalCaseString += word.toUpperCase() + ' ';
        }
    }

    return capitalCaseString;
};