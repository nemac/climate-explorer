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
 *   $( DIV_SELECTOR ).mapLite( "myMethodName", ARG1, ARG2, ... );
 * 
 * Command methods (return this for chaining)
 * 
 * Getters (return the requested value)
 * 
 * ------- NOTES -------
 * projection: EPSG:900913
 * untis: m
 * 
 */

function MapliteDataSource( url, name, pointStyle, projection, callback ) {
    this.url = url;
    this.name = name;
    this.pointStyle = pointStyle;
    this.projection = projection;
    this.callback = callback;
}

(function($){
    // statics
    var size = new OpenLayers.Size(14,24);
    var offset = new OpenLayers.Pixel(-(size.w)/2, -size.h);
    var defaultIconPath = 'static/icons/markers/24/fb6254.png';
    var defaultMarker = new OpenLayers.Icon(defaultIconPath, size, offset);

    $.widget( "nemac.mapLite", {
        //
        // Defaults
        //
        options: {
            baseLayer: new OpenLayers.Layer.XYZ(
                    "OSM (with buffer)",
                    [
                        "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
                        "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
                        "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
                    ], {
                        transitionEffect: "resize",
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
            var mapLayers = this._sliceLayersByInitType( this.layers );
            
            // init map
            this.map = this._initMap( mapLayers.passthrough );
            this.map.zoomToExtent( this.options.extent, true );
            
            // add deferred layers
            var instance = this;
            $.each( mapLayers.deferred, function( index, value ) {
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
        
        _sliceLayersByInitType: function( layers ) {
            var passthroughLayers = $.merge ( [], layers );
            var deferredLayers = [];
            
            // separate mapLite layers from passthrough layers
            $.each( passthroughLayers, function( index, value ) {
                if ( value instanceof MapliteDataSource ) {
                    deferredLayers.push( value );
                    passthroughLayers.splice( index, 1 );
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
                units: "m",
                layers: initialLayers,
                controls: [
                    new OpenLayers.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    })
                ],
                zoom: 4,
                projection: new OpenLayers.Projection( "EPSG:900913" )
            });
        },
        
        _addMapliteData: function( layer, map ) {
            var instance = this;
            $.getJSON( layer.url, function( points ) {
                var pointsLayer = instance._translateJSON( layer, points, instance.map.getProjectionObject() );
                map.addLayer( pointsLayer );
            });
        },
        
        _translateJSON: function( source, points, mapProjection ) {
            var pointsLayer = new OpenLayers.Layer.Markers(
                    source.name,
                    {
                        projection  : mapProjection, 
                        units       : "m"
                    }
            );

            $.each( points, function( i, point ) {
                var coordinates = new OpenLayers.LonLat( point.lon, point.lat );
                // TODO: paramterize
                coordinates = coordinates.transform(
                        source.projection,
                        mapProjection
                );

                var marker = new OpenLayers.Marker(
                        coordinates,
                        defaultMarker.clone()
                );
        
                if ( source.callback !== null && typeof source.callback === 'function' ) {
                    marker.events.register( 'mouseover', marker, $.noop);
                    marker.events.register( 'click', marker, function() { 
                        source.callback( this, point );
                    } );
                    marker.events.register( 'touchstart', marker, function() { 
                        source.callback( this, point );
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