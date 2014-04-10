//
// constants
//
var BUILD_BASE_PATH = 'build/asset/';
var ID_DELIMITER = '-';
var TEMPLATE_LOCATION = 'detail.tpl.html';
var STATION_DETAIL_TEMPLATE;
var MAX_SELECTED_STATIONS = 6;
var BASE_CSV_SOURCE_URL = 'https://s3.amazonaws.com/nemac-ghcnd/';
var NORMALS_CSV_SOURCE_URL = 'https://s3.amazonaws.com/nemac-normals/NORMAL_';
var BASE_LAYER_URL = "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer";

//
// globals
//
var selectedStationCount = 0;
var stationAndGraphLinkHash = [];
var DATA_SUMMARY = {};

//
// Init
//
$(function(){
    
    var baseLayerInfo;
    var requests = [
        $.getJSON( BASE_CSV_SOURCE_URL + 'summary.json', function( data ) {
            DATA_SUMMARY = data;
        }),
        $.get( TEMPLATE_LOCATION, function( template ) {
            STATION_DETAIL_TEMPLATE = template;            
        }),
        $.ajax({
            url: BASE_LAYER_URL + '?f=json&pretty=true',
            dataType: "jsonp",
            success: function ( info ) {
                baseLayerInfo = info;
            }
        })
    ];
    
    $.when.apply( $, requests ).done( function(){
        var baseLayer = new OpenLayers.Layer.ArcGISCache( "AGSCache", BASE_LAYER_URL, {
            layerInfo: baseLayerInfo
        });
        
        // deploy map now that the template is ready
        $( '#map' ).mapLite({
            baseLayer: baseLayer,
            mapOptions: {
                resolutions: baseLayer.resolutions
            },
            layers: [
                new MapliteDataSource(
                    'testdata/stations.json',
                    'GHCND Stations',
                    'lyr_ghcnd',
                    MARKER_COLORS.RED,
                    'EPSG:4326'
                )
            ],
            iconPath: BUILD_BASE_PATH + 'img/',
            selectCallback: clickPoint,
            //zoomPriorities: [ 0, 5, 7, 9 ]
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

    // TODO: add other data params
    deployGraph( 'TEMP', sanitizedId );
}

function removeGraph( ind ) {
    var index = parseInt( ind );
    
    // decrement any items greater than the removed
    for (var i = selectedStationCount; i > index ; i--) {        
        var shift = stationAndGraphLinkHash[i];
        // update graph label
        var newIndex = i -1;
        var shiftRef = 'div#' + shift.id + '-detail';
        $( 'span.point-index', shiftRef ).html( '(' + newIndex + ')' );
        $( 'div.remove', shiftRef ).attr( 'onclick', "removeGraph('" + newIndex + "')" );
        
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
            var graphRef = '#' + id + '-graph';
            var _jq = window.multigraph.jQuery;
            var width = _jq( graphRef ).width();
            var height = _jq( graphRef ).height();
            _jq( graphRef ).multigraph( 'done', function( m ) {
                m.resizeSurface( width, height );
                m.width( width ).height( height );
                m.redraw();
            });
        })(window);
    });
}

//
// Multigraph builder
//
function deployGraph( type, id ) {
    var payload = MuglHelper.getDataRequests( type, id );
    $.when.apply( $, payload.requests ).done( function(){
        var graphRef = '#' + id + '-graph';
        $( graphRef ).empty();
        (function( window ) {
            var _jq  = window.multigraph.jQuery;
            _jq ( graphRef ).multigraph( {
                muglString: MuglHelper.buildMugl(
                    payload.data,
                    type,
                    DATA_SUMMARY[id],
                    MUGLTEMPLATES
                    )});
        })( window );
    });
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