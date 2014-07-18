//
// Init
//
$(function(){

    // The function updateAxisDebounce() gets called whenever an axis scale changes in a multigraph
    // (search for 'dataRangeSet' below to see where it is registered).  It handles updating the permalink
    // URL to show the new axis scales, but only after a certain delay threshold (axisUpdateDebounceThresholdMS)
    // has passed with no calls to updateAxisDebounce() happening.  In other words, updateAxisDebounce() can
    // be called many times in rapid succession (and in general, it will be, when the user is changing the graph
    // axis scales), but the permalink is only updated when a period of axisUpdateDebounceThresholdMS passes
    // with no calls to updateAxisDebounce() occurring.
    var scales = {};
    //    scales is a JS object storing the outstanding axis updates -- i.e. updates that need to be applied
    //    when the timer expires; the keys are binding ids (minus the "-binding" suffix), and the values are
    //    objects of the form
    //        { "min" : STRING, "max" : STRING }
    var axisUpdateTimeout = null;
    //    axisUpdateTimeout is the current timeout object, if any
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

    function displayGraph(id, type, $element) {
        var payload = MuglHelper.getDataRequests( type, id );
        $.when.apply( $, payload.requests ).done( function(){
            var _jq  = window.multigraph.jQuery;
            _jq ( $element ).multigraph( {
                muglString: MuglHelper.buildMugl(
                    payload.data,
                    type,
                    DATA_SUMMARY[id],
                    MUGLTEMPLATES
                )});
            _jq ( $element ).multigraph( 'done', function(mg) {
                var i, naxes = mg.graphs().at(0).axes().size();
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
                        if (
                            (axis.id() === "ytd-prcpin")
                                ||
                                (axis.id() === "tempf")
                                ||
                                (axis.id() === "time")
                        ) {
                            axis.addListener('dataRangeSet', function(e) {
                                // note we have to convert e.min, e.max to strings here; they are multigraph
                                // DatetimeValue or NumberValue objects!!!
                                updateAxisDebounce(axis.binding().id(), e.min.toString(), e.max.toString());
                            });
                        }
                    }(mg.graphs().at(0).axes().at(i)));
                }
            });
        });
        pl.addGraph({type: type, id : id});
        updatePermalinkDisplay();
    }

    var overlaysById = {};
    var topicsById = {};

    ceui.init({
        enabled : false,
        perspectiveSet : function(tab) {
            if (tab === ceui.LAYERS_PERSPECTIVE) {
                mL.setLayerVisibility("lyr_ghcnd", false);
            } else {
                mL.setLayerVisibility("lyr_ghcnd", true);
            }
            pl.setPerspective(tab);
            updatePermalinkDisplay();
            //console.log('switching to tab: ' + tab);
        },
        layerVisibilitySet : function(id, visible) {
            if (mL != null) {
                mL.setLayerVisibility(id, visible);
                if (visible) {
                    pl.addLayer(id);
                } else {
                    pl.removeLayer(id);
                }
                updatePermalinkDisplay();
            }
        },
        layerOpacitySet : function(id, opacity) {
            if (mL != null) {
                mL.setLayerOpacity(id, opacity);
                pl.setLayerOpacity(id, opacity);
                updatePermalinkDisplay();
            }
        },
        topicSet : function(topicId) {
            setTopic(topicId);
        },
        displayGraph : function(id, type, $element) {
            displayGraph(id.replace("GHCND:", ""), type, $element);
        },
        removeGraph : function(id, type) {
            pl.removeGraph({type: type, id : id.replace("GHCND:", "")});
            updatePermalinkDisplay();
        }
    });

    var mL = null;
    function rememberML(x) {
        mL = x;
    }

    var BASE_CSV_SOURCE_URL = 'https://s3.amazonaws.com/nemac-ghcnd/';
    var NORMALS_CSV_SOURCE_URL = 'https://s3.amazonaws.com/nemac-normals/NORMAL_';
    var MH = require( './utils/muglHelper.js' );

    var MuglHelper = new MH.MuglHelper({ baseUrl: BASE_CSV_SOURCE_URL, normalsUrl: NORMALS_CSV_SOURCE_URL });

    var sanitizeString = require( './utils/stringUtil.js' );
    var URL = require( './utils/urlUtils.js' );

    //
    // constants
    //
    var BUILD_BASE_PATH = 'build/asset/';
    var TEMPLATE_LOCATION = 'detail.tpl.html';
    var STATION_DETAIL_TEMPLATE;
    var MAPLITE_CONFIG;
    var MAX_SELECTED_STATIONS = 6;
    var APP_CONFIG_URL = 'config.json';
    var GRAPH_VARIDS = [ "TEMP", "PRCP_YTD" ];
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

    var currentTopicLayerIds = [];

    function setTopic(topicId, options) {

        if (!options || !options.hasOwnProperty('clearLayers') || options.clearLayers) {
            // Reset all current layers to full opacity, undisplayed
            currentTopicLayerIds.forEach(function(layerId) {
                mL.setLayerOpacity(layerId, 1.0);
                mL.setLayerVisibility(layerId, false);
            });
            // remove all layers from permalink
            pl.clearLayers();
            //pl.getLayers().forEach(function(layer) {
            //    pl.removeLayer(layer.id);
            //});
            updatePermalinkDisplay();
        }

        // Clear out the list of current layers (gets repopulated a few lines below)
        currentTopicLayerIds = [];
        // Set the layer groups
        ceui.setLayerGroups(topicsById[topicId].subGroups.map(function(subgroup) {
            return { id : subgroup.id, name : subgroup.name };
        }));
        // Set the layers for each group
        topicsById[topicId].subGroups.forEach(function(subgroup) {
            ceui.setLayers(subgroup.id,
                           subgroup.layers.map(function(layerId) {
                               currentTopicLayerIds.push(layerId);
                               return overlaysById[layerId];
                           }));
        });
        pl.setTp(topicId);
        updatePermalinkDisplay();
    }

    var requests = [
        $.getJSON( BASE_CSV_SOURCE_URL + 'summary.json', function( data ) {
            DATA_SUMMARY = data;
        }),
        $.get( TEMPLATE_LOCATION, function( template ) {
            STATION_DETAIL_TEMPLATE = template;
        }),
        $.getJSON( APP_CONFIG_URL, function( config ) {


            // cache the topics by id (note that topics are called 'groups' in the config file)
            config.groups.forEach(function(group) {
                topicsById[ group.id ] = group;
            });
            // populate the list of topics in the UI
            var groups = config.groups.map(function(group) { return { id : group.id, name : group.name }; });
            ceui.setTopics(groups);

            //
            // cache the overlay ("map layers") details:
            //
            config.overlays.forEach(function(overlay) {
                overlaysById[ overlay.id ] = overlay;
            });

            // pre-select whichever group (topic) is present in the permalink URL, if any, otherwise pre-select the first one
            var i = 0;
            if (pl.haveTp()) {
                for (var j=0; j<groups.length; ++j) {
                    if (groups[j].id === pl.getTp()) {
                        i = j;
                        break;
                    }
                }
            }
            ceui.setTopic(groups[i].id);
            setTopic(groups[i].id, { clearLayers : false });

            MAPLITE_CONFIG = config;
        })
                ];

    var $permalink = $( '#permalink' ).permalink();

    var pl = Permalink(URL({url: window.location.toString()}));

    function updatePermalinkDisplay() {
        window.history.replaceState({}, "RDV", pl.toString());
        $permalink.permalink('url', pl.toString());
    }

    $.when.apply( $, requests ).done( function(){
        var mapOptions = {};
        // deploy map now that the template is ready
        if (pl.haveZoom()) {
            mapOptions.zoom = pl.getZoom();
        }
        if (pl.haveCenter()) {
            mapOptions.center = pl.getCenter();
        }
        var $mapl = ceui.getMapElement().mapLite({
            config: MAPLITE_CONFIG,
            changeOpacityCallback: function( layerId, opacity ) {
                pl.setLayerOpacity(layerId, opacity);
                updatePermalinkDisplay();
            },
            layerToggleCallback: function( layerId, isEnabled ) {
                if (isEnabled) {
                    pl.addLayer(layerId);
                } else {
                    pl.removeLayer(layerId);
                }
                updatePermalinkDisplay();
            },
            mapOptions: mapOptions,
            moveCallback: function(o) {
                pl.setCenter(o.center);
                pl.setZoom(o.zoom);
                updatePermalinkDisplay();
                $permalink.permalink('dismiss');
            },
            layers: {
                maplite: [
                    new $.nemac.MapliteDataSource(
                        MAPLITE_CONFIG.stations.data,
                        MAPLITE_CONFIG.stations.name,
                        MAPLITE_CONFIG.stations.id,
                        $.nemac.MARKER_COLORS.RED,
                        MAPLITE_CONFIG.stations.projection,
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
                    )]
            },
            iconPath: BUILD_BASE_PATH + 'img/',
            useLayerSelector : false,
            selectCallback: clickPoint,
            onCreate: function(mL) {
                rememberML(mL);

                ceui.enabled(true);

                // look at the permalink URL info to determine which data variable buttons should
                // be initially selected
                var varIds = {};
                if (pl.haveGraphs()) {
                    pl.getGraphs().forEach(function(graph) {
                        varIds[ graph.type ] = true;
                    });
                } else {
                    // if no graphs were present in permalink URL, default to having all vars selected
                    GRAPH_VARIDS.forEach(function(varId) {
                        varIds[ varId ] = true;
                    });
                }

                // set the data variables in the UI
                ceui.setDataVariables([
                    { id : "TEMP",     name : "TEMPERATURE",   selected : varIds["TEMP"]     },
                    { id : "PRCP_YTD", name : "PRECIPITATION", selected : varIds["PRCP_YTD"] }
                ]);

                // deploy any graphs present in the permalink URL:
                var stationIds = {};
                if (pl.haveGraphs()) {
                    pl.getGraphs().forEach(function(graph) {
                        stationIds[ graph.id ] = true;
                    });
                    stationIds = Object.keys(stationIds);
                    stationIds.forEach(function(stationId) {
                        var point = mL.getPoint('lyr_ghcnd', "GHCND:" + stationId);
                        ceui.showStation({ id : point.id, name : point.name, latlon : "" });
                        mL.selectPoint( 'lyr_ghcnd', point.id );
                    });
                }

                // turn on any overlay layers present in the permalink URL:
                pl.getLayers().forEach(function(layer) {
                    mL.setLayerVisibility(layer.id, true);
                    mL.setLayerOpacity(layer.id, layer.opacity);
                    ceui.setLayerVisibility(layer.id, true);
                    ceui.setLayerOpacity(layer.id, layer.opacity);
                });

                // TODO is this problematic to move this into the onCreate method, as opposed to outside as it was before?
                // initialize the pl object from the initial map state:
                (function(o) {
                    pl.setCenter(o.center);
                    pl.setZoom(o.zoom);
                    updatePermalinkDisplay();
                }($mapl.mapLite('getCenterAndZoom')));


                if (pl.havePerspective()) {
                    ceui.setPerspective(pl.getPerspective());
                } else {
                    if (pl.haveGraphs()) {
                        ceui.setPerspective(ceui.GRAPHS_PERSPECTIVE);
                        pl.setPerspective(ceui.GRAPHS_PERSPECTIVE);
                    } else {
                        ceui.setPerspective(ceui.LAYERS_PERSPECTIVE);
                        pl.setPerspective(ceui.LAYERS_PERSPECTIVE);
                    }
                    updatePermalinkDisplay();
                }

            }
        });
    });

    // removed code exhibit "A" was here

    //
    // Interactions
    //
    function clickPoint( point ) {
        ceui.showStation({ id : point.id, name : point.name, latlon : "" });
        // removed code exhibit "B" was here
    }

    // removed code exhibit "C" was here

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
        var center = null, zoom = null, gp = null, tp = null, p = null;
        var graphs = [];
        var layers = [];
        var scales = {};
        if ('zoom' in url.params) {
            zoom = parseInt(url.params.zoom, 10);
        }
        if ('center' in url.params) {
            center = url.params.center.split(',').map(function(s) { return parseFloat(s); });
        }
        if ('gp' in url.params) {
            var fields = url.params.gp.split(':');
            gp = {
                'open'  : parseInt(fields[0],10) !== 0
            };
            if (fields.length > 1) {
                gp.width = parseInt(fields[1],10);
            }
        }
        if ('tp' in url.params) {
            tp = url.params.tp;
        }
        if ('p' in url.params) {
            if (url.params.p === "L") {
                p = ceui.LAYERS_PERSPECTIVE;
            } else {
                p = ceui.GRAPHS_PERSPECTIVE;
            }
        }
        if ('graphs' in url.params) {
            url.params.graphs.split(',').forEach(function(graphString) {
                var fields = graphString.split(':');
                graphs.push({id:fields[0], type:fields[1]});
            });
        }
        if ('scales' in url.params) {
            url.params.scales.split(',').forEach(function(scale) {
                var fields = scale.split(':');
                /////////////////////////////////////////////////////////////////////////////
                // temporary patch to provide backward compatibility with permalink URLs that
                // used the old vertical axis binding names ("tempc", "ytd-prcpmm", etc):
                if (fields[0] === "tempc") { fields[0] = "temp"; }
                else if (fields[0] === "ytd-prcpmm") { fields[0] = "ytd-prcp"; }
                else if (fields[0] === "prcpmm") { fields[0] = "prcp"; }
                else if (fields[0] === "snowmm") { fields[0] = "snow"; }
                // end of temporary patch; remove this patch once all links have been changed;
                // see https://github.com/nemac/climate-explorer/issues/26
                /////////////////////////////////////////////////////////////////////////////
                scales[fields[0]] = { min : fields[1], max : fields[2] };
            });
        }
        if ('layers' in url.params) {
            url.params.layers.split(',').forEach(function(layerString) {
                var fields = layerString.split(':');
                layers.push({id:fields[0], opacity:fields[1]});
            });
        }
        return {
            'toString' : function() { return url.toString(); },
            'haveCenter' : function() { return center !== null; },
            'getCenter'  : function() { return center; },
            'setCenter'  : function(c) {
                center = c;
                url.params.center = sprintf("%.1f", center[0]) + "," + sprintf("%.1f", center[1]);
            },
            'haveZoom' : function() { return zoom !== null; },
            'getZoom'  : function() { return zoom; },
            'setZoom'  : function(z) {
                zoom = z;
                url.params.zoom = zoom.toString();
            },
            'haveTp'   : function() { return tp !== null; },
            'getTp'    : function() { return tp; },
            'setTp'    : function(t) {
                tp = t;
                url.params.tp = t;
            },
            'havePerspective'   : function() { return p !== null; },
            'getPerspective'    : function() { return p; },
            'setPerspective'    : function(q) {
                p = q;
                if (p === ceui.LAYERS_PERSPECTIVE) {
                    url.params.p = "L";
                } else {
                    url.params.p = "G";
                }
            },
            'haveGp'   : function() { return gp !== null; },
            'getGp'    : function() { return gp; },
            'setGp'    : function(g) {
                gp = g;
                url.params.gp = gp.open ? "1" : "0";
                if ('width' in gp) {
                    url.params.gp = url.params.gp + ":" + gp.width;
                }
            },
            'haveGraphs' : function() { return graphs.length > 0; },
            'getGraphs' : function() { return graphs; },
            'addGraph' : function(graph) {
                var i;
                // don't add this graph if it's already in the list
                for (i=0; i<graphs.length; ++i) {
                    if (graphs[i].id === graph.id && graphs[i].type == graph.type) {
                        return;
                    }
                }
                graphs.push(graph);
                url.params.graphs = graphs.map(function(g) { return g.id + ":" + g.type; }).join(",");
            },
            'removeGraph' : function(graph) {
                for ( var i = graphs.length - 1; i >= 0; i-- ) {
                    if (graphs[i].type === graph.type && graphs[i].id === graph.id) {
                        graphs.splice ( i, 1 );
                        break;
                    }
                }

                if (graphs.length > 0) {
                    url.params.graphs = graphs.map(function(g) { return g.id + ":" + g.type; }).join(",");
                } else {
                    delete url.params.graphs;
                }
            },
            'setScales' : function(aR) {
                var bindingId;
                for (bindingId in aR) {
                    if (!(bindingId in scales)) {
                        scales[bindingId] = {};
                    }
                    scales[bindingId].min = aR[bindingId].min;
                    scales[bindingId].max = aR[bindingId].max;
                }
                url.params.scales = Object.keys(scales).map(function(bindingId) {
                    return bindingId.replace("-binding", "") + ":" +
                        sprintf("%.1f", Number(scales[bindingId].min)) + ":" +
                        sprintf("%.1f", Number(scales[bindingId].max));
                }).join(",");
            },
            'haveScales' : function() {
                return Object.keys(scales).length > 0;
            },
            'getScales' : function() { return scales; },
            'haveLayers' : function() { return layers.length > 0; },
            'getLayers' : function() { return layers; },
            'addLayer' : function(layerId) {
                var i;
                // don't add this layer if it's already in the list
                for (i=0; i<layers.length; ++i) {
                    if (layers[i].id === layerId) {
                        return;
                    }
                }
                layers.push({id : layerId, opacity : 1});
                url.params.layers = layers.map(function(lyr) { return lyr.id + ":" + lyr.opacity; }).join(",");
            },
            'setLayerOpacity' : function(layerId, opacity) {
                var i;
                // don't add this layer if it's already in the list
                for (i=0; i<layers.length; ++i) {
                    if (layers[i].id === layerId) {
                        layers[i].opacity = opacity;
                        url.params.layers = layers.map(function(g) { return g.id + ":" + g.opacity; }).join(",");
                        return;
                    }
                }
            },
            'clearLayers' : function() {
                layers = [];
                delete url.params.layers;
            },
            'removeLayer' : function(layerId) {
                for ( var i = layers.length - 1; i >= 0; i-- ) {
                    if (layers[i].id === layerId) {
                        layers.splice ( i, 1 );
                        break;
                    }
                }
                if (layers.length > 0) {
                    url.params.layers = layers.map(function(g) { return g.id + ":" + g.opacity; }).join(",");
                } else {
                    delete url.params.layers;
                }
            }

        };
    }
});

////
//// removed code exhibit "A":
////
//    var initialPanelState = 'closed';
//    var initialPanelWidth = 600;
//    if (pl.haveGp()) {
//        var gp = pl.getGp();
//        if ('open' in gp && gp.open) {
//            initialPanelState = 'opened';
//        }
//        if ('width' in gp) {
//            initialPanelWidth = gp.width;
//        }
//    }
//
//    $( '#stationDetail' ).drawerPanel({
//        state: initialPanelState,
//        position: 'right',
//        color: '#fee',
//        title: 'Station Detail',
//        resizable: true,
//        width: initialPanelWidth,
//        minWidth: 400,
//        maxWidth: 800,
//        onResizeStop: resizePanel,
//        onClose: function() {
//            pl.setGp({'open' : false});
//            updatePermalinkDisplay();
//        },
//        onOpen: function() {
//            pl.setGp({'open' : true, 'width' : $( '#stationDetail div.drawer' ).width()});
//            updatePermalinkDisplay();
//        },
//        templateLocation: BUILD_BASE_PATH + 'tpl/panel.tpl.html'
//    });
//
//    function resizePanel() {
//        pl.setGp({ open : 1, width :  $( '#stationDetail div.drawer' ).width() });
//        updatePermalinkDisplay();
//
//        resizeGraphs();
//    }
//
//    function resizeGraphs() {
//        $.each(stationAndGraphLinkHash, function() {
//            var id = this.id;
//            if ( id ) {
//                (function(window) {
//                    var _jq = window.multigraph.jQuery;
//                    var ref = '#' + id + '-detail';
//
//                    // resize if multigraph has been deployed
//                    if ( _jq( 'div.graph',  ref ).children().length > 0 ) {
//                        var width = _jq( 'div.graph',  ref ).parent().width();
//                        var height = _jq( 'div.graph',  ref ).height();
//                        try {
//                            _jq( 'div.graph',  ref ).multigraph( 'done', function( m ) {
//                                m.resizeSurface( width, height );
//                                m.width( width ).height( height );
//                                m.redraw();
//                            });
//                        } catch( e ) {
//                            // TODO need better way to figure out if multigraph is initialized
//                        }
//                    }
//                })(window);
//            }
//        });
//    }
//
//    //
//    // Multigraph builder
//    //
//    function deployGraph( id, type ) {
//        if ( selectedStationCount >= MAX_SELECTED_STATIONS ) {
//            return;
//        }
//
//        // not already a container for this station, deploy and register the station
//        if ( $('#' + id + '-detail', '#stationDetail').length === 0 ) {
//            deployAndRegisterStation( id );
//        }
//
//        pl.addGraph({type: type, id : id});
//        updatePermalinkDisplay();
//
//        // add graph area to panel
//        $('<div/>', {
//            id: id + '-' + type + '-graph',
//            class: 'graph'
//        }).appendTo( '#' + id + '-detail' );
//
//        // resize other graphs in case scrollbar appears
//        resizeGraphs();
//
//        // register type
//        $.each( stationAndGraphLinkHash, function( i, obj ) {
//            if (obj && obj.id === id) {
//                obj.types.push( type );
//                return false;
//            }
//        });
//
//        var payload = MuglHelper.getDataRequests( type, id );
//        $.when.apply( $, payload.requests ).done( function(){
//            var graphRef = '#' + id + '-' + type + '-graph';
//            $( graphRef ).empty();
//            (function( window ) {
//                var _jq  = window.multigraph.jQuery;
//                _jq ( graphRef ).multigraph( {
//                    muglString: MuglHelper.buildMugl(
//                        payload.data,
//                        type,
//                        DATA_SUMMARY[id],
//                        MUGLTEMPLATES
//                    )});
//
//                _jq ( graphRef ).multigraph( 'done', function(mg) {
//                    var i, naxes = mg.graphs().at(0).axes().size();
//                    //var yearFormatter = new window.multigraph.core.DatetimeFormatter("%Y-%M-%D");
//                    for (i=0; i<naxes; ++i) {
//                        (function(axis) {
//                            if (pl.haveScales()) {
//                                var scales = pl.getScales();
//                                var bindingId = axis.binding().id().replace('-binding','');
//                                var parser;
//                                if (bindingId === "time") {
//                                    parser = window.multigraph.core.DatetimeValue;
//                                } else {
//                                    parser = window.multigraph.core.NumberValue;
//                                }
//                                if (bindingId in scales) {
//                                    axis.setDataRange(parser.parse(scales[bindingId].min),
//                                                      parser.parse(scales[bindingId].max));
//                                }
//                            }
//                            axis.addListener('dataRangeSet', function(e) {
//                                updateAxisDebounce(axis.binding().id(), e.min, e.max);
//                            });
//                        }(mg.graphs().at(0).axes().at(i)));
//                    }
//                });
//
//            })( window );
//        });
//    }
//
//    function deployAndRegisterStation( id ) {
//        var index = ++selectedStationCount; // TODO: revise so that is not effectively a 1-indexed array
//        var point = $( '#map' ).mapLite( 'getPoint', 'lyr_ghcnd', "GHCND:" + id);
//
//        // put contents into panel
//        var contents = Mustache.render(
//            STATION_DETAIL_TEMPLATE, {
//                id: id,
//                index: index,
//                name: point.name.toCapitalCase(),
//                lat: point.lat,
//                lon: point.lon
//            });
//
//        $( '#stationDetail' ).drawerPanel( 'appendContents', contents );
//
//        // register selected types
//        stationAndGraphLinkHash[index] = {
//            id: id,
//            types: [],
//            point: point
//        };
//    }

////
//// removed code exhibit "B":
////
//        if ( selectedStationCount >= MAX_SELECTED_STATIONS ) {
//            return;
//        }
//
//        var types = [];
//
//        //build li of types currently selected
//        $.each( SUPPORTED_STATION_VARS, function( type, obj ) {
//            if ( obj.selected ) {
//                types.push( type );
//            }
//        });
//
//        //disallowelection if no data are to be displayed
//        if ( types.length === 0 ) {
//            $( '#map' ).mapLite('unselectPoint', point.id );
//            return;
//        }
//
//        $( '#stationDetail' ).drawerPanel( 'open' );
//
//        var sanitizedId = sanitizeString( point.id );
//
//        //deploy f each type
//        $.each( types, function( i, type ){
//            deployGraph( sanitizedId, type );
//        });


////
//// removed code exhibit "C":
////
//    removeGraph = function removeGraph( ind ) {
//        var index = parseInt( ind );
//
//        pl.removeGraph(stationAndGraphLinkHash[index]);
//        updatePermalinkDisplay();
//
//        var instance = this;
//
//        // decrement any items greater than the removed
//        for (var i = selectedStationCount; i > index ; i--) {
//            var shift = stationAndGraphLinkHash[i];
//            // update graph label
//            var newIndex = i -1;
//            var shiftRef = 'div#' + shift.id + '-detail';
//            $( 'span.point-index', shiftRef ).html( '(' + newIndex + ')' );
//            $( 'div.remove', shiftRef ).on( 'click', function() {
//                instance.removeGraph( newIndex );
//            });
//
//            // TODO improve - the selected layer gets rebuilt each time
//            $( '#map' ).mapLite('setLabel', shift.point.id, newIndex);
//        }
//
//        // remove the selected item
//        var point = stationAndGraphLinkHash[index].point;
//        $('div#' + stationAndGraphLinkHash[index].id + '-detail', '#stationDetail' ).remove();
//
//        // TODO parameterize reference?
//        $( '#map' ).mapLite('unselectPoint', point.id);
//        stationAndGraphLinkHash.splice(index, 1);
//        selectedStationCount--;
//
//        if ( selectedStationCount === 0 ) {
//            $( '#stationDetail' ).drawerPanel( 'close' );
//        }
//    };
//
//    // station data selector helpers
//
//    function deployStationDataOptionsSelector() {
//        var contents = '';
//        $.each(SUPPORTED_STATION_VARS, function( key, obj ) {
//            contents += buildStationDataOptionSelector( key, obj.label, obj.selected );
//        });
//
//        $('#mlLayerList').append(
//            '<div id="stationVarLabel" class="mlDataLbl">Historical Weather Records</div>' +
//                '<div id="stationVarSelector">' +
//                contents +
//                '</div>');
//
//        $( 'input.station-var-chk' ).click( function() {
//            var id = this.id;
//            var type = id.replace( '-chk', '' );
//
//            if ( this.checked ) {
//                selectVar( type );
//            } else {
//                unselectVar( type );
//            }
//        });
//    }
//
//    function buildStationDataOptionSelector( key, label, selected ) {
//        var sel = '';
//        if ( selected ) {
//            sel = 'checked=""';
//        }
//
//        var selectorTemplate = '<div class="mlLayerSelect"><input id="{{key}}-chk" type="checkbox" name="{{label}}" value="{{label}}" {{sel}} class="station-var-chk">' +
//                '<label class="labelSpan olButton" style="vertical-align: baseline;">{{label}}</label>' +
//                '</div>';
//        return Mustache.render( selectorTemplate, {
//            key: key,
//            label: label,
//            sel: sel
//        });
//    }
//
//    function selectVar( type ) {
//        SUPPORTED_STATION_VARS[type].selected = true;
//
//        // register selected types
//        $.each( stationAndGraphLinkHash, function( i, obj ){
//            if ( obj ) { // have to skip idx 0, because it is a 1-indexed array
//                //obj.types.push( type );
//                deployGraph( obj.id, type );
//            }
//        });
//    }
//
//    function unselectVar( type ) {
//        SUPPORTED_STATION_VARS[type].selected = false;
//
//        var rem = [];
//
//        $.each( stationAndGraphLinkHash, function( i, obj ){
//            if ( obj ) { // have to skip idx 0, because it is a 1-indexed array
//                // check if last graph for station, remove entirely if so
//                if ( obj.types.length <= 1 ) {
//                    rem.push( i );
//                } else {
//                    // remove url param
//                    pl.removeGraph( $.extend( {}, obj, { types: [ type ] }) );
//                    updatePermalinkDisplay();
//
//                    obj.types.splice( obj.types.indexOf( type ), 1 );
//                    $( '#' + obj.id + '-' + type + '-graph' ).remove();
//                }
//            }
//        });
//
//        $.each( rem, function( i, val ) {
//            removeGraph( val );
//        });
//    }
