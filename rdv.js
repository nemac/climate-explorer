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

        var pl = Permalink(URL({url: window.location.toString()}));
        
        // deploy map now that the template is ready
        var mapOptions = {
            resolutions: baseLayer.resolutions
        };
        if (pl.haveZoom()) {
            mapOptions.zoom = pl.getZoom();
        }
        if (pl.haveCenter()) {
            mapOptions.center = pl.getCenter();
        }
        var $mapl = $( '#map' ).mapLite({
            baseLayer: baseLayer,
            moveCallback: function(o) {
                pl.setCenter(o.center);
                pl.setZoom(o.zoom);
                window.history.replaceState({}, "RDV", pl.toString());
            },
            mapOptions: mapOptions,
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
        // initialize the pl object from the initial map state:
        (function(o) {
            pl.setCenter(o.center);
            pl.setZoom(o.zoom);
            window.history.replaceState({}, "RDV", pl.toString());
        }($mapl.mapLite('getCenterAndZoom')));
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
// RDV Permalink object
//
// This object provides a convenient API for translating between permalink URLs and
// application state.
// 
// Usage:
//    var pl = Permalink(URL(window.location.toString()));
//
function Permalink(url) {
    var center = null, zoom = null;
    if ('zoom' in url.params) {
        zoom = parseInt(url.params.zoom, 10);
    }
    if ('center' in url.params) {
        center = url.params.center.split(',').map(function(s) { return parseFloat(s); });
    }
    return {
        'toString' : function() { return url.toString(); },
        'haveCenter' : function() { return center !== null; },
        'getCenter'  : function() { return center; },
        'setCenter'  : function(c) {
            center = c;
            url.params.center = center[0] + "," + center[1];
        },
        'haveZoom' : function() { return zoom !== null; },
        'getZoom'  : function() { return zoom; },
        'setZoom'  : function(z) {
            zoom = z;
            url.params.zoom = zoom.toString();
        }
    };
}

//
// URL utility object
// 
// Call this function to create a URL utility object.  Returns an object containing properties
// that make it convenient to access and/or construct parts of a URL.
// 
// For example:
// 
//     // accessing parts of an existing URL:
//     var url = URL({url: "http://www.example.com/look/ma?x=no&y=hands"});
//     console.log(url.baseurl);    // ==> "http://www.example.com/look/ma"
//     console.log(url.params);     // ==> { 'x' : 'no', 'y' : 'hands' }
//     console.log(url.toString()); // ==> "http://www.example.com/look/ma?x=no&y=hands"
// 
//     // constructing a new url:
//     var url = URL({baseurl: "http://www.example.com/look/ma"});
//     url.params.x = 42;
//     url.params.y = 101;
//     url.params.fred = 'yes';
//     console.log(url.toString()); // ==> "http:www.example.com/look/ma?x=42&y=101&fred=yes"
//
function URL(options) {
    var paramstring, params, url, i, name, value;
    var obj = {
        'params' : {},
        'baseurl' : null,
        'toString' : function() {
            var prop, vals = [];
            for (prop in obj.params) {
                vals.push(prop + '=' + obj.params[prop]);
            }
            return obj.baseurl + '?' + vals.join("&");
        }
    };

    if ('url' in options) {
        url = options.url;

        i = url.indexOf('?');
        if (i < 0) {
            obj.baseurl = url;
            paramstring = "";
        } else {
            obj.baseurl = url.substring(0,i);
            paramstring = url.substring(i+1); // Remove everything up to and including the first '?' char.
        }

        if (paramstring.length > 0) {
            paramstring.split('&').forEach(function(c) {
                i = c.indexOf('=');
                if (i >= 0) {
                    name = c.substring(0,i);
                    value = c.substring(i+1);
                } else {
                    name = c;
                    value = null;
                }
                obj.params[name] = value;
            });
        }
    } else if ('baseurl' in options) {
        url = options.baseurl;
        i = url.indexOf('?');
        if (i < 0) {
            obj.baseurl = url;
        } else {
            obj.baseurl = url.substring(0,i);
        }
    }

    return obj;
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
