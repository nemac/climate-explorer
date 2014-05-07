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
var SUPPORTED_STATION_VARS = {
    TEMP: {
        label: 'Temperature',
        selected: true
    },
    PRCP_YTD: {
        label: 'YTD Precipitation',
        selected: false
    }
};

//
// globals
//
var selectedStationCount = 0;
var stationAndGraphLinkHash = [];
var DATA_SUMMARY = {};

var removeGraph; // gets populated below, but this needs to change

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

    var $permalink = $( '#permalink' ).permalink();

    var pl = Permalink(URL({url: window.location.toString()}));

    function updatePermalinkDisplay() {
        window.history.replaceState({}, "RDV", pl.toString());
        $permalink.permalink('url', pl.toString());
    }
        
    $.when.apply( $, requests ).done( function(){
        var baseLayer = new OpenLayers.Layer.ArcGISCache( "AGSCache", BASE_LAYER_URL, {
            layerInfo: baseLayerInfo,
            displayInLayerSwitcher: false
        });

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
                updatePermalinkDisplay();
                $permalink.permalink('dismiss');
            },
            mapOptions: mapOptions,
            layers: [
                new MapliteDataSource(
                    'testdata/weighted_stations.json',
                    'GHCND Stations',
                    'lyr_ghcnd',
                    MARKER_COLORS.RED,
                    'EPSG:4326',
                    null,
                    function( zoom, points ) {
                        var filtered = [];
                        
                        var cutoff = 1;
                        
                        if ( 6 <= zoom && zoom < 8  ) {
                            cutoff = 2;
                        } else if ( 8 <= zoom && zoom < 10) {
                            cutoff = 3;
                        } else if ( 10 <= zoom && zoom < 12 ) {
                            cutoff = 4; 
                        } else if ( 12 <= zoom ) {
                            cutoff = 5;
                        }
                        
                        $.each(points, function( i, point ) {
                            if ( point.weight <= cutoff ) {
                                filtered.push( point );
                            }
                        });
                        
                        return filtered;
                    }
                )
            ],
            iconPath: BUILD_BASE_PATH + 'img/',
            selectCallback: clickPoint,
            onCreate: function(mL) {
                // deploy any graphs that should initally be open, based on permalink url params:
                if (pl.haveGraphs()) {
                    pl.getGraphs().forEach(function(graph) {
                        var point = mL.getPoint('lyr_ghcnd', "GHCND:" + graph.id);
                        mL.selectPoint( 'lyr_ghcnd', "GHCND:" + graph.id );
                        clickPoint(point);
                    });
                    mL.redrawLayer('lyr_ghcnd');
                }
                
                // add to selector
                deployStationDataOptionsSelector();
            }
        });

        // initialize the pl object from the initial map state:
        (function(o) {
            pl.setCenter(o.center);
            pl.setZoom(o.zoom);
            updatePermalinkDisplay();
        }($mapl.mapLite('getCenterAndZoom')));
    });

    var initialPanelState = 'closed';
    var initialPanelWidth = 600;
    if (pl.haveGp()) {
        var gp = pl.getGp();
        if ('open' in gp && gp.open) {
            initialPanelState = 'opened';
        }
        if ('width' in gp) {
            initialPanelWidth = gp.width;
        }
    }
    
    $( '#stationDetail' ).drawerPanel({
        state: initialPanelState,
        position: 'right',
        color: '#fee',
        title: 'Station Detail',
        resizable: true,
        width: initialPanelWidth,
        minWidth: 400,
        maxWidth: 800,
        onResizeStop: resizePanel,
        onClose: function() {
            pl.setGp({'open' : false});
            updatePermalinkDisplay();
        },
        onOpen: function() {
            pl.setGp({'open' : true, 'width' : $( '#stationDetail div.drawer' ).width()});
            updatePermalinkDisplay();
        },
        templateLocation: BUILD_BASE_PATH + 'tpl/panel.tpl.html'
    });


    function resizePanel() {
        pl.setGp({ open : 1, width :  $( '#stationDetail div.drawer' ).width() });
        updatePermalinkDisplay();
        $.each(stationAndGraphLinkHash, function() {
            console.log('resize');
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

    var scales = {};
    var axisUpdateTimeout = null;
    var axisUpdateDebounceThresholdMS = 500;
    function updateAxisDebounce(bindingId, min, max) {
        bindingId = bindingId.replace("-binding","");
        if (axisUpdateTimeout !== null) {
            clearTimeout(axisUpdateTimeout);
        }
        if (! (bindingId in scales)) {
            scales[bindingId] = {};
        }
        scales[bindingId].min = min;
        scales[bindingId].max = max;
        axisUpdateTimeout = setTimeout(function() {
            pl.setScales(scales);
            updatePermalinkDisplay();
            scales = {};
        }, axisUpdateDebounceThresholdMS);
    }

    //
    // Multigraph builder
    //
    function deployGraph( type, id ) {
        pl.addGraph({type: type, id : id});
        updatePermalinkDisplay();
        
        // add graph area to panel
        $('<div/>', {
            id: id + '-' + type + '-graph',
            class: 'graph'
        }).appendTo( '#' + id + '-detail' );
        
        var payload = MuglHelper.getDataRequests( type, id );
        $.when.apply( $, payload.requests ).done( function(){
            var graphRef = '#' + id + '-' + type + '-graph';
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

                _jq ( graphRef ).multigraph( 'done', function(mg) {
                    var i, naxes = mg.graphs().at(0).axes().size();
                    //var yearFormatter = new window.multigraph.core.DatetimeFormatter("%Y-%M-%D");
                    for (i=0; i<naxes; ++i) {
                        (function(axis) {
                            if (pl.haveScales()) {
                                var scales = pl.getScales();
                                var bindingId = axis.binding().id().replace('-binding','');
                                var parser;
                                if (bindingId === "time") {
                                    parser = window.multigraph.core.DatetimeValue;
                                } else {
                                    parser = window.multigraph.core.NumberValue;
                                }
                                if (bindingId in scales) {
                                    axis.setDataRange(parser.parse(scales[bindingId].min),
                                                      parser.parse(scales[bindingId].max));
                                }
                            }
                            axis.addListener('dataRangeSet', function(e) {
                                updateAxisDebounce(axis.binding().id(), e.min, e.max);
                            });
                        }(mg.graphs().at(0).axes().at(i)));
                    }
                });

            })( window );
        });
    }

    //
    // Interactions
    //
    function clickPoint( point ) {       
        if ( selectedStationCount >= MAX_SELECTED_STATIONS ) {
            return;
        }
        
        var index = ++selectedStationCount;
        
        var sanitizedId = sanitizeString( point.id );
        
        // put contents into panel
        var contents = Mustache.render(
            STATION_DETAIL_TEMPLATE, {
                id: sanitizedId,
                index: index,
                name: point.name.toCapitalCase(),
                lat: point.lat,
                lon: point.lon
        });
        
        $( '#stationDetail' ).drawerPanel( 'appendContents', contents );
        $( '#stationDetail' ).drawerPanel( 'open' );
        
        // check types that are currently selected, launch graphs for those        
        $.each( SUPPORTED_STATION_VARS, function( type, obj ) {
            if ( obj.selected ) {
                
                stationAndGraphLinkHash[index] = {
                    id: sanitizedId,
                    type: type,
                    point: point
                };

                deployGraph( type, sanitizedId );
            }
        });
    }

    removeGraph = function removeGraph( ind ) {
        var index = parseInt( ind );

        pl.removeGraph(stationAndGraphLinkHash[index]);
        updatePermalinkDisplay();
        
        // decrement any items greater than the removed
        for (var i = selectedStationCount; i > index ; i--) {        
            var shift = stationAndGraphLinkHash[i];
            // update graph label
            var newIndex = i -1;
            var shiftRef = 'div#' + shift.id + '-detail';
            $( 'span.point-index', shiftRef ).html( '(' + newIndex + ')' );
            $( 'div.remove', shiftRef ).attr( 'onclick', "removeGraph('" + newIndex + "')" );
            
            // TODO improve - the selected layer gets rebuilt each time
            $( '#map' ).mapLite('setLabel', shift.point.id, newIndex);
        }
        
        // remove the selected item
        var point = stationAndGraphLinkHash[index].point;
        $('div#' + stationAndGraphLinkHash[index].id + '-detail', '#stationDetail' ).remove();
        
        // TODO parameterize reference?
        $( '#map' ).mapLite('unselectPoint', point.id);
        stationAndGraphLinkHash.splice(index, 1);
        selectedStationCount--;
    };
        
});

// station data selector helpers

function deployStationDataOptionsSelector() {
    var contents = '';
    $.each(SUPPORTED_STATION_VARS, function( key, obj ) {
        contents += buildStationDataOptionSelector( key, obj.label, obj.selected );
    });

    $('div.layersDiv').append(
        '<div id="stationVarLabel" class="dataLbl">Station Data Types</div>' +
        '<div id="stationVarSelector" class="dataLayersDiv">' + 
        contents +
        '</div>');

    $( 'input.station-var-chk' ).click( function() {
        var id = this.id;
        var type = id.replace( '-chk', '' );

        if ( this.checked ) {
            selectVar( type );
        } else {
            unselectVar( type );
        }
    });
}

function buildStationDataOptionSelector( key, label, selected ) {
    var sel = '';
    if ( selected ) {
        sel = 'checked=""';
    }
    
    var selectorTemplate = '<input id="{{key}}-chk" type="checkbox" name="{{label}}" value="{{label}}" {{sel}} class="station-var-chk">' +
            '<label class="labelSpan olButton" style="vertical-align: baseline;">{{label}}</label>' +
            '<br>';
    return Mustache.render( selectorTemplate, {
        key: key,
        label: label,
        sel: sel
    });
}

function selectVar( type ) {
    SUPPORTED_STATION_VARS[type].selected = true;
}

function unselectVar( type ) {
    SUPPORTED_STATION_VARS[type].selected = false;
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
