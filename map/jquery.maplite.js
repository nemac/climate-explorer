/**
 * Maplite jQuery Widget
 * This data viewer plugin is the central router for data display related functions
 * 
 * TODO: add disclaimers, boilerplating, etc
 * 
 * Public API reference
 * ------- USAGE -------
 * $( DIV_SELECTOR ).regionalDataViewer( { ARG1, ARG2, ... } );
 * 
 * Note: the div must have sizing styles applied to it
 * 
 * ---- CONSTRUCTOR ----
 * Parameters
 *   baseLayer: OpenLayers.Layer       A single base layer for the map
 *   layers: [OpenLayers.Layer, ...]   An array of data layers to overlay on the map
 *   extent: OpenLayers.Bounds         Initial extent of map
 * 
 * Returns
 *   this
 * 
 * ------ METHODS ------
 * All methods are exposed via reflection through the widget reference
 * Example
 *   $( DIV_SELECTOR ).mapLite( 'myMethodName', ARG1, ARG2, ... );
 * 
 * Command methods (return this for chaining)
 * 
 * Getters (return the requested value)
 * 
 */

$.nemac.MARKER_COLORS = {
    RED: {hex: '#fb6254'},
    GREEN: {hex: '#00e03c'},
    BLUE: {hex: '#4462c8'},
    CYAN: {hex: '#54d6d6'},
    PURPLE: {hex: '#7d54fb'},
    YELLOW: {hex: '#fcf357'}
};

function MapliteDataSource( url, name, color, projection, callback ) {
    this.url = url;
    this.name = name;
    this.color = color;
    this.projection = projection;
    this.callback = callback;
}

(function($){
    // private constants
    var SIZE = new OpenLayers.Size(14,24);
    var OFFSET = new OpenLayers.Pixel(-(SIZE.w)/2, -SIZE.h);
    var ICON_PATH = 'map/markers/24/';
    var ICON_EXTENSION = '.png';
    var UNITS = 'm';
    var PROJECTION = 'EPSG:900913';
    
    function findIconPath( marker ) {
        // translate to object, if string
        if ( typeof marker === 'string' ) {
            marker = marker.toUpperCase();
            marker = $.nemac.MARKER_COLORS[marker];
        }
        
        // provide default if marker isn't valid
        if ( typeof marker === 'undefined' 
                || typeof marker.hex === 'undefined' || marker.hex === null) {
            marker = $.nemac.MARKER_COLORS.RED;
        }
        
        return ICON_PATH + marker.hex.substring(1) + ICON_EXTENSION;
    }

    $.widget( 'nemac.mapLite', {
        //
        // Defaults
        //
        options: {
            baseLayer: new OpenLayers.Layer.XYZ(
                    'OSM (with buffer)',
                    [
                        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
                        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
                    ], {
                        transitionEffect: 'resize',
                        buffer: 2,
                        sphericalMercator: true
                    }),
            layers: [],
            extent: new OpenLayers.Bounds(
                -15000000, 2000000, -6000000, 7000000
            )
        },
        
        //
        // Private vars
        //
        layers: [],
        map: null,
        
        //
        // Private methods
        //
        _create: function() {
            // prepare layers
            this.layers = this._mergeBaseLayerWithLayers( this.options.baseLayer, this.options.layers );
            var mapLayers = this._separateLayersByType( this.layers );

            // init map
            this.map = this._initMap( mapLayers.passthrough );
            this.map.zoomToExtent( this.options.extent, true );

            // add deferred layers
            var instance = this;
            $.each( mapLayers.deferred, function( i, value ) {
                instance._addMapliteData( value, instance.map );
            });
        },
        
        _mergeBaseLayerWithLayers: function( base, layers ) {
            // add the isBaseLayer property to the specified base layer, if not added
            var baseLayer = $.extend( {}, base, { isBaseLayer: true });
            
            // push the base layer into the layers array for cleaner initialization
            var mergedLayers = $.merge( [], layers );
            mergedLayers.push( baseLayer );
            
            return mergedLayers;
        },
        
        _separateLayersByType: function( layers ) {
            var passthroughLayers = [];
            var deferredLayers = [];

            // separate mapLite layers from passthrough layers
            $.each( layers, function( i, value ) {
                if ( value instanceof MapliteDataSource ) {
                    deferredLayers.push( value );
                } else {
                    passthroughLayers.push( value );
                }
            });
            
            return {
                deferred: deferredLayers,
                passthrough: passthroughLayers
            };
        },
        
        _initMap: function( initialLayers ) {
            return new OpenLayers.Map({
                div: this.element[0],
                extent: this.options.extent,
                units: UNITS,
                layers: initialLayers,
                controls: [
                    new OpenLayers.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    })
                ],
                zoom: 4,
                projection: new OpenLayers.Projection( PROJECTION )
            });
        },
        
        _addMapliteData: function( mapliteLayer, map ) {
            var instance = this;
            
            $.getJSON( mapliteLayer.url, function( points ) {
                var pointsLayer = instance._translateJSON( mapliteLayer, points, instance.map.getProjectionObject() );
                map.addLayer( pointsLayer );
            });
        },
        
        _translateJSON: function( mapliteLayer, points, mapProjection ) {
            var markerIcon = new OpenLayers.Icon(
                    findIconPath(mapliteLayer.color),
                    SIZE,
                    OFFSET
            );
            
            var pointsLayer = new OpenLayers.Layer.Markers(
                    mapliteLayer.name,
                    {
                        projection  : mapProjection, 
                        units       : UNITS
                    }
            );

            $.each( points, function( i, point ) {
                var coordinates = new OpenLayers.LonLat( point.lon, point.lat );

                if ( mapliteLayer.projection !== mapProjection ) {
                    coordinates = coordinates.transform(
                            mapliteLayer.projection,
                            mapProjection
                    );
                }

                var marker = new OpenLayers.Marker(
                        coordinates,
                        markerIcon.clone()
                );
        
                if ( mapliteLayer.callback !== null && typeof mapliteLayer.callback === 'function' ) {
                    marker.events.register( 'click', marker, function() { 
                        mapliteLayer.callback( this, point );
                    } );
                    marker.events.register( 'touchstart', marker, function() { 
                        mapliteLayer.callback( this, point );
                    } );
                }

                pointsLayer.addMarker( marker );
            });

            return pointsLayer;
        },
        
        //
        // Public methods
        //
        zoomToMaxExtent: function() {
            this.map.zoomToMaxExtent();
        }
    });

})(jQuery);