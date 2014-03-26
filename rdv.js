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

//
// Init
//
$(function(){
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
                ),
                new MapliteDataSource(
                    'testdata/stations2.json',
                    'Precipitation Gauges',
                    'lyr_precip',
                    MARKER_COLORS.GREEN,
                    'EPSG:4326'
                )
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
// Map <-> drawer panel link
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
    deployGraph( 'ITE00100554', 'TEMP' );
}

function deployGraph( id, type ) {
    var payload = getRequests( id, type );
    $.when.apply( $, payload.requests ).done(function(){
        var dataString = getDataString(type, payload.data );
        console.log(dataString);
        /* TODO: get rest of template
        var mugl = '<mugl><data><values>' + dataString + '</values></data></mugl>';
        $( "#" + id + '-graph' ).empty();
        (function( window ) {
            var _jq = window.multigraph.jQuery;
            _jq( "#" + id + '-graph' ).multigraph( { muglString: mugl } );
        })( window );
        */
    })
}

function getRequests( id, type ) {
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

function getDataString( type, dataPayload ) {
    var dataString = '';
    var data = {};
    if ( type === 'TEMP' ) {
        var tmin = dataPayload['TMIN'].replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' );
        $.each(tmin, function(){
            var ln = this.split( ',' );
            data['_' + ln[0]] = ln[1];
        });

        var tmax = dataPayload['TMAX'].replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' );
        $.each(tmax, function(){
            var ln = this.split( ',' );
            data['_' + ln[0]] += ',' + ln[1];
        });
        
        for ( var _key in data ) {
            var key = _key.replace( '_', '' );
            if ( _key !== '_' ) { // TODO: figure out how this is getting in and don't let it
                dataString += key + ',' + data[_key] + '\r\n';
            }
        }
    }
    return dataString;
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
// Helpers
//
function sanitizeString( input ) {
    return input.replace( /\W/g, ID_DELIMITER );
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