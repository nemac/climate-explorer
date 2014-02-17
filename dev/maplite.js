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

var MARKER_COLORS = {
    RED: {hex: '#fb6254'},
    GREEN: {hex: '#00e03c'},
    BLUE: {hex: '#4462c8'},
    CYAN: {hex: '#54d6d6'},
    PURPLE: {hex: '#7d54fb'},
    YELLOW: {hex: '#fcf357'}
};

function MapliteDataSource( url, name, color, projection, styleMap ) {
    this.url = url;
    this.name = name;
    this.color = color;
    this.projection = projection;
    this.styleMap = styleMap;
}

(function($){
    // private constants
    var SIZE = new OpenLayers.Size(14,24);
    var OFFSET = new OpenLayers.Pixel(-(SIZE.w)/2, -SIZE.h);
    var ICON_PATH = 'markers/24/';
    var ICON_EXTENSION = '.png';
    var UNITS = 'm';
    var PROJECTION = 'EPSG:900913';

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
            ),
            iconPath: ICON_PATH,
            zoomCallback: null,
            selectCallback: null
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
            var deferredLayers = [];
            var instance = this;

            $.each( mapLayers.deferred, function( i, value ) {
                var test = instance._getMapliteData( value );
                deferredLayers.push( test );
            });
            
            this.map.addLayers( deferredLayers );
            
            var selectControl = new OpenLayers.Control.SelectFeature( 
                    deferredLayers,
                    {
                        clickout: false,
                        toggle: false,
                        multiple: false,
                        onSelect: function( event ) {
                            if ( instance.options.selectCallback !== null && typeof instance.options.selectCallback === 'function' ) {
                                instance.options.selectCallback( event );                            
                                event.layer.redraw();                                
                            }
                        }
                    }
            );
            this.map.addControl( selectControl );
            selectControl.activate();
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
            var olMap = new OpenLayers.Map({
                div: this.element[0],
                extent: this.options.extent,
                units: UNITS,
                layers: initialLayers,
                controls: [
                    new OpenLayers.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    }),
                    new OpenLayers.Control.Zoom()
                ],
                zoom: 4,
                projection: new OpenLayers.Projection( PROJECTION )
            });

            var instance = this;
            
            olMap.zoomToProxy = olMap.zoomTo;
            olMap.zoomTo = function() {
                olMap.zoomToProxy.apply( this, arguments );
                var callback = instance.options.zoomCallback;
                if ( typeof callback === 'function' ) {
                    callback.call();
                }
            };
            
            return olMap;
        },
        
        _getMapliteData: function( mapliteLayer ) {
            var instance = this;
            
            // TODO: make async
            var pointsLayer;
            $.ajax({
                async: false,
                url: mapliteLayer.url,
                success: function( points ) {
                    pointsLayer = instance._translateJSON( mapliteLayer, points, instance.map.getProjectionObject() );
                }
            });
            
            return pointsLayer;
        },
        
        _translateJSON: function( mapliteLayer, points, mapProjection ) {
            var pointsLayer = new OpenLayers.Layer.Vector(
                    mapliteLayer.name,
                    {
                        projection: mapProjection, 
                        units: UNITS,
                        styleMap: this._setDefaultStyleMap( mapliteLayer )
                    }
            );
    
            var features = [];

            $.each( points, function( i, obj ) {
                var coordinates = new OpenLayers.LonLat( obj.lon, obj.lat );

                if ( mapliteLayer.projection !== mapProjection ) {
                    coordinates = coordinates.transform(
                            mapliteLayer.projection,
                            mapProjection
                    );
                }

                var point = new OpenLayers.Geometry.Point( coordinates.lon, coordinates.lat );
                var pointFeature = new OpenLayers.Feature.Vector(point);
                
                // store attributes for later use in calling app
                pointFeature.attributes.label = "";
                for (var key in obj) {
                    pointFeature.attributes[key] = obj[key];
                }
                
                features.push( pointFeature );    
            });

            pointsLayer.addFeatures( features );

            return pointsLayer;
        },
        
        _setDefaultStyleMap: function( mapliteLayer ) {
            var styleMap = mapliteLayer.styleMap;
            // provide default label style if not provided
            if (typeof styleMap !== 'undefined' && styleMap instanceof OpenLayers.StyleMap ) {
                return styleMap;
            } else {
                var cursor = '';
                if ( this.options.selectCallback !== null && typeof this.options.selectCallback === 'function' ) {
                    cursor = 'pointer';
                }

                return new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        externalGraphic: this._findIconPath( mapliteLayer.color ),
                        fillOpacity: 1,
                        pointRadius: 12,
                        label: '${label}',
                        labelXOffset: 10,
                        labelYOffset: 16,
                        cursor: cursor
                    }, OpenLayers.Feature.Vector.style["default"])),
                    "select": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        externalGraphic: this._findIconPath( mapliteLayer.color ),
                        fillOpacity: 1,
                        pointRadius: 12,
                        label: '${label}',
                        labelXOffset: 10,
                        labelYOffset: 16,
                        cursor: cursor
                    }, OpenLayers.Feature.Vector.style["select"]))
                });
            }
        },

        _findIconPath: function( marker ) {
            // translate to object, if string
            if ( typeof marker === 'string' ) {
                marker = marker.toUpperCase();
                marker = MARKER_COLORS[marker];
            }
            
            // provide default if marker isn't valid
            if ( typeof marker === 'undefined' 
                    || typeof marker.hex === 'undefined' || marker.hex === null) {
                marker = MARKER_COLORS.RED;
            }
            
            return this.options.iconPath + marker.hex.substring(1) + ICON_EXTENSION;
        },
        
        //
        // Public methods
        //
        zoomToMaxExtent: function() {
            this.map.zoomToMaxExtent();
        }
    });

})(jQuery);