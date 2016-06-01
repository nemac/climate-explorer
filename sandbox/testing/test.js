
(function($, document){

    // private constants
    var ICON_PATH = 'markers/24/';
    var ICON_EXTENSION = '.png';
    var UNITS = 'm';
    var PROJECTION = 'EPSG:900913';
    var SELECTED_LAYER_NAME = 'lyr_selected';

    var MARKER_COLORS = {
        RED: {hex: '#fb6254'},
        GREEN: {hex: '#00e03c'},
        BLUE: {hex: '#4462c8'},
        CYAN: {hex: '#54d6d6'},
        PURPLE: {hex: '#7d54fb'},
        YELLOW: {hex: '#fcf357'}
    };

    function randarg() {
        var rand = String((new Date()).getTime());
        return "rand=" + rand;
    }

    function MapliteDataSource( url, name, id, color, projection, styleMap, filter ) {
        this.url = url;
        this.name = name;
        this.id = id;
        this.color = color;
        this.projection = projection;
        this.styleMap = styleMap;
        if ( typeof filter !== 'undefined' && filter !== null ) {
            this.filter = filter;
        } else {
            this.filter = function( zoom, layer ) {
                return layer;
            };
        }
    }

    /*
     * The following is a fix for some odd behavior when a WMS layer is configred as 4326.
     * Some background on the behavior:
     * 1) If a WMS overlay in the config doesn't have a projection specified, it
     *    uses the map default (currently 900913). One can see that the request goes
     *    through to the service with 900913, and everything is good.
     * 2) If a WMS overlay has another SRS defined like EPSG:3857, the layer is
     *    configured using that code as expected. One can see that the request goes
     *    through to the serivce with 3857, and everything is good.
     * 3) If a WMS overlay uses 4326, the layer is configured using that code as
     *    expected. HOWEVER, when the WMS request is made, one can see from the traffic
     *    that the request uses the EPSG code of 102100... Where does this come from?
     *    Presumably the base layer that uses 102100. Why is this behavior inconsistent
     *    given items 1 and 2 above? I have no idea. But, in come cases, the WMS is
     *    configured to allow reuqests for 4326 and for 102100 (which is why this was
     *    not previously noticed). Recently, I encountered a service howerver that
     *    exposed 4326 but NOT 102100. OL helpfully continued requesting 102100 and
     *    the service rejected the request.
     *
     * What follows is forcing OL to request 4326 when it thinks 102100 is what we want.
     *
     */
    OpenLayers.Layer.WMS.prototype.getFullRequestString = function( newParams, altUrl ) {
        var thisProj = this.projection.toString();

        if ( thisProj === 'EPSG:4326' ) {
            var baseProj = this.map.baseLayer.projection.toString();
            this.params.SRS = thisProj;
            var request = OpenLayers.Layer.Grid.prototype.getFullRequestString.apply( this, arguments );
            var bbox = request.match(/BBOX=([^&]+)/)[1].split( ',' );
            var bounds = new OpenLayers.Bounds( bbox );
            bounds = bounds.transform( new OpenLayers.Projection( baseProj ), new OpenLayers.Projection( thisProj ) );
            request = request.replace( bbox, bounds.toString() );
            return request;
        } else {
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!
            // THIS IS THE DEFAULT BEHAVIOR AS TAKEN DIRECTLY FROM THE SOURCE
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!
            var mapProjection = this.map.getProjectionObject();
            var projectionCode = this.projection && this.projection.equals(mapProjection) ? this.projection.getCode() : mapProjection.getCode();
            var value = (projectionCode === "none") ? null : projectionCode;
            if (parseFloat(this.params.VERSION) >= 1.3) {
                this.params.CRS = value;
            } else {
                this.params.SRS = value;
            }

            if (typeof this.params.TRANSPARENT === "boolean") {
                newParams.TRANSPARENT = this.params.TRANSPARENT ? "TRUE" : "FALSE";
            }

            return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
        }
    };

    /*
     * End kluge
     */

    $.widget( 'nemac.mapLite', {
        //----------------------------------------------------------------------
        // Defaults
        //----------------------------------------------------------------------
        options: {
            config: null, // if config provided, will override any parameters included
            layers: { bases: [ new OpenLayers.Layer.XYZ(
                'OSM (with buffer)',
                [
                    'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                    'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
                    'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
                ], {
                    transitionEffect: 'resize',
                    buffer: 2,
                    sphericalMercator: true
                })
            ], maplite: [], overlays: {}, groups: [] },
            mapOptions: {},
            useLayerSelector: true,
            iconPath: ICON_PATH,
            zoomCallback: null,
            moveCallback: null,
            priorityDataKey: 'weight',
            selectCallback: null,
            selectedColor: MARKER_COLORS.BLUE,
            changeOpacityCallback: null,
            layerToggleCallback: null,
            baseLayerSelectCallback: null,
            groupSelectCallback: null
        },

        //----------------------------------------------------------------------
        // Private vars
        //----------------------------------------------------------------------
        layers: { bases: [], maplite: [], overlays: {}, groups: [] },
        selectLayer: null,
        mapliteLayerCache: {},
        pointHash: {},
        selectedPoints: {},
        map: null,
        selectControl: null,
        filters: {},

        //----------------------------------------------------------------------
        // Private methods
        //----------------------------------------------------------------------
        _create: function() {
            // is external config file-driven?
            if ( this.options.config !== null && typeof this.options.config === 'object' ) {
                var instance = this;
                MapConfig( this.options.config ).done( function( options, mapOptions, layers ) {
                    $.extend( instance.options, options );
                    $.extend( instance.options.mapOptions, mapOptions );
                    $.extend( true, instance.layers, instance.options.layers, layers );
                    instance._initApp();
                }).fail( function() {
                    $(instance.element[0]).append('<b>Error loading map configuration.</b>');
                });
            } else {
                this.layers = this.options.layers;
                this._initApp();
            }
        },

        _initApp: function() {
            // prepare layers
            var defaultBase = this.layers.bases[0];

            $.each( this.layers.bases, function(){
                $.extend( {}, this, { isBaseLayer: true });
                if ( this.isDefault ) defaultBase = this;
            });

            // init map
            this.map = this._deployMap( this.layers.bases );

            // request maplite layers
            if ( this.layers.maplite.length > 0 ) {
                var instance = this;
                var requests = [];

                $.each( this.layers.maplite, function( i, mapliteLayer ) {
                    requests.push(
                        $.get( mapliteLayer.url )
                            .success( function( points ){
                                instance.filters[mapliteLayer.id] = instance._buildFilterFunctionCache( mapliteLayer.filter, points );
                                instance.pointHash[mapliteLayer.id] = instance._hashPoints( points );
                            })
                    );
                });

                $.when.apply( $, requests ).done( function() {
                    instance._scaleMapliteMarkers();

                    // do the rest of the deployment -- this is to avoid a race condition that sometimes happens with openlayers
                    if ( instance.options.useLayerSelector ) instance._buildLayerSwitcher();
                    instance.setBaseLayer( defaultBase.id );

                    if (instance.options.onCreate !== null && typeof instance.options.onCreate === 'function' ) {
                        instance.options.onCreate(instance);
                    }
                });

            } else {
                if ( this.options.useLayerSelector ) this._buildLayerSwitcher();
                this.setBaseLayer( defaultBase.id );
            }
        },

        _buildLayerSwitcher: function() {
            // deploy minimized state
            $( 'body' ).append( '<div id="mlMaximizeLayerSwitcher" class="mlMaximize mlSwitcher mlSelect">\n\
                                     <img src="img/layer-switcher-maximize.png"></img>\n\
                                     <span class="layerPickerLabel overlayLabel">Data</span>\n\
                                 </div>');

            $( '#mlMaximizeLayerSwitcher' ).on( 'click', function(){
                $( '#mlMaximizeLayerSwitcher' ).hide();
                $( '#mlLayerSwitcher' ).show();
            });

            // deploy maximized state
            $( 'body' ).append( '<div id="mlLayerSwitcher" class="mlSwitcher mlLayersDiv">\n\
                                     <div id="mlMinimizeLayerSwitcher" class="mlMinimize mlSelect">\n\
                                         <img src="img/layer-switcher-minimize.png"></img>\n\
                                     </div>\n\
                                     <div id="mlLayerList"></div>\n\
                                 </div>');

            $( '#mlMinimizeLayerSwitcher' ).on( 'click', function(){
                $( '#mlLayerSwitcher' ).hide();
                $( '#mlMaximizeLayerSwitcher' ).show();
            });

            var instance = this;

            // base layers
            if ( this.layers.bases.length > 1 ) {
                $( '#mlLayerList' ).append( '<span class="mlDataLbl">Base Layers</span><div class="mlLayerSelect"><select id="mlBaseList"></select></div>' );

                var baseList = '';
                $.each( this.layers.bases, function() {
                    baseList += '<option value="' + this.id + '">' + this.name + '</option>';
                });

                $( '#mlBaseList', '#mlLayerList').append( baseList ).on( 'change', function(){
                    instance.setBaseLayer( $(this).val() );

                    if (instance.options.baseLayerSelectCallback !== null && typeof instance.options.baseLayerSelectCallback === 'function' ) {
                        instance.options.baseLayerSelectCallback( $(this).val() );
                    }
                });
            }

            // groups
            var defaultGroup = this.layers.groups[0];

            // TODO parameterize the group label
            $( '#mlLayerList' ).append( '<span id="mlGroupLabel" class="mlDataLbl">Topics</span><div class="mlLayerSelect"><div id="mlGroupLayers"></div></div>' );
            if ( this.layers.groups.length > 1 ) {
                $( '#mlGroupLayers', '#mlLayerList' ).before('<select id="mlGroupList"></select>');

                var groupList = '';
                $.each( this.layers.groups, function() {
                    groupList += '<option value="' + this.id + '">' + this.name + '</option>';
                    if ( this.isDefault ) defaultGroup = this;
                });

                $( '#mlGroupList', '#mlLayerList').append( groupList ).on( 'change', function(){
                    instance._setGroup( $(this).val() );

                    if (instance.options.groupSelectCallback !== null && typeof instance.options.groupSelectCallback === 'function' ) {
                        instance.options.groupSelectCallback( $(this).val() );
                    }
                });
            } else if ( this.layers.groups.length === 1 ) {
                $( '#mlGroupLabel', '#mlLayerList').text( this.layers.groups[0].name );
            }
            instance._setGroup( defaultGroup.id );

            // attach transparency slider (used by individual overlays)

            $( '#mlLayerSwitcher' ).hide();

            $( '#OpenLayers_Control_MaximizeDiv', this.element[0] ).append( '<span class="layerPickerLabel overlayLabel">Data</span>' );

            $( this.element[0] ).append( '<div id="sliderContainer">\n\
                                    <div id="opacitySlider"></div>\n\
                                    <div class="sliderLabelContainer">\n\
                                       <span class="suffix">Transparent</span><span id="transparencyLevel">0%</span>\n\
                                    </div>\n\
                                    <div class="clear"></div>\n\
                                 </div>' );

            $( '#opacitySlider').slider({
                min: 0,
                max: 100
            });

            $( '#sliderContainer' ).hide();
        },

        _setGroup: function( groupId ) {
            var group = null;
            $.each( this.layers.groups, function(){
                if ( this.id === groupId ) {
                    group = this;
                    return false;
                }
            });

            if ( group === null ) return;

            $( '#mlGroupList', '#mlLayerList').val( groupId );

            var instance = this;

            // kill all current layers
            $( 'input', '#mlGroupLayers' ).each( function(){
                if ( $(this).is(':checked') ) {
                    $( this ).attr( 'checked', false );
                    var lyr = this.id.replace( 'chk_', '');
                    instance.setLayerVisibility( lyr, false );

                    if (instance.options.layerToggleCallback !== null && typeof instance.options.layerToggleCallback === 'function' ) {
                        instance.options.layerToggleCallback( lyr, false );
                    }
                }
            });

            $( '#mlGroupLayers' ).empty();

            if ( group.hasOwnProperty( 'layers' ) ) {
                $.each( group.layers, function() {
                    instance._deployLayerSelect( $( '#mlGroupLayers', '#mlLayerList' ), instance.layers.overlays[this] );
                });
            }

            if ( group.hasOwnProperty( 'subGroups') ) {
                $.each( group.subGroups, function() {
                    $( '#mlGroupLayers', '#mlLayerList' ).append( '<span class="mlDataLbl">' + this.name + '</span>' );
                    $.each( this.layers, function() {
                        instance._deployLayerSelect( $( '#mlGroupLayers', '#mlLayerList' ), instance.layers.overlays[this] );
                    });
                });

            };

            // bind click
            $( 'input', '#mlGroupLayers' ).click( function() {
                var lyr = this.id.replace( 'chk_', '' );
                instance._addOverlay( lyr );
                instance.setLayerVisibility( lyr, this.checked );

                if (instance.options.layerToggleCallback !== null && typeof instance.options.layerToggleCallback === 'function' ) {
                    instance.options.layerToggleCallback( lyr, this.checked );
                }
            });

            // bind open opacity slider
            $( 'img', '#mlGroupLayers' ).click( function( e ) {
                var lyr = this.id.replace( 'cfg_', '' );

                $( '#sliderContainer' )
                    .show( 300 ).offset({
                        left: e.pageX,
                        top: e.pageY - 20 })
                    .find( 'a' )
                    .off( 'blur' )
                    .on( 'blur', function(){
                        $( '#sliderContainer' ).hide( 'highlight', { color: '#ffffff' }, 300 ); })
                    .focus();

                $( '#opacitySlider').off( 'slide' );

                var opacity = Math.round( 100 - instance.getLayerOpacity( lyr ) * 100 );

                $( '#opacitySlider')
                    .off( 'slide' )
                    .on( 'slide', function( e, ui ) {
                        var val = Math.round(ui.value);
                        $( '#transparencyLevel' ).text( val + "%" );
                        instance.setLayerOpacity( lyr, 1 - val / 100 ); })
                    .off( 'slidestop' )
                    .on( 'slidestop', function( e, ui ) {
                        $( '#sliderContainer' ).hide( 'highlight', { color: '#ffffff' }, 300 );

                        var val = Math.round(ui.value);

                        if (instance.options.changeOpacityCallback !== null && typeof instance.options.changeOpacityCallback === 'function' ) {
                            instance.options.changeOpacityCallback( lyr, 1 - val / 100 );
                        } })
                    .slider( 'value', opacity );

                $( '#transparencyLevel' ).text( opacity + "%" );
            });
        },

        _deployLayerSelect: function( $ref, layer ) {
            var id = layer.id;
            var name = layer.name;
            $( $ref ).append( '<div class="mlLayerSelect"><input id="chk_' + id + '" type="checkbox"></input><label for=chk_' + id + '>' + name + '</label><img id="cfg_' + id + '" class="mlCfg" src="img/settings.png"></img></div>' );
            this.setLayerVisibility( id, false );
        },

        // map creation helpers

        _deployMap: function( initialLayers ) {
            var mapBaseOptions = {
                div: this.element[0],
                units: UNITS,
                layers: initialLayers,
                zoom: 4,
                center: [-10500000, 4500000],
                controls: [
                    new OpenLayers.Control.Navigation({
                        dragPanOptions: {
                            enableKinetic: true
                        }
                    }),
                    new OpenLayers.Control.Zoom()
                ],
                projection: new OpenLayers.Projection( PROJECTION ),
                theme: null
            };

            var olMap = new OpenLayers.Map($.extend( {}, mapBaseOptions, this.options.mapOptions));

            if ( typeof this.options.zoomCallback === 'function' ) {
                olMap.events.register("zoomend", olMap, this.options.zoomCallback);
            }

            if ( typeof this.options.moveCallback === 'function' ) {
                var self = this;
                olMap.events.register("moveend", olMap,
                    function() {
                        self.options.moveCallback(self.getCenterAndZoom());
                    });
            }

            // when map zooms, redraw layers as needed
            var self = this;
            olMap.events.register("zoomend", this, self._scaleMapliteMarkers );

            return olMap;
        },

        _deploySelectFeatureControl: function( layers ) {
            var instance = this;

            // register callback event, will add the layers later
            var selectControl = new OpenLayers.Control.SelectFeature(
                layers,
                {
                    clickout: true,
                    toggle: true,
                    multiple: false,
                    onSelect: function( event ) {
                        // check if point is in selected points, if so, return
                        if ( instance.selectedPoints[event.attributes.id] ) {
                            return;
                        }

                        var point = instance.pointHash[event.layer.id][event.attributes.id];

                        instance.selectPoint( event.layer.id, event.attributes.id);

                        // trigger unselect immediately so that this function works more like an onClick()
                        selectControl.unselect( event );

                        if ( instance.options.selectCallback !== null && typeof instance.options.selectCallback === 'function' ) {
                            instance.options.selectCallback( $.extend( {}, point ) );
                        }
                    }
                }
            );

            this.map.addControl( selectControl );
            selectControl.activate();

            return selectControl;
        },

        // data helpers
        _addSelectLayer: function( ) {
            // remove selected layer if exists
            var getLayer = this.map.getLayer( SELECTED_LAYER_NAME );
            if ( getLayer ) {
                this.map.removeLayer( getLayer );
            }

            // TODO generalize
            var ml = new MapliteDataSource(
                null,
                'Selected Stations',
                SELECTED_LAYER_NAME,
                this.options.selectedColor,
                'EPSG:4326'
            );

            var layer = this._translateJSON( ml, this.selectedPoints, this.map.getProjectionObject() );
            this.map.addLayer( layer );

            this.selectLayer = layer;

            this.map.raiseLayer( layer, this.map.layers.length - 1 );
            this.map.resetLayersZIndex();

            // re-register select listener
            var selectFeatures = [];
            var instance = this;

            $.each( this.layers.maplite, function() {
                selectFeatures.push( instance._getCacheLayer( this, instance.map.getZoom() ) );
            });

            selectFeatures.push(layer);

            this.selectControl.setLayer( selectFeatures );
        },

        _translateJSON: function( mapliteLayer, points, mapProjection ) {
            var pointsLayer = new OpenLayers.Layer.Vector(
                mapliteLayer.name,
                {
                    projection: mapProjection,
                    units: UNITS,
                    styleMap: this._setDefaultStyleMap( mapliteLayer ),
                    displayInLayerSwitcher: false
                }
            );

            pointsLayer.id = mapliteLayer.id;

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
                pointFeature.attributes.layerDefinition = mapliteLayer;

                features.push( pointFeature );
            });

            pointsLayer.addFeatures( features );

            return pointsLayer;
        },

        _hashPoints: function( points ) {
            var hash = {};
            $.each( points, function( i, point ){
                hash[point.id] = point;
                hash[point.id].selected = false;
                hash[point.id].label = "";
            });

            return hash;
        },

        // zoom handlers

        _scaleMapliteMarkers: function() {
            var zoom = this.map.getZoom();
            var selectFeatures = [];
            var instance = this;

            $.each( this.layers.maplite, function() {
                var toAdd = false;

                // remove corresponding layer if exists
                var getLayer = instance.map.getLayer( this.id );
                if ( getLayer ) { // exists and is visible
                    if ( getLayer.visibility ) {
                        instance.map.removeLayer( getLayer );
                        toAdd = true;
                    }
                } else {
                    toAdd = true;
                }

                if ( toAdd ) {
                    var cacheLayer = instance._getCacheLayer( this, zoom );
                    selectFeatures.push( cacheLayer );
                }
            });
            //debugger;
            this.map.addLayers( selectFeatures );

            if ( this.selectLayer ) {
                selectFeatures.push( this.selectLayer );
                this.map.raiseLayer( this.selectLayer, this.map.layers.length - 1 );
                this.map.resetLayersZIndex();
            }

            if ( this.selectControl === null ) {
                this.selectControl = this._deploySelectFeatureControl( selectFeatures );
            } else {
                this.selectControl.setLayer( selectFeatures );
            }
        },

        _buildFilterFunctionCache: function( filter, layer ) {
            var cache = {};
            return function( zoom ) {
                if ( cache[zoom] !== undefined ) {
                    return cache[zoom];
                }

                cache[zoom] = filter( zoom, layer );
                return cache[zoom];
            };
        },

        _getCacheLayer: function( layer, zoom ) {
            var points = this.filters[layer.id](zoom);

            if ( typeof this.mapliteLayerCache[layer.id] === 'undefined' || this.mapliteLayerCache[layer.id] === null ) {
                this.mapliteLayerCache[layer.id] = {};
            }

            if (typeof this.mapliteLayerCache[layer.id][zoom] === 'undefined' || this.mapliteLayerCache[layer.id][zoom] === null) {
                this.mapliteLayerCache[layer.id][zoom] = this._translateJSON( layer, points, this.map.getProjectionObject() );
            }

            return this.mapliteLayerCache[layer.id][zoom];
        },

        // layer generation, marker styling

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

        // layer selector

        _deploySelector: function() {
            var baseId = this.element[0].id;

            $('<div/>', {
                id: baseId + '',
                'class': 'selectPane'
            }).appendTo('#' + baseId);
        },

        _addOverlay: function( id ) {
            if ( this.map.getLayer( id ) === null ) {
                this.map.addLayer( this.layers.overlays[id] );
            }
        },

        //----------------------------------------------------------------------
        // Public methods
        //----------------------------------------------------------------------
        zoomToMaxExtent: function() {
            this.map.zoomToMaxExtent();
        },

        // $(...).mapLite('setCenterAndZoom', o):
        //   o should be a JS object with two properties:
        //      (Array) o.center = 2-element JS array of numbers: x,y coords of map center
        //      (Number) o.zoom = map zoom level
        setCenterAndZoom: function(o) {
            this.map.setCenter(o.center, o.zoom);
        },

        // $(...).mapLite('getCenterAndZoom'):
        //    returns an object of the format described above for setCenterAndZoom(), giving the map's
        //    current center and zoom level
        getCenterAndZoom: function() {
            var zoom = this.map.getZoom();
            var center = this.map.getCenter();
            return {
                center : [center.lon, center.lat],
                zoom   : zoom
            };
        },

        redrawLayer: function(layerId) {
            var layer = this.map.getLayer( layerId );
            if (!layer || layer === null) { return null; }
            //NOTE: not sure why, but layer.refresh() doesn't seem to do the trick here
            //layer.refresh({force:true});
            //NOTE: layer.redraw() does, though!
            layer.redraw();
        },

        setBaseLayer: function( layerId ) {
            var layer = this.map.getLayer( layerId );

            if ( layer && layer.isBaseLayer ) {
                this.map.setBaseLayer( layer );
                $( '#mlBaseList', '#mlLayerList').val( layerId );
            }
        },

        /*
         * $(...).mapLite('setLayerVisibility', 'layerId', false);
         */
        setLayerVisibility: function( layerId, visible ) {
            var toScale = false;

            if (visible) {
                this._addOverlay( layerId );

                // check if makers toggled to visible, the markers aren't being scaled when invisible
                // so scale if they go from invisible to visible
                toScale = this.layers.maplite.some( function( lyr ) {
                    return lyr.id === layerId;
                });
            }
            var layer = this.map.getLayer( layerId );
            if (!layer || layer === null) { return null; }

            layer.setVisibility( visible );

            if ( toScale ) {
                this._scaleMapliteMarkers();
            }

            $( '#chk_' + layerId ).prop( 'checked', visible);
        },

        setLayerOpacity: function( layerId, opacity ) {
            var layer = this.map.getLayer( layerId );
            if (!layer || layer === null) { return null; }

            layer.setOpacity( opacity );
        },

        getLayerOpacity: function( layerId ) {
            var layer = this.map.getLayer( layerId );
            if (!layer || layer === null) { return null; }

            return layer.opacity;
        },

        getPoint: function(layerId, id) {
            return $.extend( {}, this.pointHash[layerId][id] );
        },

        selectPoint: function( layerId, id ) {
            if ( this.selectedPoints[id] ) {
                return;
            }

            // deep copy so that labels don't appear in the core point hash
            var point = $.extend( {}, this.pointHash[layerId][id]);

            var size = 1;

            $.each(this.selectedPoints, function() {
                size++;
            });

            point.label = size;

            this.selectedPoints[id] = point;

            this._addSelectLayer();

            return $.extend( {}, point );
        },

        unselectPoint: function( id ) {
            delete this.selectedPoints[id];
            this._addSelectLayer();
        },

        setLabel: function( id, label ) {
            this.selectedPoints[id].label = label;
            this._addSelectLayer();
        }
    });

    // map configuration utils
    function MapConfig( config ) {
        var deferred = $.Deferred();

        // perform translations
        var translatedConfig = translateMapConfig( config );

        // check if any async calls need to be resolved before sending back
        if ( translatedConfig.async.requests.length > 0 ) {
            $.when.apply( $, translatedConfig.async.requests ).then( function() {
                // merge the async responses
                $.extend( translatedConfig.layers.bases, translatedConfig.async.layers.bases );
                $.extend( translatedConfig.layers.overlays, translatedConfig.async.layers.overlays );
                $.extend( translatedConfig.mapOptions, translatedConfig.async.mapOptions );
                deferred.resolve( translatedConfig.options, translatedConfig.mapOptions, translatedConfig.layers );
            }, function() {
                // one has a failure
                deferred.reject();
            });
        } else {
            deferred.resolve( translatedConfig.options, translatedConfig.mapOptions, translatedConfig.layers );
        }

        return deferred.promise();
    };

    function translateMapConfig( rawJson ) {
        var config = {
            options: {},
            mapOptions: {},
            layers: {
                bases: [],
                overlays: {},
                groups: []
            },
            async: {
                requests: [],
                options: {},
                mapOptions: {},
                layers: {
                    bases: [],
                    overlays: {}
                }
            }
        };

        // baselayer
        if ( rawJson.hasOwnProperty( 'bases' ) ) {
            rawJson.bases.forEach( function( layer ) {
                translateBaseLayer( layer, config );
            });
        }

        if ( rawJson.hasOwnProperty( 'overlays' ) ) {
            $.each( rawJson.overlays, function(){

                if ( !this.hasOwnProperty( 'type' ) || this.type === 'WMS' ) {
                    config.layers.overlays[this.id] = translateWms( this );
                } else if ( this.type === 'REST' ) {
                    config.layers.overlays[this.id] = translateRest( this );
                } else if ( this.type === 'TILE' ) {
                    config.layers.overlays[this.id] = translateTile( this );
                } else if ( this.type === 'ARCTILECACHE') {
                    config.layers.overlays[this.id] = translateArcGisTileCache( this, config );
                }

            });
        }

        if ( rawJson.hasOwnProperty( 'groups' ) ) {
            config.layers.groups = rawJson.groups;
        }

        return config;
    }

    function translateBaseLayer( base, config ) {
        switch( base.type ) {
            case 'arcgis':
                var infoUrl;

                if ( base.hasOwnProperty( 'infoCache' ) ) {
                    infoUrl = base.infoCache;
                } else {
                    infoUrl = base.url + '?f=json&pretty=true&' + randarg();
                }
                config.async.requests.push($.ajax({
                    url: infoUrl,
                    dataType: "json",
                    success: function ( info ) {
                        var bLyr = new OpenLayers.Layer.ArcGISCache( base.name, base.url, {
                            layerInfo: info
                        });

                        bLyr.id = base.id;
                        bLyr.isDefault = base.isDefault;

                        config.async.layers.bases.push( bLyr );
                        config.async.mapOptions.resolutions = bLyr.resolutions;
                    }
                }));

                break;
            default :
                var bLyr = new OpenLayers.Layer.XYZ(
                    'OSM (with buffer)',
                    [
                        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
                        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
                    ], {
                        transitionEffect: 'resize',
                        buffer: 2,
                        sphericalMercator: true });

                bLyr.id = base.id;

                config.layers.bases.push( bLyr );
                break;
        }
    }


    function translateWms( wms ) {
        var wmsProps = {
            layers: wms.layers,
            transparent: true
        };

        var layer = new OpenLayers.Layer.WMS( wms.name, wms.url, wmsProps);

        if ( wms.hasOwnProperty( 'projection' )) {
            layer.projection = wms.projection;
        };

        if ( wms.hasOwnProperty( 'sld' )) {
            layer.mergeNewParams( {SLD: wms.sld } );
        }

        if ( wms.hasOwnProperty( 'map' )) {
            layer.mergeNewParams( {MAP: wms.map } );
        }

        layer.id = wms.id;
        layer.isBaseLayer = false;

        return layer;
    }

    function translateRest( rest ) {
        var layers = 'show:';
        if ( typeof rest.layers === 'string') {
            layers += rest.layers;
        } else if ( rest.layers instanceof Array ) {
            layers += rest.layers.join( ',' );
        }

        var restProps = {
            layers: layers,
            transparent: true
        };

        var layer = new OpenLayers.Layer.ArcGIS93Rest( rest.name, rest.url, restProps);

        if ( rest.hasOwnProperty( 'projection' )) {
            layer.projection = rest.projection;
        }

        layer.id = rest.id;
        layer.isBaseLayer = false;

        return layer;
    }

    // It is absolutely ridiculous that we have to hardcode the following array,
    // but this seems to be what's necessary in order to specify a limited set
    // of server resolutions for a tile service.
    serverResolutions = [
        // resolution           // zoom level
        156543.03390625,        // 0
        78271.516953125,        // 1
        39135.7584765625,       // 2
        19567.87923828125,      // 3
        9783.939619140625,      // 4
        4891.9698095703125,     // 5
        2445.9849047851562,     // 6
        1222.9924523925781,     // 7
        611.4962261962891,      // 8
        305.74811309814453,     // 9
        152.87405654907226,     // 10
        76.43702827453613,      // 11
        38.218514137268066,     // 12
        19.109257068634033,     // 13
        9.554628534317017,      // 14
        4.777314267158508,      // 15
        2.388657133579254,      // 16
        1.194328566789627,      // 17
        0.5971642833948135,     // 18
        0.29858214169740677,    // 19
        0.14929107084870338,    // 20
        0.07464553542435169     // 21
    ];

    function translateTile( tile ) {
        var tileProps = {
            sphericalMercator: true
        };
        if (tile.hasOwnProperty("maxZoom")) {
            var maxZoom = tile["maxZoom"];
            tileProps.serverResolutions = serverResolutions.slice(0,maxZoom+1);
        }

        var layer = new OpenLayers.Layer.XYZ( tile.name, tile.url, tileProps);

        layer.id = tile.id;
        layer.isBaseLayer = false;

        return layer;
    }

    function translateArcGisTileCache( tile, config ) {
        var infoUrl = tile.url + '?f=json&pretty=true&'+randarg();

        config.async.requests.push($.ajax({
            url: infoUrl,
            dataType: "json",
            success: function ( info ) {
                var layer = new OpenLayers.Layer.ArcGISCache( tile.name, tile.url, {
                    layerInfo: info
                });

                layer.id = tile.id;
                layer.isBaseLayer = false;

                config.async.layers.overlays[layer.id] = layer;
            }
        }));
    }

    // global namespace exports

    $.nemac.MARKER_COLORS = MARKER_COLORS;
    $.nemac.MapliteDataSource = MapliteDataSource;

})(jQuery, document);

/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (root, factory) {
    if (typeof exports === "object" && exports) {
        factory(exports); // CommonJS
    } else {
        var mustache = {};
        factory(mustache);
        if (typeof define === "function" && define.amd) {
            define(mustache); // AMD
        } else {
            root.Mustache = mustache; // <script>
        }
    }
}(this, function (mustache) {

    // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
    // See https://github.com/janl/mustache.js/issues/189
    var RegExp_test = RegExp.prototype.test;
    function testRegExp(re, string) {
        return RegExp_test.call(re, string);
    }

    var nonSpaceRe = /\S/;
    function isWhitespace(string) {
        return !testRegExp(nonSpaceRe, string);
    }

    var Object_toString = Object.prototype.toString;
    var isArray = Array.isArray || function (object) {
            return Object_toString.call(object) === '[object Array]';
        };

    function isFunction(object) {
        return typeof object === 'function';
    }

    function escapeRegExp(string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function escapeTags(tags) {
        if (!isArray(tags) || tags.length !== 2) {
            throw new Error('Invalid tags: ' + tags);
        }

        return [
            new RegExp(escapeRegExp(tags[0]) + "\\s*"),
            new RegExp("\\s*" + escapeRegExp(tags[1]))
        ];
    }

    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var equalsRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    /**
     * Breaks up the given `template` string into a tree of tokens. If the `tags`
     * argument is given here it must be an array with two string values: the
     * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
     * course, the default is to use mustaches (i.e. mustache.tags).
     *
     * A token is an array with at least 4 elements. The first element is the
     * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
     * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
     * all text that appears outside a symbol this element is "text".
     *
     * The second element of a token is its "value". For mustache tags this is
     * whatever else was inside the tag besides the opening symbol. For text tokens
     * this is the text itself.
     *
     * The third and fourth elements of the token are the start and end indices,
     * respectively, of the token in the original template.
     *
     * Tokens that are the root node of a subtree contain two more elements: 1) an
     * array of tokens in the subtree and 2) the index in the original template at
     * which the closing tag for that section begins.
     */
    function parseTemplate(template, tags) {
        tags = tags || mustache.tags;
        template = template || '';

        if (typeof tags === 'string') {
            tags = tags.split(spaceRe);
        }

        var tagRes = escapeTags(tags);
        var scanner = new Scanner(template);

        var sections = [];     // Stack to hold section tokens
        var tokens = [];       // Buffer to hold the tokens
        var spaces = [];       // Indices of whitespace tokens on the current line
        var hasTag = false;    // Is there a {{tag}} on the current line?
        var nonSpace = false;  // Is there a non-space char on the current line?

        // Strips all whitespace tokens array for the current line
        // if there was a {{#tag}} on it and otherwise only space.
        function stripSpace() {
            if (hasTag && !nonSpace) {
                while (spaces.length) {
                    delete tokens[spaces.pop()];
                }
            } else {
                spaces = [];
            }

            hasTag = false;
            nonSpace = false;
        }

        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;

            // Match any text between tags.
            value = scanner.scanUntil(tagRes[0]);
            if (value) {
                for (var i = 0, len = value.length; i < len; ++i) {
                    chr = value.charAt(i);

                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }

                    tokens.push(['text', chr, start, start + 1]);
                    start += 1;

                    // Check for whitespace on the current line.
                    if (chr === '\n') {
                        stripSpace();
                    }
                }
            }

            // Match the opening tag.
            if (!scanner.scan(tagRes[0])) break;
            hasTag = true;

            // Get the tag type.
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);

            // Get the tag value.
            if (type === '=') {
                value = scanner.scanUntil(equalsRe);
                scanner.scan(equalsRe);
                scanner.scanUntil(tagRes[1]);
            } else if (type === '{') {
                value = scanner.scanUntil(new RegExp('\\s*' + escapeRegExp('}' + tags[1])));
                scanner.scan(curlyRe);
                scanner.scanUntil(tagRes[1]);
                type = '&';
            } else {
                value = scanner.scanUntil(tagRes[1]);
            }

            // Match the closing tag.
            if (!scanner.scan(tagRes[1])) {
                throw new Error('Unclosed tag at ' + scanner.pos);
            }

            token = [ type, value, start, scanner.pos ];
            tokens.push(token);

            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                // Check section nesting.
                openSection = sections.pop();

                if (!openSection) {
                    throw new Error('Unopened section "' + value + '" at ' + start);
                }
                if (openSection[1] !== value) {
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
                }
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                // Set the tags for the next time around.
                tagRes = escapeTags(tags = value.split(spaceRe));
            }
        }

        // Make sure there are no open sections when we're done.
        openSection = sections.pop();
        if (openSection) {
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
        }

        return nestTokens(squashTokens(tokens));
    }

    /**
     * Combines the values of consecutive text tokens in the given `tokens` array
     * to a single token.
     */
    function squashTokens(tokens) {
        var squashedTokens = [];

        var token, lastToken;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }

        return squashedTokens;
    }

    /**
     * Forms the given array of `tokens` into a nested tree structure where
     * tokens that represent a section have two additional items: 1) an array of
     * all tokens that appear in that section and 2) the index in the original
     * template that represents the end of that section.
     */
    function nestTokens(tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];

        var token, section;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }

        return nestedTokens;
    }

    /**
     * A simple string scanner that is used by the template parser to find
     * tokens in template strings.
     */
    function Scanner(string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }

    /**
     * Returns `true` if the tail is empty (end of string).
     */
    Scanner.prototype.eos = function () {
        return this.tail === "";
    };

    /**
     * Tries to match the given regular expression at the current position.
     * Returns the matched text if it can match, the empty string otherwise.
     */
    Scanner.prototype.scan = function (re) {
        var match = this.tail.match(re);

        if (match && match.index === 0) {
            var string = match[0];
            this.tail = this.tail.substring(string.length);
            this.pos += string.length;
            return string;
        }

        return "";
    };

    /**
     * Skips all text until the given regular expression can be matched. Returns
     * the skipped string, which is the entire tail if no match can be made.
     */
    Scanner.prototype.scanUntil = function (re) {
        var index = this.tail.search(re), match;

        switch (index) {
            case -1:
                match = this.tail;
                this.tail = "";
                break;
            case 0:
                match = "";
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }

        this.pos += match.length;

        return match;
    };

    /**
     * Represents a rendering context by wrapping a view object and
     * maintaining a reference to the parent context.
     */
    function Context(view, parentContext) {
        this.view = view == null ? {} : view;
        this.cache = { '.': this.view };
        this.parent = parentContext;
    }

    /**
     * Creates a new context using the given view with this context
     * as the parent.
     */
    Context.prototype.push = function (view) {
        return new Context(view, this);
    };

    /**
     * Returns the value of the given name in this context, traversing
     * up the context hierarchy if the value is absent in this context's view.
     */
    Context.prototype.lookup = function (name) {
        var value;
        if (name in this.cache) {
            value = this.cache[name];
        } else {
            var context = this;

            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;

                    var names = name.split('.'), i = 0;
                    while (value != null && i < names.length) {
                        value = value[names[i++]];
                    }
                } else {
                    value = context.view[name];
                }

                if (value != null) break;

                context = context.parent;
            }

            this.cache[name] = value;
        }

        if (isFunction(value)) {
            value = value.call(this.view);
        }

        return value;
    };

    /**
     * A Writer knows how to take a stream of tokens and render them to a
     * string, given a context. It also maintains a cache of templates to
     * avoid the need to parse the same template twice.
     */
    function Writer() {
        this.cache = {};
    }

    /**
     * Clears all cached templates in this writer.
     */
    Writer.prototype.clearCache = function () {
        this.cache = {};
    };

    /**
     * Parses and caches the given `template` and returns the array of tokens
     * that is generated from the parse.
     */
    Writer.prototype.parse = function (template, tags) {
        var cache = this.cache;
        var tokens = cache[template];

        if (tokens == null) {
            tokens = cache[template] = parseTemplate(template, tags);
        }

        return tokens;
    };

    /**
     * High-level method that is used to render the given `template` with
     * the given `view`.
     *
     * The optional `partials` argument may be an object that contains the
     * names and templates of partials that are used in the template. It may
     * also be a function that is used to load partial templates on the fly
     * that takes a single argument: the name of the partial.
     */
    Writer.prototype.render = function (template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };

    /**
     * Low-level method that renders the given array of `tokens` using
     * the given `context` and `partials`.
     *
     * Note: The `originalTemplate` is only ever used to extract the portion
     * of the original template that was contained in a higher-order section.
     * If the template doesn't use higher-order sections, this argument may
     * be omitted.
     */
    Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
        var buffer = '';

        // This function is used to render an arbitrary template
        // in the current context by higher-order sections.
        var self = this;
        function subRender(template) {
            return self.render(template, context, partials);
        }

        var token, value;
        for (var i = 0, len = tokens.length; i < len; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                    value = context.lookup(token[1]);
                    if (!value) continue;

                    if (isArray(value)) {
                        for (var j = 0, jlen = value.length; j < jlen; ++j) {
                            buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
                        }
                    } else if (typeof value === 'object' || typeof value === 'string') {
                        buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
                    } else if (isFunction(value)) {
                        if (typeof originalTemplate !== 'string') {
                            throw new Error('Cannot use higher-order sections without the original template');
                        }

                        // Extract the portion of the original template that the section contains.
                        value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

                        if (value != null) buffer += value;
                    } else {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '^':
                    value = context.lookup(token[1]);

                    // Use JavaScript's definition of falsy. Include empty arrays.
                    // See https://github.com/janl/mustache.js/issues/186
                    if (!value || (isArray(value) && value.length === 0)) {
                        buffer += this.renderTokens(token[4], context, partials, originalTemplate);
                    }

                    break;
                case '>':
                    if (!partials) continue;
                    value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
                    if (value != null) buffer += this.renderTokens(this.parse(value), context, partials, value);
                    break;
                case '&':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += value;
                    break;
                case 'name':
                    value = context.lookup(token[1]);
                    if (value != null) buffer += mustache.escape(value);
                    break;
                case 'text':
                    buffer += token[1];
                    break;
            }
        }

        return buffer;
    };

    mustache.name = "mustache.js";
    mustache.version = "0.8.1";
    mustache.tags = [ "{{", "}}" ];

    // All high-level mustache.* functions use this writer.
    var defaultWriter = new Writer();

    /**
     * Clears all cached templates in the default writer.
     */
    mustache.clearCache = function () {
        return defaultWriter.clearCache();
    };

    /**
     * Parses and caches the given template in the default writer and returns the
     * array of tokens it contains. Doing this ahead of time avoids the need to
     * parse templates on the fly as they are rendered.
     */
    mustache.parse = function (template, tags) {
        return defaultWriter.parse(template, tags);
    };

    /**
     * Renders the `template` with the given `view` and `partials` using the
     * default writer.
     */
    mustache.render = function (template, view, partials) {
        return defaultWriter.render(template, view, partials);
    };

    // This is here for backwards compatibility with 0.4.x.
    mustache.to_html = function (template, view, partials, send) {
        var result = mustache.render(template, view, partials);

        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };

    // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244
    mustache.escape = escapeHtml;

    // Export these mainly for testing, but also for advanced usage.
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;

}));

(function($){
    //
    // Statics
    //
    var POSITIONS = {
        RIGHT: 'right',
        LEFT: 'left'
    };

    var STATES = {
        OPENED: 'opened',
        CLOSED: 'closed'
    };

    //
    // Widget
    //
    $.widget( 'nemac.drawerPanel', {
        //
        // Defaults
        //
        options: {
            position: POSITIONS.RIGHT,
            state: STATES.OPENED,
            resizable: false,
            width: 300,
            minWidth: 200,
            maxWidth: 600,
            color: '#eef',
            templateLocation: '',
            title: 'Title',
            openerImage: '',
            openerHeight: 110,
            animationDuration: 400,
            onResizeStop: null,
            onOpen: null,
            onClose: null
        },

        //
        // Private vars
        //
        placement: {},
        state: STATES.OPENED,
        template: '',

        //
        // Private methods
        //
        _create: function() {
            // init, validate local vars
            this.options.position = this._validateInput( this.options.position, POSITIONS, POSITIONS.RIGHT);
            this.options.state = this._validateInput( this.options.state, STATES, STATES.OPENED);
            this.options.templateLocation = this._validateTemplateLocation( this.options.templateLocation );
            this.placement = {
                closed: {},
                closedTransition: {},
                openedTransition: {}
            };
            this.placement.closed[this.options.position] = '-' + this.options.width + 'px';
            this.placement.closedTransition[this.options.position] = '-=' + this.options.width + 'px';
            this.placement.openedTransition[this.options.position] = '+=' + this.options.width + 'px';

            // async call that handles loading the template, and then performs deploy on success
            var instance = this;
            $.get( this.options.templateLocation, function( template ) {
                instance.template = template;
                instance._deployDOM( template, instance.element.html(), instance.options.state );
            });
        },

        _deployDOM: function( template, contents, state ) {
            this.element.empty();
            this.element.html(
                Mustache.render(
                    template, {
                        position: this.options.position,
                        title: this.options.title,
                        contents: contents
                    }
                )
            );

            var instance = this;
            // bind closer/opener
            $( 'div.drawer-closer', this.element )
                .on( "click", function() {
                    instance.close();
                });
            $( 'div.drawer-opener', this.element )
                .on( "click", function() {
                    instance.open();
                });

            // init styling
            if (typeof this.options.openerImage === 'string' && this.options.openerImage.length > 0) {
                $( 'div.drawer-opener-image', this.element )
                    .css( 'background-image', 'url(\'' + this.options.openerImage + '\')')
                    .css( 'height', this.options.openerHeight );
            }

            $( 'div.drawer-opener', this.element )
                .css( "background-color", this.options.color )
                .css( 'height', this.options.openerHeight )
                .hide(); // initially hidden
            $( 'div.drawer-box', this.element )
                .css( "background-color", this.options.color );
            $( 'div.drawer', this.element )
                .width( this.options.width );


            // resize handler
            if ( this.options.resizable === true ) {
                var handle;
                if ( this.options.position === POSITIONS.RIGHT ) {
                    handle = 'w';
                } else {
                    handle = 'e';
                }

                $( 'div.drawer', this.element ).resizable({
                    handles: handle,
                    maxWidth: this.options.maxWidth,
                    minWidth: this.options.minWidth
                });

                if (this.options.onResizeStop !== null && typeof this.options.onResizeStop === 'function') {
                    $( 'div.drawer', this.element ).on( 'resizestop', this.options.onResizeStop);
                }
            }

            // set initial state, if differs from desired state
            if ( this.state !== state ) {
                this.togglePanelState( true );
            }
        },

        // validators
        _validateInput: function( input, constants, defaultValue ) {
            input = input.toUpperCase();
            if ( constants.hasOwnProperty( input ) ) {
                return constants[input];
            } else {
                return defaultValue;
            }
        },

        _validateTemplateLocation: function( templateLocation ) {
            if ( typeof templateLocation === 'string' && templateLocation.length > 0 ) {
                return templateLocation;
            } else {
                // attempt to find the template relative to this file
                return $( 'script[src*=drawerpanel]' )
                    .attr( 'src' )
                    .replace( 'jquery.drawerpanel.js', 'panel.tpl.html' );
            }
        },

        //
        // Public methods
        //

        getState: function() {
            return this.state;
        },

        close: function( doImmediately ) {
            if ( this.state === STATES.OPENED ) {
                if ( doImmediately ) {
                    $( 'div.drawer-box', this.element ).css( this.placement.closed ).css({
                        display: 'none'
                    });
                    $( '.drawer-opener', this.element ).show();
                } else {
                    var reference = this;
                    $( 'div.drawer-box', this.element )
                        .animate( this.placement.closedTransition, this.options.animationDuration, function() {
                            $( 'div.drawer-box', reference.element ).css({
                                display: 'none'
                            });
                            $( '.drawer-opener', reference.element ).show();
                        });
                }
                this.state = STATES.CLOSED;
                if (this.options.onClose !== null) {
                    this.options.onClose();
                }
            }
        },

        open: function( doImmediately ) {
            if ( this.state === STATES.CLOSED ) {
                if ( doImmediately ) {
                    $( 'div.drawer-box', this.element )
                        .css( this.placement.opened )
                        .css({ display: 'block' });
                } else {
                    $( 'div.drawer-box', this.element ).css({ display: 'block' });
                    $( 'div.drawer-box', this.element )
                        .animate( this.placement.openedTransition );
                }
                $( '.drawer-opener', this.element ).hide();
                this.state = STATES.OPENED;
                if (this.options.onOpen !== null) {
                    this.options.onOpen();
                }
            }
        },

        togglePanelState: function( doImmediately ) {
            if ( this.state === STATES.OPENED ) {
                this.close( doImmediately );
            } else {
                this.open( doImmediately );
            }
        },

        setContents: function( contents ) {
            $( 'div.drawer-contents', this.element ).html( contents );
        },

        clearContents: function() {
            $( 'div.drawer-contents', this.element ).empty();
        },

        getContentsReference: function() {
            return $( 'div.drawer-contents', this.element );
        },

        appendContents: function( newContents ) {
            this.getContentsReference().append( newContents );
        }

    });
})(jQuery);

(function($) {

    //
    // Construct the html for the permalink popup div, and return it as a string
    //
    function permalink_html(url) {
        return ''
            + '<div class="permalink popup">'
            +   '<input type="text" class="url" value="' + url + '" readonly></input>'
            +   '<div class="closebutton"></div>'
            + '</div>'
            ;
    }

    // Note: this function causes the text of the given element to be selected.
    // Except, it doesn't seem to work for an <input> element.  For an <input>
    // element, just call the .select() method on the element itself; see below.
    // I'm including it here, even though it isn't currently used, just in case
    // the type of the .url element above is changed to something other than
    // <input>.
    function selectText(element) {
        var doc = document
            , range, selection
            ;
        if (doc.body.createTextRange) { //ms
            range = doc.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        } else if (window.getSelection) { //all others
            selection = window.getSelection();
            range = doc.createRange();
            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

    var methods = {
        init : function (options) {
            if (options === undefined) { options = {}; }

            var defaults = {
                'url'  : 'http://www.example.com',
                'icon' : true
            };
            var settings = $.extend({}, defaults, options);
            return this.each(function () {
                var $this = $(this);
                // get or set this instance's data object
                var data = $this.data('permalink');
                if ( ! data ) {
                    data = {
                        'settings' : settings
                    };
                    $this.data('permalink', data);
                }

                $this.addClass('permalink link');

                if ($this.data('permalink').settings.icon) {
                    $this.html( '<div class="linkicon"></div>' + $this.html() );
                }

                $this.bind('click.permalink', function(e) {

                    if ($this.data('permalink').popup_open) {
                        return false;
                    }

                    var $popup = $(permalink_html($this.data('permalink').settings.url)).insertAfter($this);

                    $this.data('permalink').popup_open = true;
                    $this.data('permalink').$popup = $popup;

                    $popup.bind('click.permalink', function() {
                        // return false means consume this event, so that the click.permalink handler
                        // on the containing (body) element doesn't fire
                        return false;
                    });

                    var dismiss = function() {
                        $popup.remove();
                        $this.data('permalink').popup_open = false;
                        delete $this.data('permalink').$popup;
                        delete $this.data('permalink').dismiss_popup;
                        $('body').unbind('click.permalink');
                    };
                    $this.data('permalink').dismiss_popup = dismiss;

                    $('body').bind('click.permalink', dismiss);
                    $('.permalink.popup .closebutton').bind('click.permalink', dismiss);

                    $('.permalink.popup input.url')[0].select();

                    return false;
                });

                return this;
            });
        },

        url : function(url) {
            if (url !== undefined) {
                this.each(function () {
                    $(this).data('permalink').settings.url = url;
                    if ('$popup' in $(this).data('permalink')) {
                        $(this).data('permalink').$popup.find('input.url').attr('value', url);
                        $(this).data('permalink').$popup.find('input.url')[0].select();
                    }
                });
                return this;
            } else {
                return $(this).data('permalink').settings.url;
            }
        },

        dismiss : function() {
            this.each(function () {
                if ($(this).data('permalink').popup_open) {
                    $(this).data('permalink').dismiss_popup();
                }
            });
        }


    };

    $.fn.permalink = function (method) {
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on d3_series_transition');
            return null;
        }
    };


}(jQuery));

/*! Multigraph - v4.3.0
 * http://multigraph.github.io/
 * Copyright (c) 2014 University of North Carolina at Asheville; Licensed MIT
 *
 * Multigraph includes the following projects
 * jQuery v1.8.2 | jquery.org/license (jquery.com)
 * jQuery.mousewheel.js v3.0.6 | (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * sprintf() for JavaScript v0.7-beta1 | (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>)] (http://www.diveintojavascript.com/projects/javascript-sprintf)
 */
Array.prototype.indexOf||(Array.prototype.indexOf=function(a){"use strict";if(null==this)throw new TypeError;var b=Object(this),c=b.length>>>0;if(0===c)return-1;var d=0;if(arguments.length>0&&(d=Number(arguments[1]),d!=d?d=0:0!=d&&1/0!=d&&d!=-1/0&&(d=(d>0||-1)*Math.floor(Math.abs(d)))),d>=c)return-1;for(var e=d>=0?d:Math.max(c-Math.abs(d),0);c>e;e++)if(e in b&&b[e]===a)return e;return-1}),function(a){"use strict";var b=function(a,c,d){var e,f,g,h=/^([a-zA-Z]+)(\.[a-zA-Z]*)*$/;if(null===a.match(h)||"window"===a)throw new Error("namespace: "+a+" is a malformed namespace string");if(void 0!==c&&void 0===d)if("function"==typeof c)d=c,c=void 0;else{if("object"==typeof c)throw new Error("namespace: if second argument exists, final function argument must exist");if("object"!=typeof c)throw new Error("namespace: second argument must be an object of aliased local namespaces")}else if("object"!=typeof c&&"function"==typeof d)throw new Error("namespace: second argument must be an object of aliased local namespaces");if(e=a.split("."),f="window"===e[0]?window:void 0===window[e[0]]?window[e[0]]={}:window[e[0]],void 0!==d&&"function"!=typeof d)throw new Error("namespace: last parameter must be a function that accepts a namespace parameter");for(g=1;g<e.length;g+=1)void 0===f[e[g]]&&(f[e[g]]={}),f=f[e[g]];if(void 0===c&&d)d(f);else if(d){for(g in c)c.hasOwnProperty(g)&&(c[g]=b(c[g]));d.call(c,f)}return f};return b(a,function(a){a.namespace=b})}("window.jermaine.util"),window.jermaine.util.namespace("window.jermaine",function(a){"use strict";var b,c={};b=function(a){var b=function(b){var c,d,e={};if(c=a.call(e,b),!c)throw d=e.message||"validator failed with parameter "+b,new Error(d);return c};return b},b.addValidator=function(a,d){if(void 0===a||"string"!=typeof a)throw new Error("addValidator requires a name to be specified as the first parameter");if(void 0===d||"function"!=typeof d)throw new Error("addValidator requires a function as the second parameter");if(void 0!==c[a])throw new Error("Validator '"+a+"' already defined");c[a]=function(a){return new b(function(b){var c={actual:b,param:b},e=d.call(c,a);return this.message=c.message,e})}},b.getValidator=function(a){var b;if(void 0===a)throw new Error("Validator: getValidator method requires a string parameter");if("string"!=typeof a)throw new Error("Validator: parameter to getValidator method must be a string");if(b=c[a],void 0===b)throw new Error("Validator: '"+a+"' does not exist");return b},b.validators=function(){var a,b=[];for(a in c)c.hasOwnProperty(a)&&b.push(a);return b},b.addValidator("isGreaterThan",function(a){return this.message=this.param+" should be greater than "+a,this.param>a}),b.addValidator("isLessThan",function(a){return this.message=this.param+" should be less than "+a,this.param<a}),b.addValidator("isA",function(a){var b=["string","number","boolean","function","object"];if("string"==typeof a&&b.indexOf(a)>-1)return this.message=this.param+" should be a "+a,typeof this.param===a;if("integer"===a)return this.message=void 0!==this.param.toString?this.param.toString()+" should be an integer":"parameter should be an integer","number"==typeof this.param&&parseInt(this.param,10)===this.param;throw new Error("string"==typeof a?"Validator: isA accepts a string which is one of "+b:"Validator: isA only accepts a string for a primitive types for the time being")}),c.isAn=c.isA,b.addValidator("isOneOf",function(a){return this.message=this.param+" should be one of the set: "+a,a.indexOf(this.param)>-1}),a.Validator=b}),window.jermaine.util.namespace("window.jermaine",function(a){"use strict";var b=function(a){var c,d,e,f,g,h=[],i=this,j="invalid setter call for "+a,k=!1,l=window.jermaine.AttrList,m=window.jermaine.Validator;if(g=function(a){for(e=0;e<h.length;++e)h[e](a);return!0},d=function(){return"function"==typeof c?c():c},void 0===a||"string"!=typeof a)throw new Error("Attr: constructor requires a name parameter which must be a string");for(this.vlds=function(a){if("function"==typeof a)return h.push(new m(a)),this;throw new Error("Attr: validator must be a function")},this.dflt=function(a){return c=a,this},this.isImmutable=function(){return k=!0,this},this.isMutable=function(){return k=!1,this},this.clone=function(){var d,e=this instanceof l?new l(a):new b(a);for(d=0;d<h.length;++d)e.vlds(h[d]);return e.dflt(c),k&&e.isImmutable(),e},this.and=this,this.which=this,this.eachOfWhich=this,this.validator=function(){return g},this.addTo=function(b){var c,e;if(!b||"object"!=typeof b)throw new Error("Attr: addAttr method requires an object parameter");if(e=d(),void 0!==e&&g(e))c=e;else if(void 0!==e&&!g(e))throw new Error("Attr: Default value of "+e+" does not pass validation for "+a);b[a]=function(d){if(void 0!==d){if(k&&void 0!==c)throw new Error("cannot set the immutable property "+a+" after it has been set");if(!g(d))throw new Error(j);return c=d,b}return c}},f=function(a){i[a]=function(b){return h.push(m.getValidator(a)(b)),i}},e=0;e<m.validators().length;++e)f(m.validators()[e])};a.Attr=b}),window.jermaine.util.namespace("window.jermaine",function(a){"use strict";function b(b){var c=this;a.Attr.call(this,b);var d=function(a,b){return function(){return a[b].apply(a,arguments)}};this.validateWith=this.vlds,this.dflt=function(){},this.isImmutable=function(){},this.isMutable=function(){},this.addTo=function(a){var e=[],f={};if(!a||"object"!=typeof a)throw new Error("AttrList: addTo method requires an object parameter");f.pop=d(e,"pop"),f.add=function(a){if(c.validator()(a))return e.push(a),this;throw new Error(c.errorMessage())},f.replace=function(a,b){if("number"!=typeof a||parseInt(a,10)!==a)throw new Error("AttrList: replace method requires index parameter to be an integer");if(0>a||a>=this.size())throw new Error("AttrList: replace method index parameter out of bounds");if(!c.validator()(b))throw new Error(c.errorMessage());return e[a]=b,this},f.at=function(a){if(0>a||a>=this.size())throw new Error("AttrList: Index out of bounds");return e[a]},f.get=f.at,f.size=function(){return e.length},a[b]=function(){return f}}}b.prototype=new window.jermaine.Attr(name),a.AttrList=b}),window.jermaine.util.namespace("window.jermaine",function(a){"use strict";var b=function(a,b){if(!a||"string"!=typeof a)throw new Error("Method: constructor requires a name parameter which must be a string");if(!b||"function"!=typeof b)throw new Error("Method: second parameter must be a function");this.addTo=function(c){if(!c||"object"!=typeof c)throw new Error("Method: addTo method requires an object parameter");c[a]=b}};a.Method=b}),window.jermaine.util.namespace("window.jermaine",function(a){"use strict";function b(c){var d,e,f,g,h,i={},j={},k=!0,l=[],m=[],n=[],o=a.Method,p=a.Attr,q=a.AttrList,r=function(){},s=function(){},t=function(){return k&&g(),s.apply(this,arguments)};if(arguments.length>1&&(c=arguments[arguments.length-1]),c&&"function"==typeof c)return t=new b,c.call(t),t;if(c)throw new Error("Model: specification parameter must be a function");var u=function(a,b){var c,d="Attr"===a?p:q,e="Attr"===a?"hasA":"hasMany";if(k=!0,"string"==typeof b)return c=new d(b),j[b]=c,c;throw new Error("Model: "+e+" parameter must be a string")};return e=function(a,b){var c;if("string"!=typeof b)throw new Error("Model: expected string argument to "+a+" method, but recieved "+b);if(c="attribute"===a?j[b]:i[b],void 0===c)throw new Error("Model: "+a+" "+b+" does not exist!");return c},f=function(a){var b,c=[],d="attributes"===a?j:i;for(b in d)d.hasOwnProperty(b)&&c.push(b);return c},g=function(){var a,b;return t.validate(),s=function(){var c,e,f;if(!(this instanceof t))throw new Error("Model: instances must be created using the new operator");if(f=function(a,b){var c,d="attributes"===b?j:i;for(c in d)d.hasOwnProperty(c)&&(d===j&&h&&d[c].isImmutable(),d[c].addTo(a))},f(this,"attributes"),f(this,"methods"),this.toString=d,arguments.length>0){if(arguments.length<l.length){for(b="Constructor requires ",c=0;c<l.length;++c)b+=l[c],b+=c===l.length-1?"":", ";throw b+=" to be specified",new Error(b)}if(arguments.length>l.length+m.length)throw new Error("Too many arguments to constructor. Expected "+l.length+" required arguments and "+m.length+" optional arguments");for(c=0;c<arguments.length;++c)if(e=c<l.length?l[c]:m[c-l.length],t.attribute(e)instanceof q){if("[object Array]"!==Object.prototype.toString.call(arguments[c]))throw new Error("Model: Constructor requires 'names' attribute to be set with an Array");for(a=0;a<arguments[c].length;++a)this[e]().add(arguments[c][a])}else this[e](arguments[c])}r.call(this)}},t.hasA=function(a){return u("Attr",a)},t.hasA=t.hasA,t.hasSome=t.hasA,t.hasMany=function(a){return u("AttrList",a)},t.isA=function(a){var c,d,e,f;if(k=!0,f=function(a){var c,d=new b;for(c in d)if(d.hasOwnProperty(c)&&typeof a[c]!=typeof d[c])return!1;return!0},"function"!=typeof a||!f(a))throw new Error("Model: parameter sent to isA function must be a Model");if(0!==n.length)throw new Error("Model: Model only supports single inheritance at this time");for(n.push(a),d=n[0].attributes(),c=0;c<d.length;++c)void 0===j[d[c]]&&(j[d[c]]=n[0].attribute(d[c]).clone(),j[d[c]].isMutable());for(e=n[0].methods(),c=0;c<e.length;++c)void 0===i[e[c]]&&(i[e[c]]=n[0].method(e[c]));for(c=0;c<n.length;c++)t.prototype=new n[c]},t.isAn=t.isA,t.parent=function(){return n[0].apply(this,arguments)},t.attribute=function(a){return e("attribute",a)},t.attributes=function(){return f("attributes")},t.method=function(a){return e("method",a)},t.methods=function(){return f("methods")},t.isBuiltWith=function(){var a,b=!1;for(k=!0,l=[],m=[],a=0;a<arguments.length;++a)if("string"==typeof arguments[a]&&"%"!==arguments[a].charAt(0)){if(b)throw new Error("Model: isBuiltWith requires parameters preceded with a % to be the final parameters before the optional function");l.push(arguments[a])}else if("string"==typeof arguments[a]&&"%"===arguments[a].charAt(0))b=!0,m.push(arguments[a].slice(1));else{if("function"!=typeof arguments[a]||a!==arguments.length-1)throw new Error("Model: isBuiltWith parameters must be strings except for a function as the optional final parameter");r=arguments[a]}},t.isImmutable=function(){h=!0},t.looksLike=function(a){k=!0,d=a},t.rspd=function(a,b){var c=new o(a,b);k=!0,i[a]=c},t.validate=function(){var a,b=this.attributes(),c=this.methods();for(a=0;a<l.length;++a)try{this.attribute(l[a])}catch(d){throw new Error(l[a]+", specified in the isBuiltWith method, is not an attribute")}for(a=0;a<m.length;++a)try{this.attribute(m[a])}catch(d){throw new Error(m[a]+", specified in the isBuiltWith method, is not an attribute")}for(a=0;a<b.length;a++)if(c.indexOf(b[a])>-1)throw new Error("Model: invalid model specification to "+b[a]+" being both an attribute and method");if(h)for(a=0;a<b.length;a++)if(l.indexOf(b[a])<0)throw new Error("immutable objects must have all attributes required in a call to isBuiltWith");k=!1},t}a.Model=b}),function(a,b){function c(a){var b=ob[a]={};return $.each(a.split(bb),function(a,c){b[c]=!0}),b}function d(a,c,d){if(d===b&&1===a.nodeType){var e="data-"+c.replace(qb,"-$1").toLowerCase();if(d=a.getAttribute(e),"string"==typeof d){try{d="true"===d?!0:"false"===d?!1:"null"===d?null:+d+""===d?+d:pb.test(d)?$.parseJSON(d):d}catch(f){}$.data(a,c,d)}else d=b}return d}function e(a){var b;for(b in a)if(("data"!==b||!$.isEmptyObject(a[b]))&&"toJSON"!==b)return!1;return!0}function f(){return!1}function g(){return!0}function h(a){return!a||!a.parentNode||11===a.parentNode.nodeType}function i(a,b){do a=a[b];while(a&&1!==a.nodeType);return a}function j(a,b,c){if(b=b||0,$.isFunction(b))return $.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return $.grep(a,function(a){return a===b===c});if("string"==typeof b){var d=$.grep(a,function(a){return 1===a.nodeType});if(Kb.test(b))return $.filter(b,d,!c);b=$.filter(b,d)}return $.grep(a,function(a){return $.inArray(a,b)>=0===c})}function k(a){var b=Nb.split("|"),c=a.createDocumentFragment();if(c.createElement)for(;b.length;)c.createElement(b.pop());return c}function l(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function m(a,b){if(1===b.nodeType&&$.hasData(a)){var c,d,e,f=$._data(a),g=$._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;e>d;d++)$.event.add(b,c,h[c][d])}g.data&&(g.data=$.extend({},g.data))}}function n(a,b){var c;1===b.nodeType&&(b.clearAttributes&&b.clearAttributes(),b.mergeAttributes&&b.mergeAttributes(a),c=b.nodeName.toLowerCase(),"object"===c?(b.parentNode&&(b.outerHTML=a.outerHTML),$.support.html5Clone&&a.innerHTML&&!$.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):"input"===c&&Xb.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):"option"===c?b.selected=a.defaultSelected:"input"===c||"textarea"===c?b.defaultValue=a.defaultValue:"script"===c&&b.text!==a.text&&(b.text=a.text),b.removeAttribute($.expando))}function o(a){return"undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName("*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll("*"):[]}function p(a){Xb.test(a.type)&&(a.defaultChecked=a.checked)}function q(a,b){if(b in a)return b;for(var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=rc.length;e--;)if(b=rc[e]+c,b in a)return b;return d}function r(a,b){return a=b||a,"none"===$.css(a,"display")||!$.contains(a.ownerDocument,a)}function s(a,b){for(var c,d,e=[],f=0,g=a.length;g>f;f++)c=a[f],c.style&&(e[f]=$._data(c,"olddisplay"),b?(!e[f]&&"none"===c.style.display&&(c.style.display=""),""===c.style.display&&r(c)&&(e[f]=$._data(c,"olddisplay",w(c.nodeName)))):(d=cc(c,"display"),!e[f]&&"none"!==d&&$._data(c,"olddisplay",d)));for(f=0;g>f;f++)c=a[f],c.style&&(b&&"none"!==c.style.display&&""!==c.style.display||(c.style.display=b?e[f]||"":"none"));return a}function t(a,b,c){var d=kc.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function u(a,b,c,d){for(var e=c===(d?"border":"content")?4:"width"===b?1:0,f=0;4>e;e+=2)"margin"===c&&(f+=$.css(a,c+qc[e],!0)),d?("content"===c&&(f-=parseFloat(cc(a,"padding"+qc[e]))||0),"margin"!==c&&(f-=parseFloat(cc(a,"border"+qc[e]+"Width"))||0)):(f+=parseFloat(cc(a,"padding"+qc[e]))||0,"padding"!==c&&(f+=parseFloat(cc(a,"border"+qc[e]+"Width"))||0));return f}function v(a,b,c){var d="width"===b?a.offsetWidth:a.offsetHeight,e=!0,f=$.support.boxSizing&&"border-box"===$.css(a,"boxSizing");if(0>=d||null==d){if(d=cc(a,b),(0>d||null==d)&&(d=a.style[b]),lc.test(d))return d;e=f&&($.support.boxSizingReliable||d===a.style[b]),d=parseFloat(d)||0}return d+u(a,b,c||(f?"border":"content"),e)+"px"}function w(a){if(nc[a])return nc[a];var b=$("<"+a+">").appendTo(P.body),c=b.css("display");return b.remove(),("none"===c||""===c)&&(dc=P.body.appendChild(dc||$.extend(P.createElement("iframe"),{frameBorder:0,width:0,height:0})),ec&&dc.createElement||(ec=(dc.contentWindow||dc.contentDocument).document,ec.write("<!doctype html><html><body>"),ec.close()),b=ec.body.appendChild(ec.createElement(a)),c=cc(b,"display"),P.body.removeChild(dc)),nc[a]=c,c}function x(a,b,c,d){var e;if($.isArray(b))$.each(b,function(b,e){c||uc.test(a)?d(a,e):x(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==$.type(b))d(a,b);else for(e in b)x(a+"["+e+"]",b[e],c,d)}function y(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e,f,g=b.toLowerCase().split(bb),h=0,i=g.length;if($.isFunction(c))for(;i>h;h++)d=g[h],f=/^\+/.test(d),f&&(d=d.substr(1)||"*"),e=a[d]=a[d]||[],e[f?"unshift":"push"](c)}}function z(a,c,d,e,f,g){f=f||c.dataTypes[0],g=g||{},g[f]=!0;for(var h,i=a[f],j=0,k=i?i.length:0,l=a===Kc;k>j&&(l||!h);j++)h=i[j](c,d,e),"string"==typeof h&&(!l||g[h]?h=b:(c.dataTypes.unshift(h),h=z(a,c,d,e,h,g)));return(l||!h)&&!g["*"]&&(h=z(a,c,d,e,"*",g)),h}function A(a,c){var d,e,f=$.ajaxSettings.flatOptions||{};for(d in c)c[d]!==b&&((f[d]?a:e||(e={}))[d]=c[d]);e&&$.extend(!0,a,e)}function B(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(f in k)f in d&&(c[k[f]]=d[f]);for(;"*"===j[0];)j.shift(),e===b&&(e=a.mimeType||c.getResponseHeader("content-type"));if(e)for(f in i)if(i[f]&&i[f].test(e)){j.unshift(f);break}if(j[0]in d)g=j[0];else{for(f in d){if(!j[0]||a.converters[f+" "+j[0]]){g=f;break}h||(h=f)}g=g||h}return g?(g!==j[0]&&j.unshift(g),d[g]):void 0}function C(a,b){var c,d,e,f,g=a.dataTypes.slice(),h=g[0],i={},j=0;if(a.dataFilter&&(b=a.dataFilter(b,a.dataType)),g[1])for(c in a.converters)i[c.toLowerCase()]=a.converters[c];for(;e=g[++j];)if("*"!==e){if("*"!==h&&h!==e){if(c=i[h+" "+e]||i["* "+e],!c)for(d in i)if(f=d.split(" "),f[1]===e&&(c=i[h+" "+f[0]]||i["* "+f[0]])){c===!0?c=i[d]:i[d]!==!0&&(e=f[0],g.splice(j--,0,e));break}if(c!==!0)if(c&&a["throws"])b=c(b);else try{b=c(b)}catch(k){return{state:"parsererror",error:c?k:"No conversion from "+h+" to "+e}}}h=e}return{state:"success",data:b}}function D(){try{return new a.XMLHttpRequest}catch(b){}}function E(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function F(){return setTimeout(function(){Vc=b},0),Vc=$.now()}function G(a,b){$.each(b,function(b,c){for(var d=(_c[b]||[]).concat(_c["*"]),e=0,f=d.length;f>e;e++)if(d[e].call(a,b,c))return})}function H(a,b,c){var d,e=0,f=$c.length,g=$.Deferred().always(function(){delete h.elem}),h=function(){for(var b=Vc||F(),c=Math.max(0,i.startTime+i.duration-b),d=1-(c/i.duration||0),e=0,f=i.tweens.length;f>e;e++)i.tweens[e].run(d);return g.notifyWith(a,[i,d,c]),1>d&&f?c:(g.resolveWith(a,[i]),!1)},i=g.promise({elem:a,props:$.extend({},b),opts:$.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:Vc||F(),duration:c.duration,tweens:[],createTween:function(b,c){var d=$.Tween(a,i.opts,b,c,i.opts.specialEasing[b]||i.opts.easing);return i.tweens.push(d),d},stop:function(b){for(var c=0,d=b?i.tweens.length:0;d>c;c++)i.tweens[c].run(1);return b?g.resolveWith(a,[i,b]):g.rejectWith(a,[i,b]),this}}),j=i.props;for(I(j,i.opts.specialEasing);f>e;e++)if(d=$c[e].call(i,a,j,i.opts))return d;return G(i,j),$.isFunction(i.opts.start)&&i.opts.start.call(a,i),$.fx.timer($.extend(h,{anim:i,queue:i.opts.queue,elem:a})),i.progress(i.opts.progress).done(i.opts.done,i.opts.complete).fail(i.opts.fail).always(i.opts.always)}function I(a,b){var c,d,e,f,g;for(c in a)if(d=$.camelCase(c),e=b[d],f=a[c],$.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=$.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function J(a,b,c){var d,e,f,g,h,i,j,k,l=this,m=a.style,n={},o=[],p=a.nodeType&&r(a);c.queue||(j=$._queueHooks(a,"fx"),null==j.unqueued&&(j.unqueued=0,k=j.empty.fire,j.empty.fire=function(){j.unqueued||k()}),j.unqueued++,l.always(function(){l.always(function(){j.unqueued--,$.queue(a,"fx").length||j.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[m.overflow,m.overflowX,m.overflowY],"inline"===$.css(a,"display")&&"none"===$.css(a,"float")&&($.support.inlineBlockNeedsLayout&&"inline"!==w(a.nodeName)?m.zoom=1:m.display="inline-block")),c.overflow&&(m.overflow="hidden",$.support.shrinkWrapBlocks||l.done(function(){m.overflow=c.overflow[0],m.overflowX=c.overflow[1],m.overflowY=c.overflow[2]}));for(d in b)if(f=b[d],Xc.exec(f)){if(delete b[d],f===(p?"hide":"show"))continue;o.push(d)}if(g=o.length)for(h=$._data(a,"fxshow")||$._data(a,"fxshow",{}),p?$(a).show():l.done(function(){$(a).hide()}),l.done(function(){var b;$.removeData(a,"fxshow",!0);for(b in n)$.style(a,b,n[b])}),d=0;g>d;d++)e=o[d],i=l.createTween(e,p?h[e]:0),n[e]=h[e]||$.style(a,e),e in h||(h[e]=i.start,p&&(i.end=i.start,i.start="width"===e||"height"===e?1:0))}function K(a,b,c,d,e){return new K.prototype.init(a,b,c,d,e)}function L(a,b){var c,d={height:a},e=0;for(b=b?1:0;4>e;e+=2-b)c=qc[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function M(a){return $.isWindow(a)?a:9===a.nodeType?a.defaultView||a.parentWindow:!1}var N,O,P=a.document,Q=a.location,R=a.navigator,S=a.jQuery,T=a.$,U=Array.prototype.push,V=Array.prototype.slice,W=Array.prototype.indexOf,X=Object.prototype.toString,Y=Object.prototype.hasOwnProperty,Z=String.prototype.trim,$=function(a,b){return new $.fn.init(a,b,N)},_=/[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source,ab=/\S/,bb=/\s+/,cb=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,db=/^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,eb=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,fb=/^[\],:{}\s]*$/,gb=/(?:^|:|,)(?:\s*\[)+/g,hb=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,ib=/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g,jb=/^-ms-/,kb=/-([\da-z])/gi,lb=function(a,b){return(b+"").toUpperCase()},mb=function(){P.addEventListener?(P.removeEventListener("DOMContentLoaded",mb,!1),$.ready()):"complete"===P.readyState&&(P.detachEvent("onreadystatechange",mb),$.ready())},nb={};$.fn=$.prototype={constructor:$,init:function(a,c,d){var e,f,g;if(!a)return this;if(a.nodeType)return this.context=this[0]=a,this.length=1,this;if("string"==typeof a){if(e="<"===a.charAt(0)&&">"===a.charAt(a.length-1)&&a.length>=3?[null,a,null]:db.exec(a),e&&(e[1]||!c)){if(e[1])return c=c instanceof $?c[0]:c,g=c&&c.nodeType?c.ownerDocument||c:P,a=$.parseHTML(e[1],g,!0),eb.test(e[1])&&$.isPlainObject(c)&&this.attr.call(a,c,!0),$.merge(this,a);if(f=P.getElementById(e[2]),f&&f.parentNode){if(f.id!==e[2])return d.find(a);this.length=1,this[0]=f}return this.context=P,this.selector=a,this}return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a)}return $.isFunction(a)?d.ready(a):(a.selector!==b&&(this.selector=a.selector,this.context=a.context),$.makeArray(a,this))},selector:"",jquery:"1.8.2",length:0,size:function(){return this.length},toArray:function(){return V.call(this)},get:function(a){return null==a?this.toArray():0>a?this[this.length+a]:this[a]},pushStack:function(a,b,c){var d=$.merge(this.constructor(),a);return d.prevObject=this,d.context=this.context,"find"===b?d.selector=this.selector+(this.selector?" ":"")+c:b&&(d.selector=this.selector+"."+b+"("+c+")"),d},each:function(a,b){return $.each(this,a,b)},ready:function(a){return $.ready.promise().done(a),this},eq:function(a){return a=+a,-1===a?this.slice(a):this.slice(a,a+1)},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},slice:function(){return this.pushStack(V.apply(this,arguments),"slice",V.call(arguments).join(","))},map:function(a){return this.pushStack($.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:U,sort:[].sort,splice:[].splice},$.fn.init.prototype=$.fn,$.extend=$.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;for("boolean"==typeof h&&(k=h,h=arguments[1]||{},i=2),"object"!=typeof h&&!$.isFunction(h)&&(h={}),j===i&&(h=this,--i);j>i;i++)if(null!=(a=arguments[i]))for(c in a)d=h[c],e=a[c],h!==e&&(k&&e&&($.isPlainObject(e)||(f=$.isArray(e)))?(f?(f=!1,g=d&&$.isArray(d)?d:[]):g=d&&$.isPlainObject(d)?d:{},h[c]=$.extend(k,g,e)):e!==b&&(h[c]=e));return h},$.extend({noConflict:function(b){return a.$===$&&(a.$=T),b&&a.jQuery===$&&(a.jQuery=S),$},isReady:!1,readyWait:1,holdReady:function(a){a?$.readyWait++:$.ready(!0)},ready:function(a){if(a===!0?!--$.readyWait:!$.isReady){if(!P.body)return setTimeout($.ready,1);$.isReady=!0,a!==!0&&--$.readyWait>0||(O.resolveWith(P,[$]),$.fn.trigger&&$(P).trigger("ready").off("ready"))}},isFunction:function(a){return"function"===$.type(a)},isArray:Array.isArray||function(a){return"array"===$.type(a)},isWindow:function(a){return null!=a&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return null==a?String(a):nb[X.call(a)]||"object"},isPlainObject:function(a){if(!a||"object"!==$.type(a)||a.nodeType||$.isWindow(a))return!1;try{if(a.constructor&&!Y.call(a,"constructor")&&!Y.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||Y.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){var d;return a&&"string"==typeof a?("boolean"==typeof b&&(c=b,b=0),b=b||P,(d=eb.exec(a))?[b.createElement(d[1])]:(d=$.buildFragment([a],b,c?null:[]),$.merge([],(d.cacheable?$.clone(d.fragment):d.fragment).childNodes))):null},parseJSON:function(b){return b&&"string"==typeof b?(b=$.trim(b),a.JSON&&a.JSON.parse?a.JSON.parse(b):fb.test(b.replace(hb,"@").replace(ib,"]").replace(gb,""))?new Function("return "+b)():void $.error("Invalid JSON: "+b)):null},parseXML:function(c){var d,e;if(!c||"string"!=typeof c)return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(f){d=b}return(!d||!d.documentElement||d.getElementsByTagName("parsererror").length)&&$.error("Invalid XML: "+c),d},noop:function(){},globalEval:function(b){b&&ab.test(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(jb,"ms-").replace(kb,lb)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,c,d){var e,f=0,g=a.length,h=g===b||$.isFunction(a);if(d)if(h){for(e in a)if(c.apply(a[e],d)===!1)break}else for(;g>f&&c.apply(a[f++],d)!==!1;);else if(h){for(e in a)if(c.call(a[e],e,a[e])===!1)break}else for(;g>f&&c.call(a[f],f,a[f++])!==!1;);return a},trim:Z&&!Z.call("� ")?function(a){return null==a?"":Z.call(a)}:function(a){return null==a?"":(a+"").replace(cb,"")},makeArray:function(a,b){var c,d=b||[];return null!=a&&(c=$.type(a),null==a.length||"string"===c||"function"===c||"regexp"===c||$.isWindow(a)?U.call(d,a):$.merge(d,a)),d},inArray:function(a,b,c){var d;if(b){if(W)return W.call(b,a,c);for(d=b.length,c=c?0>c?Math.max(0,d+c):c:0;d>c;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if("number"==typeof d)for(;d>f;f++)a[e++]=c[f];else for(;c[f]!==b;)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;for(c=!!c;g>f;f++)d=!!b(a[f],f),c!==d&&e.push(a[f]);return e},map:function(a,c,d){var e,f,g=[],h=0,i=a.length,j=a instanceof $||i!==b&&"number"==typeof i&&(i>0&&a[0]&&a[i-1]||0===i||$.isArray(a));if(j)for(;i>h;h++)e=c(a[h],h,d),null!=e&&(g[g.length]=e);else for(f in a)e=c(a[f],f,d),null!=e&&(g[g.length]=e);return g.concat.apply([],g)},guid:1,proxy:function(a,c){var d,e,f;return"string"==typeof c&&(d=a[c],c=a,a=d),$.isFunction(a)?(e=V.call(arguments,2),f=function(){return a.apply(c,e.concat(V.call(arguments)))},f.guid=a.guid=a.guid||$.guid++,f):b},access:function(a,c,d,e,f,g,h){var i,j=null==d,k=0,l=a.length;if(d&&"object"==typeof d){for(k in d)$.access(a,c,k,d[k],1,g,e);f=1}else if(e!==b){if(i=h===b&&$.isFunction(e),j&&(i?(i=c,c=function(a,b,c){return i.call($(a),c)}):(c.call(a,e),c=null)),c)for(;l>k;k++)c(a[k],d,i?e.call(a[k],k,c(a[k],d)):e,h);f=1}return f?a:j?c.call(a):l?c(a[0],d):g},now:function(){return(new Date).getTime()}}),$.ready.promise=function(b){if(!O)if(O=$.Deferred(),"complete"===P.readyState)setTimeout($.ready,1);else if(P.addEventListener)P.addEventListener("DOMContentLoaded",mb,!1),a.addEventListener("load",$.ready,!1);else{P.attachEvent("onreadystatechange",mb),a.attachEvent("onload",$.ready);var c=!1;try{c=null==a.frameElement&&P.documentElement}catch(d){}c&&c.doScroll&&function e(){if(!$.isReady){try{c.doScroll("left")}catch(a){return setTimeout(e,50)}$.ready()}}()}return O.promise(b)},$.each("Boolean Number String Function Array Date RegExp Object".split(" "),function(a,b){nb["[object "+b+"]"]=b.toLowerCase()}),N=$(P);var ob={};$.Callbacks=function(a){a="string"==typeof a?ob[a]||c(a):$.extend({},a);var d,e,f,g,h,i,j=[],k=!a.once&&[],l=function(b){for(d=a.memory&&b,e=!0,i=g||0,g=0,h=j.length,f=!0;j&&h>i;i++)if(j[i].apply(b[0],b[1])===!1&&a.stopOnFalse){d=!1;break}f=!1,j&&(k?k.length&&l(k.shift()):d?j=[]:m.disable())},m={add:function(){if(j){var b=j.length;!function c(b){$.each(b,function(b,d){var e=$.type(d);"function"!==e||a.unique&&m.has(d)?d&&d.length&&"string"!==e&&c(d):j.push(d)})}(arguments),f?h=j.length:d&&(g=b,l(d))}return this},remove:function(){return j&&$.each(arguments,function(a,b){for(var c;(c=$.inArray(b,j,c))>-1;)j.splice(c,1),f&&(h>=c&&h--,i>=c&&i--)}),this},has:function(a){return $.inArray(a,j)>-1},empty:function(){return j=[],this},disable:function(){return j=k=d=b,this},disabled:function(){return!j},lock:function(){return k=b,d||m.disable(),this},locked:function(){return!k},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],j&&(!e||k)&&(f?k.push(b):l(b)),this},fire:function(){return m.fireWith(this,arguments),this},fired:function(){return!!e}};return m},$.extend({Deferred:function(a){var b=[["resolve","done",$.Callbacks("once memory"),"resolved"],["reject","fail",$.Callbacks("once memory"),"rejected"],["notify","progress",$.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return $.Deferred(function(c){$.each(b,function(b,d){var f=d[0],g=a[b];e[d[1]]($.isFunction(g)?function(){var a=g.apply(this,arguments);a&&$.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f+"With"](this===e?c:this,[a])}:c[f])}),a=null}).promise()},promise:function(a){return null!=a?$.extend(a,d):d}},e={};return d.pipe=d.then,$.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=g.fire,e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b,c,d,e=0,f=V.call(arguments),g=f.length,h=1!==g||a&&$.isFunction(a.promise)?g:0,i=1===h?a:$.Deferred(),j=function(a,c,d){return function(e){c[a]=this,d[a]=arguments.length>1?V.call(arguments):e,d===b?i.notifyWith(c,d):--h||i.resolveWith(c,d)}};if(g>1)for(b=new Array(g),c=new Array(g),d=new Array(g);g>e;e++)f[e]&&$.isFunction(f[e].promise)?f[e].promise().done(j(e,d,f)).fail(i.reject).progress(j(e,c,b)):--h;return h||i.resolveWith(d,f),i.promise()}}),$.support=function(){var b,c,d,e,f,g,h,i,j,k,l,m=P.createElement("div");if(m.setAttribute("className","t"),m.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",c=m.getElementsByTagName("*"),d=m.getElementsByTagName("a")[0],d.style.cssText="top:1px;float:left;opacity:.5",!c||!c.length)return{};e=P.createElement("select"),f=e.appendChild(P.createElement("option")),g=m.getElementsByTagName("input")[0],b={leadingWhitespace:3===m.firstChild.nodeType,tbody:!m.getElementsByTagName("tbody").length,htmlSerialize:!!m.getElementsByTagName("link").length,style:/top/.test(d.getAttribute("style")),hrefNormalized:"/a"===d.getAttribute("href"),opacity:/^0.5/.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:"on"===g.value,optSelected:f.selected,getSetAttribute:"t"!==m.className,enctype:!!P.createElement("form").enctype,html5Clone:"<:nav></:nav>"!==P.createElement("nav").cloneNode(!0).outerHTML,boxModel:"CSS1Compat"===P.compatMode,submitBubbles:!0,changeBubbles:!0,focusinBubbles:!1,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},g.checked=!0,b.noCloneChecked=g.cloneNode(!0).checked,e.disabled=!0,b.optDisabled=!f.disabled;try{delete m.test}catch(n){b.deleteExpando=!1}if(!m.addEventListener&&m.attachEvent&&m.fireEvent&&(m.attachEvent("onclick",l=function(){b.noCloneEvent=!1}),m.cloneNode(!0).fireEvent("onclick"),m.detachEvent("onclick",l)),g=P.createElement("input"),g.value="t",g.setAttribute("type","radio"),b.radioValue="t"===g.value,g.setAttribute("checked","checked"),g.setAttribute("name","t"),m.appendChild(g),h=P.createDocumentFragment(),h.appendChild(m.lastChild),b.checkClone=h.cloneNode(!0).cloneNode(!0).lastChild.checked,b.appendChecked=g.checked,h.removeChild(g),h.appendChild(m),m.attachEvent)for(j in{submit:!0,change:!0,focusin:!0})i="on"+j,k=i in m,k||(m.setAttribute(i,"return;"),k="function"==typeof m[i]),b[j+"Bubbles"]=k;return $(function(){var c,d,e,f,g="padding:0;margin:0;border:0;display:block;overflow:hidden;",h=P.getElementsByTagName("body")[0];
    h&&(c=P.createElement("div"),c.style.cssText="visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px",h.insertBefore(c,h.firstChild),d=P.createElement("div"),c.appendChild(d),d.innerHTML="<table><tr><td></td><td>t</td></tr></table>",e=d.getElementsByTagName("td"),e[0].style.cssText="padding:0;margin:0;border:0;display:none",k=0===e[0].offsetHeight,e[0].style.display="",e[1].style.display="none",b.reliableHiddenOffsets=k&&0===e[0].offsetHeight,d.innerHTML="",d.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",b.boxSizing=4===d.offsetWidth,b.doesNotIncludeMarginInBodyOffset=1!==h.offsetTop,a.getComputedStyle&&(b.pixelPosition="1%"!==(a.getComputedStyle(d,null)||{}).top,b.boxSizingReliable="4px"===(a.getComputedStyle(d,null)||{width:"4px"}).width,f=P.createElement("div"),f.style.cssText=d.style.cssText=g,f.style.marginRight=f.style.width="0",d.style.width="1px",d.appendChild(f),b.reliableMarginRight=!parseFloat((a.getComputedStyle(f,null)||{}).marginRight)),"undefined"!=typeof d.style.zoom&&(d.innerHTML="",d.style.cssText=g+"width:1px;padding:1px;display:inline;zoom:1",b.inlineBlockNeedsLayout=3===d.offsetWidth,d.style.display="block",d.style.overflow="visible",d.innerHTML="<div></div>",d.firstChild.style.width="5px",b.shrinkWrapBlocks=3!==d.offsetWidth,c.style.zoom=1),h.removeChild(c),c=d=e=f=null)}),h.removeChild(m),c=d=e=f=g=h=m=null,b}();var pb=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,qb=/([A-Z])/g;$.extend({cache:{},deletedIds:[],uuid:0,expando:"jQuery"+($.fn.jquery+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){return a=a.nodeType?$.cache[a[$.expando]]:a[$.expando],!!a&&!e(a)},data:function(a,c,d,e){if($.acceptData(a)){var f,g,h=$.expando,i="string"==typeof c,j=a.nodeType,k=j?$.cache:a,l=j?a[h]:a[h]&&h;if(l&&k[l]&&(e||k[l].data)||!i||d!==b)return l||(j?a[h]=l=$.deletedIds.pop()||$.guid++:l=h),k[l]||(k[l]={},j||(k[l].toJSON=$.noop)),("object"==typeof c||"function"==typeof c)&&(e?k[l]=$.extend(k[l],c):k[l].data=$.extend(k[l].data,c)),f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&&(f[$.camelCase(c)]=d),i?(g=f[c],null==g&&(g=f[$.camelCase(c)])):g=f,g}},removeData:function(a,b,c){if($.acceptData(a)){var d,f,g,h=a.nodeType,i=h?$.cache:a,j=h?a[$.expando]:$.expando;if(i[j]){if(b&&(d=c?i[j]:i[j].data)){$.isArray(b)||(b in d?b=[b]:(b=$.camelCase(b),b=b in d?[b]:b.split(" ")));for(f=0,g=b.length;g>f;f++)delete d[b[f]];if(!(c?e:$.isEmptyObject)(d))return}(c||(delete i[j].data,e(i[j])))&&(h?$.cleanData([a],!0):$.support.deleteExpando||i!=i.window?delete i[j]:i[j]=null)}}},_data:function(a,b,c){return $.data(a,b,c,!0)},acceptData:function(a){var b=a.nodeName&&$.noData[a.nodeName.toLowerCase()];return!b||b!==!0&&a.getAttribute("classid")===b}}),$.fn.extend({data:function(a,c){var e,f,g,h,i,j=this[0],k=0,l=null;if(a===b){if(this.length&&(l=$.data(j),1===j.nodeType&&!$._data(j,"parsedAttrs"))){for(g=j.attributes,i=g.length;i>k;k++)h=g[k].name,h.indexOf("data-")||(h=$.camelCase(h.substring(5)),d(j,h,l[h]));$._data(j,"parsedAttrs",!0)}return l}return"object"==typeof a?this.each(function(){$.data(this,a)}):(e=a.split(".",2),e[1]=e[1]?"."+e[1]:"",f=e[1]+"!",$.access(this,function(c){return c===b?(l=this.triggerHandler("getData"+f,[e[0]]),l===b&&j&&(l=$.data(j,a),l=d(j,a,l)),l===b&&e[1]?this.data(e[0]):l):(e[1]=c,void this.each(function(){var b=$(this);b.triggerHandler("setData"+f,e),$.data(this,a,c),b.triggerHandler("changeData"+f,e)}))},null,c,arguments.length>1,null,!1))},removeData:function(a){return this.each(function(){$.removeData(this,a)})}}),$.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=$._data(a,b),c&&(!d||$.isArray(c)?d=$._data(a,b,$.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=$.queue(a,b),d=c.length,e=c.shift(),f=$._queueHooks(a,b),g=function(){$.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return $._data(a,c)||$._data(a,c,{empty:$.Callbacks("once memory").add(function(){$.removeData(a,b+"queue",!0),$.removeData(a,c,!0)})})}}),$.fn.extend({queue:function(a,c){var d=2;return"string"!=typeof a&&(c=a,a="fx",d--),arguments.length<d?$.queue(this[0],a):c===b?this:this.each(function(){var b=$.queue(this,a,c);$._queueHooks(this,a),"fx"===a&&"inprogress"!==b[0]&&$.dequeue(this,a)})},dequeue:function(a){return this.each(function(){$.dequeue(this,a)})},delay:function(a,b){return a=$.fx?$.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){var d,e=1,f=$.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};for("string"!=typeof a&&(c=a,a=b),a=a||"fx";h--;)d=$._data(g[h],a+"queueHooks"),d&&d.empty&&(e++,d.empty.add(i));return i(),f.promise(c)}});var rb,sb,tb,ub=/[\t\r\n]/g,vb=/\r/g,wb=/^(?:button|input)$/i,xb=/^(?:button|input|object|select|textarea)$/i,yb=/^a(?:rea|)$/i,zb=/^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,Ab=$.support.getSetAttribute;$.fn.extend({attr:function(a,b){return $.access(this,$.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){$.removeAttr(this,a)})},prop:function(a,b){return $.access(this,$.prop,a,b,arguments.length>1)},removeProp:function(a){return a=$.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g,h;if($.isFunction(a))return this.each(function(b){$(this).addClass(a.call(this,b,this.className))});if(a&&"string"==typeof a)for(b=a.split(bb),c=0,d=this.length;d>c;c++)if(e=this[c],1===e.nodeType)if(e.className||1!==b.length){for(f=" "+e.className+" ",g=0,h=b.length;h>g;g++)f.indexOf(" "+b[g]+" ")<0&&(f+=b[g]+" ");e.className=$.trim(f)}else e.className=a;return this},removeClass:function(a){var c,d,e,f,g,h,i;if($.isFunction(a))return this.each(function(b){$(this).removeClass(a.call(this,b,this.className))});if(a&&"string"==typeof a||a===b)for(c=(a||"").split(bb),h=0,i=this.length;i>h;h++)if(e=this[h],1===e.nodeType&&e.className){for(d=(" "+e.className+" ").replace(ub," "),f=0,g=c.length;g>f;f++)for(;d.indexOf(" "+c[f]+" ")>=0;)d=d.replace(" "+c[f]+" "," ");e.className=a?$.trim(d):""}return this},toggleClass:function(a,b){var c=typeof a,d="boolean"==typeof b;return this.each($.isFunction(a)?function(c){$(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c)for(var e,f=0,g=$(this),h=b,i=a.split(bb);e=i[f++];)h=d?h:!g.hasClass(e),g[h?"addClass":"removeClass"](e);else("undefined"===c||"boolean"===c)&&(this.className&&$._data(this,"__className__",this.className),this.className=this.className||a===!1?"":$._data(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(ub," ").indexOf(b)>=0)return!0;return!1},val:function(a){var c,d,e,f=this[0];{if(arguments.length)return e=$.isFunction(a),this.each(function(d){var f,g=$(this);1===this.nodeType&&(f=e?a.call(this,d,g.val()):a,null==f?f="":"number"==typeof f?f+="":$.isArray(f)&&(f=$.map(f,function(a){return null==a?"":a+""})),c=$.valHooks[this.type]||$.valHooks[this.nodeName.toLowerCase()],c&&"set"in c&&c.set(this,f,"value")!==b||(this.value=f))});if(f)return c=$.valHooks[f.type]||$.valHooks[f.nodeName.toLowerCase()],c&&"get"in c&&(d=c.get(f,"value"))!==b?d:(d=f.value,"string"==typeof d?d.replace(vb,""):null==d?"":d)}}}),$.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){var b,c,d,e,f=a.selectedIndex,g=[],h=a.options,i="select-one"===a.type;if(0>f)return null;for(c=i?f:0,d=i?f+1:h.length;d>c;c++)if(e=h[c],!(!e.selected||($.support.optDisabled?e.disabled:null!==e.getAttribute("disabled"))||e.parentNode.disabled&&$.nodeName(e.parentNode,"optgroup"))){if(b=$(e).val(),i)return b;g.push(b)}return i&&!g.length&&h.length?$(h[f]).val():g},set:function(a,b){var c=$.makeArray(b);return $(a).find("option").each(function(){this.selected=$.inArray($(this).val(),c)>=0}),c.length||(a.selectedIndex=-1),c}}},attrFn:{},attr:function(a,c,d,e){var f,g,h,i=a.nodeType;if(a&&3!==i&&8!==i&&2!==i)return e&&$.isFunction($.fn[c])?$(a)[c](d):"undefined"==typeof a.getAttribute?$.prop(a,c,d):(h=1!==i||!$.isXMLDoc(a),h&&(c=c.toLowerCase(),g=$.attrHooks[c]||(zb.test(c)?sb:rb)),d!==b?null===d?void $.removeAttr(a,c):g&&"set"in g&&h&&(f=g.set(a,d,c))!==b?f:(a.setAttribute(c,d+""),d):g&&"get"in g&&h&&null!==(f=g.get(a,c))?f:(f=a.getAttribute(c),null===f?b:f))},removeAttr:function(a,b){var c,d,e,f,g=0;if(b&&1===a.nodeType)for(d=b.split(bb);g<d.length;g++)e=d[g],e&&(c=$.propFix[e]||e,f=zb.test(e),f||$.attr(a,e,""),a.removeAttribute(Ab?e:c),f&&c in a&&(a[c]=!1))},attrHooks:{type:{set:function(a,b){if(wb.test(a.nodeName)&&a.parentNode)$.error("type property can't be changed");else if(!$.support.radioValue&&"radio"===b&&$.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}},value:{get:function(a,b){return rb&&$.nodeName(a,"button")?rb.get(a,b):b in a?a.value:null},set:function(a,b,c){return rb&&$.nodeName(a,"button")?rb.set(a,b,c):void(a.value=b)}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(a&&3!==h&&8!==h&&2!==h)return g=1!==h||!$.isXMLDoc(a),g&&(c=$.propFix[c]||c,f=$.propHooks[c]),d!==b?f&&"set"in f&&(e=f.set(a,d,c))!==b?e:a[c]=d:f&&"get"in f&&null!==(e=f.get(a,c))?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):xb.test(a.nodeName)||yb.test(a.nodeName)&&a.href?0:b}}}}),sb={get:function(a,c){var d,e=$.prop(a,c);return e===!0||"boolean"!=typeof e&&(d=a.getAttributeNode(c))&&d.nodeValue!==!1?c.toLowerCase():b},set:function(a,b,c){var d;return b===!1?$.removeAttr(a,c):(d=$.propFix[c]||c,d in a&&(a[d]=!0),a.setAttribute(c,c.toLowerCase())),c}},Ab||(tb={name:!0,id:!0,coords:!0},rb=$.valHooks.button={get:function(a,c){var d;return d=a.getAttributeNode(c),d&&(tb[c]?""!==d.value:d.specified)?d.value:b},set:function(a,b,c){var d=a.getAttributeNode(c);return d||(d=P.createAttribute(c),a.setAttributeNode(d)),d.value=b+""}},$.each(["width","height"],function(a,b){$.attrHooks[b]=$.extend($.attrHooks[b],{set:function(a,c){return""===c?(a.setAttribute(b,"auto"),c):void 0}})}),$.attrHooks.contenteditable={get:rb.get,set:function(a,b,c){""===b&&(b="false"),rb.set(a,b,c)}}),$.support.hrefNormalized||$.each(["href","src","width","height"],function(a,c){$.attrHooks[c]=$.extend($.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return null===d?b:d}})}),$.support.style||($.attrHooks.style={get:function(a){return a.style.cssText.toLowerCase()||b},set:function(a,b){return a.style.cssText=b+""}}),$.support.optSelected||($.propHooks.selected=$.extend($.propHooks.selected,{get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}})),$.support.enctype||($.propFix.enctype="encoding"),$.support.checkOn||$.each(["radio","checkbox"],function(){$.valHooks[this]={get:function(a){return null===a.getAttribute("value")?"on":a.value}}}),$.each(["radio","checkbox"],function(){$.valHooks[this]=$.extend($.valHooks[this],{set:function(a,b){return $.isArray(b)?a.checked=$.inArray($(a).val(),b)>=0:void 0}})});var Bb=/^(?:textarea|input|select)$/i,Cb=/^([^\.]*|)(?:\.(.+)|)$/,Db=/(?:^|\s)hover(\.\S+|)\b/,Eb=/^key/,Fb=/^(?:mouse|contextmenu)|click/,Gb=/^(?:focusinfocus|focusoutblur)$/,Hb=function(a){return $.event.special.hover?a:a.replace(Db,"mouseenter$1 mouseleave$1")};$.event={add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,p,q;if(3!==a.nodeType&&8!==a.nodeType&&c&&d&&(g=$._data(a))){for(d.handler&&(o=d,d=o.handler,f=o.selector),d.guid||(d.guid=$.guid++),i=g.events,i||(g.events=i={}),h=g.handle,h||(g.handle=h=function(a){return"undefined"==typeof $||a&&$.event.triggered===a.type?b:$.event.dispatch.apply(h.elem,arguments)},h.elem=a),c=$.trim(Hb(c)).split(" "),j=0;j<c.length;j++)k=Cb.exec(c[j])||[],l=k[1],m=(k[2]||"").split(".").sort(),q=$.event.special[l]||{},l=(f?q.delegateType:q.bindType)||l,q=$.event.special[l]||{},n=$.extend({type:l,origType:k[1],data:e,handler:d,guid:d.guid,selector:f,needsContext:f&&$.expr.match.needsContext.test(f),namespace:m.join(".")},o),p=i[l],p||(p=i[l]=[],p.delegateCount=0,q.setup&&q.setup.call(a,e,m,h)!==!1||(a.addEventListener?a.addEventListener(l,h,!1):a.attachEvent&&a.attachEvent("on"+l,h))),q.add&&(q.add.call(a,n),n.handler.guid||(n.handler.guid=d.guid)),f?p.splice(p.delegateCount++,0,n):p.push(n),$.event.global[l]=!0;a=null}},global:{},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=$.hasData(a)&&$._data(a);if(q&&(m=q.events)){for(b=$.trim(Hb(b||"")).split(" "),f=0;f<b.length;f++)if(g=Cb.exec(b[f])||[],h=i=g[1],j=g[2],h){for(n=$.event.special[h]||{},h=(d?n.delegateType:n.bindType)||h,o=m[h]||[],k=o.length,j=j?new RegExp("(^|\\.)"+j.split(".").sort().join("\\.(?:.*\\.|)")+"(\\.|$)"):null,l=0;l<o.length;l++)p=o[l],!(!e&&i!==p.origType||c&&c.guid!==p.guid||j&&!j.test(p.namespace)||d&&d!==p.selector&&("**"!==d||!p.selector)||(o.splice(l--,1),p.selector&&o.delegateCount--,!n.remove||!n.remove.call(a,p)));0===o.length&&k!==o.length&&((!n.teardown||n.teardown.call(a,j,q.handle)===!1)&&$.removeEvent(a,h,q.handle),delete m[h])}else for(h in m)$.event.remove(a,h+b[f],c,d,!0);$.isEmptyObject(m)&&(delete q.handle,$.removeData(a,"events",!0))}},customEvent:{getData:!0,setData:!0,changeData:!0},trigger:function(c,d,e,f){if(!e||3!==e.nodeType&&8!==e.nodeType){var g,h,i,j,k,l,m,n,o,p,q=c.type||c,r=[];if(Gb.test(q+$.event.triggered))return;if(q.indexOf("!")>=0&&(q=q.slice(0,-1),h=!0),q.indexOf(".")>=0&&(r=q.split("."),q=r.shift(),r.sort()),(!e||$.event.customEvent[q])&&!$.event.global[q])return;if(c="object"==typeof c?c[$.expando]?c:new $.Event(q,c):new $.Event(q),c.type=q,c.isTrigger=!0,c.exclusive=h,c.namespace=r.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,l=q.indexOf(":")<0?"on"+q:"",!e){g=$.cache;for(i in g)g[i].events&&g[i].events[q]&&$.event.trigger(c,d,g[i].handle.elem,!0);return}if(c.result=b,c.target||(c.target=e),d=null!=d?$.makeArray(d):[],d.unshift(c),m=$.event.special[q]||{},m.trigger&&m.trigger.apply(e,d)===!1)return;if(o=[[e,m.bindType||q]],!f&&!m.noBubble&&!$.isWindow(e)){for(p=m.delegateType||q,j=Gb.test(p+q)?e:e.parentNode,k=e;j;j=j.parentNode)o.push([j,p]),k=j;k===(e.ownerDocument||P)&&o.push([k.defaultView||k.parentWindow||a,p])}for(i=0;i<o.length&&!c.isPropagationStopped();i++)j=o[i][0],c.type=o[i][1],n=($._data(j,"events")||{})[c.type]&&$._data(j,"handle"),n&&n.apply(j,d),n=l&&j[l],n&&$.acceptData(j)&&n.apply&&n.apply(j,d)===!1&&c.preventDefault();return c.type=q,!(f||c.isDefaultPrevented()||m._default&&m._default.apply(e.ownerDocument,d)!==!1||"click"===q&&$.nodeName(e,"a")||!$.acceptData(e)||!l||!e[q]||("focus"===q||"blur"===q)&&0===c.target.offsetWidth||$.isWindow(e)||(k=e[l],k&&(e[l]=null),$.event.triggered=q,e[q](),$.event.triggered=b,!k||!(e[l]=k))),c.result}},dispatch:function(c){c=$.event.fix(c||a.event);var d,e,f,g,h,i,j,k,l,m=($._data(this,"events")||{})[c.type]||[],n=m.delegateCount,o=V.call(arguments),p=!c.exclusive&&!c.namespace,q=$.event.special[c.type]||{},r=[];if(o[0]=c,c.delegateTarget=this,!q.preDispatch||q.preDispatch.call(this,c)!==!1){if(n&&(!c.button||"click"!==c.type))for(f=c.target;f!=this;f=f.parentNode||this)if(f.disabled!==!0||"click"!==c.type){for(h={},j=[],d=0;n>d;d++)k=m[d],l=k.selector,h[l]===b&&(h[l]=k.needsContext?$(l,this).index(f)>=0:$.find(l,this,null,[f]).length),h[l]&&j.push(k);j.length&&r.push({elem:f,matches:j})}for(m.length>n&&r.push({elem:this,matches:m.slice(n)}),d=0;d<r.length&&!c.isPropagationStopped();d++)for(i=r[d],c.currentTarget=i.elem,e=0;e<i.matches.length&&!c.isImmediatePropagationStopped();e++)k=i.matches[e],(p||!c.namespace&&!k.namespace||c.namespace_re&&c.namespace_re.test(k.namespace))&&(c.data=k.data,c.handleObj=k,g=(($.event.special[k.origType]||{}).handle||k.handler).apply(i.elem,o),g!==b&&(c.result=g,g===!1&&(c.preventDefault(),c.stopPropagation())));return q.postDispatch&&q.postDispatch.call(this,c),c.result}},props:"attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,c){var d,e,f,g=c.button,h=c.fromElement;return null==a.pageX&&null!=c.clientX&&(d=a.target.ownerDocument||P,e=d.documentElement,f=d.body,a.pageX=c.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=c.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),!a.relatedTarget&&h&&(a.relatedTarget=h===a.target?c.toElement:h),!a.which&&g!==b&&(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[$.expando])return a;var b,c,d=a,e=$.event.fixHooks[a.type]||{},f=e.props?this.props.concat(e.props):this.props;for(a=$.Event(d),b=f.length;b;)c=f[--b],a[c]=d[c];return a.target||(a.target=d.srcElement||P),3===a.target.nodeType&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,e.filter?e.filter(a,d):a},special:{load:{noBubble:!0},focus:{delegateType:"focusin"},blur:{delegateType:"focusout"},beforeunload:{setup:function(a,b,c){$.isWindow(this)&&(this.onbeforeunload=c)},teardown:function(a,b){this.onbeforeunload===b&&(this.onbeforeunload=null)}}},simulate:function(a,b,c,d){var e=$.extend(new $.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?$.event.trigger(e,null,b):$.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},$.event.handle=$.event.dispatch,$.removeEvent=P.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&("undefined"==typeof a[d]&&(a[d]=null),a.detachEvent(d,c))},$.Event=function(a,b){return this instanceof $.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?g:f):this.type=a,b&&$.extend(this,b),this.timeStamp=a&&a.timeStamp||$.now(),this[$.expando]=!0,void 0):new $.Event(a,b)},$.Event.prototype={preventDefault:function(){this.isDefaultPrevented=g;var a=this.originalEvent;a&&(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){this.isPropagationStopped=g;var a=this.originalEvent;a&&(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=g,this.stopPropagation()},isDefaultPrevented:f,isPropagationStopped:f,isImmediatePropagationStopped:f},$.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){$.event.special[a]={delegateType:b,bindType:b,handle:function(a){{var c,d=this,e=a.relatedTarget,f=a.handleObj;f.selector}return(!e||e!==d&&!$.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),$.support.submitBubbles||($.event.special.submit={setup:function(){return $.nodeName(this,"form")?!1:void $.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=$.nodeName(c,"input")||$.nodeName(c,"button")?c.form:b;d&&!$._data(d,"_submit_attached")&&($.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),$._data(d,"_submit_attached",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&$.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){return $.nodeName(this,"form")?!1:void $.event.remove(this,"._submit")}}),$.support.changeBubbles||($.event.special.change={setup:function(){return Bb.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&($.event.add(this,"propertychange._change",function(a){"checked"===a.originalEvent.propertyName&&(this._just_changed=!0)}),$.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),$.event.simulate("change",this,a,!0)})),!1):void $.event.add(this,"beforeactivate._change",function(a){var b=a.target;Bb.test(b.nodeName)&&!$._data(b,"_change_attached")&&($.event.add(b,"change._change",function(a){this.parentNode&&!a.isSimulated&&!a.isTrigger&&$.event.simulate("change",this.parentNode,a,!0)}),$._data(b,"_change_attached",!0))})},handle:function(a){var b=a.target;return this!==b||a.isSimulated||a.isTrigger||"radio"!==b.type&&"checkbox"!==b.type?a.handleObj.handler.apply(this,arguments):void 0},teardown:function(){return $.event.remove(this,"._change"),!Bb.test(this.nodeName)}}),$.support.focusinBubbles||$.each({focus:"focusin",blur:"focusout"},function(a,b){var c=0,d=function(a){$.event.simulate(b,a.target,$.event.fix(a),!0)};$.event.special[b]={setup:function(){0===c++&&P.addEventListener(a,d,!0)},teardown:function(){0===--c&&P.removeEventListener(a,d,!0)}}}),$.fn.extend({on:function(a,c,d,e,g){var h,i;if("object"==typeof a){"string"!=typeof c&&(d=d||c,c=b);for(i in a)this.on(i,c,d,a[i],g);return this}if(null==d&&null==e?(e=c,d=c=b):null==e&&("string"==typeof c?(e=d,d=b):(e=d,d=c,c=b)),e===!1)e=f;else if(!e)return this;return 1===g&&(h=e,e=function(a){return $().off(a),h.apply(this,arguments)},e.guid=h.guid||(h.guid=$.guid++)),this.each(function(){$.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,g;if(a&&a.preventDefault&&a.handleObj)return e=a.handleObj,$(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler),this;if("object"==typeof a){for(g in a)this.off(g,c,a[g]);return this}return(c===!1||"function"==typeof c)&&(d=c,c=b),d===!1&&(d=f),this.each(function(){$.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},live:function(a,b,c){return $(this.context).on(a,this.selector,b,c),this},die:function(a,b){return $(this.context).off(a,this.selector||"**",b),this},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},trigger:function(a,b){return this.each(function(){$.event.trigger(a,b,this)})},triggerHandler:function(a,b){return this[0]?$.event.trigger(a,b,this[0],!0):void 0},toggle:function(a){var b=arguments,c=a.guid||$.guid++,d=0,e=function(c){var e=($._data(this,"lastToggle"+a.guid)||0)%d;return $._data(this,"lastToggle"+a.guid,e+1),c.preventDefault(),b[e].apply(this,arguments)||!1};for(e.guid=c;d<b.length;)b[d++].guid=c;return this.click(e)},hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),$.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){$.fn[b]=function(a,c){return null==c&&(c=a,a=null),arguments.length>0?this.on(b,null,a,c):this.trigger(b)},Eb.test(b)&&($.event.fixHooks[b]=$.event.keyHooks),Fb.test(b)&&($.event.fixHooks[b]=$.event.mouseHooks)}),function(a,b){function c(a,b,c,d){c=c||[],b=b||F;var e,f,g,h,i=b.nodeType;if(!a||"string"!=typeof a)return c;if(1!==i&&9!==i)return[];if(g=v(b),!g&&!d&&(e=cb.exec(a)))if(h=e[1]){if(9===i){if(f=b.getElementById(h),!f||!f.parentNode)return c;if(f.id===h)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(h))&&w(b,f)&&f.id===h)return c.push(f),c}else{if(e[2])return K.apply(c,L.call(b.getElementsByTagName(a),0)),c;if((h=e[3])&&mb&&b.getElementsByClassName)return K.apply(c,L.call(b.getElementsByClassName(h),0)),c}return p(a.replace(Z,"$1"),b,c,d,g)}function d(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function e(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function f(a){return N(function(b){return b=+b,N(function(c,d){for(var e,f=a([],c.length,b),g=f.length;g--;)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function g(a,b,c){if(a===b)return c;for(var d=a.nextSibling;d;){if(d===b)return-1;d=d.nextSibling}return 1}function h(a,b){var d,e,f,g,h,i,j,k=Q[D][a];if(k)return b?0:k.slice(0);for(h=a,i=[],j=t.preFilter;h;){(!d||(e=_.exec(h)))&&(e&&(h=h.slice(e[0].length)),i.push(f=[])),d=!1,(e=ab.exec(h))&&(f.push(d=new E(e.shift())),h=h.slice(d.length),d.type=e[0].replace(Z," "));for(g in t.filter)(e=hb[g].exec(h))&&(!j[g]||(e=j[g](e,F,!0)))&&(f.push(d=new E(e.shift())),h=h.slice(d.length),d.type=g,d.matches=e);if(!d)break}return b?h.length:h?c.error(a):Q(a,i).slice(0)}function i(a,b,c){var d=b.dir,e=c&&"parentNode"===b.dir,f=I++;return b.first?function(b,c,f){for(;b=b[d];)if(e||1===b.nodeType)return a(b,c,f)}:function(b,c,g){if(g){for(;b=b[d];)if((e||1===b.nodeType)&&a(b,c,g))return b}else for(var h,i=H+" "+f+" ",j=i+r;b=b[d];)if(e||1===b.nodeType){if((h=b[D])===j)return b.sizset;if("string"==typeof h&&0===h.indexOf(i)){if(b.sizset)return b}else{if(b[D]=j,a(b,c,g))return b.sizset=!0,b;b.sizset=!1}}}}function j(a){return a.length>1?function(b,c,d){for(var e=a.length;e--;)if(!a[e](b,c,d))return!1;return!0}:a[0]}function k(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function l(a,b,c,d,e,f){return d&&!d[D]&&(d=l(d)),e&&!e[D]&&(e=l(e,f)),N(function(f,g,h,i){if(!f||!e){var j,l,m,n=[],p=[],q=g.length,r=f||o(b||"*",h.nodeType?[h]:h,[],f),s=!a||!f&&b?r:k(r,n,a,h,i),t=c?e||(f?a:q||d)?[]:g:s;if(c&&c(s,t,h,i),d)for(m=k(t,p),d(m,[],h,i),j=m.length;j--;)(l=m[j])&&(t[p[j]]=!(s[p[j]]=l));if(f)for(j=a&&t.length;j--;)(l=t[j])&&(f[n[j]]=!(g[n[j]]=l));else t=k(t===g?t.splice(q,t.length):t),e?e(null,g,t,i):K.apply(g,t)}})}function m(a){for(var b,c,d,e=a.length,f=t.relative[a[0].type],g=f||t.relative[" "],h=f?1:0,k=i(function(a){return a===b},g,!0),n=i(function(a){return M.call(b,a)>-1},g,!0),o=[function(a,c,d){return!f&&(d||c!==A)||((b=c).nodeType?k(a,c,d):n(a,c,d))}];e>h;h++)if(c=t.relative[a[h].type])o=[i(j(o),c)];else{if(c=t.filter[a[h].type].apply(null,a[h].matches),c[D]){for(d=++h;e>d&&!t.relative[a[d].type];d++);return l(h>1&&j(o),h>1&&a.slice(0,h-1).join("").replace(Z,"$1"),c,d>h&&m(a.slice(h,d)),e>d&&m(a=a.slice(d)),e>d&&a.join(""))}o.push(c)}return j(o)}function n(a,b){var d=b.length>0,e=a.length>0,f=function(g,h,i,j,l){var m,n,o,p=[],q=0,s="0",u=g&&[],v=null!=l,w=A,x=g||e&&t.find.TAG("*",l&&h.parentNode||h),y=H+=null==w?1:Math.E;for(v&&(A=h!==F&&h,r=f.el);null!=(m=x[s]);s++){if(e&&m){for(n=0;o=a[n];n++)if(o(m,h,i)){j.push(m);break}v&&(H=y,r=++f.el)}d&&((m=!o&&m)&&q--,g&&u.push(m))}if(q+=s,d&&s!==q){for(n=0;o=b[n];n++)o(u,p,h,i);if(g){if(q>0)for(;s--;)!u[s]&&!p[s]&&(p[s]=J.call(j));p=k(p)}K.apply(j,p),v&&!g&&p.length>0&&q+b.length>1&&c.uniqueSort(j)}return v&&(H=y,A=w),u};return f.el=0,d?N(f):f}function o(a,b,d,e){for(var f=0,g=b.length;g>f;f++)c(a,b[f],d,e);return d}function p(a,b,c,d,e){{var f,g,i,j,k,l=h(a);l.length}if(!d&&1===l.length){if(g=l[0]=l[0].slice(0),g.length>2&&"ID"===(i=g[0]).type&&9===b.nodeType&&!e&&t.relative[g[1].type]){if(b=t.find.ID(i.matches[0].replace(gb,""),b,e)[0],!b)return c;a=a.slice(g.shift().length)}for(f=hb.POS.test(a)?-1:g.length-1;f>=0&&(i=g[f],!t.relative[j=i.type]);f--)if((k=t.find[j])&&(d=k(i.matches[0].replace(gb,""),db.test(g[0].type)&&b.parentNode||b,e))){if(g.splice(f,1),a=d.length&&g.join(""),!a)return K.apply(c,L.call(d,0)),c;break}}return x(a,l)(d,b,e,c,db.test(a)),c}function q(){}var r,s,t,u,v,w,x,y,z,A,B=!0,C="undefined",D=("sizcache"+Math.random()).replace(".",""),E=String,F=a.document,G=F.documentElement,H=0,I=0,J=[].pop,K=[].push,L=[].slice,M=[].indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},N=function(a,b){return a[D]=null==b||b,a},O=function(){var a={},b=[];return N(function(c,d){return b.push(c)>t.cacheLength&&delete a[b.shift()],a[c]=d},a)},P=O(),Q=O(),R=O(),S="[\\x20\\t\\r\\n\\f]",T="(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+",U=T.replace("w","w#"),V="([*^$|!~]?=)",W="\\["+S+"*("+T+")"+S+"*(?:"+V+S+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+U+")|)|)"+S+"*\\]",X=":("+T+")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:"+W+")|[^:]|\\\\.)*|.*))\\)|)",Y=":(even|odd|eq|gt|lt|nth|first|last)(?:\\("+S+"*((?:-\\d)?\\d*)"+S+"*\\)|)(?=[^-]|$)",Z=new RegExp("^"+S+"+|((?:^|[^\\\\])(?:\\\\.)*)"+S+"+$","g"),_=new RegExp("^"+S+"*,"+S+"*"),ab=new RegExp("^"+S+"*([\\x20\\t\\r\\n\\f>+~])"+S+"*"),bb=new RegExp(X),cb=/^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,db=/[\x20\t\r\n\f]*[+~]/,eb=/h\d/i,fb=/input|select|textarea|button/i,gb=/\\(?!\\)/g,hb={ID:new RegExp("^#("+T+")"),CLASS:new RegExp("^\\.("+T+")"),NAME:new RegExp("^\\[name=['\"]?("+T+")['\"]?\\]"),TAG:new RegExp("^("+T.replace("w","w*")+")"),ATTR:new RegExp("^"+W),PSEUDO:new RegExp("^"+X),POS:new RegExp(Y,"i"),CHILD:new RegExp("^:(only|nth|first|last)-child(?:\\("+S+"*(even|odd|(([+-]|)(\\d*)n|)"+S+"*(?:([+-]|)"+S+"*(\\d+)|))"+S+"*\\)|)","i"),needsContext:new RegExp("^"+S+"*[>+~]|"+Y,"i")},ib=function(a){var b=F.createElement("div");try{return a(b)}catch(c){return!1}finally{b=null}},jb=ib(function(a){return a.appendChild(F.createComment("")),!a.getElementsByTagName("*").length}),kb=ib(function(a){return a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!==C&&"#"===a.firstChild.getAttribute("href")}),lb=ib(function(a){a.innerHTML="<select></select>";var b=typeof a.lastChild.getAttribute("multiple");return"boolean"!==b&&"string"!==b}),mb=ib(function(a){return a.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",a.getElementsByClassName&&a.getElementsByClassName("e").length?(a.lastChild.className="e",2===a.getElementsByClassName("e").length):!1}),nb=ib(function(a){a.id=D+0,a.innerHTML="<a name='"+D+"'></a><div name='"+D+"'></div>",G.insertBefore(a,G.firstChild);var b=F.getElementsByName&&F.getElementsByName(D).length===2+F.getElementsByName(D+0).length;return s=!F.getElementById(D),G.removeChild(a),b});try{L.call(G.childNodes,0)[0].nodeType}catch(ob){L=function(a){for(var b,c=[];b=this[a];a++)c.push(b);return c}}c.matches=function(a,b){return c(a,null,null,b)},c.matchesSelector=function(a,b){return c(b,null,null,[a]).length>0},u=c.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(1===e||9===e||11===e){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=u(a)}else if(3===e||4===e)return a.nodeValue}else for(;b=a[d];d++)c+=u(b);return c},v=c.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},w=c.contains=G.contains?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!!(d&&1===d.nodeType&&c.contains&&c.contains(d))}:G.compareDocumentPosition?function(a,b){return b&&!!(16&a.compareDocumentPosition(b))}:function(a,b){for(;b=b.parentNode;)if(b===a)return!0;return!1},c.attr=function(a,b){var c,d=v(a);return d||(b=b.toLowerCase()),(c=t.attrHandle[b])?c(a):d||lb?a.getAttribute(b):(c=a.getAttributeNode(b),c?"boolean"==typeof a[b]?a[b]?b:null:c.specified?c.value:null:null)},t=c.selectors={cacheLength:50,createPseudo:N,match:hb,attrHandle:kb?{}:{href:function(a){return a.getAttribute("href",2)},type:function(a){return a.getAttribute("type")}},find:{ID:s?function(a,b,c){if(typeof b.getElementById!==C&&!c){var d=b.getElementById(a);
    return d&&d.parentNode?[d]:[]}}:function(a,c,d){if(typeof c.getElementById!==C&&!d){var e=c.getElementById(a);return e?e.id===a||typeof e.getAttributeNode!==C&&e.getAttributeNode("id").value===a?[e]:b:[]}},TAG:jb?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c=b.getElementsByTagName(a);if("*"===a){for(var d,e=[],f=0;d=c[f];f++)1===d.nodeType&&e.push(d);return e}return c},NAME:nb&&function(a,b){return typeof b.getElementsByName!==C?b.getElementsByName(name):void 0},CLASS:mb&&function(a,b,c){return typeof b.getElementsByClassName===C||c?void 0:b.getElementsByClassName(a)}},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(gb,""),a[3]=(a[4]||a[5]||"").replace(gb,""),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1]?(a[2]||c.error(a[0]),a[3]=+(a[3]?a[4]+(a[5]||1):2*("even"===a[2]||"odd"===a[2])),a[4]=+(a[6]+a[7]||"odd"===a[2])):a[2]&&c.error(a[0]),a},PSEUDO:function(a){var b,c;return hb.CHILD.test(a[0])?null:(a[3]?a[2]=a[3]:(b=a[4])&&(bb.test(b)&&(c=h(b,!0))&&(c=b.indexOf(")",b.length-c)-b.length)&&(b=b.slice(0,c),a[0]=a[0].slice(0,c)),a[2]=b),a.slice(0,3))}},filter:{ID:s?function(a){return a=a.replace(gb,""),function(b){return b.getAttribute("id")===a}}:function(a){return a=a.replace(gb,""),function(b){var c=typeof b.getAttributeNode!==C&&b.getAttributeNode("id");return c&&c.value===a}},TAG:function(a){return"*"===a?function(){return!0}:(a=a.replace(gb,"").toLowerCase(),function(b){return b.nodeName&&b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=P[D][a];return b||(b=P(a,new RegExp("(^|"+S+")"+a+"("+S+"|$)"))),function(a){return b.test(a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")}},ATTR:function(a,b,d){return function(e){var f=c.attr(e,a);return null==f?"!="===b:b?(f+="","="===b?f===d:"!="===b?f!==d:"^="===b?d&&0===f.indexOf(d):"*="===b?d&&f.indexOf(d)>-1:"$="===b?d&&f.substr(f.length-d.length)===d:"~="===b?(" "+f+" ").indexOf(d)>-1:"|="===b?f===d||f.substr(0,d.length+1)===d+"-":!1):!0}},CHILD:function(a,b,c,d){return"nth"===a?function(a){var b,e,f=a.parentNode;if(1===c&&0===d)return!0;if(f)for(e=0,b=f.firstChild;b&&(1!==b.nodeType||(e++,a!==b));b=b.nextSibling);return e-=d,e===c||e%c===0&&e/c>=0}:function(b){var c=b;switch(a){case"only":case"first":for(;c=c.previousSibling;)if(1===c.nodeType)return!1;if("first"===a)return!0;c=b;case"last":for(;c=c.nextSibling;)if(1===c.nodeType)return!1;return!0}}},PSEUDO:function(a,b){var d,e=t.pseudos[a]||t.setFilters[a.toLowerCase()]||c.error("unsupported pseudo: "+a);return e[D]?e(b):e.length>1?(d=[a,a,"",b],t.setFilters.hasOwnProperty(a.toLowerCase())?N(function(a,c){for(var d,f=e(a,b),g=f.length;g--;)d=M.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,d)}):e}},pseudos:{not:N(function(a){var b=[],c=[],d=x(a.replace(Z,"$1"));return d[D]?N(function(a,b,c,e){for(var f,g=d(a,null,e,[]),h=a.length;h--;)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:N(function(a){return function(b){return c(a,b).length>0}}),contains:N(function(a){return function(b){return(b.textContent||b.innerText||u(b)).indexOf(a)>-1}}),enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},parent:function(a){return!t.pseudos.empty(a)},empty:function(a){var b;for(a=a.firstChild;a;){if(a.nodeName>"@"||3===(b=a.nodeType)||4===b)return!1;a=a.nextSibling}return!0},header:function(a){return eb.test(a.nodeName)},text:function(a){var b,c;return"input"===a.nodeName.toLowerCase()&&"text"===(b=a.type)&&(null==(c=a.getAttribute("type"))||c.toLowerCase()===b)},radio:d("radio"),checkbox:d("checkbox"),file:d("file"),password:d("password"),image:d("image"),submit:e("submit"),reset:e("reset"),button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},input:function(a){return fb.test(a.nodeName)},focus:function(a){var b=a.ownerDocument;return!(a!==b.activeElement||b.hasFocus&&!b.hasFocus()||!a.type&&!a.href)},active:function(a){return a===a.ownerDocument.activeElement},first:f(function(){return[0]}),last:f(function(a,b){return[b-1]}),eq:f(function(a,b,c){return[0>c?c+b:c]}),even:f(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:f(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:f(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:f(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},y=G.compareDocumentPosition?function(a,b){return a===b?(z=!0,0):(a.compareDocumentPosition&&b.compareDocumentPosition?4&a.compareDocumentPosition(b):a.compareDocumentPosition)?-1:1}:function(a,b){if(a===b)return z=!0,0;if(a.sourceIndex&&b.sourceIndex)return a.sourceIndex-b.sourceIndex;var c,d,e=[],f=[],h=a.parentNode,i=b.parentNode,j=h;if(h===i)return g(a,b);if(!h)return-1;if(!i)return 1;for(;j;)e.unshift(j),j=j.parentNode;for(j=i;j;)f.unshift(j),j=j.parentNode;c=e.length,d=f.length;for(var k=0;c>k&&d>k;k++)if(e[k]!==f[k])return g(e[k],f[k]);return k===c?g(a,f[k],-1):g(e[k],b,1)},[0,0].sort(y),B=!z,c.uniqueSort=function(a){var b,c=1;if(z=B,a.sort(y),z)for(;b=a[c];c++)b===a[c-1]&&a.splice(c--,1);return a},c.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},x=c.compile=function(a,b){var c,d=[],e=[],f=R[D][a];if(!f){for(b||(b=h(a)),c=b.length;c--;)f=m(b[c]),f[D]?d.push(f):e.push(f);f=R(a,n(e,d))}return f},F.querySelectorAll&&function(){var a,b=p,d=/'|\\/g,e=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,f=[":focus"],g=[":active",":focus"],i=G.matchesSelector||G.mozMatchesSelector||G.webkitMatchesSelector||G.oMatchesSelector||G.msMatchesSelector;ib(function(a){a.innerHTML="<select><option selected=''></option></select>",a.querySelectorAll("[selected]").length||f.push("\\["+S+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),a.querySelectorAll(":checked").length||f.push(":checked")}),ib(function(a){a.innerHTML="<p test=''></p>",a.querySelectorAll("[test^='']").length&&f.push("[*^$]="+S+"*(?:\"\"|'')"),a.innerHTML="<input type='hidden'/>",a.querySelectorAll(":enabled").length||f.push(":enabled",":disabled")}),f=new RegExp(f.join("|")),p=function(a,c,e,g,i){if(!(g||i||f&&f.test(a))){var j,k,l=!0,m=D,n=c,o=9===c.nodeType&&a;if(1===c.nodeType&&"object"!==c.nodeName.toLowerCase()){for(j=h(a),(l=c.getAttribute("id"))?m=l.replace(d,"\\$&"):c.setAttribute("id",m),m="[id='"+m+"'] ",k=j.length;k--;)j[k]=m+j[k].join("");n=db.test(a)&&c.parentNode||c,o=j.join(",")}if(o)try{return K.apply(e,L.call(n.querySelectorAll(o),0)),e}catch(p){}finally{l||c.removeAttribute("id")}}return b(a,c,e,g,i)},i&&(ib(function(b){a=i.call(b,"div");try{i.call(b,"[test!='']:sizzle"),g.push("!=",X)}catch(c){}}),g=new RegExp(g.join("|")),c.matchesSelector=function(b,d){if(d=d.replace(e,"='$1']"),!(v(b)||g.test(d)||f&&f.test(d)))try{var h=i.call(b,d);if(h||a||b.document&&11!==b.document.nodeType)return h}catch(j){}return c(d,null,null,[b]).length>0})}(),t.pseudos.nth=t.pseudos.eq,t.filters=q.prototype=t.pseudos,t.setFilters=new q,c.attr=$.attr,$.find=c,$.expr=c.selectors,$.expr[":"]=$.expr.pseudos,$.unique=c.uniqueSort,$.text=c.getText,$.isXMLDoc=c.isXML,$.contains=c.contains}(a);var Ib=/Until$/,Jb=/^(?:parents|prev(?:Until|All))/,Kb=/^.[^:#\[\.,]*$/,Lb=$.expr.match.needsContext,Mb={children:!0,contents:!0,next:!0,prev:!0};$.fn.extend({find:function(a){var b,c,d,e,f,g,h=this;if("string"!=typeof a)return $(a).filter(function(){for(b=0,c=h.length;c>b;b++)if($.contains(h[b],this))return!0});for(g=this.pushStack("","find",a),b=0,c=this.length;c>b;b++)if(d=g.length,$.find(a,this[b],g),b>0)for(e=d;e<g.length;e++)for(f=0;d>f;f++)if(g[f]===g[e]){g.splice(e--,1);break}return g},has:function(a){var b,c=$(a,this),d=c.length;return this.filter(function(){for(b=0;d>b;b++)if($.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(j(this,a,!1),"not",a)},filter:function(a){return this.pushStack(j(this,a,!0),"filter",a)},is:function(a){return!!a&&("string"==typeof a?Lb.test(a)?$(a,this.context).index(this[0])>=0:$.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=Lb.test(a)||"string"!=typeof a?$(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c.ownerDocument&&c!==b&&11!==c.nodeType;){if(g?g.index(c)>-1:$.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}return f=f.length>1?$.unique(f):f,this.pushStack(f,"closest",a)},index:function(a){return a?"string"==typeof a?$.inArray(this[0],$(a)):$.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.prevAll().length:-1},add:function(a,b){var c="string"==typeof a?$(a,b):$.makeArray(a&&a.nodeType?[a]:a),d=$.merge(this.get(),c);return this.pushStack(h(c[0])||h(d[0])?d:$.unique(d))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}}),$.fn.andSelf=$.fn.addBack,$.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return $.dir(a,"parentNode")},parentsUntil:function(a,b,c){return $.dir(a,"parentNode",c)},next:function(a){return i(a,"nextSibling")},prev:function(a){return i(a,"previousSibling")},nextAll:function(a){return $.dir(a,"nextSibling")},prevAll:function(a){return $.dir(a,"previousSibling")},nextUntil:function(a,b,c){return $.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return $.dir(a,"previousSibling",c)},siblings:function(a){return $.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return $.sibling(a.firstChild)},contents:function(a){return $.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:$.merge([],a.childNodes)}},function(a,b){$.fn[a]=function(c,d){var e=$.map(this,b,c);return Ib.test(a)||(d=c),d&&"string"==typeof d&&(e=$.filter(d,e)),e=this.length>1&&!Mb[a]?$.unique(e):e,this.length>1&&Jb.test(a)&&(e=e.reverse()),this.pushStack(e,a,V.call(arguments).join(","))}}),$.extend({filter:function(a,b,c){return c&&(a=":not("+a+")"),1===b.length?$.find.matchesSelector(b[0],a)?[b[0]]:[]:$.find.matches(a,b)},dir:function(a,c,d){for(var e=[],f=a[c];f&&9!==f.nodeType&&(d===b||1!==f.nodeType||!$(f).is(d));)1===f.nodeType&&e.push(f),f=f[c];return e},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}});var Nb="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",Ob=/ jQuery\d+="(?:null|\d+)"/g,Pb=/^\s+/,Qb=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,Rb=/<([\w:]+)/,Sb=/<tbody/i,Tb=/<|&#?\w+;/,Ub=/<(?:script|style|link)/i,Vb=/<(?:script|object|embed|option|style)/i,Wb=new RegExp("<(?:"+Nb+")[\\s/>]","i"),Xb=/^(?:checkbox|radio)$/,Yb=/checked\s*(?:[^=]|=\s*.checked.)/i,Zb=/\/(java|ecma)script/i,$b=/^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,_b={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],area:[1,"<map>","</map>"],_default:[0,"",""]},ac=k(P),bc=ac.appendChild(P.createElement("div"));_b.optgroup=_b.option,_b.tbody=_b.tfoot=_b.colgroup=_b.caption=_b.thead,_b.th=_b.td,$.support.htmlSerialize||(_b._default=[1,"X<div>","</div>"]),$.fn.extend({text:function(a){return $.access(this,function(a){return a===b?$.text(this):this.empty().append((this[0]&&this[0].ownerDocument||P).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if($.isFunction(a))return this.each(function(b){$(this).wrapAll(a.call(this,b))});if(this[0]){var b=$(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){for(var a=this;a.firstChild&&1===a.firstChild.nodeType;)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return this.each($.isFunction(a)?function(b){$(this).wrapInner(a.call(this,b))}:function(){var b=$(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=$.isFunction(a);return this.each(function(c){$(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){$.nodeName(this,"body")||$(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){(1===this.nodeType||11===this.nodeType)&&this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){(1===this.nodeType||11===this.nodeType)&&this.insertBefore(a,this.firstChild)})},before:function(){if(!h(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this)});if(arguments.length){var a=$.clean(arguments);return this.pushStack($.merge(a,this),"before",this.selector)}},after:function(){if(!h(this[0]))return this.domManip(arguments,!1,function(a){this.parentNode.insertBefore(a,this.nextSibling)});if(arguments.length){var a=$.clean(arguments);return this.pushStack($.merge(this,a),"after",this.selector)}},remove:function(a,b){for(var c,d=0;null!=(c=this[d]);d++)(!a||$.filter(a,[c]).length)&&(!b&&1===c.nodeType&&($.cleanData(c.getElementsByTagName("*")),$.cleanData([c])),c.parentNode&&c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)for(1===a.nodeType&&$.cleanData(a.getElementsByTagName("*"));a.firstChild;)a.removeChild(a.firstChild);return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return $.clone(this,a,b)})},html:function(a){return $.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return 1===c.nodeType?c.innerHTML.replace(Ob,""):b;if(!("string"!=typeof a||Ub.test(a)||!$.support.htmlSerialize&&Wb.test(a)||!$.support.leadingWhitespace&&Pb.test(a)||_b[(Rb.exec(a)||["",""])[1].toLowerCase()])){a=a.replace(Qb,"<$1></$2>");try{for(;e>d;d++)c=this[d]||{},1===c.nodeType&&($.cleanData(c.getElementsByTagName("*")),c.innerHTML=a);c=0}catch(f){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){return h(this[0])?this.length?this.pushStack($($.isFunction(a)?a():a),"replaceWith",a):this:$.isFunction(a)?this.each(function(b){var c=$(this),d=c.html();c.replaceWith(a.call(this,b,d))}):("string"!=typeof a&&(a=$(a).detach()),this.each(function(){var b=this.nextSibling,c=this.parentNode;$(this).remove(),b?$(b).before(a):$(c).append(a)}))},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=[].concat.apply([],a);var e,f,g,h,i=0,j=a[0],k=[],m=this.length;if(!$.support.checkClone&&m>1&&"string"==typeof j&&Yb.test(j))return this.each(function(){$(this).domManip(a,c,d)});if($.isFunction(j))return this.each(function(e){var f=$(this);a[0]=j.call(this,e,c?f.html():b),f.domManip(a,c,d)});if(this[0]){if(e=$.buildFragment(a,this,k),g=e.fragment,f=g.firstChild,1===g.childNodes.length&&(g=f),f)for(c=c&&$.nodeName(f,"tr"),h=e.cacheable||m-1;m>i;i++)d.call(c&&$.nodeName(this[i],"table")?l(this[i],"tbody"):this[i],i===h?g:$.clone(g,!0,!0));g=f=null,k.length&&$.each(k,function(a,b){b.src?$.ajax?$.ajax({url:b.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):$.error("no ajax"):$.globalEval((b.text||b.textContent||b.innerHTML||"").replace($b,"")),b.parentNode&&b.parentNode.removeChild(b)})}return this}}),$.buildFragment=function(a,c,d){var e,f,g,h=a[0];return c=c||P,c=!c.nodeType&&c[0]||c,c=c.ownerDocument||c,1===a.length&&"string"==typeof h&&h.length<512&&c===P&&"<"===h.charAt(0)&&!Vb.test(h)&&($.support.checkClone||!Yb.test(h))&&($.support.html5Clone||!Wb.test(h))&&(f=!0,e=$.fragments[h],g=e!==b),e||(e=c.createDocumentFragment(),$.clean(a,c,e,d),f&&($.fragments[h]=g&&e)),{fragment:e,cacheable:f}},$.fragments={},$.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){$.fn[a]=function(c){var d,e=0,f=[],g=$(c),h=g.length,i=1===this.length&&this[0].parentNode;if((null==i||i&&11===i.nodeType&&1===i.childNodes.length)&&1===h)return g[b](this[0]),this;for(;h>e;e++)d=(e>0?this.clone(!0):this).get(),$(g[e])[b](d),f=f.concat(d);return this.pushStack(f,a,g.selector)}}),$.extend({clone:function(a,b,c){var d,e,f,g;if($.support.html5Clone||$.isXMLDoc(a)||!Wb.test("<"+a.nodeName+">")?g=a.cloneNode(!0):(bc.innerHTML=a.outerHTML,bc.removeChild(g=bc.firstChild)),!($.support.noCloneEvent&&$.support.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||$.isXMLDoc(a)))for(n(a,g),d=o(a),e=o(g),f=0;d[f];++f)e[f]&&n(d[f],e[f]);if(b&&(m(a,g),c))for(d=o(a),e=o(g),f=0;d[f];++f)m(d[f],e[f]);return d=e=null,g},clean:function(a,b,c,d){var e,f,g,h,i,j,l,m,n,o,q,r=b===P&&ac,s=[];for(b&&"undefined"!=typeof b.createDocumentFragment||(b=P),e=0;null!=(g=a[e]);e++)if("number"==typeof g&&(g+=""),g){if("string"==typeof g)if(Tb.test(g)){for(r=r||k(b),l=b.createElement("div"),r.appendChild(l),g=g.replace(Qb,"<$1></$2>"),h=(Rb.exec(g)||["",""])[1].toLowerCase(),i=_b[h]||_b._default,j=i[0],l.innerHTML=i[1]+g+i[2];j--;)l=l.lastChild;if(!$.support.tbody)for(m=Sb.test(g),n="table"!==h||m?"<table>"!==i[1]||m?[]:l.childNodes:l.firstChild&&l.firstChild.childNodes,f=n.length-1;f>=0;--f)$.nodeName(n[f],"tbody")&&!n[f].childNodes.length&&n[f].parentNode.removeChild(n[f]);!$.support.leadingWhitespace&&Pb.test(g)&&l.insertBefore(b.createTextNode(Pb.exec(g)[0]),l.firstChild),g=l.childNodes,l.parentNode.removeChild(l)}else g=b.createTextNode(g);g.nodeType?s.push(g):$.merge(s,g)}if(l&&(g=l=r=null),!$.support.appendChecked)for(e=0;null!=(g=s[e]);e++)$.nodeName(g,"input")?p(g):"undefined"!=typeof g.getElementsByTagName&&$.grep(g.getElementsByTagName("input"),p);if(c)for(o=function(a){return!a.type||Zb.test(a.type)?d?d.push(a.parentNode?a.parentNode.removeChild(a):a):c.appendChild(a):void 0},e=0;null!=(g=s[e]);e++)$.nodeName(g,"script")&&o(g)||(c.appendChild(g),"undefined"!=typeof g.getElementsByTagName&&(q=$.grep($.merge([],g.getElementsByTagName("script")),o),s.splice.apply(s,[e+1,0].concat(q)),e+=q.length));return s},cleanData:function(a,b){for(var c,d,e,f,g=0,h=$.expando,i=$.cache,j=$.support.deleteExpando,k=$.event.special;null!=(e=a[g]);g++)if((b||$.acceptData(e))&&(d=e[h],c=d&&i[d])){if(c.events)for(f in c.events)k[f]?$.event.remove(e,f):$.removeEvent(e,f,c.handle);i[d]&&(delete i[d],j?delete e[h]:e.removeAttribute?e.removeAttribute(h):e[h]=null,$.deletedIds.push(d))}}}),function(){var a,b;$.uaMatch=function(a){a=a.toLowerCase();var b=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||a.indexOf("compatible")<0&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||[];return{browser:b[1]||"",version:b[2]||"0"}},a=$.uaMatch(R.userAgent),b={},a.browser&&(b[a.browser]=!0,b.version=a.version),b.chrome?b.webkit=!0:b.webkit&&(b.safari=!0),$.browser=b,$.sub=function(){function a(b,c){return new a.fn.init(b,c)}$.extend(!0,a,this),a.superclass=this,a.fn=a.prototype=this(),a.fn.constructor=a,a.sub=this.sub,a.fn.init=function c(c,d){return d&&d instanceof $&&!(d instanceof a)&&(d=a(d)),$.fn.init.call(this,c,d,b)},a.fn.init.prototype=a.fn;var b=a(P);return a}}();var cc,dc,ec,fc=/alpha\([^)]*\)/i,gc=/opacity=([^)]*)/,hc=/^(top|right|bottom|left)$/,ic=/^(none|table(?!-c[ea]).+)/,jc=/^margin/,kc=new RegExp("^("+_+")(.*)$","i"),lc=new RegExp("^("+_+")(?!px)[a-z%]+$","i"),mc=new RegExp("^([-+])=("+_+")","i"),nc={},oc={position:"absolute",visibility:"hidden",display:"block"},pc={letterSpacing:0,fontWeight:400},qc=["Top","Right","Bottom","Left"],rc=["Webkit","O","Moz","ms"],sc=$.fn.toggle;$.fn.extend({css:function(a,c){return $.access(this,function(a,c,d){return d!==b?$.style(a,c,d):$.css(a,c)},a,c,arguments.length>1)},show:function(){return s(this,!0)},hide:function(){return s(this)},toggle:function(a,b){var c="boolean"==typeof a;return $.isFunction(a)&&$.isFunction(b)?sc.apply(this,arguments):this.each(function(){(c?a:r(this))?$(this).show():$(this).hide()})}}),$.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=cc(a,"opacity");return""===c?"1":c}}}},cssNumber:{fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":$.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var f,g,h,i=$.camelCase(c),j=a.style;if(c=$.cssProps[i]||($.cssProps[i]=q(j,i)),h=$.cssHooks[c]||$.cssHooks[i],d===b)return h&&"get"in h&&(f=h.get(a,!1,e))!==b?f:j[c];if(g=typeof d,"string"===g&&(f=mc.exec(d))&&(d=(f[1]+1)*f[2]+parseFloat($.css(a,c)),g="number"),!(null==d||"number"===g&&isNaN(d)||("number"===g&&!$.cssNumber[i]&&(d+="px"),h&&"set"in h&&(d=h.set(a,d,e))===b)))try{j[c]=d}catch(k){}}},css:function(a,c,d,e){var f,g,h,i=$.camelCase(c);return c=$.cssProps[i]||($.cssProps[i]=q(a.style,i)),h=$.cssHooks[c]||$.cssHooks[i],h&&"get"in h&&(f=h.get(a,!0,e)),f===b&&(f=cc(a,c)),"normal"===f&&c in pc&&(f=pc[c]),d||e!==b?(g=parseFloat(f),d||$.isNumeric(g)?g||0:f):f},swap:function(a,b,c){var d,e,f={};for(e in b)f[e]=a.style[e],a.style[e]=b[e];d=c.call(a);for(e in b)a.style[e]=f[e];return d}}),a.getComputedStyle?cc=function(b,c){var d,e,f,g,h=a.getComputedStyle(b,null),i=b.style;return h&&(d=h[c],""===d&&!$.contains(b.ownerDocument,b)&&(d=$.style(b,c)),lc.test(d)&&jc.test(c)&&(e=i.width,f=i.minWidth,g=i.maxWidth,i.minWidth=i.maxWidth=i.width=d,d=h.width,i.width=e,i.minWidth=f,i.maxWidth=g)),d}:P.documentElement.currentStyle&&(cc=function(a,b){var c,d,e=a.currentStyle&&a.currentStyle[b],f=a.style;return null==e&&f&&f[b]&&(e=f[b]),lc.test(e)&&!hc.test(b)&&(c=f.left,d=a.runtimeStyle&&a.runtimeStyle.left,d&&(a.runtimeStyle.left=a.currentStyle.left),f.left="fontSize"===b?"1em":e,e=f.pixelLeft+"px",f.left=c,d&&(a.runtimeStyle.left=d)),""===e?"auto":e}),$.each(["height","width"],function(a,b){$.cssHooks[b]={get:function(a,c,d){return c?0===a.offsetWidth&&ic.test(cc(a,"display"))?$.swap(a,oc,function(){return v(a,b,d)}):v(a,b,d):void 0},set:function(a,c,d){return t(a,c,d?u(a,b,d,$.support.boxSizing&&"border-box"===$.css(a,"boxSizing")):0)}}}),$.support.opacity||($.cssHooks.opacity={get:function(a,b){return gc.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=$.isNumeric(b)?"alpha(opacity="+100*b+")":"",f=d&&d.filter||c.filter||"";c.zoom=1,b>=1&&""===$.trim(f.replace(fc,""))&&c.removeAttribute&&(c.removeAttribute("filter"),d&&!d.filter)||(c.filter=fc.test(f)?f.replace(fc,e):f+" "+e)}}),$(function(){$.support.reliableMarginRight||($.cssHooks.marginRight={get:function(a,b){return $.swap(a,{display:"inline-block"},function(){return b?cc(a,"marginRight"):void 0})}}),!$.support.pixelPosition&&$.fn.position&&$.each(["top","left"],function(a,b){$.cssHooks[b]={get:function(a,c){if(c){var d=cc(a,b);return lc.test(d)?$(a).position()[b]+"px":d}}}})}),$.expr&&$.expr.filters&&($.expr.filters.hidden=function(a){return 0===a.offsetWidth&&0===a.offsetHeight||!$.support.reliableHiddenOffsets&&"none"===(a.style&&a.style.display||cc(a,"display"))},$.expr.filters.visible=function(a){return!$.expr.filters.hidden(a)}),$.each({margin:"",padding:"",border:"Width"},function(a,b){$.cssHooks[a+b]={expand:function(c){var d,e="string"==typeof c?c.split(" "):[c],f={};for(d=0;4>d;d++)f[a+qc[d]+b]=e[d]||e[d-2]||e[0];return f}},jc.test(a)||($.cssHooks[a+b].set=t)});var tc=/%20/g,uc=/\[\]$/,vc=/\r?\n/g,wc=/^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,xc=/^(?:select|textarea)/i;$.fn.extend({serialize:function(){return $.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?$.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||xc.test(this.nodeName)||wc.test(this.type))}).map(function(a,b){var c=$(this).val();return null==c?null:$.isArray(c)?$.map(c,function(a){return{name:b.name,value:a.replace(vc,"\r\n")}}):{name:b.name,value:c.replace(vc,"\r\n")}}).get()}}),$.param=function(a,c){var d,e=[],f=function(a,b){b=$.isFunction(b)?b():null==b?"":b,e[e.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(c===b&&(c=$.ajaxSettings&&$.ajaxSettings.traditional),$.isArray(a)||a.jquery&&!$.isPlainObject(a))$.each(a,function(){f(this.name,this.value)});else for(d in a)x(d,a[d],c,f);return e.join("&").replace(tc,"+")};var yc,zc,Ac=/#.*$/,Bc=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Cc=/^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,Dc=/^(?:GET|HEAD)$/,Ec=/^\/\//,Fc=/\?/,Gc=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,Hc=/([?&])_=[^&]*/,Ic=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,Jc=$.fn.load,Kc={},Lc={},Mc=["*/"]+["*"];try{zc=Q.href}catch(Nc){zc=P.createElement("a"),zc.href="",zc=zc.href}yc=Ic.exec(zc.toLowerCase())||[],$.fn.load=function(a,c,d){if("string"!=typeof a&&Jc)return Jc.apply(this,arguments);if(!this.length)return this;var e,f,g,h=this,i=a.indexOf(" ");return i>=0&&(e=a.slice(i,a.length),a=a.slice(0,i)),$.isFunction(c)?(d=c,c=b):c&&"object"==typeof c&&(f="POST"),$.ajax({url:a,type:f,dataType:"html",data:c,complete:function(a,b){d&&h.each(d,g||[a.responseText,b,a])}}).done(function(a){g=arguments,h.html(e?$("<div>").append(a.replace(Gc,"")).find(e):a)}),this},$.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "),function(a,b){$.fn[b]=function(a){return this.on(b,a)}}),$.each(["get","post"],function(a,c){$[c]=function(a,d,e,f){return $.isFunction(d)&&(f=f||e,e=d,d=b),$.ajax({type:c,url:a,data:d,success:e,dataType:f})}}),$.extend({getScript:function(a,c){return $.get(a,b,c,"script")},getJSON:function(a,b,c){return $.get(a,b,c,"json")},ajaxSetup:function(a,b){return b?A(a,$.ajaxSettings):(b=a,a=$.ajaxSettings),A(a,b),a},ajaxSettings:{url:zc,isLocal:Cc.test(yc[1]),global:!0,type:"GET",contentType:"application/x-www-form-urlencoded; charset=UTF-8",processData:!0,async:!0,accepts:{xml:"application/xml, text/xml",html:"text/html",text:"text/plain",json:"application/json, text/javascript","*":Mc},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":$.parseJSON,"text xml":$.parseXML},flatOptions:{context:!0,url:!0}},ajaxPrefilter:y(Kc),ajaxTransport:y(Lc),ajax:function(a,c){function d(a,c,d,g){var j,l,s,t,v,x=c;2!==u&&(u=2,i&&clearTimeout(i),h=b,f=g||"",w.readyState=a>0?4:0,d&&(t=B(m,w,d)),a>=200&&300>a||304===a?(m.ifModified&&(v=w.getResponseHeader("Last-Modified"),v&&($.lastModified[e]=v),v=w.getResponseHeader("Etag"),v&&($.etag[e]=v)),304===a?(x="notmodified",j=!0):(j=C(m,t),x=j.state,l=j.data,s=j.error,j=!s)):(s=x,(!x||a)&&(x="error",0>a&&(a=0))),w.status=a,w.statusText=(c||x)+"",j?p.resolveWith(n,[l,x,w]):p.rejectWith(n,[w,x,s]),w.statusCode(r),r=b,k&&o.trigger("ajax"+(j?"Success":"Error"),[w,m,j?l:s]),q.fireWith(n,[w,x]),k&&(o.trigger("ajaxComplete",[w,m]),--$.active||$.event.trigger("ajaxStop")))}"object"==typeof a&&(c=a,a=b),c=c||{};var e,f,g,h,i,j,k,l,m=$.ajaxSetup({},c),n=m.context||m,o=n!==m&&(n.nodeType||n instanceof $)?$(n):$.event,p=$.Deferred(),q=$.Callbacks("once memory"),r=m.statusCode||{},s={},t={},u=0,v="canceled",w={readyState:0,setRequestHeader:function(a,b){if(!u){var c=a.toLowerCase();a=t[c]=t[c]||a,s[a]=b}return this},getAllResponseHeaders:function(){return 2===u?f:null},getResponseHeader:function(a){var c;if(2===u){if(!g)for(g={};c=Bc.exec(f);)g[c[1].toLowerCase()]=c[2];c=g[a.toLowerCase()]}return c===b?null:c},overrideMimeType:function(a){return u||(m.mimeType=a),this},abort:function(a){return a=a||v,h&&h.abort(a),d(0,a),this}};if(p.promise(w),w.success=w.done,w.error=w.fail,w.complete=q.add,w.statusCode=function(a){if(a){var b;if(2>u)for(b in a)r[b]=[r[b],a[b]];else b=a[w.status],w.always(b)}return this},m.url=((a||m.url)+"").replace(Ac,"").replace(Ec,yc[1]+"//"),m.dataTypes=$.trim(m.dataType||"*").toLowerCase().split(bb),null==m.crossDomain&&(j=Ic.exec(m.url.toLowerCase())||!1,m.crossDomain=j&&j.join(":")+(j[3]?"":"http:"===j[1]?80:443)!==yc.join(":")+(yc[3]?"":"http:"===yc[1]?80:443)),m.data&&m.processData&&"string"!=typeof m.data&&(m.data=$.param(m.data,m.traditional)),z(Kc,m,c,w),2===u)return w;if(k=m.global,m.type=m.type.toUpperCase(),m.hasContent=!Dc.test(m.type),k&&0===$.active++&&$.event.trigger("ajaxStart"),!m.hasContent&&(m.data&&(m.url+=(Fc.test(m.url)?"&":"?")+m.data,delete m.data),e=m.url,m.cache===!1)){var x=$.now(),y=m.url.replace(Hc,"$1_="+x);m.url=y+(y===m.url?(Fc.test(m.url)?"&":"?")+"_="+x:"")}(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&w.setRequestHeader("Content-Type",m.contentType),m.ifModified&&(e=e||m.url,$.lastModified[e]&&w.setRequestHeader("If-Modified-Since",$.lastModified[e]),$.etag[e]&&w.setRequestHeader("If-None-Match",$.etag[e])),w.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+Mc+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)w.setRequestHeader(l,m.headers[l]);if(!m.beforeSend||m.beforeSend.call(n,w,m)!==!1&&2!==u){v="abort";for(l in{success:1,error:1,complete:1})w[l](m[l]);if(h=z(Lc,m,c,w)){w.readyState=1,k&&o.trigger("ajaxSend",[w,m]),m.async&&m.timeout>0&&(i=setTimeout(function(){w.abort("timeout")},m.timeout));try{u=1,h.send(s,d)}catch(A){if(!(2>u))throw A;d(-1,A)}}else d(-1,"No Transport");return w}return w.abort()},active:0,lastModified:{},etag:{}});var Oc=[],Pc=/\?/,Qc=/(=)\?(?=&|$)|\?\?/,Rc=$.now();$.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Oc.pop()||$.expando+"_"+Rc++;return this[a]=!0,a}}),$.ajaxPrefilter("json jsonp",function(c,d,e){var f,g,h,i=c.data,j=c.url,k=c.jsonp!==!1,l=k&&Qc.test(j),m=k&&!l&&"string"==typeof i&&!(c.contentType||"").indexOf("application/x-www-form-urlencoded")&&Qc.test(i);return"jsonp"===c.dataTypes[0]||l||m?(f=c.jsonpCallback=$.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,g=a[f],l?c.url=j.replace(Qc,"$1"+f):m?c.data=i.replace(Qc,"$1"+f):k&&(c.url+=(Pc.test(j)?"&":"?")+c.jsonp+"="+f),c.converters["script json"]=function(){return h||$.error(f+" was not called"),h[0]},c.dataTypes[0]="json",a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&&(c.jsonpCallback=d.jsonpCallback,Oc.push(f)),h&&$.isFunction(g)&&g(h[0]),h=g=b}),"script"):void 0}),$.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/javascript|ecmascript/},converters:{"text script":function(a){return $.globalEval(a),a}}}),$.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),$.ajaxTransport("script",function(a){if(a.crossDomain){var c,d=P.head||P.getElementsByTagName("head")[0]||P.documentElement;return{send:function(e,f){c=P.createElement("script"),c.async="async",a.scriptCharset&&(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,e){(e||!c.readyState||/loaded|complete/.test(c.readyState))&&(c.onload=c.onreadystatechange=null,d&&c.parentNode&&d.removeChild(c),c=b,e||f(200,"success"))},d.insertBefore(c,d.firstChild)},abort:function(){c&&c.onload(0,1)}}}});var Sc,Tc=a.ActiveXObject?function(){for(var a in Sc)Sc[a](0,1)}:!1,Uc=0;$.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&D()||E()}:D,function(a){$.extend($.support,{ajax:!!a,cors:!!a&&"withCredentials"in a})}($.ajaxSettings.xhr()),$.support.ajax&&$.ajaxTransport(function(c){if(!c.crossDomain||$.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();if(c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async),c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&&i.overrideMimeType&&i.overrideMimeType(c.mimeType),!c.crossDomain&&!e["X-Requested-With"]&&(e["X-Requested-With"]="XMLHttpRequest");
    try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&&c.data||null),d=function(a,e){var h,j,k,l,m;try{if(d&&(e||4===i.readyState))if(d=b,g&&(i.onreadystatechange=$.noop,Tc&&delete Sc[g]),e)4!==i.readyState&&i.abort();else{h=i.status,k=i.getAllResponseHeaders(),l={},m=i.responseXML,m&&m.documentElement&&(l.xml=m);try{l.text=i.responseText}catch(a){}try{j=i.statusText}catch(n){j=""}h||!c.isLocal||c.crossDomain?1223===h&&(h=204):h=l.text?200:404}}catch(o){e||f(-1,o)}l&&f(h,j,l,k)},c.async?4===i.readyState?setTimeout(d,0):(g=++Uc,Tc&&(Sc||(Sc={},$(a).unload(Tc)),Sc[g]=d),i.onreadystatechange=d):d()},abort:function(){d&&d(0,1)}}}});var Vc,Wc,Xc=/^(?:toggle|show|hide)$/,Yc=new RegExp("^(?:([-+])=|)("+_+")([a-z%]*)$","i"),Zc=/queueHooks$/,$c=[J],_c={"*":[function(a,b){var c,d,e=this.createTween(a,b),f=Yc.exec(b),g=e.cur(),h=+g||0,i=1,j=20;if(f){if(c=+f[2],d=f[3]||($.cssNumber[a]?"":"px"),"px"!==d&&h){h=$.css(e.elem,a,!0)||c||1;do i=i||".5",h/=i,$.style(e.elem,a,h+d);while(i!==(i=e.cur()/g)&&1!==i&&--j)}e.unit=d,e.start=h,e.end=f[1]?h+(f[1]+1)*c:c}return e}]};$.Animation=$.extend(H,{tweener:function(a,b){$.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],_c[c]=_c[c]||[],_c[c].unshift(b)},prefilter:function(a,b){b?$c.unshift(a):$c.push(a)}}),$.Tween=K,K.prototype={constructor:K,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||($.cssNumber[c]?"":"px")},cur:function(){var a=K.propHooks[this.prop];return a&&a.get?a.get(this):K.propHooks._default.get(this)},run:function(a){var b,c=K.propHooks[this.prop];return this.pos=b=this.options.duration?$.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):K.propHooks._default.set(this),this}},K.prototype.init.prototype=K.prototype,K.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=$.css(a.elem,a.prop,!1,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){$.fx.step[a.prop]?$.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[$.cssProps[a.prop]]||$.cssHooks[a.prop])?$.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},K.propHooks.scrollTop=K.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},$.each(["toggle","show","hide"],function(a,b){var c=$.fn[b];$.fn[b]=function(d,e,f){return null==d||"boolean"==typeof d||!a&&$.isFunction(d)&&$.isFunction(e)?c.apply(this,arguments):this.animate(L(b,!0),d,e,f)}}),$.fn.extend({fadeTo:function(a,b,c,d){return this.filter(r).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=$.isEmptyObject(a),f=$.speed(b,c,d),g=function(){var b=H(this,$.extend({},a),f);e&&b.stop(!0)};return e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return"string"!=typeof a&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,c=null!=a&&a+"queueHooks",f=$.timers,g=$._data(this);if(c)g[c]&&g[c].stop&&e(g[c]);else for(c in g)g[c]&&g[c].stop&&Zc.test(c)&&e(g[c]);for(c=f.length;c--;)f[c].elem===this&&(null==a||f[c].queue===a)&&(f[c].anim.stop(d),b=!1,f.splice(c,1));(b||!d)&&$.dequeue(this,a)})}}),$.each({slideDown:L("show"),slideUp:L("hide"),slideToggle:L("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){$.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),$.speed=function(a,b,c){var d=a&&"object"==typeof a?$.extend({},a):{complete:c||!c&&b||$.isFunction(a)&&a,duration:a,easing:c&&b||b&&!$.isFunction(b)&&b};return d.duration=$.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in $.fx.speeds?$.fx.speeds[d.duration]:$.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){$.isFunction(d.old)&&d.old.call(this),d.queue&&$.dequeue(this,d.queue)},d},$.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},$.timers=[],$.fx=K.prototype.init,$.fx.tick=function(){for(var a,b=$.timers,c=0;c<b.length;c++)a=b[c],!a()&&b[c]===a&&b.splice(c--,1);b.length||$.fx.stop()},$.fx.timer=function(a){a()&&$.timers.push(a)&&!Wc&&(Wc=setInterval($.fx.tick,$.fx.interval))},$.fx.interval=13,$.fx.stop=function(){clearInterval(Wc),Wc=null},$.fx.speeds={slow:600,fast:200,_default:400},$.fx.step={},$.expr&&$.expr.filters&&($.expr.filters.animated=function(a){return $.grep($.timers,function(b){return a===b.elem}).length});var ad=/^(?:body|html)$/i;$.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){$.offset.setOffset(this,a,b)});var c,d,e,f,g,h,i,j={top:0,left:0},k=this[0],l=k&&k.ownerDocument;if(l)return(d=l.body)===k?$.offset.bodyOffset(k):(c=l.documentElement,$.contains(c,k)?("undefined"!=typeof k.getBoundingClientRect&&(j=k.getBoundingClientRect()),e=M(l),f=c.clientTop||d.clientTop||0,g=c.clientLeft||d.clientLeft||0,h=e.pageYOffset||c.scrollTop,i=e.pageXOffset||c.scrollLeft,{top:j.top+h-f,left:j.left+i-g}):j)},$.offset={bodyOffset:function(a){var b=a.offsetTop,c=a.offsetLeft;return $.support.doesNotIncludeMarginInBodyOffset&&(b+=parseFloat($.css(a,"marginTop"))||0,c+=parseFloat($.css(a,"marginLeft"))||0),{top:b,left:c}},setOffset:function(a,b,c){var d=$.css(a,"position");"static"===d&&(a.style.position="relative");var e,f,g=$(a),h=g.offset(),i=$.css(a,"top"),j=$.css(a,"left"),k=("absolute"===d||"fixed"===d)&&$.inArray("auto",[i,j])>-1,l={},m={};k?(m=g.position(),e=m.top,f=m.left):(e=parseFloat(i)||0,f=parseFloat(j)||0),$.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(l.top=b.top-h.top+e),null!=b.left&&(l.left=b.left-h.left+f),"using"in b?b.using.call(a,l):g.css(l)}},$.fn.extend({position:function(){if(this[0]){var a=this[0],b=this.offsetParent(),c=this.offset(),d=ad.test(b[0].nodeName)?{top:0,left:0}:b.offset();return c.top-=parseFloat($.css(a,"marginTop"))||0,c.left-=parseFloat($.css(a,"marginLeft"))||0,d.top+=parseFloat($.css(b[0],"borderTopWidth"))||0,d.left+=parseFloat($.css(b[0],"borderLeftWidth"))||0,{top:c.top-d.top,left:c.left-d.left}}},offsetParent:function(){return this.map(function(){for(var a=this.offsetParent||P.body;a&&!ad.test(a.nodeName)&&"static"===$.css(a,"position");)a=a.offsetParent;return a||P.body})}}),$.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);$.fn[a]=function(e){return $.access(this,function(a,e,f){var g=M(a);return f===b?g?c in g?g[c]:g.document.documentElement[e]:a[e]:void(g?g.scrollTo(d?$(g).scrollLeft():f,d?f:$(g).scrollTop()):a[e]=f)},a,e,arguments.length,null)}}),$.each({Height:"height",Width:"width"},function(a,c){$.each({padding:"inner"+a,content:c,"":"outer"+a},function(d,e){$.fn[e]=function(e,f){var g=arguments.length&&(d||"boolean"!=typeof e),h=d||(e===!0||f===!0?"margin":"border");return $.access(this,function(c,d,e){var f;return $.isWindow(c)?c.document.documentElement["client"+a]:9===c.nodeType?(f=c.documentElement,Math.max(c.body["scroll"+a],f["scroll"+a],c.body["offset"+a],f["offset"+a],f["client"+a])):e===b?$.css(c,d,e,h):$.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=$,"function"==typeof define&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return $})}(window),function(a){a.ajaxthrottle=function(b){var c,d=a.extend({numRequestsPerTimePeriod:0,timePeriod:0,maxConcurrent:1},b),e=function(){return(new Date).getTime()},f=[],g=[],h=[],i=function(a){if(d.timePeriod>=0){for(;g.length>0&&g[0].time+d.timePeriod-a<=0;)g.shift();if(g.length>0)return g[0].time+d.timePeriod-a}return 0},j=function(b){a.each(f,function(a){return f[a]===b?(f.splice(a,1),!1):!0})},k=function(){var b,l,m=e();if(!(h.length<=0))return b=i(m),d.numRequestsPerTimePeriod>0&&d.timePeriod>0&&b>0&&g.length>=d.numRequestsPerTimePeriod?(void 0!==c&&clearTimeout(c),void(c=setTimeout(function(){c=void 0,k()},b))):void(d.maxConcurrent>0&&f.length>=d.maxConcurrent||(l=h.shift(),l.time=e(),g.push(l),f.push(l),a.ajax.apply(a,l.arguments).done(function(){l.deferred.resolve.apply(l.deferred,arguments)}).fail(function(){l.deferred.reject.apply(l.deferred,arguments)}).always(function(){j(l),k()})))};return{ajax:function(){var b=a.Deferred();return h.push({arguments:arguments,deferred:b}),k(),b.promise()}}}}(jQuery),function(a){var b={fullscreen:!1,scale:!1,defaultEventHandling:!0,preopen:function(){},postopen:function(){},preclose:function(){},postclose:function(){},preresize:function(){},postresize:function(){}},c={open:function(){var b,c,g=this.clone(!0),h=this.data("lightbox");h.contents=g,h.preopen.call(this),g=h.contents;var i=g.data("lightbox");if(h.overlay=a("<div/>").css({position:"fixed",left:"0px",top:"0px",height:"100%","min-height":"100%",width:"100%","z-index":"9999","background-color":"black",opacity:"0.5"}).appendTo("body"),h.box=a("<div/>").css({position:"fixed","z-index":"9999"}).appendTo("body"),h.box.append(g),h.fullscreen===!0)b=window.innerWidth,c=window.innerHeight;else if(b=g.width(),c=g.height(),h.scale===!0){var j=d(b,c);b=parseInt(b*j,10),c=parseInt(c*j,10)}return e(h.box,b,c),f(h.box,b,c),e(g,b,c),f(g,b,c),g.css("position","fixed").css("z-index",9999),h.box.append(a('<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NkY4OUE4QUE2MDEyMTFFMkFBMEM4Q0Y2RTlFNkI4QzEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NkY4OUE4QUI2MDEyMTFFMkFBMEM4Q0Y2RTlFNkI4QzEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2Rjg5QThBODYwMTIxMUUyQUEwQzhDRjZFOUU2QjhDMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2Rjg5QThBOTYwMTIxMUUyQUEwQzhDRjZFOUU2QjhDMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvXC/ukAAAcjSURBVHjaxFlpTFVXEJ7HDrIIUkCRzYitQJQK/kBTxAop2EQhaqkEqjZqK9FGa+2Cf2pabdIlEbE0FEkTArFaF6CAKCCStG5BokXAglpUIkKqgn0KyNb5jve+PB9vfyyTfIF7373nzJkzZ76ZuYqRkRGyUKwYoYwQxqsMD4aj9FsPo4Nxg1HP6LR0Mhsz37NlxDNSGLHt7e2e9+/fpwcPHtDTp0/p+fPn4iFHR0eaOnUqTZ8+nQICAsjV1bWJb5cwChiN5kysMNHCsNwHjE+uXr3qe+nSJWpsbCSlUmnUyzNmzKDw8HCKiooiX1/fGr61l1E9XgonMjLPnDnjX1NTI6xpiURGRtLSpUspJCSklC8/YvwzVgo7M7Lr6+vTzp49S9evX6exlISEBEpOTsYWfcgotFRhX0ZFeXl52JEjR2i8JDg4mJYtWwZXyeTLjxnD5ig8m1F17NixgJKSEhpvsbGxoZSUFIqNjf2VL1MZQ6Yo7M34o7CwcPapU6doImXdunUUFxf3E/+bbqzCCFm1x48fjzpx4gRNhmzYsAGWxkHM0hb0NeWrioqKKFaYsJjJwOnTp6HH94zXDSkczth59OjRSVMWYCKi3NxcO9blZ4a1PqbL5AdtwFa6ZM6cOWRvb09WVlakUChU95uamlQMpynu7u4gCvEOIEtnZyd1dHRofaeqqopmzZoVydHjfb7M1aZwDLNWdGVlpV7/6u3tpSVLlgjKtbW1Vd338vKSt/IlsbOzE8w2c+ZMcnNzU73z5MkTOnToEOkLq0xSCHdf8L+/MAY1Fd6JCYeHh/Uq3NbWRq2trbR8+XJhOdlisCDyiWvXrr30/Pz588VvgYGB5OnpSdbWL3Y4MzOT9O0k5NatW3ThwoUgXnASX/6m7sNeSGYuXrxolI9hu27fvi1cYsqUKeTs7CyUx+n28PBQPRcUFERz584VOYSPjw+SH/FsbW0tMXMaNde5c+eg33uahy6JrWszMDAgLGwM8vPz6d69e9Tf3y8GgOW8vb1py5Yt4ncoFhERIRQFkLlhgTdv3hSuYOw8V65cwfBvMVzUFY5paGgwehDg0aNHxCwo/g4ODr4I4OyfsOiKFSsE/Pz8hHVhWbgO/H///v0mzQMjstJw/DfUFV7U3Nxscvipq6sjJEQ4QLLvI4KsWrVKWBd+CxcB7UI4AtHdu3dNnufGDeT/FCUfOieGX1dXF5lTfRQXFwtLQkH4s+zXcuiTla2urhan3hzBIllekxUO5BsKQ9FBlzx79owKCgrI399fuAQUhT/L0QACIsjLyyNzyzEp9w6SXcIVk5riV5qAQkg/u7u7aWhoaFTcRgh7/Pix2eNL4c9VtrCdHB0sEQz68OFDcnFxIScnJ9V9BwcHsQhLxpcikb1s4X5spSUWBiEsXLhQe8LNPr1t2zaxCHPHl9ixV1a4B4fE3EQFPsv5K02bNk0A16PKFmY65LnmzoFdYvlPdok2PuVwPGtzti0mJkZECeQKYDv1w6ZKsNlCWBQSJLCkqYJYztIqW7gPSoOlTF15aGioinrhFnJic/LkSVH+I3vDc3ALMN369euRgZk8DwzC8rc6cZznctskv0J2tnjx4lHU29LSIths3759In729fW9yAE4JuOd9PR0k304LCwMQ/yprnD1ggULTBoEPQX4JqyLyCBT765du8TvUDY7O1tQN6KQXGjCMBs3bjR6HrgYk1K/psLFCQkJ/RjQmC2CssjEoCz8VmazrKwsEdrk5y5fviyYsKenRxWfcSgTExPF7hgzF56T2lu96gp3Q2kcDEMrRsWBrg2UxRbLUYHrQCoqKhr1PFgQOTLISfZnhLitW7eK7M7QfPHxaOFRvraa7rukpCSD4YWrWeGzaPBhYiiANHPPnj0630M6CRfRTEW3b9+udz704djCaBqWayuR6vjElyUnJ799+PBhreEFHUhUG6BgHC45hCEh1xcSkezn5OTQvHnzVIuEIIpgx6RsbJTAgKji1TtBmn2JYMZfK1eudNBVHE6UrF27lnbs2IFy403GiK4yH8H5y7S0tEkt87ETrKxSau2OGGpof7t69eoYpVIZj1M/0YLqBAWA1M1sMabzgxW9y6zUsGnTpgm1LCIOiIVD7F5drVd93UsfRiUn3mEHDx4cd8siTIK616xZ8wM6/Ob2h90ZRRw1oqG0oT6CuRIdHU0HDhyAIp/DJS3twMPPv2Z8mpGRoSgrKxszRUHnaAts3ry5C01L9Xg7Ft84FjF+ZEYLRzkk9QvMbl7jYO3evRvxNY+Rwfh3PL4i4ZC+w/iMc9vw0tJStJJEc8SQ4ECBuZA/p6amDkitp28YJn00UVjwYTFCau3HcYEZCqXv3LkjEh18BkNuDFYDBaM/wSyK5OU843cGqLRrIr7T6ZJXpK+hwdKXUDcwLwPBv11KvpulYsEiGSuFJ0z+F2AAyCap34M2ukUAAAAASUVORK5CYII=" alt="close"/>').css({position:"absolute",right:"-9px",top:"-8px",width:"44px",height:"44px","z-index":"10000"}).click(function(){g.lightbox("close")})),i.contentWidth=b,i.contentHeight=c,i.opened=!0,i.resizeHandler=function(){g.lightbox("resize")},a(window).on("resize",i.resizeHandler),a(window).on("orientationchange",i.resizeHandler),h.postopen.call(this),this},close:function(){var b=this.data("lightbox");return b.preclose.call(this),a(window).off("resize",b.resizeHandler),a(window).off("orientationchange",b.resizeHandler),b.opened=!1,b.overlay.remove(),b.overlay=void 0,b.postclose.call(this),b.box.remove(),this},resize:function(){var a,b,c=this.data("lightbox");if(c.preresize.call(this),c.fullscreen===!0)a=window.innerWidth,b=window.innerHeight;else if(a=c.contentWidth,b=c.contentHeight,c.scale===!0){var g=d(a,b);a=parseInt(a*g,10),b=parseInt(b*g,10)}return e(c.box,a,b),f(c.box,a,b),e(c.contents,a,b),f(c.contents,a,b),c.contentWidth=a,c.contentHeight=b,c.postresize.call(this),this},toggle:function(){return this.lightbox(this.data("lightbox").opened===!0?"close":"open"),this},init:function(c){return this.each(function(){var d=a(this),e=d.data("lightbox");if(!e){var f=a.extend(b,c,{opened:!1});d.data("lightbox",f)}return d.data("lightbox").defaultEventHandling===!0&&d.on("touchstart",function(a){var b=a.timeStamp,c=d.data("lightbox").lastTouch||b,e=b-c,f=a.originalEvent.touches.length;d.data("lightbox").lastTouch=b,!e||e>500||f>1||(a.preventDefault(),d.lightbox("toggle"))}),this})}};a.fn.lightbox=function(b){return c[b]?c[b].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof b&&b?(a.error("Method "+b+" does not exist on jQuery.lightbox"),null):c.init.apply(this,arguments)};var d=function(a,b){var c=a>0?window.innerWidth/a:1,d=b>0?window.innerHeight/b:1,e=Math.min(c,d);return e},e=function(a,b,c){a.css("width",b+"px").css("height",c+"px")},f=function(a,b,c){var d=(window.innerWidth-b)/2,e=(window.innerHeight-c)/2;0>d&&(d=0),0>e&&(e=0),a.css("left",d+"px").css("top",e+"px")}}(jQuery),function(a){function b(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=0,g=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),g=e,void 0!==c.axis&&c.axis===c.HORIZONTAL_AXIS&&(g=0,f=-1*e),void 0!==c.wheelDeltaY&&(g=c.wheelDeltaY/120),void 0!==c.wheelDeltaX&&(f=-1*c.wheelDeltaX/120),d.unshift(b,e,f,g),(a.event.dispatch||a.event.handle).apply(this,d)}var c=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var d=c.length;d;)a.event.fixHooks[c[--d]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],b,!1);else this.onmousewheel=b},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],b,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})}(jQuery),window.jermaine.util.namespace("window.multigraph",function(){"use strict";window.multigraph.jQuery=jQuery.noConflict()}),function(a){"use strict";var b={on:function(b){return void 0===b?a(this).data("busy_spinner").on:this.each(function(){return b?(a(this).data("busy_spinner").on=!0,a(this).data("busy_spinner").level=1,a(this).show()):(a(this).data("busy_spinner").on=!1,a(this).data("busy_spinner").level=0,a(this).hide()),this})},level:function(b){return void 0===b?a(this).data("busy_spinner").level:this.each(function(){return a(this).data("busy_spinner").level+b>=0&&(a(this).data("busy_spinner").level=a(this).data("busy_spinner").level+b,1===a(this).data("busy_spinner").level?a(this).busy_spinner("on",!0):0===a(this).data("busy_spinner").level&&a(this).busy_spinner("on",!1)),this})},init:function(b){return this.each(function(){var c=a(this),d=c.data("busy_spinner"),e=a.extend({on:!1},b);return d||(c.data("busy_spinner",{on:e.on,level:0}),e.on?a(this).show():a(this).hide(),a(this).css({width:32,height:32}).append(a('<img src="data:image/gif;base64,R0lGODlhIAAgAPMAAP///wAAAMbGxoSEhLa2tpqamjY2NlZWVtjY2OTk5Ly8vB4eHgQEBAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAIAAgAAAE5xDISWlhperN52JLhSSdRgwVo1ICQZRUsiwHpTJT4iowNS8vyW2icCF6k8HMMBkCEDskxTBDAZwuAkkqIfxIQyhBQBFvAQSDITM5VDW6XNE4KagNh6Bgwe60smQUB3d4Rz1ZBApnFASDd0hihh12BkE9kjAJVlycXIg7CQIFA6SlnJ87paqbSKiKoqusnbMdmDC2tXQlkUhziYtyWTxIfy6BE8WJt5YJvpJivxNaGmLHT0VnOgSYf0dZXS7APdpB309RnHOG5gDqXGLDaC457D1zZ/V/nmOM82XiHRLYKhKP1oZmADdEAAAh+QQJCgAAACwAAAAAIAAgAAAE6hDISWlZpOrNp1lGNRSdRpDUolIGw5RUYhhHukqFu8DsrEyqnWThGvAmhVlteBvojpTDDBUEIFwMFBRAmBkSgOrBFZogCASwBDEY/CZSg7GSE0gSCjQBMVG023xWBhklAnoEdhQEfyNqMIcKjhRsjEdnezB+A4k8gTwJhFuiW4dokXiloUepBAp5qaKpp6+Ho7aWW54wl7obvEe0kRuoplCGepwSx2jJvqHEmGt6whJpGpfJCHmOoNHKaHx61WiSR92E4lbFoq+B6QDtuetcaBPnW6+O7wDHpIiK9SaVK5GgV543tzjgGcghAgAh+QQJCgAAACwAAAAAIAAgAAAE7hDISSkxpOrN5zFHNWRdhSiVoVLHspRUMoyUakyEe8PTPCATW9A14E0UvuAKMNAZKYUZCiBMuBakSQKG8G2FzUWox2AUtAQFcBKlVQoLgQReZhQlCIJesQXI5B0CBnUMOxMCenoCfTCEWBsJColTMANldx15BGs8B5wlCZ9Po6OJkwmRpnqkqnuSrayqfKmqpLajoiW5HJq7FL1Gr2mMMcKUMIiJgIemy7xZtJsTmsM4xHiKv5KMCXqfyUCJEonXPN2rAOIAmsfB3uPoAK++G+w48edZPK+M6hLJpQg484enXIdQFSS1u6UhksENEQAAIfkECQoAAAAsAAAAACAAIAAABOcQyEmpGKLqzWcZRVUQnZYg1aBSh2GUVEIQ2aQOE+G+cD4ntpWkZQj1JIiZIogDFFyHI0UxQwFugMSOFIPJftfVAEoZLBbcLEFhlQiqGp1Vd140AUklUN3eCA51C1EWMzMCezCBBmkxVIVHBWd3HHl9JQOIJSdSnJ0TDKChCwUJjoWMPaGqDKannasMo6WnM562R5YluZRwur0wpgqZE7NKUm+FNRPIhjBJxKZteWuIBMN4zRMIVIhffcgojwCF117i4nlLnY5ztRLsnOk+aV+oJY7V7m76PdkS4trKcdg0Zc0tTcKkRAAAIfkECQoAAAAsAAAAACAAIAAABO4QyEkpKqjqzScpRaVkXZWQEximw1BSCUEIlDohrft6cpKCk5xid5MNJTaAIkekKGQkWyKHkvhKsR7ARmitkAYDYRIbUQRQjWBwJRzChi9CRlBcY1UN4g0/VNB0AlcvcAYHRyZPdEQFYV8ccwR5HWxEJ02YmRMLnJ1xCYp0Y5idpQuhopmmC2KgojKasUQDk5BNAwwMOh2RtRq5uQuPZKGIJQIGwAwGf6I0JXMpC8C7kXWDBINFMxS4DKMAWVWAGYsAdNqW5uaRxkSKJOZKaU3tPOBZ4DuK2LATgJhkPJMgTwKCdFjyPHEnKxFCDhEAACH5BAkKAAAALAAAAAAgACAAAATzEMhJaVKp6s2nIkolIJ2WkBShpkVRWqqQrhLSEu9MZJKK9y1ZrqYK9WiClmvoUaF8gIQSNeF1Er4MNFn4SRSDARWroAIETg1iVwuHjYB1kYc1mwruwXKC9gmsJXliGxc+XiUCby9ydh1sOSdMkpMTBpaXBzsfhoc5l58Gm5yToAaZhaOUqjkDgCWNHAULCwOLaTmzswadEqggQwgHuQsHIoZCHQMMQgQGubVEcxOPFAcMDAYUA85eWARmfSRQCdcMe0zeP1AAygwLlJtPNAAL19DARdPzBOWSm1brJBi45soRAWQAAkrQIykShQ9wVhHCwCQCACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiRMDjI0Fd30/iI2UA5GSS5UDj2l6NoqgOgN4gksEBgYFf0FDqKgHnyZ9OX8HrgYHdHpcHQULXAS2qKpENRg7eAMLC7kTBaixUYFkKAzWAAnLC7FLVxLWDBLKCwaKTULgEwbLA4hJtOkSBNqITT3xEgfLpBtzE/jiuL04RGEBgwWhShRgQExHBAAh+QQJCgAAACwAAAAAIAAgAAAE7xDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfZiCqGk5dTESJeaOAlClzsJsqwiJwiqnFrb2nS9kmIcgEsjQydLiIlHehhpejaIjzh9eomSjZR+ipslWIRLAgMDOR2DOqKogTB9pCUJBagDBXR6XB0EBkIIsaRsGGMMAxoDBgYHTKJiUYEGDAzHC9EACcUGkIgFzgwZ0QsSBcXHiQvOwgDdEwfFs0sDzt4S6BK4xYjkDOzn0unFeBzOBijIm1Dgmg5YFQwsCMjp1oJ8LyIAACH5BAkKAAAALAAAAAAgACAAAATwEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GGl6NoiPOH16iZKNlH6KmyWFOggHhEEvAwwMA0N9GBsEC6amhnVcEwavDAazGwIDaH1ipaYLBUTCGgQDA8NdHz0FpqgTBwsLqAbWAAnIA4FWKdMLGdYGEgraigbT0OITBcg5QwPT4xLrROZL6AuQAPUS7bxLpoWidY0JtxLHKhwwMJBTHgPKdEQAACH5BAkKAAAALAAAAAAgACAAAATrEMhJaVKp6s2nIkqFZF2VIBWhUsJaTokqUCoBq+E71SRQeyqUToLA7VxF0JDyIQh/MVVPMt1ECZlfcjZJ9mIKoaTl1MRIl5o4CUKXOwmyrCInCKqcWtvadL2SYhyASyNDJ0uIiUd6GAULDJCRiXo1CpGXDJOUjY+Yip9DhToJA4RBLwMLCwVDfRgbBAaqqoZ1XBMHswsHtxtFaH1iqaoGNgAIxRpbFAgfPQSqpbgGBqUD1wBXeCYp1AYZ19JJOYgH1KwA4UBvQwXUBxPqVD9L3sbp2BNk2xvvFPJd+MFCN6HAAIKgNggY0KtEBAAh+QQJCgAAACwAAAAAIAAgAAAE6BDISWlSqerNpyJKhWRdlSAVoVLCWk6JKlAqAavhO9UkUHsqlE6CwO1cRdCQ8iEIfzFVTzLdRAmZX3I2SfYIDMaAFdTESJeaEDAIMxYFqrOUaNW4E4ObYcCXaiBVEgULe0NJaxxtYksjh2NLkZISgDgJhHthkpU4mW6blRiYmZOlh4JWkDqILwUGBnE6TYEbCgevr0N1gH4At7gHiRpFaLNrrq8HNgAJA70AWxQIH1+vsYMDAzZQPC9VCNkDWUhGkuE5PxJNwiUK4UfLzOlD4WvzAHaoG9nxPi5d+jYUqfAhhykOFwJWiAAAIfkECQoAAAAsAAAAACAAIAAABPAQyElpUqnqzaciSoVkXVUMFaFSwlpOCcMYlErAavhOMnNLNo8KsZsMZItJEIDIFSkLGQoQTNhIsFehRww2CQLKF0tYGKYSg+ygsZIuNqJksKgbfgIGepNo2cIUB3V1B3IvNiBYNQaDSTtfhhx0CwVPI0UJe0+bm4g5VgcGoqOcnjmjqDSdnhgEoamcsZuXO1aWQy8KAwOAuTYYGwi7w5h+Kr0SJ8MFihpNbx+4Erq7BYBuzsdiH1jCAzoSfl0rVirNbRXlBBlLX+BP0XJLAPGzTkAuAOqb0WT5AH7OcdCm5B8TgRwSRKIHQtaLCwg1RAAAOwAAAAAAAAAAAA==" width="32" height="32" alt="ajax loading">'))),this})}};a.fn.busy_spinner=function(c){return b[c]?b[c].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof c&&c?(a.error("Method "+c+" does not exist on jQuery.busy_spinner"),null):b.init.apply(this,arguments)}}(jQuery),function(a){"use strict";var b='<div class="errorDisplay"><span class="errorDisplayOptions"><button class="errorDisplayDetailsButton">See Details</button><a href="" class="errorDisplayXButton">&#10006;</a></span><span class="errorDisplayShortMessage"></span></div><span class="errorDisplayRetriever"></span>',c='<div class="errorDisplayDetails"><span class="errorDisplayOptions"><a href="" class="errorDisplayXButton">&#10006;</a></span><span class="errorDisplayFullMessageArea"></span></div>',d='<ul class="errorDisplayFullMessageList"></ul>',e={init:function(e){return this.each(function(){var f=a(this),g=f.data("errorDisplay"),h=a.extend({fontColor:"#ff0000",backgroundColor:"#ffffff",displayTime:1e3,indicatorColor:"#ff0000"},e);if(!g){f.append(b),f.find(".errorDisplay").width(f.width()-6);var i=a(c).appendTo(a("body")),j=a(d);a(i).find(".errorDisplayXButton").click(function(b){b.preventDefault(),a(i).find(".errorDisplayOptions").hide(),a(i).hide(),f.find(".errorDisplayRetriever").css("background-color",h.indicatorColor).show()}),f.data("errorDisplay",{detailDisplay:i,detailDisplayList:j,fontColor:h.fontColor,backgroundColor:h.backgroundColor,displayTime:h.displayTime,indicatorColor:h.indicatorColor}),f.find(".errorDisplayXButton").click(function(a){a.preventDefault(),f.find(".errorDisplayOptions").hide(),f.find(".errorDisplay").slideUp(h.displayTime,function(){f.find(".errorDisplayRetriever").show()})}),f.find(".errorDisplayDetailsButton").click(function(b){b.preventDefault(),f.find(".errorDisplay").off(),f.find(".errorDisplay").hide(),f.find(".errorDisplayRetriever").hide(),a(i).find(".errorDisplayFullMessageArea").empty().append(a(j)),a(i).find(".errorDisplayOptions").show(),a(i).show()})}return this})},displayError:function(b,c,d){return this.each(function(){var e=a(this),f=e.data("errorDisplay"),g=a.extend({fontColor:f.fontColor,backgroundColor:f.backgroundColor,displayTime:f.displayTime,indicatorColor:f.indicatorColor},d);e.find(".errorDisplayRetriever").hide(),e.find(".errorDisplayOptions").hide(),e.find(".errorDisplayShortMessage").css("color",g.fontColor),e.find(".errorDisplay").css("background-color",g.backgroundColor),e.find(".errorDisplayOptions").css("background-color",g.backgroundColor),e.find(".errorDisplayShortMessage").text(c),e.find(".errorDisplay").show(),e.find(".errorDisplayRetriever").css("background-color",g.indicatorColor),-1!=g.displayTime?e.find(".errorDisplay").slideUp(g.displayTime,function(){e.find(".errorDisplayRetriever").show()}):(e.find(".errorDisplayOptions").show(),e.find(".errorDisplay").show()),a(f.detailDisplayList).append(a("<li>"+b+"</li>").css("color",g.fontColor)),e.find(".errorDisplayRetriever").hover(function(a){a.preventDefault(),e.find(".errorDisplayOptions").hide(),e.find(".errorDisplayShortMessage").text(c).css("color",g.fontColor),e.find(".errorDisplay").slideDown(function(){e.find(".errorDisplayOptions").show(),e.find(".errorDisplay").mouseleave(function(a){a.preventDefault(),e.find(".errorDisplayOptions").hide(),e.find(".errorDisplay").slideUp(g.displayTime,function(){e.find(".errorDisplayRetriever").show()})})}),e.find(".errorDisplayRetriever").hide()})})}};a.fn.errorDisplay=function(b){return e[b]?e[b].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof b&&b?(a.error("Method "+b+" does not exist on jQuery.errorDisplay"),null):e.init.apply(this,arguments)}}(jQuery),jQuery("head").append(jQuery("<style type=\"text/css\">.errorDisplay { font-family: Helvetica, sans-serif; color: #32446B; background-color: white; text-align: left; font-size: 12px; line-height: 12px; height: 45px; position: absolute; bottom: 0px; left: 0px; width: inherit; width: expression(this.parentNode.currentStyle['width']); border: solid; border-color: #A9BADE; border-style: ridge; display: none; } .errorDisplayRetriever{ height: 8px; background-color: #ff0000; border-top-right-radius: 10px; width: 8px; position: absolute; bottom: 0px; left: 0px; display: none; } .errorDisplayShortMessage{ overflow-x: hidden; overflow-y: hidden; white-space: nowrap; position: absolute; bottom: 0px; left: 0px; width: 95%; margin-top: 20px; margin-left: 10px; margin-bottom: 5px; } .errorDisplayXButton { text-decoration: none; font-size: 15px; margin-top: 2px; position: absolute; right: 3px; top: 0px; color: #4D68A3; } .errorDisplayDetailsButton { margin-left: 10px; margin-right: 10px; position: relative; } .errorDisplayDetails{ position: fixed; top: 25%; height: 100px; width: 75%; text-align: left; border: solid; border-color: #A9BADE; border-style: ridge; background-color: white; display: none; } .errorDisplayFullMessageArea { font-family: Helvetica, sans-serif; font-size: .833em; color: #32446B; height: 80px; width: inherit; width: expression(this.parentNode.currentStyle['width']); position: fixed; margin-top: 15px; } .errorDisplayFullMessageList { overflow: auto; white-space: nowrap; height: 80px; margin-top: 5px; } .errorDisplayOptions{ background-color: #FFFFFF; display: inline; } </style>")),window.multigraph||(window.multigraph={}),window.multigraph.util=jermaine.util;var sprintf=function(){function a(a){return Object.prototype.toString.call(a).slice(8,-1).toLowerCase()}function b(a,b){for(var c=[];b>0;c[--b]=a);return c.join("")}var c=function(){return c.cache.hasOwnProperty(arguments[0])||(c.cache[arguments[0]]=c.parse(arguments[0])),c.format.call(null,c.cache[arguments[0]],arguments)};return c.format=function(c,d){var e,f,g,h,i,j,k,l=1,m=c.length,n="",o=[];for(f=0;m>f;f++)if(n=a(c[f]),"string"===n)o.push(c[f]);else if("array"===n){if(h=c[f],h[2])for(e=d[l],g=0;g<h[2].length;g++){if(!e.hasOwnProperty(h[2][g]))throw sprintf('[sprintf] property "%s" does not exist',h[2][g]);e=e[h[2][g]]}else e=h[1]?d[h[1]]:d[l++];if(/[^s]/.test(h[8])&&"number"!=a(e))throw sprintf("[sprintf] expecting number but found %s",a(e));switch(h[8]){case"b":e=e.toString(2);break;case"c":e=String.fromCharCode(e);break;case"d":e=parseInt(e,10);break;case"e":e=h[7]?e.toExponential(h[7]):e.toExponential();break;case"f":e=h[7]?parseFloat(e).toFixed(h[7]):parseFloat(e);break;case"o":e=e.toString(8);break;case"s":e=(e=String(e))&&h[7]?e.substring(0,h[7]):e;break;case"u":e=Math.abs(e);break;case"x":e=e.toString(16);break;case"X":e=e.toString(16).toUpperCase()}e=/[def]/.test(h[8])&&h[3]&&e>=0?"+"+e:e,j=h[4]?"0"==h[4]?"0":h[4].charAt(1):" ",k=h[6]-String(e).length,i=h[6]?b(j,k):"",o.push(h[5]?e+i:i+e)}return o.join("")},c.cache={},c.parse=function(a){for(var b=a,c=[],d=[],e=0;b;){if(null!==(c=/^[^\x25]+/.exec(b)))d.push(c[0]);else if(null!==(c=/^\x25{2}/.exec(b)))d.push("%");else{if(null===(c=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(b)))throw"[sprintf] invalid format string";if(c[2]){e|=1;var f=[],g=c[2],h=[];if(null===(h=/^([a-z_][a-z_\d]*)/i.exec(g)))throw"[sprintf] invalid format string";for(f.push(h[1]);""!==(g=g.substring(h[0].length));)if(null!==(h=/^\.([a-z_][a-z_\d]*)/i.exec(g)))f.push(h[1]);else{if(null===(h=/^\[(\d+)\]/.exec(g)))throw"[sprintf] invalid format string";f.push(h[1])}c[2]=f}else e|=2;if(3===e)throw"[sprintf] mixing positional and named placeholders is not (yet) supported";d.push(c)}b=b.substring(c[0].length)}return d},c}(),vsprintf=function(a,b){return b.unshift(a),sprintf.apply(null,b)};!function(){"use strict";for(var a=0,b=["ms","moz","webkit","o"],c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b){var c=(new Date).getTime(),d=Math.max(0,16-(c-a)),e=window.setTimeout(function(){b(c+d)},d);return a=c+d,e}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})}(),window.multigraph.util.namespace("window.multigraph.utilityFunctions",function(a){"use strict";a.getKeys=function(a){var b,c=[];for(b in a)a.hasOwnProperty(b)&&c.push(b);return c},a.insertDefaults=function(a,b,c){var d;for(d=0;d<c.length;d++)void 0===b[c[d]]||"object"==typeof b[c[d]]&&null!==b[c[d]]||a.attributes().indexOf(c[d])>-1&&a.attribute(c[d]).dflt(b[c[d]]);return a},a.getDefaultValuesFromXSD=function(){return{window:{border:2,margin:function(){return new window.multigraph.math.Insets(2,2,2,2)},padding:function(){return new window.multigraph.math.Insets(5,5,5,5)},bordercolor:function(){return new window.multigraph.math.RGBColor.parse("0x000000")}},legend:{icon:{height:30,width:40,border:1},visible:null,base:function(){return new window.multigraph.math.Point(1,1)},anchor:function(){return new window.multigraph.math.Point(1,1)},position:function(){return new window.multigraph.math.Point(0,0)},frame:"plot",color:function(){return new window.multigraph.math.RGBColor.parse("0xffffff")},bordercolor:function(){return new window.multigraph.math.RGBColor.parse("0x000000")},opacity:1,border:1,rows:void 0,columns:void 0,cornerradius:0,padding:0},background:{img:{src:void 0,anchor:function(){return new window.multigraph.math.Point(-1,-1)},base:function(){return new window.multigraph.math.Point(-1,-1)},position:function(){return new window.multigraph.math.Point(0,0)},frame:"padding"},color:"0xffffff"},plotarea:{margin:function(){return new window.multigraph.math.Insets(10,38,35,35)},border:0,color:null,bordercolor:function(){return new window.multigraph.math.RGBColor.parse("0xeeeeee")}},title:{text:void 0,frame:"padding",border:0,color:function(){return new window.multigraph.math.RGBColor.parse("0xffffff")},bordercolor:function(){return new window.multigraph.math.RGBColor.parse("0x000000")},opacity:1,padding:0,cornerradius:15,anchor:function(){return new window.multigraph.math.Point(0,1)},base:function(){return new window.multigraph.math.Point(0,1)},position:function(){return new window.multigraph.math.Point(0,0)}},horizontalaxis:{title:{content:void 0,anchor:void 0,base:0,position:void 0,"position-horizontal-top":function(){return new window.multigraph.math.Point(0,15)},"position-horizontal-bottom":function(){return new window.multigraph.math.Point(0,-18)},"position-vertical-right":function(){return new window.multigraph.math.Point(33,0)},"position-vertical-left":function(){return new window.multigraph.math.Point(-25,0)
},"anchor-horizontal-top":function(){return new window.multigraph.math.Point(0,-1)},"anchor-horizontal-bottom":function(){return new window.multigraph.math.Point(0,1)},"anchor-vertical-right":function(){return new window.multigraph.math.Point(-1,0)},"anchor-vertical-left":function(){return new window.multigraph.math.Point(1,0)},angle:0},labels:{label:{format:void 0,position:void 0,anchor:void 0,"position-horizontal-top":function(){return new window.multigraph.math.Point(0,5)},"position-horizontal-bottom":function(){return new window.multigraph.math.Point(0,-5)},"position-vertical-right":function(){return new window.multigraph.math.Point(5,0)},"position-vertical-left":function(){return new window.multigraph.math.Point(-8,0)},"anchor-horizontal-top":function(){return new window.multigraph.math.Point(0,-1)},"anchor-horizontal-bottom":function(){return new window.multigraph.math.Point(0,1)},"anchor-vertical-right":function(){return new window.multigraph.math.Point(-1,0)},"anchor-vertical-left":function(){return new window.multigraph.math.Point(1,0)},angle:0,spacing:void 0,densityfactor:1,color:function(){return new window.multigraph.math.RGBColor.parse("0x000000")},visible:!0},"start-number":function(){return new window.multigraph.core.NumberValue(0)},"start-datetime":function(){return new window.multigraph.core.DatetimeValue(0)},angle:0,position:function(){return new window.multigraph.math.Point(0,0)},anchor:function(){return new window.multigraph.math.Point(0,0)},color:function(){return new window.multigraph.math.RGBColor.parse("0x000000")},visible:!0,defaultNumberSpacing:"10000 5000 2000 1000 500 200 100 50 20 10 5 2 1 0.1 0.01 0.001",defaultDatetimeSpacing:"1000Y 500Y 200Y 100Y 50Y 20Y 10Y 5Y 2Y 1Y 6M 3M 2M 1M 7D 3D 2D 1D 12H 6H 3H 2H 1H","function":void 0,densityfactor:void 0},grid:{color:function(){return new window.multigraph.math.RGBColor.parse("0xeeeeee")},visible:!1},pan:{allowed:!0,min:null,max:null},zoom:{allowed:!0,min:void 0,max:void 0,anchor:null},binding:{id:void 0,min:void 0,max:void 0},id:void 0,type:"number",length:function(){return new window.multigraph.math.Displacement(1,0)},position:function(){return new window.multigraph.math.Point(0,0)},pregap:0,postgap:0,anchor:-1,base:function(){return new window.multigraph.math.Point(-1,-1)},min:"auto",minoffset:0,minposition:function(){return new window.multigraph.math.Displacement(-1,0)},max:"auto",maxoffset:0,maxposition:function(){return new window.multigraph.math.Displacement(1,0)},positionbase:void 0,color:function(){return new window.multigraph.math.RGBColor(0,0,0)},tickmin:-3,tickmax:3,tickcolor:null,highlightstyle:"axis",linewidth:1,orientation:void 0},verticalaxis:{title:{content:void 0,anchor:function(){return new window.multigraph.math.Point(0,-20)},position:function(){return new window.multigraph.math.Point(0,1)},angle:"0"},labels:{label:{format:void 0,start:void 0,angle:void 0,position:void 0,anchor:void 0,spacing:void 0,densityfactor:void 0},format:"%1d",visible:"true",start:"0",angle:"0.0",position:"0 0",anchor:"0 0","function":void 0,densityfactor:void 0},grid:{visible:"false"},pan:{allowed:"yes",min:void 0,max:void 0},zoom:{allowed:"yes",min:void 0,max:void 0,anchor:"none"},binding:{id:void 0,min:void 0,max:void 0},id:void 0,type:"number",position:"0 0",pregap:"0",postgap:"0",anchor:"-1",base:"-1 1",min:"auto",minoffset:"0",minposition:"-1",max:"auto",maxoffset:"0",maxposition:"1",positionbase:void 0,tickmin:"-3",tickmax:"3",highlightstyle:"axis",linewidth:"1",orientation:void 0},plot:{legend:{visible:!0,label:void 0},horizontalaxis:{variable:{ref:void 0,factor:void 0},constant:{value:void 0},ref:void 0},verticalaxis:{variable:{ref:void 0,factor:void 0},constant:{value:void 0},ref:void 0},filter:{option:{name:void 0,value:void 0},type:void 0},renderer:{option:{name:void 0,value:void 0,min:void 0,max:void 0},type:function(){return window.multigraph.core.Renderer.Type.parse("line")}},datatips:{variable:{format:void 0},format:void 0,bgalpha:"1.0",border:1,pad:2}},throttle:{pattern:"",requests:0,period:0,concurrent:0},data:{variables:{variable:{id:void 0,column:void 0,type:"number",missingvalue:void 0,missingop:void 0},missingvalue:"-9000",missingop:"eq"},values:{content:void 0},csv:{location:void 0},service:{location:void 0}}}}}),window.multigraph.util.namespace("window.multigraph.utilityFunctions",function(a){"use strict";a.parseAttribute=function(a,b,c){return void 0!==a?(b(c(a)),!0):!1},a.parseString=function(a){return a},a.parseInteger=function(a){return parseInt(a,10)},a.parseDataValue=function(a){return function(b){return window.multigraph.core.DataValue.parse(a,b)}},a.parseDataMeasure=function(a){return function(b){return window.multigraph.core.DataMeasure.parse(a,b)}},a.parseBoolean=function(a){switch(a.toLowerCase()){case"true":case"yes":return!0;case"false":case"no":return!1;default:return a}}}),window.multigraph.util.namespace("window.multigraph.utilityFunctions",function(a){"use strict";a.validateNumberRange=function(a,b,c){return"number"==typeof a&&a>=b&&c>=a},a.typeOf=function(a){var b=typeof a;return"object"===b&&(a?"[object Array]"===Object.prototype.toString.call(a)&&(b="array"):b="null"),b}}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b={};b.NUMBER="number",b.DATETIME="datetime",b.UNKNOWN="unknown",b.types=function(){return[b.NUMBER,b.DATETIME,b.UNKNOWN]},b.parseType=function(a){if(a.toLowerCase()===b.NUMBER)return b.NUMBER;if(a.toLowerCase()===b.DATETIME)return b.DATETIME;throw new Error("unknown DataValue type: "+a)},b.serializeType=function(a){return a},b.isInstance=function(a){return a&&"function"==typeof a.getRealValue&&"function"==typeof a.compareTo},b.isInstanceOrNull=function(a){return null===a||b.isInstance(a)},b.create=function(c,d){if(c===b.NUMBER)return new a.NumberValue(d);if(c===b.DATETIME)return new a.DatetimeValue(d);throw new Error("attempt to parse an unknown DataValue type")},b.parse=function(c,d){if(c===b.NUMBER)return a.NumberValue.parse(d);if(c===b.DATETIME)return a.DatetimeValue.parse(d);throw new Error("attempt to parse an unknown DataValue type")},b.LT="lt",b.LE="le",b.EQ="eq",b.GE="ge",b.GT="gt",b.NE="ne";var c={};c[b.LT]=function(a){return this.compareTo(a)<0},c[b.LE]=function(a){return this.compareTo(a)<=0},c[b.EQ]=function(a){return 0===this.compareTo(a)},c[b.GE]=function(a){return this.compareTo(a)>=0},c[b.GT]=function(a){return this.compareTo(a)>0},c[b.NE]=function(a){return 0!==this.compareTo(a)},b.mixinComparators=function(a){a[b.LT]=c[b.LT],a[b.LE]=c[b.LE],a[b.EQ]=c[b.EQ],a[b.GE]=c[b.GE],a[b.GT]=c[b.GT],a[b.NE]=c[b.NE]},b.comparators=function(){return[b.LT,b.LE,b.EQ,b.GE,b.GT,b.NE]},b.parseComparator=function(a){if("string"==typeof a)switch(a.toLowerCase()){case"lt":return b.LT;case"le":return b.LE;case"eq":return b.EQ;case"ge":return b.GE;case"gt":return b.GT;case"ne":return b.NE}throw new Error(a+" should be one of 'lt', 'le', 'eq', 'ge', 'gt', 'ne'.")},a.DataValue=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b={};b.isInstance=function(a){return a&&"function"==typeof a.getRealValue&&!a.compareTo},b.parse=function(b,c){if(b===a.DataValue.NUMBER)return a.NumberMeasure.parse(c);if(b===a.DataValue.DATETIME)return a.DatetimeMeasure.parse(c);throw new Error("attempt to parse an unknown DataMeasure type")},a.DataMeasure=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b={};b.isInstance=function(a){return a&&"function"==typeof a.format&&"function"==typeof a.getMaxLength},b.create=function(b,c){if(b===a.DataValue.NUMBER)return new a.NumberFormatter(c);if(b===a.DataValue.DATETIME)return new a.DatetimeFormatter(c);throw new Error("attempt to create an unknown DataFormatter type")},a.DataFormatter=b}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.Box=new window.jermaine.Model("Box",function(){this.hasA("width").isA("number"),this.hasA("height").isA("number"),this.isBuiltWith("width","height")})}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.Displacement=new window.jermaine.Model("Displacement",function(){this.hasA("a").vlds(function(a){return window.multigraph.utilityFunctions.validateNumberRange(a,-1,1)}),this.hasA("b").isA("integer").dflt(0),this.isBuiltWith("a","%b"),this.rspd("calculateLength",function(a){return this.a()*a+this.b()}),this.rspd("calculateCoordinate",function(a){return(this.a()+1)*a/2+this.b()})}),a.Displacement.regExp=/^([\+\-]?[0-9\.]+)([+\-])([0-9\.+\-]+)$/,a.Displacement.parse=function(b){var c,d,e,f,g=a.Displacement.regExp.exec(b);if(void 0===b)c=new a.Displacement(1);else if(null!==g){switch(d=parseFloat(g[1]),e=parseFloat(g[3]),g[2]){case"+":f=1;break;case"-":f=-1;break;default:f=0}c=new a.Displacement(d,f*e)}else d=parseFloat(b),c=new a.Displacement(d);return c}}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";var b=function(a){var b={},c=function(c){if(void 0!==b[c])throw new Error("attempt to redefine "+a+" Enum with key '"+c+"'");this.enumType=a,this.key=c,b[c]=this};return c.parse=function(a){return b[a]},c.prototype.toString=function(){return this.key},c.isInstance=function(b){return void 0!==b&&null!==b&&b.enumType===a},c};a.Enum=b}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.Insets=new window.jermaine.Model("Insets",function(){this.hasA("top").isA("number"),this.hasA("left").isA("number"),this.hasA("bottom").isA("number"),this.hasA("right").isA("number"),this.rspd("set",function(a,b,c,d){this.top(a),this.left(b),this.bottom(c),this.right(d)}),this.isBuiltWith("top","left","bottom","right")})}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.Point=new window.jermaine.Model("Point",function(){this.hasA("x").isA("number"),this.hasA("y").isA("number"),this.isBuiltWith("x","y"),this.rspd("eq",function(a){return this.x()===a.x()&&this.y()===a.y()})}),a.Point.regExp=/^\s*([0-9\-\+\.eE]+)(,|\s+|\s*,\s+|\s+,\s*)([0-9\-\+\.eE]+)\s*$/,a.Point.parse=function(b){var c=a.Point.regExp.exec(b);if(!c||4!==c.length)throw new Error("cannot parse string '"+b+"' as a Point");return new a.Point(parseFloat(c[1]),parseFloat(c[3]))}}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.RGBColor=new window.jermaine.Model("RGBColor",function(){this.hasA("r").vlds(function(a){return window.multigraph.utilityFunctions.validateNumberRange(a,0,1)}),this.hasA("g").vlds(function(a){return window.multigraph.utilityFunctions.validateNumberRange(a,0,1)}),this.hasA("b").vlds(function(a){return window.multigraph.utilityFunctions.validateNumberRange(a,0,1)});var a=function(a){return a=parseInt(255*a,10).toString(16),1===a.length&&(a="0"+a),a};this.rspd("getHexString",function(b){return b||(b="0x"),b+a(this.r())+a(this.g())+a(this.b())}),this.rspd("toRGBA",function(a){if(void 0===a&&(a=1),"number"!=typeof a)throw new Error("RGBColor.toRGBA: The argument, if present, must be a number");return"rgba("+255*this.r()+", "+255*this.g()+", "+255*this.b()+", "+a+")"}),this.rspd("eq",function(a){return this.r()===a.r()&&this.g()===a.g()&&this.b()===a.b()}),this.isBuiltWith("r","g","b")}),a.RGBColor.colorNameIsDeprecated=function(a){switch(a){case"grey":return"0xeeeeee";case"skyblue":return"0x87ceeb";case"khaki":return"0xf0e68c";case"orange":return"0xffa500";case"salmon":return"0xfa8072";case"olive":return"0x9acd32";case"sienna":return"0xa0522d";case"pink":return"0xffb5c5";case"violet":return"0xee82ee"}return!1},a.RGBColor.parse=function(b){var c,d,e,f,g,h;if(void 0===b)return void 0;if("string"==typeof b){switch(g=b.toLowerCase()){case"black":c=0,d=0,e=0;break;case"red":c=1,d=0,e=0;break;case"green":c=0,d=1,e=0;break;case"blue":c=0,d=0,e=1;break;case"yellow":c=1,d=1,e=0;break;case"magenta":c=1,d=0,e=1;break;case"cyan":c=0,d=1,e=1;break;case"white":c=1,d=1,e=1;break;case"grey":f=parseInt("ee",16)/255,c=f,d=f,e=f;break;case"skyblue":c=parseInt("87",16)/255,d=parseInt("ce",16)/255,e=parseInt("eb",16)/255;break;case"khaki":c=parseInt("f0",16)/255,d=parseInt("e6",16)/255,e=parseInt("8c",16)/255;break;case"orange":c=parseInt("ff",16)/255,d=parseInt("a5",16)/255,e=parseInt("00",16)/255;break;case"salmon":c=parseInt("fa",16)/255,d=parseInt("80",16)/255,e=parseInt("72",16)/255;break;case"olive":c=parseInt("9a",16)/255,d=parseInt("cd",16)/255,e=parseInt("32",16)/255;break;case"sienna":c=parseInt("a0",16)/255,d=parseInt("52",16)/255,e=parseInt("2d",16)/255;break;case"pink":c=parseInt("ff",16)/255,d=parseInt("b5",16)/255,e=parseInt("c5",16)/255;break;case"violet":c=parseInt("ee",16)/255,d=parseInt("82",16)/255,e=parseInt("ee",16)/255;break;default:if(g=g.replace(/(0(x|X)|#)/,""),-1!==g.search(new RegExp(/([^0-9a-f])/)))throw new Error("'"+b+"' is not a valid color");if(6===g.length)c=parseInt(g.substring(0,2),16)/255,d=parseInt(g.substring(2,4),16)/255,e=parseInt(g.substring(4,6),16)/255;else{if(3!==g.length)throw new Error("'"+b+"' is not a valid color");c=parseInt(g.charAt(0),16)/15,d=parseInt(g.charAt(1),16)/15,e=parseInt(g.charAt(2),16)/15}}return h=new a.RGBColor(c,d,e)}throw new Error("'"+b+"' is not a valid color")}}),window.multigraph.util.namespace("window.multigraph.math",function(a){"use strict";a.util={interp:function(a,b,c,d,e){return d+(e-d)*(a-b)/(c-b)},safe_interp:function(b,c,d,e,f){return c===d?(e+f)/2:a.util.interp(b,c,d,e,f)},l2dist:function(a,b,c,d){var e=a-c,f=b-d;return Math.sqrt(e*e+f*f)}}}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c,d=window.multigraph.utilityFunctions,e=d.getDefaultValuesFromXSD(),f=d.getKeys(e.plot.renderer),g=new window.multigraph.math.Enum("RendererType");c=new window.jermaine.Model("Renderer",function(){this.hasA("type").vlds(g.isInstance),this.hasA("plot").vlds(function(b){return b instanceof a.Plot}),this.hasA("numberOfVariables").isA("number"),this.rspd("setUpMissing",function(){var b,c=this.plot();return c?c instanceof a.ConstantPlot?void(this.isMissing=function(){return!1}):c.data()?(b=c.data(),void(this.isMissing=function(a){var c;for(c=1;c<a.length;++c)if(b.isMissing(a[c],c))return!0;return!1})):void console.log("Warning: renderer.setUpMissing() called for renderer whose plot has no data ref"):void console.log("Warning: renderer.setUpMissing() called for renderer that has no plot ref")}),this.isBuiltWith("type"),d.insertDefaults(this,e.plot.renderer,f),this.rspd("transformPoint",function(a){var b,c=[],d=this.plot().horizontalaxis(),e=this.plot().verticalaxis();for(c[0]=d.dataValueToAxisValue(a[0]),b=1;b<a.length;++b)c[b]=e.dataValueToAxisValue(a[b]);return c});var b=function(a,b){return a===b||void 0===a&&void 0===b};this.rspd("setOption",function(a,c,d,e){var f,g,h;if(!this.optionsMetadata[a])throw new Error("attempt to set unknown renderer option '"+a+"'");for(g=this.options()[a](),h=0;h<g.size();++h)if(b(g.at(h).min(),d)&&b(g.at(h).max(),e))return void g.at(h).value(c);f=new this.optionsMetadata[a].type,f.value(c),f.min(d),f.max(e),g.add(f)}),this.rspd("setOptionFromString",function(b,c,d,e){var f=this.plot(),g=this.type(),h=void 0;"dotsize"===b?(b="pointsize",h=new a.Warning('deprecated "dotsize" option used for "'+g+'" renderer; use "pointsize" instead')):"dotcolor"===b&&(b="pointcolor",h=new a.Warning('deprecated "dotcolor" option used for "'+g+'" renderer; use "pointcolor" instead'));var i;if(!this.optionsMetadata[b])throw new a.Warning('"'+g+'" renderer has no option named "'+b+'"');if(i=new this.optionsMetadata[b].type,i.parseValue(c,this),f&&f.verticalaxis()&&(void 0!==d&&i.min(a.DataValue.parse(f.verticalaxis().type(),d)),void 0!==e&&i.max(a.DataValue.parse(f.verticalaxis().type(),e))),this.setOption(b,i.value(),i.min(),i.max()),h)throw h}),this.rspd("getOptionValue",function(a,b){var c,d,e;if(d=this.options(),"function"!=typeof d[a])throw new Error('unknown option "'+a+'"');if(e=d[a](),!e)throw new Error('unknown option "'+a+'"');for(c=e.size()-1;c>=0;--c){var f=e.at(c);if((void 0===f.min()||void 0===b||f.min().le(b))&&(void 0===f.max()||void 0===b||f.max().gt(b)))return f.value()}}),this.rspd("begin",function(){}),this.rspd("dataPoint",function(){}),this.rspd("end",function(){})}),b=[],c.addType=function(a){b.push(a)},c.create=function(a){var c,d;for(c=0;c<b.length;++c)if(b[c].type===a)return d=new b[c].model,d.type(a),d;throw new Error("Renderer.create: '"+a+"' is not a known renderer type")},c.declareOptions=function(a,b,c){var d,e,f,g=function(a,b){e.hasMany(a).validateWith(function(a){return a instanceof b})};for(e=window.jermaine.Model(b,function(){}),f={},d=0;d<c.length;++d)g(c[d].name,c[d].type),f[c[d].name]={type:c[d].type,"default":c[d]["default"]};a.hasA("options").isImmutable().dflt(function(){return new e}),a.prototype.optionsMetadata=f,a.isBuiltWith(function(){var a,b,c=this.optionsMetadata;for(a in c)c.hasOwnProperty(a)&&(b=new c[a].type(c[a]["default"]),this.options()[a]().add(b))})},c.Option=new window.jermaine.Model("Renderer.Option",function(){this.hasA("min").vlds(a.DataValue.isInstance),this.hasA("max").vlds(a.DataValue.isInstance)}),c.RGBColorOption=new window.jermaine.Model("Renderer.RGBColorOption",function(){this.isA(c.Option),this.hasA("value").vlds(function(a){return a instanceof window.multigraph.math.RGBColor||null===a}),this.isBuiltWith("value"),this.rspd("serializeValue",function(){return this.value().getHexString()}),this.rspd("parseValue",function(a){this.value(window.multigraph.math.RGBColor.parse(a))}),this.rspd("valueEq",function(a){return this.value().eq(a)})}),c.NumberOption=new window.jermaine.Model("Renderer.NumberOption",function(){this.isA(c.Option),this.hasA("value").isA("number"),this.isBuiltWith("value"),this.rspd("serializeValue",function(){return this.value().toString()}),this.rspd("parseValue",function(a){this.value(parseFloat(a))}),this.rspd("valueEq",function(a){return this.value()===a})}),c.DataValueOption=new window.jermaine.Model("Renderer.DataValueOption",function(){this.isA(c.Option),this.hasA("value").vlds(function(b){return a.DataValue.isInstance(b)||null===b}),this.isBuiltWith("value"),this.rspd("serializeValue",function(){return this.value()}),this.rspd("valueEq",function(a){return this.value().eq(a)})}),c.VerticalDataValueOption=new window.jermaine.Model("Renderer.DataValueOption",function(){this.isA(c.DataValueOption),this.isBuiltWith("value"),this.rspd("parseValue",function(b,c){this.value(a.DataValue.parse(c.plot().verticalaxis().type(),b))})}),c.HorizontalDataValueOption=new window.jermaine.Model("Renderer.DataValueOption",function(){this.isA(c.DataValueOption),this.isBuiltWith("value"),this.rspd("parseValue",function(b,c){this.value(a.DataValue.parse(c.plot().horizontalaxis().type(),b))})}),c.DataMeasureOption=new window.jermaine.Model("Renderer.DataMeasureOption",function(){this.isA(c.Option),this.hasA("value").vlds(function(b){return a.DataMeasure.isInstance(b)||null===b}),this.isBuiltWith("value"),this.rspd("serializeValue",function(){return this.value()}),this.rspd("valueEq",function(a){return this.value().eq(a)})}),c.VerticalDataMeasureOption=new window.jermaine.Model("Renderer.DataMeasureOption",function(){this.isA(c.DataMeasureOption),this.rspd("parseValue",function(b,c){this.value(a.DataMeasure.parse(c.plot().verticalaxis().type(),b))})}),c.HorizontalDataMeasureOption=new window.jermaine.Model("Renderer.DataMeasureOption",function(){this.isA(c.DataMeasureOption),this.isBuiltWith("value"),this.rspd("parseValue",function(b,c){this.value(a.DataMeasure.parse(c.plot().horizontalaxis().type(),b))})}),c.Type=g,a.Renderer=c}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.EventEmitter=new window.jermaine.Model(function(){this.hasA("listeners").dflt(function(){return{}}),this.rspd("addListener",function(a,b){var c,d=this.listeners();for(void 0===d[a]&&(d[a]=[]),c=0;c<d[a].length;++c)if(d[a][c]===b)return!1;return d[a].push(b),this.emit({type:"listenerAdded",targetType:a,listener:b}),!0}),this.rspd("removeListener",function(a,b){var c,d=this.listeners();if(void 0!==d[a])for(c=0;c<d[a].length;++c)if(d[a][c]===b)return d[a][c]=null,this.emit({type:"listenerRemoved",targetType:a,listener:b}),!0;return!1}),this.rspd("emit",function(a){var b,c,d=[];if("string"==typeof a&&(a={type:a}),a.target||(a.target=this),!a.type)throw new Error("Event object missing 'type' property");if(b=this.listeners()[a.type]){for(c=0;c<b.length;c++)null!==b[c]?b[c].call(this,a):d.push(c);if(d.length>0)for(c=d.length-1;c>=0;--c)b.splice(d[c],1)}})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.data.variables.variable),e=new window.jermaine.Model("DataVariable",function(){this.hasA("id").isA("string"),this.hasA("column").isA("integer"),this.hasA("type").isOneOf(a.DataValue.types()).dflt(a.DataValue.NUMBER),this.hasA("data").vlds(function(a){return a instanceof window.multigraph.core.Data}),this.hasA("missingvalue").vlds(a.DataValue.isInstance),this.hasA("missingop").isOneOf(a.DataValue.comparators()),this.isBuiltWith("id","%column","%type"),b.insertDefaults(this,c.data.variables.variable,d)});a.DataVariable=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=new window.jermaine.Model(function(){var b=a.DataVariable;this.isA(a.EventEmitter);var c=function(a,b,c){var d,e=-1;for(d=0;d<c.size();++d)if(c.at(d)[a]()===b){e=d;break}return e};this.rspd("initializeColumns",function(){var a;for(a=0;a<this.columns().size();++a)this.columns().at(a).data(this)}),this.hasMany("columns").validateWith(function(a){return this.message="Data: constructor parameter should be an array of DataVariable objects",a instanceof b}),this.hasA("defaultMissingvalue").isA("string"),this.hasA("defaultMissingop").isA("string").dflt("eq"),this.hasA("adapter"),this.rspd("init",function(){this.initializeColumns()}),this.isBuiltWith("columns",function(){this.init()}),this.rspd("columnIdToColumnNumber",function(a){if("string"!=typeof a)throw new Error("Data: columnIdToColumnNumber expects parameter to be a string");var b=c("id",a,this.columns()),d=void 0;if(b>=0&&(d=this.columns().at(b)),void 0===d)throw new Error("Data: no column with the label "+a);return d.column()}),this.rspd("columnIdToDataVariable",function(a){if("string"!=typeof a)throw new Error("Data: columnIdToDataVariable requires a string parameter");var b=this.columns(),d=-1!==c("id",a,b)?b.at(c("id",a,b)):void 0;if(void 0===d)throw new Error("Data: no column with the label "+a);return d}),this.rspd("getColumnId",function(a){if("number"!=typeof a)throw new Error("Data: getColumnId method expects an integer");var b=c("column",a,this.columns());if(-1===b)throw new Error("Data: column "+a+" does not exist");return this.columns().at(b).id()}),this.rspd("getColumns",function(){var a,b=[],c=this.columns();for(a=0;a<c.size();++a)b.push(c.at(a));return b}),this.rspd("getBounds",function(){}),this.rspd("getIterator",function(){}),this.rspd("pause",function(){}),this.rspd("resume",function(){}),this.rspd("isMissing",function(a,b){var c;if(0>b||b>=this.columns().size())throw new Error("metadata.isMissing(): index out of range");return c=this.columns().at(b),c.missingvalue()&&c.missingop()?a[c.missingop()](c.missingvalue()):!1})});a.Data=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b;b=new window.jermaine.Model("Plot",function(){this.hasA("legend").vlds(function(b){return b instanceof a.PlotLegend}),this.hasA("horizontalaxis").vlds(function(b){return b instanceof a.Axis}),this.hasA("verticalaxis").vlds(function(b){return b instanceof a.Axis}),this.hasA("renderer").vlds(function(b){return b instanceof a.Renderer})}),a.Plot=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.ArrayData=window.jermaine.Model(function(){var b=this;this.isA(a.Data),this.hasA("array"),this.hasA("stringArray"),this.isBuiltWith("columns","stringArray",function(){this.init(),this.addListener("listenerAdded",function(a){if("dataReady"===a.targetType){var b=this.array();a.listener(b[0][0],b[b.length-1][0])}})}),this.rspd("getIterator",function(a,c,d,e){return b.getArrayDataIterator(this,a,c,d,e)}),this.rspd("getBounds",function(a){var b,c=this.array(),d=c[0][a],e=d;for(b=1;b<c.length;b++)c[b][a]<d&&(d=c[b][a]),c[b][a]>e&&(e=c[b][a]);return[d,e]}),b.getArrayDataIterator=function(b,c,d,e,f){var g,h,i,j,k,l,m=b.array();if(f=f||0,"[object Array]"!==Object.prototype.toString.apply(c))throw new Error("ArrayData: getIterator method requires that the first parameter be an array of strings");for(g=0;g<c.length;++g)if("string"!=typeof c[g])throw new Error("ArrayData: getIterator method requires that the first parameter be an array of strings");if(!a.DataValue.isInstance(d)||!a.DataValue.isInstance(e))throw new Error("ArrayData: getIterator method requires the second and third argument to be number values");if("number"!=typeof f)throw new Error("ArrayData: getIterator method requires last argument to be an integer");if(0===m.length)return{next:function(){},hasNext:function(){return!1}};for(i=0;i<m.length&&!m[i][0].ge(d);++i);if(i-=f,0>i&&(i=0),i===m.length-1)j=i;else for(j=i;j<m.length-1&&!m[j+1][0].gt(e);++j);for(j+=f,j>m.length-1&&(j=m.length-1),l=[],h=0;h<c.length;++h){var n=b.columnIdToColumnNumber(c[h]);l.push(n)}return k=i,{next:function(){var a,b=[];if(k>j)return null;for(a=0;a<l.length;++a)b.push(m[k][l[a]]);return++k,b},hasNext:function(){return j>=k}}},b.textToDataValuesArray=function(b,c){var d,e=[],f=c.split("\n");for(d=0;d<f.length;++d)if(/\d/.test(f[d])){var g,h=f[d].split(/\s*,\s*/),i=[];if(h.length===b.length){for(g=0;g<h.length;++g)i.push(a.DataValue.parse(b[g].type(),h[g]));e.push(i)}}return e},b.textToStringArray=function(a,b){var c,d,e,f=[],g=b.split("\n");for(e=0;e<g.length;++e)g[e]=g[e].replace(/^\s+/,"").replace(/\s+$/,"").replace(/\s*,\s*/g,",").replace(/\s+/g,",");for(e=0;e<g.length;++e)if(/\d/.test(g[e])){d=g[e].split(/,/).length;break}for(e=0;e<g.length;++e)if(/\d/.test(g[e])){if(c=g[e].split(/,/),c.length!==d)throw new Error("Data Parsing Error: The line '"+g[e]+"' has "+c.length+" data columns when it requires "+d+" columns");f.push(c)}return f},b.stringArrayToDataValuesArray=function(b,c){var d,e,f,g=[];for(e=0;e<c.length;++e){for(d=[],f=0;f<c[e].length;++f)d.push(a.DataValue.parse(b[f].type(),c[e][f]));g.push(d)}return g}})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.horizontalaxis),f=new window.multigraph.math.Enum("AxisOrientation");b=new window.jermaine.Model("Axis",function(){this.isA(a.EventEmitter),this.hasA("title").vlds(function(b){return b instanceof a.AxisTitle}),this.hasMany("labelers").validateWith(function(b){return b instanceof a.Labeler}),this.hasA("grid").vlds(function(b){return b instanceof a.Grid}),this.hasA("pan").vlds(function(b){return b instanceof a.Pan}),this.hasA("zoom").vlds(function(b){return b instanceof a.Zoom}),this.hasA("binding").vlds(function(b){return null===b||b instanceof a.AxisBinding}),this.hasA("id").isA("string"),this.hasA("type").isOneOf(a.DataValue.types()),this.hasA("length").vlds(function(a){return a instanceof window.multigraph.math.Displacement}),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("pregap").isA("number"),this.hasA("postgap").isA("number"),this.hasA("anchor").isA("number"),this.hasA("base").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("min").isA("string"),this.hasA("dataMin").vlds(a.DataValue.isInstance),this.rspd("hasDataMin",function(){return void 0!==this.dataMin()}),this.hasA("minoffset").isA("number"),this.hasA("minposition").vlds(function(a){return a instanceof window.multigraph.math.Displacement}),this.hasA("max").isA("string"),this.hasA("dataMax").vlds(a.DataValue.isInstance),this.rspd("hasDataMax",function(){return void 0!==this.dataMax()}),this.hasA("maxoffset").isA("number"),this.hasA("maxposition").vlds(function(a){return a instanceof window.multigraph.math.Displacement}),this.hasA("positionbase").isA("string"),this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("tickcolor").vlds(function(a){return null===a||a instanceof window.multigraph.math.RGBColor}),this.hasA("tickwidth").isA("integer"),this.hasA("tickmin").isA("integer"),this.hasA("tickmax").isA("integer"),this.hasA("highlightstyle").vlds(function(a){return"string"==typeof a}),this.hasA("linewidth").isA("integer"),this.hasA("orientation").vlds(f.isInstance),this.isBuiltWith("orientation",function(){this.grid(new a.Grid),this.zoom(new a.Zoom),this.pan(new a.Pan)}),this.hasA("pixelLength").isA("number"),this.hasA("parallelOffset").isA("number"),this.hasA("perpOffset").isA("number"),this.hasA("axisToDataRatio").isA("number"),this.rspd("initializeGeometry",function(a,c){var d,e,f=a.plotBox(),g=this.position(),h=this.base();for(this.orientation()===b.HORIZONTAL?(d=this.length().calculateLength(f.width()),this.pixelLength(d),this.parallelOffset(g.x()+(h.x()+1)*f.width()/2-(this.anchor()+1)*d/2),this.perpOffset(g.y()+(h.y()+1)*f.height()/2)):(d=this.length().calculateLength(f.height()),this.pixelLength(d),this.parallelOffset(g.y()+(h.y()+1)*f.height()/2-(this.anchor()+1)*d/2),this.perpOffset(g.x()+(h.x()+1)*f.width()/2)),this.minoffset(this.minposition().calculateCoordinate(d)),this.maxoffset(d-this.maxposition().calculateCoordinate(d)),this.hasDataMin()&&this.hasDataMax()&&this.computeAxisToDataRatio(),e=0;e<this.labelers().size();++e)this.labelers().at(e).initializeGeometry(a);this.title()&&this.title().initializeGeometry(a,c)}),this.rspd("computeAxisToDataRatio",function(){this.hasDataMin()&&this.hasDataMax()&&this.axisToDataRatio((this.pixelLength()-this.maxoffset()-this.minoffset())/(this.dataMax().getRealValue()-this.dataMin().getRealValue()))}),this.rspd("dataValueToAxisValue",function(a){return this.axisToDataRatio()*(a.getRealValue()-this.dataMin().getRealValue())+this.minoffset()+this.parallelOffset()}),this.rspd("axisValueToDataValue",function(b){return a.DataValue.create(this.type(),this.dataMin().getRealValue()+(b-this.minoffset()-this.parallelOffset())/this.axisToDataRatio())}),this.hasA("currentLabeler").vlds(function(b){return null===b||b instanceof a.Labeler}),this.hasA("currentLabelDensity").isA("number"),this.hasA("currentLabelerIndex").isA("number"),this.rspd("prepareRender",function(a){if(this.hasDataMin()&&this.hasDataMax()){var b,c,d=0,e=0,f=.8,g=this.labelers(),h=g.size(),i=this.currentLabelerIndex();if(0>=h)b=null;else{var j=!0,k=g.size()-1;for(void 0===i&&(i=0),c=i,d=g.at(i).getLabelDensity(a),d>f?0===i?j=!1:(e=d,i--):f>d?(e=d,i===k?j=!1:i++):d===f&&(j=!1);j;)if(d=g.at(i).getLabelDensity(a),d>f){if(0===i)break;
    if(!(c>i)){i=c,d=e;break}c=i,e=d,i--}else if(f>d){if(c>i)break;if(i===k)break;c=i,e=d,i++}else if(d===f)break}b=g.at(i),this.currentLabeler(b),this.currentLabelerIndex(i),this.currentLabelDensity(d)}}),this.rspd("toRealValue",function(b){if("number"==typeof b)return b;if(a.DataValue.isInstance(b))return b.getRealValue();throw new Error("unknown value type for axis value "+b)}),this.rspd("toDataValue",function(b){if("number"==typeof b)return a.DataValue.create(this.type(),b);if(a.DataValue.isInstance(b))return b;throw new Error("unknown value type for axis value "+b)}),this.rspd("setDataRangeNoBind",function(a,b,c){var d=this.toDataValue(a),e=this.toDataValue(b);this.dataMin(d),this.dataMax(e),void 0===c&&(c=!0),this.emit({type:"dataRangeSet",min:d,max:e})}),this.rspd("setDataRange",function(a,b,c){this.binding()?this.binding().setDataRange(this,a,b,c):this.setDataRangeNoBind(a,b,c)}),this.rspd("doPan",function(b,c){var d,e,f,g=this.pan(),h=g.min(),i=g.max();g.allowed()&&(d=c/this.axisToDataRatio(),e=this.dataMin().getRealValue()-d,f=this.dataMax().getRealValue()-d,h&&e<h.getRealValue()&&(f+=h.getRealValue()-e,e=h.getRealValue()),i&&f>i.getRealValue()&&(e-=f-i.getRealValue(),f=i.getRealValue()),this.setDataRange(a.DataValue.create(this.type(),e),a.DataValue.create(this.type(),f)))}),this.rspd("doZoom",function(b,c){var d,e,f,g,h,i=this.zoom(),j=this.pan(),k=this.type(),l=this.dataMin(),m=this.dataMax(),n=j.min(),o=j.max(),p=i.min(),q=i.max(),r=a.DataValue;i.allowed()&&(d=this.axisValueToDataValue(b).getRealValue(),r.isInstance(i.anchor())&&(d=i.anchor().getRealValue()),e=10*Math.abs(c/(this.pixelLength()-this.maxoffset()-this.minoffset())),0>=c?(f=r.create(k,(l.getRealValue()-d)*(1+e)+d),g=r.create(k,(m.getRealValue()-d)*(1+e)+d)):(f=r.create(k,(l.getRealValue()-d)*(1-e)+d),g=r.create(k,(m.getRealValue()-d)*(1-e)+d)),n&&f.lt(n)&&(f=n),o&&g.gt(o)&&(g=o),(l.le(m)&&f.lt(g)||l.ge(m)&&f.gt(g))&&(q&&g.gt(f.add(q))?(h=(g.getRealValue()-f.getRealValue()-q.getRealValue())/2,g=g.addRealValue(-h),f=f.addRealValue(h)):p&&g.lt(f.add(p))&&(h=(p.getRealValue()-(g.getRealValue()-f.getRealValue()))/2,g=g.addRealValue(h),f=f.addRealValue(-h)),this.setDataRange(f,g)))}),this.rspd("distanceToPoint",function(a,c){var d=this.orientation()===b.HORIZONTAL?c:a,e=this.orientation()===b.HORIZONTAL?a:c,f=this.parallelOffset(),g=this.perpOffset(),h=this.pixelLength(),i=window.multigraph.math.util.l2dist;return f>e?i(e,d,f,g):e>f+h?i(e,d,f+h,g):Math.abs(d-g)}),c.insertDefaults(this,d.horizontalaxis,e)}),b.HORIZONTAL=new f("horizontal"),b.VERTICAL=new f("vertical"),b.Orientation=f,a.Axis=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.AxisBinding=new window.jermaine.Model("AxisBinding",function(){var a=this;a.instances={},this.hasA("id").isA("string"),this.hasA("axes"),this.isBuiltWith("id",function(){a.instances[this.id()]=this,this.axes([])}),this.rspd("addAxis",function(a,b,c,d){a.binding()&&a.binding().removeAxis(a),a.binding(this),b=a.toRealValue(b),c=a.toRealValue(c),this.axes().push({axis:a,multigraph:d,factor:1/(c-b),offset:-b/(c-b),min:b,max:c})}),this.rspd("removeAxis",function(a){var b,c=this.axes();for(b=0;b<c.length();++b)if(c[b].axis===a){c.splice(b,1);break}}),this.rspd("sync",function(){var a,b,c=this.axes();for(a=0;a<c.length;++a)if(b=c[a].axis,b.hasDataMin()&&b.hasDataMax())return b.setDataRange(b.dataMin(),b.dataMax()),!0;return!1}),this.rspd("setDataRange",function(a,b,c,d){var e,f,g,h,i,j=this.axes(),k=a.toRealValue(b),l=a.toRealValue(c),m=[];for(void 0===d&&(d=!0),f=0;f<j.length;++f)if(j[f].axis===a){e=f,m=[j[f].multigraph];break}for(f=0;f<j.length;++f)if(h=j[f],f===e)h.axis.setDataRangeNoBind(k,l,d);else if(h.axis.setDataRangeNoBind((k*j[e].factor+j[e].offset-h.offset)/h.factor,(l*j[e].factor+j[e].offset-h.offset)/h.factor,d),void 0!==h.multigraph){for(i=!1,g=0;g<m.length;++g)if(h.multigraph===m[g]){i=!0;break}i||(h.multigraph.redraw(),m.push(h.multigraph))}}),a.getInstanceById=function(b){return a.instances[b]},a.findByIdOrCreateNew=function(b){var c=a.getInstanceById(b);return c||(c=new a(b)),c},a.syncAllBindings=function(){var b;for(b in a.instances)a.instances[b].sync()},a.forgetAllBindings=function(){var b,c,d;for(b in a.instances)for(d=a.instances[b],c=0;c<d.axes().length;++c)d.axes()[c].axis.binding(null);a.instances={}}})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.horizontalaxis.title);b=new window.jermaine.Model("AxisTitle",function(){this.hasA("axis").vlds(function(a){return a instanceof window.multigraph.core.Axis}),this.hasA("content").vlds(function(a){return a instanceof window.multigraph.core.Text}),this.hasA("anchor").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("base").isA("number"),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("angle").isA("number"),this.isBuiltWith("axis"),this.rspd("initializeGeometry",function(b,c){var e=d.horizontalaxis.title,f=this.axis(),g=this.position,h=this.anchor,i=b.plotBox(),j=f.perpOffset(),k=f.orientation()===a.Axis.HORIZONTAL,l=function(a){return"function"==typeof a?a():a};return void 0===g()&&g(k?j>i.height()/2?l(e["position-horizontal-top"]):l(e["position-horizontal-bottom"]):j>i.width()/2?l(e["position-vertical-right"]):l(e["position-vertical-left"])),void 0===h()&&h(k?j>i.height()/2?l(e["anchor-horizontal-top"]):l(e["anchor-horizontal-bottom"]):j>i.width()/2?l(e["anchor-vertical-right"]):l(e["anchor-vertical-left"])),c.angle=this.angle(),this.content().initializeGeometry(c),this}),this.rspd("render",function(){}),c.insertDefaults(this,d.horizontalaxis.title,e)}),a.AxisTitle=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";{var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD();c.getKeys(d.background)}b=new window.jermaine.Model("Background",function(){this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}).dflt(window.multigraph.math.RGBColor.parse(d.background.color)),this.hasA("img").vlds(function(b){return b instanceof a.Img})}),a.Background=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.plot);a.ConstantPlot=new window.jermaine.Model("ConstantPlot",function(){this.isA(a.Plot),this.hasA("constantValue").vlds(a.DataValue.isInstance),this.isBuiltWith("constantValue"),b.insertDefaults(this,c.plot,d),this.rspd("render",function(a,b){var c=this.horizontalaxis(),d=this.renderer(),e=this.constantValue();c.hasDataMin()&&c.hasDataMax()&&(d.setUpMissing(),d.begin(b),d.dataPoint([c.dataMin(),e]),d.dataPoint([c.dataMax(),e]),d.end())})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.jermaine.Model(function(){var b=a.ArrayData;this.isA(b),this.hasA("filename").isA("string"),this.hasA("messageHandler"),this.hasA("ajaxthrottle"),this.hasA("dataIsReady").isA("boolean").dflt(!1),this.rspd("getIterator",function(a,c,d,e){return this.dataIsReady()?b.getArrayDataIterator(this,a,c,d,e):{next:function(){},hasNext:function(){return!1}}}),this.rspd("_displayError",function(a){if(!this.messageHandler())throw a;this.messageHandler().error(a)}),this.isBuiltWith("columns","filename","%messageHandler","%ajaxthrottle",function(){var a=this,c=this.ajaxthrottle();void 0===c&&(c=window.multigraph.jQuery),this.adapter(b),this.init(),void 0!==a.filename()&&(a.emit({type:"ajaxEvent",action:"start"}),c.ajax({url:a.filename(),success:function(b){var c=a.adapter().textToStringArray(a.getColumns(),b);a.stringArray(c),a.ajaxNormalize(),a.dataIsReady(!0),a.emit({type:"dataReady"})},error:function(b,c,d){var e=d;404===b.statusCode().status?e="File not found: '"+a.filename()+'"':c&&(e=c+": "+e),a._displayError(new Error(e))},complete:function(){a.emit({type:"ajaxEvent",action:"complete"})}}))})});a.CSVData=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.plot);b=new window.jermaine.Model("DataPlot",function(){this.isA(a.Plot),this.hasMany("variable").validateWith(function(b){return b instanceof a.DataVariable||null===b}),this.hasA("filter").vlds(function(b){return b instanceof a.Filter}),this.hasA("datatips").vlds(function(b){return b instanceof a.Datatips}),this.hasA("data").vlds(function(b){return b instanceof a.Data}),c.insertDefaults(this,d.plot,e),this.rspd("render",function(a,b){var c=this.data();if(c){{var d=this.horizontalaxis();this.verticalaxis()}if(d.hasDataMin()&&d.hasDataMax()){var e,f=this.variable(),g=[];for(e=0;e<f.size();++e)g.push(f.at(e).id());var h=c.getIterator(g,d.dataMin(),d.dataMax(),1),i=this.renderer();for(i.setUpMissing(),i.begin(b);h.hasNext();){var j=h.next();i.dataPoint(j)}i.end()}}})}),a.DataPlot=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.plot.datatips);b=new window.jermaine.Model("Datatips",function(){this.hasMany("variables").validateWith(function(b){return b instanceof a.DatatipsVariable}),this.hasA("format").vlds(function(a){return"string"==typeof a}),this.hasA("bgcolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("bgalpha").vlds(function(a){return"string"==typeof a}),this.hasA("border").isA("integer"),this.hasA("bordercolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("pad").isA("integer"),c.insertDefaults(this,d.plot.datatips,e)}),a.Datatips=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.plot.datatips.variable),e=new window.jermaine.Model("DatatipsVariable",function(){this.hasA("format").vlds(function(a){return"string"==typeof a}),b.insertDefaults(this,c.plot.datatips.variable,d)});a.DatatipsVariable=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=function(a){var c;if("string"!=typeof a)throw new Error("format must be a string");this.formatString=a,c=b.formatInternally(a,new Date(0)),this.length=c.length};b.prototype.format=function(a){return b.formatInternally(this.formatString,a.value)},b.prototype.getMaxLength=function(){return this.length},b.prototype.getFormatString=function(){return this.formatString},b.formatInternally=function(a,b){var c,d,e,f={shortNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},g={shortNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longNames:["January","February","March","April","May","June","July","August","September","October","November","December"]},h=0,i="";for(d=0;d<a.length;d++)switch(c=a.charAt(d),h){case 0:"%"===c?h=1:i+=c;break;case 1:switch(c){case"Y":i+=b.getUTCFullYear().toString();break;case"y":i+=b.getUTCFullYear().toString().substr(2,2);break;case"M":i+=sprintf("%02s",(b.getUTCMonth()+1).toString());break;case"m":i+=(b.getUTCMonth()+1).toString();break;case"N":i+=g.longNames[b.getUTCMonth()];break;case"n":i+=g.shortNames[b.getUTCMonth()];break;case"D":i+=sprintf("%02s",b.getUTCDate().toString());break;case"d":i+=b.getUTCDate().toString();break;case"W":i+=f.longNames[b.getUTCDay()];break;case"w":i+=f.shortNames[b.getUTCDay()];break;case"H":i+=sprintf("%02s",b.getUTCHours().toString());break;case"h":e=b.getUTCHours()%12,i+=0===e?"12":e.toString();break;case"i":i+=sprintf("%02s",b.getUTCMinutes().toString());break;case"s":i+=sprintf("%02s",b.getUTCSeconds().toString());break;case"v":i+=sprintf("%03s",b.getUTCMilliseconds().toString()).substr(0,1);break;case"V":i+=sprintf("%03s",b.getUTCMilliseconds().toString()).substr(0,2);break;case"q":i+=sprintf("%03s",b.getUTCMilliseconds().toString());break;case"P":e=b.getUTCHours(),i+=12>e?"AM":"PM";break;case"p":e=b.getUTCHours(),i+=12>e?"am":"pm";break;case"L":i+="\n";break;case"%":i+="%";break;default:throw new Error("Invalid character code for datetime formatting string")}h=0}return i},a.DatetimeFormatter=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=new window.multigraph.math.Enum("DatetimeUnit");b=function(a,c){if("number"!=typeof a||b.isUnit(c)!==!0)throw new Error("Improper input for Datetime Measure's constructor");if(2!==arguments.length)throw new Error("Datetime Measure's contructor requires exactly two arguments");this.measure=a,this.unit=c},b.isUnit=function(a){return c.isInstance(a)},b.prototype.negative=function(){return new b(-this.measure,this.unit)},b.prototype.getRealValue=function(){var a;switch(this.unit){case b.MILLISECOND:a=1;break;case b.SECOND:a=1e3;break;case b.MINUTE:a=6e4;break;case b.HOUR:a=36e5;break;case b.DAY:a=864e5;break;case b.WEEK:a=6048e5;break;case b.MONTH:a=2592e6;break;case b.YEAR:a=31536e6}return this.measure*a},b.parse=function(a){var d,e,f;if("string"!=typeof a||null===a.match(/\s*-?(([0-9]+\.?[0-9]*)|([0-9]*\.?[0-9]+))\s*(ms|s|m|H|D|W|M|Y){1}\s*$/))throw new Error("Improper input for Datetime Measure's parse method");return d=/ms|s|m|H|D|W|M|Y/,e=parseFloat(a.replace(d,"")),f=a.match(d),f=c.parse(f[0]),new b(e,f)},b.findTickmarkWithMillisecondSpacing=function(b,c,d){var e=b-c,f=Math.floor(e/d);return e%d!==0&&++f,new a.DatetimeValue(c+f*d)},b.findTickmarkWithMonthSpacing=function(a,c,d){var e=a.value,f=c.value,g=12*(e.getUTCFullYear()-f.getUTCFullYear())+(e.getUTCMonth()-f.getUTCMonth()),h=Math.floor(g/d);return g%d!==0?++h:e.getUTCDate()>f.getUTCDate()?++h:e.getUTCDate()===f.getUTCDate()&&e.getUTCHours()>f.getUTCHours()?++h:e.getUTCDate()===f.getUTCDate()&&e.getUTCHours()===f.getUTCHours()&&e.getUTCMinutes()>f.getUTCMinutes()?++h:e.getUTCDate()===f.getUTCDate()&&e.getUTCHours()===f.getUTCHours()&&e.getUTCMinutes()===f.getUTCMinutes()&&e.getUTCSeconds()>f.getUTCSeconds()?++h:e.getUTCDate()===f.getUTCDate()&&e.getUTCHours()===f.getUTCHours()&&e.getUTCMinutes()===f.getUTCMinutes()&&e.getUTCSeconds()===f.getUTCSeconds()&&e.getUTCMilliseconds()>f.getUTCMilliseconds()&&++h,c.add(b.parse(h*d+"M"))},b.prototype.firstSpacingLocationAtOrAfter=function(a,c){switch(this.unit){case b.MONTH:return b.findTickmarkWithMonthSpacing(a,c,this.measure);case b.YEAR:return b.findTickmarkWithMonthSpacing(a,c,12*this.measure);default:return b.findTickmarkWithMillisecondSpacing(a.getRealValue(),c.getRealValue(),this.getRealValue())}},b.prototype.lastSpacingLocationAtOrBefore=function(a,b){var c=this.firstSpacingLocationAtOrAfter(a,b);if(c.eq(a))return c;var d=c.add(this.negative());return d},b.prototype.toString=function(){return this.measure.toString()+this.unit.toString()},b.MILLISECOND=new c("ms"),b.SECOND=new c("s"),b.MINUTE=new c("m"),b.HOUR=new c("H"),b.DAY=new c("D"),b.WEEK=new c("W"),b.MONTH=new c("M"),b.YEAR=new c("Y"),a.DatetimeMeasure=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=function(a){if("number"!=typeof a)throw new Error("DatetimeValue requires its parameter to be a number");this.value=new Date(a)};b.prototype.getRealValue=function(){return this.value.getTime()},b.prototype.type=a.DataValue.DATETIME,b.prototype.clone=function(){return new b(this.getRealValue())},b.parse=function(a){var c=0,d=0,e=1,f=0,g=0,h=0,i=0;if("string"!=typeof a)throw new Error("Datetime Value's parse method requires its parameter to be a string");if(a=a.replace(/[\.\-\:\s]/g,""),4===a.length)c=parseInt(a,10);else if(6===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1;else if(8===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1,e=parseInt(a.substring(6,8),10);else if(10===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1,e=parseInt(a.substring(6,8),10),f=parseInt(a.substring(8,10),10);else if(12===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1,e=parseInt(a.substring(6,8),10),f=parseInt(a.substring(8,10),10),g=parseInt(a.substring(10,12),10);else if(14===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1,e=parseInt(a.substring(6,8),10),f=parseInt(a.substring(8,10),10),g=parseInt(a.substring(10,12),10),h=parseInt(a.substring(12,14),10);else if(15===a.length||16===a.length||17===a.length)c=parseInt(a.substring(0,4),10),d=parseInt(a.substring(4,6),10)-1,e=parseInt(a.substring(6,8),10),f=parseInt(a.substring(8,10),10),g=parseInt(a.substring(10,12),10),h=parseInt(a.substring(12,14),10),i=parseInt(a.substring(14,17),10);else{if("0"!==a)throw new Error("Incorrect input format for Datetime Value's parse method");c=1970}return new b(Date.UTC(c,d,e,f,g,h,i))},b.prototype.toString=function(){var a,b,c,d,e,f,g;return a=sprintf("%04s",this.value.getUTCFullYear().toString()),b=sprintf("%02s",(this.value.getUTCMonth()+1).toString()),c=sprintf("%02s",this.value.getUTCDate().toString()),d=sprintf("%02s",this.value.getUTCHours().toString()),e=sprintf("%02s",this.value.getUTCMinutes().toString()),f=sprintf("%02s",this.value.getUTCSeconds().toString()),g="."+sprintf("%03s",this.value.getUTCMilliseconds().toString()),".000"===g&&(g=""),a+b+c+d+e+f+g},b.prototype.compareTo=function(a){return this.getRealValue()<a.getRealValue()?-1:this.getRealValue()>a.getRealValue()?1:0},b.prototype.addRealValue=function(a){return new b(this.value.getTime()+a)},b.prototype.add=function(c){var d=new b(this.getRealValue());switch(c.unit){case a.DatetimeMeasure.MILLISECOND:d.value.setUTCMilliseconds(d.value.getUTCMilliseconds()+c.measure);break;case a.DatetimeMeasure.SECOND:d.value.setUTCSeconds(d.value.getUTCSeconds()+c.measure);break;case a.DatetimeMeasure.MINUTE:d.value.setUTCMinutes(d.value.getUTCMinutes()+c.measure);break;case a.DatetimeMeasure.HOUR:d.value.setUTCHours(d.value.getUTCHours()+c.measure);break;case a.DatetimeMeasure.DAY:d.value.setUTCDate(d.value.getUTCDate()+c.measure);break;case a.DatetimeMeasure.WEEK:d.value.setUTCDate(d.value.getUTCDate()+7*c.measure);break;case a.DatetimeMeasure.MONTH:d.value.setUTCMonth(d.value.getUTCMonth()+c.measure);break;case a.DatetimeMeasure.YEAR:d.value.setUTCFullYear(d.value.getUTCFullYear()+c.measure)}return d},a.DataValue.mixinComparators(b.prototype),a.DatetimeValue=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.plot.filter);b=new window.jermaine.Model("Filter",function(){this.hasMany("options").vlds(function(b){return b instanceof a.FilterOption}),this.hasA("type").vlds(function(a){return"string"==typeof a}),c.insertDefaults(this,d.plot.filter,e)}),a.Filter=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.plot.filter.option),e=new window.jermaine.Model("FilterOption",function(){this.hasA("name").vlds(function(a){return"string"==typeof a}),this.hasA("value").vlds(function(a){return"string"==typeof a}),b.insertDefaults(this,c.plot.filter.option,d)});a.FilterOption=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.math.Box,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d),f=new window.jermaine.Model("Graph",function(){this.hasA("window").vlds(function(b){return b instanceof a.Window}),this.hasA("plotarea").vlds(function(b){return b instanceof a.Plotarea}),this.hasA("legend").vlds(function(b){return b instanceof a.Legend}),this.hasA("background").vlds(function(b){return b instanceof a.Background}),this.hasA("title").vlds(function(b){return b instanceof a.Title}),this.hasMany("axes").validateWith(function(b){return b instanceof a.Axis}),this.hasMany("plots").validateWith(function(b){return b instanceof a.Plot}),this.hasMany("data").validateWith(function(b){return b instanceof a.Data}),this.hasA("windowBox").vlds(function(a){return a instanceof b}),this.hasA("paddingBox").vlds(function(a){return a instanceof b}),this.hasA("plotBox").vlds(function(a){return a instanceof b}),this.hasA("multigraph").vlds(function(a){return a instanceof window.multigraph.core.Multigraph}),this.hasA("x0").isA("number"),this.hasA("y0").isA("number"),this.isBuiltWith(function(){this.window(new a.Window),this.plotarea(new a.Plotarea),this.background(new a.Background)}),this.rspd("postParse",function(){var a,b=this,c=function(a){"start"===a.action?b.multigraph()&&b.multigraph().busySpinnerLevel(1):"complete"===a.action&&b.multigraph()&&b.multigraph().busySpinnerLevel(-1)};for(a=0;a<this.data().size();++a)this.data().at(a).addListener("ajaxEvent",c)}),this.rspd("initializeGeometry",function(a,c,d){var e,f=this.window(),g=f.border(),h=f.margin(),i=f.padding(),j=this.plotarea(),k=j.border(),l=j.margin();for(this.windowBox(new b(a,c)),this.paddingBox(new b(a-(h.left()+g+i.left())-(h.right()+g+i.right()),c-(h.top()+g+i.top())-(h.bottom()+g+i.bottom()))),this.plotBox(new b(this.paddingBox().width()-(l.left()+l.right()+2*k),this.paddingBox().height()-(l.top()+l.bottom()+2*k))),e=0;e<this.axes().size();++e)this.axes().at(e).initializeGeometry(this,d);this.legend()&&this.legend().initializeGeometry(this,d),this.title()&&this.title().initializeGeometry(d),this.x0(h.left()+g+i.left()+l.left()+k),this.y0(h.bottom()+g+i.bottom()+l.bottom()+k)}),this.rspd("registerCommonDataCallback",function(a){var b;for(b=0;b<this.data().size();++b)this.data().at(b).addListener("dataReady",a)}),this.rspd("pauseAllData",function(){var a;for(a=0;a<this.data().size();++a)this.data().at(a).pause()}),this.rspd("resumeAllData",function(){var a;for(a=0;a<this.data().size();++a)this.data().at(a).resume()}),this.rspd("findNearestAxis",function(a,b,c){var d,e,f,g=null,h=9999,i=this.axes(),j=this.axes().size();for(e=0;j>e;++e)d=i.at(e),(void 0===c||null===c||d.orientation()===c)&&(f=d.distanceToPoint(a,b),(null===g||h>f)&&(g=d,h=f));return g}),this.rspd("axisById",function(a){var b,c=this.axes();for(b=0;b<c.size();++b)if(c.at(b).id()===a)return c.at(b);return void 0}),this.rspd("variableById",function(a){var b,c,d,e=this.data();for(c=0;c<e.size();++c)for(b=e.at(c).columns(),d=0;d<b.size();++d)if(b.at(d).id()===a)return b.at(d);return void 0}),c.insertDefaults(this,d,e)});a.Graph=f}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.title);b=new window.jermaine.Model("GraphTitle",function(){this.hasA("graph").vlds(function(a){return a instanceof window.multigraph.core.Graph}),this.hasA("text").vlds(function(a){return a instanceof window.multigraph.core.Text}),this.hasA("frame").isA("string"),this.hasA("border").isAn("integer"),this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("bordercolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("opacity").isA("number"),this.hasA("padding").isAn("integer"),this.hasA("cornerradius").isAn("integer"),this.hasA("anchor").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("base").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("fontSize").isA("string").dflt("18px"),this.rspd("initializeGeometry",function(a){return a.fontSize=this.fontSize(),this.text().initializeGeometry(a),this}),this.rspd("render",function(){}),this.isBuiltWith("text","graph"),c.insertDefaults(this,d.title,e)}),a.Title=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.horizontalaxis.grid),e=new window.jermaine.Model("Grid",function(){this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("visible").isA("boolean"),b.insertDefaults(this,c.horizontalaxis.grid,d)});a.Grid=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.legend.icon),e=new window.jermaine.Model("Icon",function(){this.hasA("height").isA("integer"),this.hasA("width").isA("integer"),this.hasA("border").isA("integer"),b.insertDefaults(this,c.legend.icon,d)});a.Icon=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.background.img),e=new window.jermaine.Model("Img",function(){this.hasA("src").isA("string"),this.hasA("anchor").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("base").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("frame").vlds(function(a){return a===e.PADDING||a===e.PLOT}),this.isBuiltWith("src"),b.insertDefaults(this,c.background.img,d)});e.PADDING="padding",e.PLOT="plot",a.Img=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.horizontalaxis.labels.label),e=a.Axis,f=a.DataValue,g=new window.jermaine.Model("Labeler",function(){var g=function(a){return"function"==typeof a?a():a};this.hasA("axis").vlds(function(b){return b instanceof a.Axis}),this.hasA("formatter").vlds(a.DataFormatter.isInstance),this.hasA("start").vlds(a.DataValue.isInstance),this.hasA("angle").isA("number"),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("anchor").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("spacing").vlds(a.DataMeasure.isInstance),this.hasA("densityfactor").isA("number").dflt(1),this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("visible").isA("boolean").dflt(!0),this.isBuiltWith("axis",function(){var a=c.horizontalaxis.labels;this.start(g(this.axis().type()===f.DATETIME?a["start-datetime"]:a["start-number"]))}),this.rspd("initializeGeometry",function(a){var b=this.axis(),d=a.plotBox(),f=c.horizontalaxis.labels.label;void 0===this.position()&&this.position(b.orientation()===e.HORIZONTAL?b.perpOffset()>d.height()/2?g(f["position-horizontal-top"]):g(f["position-horizontal-bottom"]):b.perpOffset()>d.width()/2?g(f["position-vertical-right"]):g(f["position-vertical-left"])),void 0===this.anchor()&&this.anchor(b.orientation()===e.HORIZONTAL?b.perpOffset()>d.height()/2?g(f["anchor-horizontal-top"]):g(f["anchor-horizontal-bottom"]):b.perpOffset()>d.width()/2?g(f["anchor-vertical-right"]):g(f["anchor-vertical-left"]))}),this.rspd("isEqualExceptForSpacing",function(a){return this.axis()===a.axis()&&this.formatter().getFormatString()===a.formatter().getFormatString()&&this.start().eq(a.start())&&this.angle()===a.angle()&&this.position().eq(a.position())&&this.anchor().eq(a.anchor())&&this.densityfactor()===a.densityfactor()}),this.hasA("iteratorNextValue").vlds(a.DataValue.isInstanceOrNull).dflt(null),this.hasA("iteratorMinValue").vlds(a.DataValue.isInstance),this.hasA("iteratorMaxValue").vlds(a.DataValue.isInstance),this.rspd("prepare",function(a,b){this.iteratorMinValue(a),this.iteratorMaxValue(b),this.iteratorNextValue(this.spacing().firstSpacingLocationAtOrAfter(a,this.start()))}),this.rspd("hasNext",function(){var a=this.iteratorNextValue();return null===a||void 0===a?!1:a.le(this.iteratorMaxValue())}),this.rspd("peekNext",function(){var a=this.iteratorNextValue(),b=this.iteratorMaxValue();return null===a||void 0===a?void 0:void 0!==b&&a.gt(b)?void 0:a}),this.rspd("next",function(){var a=this.iteratorNextValue(),b=this.iteratorMaxValue();return null===a||void 0===a?void 0:void 0!==b&&a.gt(b)?void 0:(this.iteratorNextValue(a.add(this.spacing())),a)}),this.rspd("getLabelDensity",function(a){var b=this.axis(),c=this.spacing().getRealValue()*b.axisToDataRatio(),d=b.dataMin().getRealValue(),g=b.dataMax().getRealValue(),h=d+.51234567*(g-d),i=f.create(b.type(),h),j=this.formatter().format(i),k=b.orientation()===e.HORIZONTAL?this.measureStringWidth(a,j):this.measureStringHeight(a,j);return k/(c*this.densityfactor())}),this.rspd("measureStringWidth",function(a,b){return 30*b.length}),this.rspd("measureStringHeight",function(a,b){return 30*b.length}),this.rspd("renderLabel",function(){}),b.insertDefaults(this,c.horizontalaxis.labels.label,d)});a.Labeler=g}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.legend);b=new window.jermaine.Model("Legend",function(){this.hasA("visible").vlds(function(a){return"boolean"==typeof a||null===a}),this.hasA("base").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("anchor").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("position").vlds(function(a){return a instanceof window.multigraph.math.Point}),this.hasA("frame").vlds(function(a){return"plot"===a||"padding"===a}),this.hasA("color").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("bordercolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),this.hasA("opacity").vlds(function(a){return c.validateNumberRange(a,0,1)}),this.hasA("border").isA("integer"),this.hasA("rows").isA("integer").isGreaterThan(0),this.hasA("columns").isA("integer").isGreaterThan(0),this.hasA("cornerradius").isA("integer"),this.hasA("padding").isA("integer"),this.hasA("icon").vlds(function(b){return b instanceof a.Icon}),this.isBuiltWith(function(){this.icon(new a.Icon)}),this.hasMany("plots").validateWith(function(b){return b instanceof a.Plot}),this.hasA("iconOffset").isAn("integer").dflt(5),this.hasA("labelOffset").isAn("integer").dflt(5),this.hasA("labelEnding").isAn("integer").dflt(15),this.hasA("width").isA("number"),this.hasA("height").isA("number"),this.hasA("x").isA("number"),this.hasA("y").isA("number"),this.hasA("blockWidth").isA("number"),this.hasA("blockHeight").isA("number"),this.hasA("maxLabelWidth").isA("number"),this.hasA("maxLabelHeight").isA("number"),this.rspd("determineVisibility",function(){switch(this.visible()){case!0:return!0;
    case!1:return!1;case null:return this.plots().size()>1?!0:!1}}),this.rspd("initializeGeometry",function(a,b){var c,d,e=this.anchor(),f=this.base(),g=this.position(),h=this.iconOffset(),i=[],j=[];if(this.determineVisibility()===!1)return this;for(d=0;d<this.plots().size();d++)c=this.plots().at(d).legend().label(),void 0!==c&&(c.initializeGeometry(b),i.push(c.origWidth()),j.push(c.origHeight()));return i.sort(function(a,b){return b-a}),j.sort(function(a,b){return b-a}),this.maxLabelWidth(i[0]),this.maxLabelHeight(Math.max(j[0],this.icon().height())),this.blockWidth(h+this.icon().width()+this.labelOffset()+this.maxLabelWidth()+this.labelEnding()),this.blockHeight(h+this.maxLabelHeight()),this.width(2*this.border()+this.columns()*this.blockWidth()),this.height(2*this.border()+this.rows()*this.blockHeight()+h),"padding"===this.frame()?(this.x((f.x()+1)*a.paddingBox().width()/2-(e.x()+1)*this.width()/2+g.x()),this.y((f.y()+1)*a.paddingBox().height()/2-(e.y()+1)*this.height()/2+g.y())):(this.x((f.x()+1)*a.plotBox().width()/2-(e.x()+1)*this.width()/2+g.x()),this.y((f.y()+1)*a.plotBox().height()/2-(e.y()+1)*this.height()/2+g.y())),this}),this.rspd("render",function(a){var b,c,d,e,f,g,h,i,j=this.plots(),k=this.icon(),l=0;if(this.determineVisibility()===!1)return this;for(this.begin(a),this.renderLegend(a),h=0;h<this.rows()&&!(l>=j.size());h++)for(c=this.border()+(this.rows()-h-1)*this.blockHeight(),e=c+this.iconOffset(),g=e,i=0;i<this.columns()&&!(l>=j.size());i++)b=this.border()+i*this.blockWidth(),d=b+this.iconOffset(),f=d+k.width()+this.labelOffset(),j.at(l).renderer().renderLegendIcon(a,d,e,k,this.opacity()),k.border()>0&&k.renderBorder(a,d,e,this.opacity()),this.renderLabel(j.at(l).legend().label(),a,f,g),l++;return this.end(a),this}),c.insertDefaults(this,d.legend,e)}),a.Legend=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=new window.jermaine.Model("Mixin",function(){this.hasMany("mixinfuncs"),this.hasA("applied").isA("boolean").dflt(!1),this.rspd("add",function(a){this.mixinfuncs().add(a)}),this.rspd("apply",function(){if(!this.applied()){var a;for(a=0;a<this.mixinfuncs().size();++a)this.mixinfuncs().at(a).apply(this,arguments)}this.applied(!0)}),this.rspd("reapply",function(){this.applied(!1),this.apply.apply(this,arguments)})});a.Mixin=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.jQuery;window.multigraph.adapters={};var c=new window.jermaine.Model("Multigraph",function(){this.hasMany("graphs").validateWith(function(b){return b instanceof a.Graph}),this.hasA("div"),this.hasA("mugl"),this.hasA("ajaxthrottles"),this.isBuiltWith(function(){this.ajaxthrottles([])}),this.rspd("addAjaxThrottle",function(a,c,d,e){this.ajaxthrottles().push({regex:a?new RegExp(a):void 0,ajaxthrottle:b.ajaxthrottle({numRequestsPerTimePeriod:parseInt(c,10),timePeriod:parseInt(d,10),maxConcurrent:parseInt(e,10)})})}),this.rspd("getAjaxThrottle",function(a){var c=void 0;return b.each(this.ajaxthrottles(),function(){return!this.regex||this.regex.test(a)?(c=this.ajaxthrottle,!1):!0}),c}),this.rspd("rebaseUrl",function(a){var b=this.mugl();return b?/^\//.test(a)?a:/:\/\//.test(a)?a:(/^\//.test(b)||/:\/\//.test(b)||/^\.\//.test(b)||(b="./"+b),b=b.replace(/\?.*$/,""),b=b.replace(/\/[^\/]*$/,"/"),b+a):a}),this.hasA("busySpinner"),this.rspd("busySpinnerLevel",function(a){this.busySpinner()&&b(this.busySpinner()).busy_spinner("level",a)}),this.rspd("initializeGeometry",function(a,b,c){var d;for(d=0;d<this.graphs().size();++d)this.graphs().at(d).initializeGeometry(a,b,c)}),this.rspd("registerCommonDataCallback",function(a){var b;for(b=0;b<this.graphs().size();++b)this.graphs().at(b).registerCommonDataCallback(a)})});a.browserHasCanvasSupport=function(){return!!window.HTMLCanvasElement&&!!window.CanvasRenderingContext2D&&function(a){return!(!a.getContext||!a.getContext("2d"))}(document.createElement("canvas"))},a.browserHasSVGSupport=function(){return!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect},c.createGraph=function(d){var e,f,g=d.div;return d.driver||(d.driver=a.browserHasCanvasSupport()?"canvas":"raphael"),"string"==typeof g&&(g=b("#"+g)[0]),void 0!==d.width&&d.width>0&&b(g).width(d.width),void 0!==d.height&&d.height>0&&b(g).height(d.height),e={},"function"==typeof d.error&&(e.error=d.error),"function"==typeof d.warning&&(e.warning=d.warning),e.error&&e.warning||(f=c.createDefaultMessageHandlers(g),e.error||(e.error=f.error),e.warning||(e.warning=f.warning)),d.messageHandler=e,void 0!==d.muglString?"canvas"===d.driver?c.createCanvasGraphFromString(d):"raphael"===d.driver?c.createRaphaelGraphFromString(d):void d.messageHanlder.error(new Error("invalid graphic driver '"+d.driver+"' specified to Multigraph.createGraph")):"canvas"===d.driver?c.createCanvasGraph(d):"raphael"===d.driver?c.createRaphaelGraph(d):void d.messageHanlder.error(new Error("invalid graphic driver '"+d.driver+"' specified to Multigraph.createGraph"))},window.multigraph.create=c.createGraph,c.createDefaultMessageHandlers=function(a){return b(a).css("position","relative"),b(a).errorDisplay({}),{error:function(c){var d=c.stack&&"string"==typeof c.stack?c.stack.replace(/\n/g,"</li><li>"):c.message;b(a).errorDisplay("displayError",d,c.message,{fontColor:"#000000",backgroundColor:"#ff0000",indicatorColor:"#ff0000"})},warning:function(c){var d="Warning: "+("string"==typeof c?c:c.message),e="string"!=typeof c&&c.stack&&"string"==typeof c.stack?c.stack.replace(/\n/g,"</li><li>"):d;b(a).errorDisplay("displayError",e,d,{fontColor:"#000000",backgroundColor:"#e06a1b",indicatorColor:"#e06a1b"})}}},a.Multigraph=c}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=function(a){var b;if("string"!=typeof a)throw new Error("format must be a string");this.formatString=a,b=sprintf(a,0),this.length=b.length};b.prototype.format=function(a){return sprintf(this.formatString,a.getRealValue())},b.prototype.getMaxLength=function(){return this.length},b.prototype.getFormatString=function(){return this.formatString},a.NumberFormatter=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=1e-12,c=function(a){this.measure=a};c.prototype.getRealValue=function(){return this.measure},c.prototype.toString=function(){return this.measure.toString()},c.prototype.firstSpacingLocationAtOrAfter=function(c,d){var e,f,g,h=d.value,i=c.value,j=Math.abs(this.measure);return e=(i-h)/j,f=Math.floor(e),g=f+1,new a.NumberValue(b>e-f||b>g-e?i:h+j*g)},c.parse=function(a){return new c(parseFloat(a))},a.NumberMeasure=c}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=function(a){this.value=a};b.prototype.getRealValue=function(){return this.value},b.prototype.toString=function(){return this.value.toString()},b.prototype.compareTo=function(a){return this.value<a.value?-1:this.value>a.value?1:0},b.prototype.addRealValue=function(a){return new b(this.value+a)},b.prototype.add=function(a){return new b(this.value+a.measure)},b.prototype.type=a.DataValue.NUMBER,b.prototype.clone=function(){return new b(this.value)},b.parse=function(a){return new b(parseFloat(a))},a.DataValue.mixinComparators(b.prototype),a.NumberValue=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b,c=window.multigraph.utilityFunctions,d=c.getDefaultValuesFromXSD(),e=c.getKeys(d.horizontalaxis.pan);b=new window.jermaine.Model("Pan",function(){this.hasA("allowed").isA("boolean"),this.hasA("min").vlds(a.DataValue.isInstanceOrNull),this.hasA("max").vlds(a.DataValue.isInstanceOrNull),c.insertDefaults(this,d.horizontalaxis.pan,e)}),a.Pan=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.PeriodicArrayData=window.jermaine.Model(function(){var b=this,c={next:function(){},hasNext:function(){return!1}};this.isA(a.ArrayData),this.hasA("period").vlds(a.DataMeasure.isInstance),this.isBuiltWith("columns","stringArray","period",function(){this.init(),this.addListener("listenerAdded",function(a){var b=this.array();"dataReady"===a.targetType&&a.listener(b[0][0],b[b.length-1][0])})}),this.rspd("getIterator",function(a,c,d,e){return b.getArrayDataIterator(this,a,c,d,e)}),b.getArrayDataIterator=function(b,d,e,f,g){var h,i,j,k,l=a.DataValue,m=b.array();if(g=g||0,"[object Array]"!==Object.prototype.toString.apply(d))throw new Error("ArrayData: getIterator method requires that the first parameter be an array of strings");for(h=0;h<d.length;++h)if("string"!=typeof d[h])throw new Error("ArrayData: getIterator method requires that the first parameter be an array of strings");if(!l.isInstance(e)||!l.isInstance(f))throw new Error("ArrayData: getIterator method requires the second and third argument to be number values");if("number"!=typeof g)throw new Error("ArrayData: getIterator method requires last argument to be an integer");if(0===m.length)return c;var n=m[0][0],o=b.period().lastSpacingLocationAtOrBefore(e,n),p=o.getRealValue()-n.getRealValue(),q=l.create(e.type,e.getRealValue()-p);for(j=0;j<m.length&&!m[j][0].ge(q);++j);if(j===m.length)return c;var r=l.create(m[j][0].type,m[j][0].getRealValue()+p);for(k=[],i=0;i<d.length;++i){var s=b.columnIdToColumnNumber(d[i]);k.push(s)}return{next:function(){var c,d=[];if(0>j)return null;for(c=0;c<k.length;++c)d.push(0===k[c]?r:m[j][k[c]]);return++j,j>=m.length&&(j=0,o=o.add(b.period()),p=o.getRealValue()-n.getRealValue()),r=a.DataValue.create(m[j][0].type,m[j][0].getRealValue()+p),r.gt(f)&&(j=-1),d},hasNext:function(){return j>=0}}}})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.plot.legend),e=new window.jermaine.Model("PlotLegend",function(){this.hasA("visible").isA("boolean"),this.hasA("label").vlds(function(b){return b instanceof a.Text}),b.insertDefaults(this,c.plot.legend,d)});a.PlotLegend=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.plotarea),e=new window.jermaine.Model("Plotarea",function(){this.hasA("margin").vlds(function(a){return a instanceof window.multigraph.math.Insets}),this.hasA("border").isA("integer"),this.hasA("color").vlds(function(a){return null===a||a instanceof window.multigraph.math.RGBColor}),this.hasA("bordercolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),b.insertDefaults(this,c.plotarea,d)});a.Plotarea=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b;b=new window.jermaine.Model("BandRenderer",function(){this.isA(a.Renderer),this.hasA("numberOfVariables").dflt(3)}),b.GRAY=parseInt("80",16)/255,a.Renderer.declareOptions(b,"BandRendererOptions",[{name:"linecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"linewidth",type:a.Renderer.NumberOption,"default":1},{name:"line1color",type:a.Renderer.RGBColorOption,"default":null},{name:"line1width",type:a.Renderer.NumberOption,"default":-1},{name:"line2color",type:a.Renderer.RGBColorOption,"default":null},{name:"line2width",type:a.Renderer.NumberOption,"default":-1},{name:"fillcolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(b.GRAY,b.GRAY,b.GRAY)},{name:"fillopacity",type:a.Renderer.NumberOption,"default":1}]),a.Renderer.BAND=new a.Renderer.Type("band"),a.Renderer.addType({type:a.Renderer.Type.parse("band"),model:b}),a.BandRenderer=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";{var b,c=window.multigraph.utilityFunctions.getDefaultValuesFromXSD();window.multigraph.utilityFunctions.getKeys(c.plot.renderer)}b=new window.jermaine.Model("BarRenderer",function(){this.isA(a.Renderer),this.hasA("numberOfVariables").dflt(2)}),a.Renderer.declareOptions(b,"BarRendererOptions",[{name:"barwidth",type:a.Renderer.HorizontalDataMeasureOption,"default":new a.DataMeasure.parse("number",0)},{name:"baroffset",type:a.Renderer.NumberOption,"default":0},{name:"barbase",type:a.Renderer.VerticalDataValueOption,"default":null},{name:"fillcolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"fillopacity",type:a.Renderer.NumberOption,"default":1},{name:"linecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"hidelines",type:a.Renderer.NumberOption,"default":2}]),a.Renderer.BAR=new a.Renderer.Type("bar"),a.Renderer.addType({type:a.Renderer.Type.parse("bar"),model:b}),a.BarRenderer=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";{var b,c=window.multigraph.utilityFunctions.getDefaultValuesFromXSD();window.multigraph.utilityFunctions.getKeys(c.plot.renderer)}b=new window.jermaine.Model("FillRenderer",function(){this.isA(a.Renderer),this.hasA("numberOfVariables").dflt(2)}),b.GRAY=parseInt("80",16)/255,a.Renderer.declareOptions(b,"FillRendererOptions",[{name:"linecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"linewidth",type:a.Renderer.NumberOption,"default":1},{name:"fillcolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(b.GRAY,b.GRAY,b.GRAY)},{name:"downfillcolor",type:a.Renderer.RGBColorOption,"default":null},{name:"fillopacity",type:a.Renderer.NumberOption,"default":1},{name:"fillbase",type:a.Renderer.VerticalDataValueOption,"default":null}]),a.Renderer.FILL=new a.Renderer.Type("fill"),a.Renderer.addType({type:a.Renderer.Type.parse("fill"),model:b}),a.FillRenderer=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";{var b,c=window.multigraph.utilityFunctions.getDefaultValuesFromXSD();window.multigraph.utilityFunctions.getKeys(c.plot.renderer)}b=new window.jermaine.Model("PointlineRenderer",function(){this.isA(a.Renderer),this.hasA("numberOfVariables").dflt(2)}),b.CIRCLE="circle",b.SQUARE="square",b.TRIANGLE="triangle",b.DIAMOND="diamond",b.STAR="star",b.PLUS="plus",b.X="x",b.shapes=[b.CIRCLE,b.SQUARE,b.TRIANGLE,b.DIAMOND,b.STAR,b.PLUS,b.X],b.isShape=function(a){var c;for(c=0;c<b.shapes.length;++c)if(b.shapes[c]===a)return!0;return!1},b.parseShape=function(a){if(a.toLowerCase()===b.CIRCLE)return b.CIRCLE;if(a.toLowerCase()===b.SQUARE)return b.SQUARE;if(a.toLowerCase()===b.TRIANGLE)return b.TRIANGLE;if(a.toLowerCase()===b.DIAMOND)return b.DIAMOND;if(a.toLowerCase()===b.STAR)return b.STAR;if(a.toLowerCase()===b.PLUS)return b.PLUS;if(a.toLowerCase()===b.X)return b.X;throw new Error("unknown point shape: "+a)},b.serializeShape=function(a){return a},b.ShapeOption=new window.jermaine.Model("PointlineRenderer.ShapeOption",function(){this.isA(a.Renderer.Option),this.hasA("value").vlds(b.isShape),this.isBuiltWith("value"),this.rspd("serializeValue",function(){return b.serializeShape(this.value())}),this.rspd("parseValue",function(a){this.value(b.parseShape(a))}),this.rspd("valueEq",function(a){return this.value()===a})}),a.Renderer.declareOptions(b,"PointlineRendererOptions",[{name:"linecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"linewidth",type:a.Renderer.NumberOption,"default":1},{name:"pointshape",type:b.ShapeOption,"default":b.CIRCLE},{name:"pointsize",type:a.Renderer.NumberOption,"default":0},{name:"pointcolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"pointopacity",type:a.Renderer.NumberOption,"default":1},{name:"pointoutlinewidth",type:a.Renderer.NumberOption,"default":0},{name:"pointoutlinecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)}]),a.Renderer.POINTLINE=new a.Renderer.Type("pointline"),a.Renderer.POINT=new a.Renderer.Type("point"),a.Renderer.LINE=new a.Renderer.Type("line"),a.Renderer.addType({type:a.Renderer.Type.parse("pointline"),model:b}),a.Renderer.addType({type:a.Renderer.Type.parse("line"),model:b}),a.Renderer.addType({type:a.Renderer.Type.parse("point"),model:b}),a.PointlineRenderer=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b;b=new window.jermaine.Model("RangeBarRenderer",function(){this.isA(a.Renderer),this.hasA("numberOfVariables").dflt(3)}),a.Renderer.declareOptions(b,"RangeBarRendererOptions",[{name:"barwidth",type:a.Renderer.HorizontalDataMeasureOption,"default":new a.DataMeasure.parse("number",0)},{name:"baroffset",type:a.Renderer.NumberOption,"default":0},{name:"fillcolor",type:a.Renderer.RGBColorOption,"default":window.multigraph.math.RGBColor.parse("0x808080")},{name:"fillopacity",type:a.Renderer.NumberOption,"default":1},{name:"linecolor",type:a.Renderer.RGBColorOption,"default":new window.multigraph.math.RGBColor(0,0,0)},{name:"linewidth",type:a.Renderer.NumberOption,"default":1},{name:"hidelines",type:a.Renderer.NumberOption,"default":2}]),a.Renderer.RANGEBAR=new a.Renderer.Type("rangebar"),a.Renderer.addType({type:a.Renderer.Type.parse("rangebar"),model:b}),a.RangeBarRenderer=b}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.Text=new window.jermaine.Model("Text",function(){this.isBuiltWith("string"),this.hasA("string").isA("string"),this.hasA("origWidth").isA("number"),this.hasA("origHeight").isA("number"),this.hasA("rotatedWidth").isA("number"),this.hasA("rotatedHeight").isA("number"),this.rspd("initializeGeometry",function(a){var b,c,d,e;if(b=this.measureStringWidth(a),c=this.measureStringHeight(a),d=b,e=c,a&&void 0!==a.angle){var f=a.angle/180*Math.PI;d=Math.abs(Math.cos(f))*b+Math.abs(Math.sin(f))*c,e=Math.abs(Math.sin(f))*b+Math.abs(Math.cos(f))*c}return this.origWidth(b),this.origHeight(c),this.rotatedWidth(d),this.rotatedHeight(e),this}),this.rspd("measureStringWidth",function(){var a,b,c,d=1;if(void 0===this.string())throw new Error("measureStringWidth requires the string attr to be set.");for(a=this.string().split(/\n/),c=0;c<a.length;c++)b=a[c].length,b>d&&(d=b);return 15*d}),this.rspd("measureStringHeight",function(){if(void 0===this.string())throw new Error("measureStringHeight requires the string attr to be set.");var a=this.string().match(/\n/g);return 12*(null!==a?a.length+1:1)})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.Warning=function(a){this.message=a},a.Warning.prototype=new Error}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.WebServiceData=window.jermaine.Model(function(){this.isA(a.Data),this.hasA("serviceaddress").isA("string"),this.hasA("serviceaddresspattern").isA("string"),this.hasA("format").isA("string"),this.hasA("formatter").vlds(a.DataFormatter.isInstance),this.hasA("messageHandler"),this.hasA("ajaxthrottle"),this.isBuiltWith("columns","serviceaddress","%messageHandler","%ajaxthrottle",function(){if(this.init(),this.columns().size()>0){var b=this.columns().at(0).type();void 0===this.format()&&this.format(b===a.DataValue.NUMBER?"%f":"%Y%M%D%H%i%s"),this.formatter(a.DataFormatter.create(b,this.format()))}void 0===this.ajaxthrottle()&&this.ajaxthrottle(window.multigraph.jQuery)}),this.rspd("_displayError",function(a){if(!this.messageHandler())throw a;this.messageHandler().error(a)}),this.rspd("getBounds",function(){return[0,10]}),this.hasA("arraydata").dflt(null).vlds(function(b){return b instanceof a.ArrayData||null===b}),this.hasA("cacheHead").dflt(null).vlds(function(b){return null===b||b instanceof a.WebServiceDataCacheNode}),this.hasA("cacheTail").dflt(null).vlds(function(b){return null===b||b instanceof a.WebServiceDataCacheNode}),this.rspd("dataHead",function(){var a=this.cacheHead();return null===a?null:a.hasData()?a:a.dataNext()}),this.rspd("dataTail",function(){var a=this.cacheTail();return null===a?null:a.hasData()?a:a.dataPrev()}),this.rspd("insertCacheNode",function(a){var b=this.cacheHead(),c=this.cacheTail();null===b?(this.cacheHead(a),this.cacheTail(a)):a.coveredMin().lt(b.coveredMin())?(a.next(b),b.prev(a),this.cacheHead(a)):(a.prev(c),c.next(a),this.cacheTail(a))}),this.rspd("constructRequestURL",function(a,b){var c=this.serviceaddress(),d=this.formatter();if(void 0===c)throw new Error("WebServiceData.constructRequestURL: undefined service address");if(void 0===d)throw new Error("WebServiceData.constructRequestURL: undefined formatter for column 0");return void 0===this.serviceaddresspattern()&&this.serviceaddresspattern(c.indexOf("$min")<0&&c.indexOf("$max")<0?c+"$min,$max":c),this.serviceaddresspattern().replace("$min",d.format(a)).replace("$max",d.format(b))}),this.hasA("coveredMin").dflt(null).vlds(function(b){return null===b||a.DataValue.isInstance(b)}),this.hasA("coveredMax").dflt(null).vlds(function(b){return null===b||a.DataValue.isInstance(b)}),this.rspd("insureCoveredRange",function(){var a=this.cacheHead(),b=this.cacheTail(),c=this.coveredMin(),d=this.coveredMax();null!==c&&null!==d&&(null===a||null===b?this.requestSingleRange(c,d):(c.lt(a.coveredMin())&&this.requestSingleRange(c,a.coveredMin()),d.gt(b.coveredMax())&&this.requestSingleRange(b.coveredMax(),d)))}),this.rspd("requestSingleRange",function(b,c){var d,e,f=this;d=new a.WebServiceDataCacheNode(b,c),this.insertCacheNode(d),e=this.constructRequestURL(b,c),this.emit({type:"ajaxEvent",action:"start"}),this.ajaxthrottle().ajax({url:e,dataType:"text",success:function(a){a.indexOf("<values>")>0&&(a=window.multigraph.parser.stringToJQueryXMLObj(a).find("values").text()),d.parseData(f.getColumns(),a),f.emit({type:"ajaxEvent",action:"success"}),f.emit({type:"dataReady"})},error:function(a,b,c){var d=c;404===a.statusCode().status?d="URL not found: '"+e+'"':b&&(d=b+": "+d),f._displayError(new Error(d))},complete:function(){f.emit({type:"ajaxEvent",action:"complete"})}})}),this.rspd("getIterator",function(b,c,d,e){var f,g,h,i,j,k,l,m,n;if(c.gt(d)&&(k=c,c=d,d=k),(null===this.coveredMin()||c.lt(this.coveredMin()))&&this.coveredMin(c.clone()),(null===this.coveredMax()||d.gt(this.coveredMax()))&&this.coveredMax(d.clone()),this.paused()||this.insureCoveredRange(),null===this.dataHead())return{next:function(){},hasNext:function(){return!1}};for(n=[],j=0;j<b.length;++j)n.push(this.columnIdToColumnNumber(b[j]));for(f=this.dataHead();null!==f&&null!==f.dataNext()&&c.gt(f.dataMax());)f=f.dataNext();if(null!==f&&f.hasData()){for(g=0;g<f.data().length-1&&f.data()[g][n[0]].lt(c);)++g;for(h=0;e>h;){if(--g,0>g){if(i=f.dataPrev(),null===i){g=0;break}f=i,g=f.data().length-1}++h}for(l=f;d.gt(l.dataMax())&&null!==l.dataNext();)l=l.dataNext();for(m=0,l===f&&(m=g);m<l.data().length-1&&l.data()[m][n[0]].lt(d);)++m;for(h=0;e>h;){if(++m,m>=l.data().length){if(i=l.dataNext(),null===i){m=l.data().length-1;break}l=i,m=0}++h}}else g=-1;return new a.WebServiceDataIterator(n,f,g,l,m)}),this.hasA("paused").isA("boolean").dflt(!1),this.rspd("pause",function(){this.paused(!0)}),this.rspd("resume",function(){this.paused(!1),this.emit({type:"dataReady",min:this.coveredMin(),max:this.coveredMax()})})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";a.WebServiceDataCacheNode=window.jermaine.Model(function(){this.hasA("data").dflt(null).vlds(function(b){var c=window.multigraph.util.namespace("window.multigraph.utilityFunctions");if(null===b)return!0;if("array"!==c.typeOf(b))return this.message="WebServiceDataCacheNode's data attribute is not an Array",!1;if(b.length>0){var d,e=b[0];if("array"!==c.typeOf(e))return this.message="WebServiceDataCacheNode's data attribute is not an Array of Arrays",!1;for(d=0;d<e.length;++d)if(!a.DataValue.isInstance(e[d]))return this.message="WebServiceDataCacheNode's data attribute is not an Array of Arrays of DataValues (bad value in position "+d+" of first row",!1}return!0}),this.hasA("next").dflt(null).vlds(function(b){return null===b||b instanceof a.WebServiceDataCacheNode}),this.hasA("prev").dflt(null).vlds(function(b){return null===b||b instanceof a.WebServiceDataCacheNode}),this.hasA("coveredMin").vlds(a.DataValue.isInstance),this.hasA("coveredMax").vlds(a.DataValue.isInstance),this.rspd("dataNext",function(){for(var a=this.next();null!==a&&!a.hasData();)a=a.next();return a}),this.rspd("dataPrev",function(){for(var a=this.prev();null!==a&&!a.hasData();)a=a.prev();return a}),this.rspd("dataMin",function(){var a=this.data();return null===a?null:0===a.length?null:null===a[0]?null:0===a[0].length?null:a[0][0]}),this.rspd("dataMax",function(){var a=this.data();return null===a?null:0===a.length?null:null===a[a.length-1]?null:0===a[a.length-1].length?null:a[a.length-1][0]}),this.rspd("hasData",function(){return null!==this.data()}),this.isBuiltWith("coveredMin","coveredMax"),this.rspd("parseData",function(b,c){var d,e,f,g,h,i=null,j=null;for(e=this.dataPrev(),null!==e&&(i=e.dataMax()),e=this.dataNext(),null!==e&&(j=e.dataMin()),f=a.ArrayData.textToDataValuesArray(b,c),g=[],d=0;d<f.length;++d)h=f[d],null!==i&&!h[0].gt(i)||null!==j&&!h[0].lt(j)||g.push(h);0!==g.length&&(g[0][0].lt(this.coveredMin())&&this.coveredMin(g[0][0]),g[g.length-1][0].gt(this.coveredMax())&&this.coveredMax(g[g.length-1][0]),this.data(g))})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.util.namespace("window.multigraph.utilityFunctions");a.WebServiceDataIterator=window.jermaine.Model(function(){this.hasA("currentNode").vlds(function(b){return b instanceof a.WebServiceDataCacheNode}),this.hasA("currentIndex").isA("integer"),this.hasA("columnIndices").vlds(function(a){return"array"===b.typeOf(a)}),this.hasA("initialNode").vlds(function(b){return b instanceof a.WebServiceDataCacheNode}),this.hasA("finalNode").vlds(function(b){return b instanceof a.WebServiceDataCacheNode}),this.hasA("initialIndex").isA("integer"),this.hasA("finalIndex").isA("integer"),this.isBuiltWith("columnIndices","initialNode","initialIndex","finalNode","finalIndex",function(){this.currentNode(this.initialNode()),this.currentIndex(this.initialIndex())}),this.rspd("hasNext",function(){return null===this.currentNode()||this.currentIndex()<0?!1:this.currentNode()!==this.finalNode()?!0:this.currentIndex()<=this.finalIndex()}),this.rspd("next",function(){var a,b=[],c=this.columnIndices(),d=this.currentIndex(),e=this.finalIndex(),f=this.currentNode();if(f===this.finalNode()){if(d>e)return null;for(a=0;a<c.length;++a)b.push(f.data()[d][c[a]]);return this.currentIndex(++d),b}for(a=0;a<c.length;++a)b.push(f.data()[d][c[a]]);return this.currentIndex(++d),d>=f.data().length&&(this.currentNode(f.dataNext()),this.currentIndex(0)),b})})}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.window),e=new window.jermaine.Model("Window",function(){this.hasA("width").isA("integer"),this.hasA("height").isA("integer"),this.hasA("border").isA("integer"),this.hasA("margin").vlds(function(a){return a instanceof window.multigraph.math.Insets}),this.hasA("padding").vlds(function(a){return a instanceof window.multigraph.math.Insets}),this.hasA("bordercolor").vlds(function(a){return a instanceof window.multigraph.math.RGBColor}),b.insertDefaults(this,c.window,d)});a.Window=e}),window.multigraph.util.namespace("window.multigraph.core",function(a){"use strict";var b=window.multigraph.utilityFunctions,c=b.getDefaultValuesFromXSD(),d=b.getKeys(c.horizontalaxis.zoom),e=new window.jermaine.Model("Zoom",function(){this.hasA("allowed").isA("boolean"),this.hasA("min").vlds(function(b){return a.DataMeasure.isInstance(b)}),this.hasA("max").vlds(function(b){return a.DataMeasure.isInstance(b)}),this.hasA("anchor").vlds(function(b){return a.DataValue.isInstance(b)||null===b}),b.insertDefaults(this,c.horizontalaxis.zoom,d)});a.Zoom=e}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){var c=function(c,d){var e,f,g=[],h=c.find("labels"),i=c.find("label"),j=d.labelers(),k=a.core.Labeler,l=a.jQuery;if(e=l.trim(h.attr("spacing")),""!==e&&(g=e.split(/\s+/)),g.length>0)for(f=0;f<g.length;++f)j.add(k[b](h,d,void 0,g[f]));else if(i.length>0){var m=k[b](h,d,void 0,null);l.each(i,function(a,c){for(e=l.trim(l(c).attr("spacing")),g=[],""!==e&&(g=e.split(/\s+/)),f=0;f<g.length;++f)j.add(k[b](l(c),d,m,g[f]))})}else{var n=a.utilityFunctions.getDefaultValuesFromXSD().horizontalaxis.labels;for(e=d.type()===a.core.DataValue.NUMBER?n.defaultNumberSpacing:n.defaultDatetimeSpacing,g=e.split(/\s+/),f=0;f<g.length;++f)j.add(k[b](h,d,void 0,g[f]))}};a.core.Axis[b]=function(d,e,f,g){var h,i,j,k=a.core,l=a.math,m=new k.Axis(e),n=a.utilityFunctions,o=n.parseAttribute,p=n.parseInteger,q=n.parseString,r=k.DataValue,s=l.Displacement.parse,t=l.Point,u=t.parse,v=l.RGBColor.parse;if(d){if(o(d.attr("id"),m.id,q),o(d.attr("type"),m.type,r.parseType),o(d.attr("length"),m.length,s),function(){var a=d.attr("positionbase");a&&(f.warning('Use of deprecated axis attribute "positionbase"; use "base" attribute instead'),"left"===a||"bottom"===a?m.base(u("-1 -1")):"right"===a?m.base(u("1 -1")):"top"===a&&m.base(u("-1 1")))}(),h=d.attr("position"),void 0!==h)try{m.position(u(h))}catch(w){if(j=parseInt(h,10),j!==j)throw w;m.position(e===k.Axis.HORIZONTAL?new t(0,j):new t(j,0))}if(m.min(d.attr("min")),"auto"!==m.min()&&m.dataMin(r.parse(m.type(),m.min())),m.max(d.attr("max")),"auto"!==m.max()&&m.dataMax(r.parse(m.type(),m.max())),o(d.attr("pregap"),m.pregap,parseFloat),o(d.attr("postgap"),m.postgap,parseFloat),o(d.attr("anchor"),m.anchor,parseFloat),o(d.attr("base"),m.base,u),o(d.attr("minposition"),m.minposition,s),o(d.attr("maxposition"),m.maxposition,s),o(d.attr("minoffset"),m.minoffset,parseFloat),o(d.attr("maxoffset"),m.maxoffset,parseFloat),o(d.attr("color"),m.color,v),o(d.attr("tickcolor"),m.tickcolor,v),o(d.attr("tickwidth"),m.tickwidth,p),o(d.attr("tickmin"),m.tickmin,p),o(d.attr("tickmax"),m.tickmax,p),o(d.attr("highlightstyle"),m.highlightstyle,q),o(d.attr("linewidth"),m.linewidth,p),i=d.find("title"),m.title(i.length>0?k.AxisTitle[b](i,m):new k.AxisTitle(m)),i=d.find("grid"),i.length>0&&m.grid(k.Grid[b](i)),i=d.find("pan"),i.length>0&&m.pan(k.Pan[b](i,m.type())),i=d.find("zoom"),i.length>0&&m.zoom(k.Zoom[b](i,m.type())),d.find("labels").length>0&&c(d,m),i=d.find("binding"),i.length>0){var x=i.attr("id"),y=i.attr("min"),z=i.attr("max"),A=r.parse(m.type(),y),B=r.parse(m.type(),z);if("string"!=typeof x||x.length<=0)throw new Error("invalid axis binding id: '"+x+"'");if(!r.isInstance(A))throw new Error("invalid axis binding min: '"+y+"'");if(!r.isInstance(B))throw new Error("invalid axis binding max: '"+z+"'");k.AxisBinding.findByIdOrCreateNew(x).addAxis(m,A,B,g)}}return m}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.AxisTitle[b]=function(b,c){var d,e=new a.core.AxisTitle(c),f=!1,g=a.math.Point.parse,h=function(b,c,d){a.utilityFunctions.parseAttribute(b,c,d)
};return b&&(d=b.text(),""!==d&&(e.content(new a.core.Text(d)),f=!0),h(b.attr("anchor"),e.anchor,g),h(b.attr("base"),e.base,parseFloat),h(b.attr("position"),e.position,g),h(b.attr("angle"),e.angle,parseFloat)),f===!0?e:void 0}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Background[b]=function(c,d){var e,f=new a.core.Background;return c&&(a.utilityFunctions.parseAttribute(c.attr("color"),f.color,a.math.RGBColor.parse),e=c.find("img"),e.length>0&&f.img(a.core.Img[b](e,d))),f}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){window.multigraph.core.Data[b]=function(c,d,e){var f,g,h,i,j,k=a.core,l=k.ArrayData,m=a.jQuery,n=[],o=l;if(c){if(j=m(c).attr("adapter"),void 0!==j&&""!==j&&(o=window.multigraph.adapters[j],void 0===o))throw new Error("Missing data adapater: "+o);f=c.find("variables"),g=f.attr("missingvalue"),h=f.attr("missingop");var p=f.find(">variable");p.length>0&&m.each(p,function(a,c){n.push(k.DataVariable[b](m(c)))});var q,r=!1,s=m(c.find(">repeat"));if(s.length>0){var t=m(s).attr("period");void 0===t||""===t?e.warning("<repeat> tag requires a 'period' attribute; data treated as non-repeating"):(q=k.DataMeasure.parse(n[0].type(),t),r=!0)}var u=m(c.find(">values"));if(u.length>0){u=u[0];var v=o.textToStringArray(n,m(u).text());i=r?new k.PeriodicArrayData(n,v,q):new l(n,v)}var w=m(c.find(">csv"));if(w.length>0){w=w[0];var x=m(w).attr("location");i=new k.CSVData(n,d?d.rebaseUrl(x):x,e,d?d.getAjaxThrottle(x):void 0)}var y=m(c.find(">service"));if(y.length>0){y=m(y[0]);var z=y.attr("location");i=new k.WebServiceData(n,d?d.rebaseUrl(z):z,e,d?d.getAjaxThrottle(z):void 0);var A=y.attr("format");A&&i.format(A)}}return i&&(void 0!==g&&i.defaultMissingvalue(g),void 0!==h&&i.defaultMissingop(h),i.adapter(o)),i}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.DataVariable[b]=function(b){var c,d=a.utilityFunctions,e=d.parseAttribute,f=a.core.DataValue;return b&&b.attr("id")&&(c=new a.core.DataVariable(b.attr("id")),e(b.attr("column"),c.column,d.parseInteger),e(b.attr("type"),c.type,f.parseType),e(b.attr("missingvalue"),c.missingvalue,d.parseDataValue(c.type())),e(b.attr("missingop"),c.missingop,f.parseComparator)),c}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Datatips[b]=function(c){var d,e=new a.core.Datatips,f=a.jQuery,g=a.math.RGBColor.parse,h=a.utilityFunctions,i=h.parseAttribute,j=h.parseInteger,k=h.parseString;return c&&(d=c.find("variable"),d.length>0&&f.each(d,function(c,d){e.variables().add(a.core.DatatipsVariable[b](f(d)))}),i(c.attr("format"),e.format,k),i(c.attr("bgcolor"),e.bgcolor,g),i(c.attr("bgalpha"),e.bgalpha,k),i(c.attr("border"),e.border,j),i(c.attr("bordercolor"),e.bordercolor,g),i(c.attr("pad"),e.pad,j)),e}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.DatatipsVariable[b]=function(b){var c=new a.core.DatatipsVariable,d=a.utilityFunctions;return b&&d.parseAttribute(b.attr("format"),c.format,d.parseString),c}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Filter[b]=function(c){var d,e=new a.core.Filter,f=a.jQuery,g=a.utilityFunctions;return c&&(d=c.find("option"),d.length>0&&f.each(d,function(c,d){e.options().add(a.core.FilterOption[b](f(d)))}),g.parseAttribute(c.attr("type"),e.type,g.parseString)),e}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.FilterOption[b]=function(b){var c=new a.core.FilterOption;return b&&(c.name(b.attr("name")),c.value(""===b.attr("value")?void 0:b.attr("value"))),c}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){var c=a.jQuery,d=function(b,e){var f,g=c(b),h=g[0].attributes,i=g.children(),j=a.math.RGBColor.colorNameIsDeprecated;"option"===b.nodeName&&/color/.test(g.attr("name"))&&(f=j(g.attr("value")),f&&e.warning('Warning: color string "'+g.attr("value")+'" is deprecated; use "'+f+'" instead')),h&&c.each(h,function(){/color/.test(this.name)&&(f=j(this.value),f&&e.warning('Warning: color string "'+this.value+'" is deprecated; use "'+f+'" instead'))}),i&&i.each(function(){d(this,e)})};a.core.Graph[b]=function(e,f,g){var h,i=a.core,j=new i.Graph,k=i.Axis,l=a.utilityFunctions.getDefaultValuesFromXSD();if(j.multigraph(f),e){try{d(e,g)}catch(m){}h=e.find(">window"),h.length>0&&j.window(i.Window[b](h)),h=e.find(">legend"),j.legend(h.length>0?i.Legend[b](h):i.Legend[b]()),h=e.find(">background"),h.length>0&&j.background(i.Background[b](h,j.multigraph())),h=e.find(">plotarea"),h.length>0&&j.plotarea(i.Plotarea[b](h)),h=e.find(">title"),h.length>0&&j.title(i.Title[b](h,j)),c.each(e.find(">horizontalaxis"),function(a,d){j.axes().add(k[b](c(d),k.HORIZONTAL,g,j.multigraph()))}),c.each(e.find(">verticalaxis"),function(a,d){j.axes().add(k[b](c(d),k.VERTICAL,g,j.multigraph()))}),c.each(e.find(">throttle"),function(a,b){var d=c(b).attr("pattern")?c(b).attr("pattern"):l.throttle.pattern,e=c(b).attr("requests")?c(b).attr("requests"):l.throttle.requests,g=c(b).attr("period")?c(b).attr("period"):l.throttle.period,h=c(b).attr("concurrent")?c(b).attr("concurrent"):l.throttle.concurrent;f.addAjaxThrottle(d,e,g,h)}),c.each(e.find(">data"),function(a,d){j.data().add(i.Data[b](c(d),j.multigraph(),g))}),c.each(e.find(">plot"),function(a,d){j.plots().add(i.Plot[b](c(d),j,g))}),j.postParse()}return j}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Title[b]=function(b,c){var d,e=a.math.Point.parse,f=a.math.RGBColor.parse,g=a.utilityFunctions,h=g.parseAttribute,i=g.parseInteger;if(b){var j=b.text();if(""===j)return void 0;d=new a.core.Title(new a.core.Text(j),c),h(b.attr("frame"),d.frame,function(a){return a.toLowerCase()}),h(b.attr("border"),d.border,i),h(b.attr("color"),d.color,f),h(b.attr("bordercolor"),d.bordercolor,f),h(b.attr("opacity"),d.opacity,parseFloat),h(b.attr("padding"),d.padding,i),h(b.attr("cornerradius"),d.cornerradius,i),h(b.attr("anchor"),d.anchor,e),h(b.attr("base"),d.base,e),h(b.attr("position"),d.position,e)}return d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Grid[b]=function(b){var c,d=new a.core.Grid,e=a.utilityFunctions,f=e.parseAttribute;return b&&(f(b.attr("color"),d.color,a.math.RGBColor.parse),c=b.attr("visible"),d.visible(void 0!==c?e.parseBoolean(c):!0)),d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Icon[b]=function(b){var c=new a.core.Icon,d=a.utilityFunctions,e=d.parseAttribute,f=d.parseInteger;return b&&(e(b.attr("height"),c.height,f),e(b.attr("width"),c.width,f),e(b.attr("border"),c.border,f)),c}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Img[b]=function(b,c){var d,e=a.utilityFunctions.parseAttribute,f=a.math.Point.parse;if(b&&void 0!==b.attr("src")){var g=b.attr("src");if(!g)throw new Error('img elment requires a "src" attribute value');c&&(g=c.rebaseUrl(g)),d=new a.core.Img(g),e(b.attr("anchor"),d.anchor,f),e(b.attr("base"),d.base,f),e(b.attr("position"),d.position,f),e(b.attr("frame"),d.frame,function(a){return a.toLowerCase()})}return d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Labeler[b]=function(b,c,d,e){var f,g=a.math,h=a.utilityFunctions,i=g.Point.parse,j=function(a,b,c,e){h.parseAttribute(a,b,c)||void 0===d||b(d[e]())},k=function(a){return function(b){return window.multigraph.core.DataFormatter.create(a,b)}};return b&&(f=new a.core.Labeler(c),null!==e&&(void 0===e&&(e=b.attr("spacing")),j(e,f.spacing,h.parseDataMeasure(c.type()),"spacing")),j(b.attr("format"),f.formatter,k(c.type()),"formatter"),j(b.attr("start"),f.start,h.parseDataValue(c.type()),"start"),j(b.attr("angle"),f.angle,parseFloat,"angle"),j(b.attr("position"),f.position,i,"position"),j(b.attr("anchor"),f.anchor,i,"anchor"),j(b.attr("densityfactor"),f.densityfactor,parseFloat,"densityfactor"),j(b.attr("color"),f.color,g.RGBColor.parse,"color"),j(b.attr("visible"),f.visible,h.parseBoolean,"visible")),f}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Legend[b]=function(c){var d,e=new a.core.Legend,f=a.utilityFunctions,g=f.parseAttribute,h=f.parseInteger,i=a.math.Point.parse,j=a.math.RGBColor.parse;return c&&(g(c.attr("visible"),e.visible,f.parseBoolean),g(c.attr("base"),e.base,i),g(c.attr("anchor"),e.anchor,i),g(c.attr("position"),e.position,i),g(c.attr("frame"),e.frame,f.parseString),g(c.attr("color"),e.color,j),g(c.attr("bordercolor"),e.bordercolor,j),g(c.attr("opacity"),e.opacity,parseFloat),g(c.attr("border"),e.border,h),g(c.attr("rows"),e.rows,h),g(c.attr("columns"),e.columns,h),g(c.attr("cornerradius"),e.cornerradius,h),g(c.attr("padding"),e.padding,h),d=c.find("icon"),d.length>0&&e.icon(a.core.Icon[b](d))),e}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Multigraph[b]=function(c,d,e){var f,g=new a.core.Multigraph,h=g.graphs(),i=a.core.Graph,j=a.jQuery;return g.mugl(d),c&&(f=c.find(">graph"),f.length>0?j.each(f,function(a,c){h.add(i[b](j(c),g,e))}):0===f.length&&c.children().length>0&&h.add(i[b](c,g,e))),g}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Pan[b]=function(b,c){var d=new a.core.Pan,e=a.utilityFunctions,f=e.parseAttribute,g=e.parseDataValue;return b&&(f(b.attr("allowed"),d.allowed,e.parseBoolean),f(b.attr("min"),d.min,g(c)),f(b.attr("max"),d.max,g(c))),d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.stringToJQueryXMLObj=function(a){var b=window.multigraph.jQuery;if("string"!=typeof a)return b(a);var c=b.parseXML(a);return b(b(c).children()[0])}}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Plot[b]=function(c,d,e){var f,g,h,i,j,k,l=a.jQuery,m=a.core,n=m.DataPlot,o=m.PlotLegend;if(c){if(k=c.find(">verticalaxis"),1===k.length&&void 0!==k.attr("ref")&&d&&(h=d.axisById(k.attr("ref")),void 0===h))throw new Error("Plot Vertical Axis Error: The graph does not contain an axis with an id of '"+k.attr("ref")+"'");if(k=c.find("verticalaxis constant"),k.length>0){var p=k.attr("value");if(void 0===p)throw new Error("Constant Plot Error: A 'value' attribute is needed to define a Constant Plot");f=new m.ConstantPlot(m.DataValue.parse(h.type(),p))}else f=new n;if(f.verticalaxis(h),k=c.find(">horizontalaxis"),1===k.length&&void 0!==k.attr("ref")&&d){if(g=d.axisById(k.attr("ref")),void 0===g)throw new Error("Plot Horizontal Axis Error: The graph does not contain an axis with an id of '"+k.attr("ref")+"'");f.horizontalaxis(g)}f instanceof n&&(0===c.find("horizontalaxis variable").length&&f.variable().add(null),k=c.find("horizontalaxis variable, verticalaxis variable"),k.length>0&&d&&l.each(k,function(a,b){if(j=l(b).attr("ref"),i=d.variableById(j),void 0===i)throw new Error("Plot Variable Error: No Data tag contains a variable with an id of '"+j+"'");f.data(i.data()),f.variable().add(i)})),k=c.find("legend"),f.legend(k.length>0?o[b](k,f):o[b](void 0,f)),k=c.find("renderer"),k.length>0&&f.renderer(m.Renderer[b](k,f,e)),k=c.find("filter"),k.length>0&&f.filter(m.Filter[b](k)),k=c.find("datatips"),k.length>0&&f.datatips(m.Datatips[b](k))}return f}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.PlotLegend[b]=function(b,c){var d=new a.core.PlotLegend,e=a.utilityFunctions,f=e.parseAttribute,g=a.core.Text;return b&&(f(b.attr("visible"),d.visible,e.parseBoolean),f(b.attr("label"),d.label,function(a){return new g(a)})),void 0===d.label()&&d.label("function"==typeof c.variable&&c.variable().size()>=2?new g(c.variable().at(1).id()):new g("plot")),d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Plotarea[b]=function(b){var c=new a.core.Plotarea,d=c.margin(),e=a.utilityFunctions,f=e.parseAttribute,g=e.parseInteger,h=a.math.RGBColor.parse;return b&&(f(b.attr("marginbottom"),d.bottom,g),f(b.attr("marginleft"),d.left,g),f(b.attr("margintop"),d.top,g),f(b.attr("marginright"),d.right,g),f(b.attr("border"),c.border,g),f(b.attr("color"),c.color,h),f(b.attr("bordercolor"),c.bordercolor,h)),c}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Renderer[b]=function(b,c,d){var e,f,g=a.jQuery,h=a.core,i=h.Renderer;if(b&&void 0!==b.attr("type")){if(e=i.Type.parse(b.attr("type")),!i.Type.isInstance(e))throw new Error("unknown renderer type '"+b.attr("type")+"'");f=i.create(e),f.plot(c),b.find("option").length>0&&(!function(a,b,c,d){var e,f=b.find("option[name=missingvalue]"),g=b.find("option[name=missingop]");if(f.length>0||g.length>0){var i,j=c.data().columns();for(e=0;e<j.size();++e)i=j.at(e),i.type()===h.DataValue.NUMBER&&(f.length>0&&void 0===i.missingvalue()&&i.missingvalue(h.NumberValue.parse(f.attr("value"))),g.length>0&&void 0===i.missingop()&&i.missingop(h.DataValue.parseComparator(g.attr("value"))))}f.length>0&&(d.warning("Renderer option 'missingvalue' is deprecated; use 'missingvalue' attribute of 'data'/'variable'; instead"),f.remove()),g.length>0&&(d.warning("Renderer option 'missingop' is deprecated; use 'missingvalue' attribute of 'data'/'variable'; instead"),g.remove())}(f,b,c,d),g.each(b.find(">option"),function(a,b){try{f.setOptionFromString(g(b).attr("name"),g(b).attr("value"),g(b).attr("min"),g(b).attr("max"))}catch(b){if(!(b instanceof h.Warning))throw b;d.warning(b)}}))}return f}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Window[b]=function(b){var c,d=new a.core.Window,e=a.utilityFunctions,f=e.parseAttribute,g=e.parseInteger;return b&&(f(b.attr("width"),d.width,g),f(b.attr("height"),d.height,g),f(b.attr("border"),d.border,g),c=b.attr("margin"),void 0!==c&&!function(a){d.margin().set(a,a,a,a)}(parseInt(c,10)),c=b.attr("padding"),void 0!==c&&!function(a){d.padding().set(a,a,a,a)}(parseInt(c,10)),f(b.attr("bordercolor"),d.bordercolor,a.math.RGBColor.parse)),d}})}),window.multigraph.util.namespace("window.multigraph.parser",function(a){"use strict";a.mixin.add(function(a,b){a.core.Zoom[b]=function(b,c){var d,e=a.core,f=new e.Zoom,g=a.utilityFunctions,h=g.parseAttribute,i=g.parseDataMeasure;return b&&(h(b.attr("allowed"),f.allowed,g.parseBoolean),h(b.attr("min"),f.min,i(c)),h(b.attr("max"),f.max,i(c)),d=b.attr("anchor"),void 0!==d&&f.anchor("none"===d.toLowerCase()?null:e.DataValue.parse(c,d))),f}})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){a.Axis.rspd("normalize",function(){var b,c;if(this.title()&&void 0===this.title().content()&&this.title().content(new a.Text(this.id())),0===this.labelers().size()){var d=window.multigraph.utilityFunctions.getDefaultValuesFromXSD().horizontalaxis.labels,e=this.type()===a.DataValue.NUMBER?d.defaultNumberSpacing:d.defaultDatetimeSpacing,f=e.split(/\s+/);for(b=0;b<f.length;b++)c=new a.Labeler(this),c.spacing(a.DataMeasure.parse(this.type(),f[b])),this.labelers().add(c)}for(b=0;b<this.labelers().size();b++)this.labelers().at(b).normalize()})})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){var b=function(a,b,c){var d,e,f=a.columns();for(e=0;e<f.size();e++)d=f.at(e),void 0!==d.column()?b[d.column()]=d:c.push(d)},c=function(a,b){var c,d=a.stringArray()[0].length-a.columns().size();if(d>0)for(c=0;d>c;c++)b.push(null)},d=function(a,b){var c,d;for(d=0,c=0;d<b.length;d++){for(;;){if(void 0===a[c])break;c++}a[c]=b[d]}},e=function(b,c){var d,e=b.stringArray()[0].length;if(c.length>e)for(d=0;d<c.length;d++)if(c[d]instanceof a.DataVariable&&c[d].column()>e)throw new Error("Data Variable Error: Attempting to specify column '"+c[d].column()+"' for a variable, while there are only "+e+" data columns available")},f=function(b,c,d){var e,f,g=a.DataValue;for(c=g.parseComparator(c),f=0;f<b.length;f++)b[f]?(void 0===b[f].column()&&b[f].column(f),void 0===b[f].type()&&b[f].type(g.NUMBER)):(e=0===f?"x":1===f?"y":"y"+(f-1),b[f]=new a.DataVariable(e,f,g.NUMBER)),void 0!==d&&void 0===b[f].missingvalue()&&b[f].missingvalue(g.parse(b[f].type(),d)),void 0===b[f].missingop()&&b[f].missingop(c)},g=function(a,b){for(var c,d=a.columns();d.size()>0;)d.pop();for(c=0;c<b.length;c++)d.add(b[c]);a.initializeColumns()},h=function(b,c){var d=b.stringArray();if(d.length>0&&d[0].length<c.length)throw new Error("data contains only "+d[0].length+" column(s), but should contain "+c.length);var e=a.ArrayData.stringArrayToDataValuesArray(c,d);b.array(e),b.stringArray([])};a.Data.prototype.normalize=function(){var i=[],j=[],k=this instanceof a.CSVData||this instanceof a.WebServiceData;if(k&&0===this.columns().size())throw new Error("Data Normalization: Data gotten from csv and web service sources require variables to be specified in the mugl.");b(this,i,j),this instanceof a.ArrayData!=!0||k||c(this,j),d(i,j),this instanceof a.ArrayData!=!0||k||e(this,i),f(i,this.defaultMissingop(),this.defaultMissingvalue()),g(this,i),this instanceof a.ArrayData!=!0||k||h(this,i)},a.Data.prototype.ajaxNormalize=function(){var a=[],i=[];b(this,a,i),c(this,i),d(a,i),e(this,a),f(a,this.defaultMissingop(),this.defaultMissingvalue()),g(this,a),h(this,a)}})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){a.Graph.rspd("normalize",function(){var b,c,d,e,f,g=a.Axis.HORIZONTAL,h=a.Axis.VERTICAL,i=this.axes(),j=this.plots(),k=0,l=0;for(b=0;b<this.data().size();b++)this.data().at(b).normalize();for(b=0;b<i.size();b++)i.at(b).orientation()===g?k++:i.at(b).orientation()===h&&l++;for(0===k&&i.add(new a.Axis(g)),0===l&&i.add(new a.Axis(h)),k=0,l=0,b=0;b<i.size();b++)d=i.at(b),d.orientation()===g?(e="x",k>0&&(e+=k),k++):d.orientation()===h&&(e="y",l>0&&(e+=l),l++),void 0===d.id()&&d.id(e);for(b=0;b<i.size();b++)i.at(b).normalize(this);for(0===j.size()&&j.add(new a.DataPlot),b=0;b<j.size();b++)j.at(b).normalize(this);for(this.legend()&&this.legend().normalize(this),a.AxisBinding.syncAllBindings(),b=0;b<i.size();b++)if(d=i.at(b),!d.hasDataMin()||!d.hasDataMax())for(c=0;c<j.size();++c)if(f=j.at(c),f instanceof a.DataPlot&&(f.horizontalaxis()===d||f.verticalaxis()===d)){!function(a,b,c){var d=function(){var e=c?0:1,f=b.getBounds(e),g=a.dataMin(),h=a.dataMax();a.hasDataMin()||(g=f[0]),a.hasDataMax()||(h=f[1]),a.hasDataMin()&&a.hasDataMax()||a.setDataRange(g,h),b.removeListener("dataReady",d)};b.addListener("dataReady",d)}(d,f.data(),f.horizontalaxis()===d);break}})})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){a.Labeler.rspd("normalize",function(){var b,c="%.1f",d="%Y-%M-%D %H:%i",e=this.axis().type();b=e===a.DataValue.DATETIME?d:c,void 0===this.formatter()&&this.formatter(a.DataFormatter.create(e,b))})})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){a.Legend.rspd("normalize",function(a){var b,c,d,e=this.plots(),f=a.plots(),g=this.columns,h=this.rows;for(b=0;b<f.size();b++)if(f.at(b).legend()&&f.at(b).legend().visible()===!0){for(d=!1,c=0;c<e.size();c++)if(f.at(b)===e.at(c)){d=!0;break}d!==!0&&e.add(f.at(b))}return 0===e.size()&&(void 0===g()&&g(1),void 0===h()&&h(1)),void 0===h()&&void 0===g()&&g(1),void 0===g()?g(parseInt(e.size()/h()+(e.size()%h()>0?1:0),10)):void 0===h()&&h(parseInt(e.size()/g()+(e.size()%g()>0?1:0),10)),this})})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){a.Multigraph.rspd("normalize",function(){var a;for(a=0;a<this.graphs().size();++a)this.graphs().at(a).normalize()})})}),window.multigraph.util.namespace("window.multigraph.normalizer",function(a){"use strict";a.mixin.add(function(a){var b=function(b){var c,d,e,f,g=b.axes();if(e=function(a,b,c){for(var d,e,f,g=!1,h=c;;){if(h===c&&g===!0)throw new Error("Plot Normalizer: There does not exist an unused variable");for(h===b.columns().size()&&(h=0,g=!0),d=!1,f=b.columns().at(h),e=0;e<a.variable().size();e++)if(a.variable().at(e)===f){d=!0;break}if(d===!1)return f;h++}},void 0===this.horizontalaxis())for(f=0;f<g.size();f++)if(g.at(f).orientation()===a.Axis.HORIZONTAL){this.horizontalaxis(g.at(f));break}if(void 0===this.verticalaxis())for(f=0;f<g.size();f++)if(g.at(f).orientation()===a.Axis.VERTICAL){this.verticalaxis(g.at(f));break}if(void 0===this.renderer()&&(c=a.Renderer.Type.parse("line"),this.renderer(a.Renderer.create(c)),this.renderer().plot(this)),d=this.renderer().numberOfVariables(),this instanceof a.DataPlot){var h=this.data,i=this.variable();for(void 0===h()&&h(b.data().at(0)),0===i.size()&&i.add(e(this,h(),0)),null===i.at(0)&&i.replace(0,e(this,h(),0));i.size()<d;)i.add(e(this,h(),1))}};a.DataPlot.rspd("normalize",b),a.ConstantPlot.rspd("normalize",b)})}),window.multigraph.util.namespace("window.multigraph.events.draggable",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin}),window.multigraph.util.namespace("window.multigraph.events.draggable",function(a){"use strict";a.mixin.add(function(a,b){var c=a.core.Graph,d=a.core.Axis;c.hasA("dragStarted").isA("boolean"),c.hasA("dragOrientation").vlds(d.Orientation.isInstance),c.hasA("dragAxis").vlds(function(a){return a instanceof d}),c.rspd("doDragReset",function(){this.dragStarted(!1),this.pauseAllData()}),c.rspd("doDragDone",function(){this.resumeAllData()}),c.rspd("doDrag",function(a,c,e,f,g,h){var i=this.dragAxis,j=this.dragOrientation,k=d.HORIZONTAL,l=d.VERTICAL;try{this.dragStarted()||(j(Math.abs(f)>Math.abs(g)?k:l),i(this.findNearestAxis(c,e,j())),null===i()&&(j(j()===k?l:k),i(this.findNearestAxis(c,e,j()))),this.dragStarted(!0)),h?j()===k?i().doZoom(c,f):i().doZoom(e,g):j()===k?i().doPan(c,f):i().doPan(e,g),a.redraw()}catch(m){b(m)}})})}),window.multigraph.util.namespace("window.multigraph.events.mouse",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin}),window.multigraph.util.namespace("window.multigraph.events.mouse",function(a){"use strict";a.mixin.add(function(a,b){var c=a.core.Graph;c.hasA("mouseWheelTimer").dflt(null),c.rspd("doWheelZoom",function(c,d,e,f){var g=this;try{this.pauseAllData();var h=this.findNearestAxis(d,e);h.orientation()===a.core.Axis.HORIZONTAL?h.doZoom(d,4*f):h.doZoom(e,4*f),c.redraw();var i=this.mouseWheelTimer;null!==i()&&(clearTimeout(i()),i(null)),i(setTimeout(function(){g.resumeAllData()},500))}catch(j){b(j)}})})}),window.multigraph.util.namespace("window.multigraph.events.mouse",function(a){"use strict";a.mixin.add(function(a){var b=window.multigraph.util.namespace("window.multigraph.math");a.core.Multigraph.rspd("registerMouseEvents",function(a){var c,d,e=!1,f=!1,g=this,h=window.multigraph.jQuery(a),i=function(a){return new b.Point(a.pageX-h.offset().left-g.graphs().at(0).x0(),h.height()-(a.pageY-h.offset().top)-g.graphs().at(0).y0())};h.mousedown(function(a){a.preventDefault(),d=c=i(a),e=!0,f=!1}),h.mouseup(function(){e=!1,g.graphs().at(0).doDragDone()}),h.mousemove(function(a){var b=i(a);if(e){var h=b.x()-d.x(),j=b.y()-d.y();g.graphs().size()>0&&(f||g.graphs().at(0).doDragReset(),g.graphs().at(0).doDrag(g,c.x(),c.y(),h,j,a.shiftKey)),f=!0}d=b}),h.mousewheel(function(a,b){var c=i(a);g.graphs().size()>0&&g.graphs().at(0).doWheelZoom(g,c.x(),c.y(),b),a.preventDefault()}),h.mouseenter(function(a){d=i(a),e=!1,g.graphs().at(0).doDragDone()}),h.mouseleave(function(){e=!1,g.graphs().at(0).doDragDone()})})})}),function(a){"use strict";var b=window.multigraph.util.namespace("window.multigraph.core"),c={multigraph:function(){return this.data("multigraph").multigraph},done:function(b){return this.each(function(){return a(this).data("multigraph").multigraph.done(b)})},init:function(c){return this.each(function(){var d=a(this),e=d.data("multigraph");return c.div=this,e||d.data("multigraph",{multigraph:b.Multigraph.createGraph(c)}),this})}};a.fn.multigraph=function(b){return c[b]?c[b].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof b&&b?(a.error("Method "+b+" does not exist on jQuery.multigraph"),null):c.init.apply(this,arguments)},a(document).ready(function(){a("div.multigraph").each(function(){var b,c=a(this).attr("data-width"),d=a(this).attr("data-height"),e=a(this).attr("data-src"),f=a(this).attr("data-driver");void 0!==c&&a(this).css("width",c+"px"),void 0!==d&&a(this).css("height",d+"px"),b={div:this,mugl:e,driver:f},a(this).multigraph(b),a(this).lightbox({scale:!0,postopen:function(){var b=this.data("lightbox");b.originalDiv=this,this.data("multigraph").multigraph.done(function(c){c.div(b.contents),c.initializeSurface(),c.resizeSurface(b.contentWidth,b.contentHeight),c.width(b.contentWidth).height(b.contentHeight),c.busySpinner().remove(),c.busySpinner(a('<div style="position: absolute; left:5px; top:5px;"></div>').appendTo(a(c.div())).busy_spinner()),c.render()});var c=window.setTimeout(function(){b.contents.lightbox("resize"),window.clearTimeout(c)},50)},postclose:function(){var b=this.data("lightbox");this.data("multigraph").multigraph.done(function(c){c.div(b.originalDiv).width(a(c.div()).width()).height(a(c.div()).height()).busySpinner(a('<div style="position: absolute; left:5px; top:5px;"></div>').appendTo(a(c.div())).busy_spinner()),c.initializeSurface(),c.render()})},postresize:function(){var a=this.data("lightbox");this.data("multigraph").multigraph.done(function(b){b.resizeSurface(a.contentWidth,a.contentHeight),b.width(a.contentWidth).height(a.contentHeight),b.render()})}})})})}(window.multigraph.jQuery),window.multigraph.util.namespace("window.multigraph.events.touch",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin}),window.multigraph.util.namespace("window.multigraph.events.touch",function(a){"use strict";a.mixin.add(function(a,b){a.core.Graph.rspd("doFirstPinchZoom",function(c,d,e,f,g,h,i){var j=this.dragAxis,k=this.dragOrientation,l=a.core.Axis,m=l.HORIZONTAL,n=l.VERTICAL;try{this.dragStarted()||(k(h>i?m:n),j(this.findNearestAxis(d,e,k())),null===j()&&(k(k()===m?n:m),j(this.findNearestAxis(d,e,k()))),this.dragStarted(!0)),k()===m?j().doZoom(d,f):j().doZoom(e,g),c.redraw()}catch(o){b(o)}})})}),window.multigraph.util.namespace("window.multigraph.events.touch",function(a){"use strict";a.mixin.add(function(a){var b=window.multigraph.util.namespace("window.multigraph.math");a.core.Multigraph.rspd("registerTouchEvents",function(a){var c,d,e,f,g=!1,h=!1,i=!1,j=!1,k={},l=this,m=window.multigraph.jQuery(a),n=function(a){return new b.Point(a.pageX-m.offset().left-l.graphs().at(0).x0(),m.height()-(a.pageY-m.offset().top)-l.graphs().at(0).y0())},o=function(a){var b=a.originalEvent;b.preventDefault(),1===b.touches.length&&(f=n(b.touches[0])),d=n(b.touches[0]),h=1===b.touches.length?!0:!1,2===b.touches.length?(i=!0,j=!1,e=n(b.touches[1])):(i=!1,j=!1),g=!1,l.graphs().at(0).doDragDone()},p=function(a){var b=a.originalEvent;b.preventDefault(),1===b.touches.length&&h===!0&&s(b),2===b.touches.length&&i===!0&&t(b)},q=function(a){var b=a.originalEvent;b.preventDefault(),h=1===b.touches.length?!0:!1,2===b.touches.length?(i=!0,j=!1):(i=!1,j=!1),g=!1,l.graphs().at(0).doDragDone()},r=function(a){a.originalEvent.preventDefault(),h=!1,i=!1,j=!1,g=!1,l.graphs().at(0).doDragDone()},s=function(a){var b=n(a.touches[0]),c=b.x()-d.x(),e=b.y()-d.y();l.graphs().size()>0&&(g||l.graphs().at(0).doDragReset(),l.graphs().at(0).doDrag(l,f.x(),f.y(),c,e,!1)),g=!0,d=b},t=function(a){var b=n(a.touches[0]),f=n(a.touches[1]),h=(b.x()+f.x())/2,i=(b.y()+f.y())/2,m=u(b.x(),f.x())-u(d.x(),e.x()),o=u(b.y(),f.y())-u(d.y(),e.y());l.graphs().size()>0&&(g||l.graphs().at(0).doDragReset(),j===!0&&l.graphs().at(0).doDrag(l,h,i,m,o,!0)),g=!0;var p=(b.x()-d.x()+(f.x()-e.x()))/2,q=(b.y()-d.y()+(f.y()-e.y()))/2;j===!0&&l.graphs().at(0).doDrag(l,h,i,p,q,!1),j===!1&&(void 0===k.base&&(k.base={},k.base.x=h,k.base.y=i),void 0===k.zoomDeltas&&(k.zoomDeltas={dx:0,dy:0,totalx:0,totaly:0}),void 0===k.panDeltas&&(k.panDeltas={dx:0,dy:0}),k.zoomDeltas.dx+=m,k.zoomDeltas.dy+=o,k.panDeltas.dx+=p,k.panDeltas.dy+=q,k.zoomDeltas.totalx+=Math.abs(m),k.zoomDeltas.totaly+=Math.abs(o),void 0===c&&(c=setTimeout(function(){var a=k.base.x,b=k.base.y,d=k.zoomDeltas.dx,e=k.zoomDeltas.dy,f=k.panDeltas.dx,g=k.panDeltas.dy;l.graphs().at(0).doDragReset(),l.graphs().at(0).doFirstPinchZoom(l,a,b,d,e,k.zoomDeltas.totalx,k.zoomDeltas.totaly),l.graphs().at(0).doDrag(l,a,b,f,g,!1),k={},j=!0,clearTimeout(c),c=void 0},60))),d=b,e=f},u=function(a,b){return Math.abs(a-b)};m.on("touchstart",o),m.on("touchmove",p),m.on("touchend",q),m.on("touchleave",r)})})}),function(a){var b,c,d="0.3.4",e="hasOwnProperty",f=/[\.\/]/,g="*",h=function(){},i=function(a,b){return a-b},j={n:{}},k=function(a,d){var e,f=c,g=Array.prototype.slice.call(arguments,2),h=k.listeners(a),j=0,l=[],m={},n=[],o=b;b=a,c=0;for(var p=0,q=h.length;q>p;p++)"zIndex"in h[p]&&(l.push(h[p].zIndex),h[p].zIndex<0&&(m[h[p].zIndex]=h[p]));for(l.sort(i);l[j]<0;)if(e=m[l[j++]],n.push(e.apply(d,g)),c)return c=f,n;for(p=0;q>p;p++)if(e=h[p],"zIndex"in e)if(e.zIndex==l[j]){if(n.push(e.apply(d,g)),c)break;do if(j++,e=m[l[j]],e&&n.push(e.apply(d,g)),c)break;while(e)}else m[e.zIndex]=e;else if(n.push(e.apply(d,g)),c)break;return c=f,b=o,n.length?n:null};k.listeners=function(a){var b,c,d,e,h,i,k,l,m=a.split(f),n=j,o=[n],p=[];for(e=0,h=m.length;h>e;e++){for(l=[],i=0,k=o.length;k>i;i++)for(n=o[i].n,c=[n[m[e]],n[g]],d=2;d--;)b=c[d],b&&(l.push(b),p=p.concat(b.f||[]));o=l}return p},k.on=function(a,b){for(var c=a.split(f),d=j,e=0,g=c.length;g>e;e++)d=d.n,!d[c[e]]&&(d[c[e]]={n:{}}),d=d[c[e]];for(d.f=d.f||[],e=0,g=d.f.length;g>e;e++)if(d.f[e]==b)return h;return d.f.push(b),function(a){+a==+a&&(b.zIndex=+a)}},k.stop=function(){c=1},k.nt=function(a){return a?new RegExp("(?:\\.|\\/|^)"+a+"(?:\\.|\\/|$)").test(b):b},k.off=k.unbind=function(a,b){var c,d,h,i,k,l,m,n=a.split(f),o=[j];for(i=0,k=n.length;k>i;i++)for(l=0;l<o.length;l+=h.length-2){if(h=[l,1],c=o[l].n,n[i]!=g)c[n[i]]&&h.push(c[n[i]]);else for(d in c)c[e](d)&&h.push(c[d]);o.splice.apply(o,h)}for(i=0,k=o.length;k>i;i++)for(c=o[i];c.n;){if(b){if(c.f){for(l=0,m=c.f.length;m>l;l++)if(c.f[l]==b){c.f.splice(l,1);break}!c.f.length&&delete c.f}for(d in c.n)if(c.n[e](d)&&c.n[d].f){var p=c.n[d].f;for(l=0,m=p.length;m>l;l++)if(p[l]==b){p.splice(l,1);break}!p.length&&delete c.n[d].f}}else{delete c.f;for(d in c.n)c.n[e](d)&&c.n[d].f&&delete c.n[d].f}c=c.n}},k.once=function(a,b){var c=function(){var d=b.apply(this,arguments);return k.unbind(a,c),d};return k.on(a,c)},k.version=d,k.toString=function(){return"You are running Eve "+d},"undefined"!=typeof module&&module.exports?module.exports=k:"undefined"!=typeof define?define("eve",[],function(){return k}):a.eve=k}(this),function(){function a(b){if(a.is(b,"function"))return s?b():eve.on("raphael.DOMload",b);if(a.is(b,T))return a._engine.create[B](a,b.splice(0,3+a.is(b[0],R))).add(b);var c=Array.prototype.slice.call(arguments,0);if(a.is(c[c.length-1],"function")){var d=c.pop();return s?d.call(a._engine.create[B](a,c)):eve.on("raphael.DOMload",function(){d.call(a._engine.create[B](a,c))
})}return a._engine.create[B](a,arguments)}function b(a){if(Object(a)!==a)return a;var c=new a.constructor;for(var d in a)a[x](d)&&(c[d]=b(a[d]));return c}function c(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return a.push(a.splice(c,1)[0])}function d(a,b,d){function e(){var f=Array.prototype.slice.call(arguments,0),g=f.join("�?�"),h=e.cache=e.cache||{},i=e.count=e.count||[];return h[x](g)?(c(i,g),d?d(h[g]):h[g]):(i.length>=1e3&&delete h[i.shift()],i.push(g),h[g]=a[B](b,f),d?d(h[g]):h[g])}return e}function e(){return this.hex}function f(a,b){for(var c=[],d=0,e=a.length;e-2*!b>d;d+=2){var f=[{x:+a[d-2],y:+a[d-1]},{x:+a[d],y:+a[d+1]},{x:+a[d+2],y:+a[d+3]},{x:+a[d+4],y:+a[d+5]}];b?d?e-4==d?f[3]={x:+a[0],y:+a[1]}:e-2==d&&(f[2]={x:+a[0],y:+a[1]},f[3]={x:+a[2],y:+a[3]}):f[0]={x:+a[e-2],y:+a[e-1]}:e-4==d?f[3]=f[2]:d||(f[0]={x:+a[d],y:+a[d+1]}),c.push(["C",(-f[0].x+6*f[1].x+f[2].x)/6,(-f[0].y+6*f[1].y+f[2].y)/6,(f[1].x+6*f[2].x-f[3].x)/6,(f[1].y+6*f[2].y-f[3].y)/6,f[2].x,f[2].y])}return c}function g(a,b,c,d,e){var f=-3*b+9*c-9*d+3*e,g=a*f+6*b-12*c+6*d;return a*g-3*b+3*c}function h(a,b,c,d,e,f,h,i,j){null==j&&(j=1),j=j>1?1:0>j?0:j;for(var k=j/2,l=12,m=[-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816],n=[.2491,.2491,.2335,.2335,.2032,.2032,.1601,.1601,.1069,.1069,.0472,.0472],o=0,p=0;l>p;p++){var q=k*m[p]+k,r=g(q,a,c,e,h),s=g(q,b,d,f,i),t=r*r+s*s;o+=n[p]*L.sqrt(t)}return k*o}function i(a,b,c,d,e,f,g,i,j){if(!(0>j||h(a,b,c,d,e,f,g,i)<j)){var k,l=1,m=l/2,n=l-m,o=.01;for(k=h(a,b,c,d,e,f,g,i,n);O(k-j)>o;)m/=2,n+=(j>k?1:-1)*m,k=h(a,b,c,d,e,f,g,i,n);return n}}function j(a,b,c,d,e,f,g,h){if(!(M(a,c)<N(e,g)||N(a,c)>M(e,g)||M(b,d)<N(f,h)||N(b,d)>M(f,h))){var i=(a*d-b*c)*(e-g)-(a-c)*(e*h-f*g),j=(a*d-b*c)*(f-h)-(b-d)*(e*h-f*g),k=(a-c)*(f-h)-(b-d)*(e-g);if(k){var l=i/k,m=j/k,n=+l.toFixed(2),o=+m.toFixed(2);if(!(n<+N(a,c).toFixed(2)||n>+M(a,c).toFixed(2)||n<+N(e,g).toFixed(2)||n>+M(e,g).toFixed(2)||o<+N(b,d).toFixed(2)||o>+M(b,d).toFixed(2)||o<+N(f,h).toFixed(2)||o>+M(f,h).toFixed(2)))return{x:l,y:m}}}}function k(b,c,d){var e=a.bezierBBox(b),f=a.bezierBBox(c);if(!a.isBBoxIntersect(e,f))return d?0:[];for(var g=h.apply(0,b),i=h.apply(0,c),k=~~(g/5),l=~~(i/5),m=[],n=[],o={},p=d?0:[],q=0;k+1>q;q++){var r=a.findDotsAtSegment.apply(a,b.concat(q/k));m.push({x:r.x,y:r.y,t:q/k})}for(q=0;l+1>q;q++)r=a.findDotsAtSegment.apply(a,c.concat(q/l)),n.push({x:r.x,y:r.y,t:q/l});for(q=0;k>q;q++)for(var s=0;l>s;s++){var t=m[q],u=m[q+1],v=n[s],w=n[s+1],x=O(u.x-t.x)<.001?"y":"x",y=O(w.x-v.x)<.001?"y":"x",z=j(t.x,t.y,u.x,u.y,v.x,v.y,w.x,w.y);if(z){if(o[z.x.toFixed(4)]==z.y.toFixed(4))continue;o[z.x.toFixed(4)]=z.y.toFixed(4);var A=t.t+O((z[x]-t[x])/(u[x]-t[x]))*(u.t-t.t),B=v.t+O((z[y]-v[y])/(w[y]-v[y]))*(w.t-v.t);A>=0&&1>=A&&B>=0&&1>=B&&(d?p++:p.push({x:z.x,y:z.y,t1:A,t2:B}))}}return p}function l(b,c,d){b=a._path2curve(b),c=a._path2curve(c);for(var e,f,g,h,i,j,l,m,n,o,p=d?0:[],q=0,r=b.length;r>q;q++){var s=b[q];if("M"==s[0])e=i=s[1],f=j=s[2];else{"C"==s[0]?(n=[e,f].concat(s.slice(1)),e=n[6],f=n[7]):(n=[e,f,e,f,i,j,i,j],e=i,f=j);for(var t=0,u=c.length;u>t;t++){var v=c[t];if("M"==v[0])g=l=v[1],h=m=v[2];else{"C"==v[0]?(o=[g,h].concat(v.slice(1)),g=o[6],h=o[7]):(o=[g,h,g,h,l,m,l,m],g=l,h=m);var w=k(n,o,d);if(d)p+=w;else{for(var x=0,y=w.length;y>x;x++)w[x].segment1=q,w[x].segment2=t,w[x].bez1=n,w[x].bez2=o;p=p.concat(w)}}}}}return p}function m(a,b,c,d,e,f){null!=a?(this.a=+a,this.b=+b,this.c=+c,this.d=+d,this.e=+e,this.f=+f):(this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0)}function n(){return this.x+F+this.y+F+this.width+" × "+this.height}function o(a,b,c,d,e,f){function g(a){return((l*a+k)*a+j)*a}function h(a,b){var c=i(a,b);return((o*c+n)*c+m)*c}function i(a,b){var c,d,e,f,h,i;for(e=a,i=0;8>i;i++){if(f=g(e)-a,O(f)<b)return e;if(h=(3*l*e+2*k)*e+j,O(h)<1e-6)break;e-=f/h}if(c=0,d=1,e=a,c>e)return c;if(e>d)return d;for(;d>c;){if(f=g(e),O(f-a)<b)return e;a>f?c=e:d=e,e=(d-c)/2+c}return e}var j=3*b,k=3*(d-b)-j,l=1-j-k,m=3*c,n=3*(e-c)-m,o=1-m-n;return h(a,1/(200*f))}function p(a,b){var c=[],d={};if(this.ms=b,this.times=1,a){for(var e in a)a[x](e)&&(d[Z(e)]=a[e],c.push(Z(e)));c.sort(jb)}this.anim=d,this.top=c[c.length-1],this.percents=c}function q(b,c,d,e,f,g){d=Z(d);var h,i,j,k,l,n,p=b.ms,q={},r={},s={};if(e)for(v=0,w=fc.length;w>v;v++){var t=fc[v];if(t.el.id==c.id&&t.anim==b){t.percent!=d?(fc.splice(v,1),j=1):i=t,c.attr(t.totalOrigin);break}}else e=+r;for(var v=0,w=b.percents.length;w>v;v++){if(b.percents[v]==d||b.percents[v]>e*b.top){d=b.percents[v],l=b.percents[v-1]||0,p=p/b.top*(d-l),k=b.percents[v+1],h=b.anim[d];break}e&&c.attr(b.anim[b.percents[v]])}if(h){if(i)i.initstatus=e,i.start=new Date-i.ms*e;else{for(var y in h)if(h[x](y)&&(bb[x](y)||c.paper.customAttributes[x](y)))switch(q[y]=c.attr(y),null==q[y]&&(q[y]=ab[y]),r[y]=h[y],bb[y]){case R:s[y]=(r[y]-q[y])/p;break;case"colour":q[y]=a.getRGB(q[y]);var z=a.getRGB(r[y]);s[y]={r:(z.r-q[y].r)/p,g:(z.g-q[y].g)/p,b:(z.b-q[y].b)/p};break;case"path":var A=Ib(q[y],r[y]),B=A[1];for(q[y]=A[0],s[y]=[],v=0,w=q[y].length;w>v;v++){s[y][v]=[0];for(var D=1,E=q[y][v].length;E>D;D++)s[y][v][D]=(B[v][D]-q[y][v][D])/p}break;case"transform":var F=c._,I=Nb(F[y],r[y]);if(I)for(q[y]=I.from,r[y]=I.to,s[y]=[],s[y].real=!0,v=0,w=q[y].length;w>v;v++)for(s[y][v]=[q[y][v][0]],D=1,E=q[y][v].length;E>D;D++)s[y][v][D]=(r[y][v][D]-q[y][v][D])/p;else{var J=c.matrix||new m,K={_:{transform:F.transform},getBBox:function(){return c.getBBox(1)}};q[y]=[J.a,J.b,J.c,J.d,J.e,J.f],Lb(K,r[y]),r[y]=K._.transform,s[y]=[(K.matrix.a-J.a)/p,(K.matrix.b-J.b)/p,(K.matrix.c-J.c)/p,(K.matrix.d-J.d)/p,(K.matrix.e-J.e)/p,(K.matrix.f-J.f)/p]}break;case"csv":var L=G(h[y])[H](u),M=G(q[y])[H](u);if("clip-rect"==y)for(q[y]=M,s[y]=[],v=M.length;v--;)s[y][v]=(L[v]-q[y][v])/p;r[y]=L;break;default:for(L=[][C](h[y]),M=[][C](q[y]),s[y]=[],v=c.paper.customAttributes[y].length;v--;)s[y][v]=((L[v]||0)-(M[v]||0))/p}var N=h.easing,O=a.easing_formulas[N];if(!O)if(O=G(N).match(X),O&&5==O.length){var P=O;O=function(a){return o(a,+P[1],+P[2],+P[3],+P[4],p)}}else O=lb;if(n=h.start||b.start||+new Date,t={anim:b,percent:d,timestamp:n,start:n+(b.del||0),status:0,initstatus:e||0,stop:!1,ms:p,easing:O,from:q,diff:s,to:r,el:c,callback:h.callback,prev:l,next:k,repeat:g||b.times,origin:c.attr(),totalOrigin:f},fc.push(t),e&&!i&&!j&&(t.stop=!0,t.start=new Date-p*e,1==fc.length))return hc();j&&(t.start=new Date-t.ms*e),1==fc.length&&gc(hc)}eve("raphael.anim.start."+c.id,c,b)}}function r(a){for(var b=0;b<fc.length;b++)fc[b].el.paper==a&&fc.splice(b--,1)}a.version="2.1.0",a.eve=eve;var s,t,u=/[, ]+/,v={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},w=/\{(\d+)\}/g,x="hasOwnProperty",y={doc:document,win:window},z={was:Object.prototype[x].call(y.win,"Raphael"),is:y.win.Raphael},A=function(){this.ca=this.customAttributes={}},B="apply",C="concat",D="createTouch"in y.doc,E="",F=" ",G=String,H="split",I="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[H](F),J={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},K=G.prototype.toLowerCase,L=Math,M=L.max,N=L.min,O=L.abs,P=L.pow,Q=L.PI,R="number",S="string",T="array",U=Object.prototype.toString,V=(a._ISURL=/^url\(['"]?([^\)]+?)['"]?\)$/i,/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i),W={NaN:1,Infinity:1,"-Infinity":1},X=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,Y=L.round,Z=parseFloat,$=parseInt,_=G.prototype.toUpperCase,ab=a._availableAttrs={"arrow-end":"none","arrow-start":"none",blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/","letter-spacing":0,opacity:1,path:"M0,0",r:0,rx:0,ry:0,src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",transform:"",width:0,x:0,y:0},bb=a._availableAnimAttrs={blur:R,"clip-rect":"csv",cx:R,cy:R,fill:"colour","fill-opacity":R,"font-size":R,height:R,opacity:R,path:"path",r:R,rx:R,ry:R,stroke:"colour","stroke-opacity":R,"stroke-width":R,transform:"transform",width:R,x:R,y:R},cb=/[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,db={hs:1,rg:1},eb=/,?([achlmqrstvxz]),?/gi,fb=/([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,gb=/([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,hb=/(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/gi,ib=(a._radial_gradient=/^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,{}),jb=function(a,b){return Z(a)-Z(b)},kb=function(){},lb=function(a){return a},mb=a._rectPath=function(a,b,c,d,e){return e?[["M",a+e,b],["l",c-2*e,0],["a",e,e,0,0,1,e,e],["l",0,d-2*e],["a",e,e,0,0,1,-e,e],["l",2*e-c,0],["a",e,e,0,0,1,-e,-e],["l",0,2*e-d],["a",e,e,0,0,1,e,-e],["z"]]:[["M",a,b],["l",c,0],["l",0,d],["l",-c,0],["z"]]},nb=function(a,b,c,d){return null==d&&(d=c),[["M",a,b],["m",0,-d],["a",c,d,0,1,1,0,2*d],["a",c,d,0,1,1,0,-2*d],["z"]]},ob=a._getPath={path:function(a){return a.attr("path")},circle:function(a){var b=a.attrs;return nb(b.cx,b.cy,b.r)},ellipse:function(a){var b=a.attrs;return nb(b.cx,b.cy,b.rx,b.ry)},rect:function(a){var b=a.attrs;return mb(b.x,b.y,b.width,b.height,b.r)},image:function(a){var b=a.attrs;return mb(b.x,b.y,b.width,b.height)},text:function(a){var b=a._getBBox();return mb(b.x,b.y,b.width,b.height)}},pb=a.mapPath=function(a,b){if(!b)return a;var c,d,e,f,g,h,i;for(a=Ib(a),e=0,g=a.length;g>e;e++)for(i=a[e],f=1,h=i.length;h>f;f+=2)c=b.x(i[f],i[f+1]),d=b.y(i[f],i[f+1]),i[f]=c,i[f+1]=d;return a};if(a._g=y,a.type=y.win.SVGAngle||y.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML","VML"==a.type){var qb,rb=y.doc.createElement("div");if(rb.innerHTML='<v:shape adj="1"/>',qb=rb.firstChild,qb.style.behavior="url(#default#VML)",!qb||"object"!=typeof qb.adj)return a.type=E;rb=null}a.svg=!(a.vml="VML"==a.type),a._Paper=A,a.fn=t=A.prototype=a.prototype,a._id=0,a._oid=0,a.is=function(a,b){return b=K.call(b),"finite"==b?!W[x](+a):"array"==b?a instanceof Array:"null"==b&&null===a||b==typeof a&&null!==a||"object"==b&&a===Object(a)||"array"==b&&Array.isArray&&Array.isArray(a)||U.call(a).slice(8,-1).toLowerCase()==b},a.angle=function(b,c,d,e,f,g){if(null==f){var h=b-d,i=c-e;return h||i?(180+180*L.atan2(-i,-h)/Q+360)%360:0}return a.angle(b,c,f,g)-a.angle(d,e,f,g)},a.rad=function(a){return a%360*Q/180},a.deg=function(a){return 180*a/Q%360},a.snapTo=function(b,c,d){if(d=a.is(d,"finite")?d:10,a.is(b,T)){for(var e=b.length;e--;)if(O(b[e]-c)<=d)return b[e]}else{b=+b;var f=c%b;if(d>f)return c-f;if(f>b-d)return c-f+b}return c};a.createUUID=function(a,b){return function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(a,b).toUpperCase()}}(/[xy]/g,function(a){var b=16*L.random()|0,c="x"==a?b:3&b|8;return c.toString(16)});a.setWindow=function(b){eve("raphael.setWindow",a,y.win,b),y.win=b,y.doc=y.win.document,a._engine.initWin&&a._engine.initWin(y.win)};var sb=function(b){if(a.vml){var c,e=/^\s+|\s+$/g;try{var f=new ActiveXObject("htmlfile");f.write("<body>"),f.close(),c=f.body}catch(g){c=createPopup().document.body}var h=c.createTextRange();sb=d(function(a){try{c.style.color=G(a).replace(e,E);var b=h.queryCommandValue("ForeColor");return b=(255&b)<<16|65280&b|(16711680&b)>>>16,"#"+("000000"+b.toString(16)).slice(-6)}catch(d){return"none"}})}else{var i=y.doc.createElement("i");i.title="Raphaël Colour Picker",i.style.display="none",y.doc.body.appendChild(i),sb=d(function(a){return i.style.color=a,y.doc.defaultView.getComputedStyle(i,E).getPropertyValue("color")})}return sb(b)},tb=function(){return"hsb("+[this.h,this.s,this.b]+")"},ub=function(){return"hsl("+[this.h,this.s,this.l]+")"},vb=function(){return this.hex},wb=function(b,c,d){if(null==c&&a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b&&(d=b.b,c=b.g,b=b.r),null==c&&a.is(b,S)){var e=a.getRGB(b);b=e.r,c=e.g,d=e.b}return(b>1||c>1||d>1)&&(b/=255,c/=255,d/=255),[b,c,d]},xb=function(b,c,d,e){b*=255,c*=255,d*=255;var f={r:b,g:c,b:d,hex:a.rgb(b,c,d),toString:vb};return a.is(e,"finite")&&(f.opacity=e),f};a.color=function(b){var c;return a.is(b,"object")&&"h"in b&&"s"in b&&"b"in b?(c=a.hsb2rgb(b),b.r=c.r,b.g=c.g,b.b=c.b,b.hex=c.hex):a.is(b,"object")&&"h"in b&&"s"in b&&"l"in b?(c=a.hsl2rgb(b),b.r=c.r,b.g=c.g,b.b=c.b,b.hex=c.hex):(a.is(b,"string")&&(b=a.getRGB(b)),a.is(b,"object")&&"r"in b&&"g"in b&&"b"in b?(c=a.rgb2hsl(b),b.h=c.h,b.s=c.s,b.l=c.l,c=a.rgb2hsb(b),b.v=c.b):(b={hex:"none"},b.r=b.g=b.b=b.h=b.s=b.v=b.l=-1)),b.toString=vb,b},a.hsb2rgb=function(a,b,c,d){this.is(a,"object")&&"h"in a&&"s"in a&&"b"in a&&(c=a.b,b=a.s,a=a.h,d=a.o),a*=360;var e,f,g,h,i;return a=a%360/60,i=c*b,h=i*(1-O(a%2-1)),e=f=g=c-i,a=~~a,e+=[i,h,0,0,h,i][a],f+=[h,i,i,h,0,0][a],g+=[0,0,h,i,i,h][a],xb(e,f,g,d)},a.hsl2rgb=function(a,b,c,d){this.is(a,"object")&&"h"in a&&"s"in a&&"l"in a&&(c=a.l,b=a.s,a=a.h),(a>1||b>1||c>1)&&(a/=360,b/=100,c/=100),a*=360;var e,f,g,h,i;return a=a%360/60,i=2*b*(.5>c?c:1-c),h=i*(1-O(a%2-1)),e=f=g=c-i/2,a=~~a,e+=[i,h,0,0,h,i][a],f+=[h,i,i,h,0,0][a],g+=[0,0,h,i,i,h][a],xb(e,f,g,d)},a.rgb2hsb=function(a,b,c){c=wb(a,b,c),a=c[0],b=c[1],c=c[2];var d,e,f,g;return f=M(a,b,c),g=f-N(a,b,c),d=0==g?null:f==a?(b-c)/g:f==b?(c-a)/g+2:(a-b)/g+4,d=(d+360)%6*60/360,e=0==g?0:g/f,{h:d,s:e,b:f,toString:tb}},a.rgb2hsl=function(a,b,c){c=wb(a,b,c),a=c[0],b=c[1],c=c[2];var d,e,f,g,h,i;return g=M(a,b,c),h=N(a,b,c),i=g-h,d=0==i?null:g==a?(b-c)/i:g==b?(c-a)/i+2:(a-b)/i+4,d=(d+360)%6*60/360,f=(g+h)/2,e=0==i?0:.5>f?i/(2*f):i/(2-2*f),{h:d,s:e,l:f,toString:ub}},a._path2string=function(){return this.join(",").replace(eb,"$1")};a._preload=function(a,b){var c=y.doc.createElement("img");c.style.cssText="position:absolute;left:-9999em;top:-9999em",c.onload=function(){b.call(this),this.onload=null,y.doc.body.removeChild(this)},c.onerror=function(){y.doc.body.removeChild(this)},y.doc.body.appendChild(c),c.src=a};a.getRGB=d(function(b){if(!b||(b=G(b)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:e};if("none"==b)return{r:-1,g:-1,b:-1,hex:"none",toString:e};!(db[x](b.toLowerCase().substring(0,2))||"#"==b.charAt())&&(b=sb(b));var c,d,f,g,h,i,j=b.match(V);return j?(j[2]&&(f=$(j[2].substring(5),16),d=$(j[2].substring(3,5),16),c=$(j[2].substring(1,3),16)),j[3]&&(f=$((h=j[3].charAt(3))+h,16),d=$((h=j[3].charAt(2))+h,16),c=$((h=j[3].charAt(1))+h,16)),j[4]&&(i=j[4][H](cb),c=Z(i[0]),"%"==i[0].slice(-1)&&(c*=2.55),d=Z(i[1]),"%"==i[1].slice(-1)&&(d*=2.55),f=Z(i[2]),"%"==i[2].slice(-1)&&(f*=2.55),"rgba"==j[1].toLowerCase().slice(0,4)&&(g=Z(i[3])),i[3]&&"%"==i[3].slice(-1)&&(g/=100)),j[5]?(i=j[5][H](cb),c=Z(i[0]),"%"==i[0].slice(-1)&&(c*=2.55),d=Z(i[1]),"%"==i[1].slice(-1)&&(d*=2.55),f=Z(i[2]),"%"==i[2].slice(-1)&&(f*=2.55),("deg"==i[0].slice(-3)||"°"==i[0].slice(-1))&&(c/=360),"hsba"==j[1].toLowerCase().slice(0,4)&&(g=Z(i[3])),i[3]&&"%"==i[3].slice(-1)&&(g/=100),a.hsb2rgb(c,d,f,g)):j[6]?(i=j[6][H](cb),c=Z(i[0]),"%"==i[0].slice(-1)&&(c*=2.55),d=Z(i[1]),"%"==i[1].slice(-1)&&(d*=2.55),f=Z(i[2]),"%"==i[2].slice(-1)&&(f*=2.55),("deg"==i[0].slice(-3)||"°"==i[0].slice(-1))&&(c/=360),"hsla"==j[1].toLowerCase().slice(0,4)&&(g=Z(i[3])),i[3]&&"%"==i[3].slice(-1)&&(g/=100),a.hsl2rgb(c,d,f,g)):(j={r:c,g:d,b:f,toString:e},j.hex="#"+(16777216|f|d<<8|c<<16).toString(16).slice(1),a.is(g,"finite")&&(j.opacity=g),j)):{r:-1,g:-1,b:-1,hex:"none",error:1,toString:e}},a),a.hsb=d(function(b,c,d){return a.hsb2rgb(b,c,d).hex}),a.hsl=d(function(b,c,d){return a.hsl2rgb(b,c,d).hex}),a.rgb=d(function(a,b,c){return"#"+(16777216|c|b<<8|a<<16).toString(16).slice(1)}),a.getColor=function(a){var b=this.getColor.start=this.getColor.start||{h:0,s:1,b:a||.75},c=this.hsb2rgb(b.h,b.s,b.b);return b.h+=.075,b.h>1&&(b.h=0,b.s-=.2,b.s<=0&&(this.getColor.start={h:0,s:1,b:b.b})),c.hex},a.getColor.reset=function(){delete this.start},a.parsePathString=function(b){if(!b)return null;var c=yb(b);if(c.arr)return Ab(c.arr);var d={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},e=[];return a.is(b,T)&&a.is(b[0],T)&&(e=Ab(b)),e.length||G(b).replace(fb,function(a,b,c){var f=[],g=b.toLowerCase();if(c.replace(hb,function(a,b){b&&f.push(+b)}),"m"==g&&f.length>2&&(e.push([b][C](f.splice(0,2))),g="l",b="m"==b?"l":"L"),"r"==g)e.push([b][C](f));else for(;f.length>=d[g]&&(e.push([b][C](f.splice(0,d[g]))),d[g]););}),e.toString=a._path2string,c.arr=Ab(e),e},a.parseTransformString=d(function(b){if(!b)return null;var c=[];return a.is(b,T)&&a.is(b[0],T)&&(c=Ab(b)),c.length||G(b).replace(gb,function(a,b,d){{var e=[];K.call(b)}d.replace(hb,function(a,b){b&&e.push(+b)}),c.push([b][C](e))}),c.toString=a._path2string,c});var yb=function(a){var b=yb.ps=yb.ps||{};return b[a]?b[a].sleep=100:b[a]={sleep:100},setTimeout(function(){for(var c in b)b[x](c)&&c!=a&&(b[c].sleep--,!b[c].sleep&&delete b[c])}),b[a]};a.findDotsAtSegment=function(a,b,c,d,e,f,g,h,i){var j=1-i,k=P(j,3),l=P(j,2),m=i*i,n=m*i,o=k*a+3*l*i*c+3*j*i*i*e+n*g,p=k*b+3*l*i*d+3*j*i*i*f+n*h,q=a+2*i*(c-a)+m*(e-2*c+a),r=b+2*i*(d-b)+m*(f-2*d+b),s=c+2*i*(e-c)+m*(g-2*e+c),t=d+2*i*(f-d)+m*(h-2*f+d),u=j*a+i*c,v=j*b+i*d,w=j*e+i*g,x=j*f+i*h,y=90-180*L.atan2(q-s,r-t)/Q;return(q>s||t>r)&&(y+=180),{x:o,y:p,m:{x:q,y:r},n:{x:s,y:t},start:{x:u,y:v},end:{x:w,y:x},alpha:y}},a.bezierBBox=function(b,c,d,e,f,g,h,i){a.is(b,"array")||(b=[b,c,d,e,f,g,h,i]);var j=Hb.apply(null,b);return{x:j.min.x,y:j.min.y,x2:j.max.x,y2:j.max.y,width:j.max.x-j.min.x,height:j.max.y-j.min.y}},a.isPointInsideBBox=function(a,b,c){return b>=a.x&&b<=a.x2&&c>=a.y&&c<=a.y2},a.isBBoxIntersect=function(b,c){var d=a.isPointInsideBBox;return d(c,b.x,b.y)||d(c,b.x2,b.y)||d(c,b.x,b.y2)||d(c,b.x2,b.y2)||d(b,c.x,c.y)||d(b,c.x2,c.y)||d(b,c.x,c.y2)||d(b,c.x2,c.y2)||(b.x<c.x2&&b.x>c.x||c.x<b.x2&&c.x>b.x)&&(b.y<c.y2&&b.y>c.y||c.y<b.y2&&c.y>b.y)},a.pathIntersection=function(a,b){return l(a,b)},a.pathIntersectionNumber=function(a,b){return l(a,b,1)},a.isPointInsidePath=function(b,c,d){var e=a.pathBBox(b);return a.isPointInsideBBox(e,c,d)&&l(b,[["M",c,d],["H",e.x2+10]],1)%2==1},a._removedFactory=function(a){return function(){eve("raphael.log",null,"Raphaël: you are calling to method “"+a+"�? of removed object",a)}};var zb=a.pathBBox=function(a){var c=yb(a);if(c.bbox)return c.bbox;if(!a)return{x:0,y:0,width:0,height:0,x2:0,y2:0};a=Ib(a);for(var d,e=0,f=0,g=[],h=[],i=0,j=a.length;j>i;i++)if(d=a[i],"M"==d[0])e=d[1],f=d[2],g.push(e),h.push(f);else{var k=Hb(e,f,d[1],d[2],d[3],d[4],d[5],d[6]);g=g[C](k.min.x,k.max.x),h=h[C](k.min.y,k.max.y),e=d[5],f=d[6]}var l=N[B](0,g),m=N[B](0,h),n=M[B](0,g),o=M[B](0,h),p={x:l,y:m,x2:n,y2:o,width:n-l,height:o-m};return c.bbox=b(p),p},Ab=function(c){var d=b(c);return d.toString=a._path2string,d},Bb=a._pathToRelative=function(b){var c=yb(b);if(c.rel)return Ab(c.rel);a.is(b,T)&&a.is(b&&b[0],T)||(b=a.parsePathString(b));var d=[],e=0,f=0,g=0,h=0,i=0;"M"==b[0][0]&&(e=b[0][1],f=b[0][2],g=e,h=f,i++,d.push(["M",e,f]));for(var j=i,k=b.length;k>j;j++){var l=d[j]=[],m=b[j];if(m[0]!=K.call(m[0]))switch(l[0]=K.call(m[0]),l[0]){case"a":l[1]=m[1],l[2]=m[2],l[3]=m[3],l[4]=m[4],l[5]=m[5],l[6]=+(m[6]-e).toFixed(3),l[7]=+(m[7]-f).toFixed(3);break;case"v":l[1]=+(m[1]-f).toFixed(3);break;case"m":g=m[1],h=m[2];default:for(var n=1,o=m.length;o>n;n++)l[n]=+(m[n]-(n%2?e:f)).toFixed(3)}else{l=d[j]=[],"m"==m[0]&&(g=m[1]+e,h=m[2]+f);for(var p=0,q=m.length;q>p;p++)d[j][p]=m[p]}var r=d[j].length;switch(d[j][0]){case"z":e=g,f=h;break;case"h":e+=+d[j][r-1];break;case"v":f+=+d[j][r-1];break;default:e+=+d[j][r-2],f+=+d[j][r-1]}}return d.toString=a._path2string,c.rel=Ab(d),d},Cb=a._pathToAbsolute=function(b){var c=yb(b);if(c.abs)return Ab(c.abs);if(a.is(b,T)&&a.is(b&&b[0],T)||(b=a.parsePathString(b)),!b||!b.length)return[["M",0,0]];var d=[],e=0,g=0,h=0,i=0,j=0;"M"==b[0][0]&&(e=+b[0][1],g=+b[0][2],h=e,i=g,j++,d[0]=["M",e,g]);for(var k,l,m=3==b.length&&"M"==b[0][0]&&"R"==b[1][0].toUpperCase()&&"Z"==b[2][0].toUpperCase(),n=j,o=b.length;o>n;n++){if(d.push(k=[]),l=b[n],l[0]!=_.call(l[0]))switch(k[0]=_.call(l[0]),k[0]){case"A":k[1]=l[1],k[2]=l[2],k[3]=l[3],k[4]=l[4],k[5]=l[5],k[6]=+(l[6]+e),k[7]=+(l[7]+g);break;case"V":k[1]=+l[1]+g;break;case"H":k[1]=+l[1]+e;break;case"R":for(var p=[e,g][C](l.slice(1)),q=2,r=p.length;r>q;q++)p[q]=+p[q]+e,p[++q]=+p[q]+g;d.pop(),d=d[C](f(p,m));break;case"M":h=+l[1]+e,i=+l[2]+g;default:for(q=1,r=l.length;r>q;q++)k[q]=+l[q]+(q%2?e:g)}else if("R"==l[0])p=[e,g][C](l.slice(1)),d.pop(),d=d[C](f(p,m)),k=["R"][C](l.slice(-2));else for(var s=0,t=l.length;t>s;s++)k[s]=l[s];switch(k[0]){case"Z":e=h,g=i;break;case"H":e=k[1];break;case"V":g=k[1];break;case"M":h=k[k.length-2],i=k[k.length-1];default:e=k[k.length-2],g=k[k.length-1]}}return d.toString=a._path2string,c.abs=Ab(d),d},Db=function(a,b,c,d){return[a,b,c,d,c,d]},Eb=function(a,b,c,d,e,f){var g=1/3,h=2/3;return[g*a+h*c,g*b+h*d,g*e+h*c,g*f+h*d,e,f]},Fb=function(a,b,c,e,f,g,h,i,j,k){var l,m=120*Q/180,n=Q/180*(+f||0),o=[],p=d(function(a,b,c){var d=a*L.cos(c)-b*L.sin(c),e=a*L.sin(c)+b*L.cos(c);return{x:d,y:e}});if(k)y=k[0],z=k[1],w=k[2],x=k[3];else{l=p(a,b,-n),a=l.x,b=l.y,l=p(i,j,-n),i=l.x,j=l.y;var q=(L.cos(Q/180*f),L.sin(Q/180*f),(a-i)/2),r=(b-j)/2,s=q*q/(c*c)+r*r/(e*e);s>1&&(s=L.sqrt(s),c=s*c,e=s*e);var t=c*c,u=e*e,v=(g==h?-1:1)*L.sqrt(O((t*u-t*r*r-u*q*q)/(t*r*r+u*q*q))),w=v*c*r/e+(a+i)/2,x=v*-e*q/c+(b+j)/2,y=L.asin(((b-x)/e).toFixed(9)),z=L.asin(((j-x)/e).toFixed(9));y=w>a?Q-y:y,z=w>i?Q-z:z,0>y&&(y=2*Q+y),0>z&&(z=2*Q+z),h&&y>z&&(y-=2*Q),!h&&z>y&&(z-=2*Q)}var A=z-y;if(O(A)>m){var B=z,D=i,E=j;z=y+m*(h&&z>y?1:-1),i=w+c*L.cos(z),j=x+e*L.sin(z),o=Fb(i,j,c,e,f,0,h,D,E,[z,B,w,x])}A=z-y;var F=L.cos(y),G=L.sin(y),I=L.cos(z),J=L.sin(z),K=L.tan(A/4),M=4/3*c*K,N=4/3*e*K,P=[a,b],R=[a+M*G,b-N*F],S=[i+M*J,j-N*I],T=[i,j];if(R[0]=2*P[0]-R[0],R[1]=2*P[1]-R[1],k)return[R,S,T][C](o);o=[R,S,T][C](o).join()[H](",");for(var U=[],V=0,W=o.length;W>V;V++)U[V]=V%2?p(o[V-1],o[V],n).y:p(o[V],o[V+1],n).x;return U},Gb=function(a,b,c,d,e,f,g,h,i){var j=1-i;return{x:P(j,3)*a+3*P(j,2)*i*c+3*j*i*i*e+P(i,3)*g,y:P(j,3)*b+3*P(j,2)*i*d+3*j*i*i*f+P(i,3)*h}},Hb=d(function(a,b,c,d,e,f,g,h){var i,j=e-2*c+a-(g-2*e+c),k=2*(c-a)-2*(e-c),l=a-c,m=(-k+L.sqrt(k*k-4*j*l))/2/j,n=(-k-L.sqrt(k*k-4*j*l))/2/j,o=[b,h],p=[a,g];return O(m)>"1e12"&&(m=.5),O(n)>"1e12"&&(n=.5),m>0&&1>m&&(i=Gb(a,b,c,d,e,f,g,h,m),p.push(i.x),o.push(i.y)),n>0&&1>n&&(i=Gb(a,b,c,d,e,f,g,h,n),p.push(i.x),o.push(i.y)),j=f-2*d+b-(h-2*f+d),k=2*(d-b)-2*(f-d),l=b-d,m=(-k+L.sqrt(k*k-4*j*l))/2/j,n=(-k-L.sqrt(k*k-4*j*l))/2/j,O(m)>"1e12"&&(m=.5),O(n)>"1e12"&&(n=.5),m>0&&1>m&&(i=Gb(a,b,c,d,e,f,g,h,m),p.push(i.x),o.push(i.y)),n>0&&1>n&&(i=Gb(a,b,c,d,e,f,g,h,n),p.push(i.x),o.push(i.y)),{min:{x:N[B](0,p),y:N[B](0,o)},max:{x:M[B](0,p),y:M[B](0,o)}}}),Ib=a._path2curve=d(function(a,b){var c=!b&&yb(a);if(!b&&c.curve)return Ab(c.curve);for(var d=Cb(a),e=b&&Cb(b),f={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},g={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},h=(function(a,b){var c,d;if(!a)return["C",b.x,b.y,b.x,b.y,b.x,b.y];switch(!(a[0]in{T:1,Q:1})&&(b.qx=b.qy=null),a[0]){case"M":b.X=a[1],b.Y=a[2];break;case"A":a=["C"][C](Fb[B](0,[b.x,b.y][C](a.slice(1))));break;case"S":c=b.x+(b.x-(b.bx||b.x)),d=b.y+(b.y-(b.by||b.y)),a=["C",c,d][C](a.slice(1));break;case"T":b.qx=b.x+(b.x-(b.qx||b.x)),b.qy=b.y+(b.y-(b.qy||b.y)),a=["C"][C](Eb(b.x,b.y,b.qx,b.qy,a[1],a[2]));break;case"Q":b.qx=a[1],b.qy=a[2],a=["C"][C](Eb(b.x,b.y,a[1],a[2],a[3],a[4]));break;case"L":a=["C"][C](Db(b.x,b.y,a[1],a[2]));break;case"H":a=["C"][C](Db(b.x,b.y,a[1],b.y));break;case"V":a=["C"][C](Db(b.x,b.y,b.x,a[1]));break;case"Z":a=["C"][C](Db(b.x,b.y,b.X,b.Y))}return a}),i=function(a,b){if(a[b].length>7){a[b].shift();for(var c=a[b];c.length;)a.splice(b++,0,["C"][C](c.splice(0,6)));a.splice(b,1),l=M(d.length,e&&e.length||0)}},j=function(a,b,c,f,g){a&&b&&"M"==a[g][0]&&"M"!=b[g][0]&&(b.splice(g,0,["M",f.x,f.y]),c.bx=0,c.by=0,c.x=a[g][1],c.y=a[g][2],l=M(d.length,e&&e.length||0))},k=0,l=M(d.length,e&&e.length||0);l>k;k++){d[k]=h(d[k],f),i(d,k),e&&(e[k]=h(e[k],g)),e&&i(e,k),j(d,e,f,g,k),j(e,d,g,f,k);var m=d[k],n=e&&e[k],o=m.length,p=e&&n.length;f.x=m[o-2],f.y=m[o-1],f.bx=Z(m[o-4])||f.x,f.by=Z(m[o-3])||f.y,g.bx=e&&(Z(n[p-4])||g.x),g.by=e&&(Z(n[p-3])||g.y),g.x=e&&n[p-2],g.y=e&&n[p-1]}return e||(c.curve=Ab(d)),e?[d,e]:d},null,Ab),Jb=(a._parseDots=d(function(b){for(var c=[],d=0,e=b.length;e>d;d++){var f={},g=b[d].match(/^([^:]*):?([\d\.]*)/);if(f.color=a.getRGB(g[1]),f.color.error)return null;f.color=f.color.hex,g[2]&&(f.offset=g[2]+"%"),c.push(f)}for(d=1,e=c.length-1;e>d;d++)if(!c[d].offset){for(var h=Z(c[d-1].offset||0),i=0,j=d+1;e>j;j++)if(c[j].offset){i=c[j].offset;break}i||(i=100,j=e),i=Z(i);for(var k=(i-h)/(j-d+1);j>d;d++)h+=k,c[d].offset=h+"%"}return c}),a._tear=function(a,b){a==b.top&&(b.top=a.prev),a==b.bottom&&(b.bottom=a.next),a.next&&(a.next.prev=a.prev),a.prev&&(a.prev.next=a.next)}),Kb=(a._tofront=function(a,b){b.top!==a&&(Jb(a,b),a.next=null,a.prev=b.top,b.top.next=a,b.top=a)},a._toback=function(a,b){b.bottom!==a&&(Jb(a,b),a.next=b.bottom,a.prev=null,b.bottom.prev=a,b.bottom=a)},a._insertafter=function(a,b,c){Jb(a,c),b==c.top&&(c.top=a),b.next&&(b.next.prev=a),a.next=b.next,a.prev=b,b.next=a},a._insertbefore=function(a,b,c){Jb(a,c),b==c.bottom&&(c.bottom=a),b.prev&&(b.prev.next=a),a.prev=b.prev,b.prev=a,a.next=b},a.toMatrix=function(a,b){var c=zb(a),d={_:{transform:E},getBBox:function(){return c}};return Lb(d,b),d.matrix}),Lb=(a.transformPath=function(a,b){return pb(a,Kb(a,b))},a._extractTransform=function(b,c){if(null==c)return b._.transform;c=G(c).replace(/\.{3}|\u2026/g,b._.transform||E);var d=a.parseTransformString(c),e=0,f=0,g=0,h=1,i=1,j=b._,k=new m;if(j.transform=d||[],d)for(var l=0,n=d.length;n>l;l++){var o,p,q,r,s,t=d[l],u=t.length,v=G(t[0]).toLowerCase(),w=t[0]!=v,x=w?k.invert():0;"t"==v&&3==u?w?(o=x.x(0,0),p=x.y(0,0),q=x.x(t[1],t[2]),r=x.y(t[1],t[2]),k.translate(q-o,r-p)):k.translate(t[1],t[2]):"r"==v?2==u?(s=s||b.getBBox(1),k.rotate(t[1],s.x+s.width/2,s.y+s.height/2),e+=t[1]):4==u&&(w?(q=x.x(t[2],t[3]),r=x.y(t[2],t[3]),k.rotate(t[1],q,r)):k.rotate(t[1],t[2],t[3]),e+=t[1]):"s"==v?2==u||3==u?(s=s||b.getBBox(1),k.scale(t[1],t[u-1],s.x+s.width/2,s.y+s.height/2),h*=t[1],i*=t[u-1]):5==u&&(w?(q=x.x(t[3],t[4]),r=x.y(t[3],t[4]),k.scale(t[1],t[2],q,r)):k.scale(t[1],t[2],t[3],t[4]),h*=t[1],i*=t[2]):"m"==v&&7==u&&k.add(t[1],t[2],t[3],t[4],t[5],t[6]),j.dirtyT=1,b.matrix=k}b.matrix=k,j.sx=h,j.sy=i,j.deg=e,j.dx=f=k.e,j.dy=g=k.f,1==h&&1==i&&!e&&j.bbox?(j.bbox.x+=+f,j.bbox.y+=+g):j.dirtyT=1}),Mb=function(a){var b=a[0];switch(b.toLowerCase()){case"t":return[b,0,0];case"m":return[b,1,0,0,1,0,0];case"r":return 4==a.length?[b,0,a[2],a[3]]:[b,0];case"s":return 5==a.length?[b,1,1,a[3],a[4]]:3==a.length?[b,1,1]:[b,1]}},Nb=a._equaliseTransform=function(b,c){c=G(c).replace(/\.{3}|\u2026/g,b),b=a.parseTransformString(b)||[],c=a.parseTransformString(c)||[];for(var d,e,f,g,h=M(b.length,c.length),i=[],j=[],k=0;h>k;k++){if(f=b[k]||Mb(c[k]),g=c[k]||Mb(f),f[0]!=g[0]||"r"==f[0].toLowerCase()&&(f[2]!=g[2]||f[3]!=g[3])||"s"==f[0].toLowerCase()&&(f[3]!=g[3]||f[4]!=g[4]))return;for(i[k]=[],j[k]=[],d=0,e=M(f.length,g.length);e>d;d++)d in f&&(i[k][d]=f[d]),d in g&&(j[k][d]=g[d])}return{from:i,to:j}};a._getContainer=function(b,c,d,e){var f;return f=null!=e||a.is(b,"object")?b:y.doc.getElementById(b),null!=f?f.tagName?null==c?{container:f,width:f.style.pixelWidth||f.offsetWidth,height:f.style.pixelHeight||f.offsetHeight}:{container:f,width:c,height:d}:{container:1,x:b,y:c,width:d,height:e}:void 0},a.pathToRelative=Bb,a._engine={},a.path2curve=Ib,a.matrix=function(a,b,c,d,e,f){return new m(a,b,c,d,e,f)},function(b){function c(a){return a[0]*a[0]+a[1]*a[1]}function d(a){var b=L.sqrt(c(a));a[0]&&(a[0]/=b),a[1]&&(a[1]/=b)}b.add=function(a,b,c,d,e,f){var g,h,i,j,k=[[],[],[]],l=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1]],n=[[a,c,e],[b,d,f],[0,0,1]];for(a&&a instanceof m&&(n=[[a.a,a.c,a.e],[a.b,a.d,a.f],[0,0,1]]),g=0;3>g;g++)for(h=0;3>h;h++){for(j=0,i=0;3>i;i++)j+=l[g][i]*n[i][h];k[g][h]=j}this.a=k[0][0],this.b=k[1][0],this.c=k[0][1],this.d=k[1][1],this.e=k[0][2],this.f=k[1][2]},b.invert=function(){var a=this,b=a.a*a.d-a.b*a.c;return new m(a.d/b,-a.b/b,-a.c/b,a.a/b,(a.c*a.f-a.d*a.e)/b,(a.b*a.e-a.a*a.f)/b)},b.clone=function(){return new m(this.a,this.b,this.c,this.d,this.e,this.f)},b.translate=function(a,b){this.add(1,0,0,1,a,b)},b.scale=function(a,b,c,d){null==b&&(b=a),(c||d)&&this.add(1,0,0,1,c,d),this.add(a,0,0,b,0,0),(c||d)&&this.add(1,0,0,1,-c,-d)},b.rotate=function(b,c,d){b=a.rad(b),c=c||0,d=d||0;var e=+L.cos(b).toFixed(9),f=+L.sin(b).toFixed(9);this.add(e,f,-f,e,c,d),this.add(1,0,0,1,-c,-d)},b.x=function(a,b){return a*this.a+b*this.c+this.e},b.y=function(a,b){return a*this.b+b*this.d+this.f},b.get=function(a){return+this[G.fromCharCode(97+a)].toFixed(4)},b.toString=function(){return a.svg?"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")":[this.get(0),this.get(2),this.get(1),this.get(3),0,0].join()},b.toFilter=function(){return"progid:DXImageTransform.Microsoft.Matrix(M11="+this.get(0)+", M12="+this.get(2)+", M21="+this.get(1)+", M22="+this.get(3)+", Dx="+this.get(4)+", Dy="+this.get(5)+", sizingmethod='auto expand')"},b.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]},b.split=function(){var b={};b.dx=this.e,b.dy=this.f;var e=[[this.a,this.c],[this.b,this.d]];b.scalex=L.sqrt(c(e[0])),d(e[0]),b.shear=e[0][0]*e[1][0]+e[0][1]*e[1][1],e[1]=[e[1][0]-e[0][0]*b.shear,e[1][1]-e[0][1]*b.shear],b.scaley=L.sqrt(c(e[1])),d(e[1]),b.shear/=b.scaley;var f=-e[0][1],g=e[1][1];return 0>g?(b.rotate=a.deg(L.acos(g)),0>f&&(b.rotate=360-b.rotate)):b.rotate=a.deg(L.asin(f)),b.isSimple=!(+b.shear.toFixed(9)||b.scalex.toFixed(9)!=b.scaley.toFixed(9)&&b.rotate),b.isSuperSimple=!+b.shear.toFixed(9)&&b.scalex.toFixed(9)==b.scaley.toFixed(9)&&!b.rotate,b.noRotation=!+b.shear.toFixed(9)&&!b.rotate,b},b.toTransformString=function(a){var b=a||this[H]();return b.isSimple?(b.scalex=+b.scalex.toFixed(4),b.scaley=+b.scaley.toFixed(4),b.rotate=+b.rotate.toFixed(4),(b.dx||b.dy?"t"+[b.dx,b.dy]:E)+(1!=b.scalex||1!=b.scaley?"s"+[b.scalex,b.scaley,0,0]:E)+(b.rotate?"r"+[b.rotate,0,0]:E)):"m"+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)]
}}(m.prototype);var Ob=navigator.userAgent.match(/Version\/(.*?)\s/)||navigator.userAgent.match(/Chrome\/(\d+)/);t.safari="Apple Computer, Inc."==navigator.vendor&&(Ob&&Ob[1]<4||"iP"==navigator.platform.slice(0,2))||"Google Inc."==navigator.vendor&&Ob&&Ob[1]<8?function(){var a=this.rect(-99,-99,this.width+99,this.height+99).attr({stroke:"none"});setTimeout(function(){a.remove()})}:kb;for(var Pb=function(){this.returnValue=!1},Qb=function(){return this.originalEvent.preventDefault()},Rb=function(){this.cancelBubble=!0},Sb=function(){return this.originalEvent.stopPropagation()},Tb=function(){return y.doc.addEventListener?function(a,b,c,d){var e=D&&J[b]?J[b]:b,f=function(e){var f=y.doc.documentElement.scrollTop||y.doc.body.scrollTop,g=y.doc.documentElement.scrollLeft||y.doc.body.scrollLeft,h=e.clientX+g,i=e.clientY+f;if(D&&J[x](b))for(var j=0,k=e.targetTouches&&e.targetTouches.length;k>j;j++)if(e.targetTouches[j].target==a){var l=e;e=e.targetTouches[j],e.originalEvent=l,e.preventDefault=Qb,e.stopPropagation=Sb;break}return c.call(d,e,h,i)};return a.addEventListener(e,f,!1),function(){return a.removeEventListener(e,f,!1),!0}}:y.doc.attachEvent?function(a,b,c,d){var e=function(a){a=a||y.win.event;var b=y.doc.documentElement.scrollTop||y.doc.body.scrollTop,e=y.doc.documentElement.scrollLeft||y.doc.body.scrollLeft,f=a.clientX+e,g=a.clientY+b;return a.preventDefault=a.preventDefault||Pb,a.stopPropagation=a.stopPropagation||Rb,c.call(d,a,f,g)};a.attachEvent("on"+b,e);var f=function(){return a.detachEvent("on"+b,e),!0};return f}:void 0}(),Ub=[],Vb=function(a){for(var b,c=a.clientX,d=a.clientY,e=y.doc.documentElement.scrollTop||y.doc.body.scrollTop,f=y.doc.documentElement.scrollLeft||y.doc.body.scrollLeft,g=Ub.length;g--;){if(b=Ub[g],D){for(var h,i=a.touches.length;i--;)if(h=a.touches[i],h.identifier==b.el._drag.id){c=h.clientX,d=h.clientY,(a.originalEvent?a.originalEvent:a).preventDefault();break}}else a.preventDefault();var j,k=b.el.node,l=k.nextSibling,m=k.parentNode,n=k.style.display;y.win.opera&&m.removeChild(k),k.style.display="none",j=b.el.paper.getElementByPoint(c,d),k.style.display=n,y.win.opera&&(l?m.insertBefore(k,l):m.appendChild(k)),j&&eve("raphael.drag.over."+b.el.id,b.el,j),c+=f,d+=e,eve("raphael.drag.move."+b.el.id,b.move_scope||b.el,c-b.el._drag.x,d-b.el._drag.y,c,d,a)}},Wb=function(b){a.unmousemove(Vb).unmouseup(Wb);for(var c,d=Ub.length;d--;)c=Ub[d],c.el._drag={},eve("raphael.drag.end."+c.el.id,c.end_scope||c.start_scope||c.move_scope||c.el,b);Ub=[]},Xb=a.el={},Yb=I.length;Yb--;)!function(b){a[b]=Xb[b]=function(c,d){return a.is(c,"function")&&(this.events=this.events||[],this.events.push({name:b,f:c,unbind:Tb(this.shape||this.node||y.doc,b,c,d||this)})),this},a["un"+b]=Xb["un"+b]=function(a){for(var c=this.events||[],d=c.length;d--;)if(c[d].name==b&&c[d].f==a)return c[d].unbind(),c.splice(d,1),!c.length&&delete this.events,this;return this}}(I[Yb]);Xb.data=function(b,c){var d=ib[this.id]=ib[this.id]||{};if(1==arguments.length){if(a.is(b,"object")){for(var e in b)b[x](e)&&this.data(e,b[e]);return this}return eve("raphael.data.get."+this.id,this,d[b],b),d[b]}return d[b]=c,eve("raphael.data.set."+this.id,this,c,b),this},Xb.removeData=function(a){return null==a?ib[this.id]={}:ib[this.id]&&delete ib[this.id][a],this},Xb.hover=function(a,b,c,d){return this.mouseover(a,c).mouseout(b,d||c)},Xb.unhover=function(a,b){return this.unmouseover(a).unmouseout(b)};var Zb=[];Xb.drag=function(b,c,d,e,f,g){function h(h){(h.originalEvent||h).preventDefault();var i=y.doc.documentElement.scrollTop||y.doc.body.scrollTop,j=y.doc.documentElement.scrollLeft||y.doc.body.scrollLeft;this._drag.x=h.clientX+j,this._drag.y=h.clientY+i,this._drag.id=h.identifier,!Ub.length&&a.mousemove(Vb).mouseup(Wb),Ub.push({el:this,move_scope:e,start_scope:f,end_scope:g}),c&&eve.on("raphael.drag.start."+this.id,c),b&&eve.on("raphael.drag.move."+this.id,b),d&&eve.on("raphael.drag.end."+this.id,d),eve("raphael.drag.start."+this.id,f||e||this,h.clientX+j,h.clientY+i,h)}return this._drag={},Zb.push({el:this,start:h}),this.mousedown(h),this},Xb.onDragOver=function(a){a?eve.on("raphael.drag.over."+this.id,a):eve.unbind("raphael.drag.over."+this.id)},Xb.undrag=function(){for(var b=Zb.length;b--;)Zb[b].el==this&&(this.unmousedown(Zb[b].start),Zb.splice(b,1),eve.unbind("raphael.drag.*."+this.id));!Zb.length&&a.unmousemove(Vb).unmouseup(Wb)},t.circle=function(b,c,d){var e=a._engine.circle(this,b||0,c||0,d||0);return this.__set__&&this.__set__.push(e),e},t.rect=function(b,c,d,e,f){var g=a._engine.rect(this,b||0,c||0,d||0,e||0,f||0);return this.__set__&&this.__set__.push(g),g},t.ellipse=function(b,c,d,e){var f=a._engine.ellipse(this,b||0,c||0,d||0,e||0);return this.__set__&&this.__set__.push(f),f},t.path=function(b){b&&!a.is(b,S)&&!a.is(b[0],T)&&(b+=E);var c=a._engine.path(a.format[B](a,arguments),this);return this.__set__&&this.__set__.push(c),c},t.image=function(b,c,d,e,f){var g=a._engine.image(this,b||"about:blank",c||0,d||0,e||0,f||0);return this.__set__&&this.__set__.push(g),g},t.text=function(b,c,d){var e=a._engine.text(this,b||0,c||0,G(d));return this.__set__&&this.__set__.push(e),e},t.set=function(b){!a.is(b,"array")&&(b=Array.prototype.splice.call(arguments,0,arguments.length));var c=new jc(b);return this.__set__&&this.__set__.push(c),c},t.setStart=function(a){this.__set__=a||this.set()},t.setFinish=function(){var a=this.__set__;return delete this.__set__,a},t.setSize=function(b,c){return a._engine.setSize.call(this,b,c)},t.setViewBox=function(b,c,d,e,f){return a._engine.setViewBox.call(this,b,c,d,e,f)},t.top=t.bottom=null,t.raphael=a;var $b=function(a){var b=a.getBoundingClientRect(),c=a.ownerDocument,d=c.body,e=c.documentElement,f=e.clientTop||d.clientTop||0,g=e.clientLeft||d.clientLeft||0,h=b.top+(y.win.pageYOffset||e.scrollTop||d.scrollTop)-f,i=b.left+(y.win.pageXOffset||e.scrollLeft||d.scrollLeft)-g;return{y:h,x:i}};t.getElementByPoint=function(a,b){var c=this,d=c.canvas,e=y.doc.elementFromPoint(a,b);if(y.win.opera&&"svg"==e.tagName){var f=$b(d),g=d.createSVGRect();g.x=a-f.x,g.y=b-f.y,g.width=g.height=1;var h=d.getIntersectionList(g,null);h.length&&(e=h[h.length-1])}if(!e)return null;for(;e.parentNode&&e!=d.parentNode&&!e.raphael;)e=e.parentNode;return e==c.canvas.parentNode&&(e=d),e=e&&e.raphael?c.getById(e.raphaelid):null},t.getById=function(a){for(var b=this.bottom;b;){if(b.id==a)return b;b=b.next}return null},t.forEach=function(a,b){for(var c=this.bottom;c;){if(a.call(b,c)===!1)return this;c=c.next}return this},t.getElementsByPoint=function(a,b){var c=this.set();return this.forEach(function(d){d.isPointInside(a,b)&&c.push(d)}),c},Xb.isPointInside=function(b,c){var d=this.realPath=this.realPath||ob[this.type](this);return a.isPointInsidePath(d,b,c)},Xb.getBBox=function(a){if(this.removed)return{};var b=this._;return a?((b.dirty||!b.bboxwt)&&(this.realPath=ob[this.type](this),b.bboxwt=zb(this.realPath),b.bboxwt.toString=n,b.dirty=0),b.bboxwt):((b.dirty||b.dirtyT||!b.bbox)&&((b.dirty||!this.realPath)&&(b.bboxwt=0,this.realPath=ob[this.type](this)),b.bbox=zb(pb(this.realPath,this.matrix)),b.bbox.toString=n,b.dirty=b.dirtyT=0),b.bbox)},Xb.clone=function(){if(this.removed)return null;var a=this.paper[this.type]().attr(this.attr());return this.__set__&&this.__set__.push(a),a},Xb.glow=function(a){if("text"==this.type)return null;a=a||{};var b={width:(a.width||10)+(+this.attr("stroke-width")||1),fill:a.fill||!1,opacity:a.opacity||.5,offsetx:a.offsetx||0,offsety:a.offsety||0,color:a.color||"#000"},c=b.width/2,d=this.paper,e=d.set(),f=this.realPath||ob[this.type](this);f=this.matrix?pb(f,this.matrix):f;for(var g=1;c+1>g;g++)e.push(d.path(f).attr({stroke:b.color,fill:b.fill?b.color:"none","stroke-linejoin":"round","stroke-linecap":"round","stroke-width":+(b.width/c*g).toFixed(3),opacity:+(b.opacity/c).toFixed(3)}));return e.insertBefore(this).translate(b.offsetx,b.offsety)};var _b=function(b,c,d,e,f,g,j,k,l){return null==l?h(b,c,d,e,f,g,j,k):a.findDotsAtSegment(b,c,d,e,f,g,j,k,i(b,c,d,e,f,g,j,k,l))},ac=function(b,c){return function(d,e,f){d=Ib(d);for(var g,h,i,j,k,l="",m={},n=0,o=0,p=d.length;p>o;o++){if(i=d[o],"M"==i[0])g=+i[1],h=+i[2];else{if(j=_b(g,h,i[1],i[2],i[3],i[4],i[5],i[6]),n+j>e){if(c&&!m.start){if(k=_b(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n),l+=["C"+k.start.x,k.start.y,k.m.x,k.m.y,k.x,k.y],f)return l;m.start=l,l=["M"+k.x,k.y+"C"+k.n.x,k.n.y,k.end.x,k.end.y,i[5],i[6]].join(),n+=j,g=+i[5],h=+i[6];continue}if(!b&&!c)return k=_b(g,h,i[1],i[2],i[3],i[4],i[5],i[6],e-n),{x:k.x,y:k.y,alpha:k.alpha}}n+=j,g=+i[5],h=+i[6]}l+=i.shift()+i}return m.end=l,k=b?n:c?m:a.findDotsAtSegment(g,h,i[0],i[1],i[2],i[3],i[4],i[5],1),k.alpha&&(k={x:k.x,y:k.y,alpha:k.alpha}),k}},bc=ac(1),cc=ac(),dc=ac(0,1);a.getTotalLength=bc,a.getPointAtLength=cc,a.getSubpath=function(a,b,c){if(this.getTotalLength(a)-c<1e-6)return dc(a,b).end;var d=dc(a,c,1);return b?dc(d,b).end:d},Xb.getTotalLength=function(){return"path"==this.type?this.node.getTotalLength?this.node.getTotalLength():bc(this.attrs.path):void 0},Xb.getPointAtLength=function(a){return"path"==this.type?cc(this.attrs.path,a):void 0},Xb.getSubpath=function(b,c){return"path"==this.type?a.getSubpath(this.attrs.path,b,c):void 0};var ec=a.easing_formulas={linear:function(a){return a},"<":function(a){return P(a,1.7)},">":function(a){return P(a,.48)},"<>":function(a){var b=.48-a/1.04,c=L.sqrt(.1734+b*b),d=c-b,e=P(O(d),1/3)*(0>d?-1:1),f=-c-b,g=P(O(f),1/3)*(0>f?-1:1),h=e+g+.5;return 3*(1-h)*h*h+h*h*h},backIn:function(a){var b=1.70158;return a*a*((b+1)*a-b)},backOut:function(a){a-=1;var b=1.70158;return a*a*((b+1)*a+b)+1},elastic:function(a){return a==!!a?a:P(2,-10*a)*L.sin(2*(a-.075)*Q/.3)+1},bounce:function(a){var b,c=7.5625,d=2.75;return 1/d>a?b=c*a*a:2/d>a?(a-=1.5/d,b=c*a*a+.75):2.5/d>a?(a-=2.25/d,b=c*a*a+.9375):(a-=2.625/d,b=c*a*a+.984375),b}};ec.easeIn=ec["ease-in"]=ec["<"],ec.easeOut=ec["ease-out"]=ec[">"],ec.easeInOut=ec["ease-in-out"]=ec["<>"],ec["back-in"]=ec.backIn,ec["back-out"]=ec.backOut;var fc=[],gc=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){setTimeout(a,16)},hc=function(){for(var b=+new Date,c=0;c<fc.length;c++){var d=fc[c];if(!d.el.removed&&!d.paused){var e,f,g=b-d.start,h=d.ms,i=d.easing,j=d.from,k=d.diff,l=d.to,m=(d.t,d.el),n={},o={};if(d.initstatus?(g=(d.initstatus*d.anim.top-d.prev)/(d.percent-d.prev)*h,d.status=d.initstatus,delete d.initstatus,d.stop&&fc.splice(c--,1)):d.status=(d.prev+(d.percent-d.prev)*(g/h))/d.anim.top,!(0>g))if(h>g){var p=i(g/h);for(var r in j)if(j[x](r)){switch(bb[r]){case R:e=+j[r]+p*h*k[r];break;case"colour":e="rgb("+[ic(Y(j[r].r+p*h*k[r].r)),ic(Y(j[r].g+p*h*k[r].g)),ic(Y(j[r].b+p*h*k[r].b))].join(",")+")";break;case"path":e=[];for(var s=0,t=j[r].length;t>s;s++){e[s]=[j[r][s][0]];for(var u=1,v=j[r][s].length;v>u;u++)e[s][u]=+j[r][s][u]+p*h*k[r][s][u];e[s]=e[s].join(F)}e=e.join(F);break;case"transform":if(k[r].real)for(e=[],s=0,t=j[r].length;t>s;s++)for(e[s]=[j[r][s][0]],u=1,v=j[r][s].length;v>u;u++)e[s][u]=j[r][s][u]+p*h*k[r][s][u];else{var w=function(a){return+j[r][a]+p*h*k[r][a]};e=[["m",w(0),w(1),w(2),w(3),w(4),w(5)]]}break;case"csv":if("clip-rect"==r)for(e=[],s=4;s--;)e[s]=+j[r][s]+p*h*k[r][s];break;default:var y=[][C](j[r]);for(e=[],s=m.paper.customAttributes[r].length;s--;)e[s]=+y[s]+p*h*k[r][s]}n[r]=e}m.attr(n),function(a,b,c){setTimeout(function(){eve("raphael.anim.frame."+a,b,c)})}(m.id,m,d.anim)}else{if(function(b,c,d){setTimeout(function(){eve("raphael.anim.frame."+c.id,c,d),eve("raphael.anim.finish."+c.id,c,d),a.is(b,"function")&&b.call(c)})}(d.callback,m,d.anim),m.attr(l),fc.splice(c--,1),d.repeat>1&&!d.next){for(f in l)l[x](f)&&(o[f]=d.totalOrigin[f]);d.el.attr(o),q(d.anim,d.el,d.anim.percents[0],null,d.totalOrigin,d.repeat-1)}d.next&&!d.stop&&q(d.anim,d.el,d.next,null,d.totalOrigin,d.repeat)}}}a.svg&&m&&m.paper&&m.paper.safari(),fc.length&&gc(hc)},ic=function(a){return a>255?255:0>a?0:a};Xb.animateWith=function(b,c,d,e,f,g){var h=this;if(h.removed)return g&&g.call(h),h;var i=d instanceof p?d:a.animation(d,e,f,g);q(i,h,i.percents[0],null,h.attr());for(var j=0,k=fc.length;k>j;j++)if(fc[j].anim==c&&fc[j].el==b){fc[k-1].start=fc[j].start;break}return h},Xb.onAnimation=function(a){return a?eve.on("raphael.anim.frame."+this.id,a):eve.unbind("raphael.anim.frame."+this.id),this},p.prototype.delay=function(a){var b=new p(this.anim,this.ms);return b.times=this.times,b.del=+a||0,b},p.prototype.repeat=function(a){var b=new p(this.anim,this.ms);return b.del=this.del,b.times=L.floor(M(a,0))||1,b},a.animation=function(b,c,d,e){if(b instanceof p)return b;(a.is(d,"function")||!d)&&(e=e||d||null,d=null),b=Object(b),c=+c||0;var f,g,h={};for(g in b)b[x](g)&&Z(g)!=g&&Z(g)+"%"!=g&&(f=!0,h[g]=b[g]);return f?(d&&(h.easing=d),e&&(h.callback=e),new p({100:h},c)):new p(b,c)},Xb.animate=function(b,c,d,e){var f=this;if(f.removed)return e&&e.call(f),f;var g=b instanceof p?b:a.animation(b,c,d,e);return q(g,f,g.percents[0],null,f.attr()),f},Xb.setTime=function(a,b){return a&&null!=b&&this.status(a,N(b,a.ms)/a.ms),this},Xb.status=function(a,b){var c,d,e=[],f=0;if(null!=b)return q(a,this,-1,N(b,1)),this;for(c=fc.length;c>f;f++)if(d=fc[f],d.el.id==this.id&&(!a||d.anim==a)){if(a)return d.status;e.push({anim:d.anim,status:d.status})}return a?0:e},Xb.pause=function(a){for(var b=0;b<fc.length;b++)fc[b].el.id!=this.id||a&&fc[b].anim!=a||eve("raphael.anim.pause."+this.id,this,fc[b].anim)!==!1&&(fc[b].paused=!0);return this},Xb.resume=function(a){for(var b=0;b<fc.length;b++)if(fc[b].el.id==this.id&&(!a||fc[b].anim==a)){var c=fc[b];eve("raphael.anim.resume."+this.id,this,c.anim)!==!1&&(delete c.paused,this.status(c.anim,c.status))}return this},Xb.stop=function(a){for(var b=0;b<fc.length;b++)fc[b].el.id!=this.id||a&&fc[b].anim!=a||eve("raphael.anim.stop."+this.id,this,fc[b].anim)!==!1&&fc.splice(b--,1);return this},eve.on("raphael.remove",r),eve.on("raphael.clear",r),Xb.toString=function(){return"Raphaël’s object"};var jc=function(a){if(this.items=[],this.length=0,this.type="set",a)for(var b=0,c=a.length;c>b;b++)!a[b]||a[b].constructor!=Xb.constructor&&a[b].constructor!=jc||(this[this.items.length]=this.items[this.items.length]=a[b],this.length++)},kc=jc.prototype;kc.push=function(){for(var a,b,c=0,d=arguments.length;d>c;c++)a=arguments[c],!a||a.constructor!=Xb.constructor&&a.constructor!=jc||(b=this.items.length,this[b]=this.items[b]=a,this.length++);return this},kc.pop=function(){return this.length&&delete this[this.length--],this.items.pop()},kc.forEach=function(a,b){for(var c=0,d=this.items.length;d>c;c++)if(a.call(b,this.items[c],c)===!1)return this;return this};for(var lc in Xb)Xb[x](lc)&&(kc[lc]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a][B](c,b)})}}(lc));kc.attr=function(b,c){if(b&&a.is(b,T)&&a.is(b[0],"object"))for(var d=0,e=b.length;e>d;d++)this.items[d].attr(b[d]);else for(var f=0,g=this.items.length;g>f;f++)this.items[f].attr(b,c);return this},kc.clear=function(){for(;this.length;)this.pop()},kc.splice=function(a,b){a=0>a?M(this.length+a,0):a,b=M(0,N(this.length-a,b));var c,d=[],e=[],f=[];for(c=2;c<arguments.length;c++)f.push(arguments[c]);for(c=0;b>c;c++)e.push(this[a+c]);for(;c<this.length-a;c++)d.push(this[a+c]);var g=f.length;for(c=0;c<g+d.length;c++)this.items[a+c]=this[a+c]=g>c?f[c]:d[c-g];for(c=this.items.length=this.length-=b-g;this[c];)delete this[c++];return new jc(e)},kc.exclude=function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]==a)return this.splice(b,1),!0},kc.animate=function(b,c,d,e){(a.is(d,"function")||!d)&&(e=d||null);var f,g,h=this.items.length,i=h,j=this;if(!h)return this;e&&(g=function(){!--h&&e.call(j)}),d=a.is(d,S)?d:g;var k=a.animation(b,c,d,g);for(f=this.items[--i].animate(k);i--;)this.items[i]&&!this.items[i].removed&&this.items[i].animateWith(f,k,k);return this},kc.insertAfter=function(a){for(var b=this.items.length;b--;)this.items[b].insertAfter(a);return this},kc.getBBox=function(){for(var a=[],b=[],c=[],d=[],e=this.items.length;e--;)if(!this.items[e].removed){var f=this.items[e].getBBox();a.push(f.x),b.push(f.y),c.push(f.x+f.width),d.push(f.y+f.height)}return a=N[B](0,a),b=N[B](0,b),c=M[B](0,c),d=M[B](0,d),{x:a,y:b,x2:c,y2:d,width:c-a,height:d-b}},kc.clone=function(a){a=new jc;for(var b=0,c=this.items.length;c>b;b++)a.push(this.items[b].clone());return a},kc.toString=function(){return"Raphaël‘s set"},a.registerFont=function(a){if(!a.face)return a;this.fonts=this.fonts||{};var b={w:a.w,face:{},glyphs:{}},c=a.face["font-family"];for(var d in a.face)a.face[x](d)&&(b.face[d]=a.face[d]);if(this.fonts[c]?this.fonts[c].push(b):this.fonts[c]=[b],!a.svg){b.face["units-per-em"]=$(a.face["units-per-em"],10);for(var e in a.glyphs)if(a.glyphs[x](e)){var f=a.glyphs[e];if(b.glyphs[e]={w:f.w,k:{},d:f.d&&"M"+f.d.replace(/[mlcxtrv]/g,function(a){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[a]||"M"})+"z"},f.k)for(var g in f.k)f[x](g)&&(b.glyphs[e].k[g]=f.k[g])}}return a},t.getFont=function(b,c,d,e){if(e=e||"normal",d=d||"normal",c=+c||{normal:400,bold:700,lighter:300,bolder:800}[c]||400,a.fonts){var f=a.fonts[b];if(!f){var g=new RegExp("(^|\\s)"+b.replace(/[^\w\d\s+!~.:_-]/g,E)+"(\\s|$)","i");for(var h in a.fonts)if(a.fonts[x](h)&&g.test(h)){f=a.fonts[h];break}}var i;if(f)for(var j=0,k=f.length;k>j&&(i=f[j],i.face["font-weight"]!=c||i.face["font-style"]!=d&&i.face["font-style"]||i.face["font-stretch"]!=e);j++);return i}},t.print=function(b,c,d,e,f,g,h){g=g||"middle",h=M(N(h||0,1),-1);var i,j=G(d)[H](E),k=0,l=0,m=E;if(a.is(e,d)&&(e=this.getFont(e)),e){i=(f||16)/e.face["units-per-em"];for(var n=e.face.bbox[H](u),o=+n[0],p=n[3]-n[1],q=0,r=+n[1]+("baseline"==g?p+ +e.face.descent:p/2),s=0,t=j.length;t>s;s++){if("\n"==j[s])k=0,w=0,l=0,q+=p;else{var v=l&&e.glyphs[j[s-1]]||{},w=e.glyphs[j[s]];k+=l?(v.w||e.w)+(v.k&&v.k[j[s]]||0)+e.w*h:0,l=1}w&&w.d&&(m+=a.transformPath(w.d,["t",k*i,q*i,"s",i,i,o,r,"t",(b-o)/i,(c-r)/i]))}}return this.path(m).attr({fill:"#000",stroke:"none"})},t.add=function(b){if(a.is(b,"array"))for(var c,d=this.set(),e=0,f=b.length;f>e;e++)c=b[e]||{},v[x](c.type)&&d.push(this[c.type]().attr(c));return d},a.format=function(b,c){var d=a.is(c,T)?[0][C](c):arguments;return b&&a.is(b,S)&&d.length-1&&(b=b.replace(w,function(a,b){return null==d[++b]?E:d[b]})),b||E},a.fullfill=function(){var a=/\{([^\}]+)\}/g,b=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,c=function(a,c,d){var e=d;return c.replace(b,function(a,b,c,d,f){b=b||d,e&&(b in e&&(e=e[b]),"function"==typeof e&&f&&(e=e()))}),e=(null==e||e==d?a:e)+""};return function(b,d){return String(b).replace(a,function(a,b){return c(a,b,d)})}}(),a.ninja=function(){return z.was?y.win.Raphael=z.is:delete Raphael,a},a.st=kc,function(b,c,d){function e(){/in/.test(b.readyState)?setTimeout(e,9):a.eve("raphael.DOMload")}null==b.readyState&&b.addEventListener&&(b.addEventListener(c,d=function(){b.removeEventListener(c,d,!1),b.readyState="complete"},!1),b.readyState="loading"),e()}(document,"DOMContentLoaded"),z.was?y.win.Raphael=a:Raphael=a,eve.on("raphael.DOMload",function(){s=!0})}(),window.Raphael.svg&&function(a){var b="hasOwnProperty",c=String,d=parseFloat,e=parseInt,f=Math,g=f.max,h=f.abs,i=f.pow,j=/[, ]+/,k=a.eve,l="",m=" ",n="http://www.w3.org/1999/xlink",o={block:"M5,0 0,2.5 5,5z",classic:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",diamond:"M2.5,0 5,2.5 2.5,5 0,2.5z",open:"M6,1 1,3.5 6,6",oval:"M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"},p={};a.toString=function(){return"Your browser supports SVG.\nYou are running Raphaël "+this.version};var q=function(d,e){if(e){"string"==typeof d&&(d=q(d));for(var f in e)e[b](f)&&("xlink:"==f.substring(0,6)?d.setAttributeNS(n,f.substring(6),c(e[f])):d.setAttribute(f,c(e[f])))}else d=a._g.doc.createElementNS("http://www.w3.org/2000/svg",d),d.style&&(d.style.webkitTapHighlightColor="rgba(0,0,0,0)");return d},r=function(b,e){var j="linear",k=b.id+e,m=.5,n=.5,o=b.node,p=b.paper,r=o.style,s=a._g.doc.getElementById(k);if(!s){if(e=c(e).replace(a._radial_gradient,function(a,b,c){if(j="radial",b&&c){m=d(b),n=d(c);var e=2*(n>.5)-1;i(m-.5,2)+i(n-.5,2)>.25&&(n=f.sqrt(.25-i(m-.5,2))*e+.5)&&.5!=n&&(n=n.toFixed(5)-1e-5*e)}return l}),e=e.split(/\s*\-\s*/),"linear"==j){var t=e.shift();if(t=-d(t),isNaN(t))return null;var u=[0,0,f.cos(a.rad(t)),f.sin(a.rad(t))],v=1/(g(h(u[2]),h(u[3]))||1);u[2]*=v,u[3]*=v,u[2]<0&&(u[0]=-u[2],u[2]=0),u[3]<0&&(u[1]=-u[3],u[3]=0)}var w=a._parseDots(e);if(!w)return null;if(k=k.replace(/[\(\)\s,\xb0#]/g,"_"),b.gradient&&k!=b.gradient.id&&(p.defs.removeChild(b.gradient),delete b.gradient),!b.gradient){s=q(j+"Gradient",{id:k}),b.gradient=s,q(s,"radial"==j?{fx:m,fy:n}:{x1:u[0],y1:u[1],x2:u[2],y2:u[3],gradientTransform:b.matrix.invert()}),p.defs.appendChild(s);for(var x=0,y=w.length;y>x;x++)s.appendChild(q("stop",{offset:w[x].offset?w[x].offset:x?"100%":"0%","stop-color":w[x].color||"#fff"}))}}return q(o,{fill:"url(#"+k+")",opacity:1,"fill-opacity":1}),r.fill=l,r.opacity=1,r.fillOpacity=1,1},s=function(a){var b=a.getBBox(1);q(a.pattern,{patternTransform:a.matrix.invert()+" translate("+b.x+","+b.y+")"})},t=function(d,e,f){if("path"==d.type){for(var g,h,i,j,k,m=c(e).toLowerCase().split("-"),n=d.paper,r=f?"end":"start",s=d.node,t=d.attrs,u=t["stroke-width"],v=m.length,w="classic",x=3,y=3,z=5;v--;)switch(m[v]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":w=m[v];break;case"wide":y=5;break;case"narrow":y=2;break;case"long":x=5;break;case"short":x=2}if("open"==w?(x+=2,y+=2,z+=2,i=1,j=f?4:1,k={fill:"none",stroke:t.stroke}):(j=i=x/2,k={fill:t.stroke,stroke:"none"}),d._.arrows?f?(d._.arrows.endPath&&p[d._.arrows.endPath]--,d._.arrows.endMarker&&p[d._.arrows.endMarker]--):(d._.arrows.startPath&&p[d._.arrows.startPath]--,d._.arrows.startMarker&&p[d._.arrows.startMarker]--):d._.arrows={},"none"!=w){var A="raphael-marker-"+w,B="raphael-marker-"+r+w+x+y;a._g.doc.getElementById(A)?p[A]++:(n.defs.appendChild(q(q("path"),{"stroke-linecap":"round",d:o[w],id:A})),p[A]=1);var C,D=a._g.doc.getElementById(B);D?(p[B]++,C=D.getElementsByTagName("use")[0]):(D=q(q("marker"),{id:B,markerHeight:y,markerWidth:x,orient:"auto",refX:j,refY:y/2}),C=q(q("use"),{"xlink:href":"#"+A,transform:(f?"rotate(180 "+x/2+" "+y/2+") ":l)+"scale("+x/z+","+y/z+")","stroke-width":(1/((x/z+y/z)/2)).toFixed(4)}),D.appendChild(C),n.defs.appendChild(D),p[B]=1),q(C,k);var E=i*("diamond"!=w&&"oval"!=w);f?(g=d._.arrows.startdx*u||0,h=a.getTotalLength(t.path)-E*u):(g=E*u,h=a.getTotalLength(t.path)-(d._.arrows.enddx*u||0)),k={},k["marker-"+r]="url(#"+B+")",(h||g)&&(k.d=Raphael.getSubpath(t.path,g,h)),q(s,k),d._.arrows[r+"Path"]=A,d._.arrows[r+"Marker"]=B,d._.arrows[r+"dx"]=E,d._.arrows[r+"Type"]=w,d._.arrows[r+"String"]=e}else f?(g=d._.arrows.startdx*u||0,h=a.getTotalLength(t.path)-g):(g=0,h=a.getTotalLength(t.path)-(d._.arrows.enddx*u||0)),d._.arrows[r+"Path"]&&q(s,{d:Raphael.getSubpath(t.path,g,h)}),delete d._.arrows[r+"Path"],delete d._.arrows[r+"Marker"],delete d._.arrows[r+"dx"],delete d._.arrows[r+"Type"],delete d._.arrows[r+"String"];for(k in p)if(p[b](k)&&!p[k]){var F=a._g.doc.getElementById(k);F&&F.parentNode.removeChild(F)}}},u={"":[0],none:[0],"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},v=function(a,b,d){if(b=u[c(b).toLowerCase()]){for(var e=a.attrs["stroke-width"]||"1",f={round:e,square:e,butt:0}[a.attrs["stroke-linecap"]||d["stroke-linecap"]]||0,g=[],h=b.length;h--;)g[h]=b[h]*e+(h%2?1:-1)*f;q(a.node,{"stroke-dasharray":g.join(",")})}},w=function(d,f){var i=d.node,k=d.attrs,m=i.style.visibility;i.style.visibility="hidden";for(var o in f)if(f[b](o)){if(!a._availableAttrs[b](o))continue;var p=f[o];switch(k[o]=p,o){case"blur":d.blur(p);break;case"href":case"title":case"target":var u=i.parentNode;if("a"!=u.tagName.toLowerCase()){var w=q("a");u.insertBefore(w,i),w.appendChild(i),u=w}"target"==o?u.setAttributeNS(n,"show","blank"==p?"new":p):u.setAttributeNS(n,o,p);break;case"cursor":i.style.cursor=p;break;case"transform":d.transform(p);break;case"arrow-start":t(d,p);break;case"arrow-end":t(d,p,1);break;case"clip-rect":var x=c(p).split(j);if(4==x.length){d.clip&&d.clip.parentNode.parentNode.removeChild(d.clip.parentNode);var z=q("clipPath"),A=q("rect");z.id=a.createUUID(),q(A,{x:x[0],y:x[1],width:x[2],height:x[3]}),z.appendChild(A),d.paper.defs.appendChild(z),q(i,{"clip-path":"url(#"+z.id+")"}),d.clip=A}if(!p){var B=i.getAttribute("clip-path");if(B){var C=a._g.doc.getElementById(B.replace(/(^url\(#|\)$)/g,l));C&&C.parentNode.removeChild(C),q(i,{"clip-path":l}),delete d.clip}}break;case"path":"path"==d.type&&(q(i,{d:p?k.path=a._pathToAbsolute(p):"M0,0"}),d._.dirty=1,d._.arrows&&("startString"in d._.arrows&&t(d,d._.arrows.startString),"endString"in d._.arrows&&t(d,d._.arrows.endString,1)));break;case"width":if(i.setAttribute(o,p),d._.dirty=1,!k.fx)break;o="x",p=k.x;case"x":k.fx&&(p=-k.x-(k.width||0));case"rx":if("rx"==o&&"rect"==d.type)break;case"cx":i.setAttribute(o,p),d.pattern&&s(d),d._.dirty=1;break;case"height":if(i.setAttribute(o,p),d._.dirty=1,!k.fy)break;o="y",p=k.y;case"y":k.fy&&(p=-k.y-(k.height||0));case"ry":if("ry"==o&&"rect"==d.type)break;case"cy":i.setAttribute(o,p),d.pattern&&s(d),d._.dirty=1;break;case"r":"rect"==d.type?q(i,{rx:p,ry:p}):i.setAttribute(o,p),d._.dirty=1;break;case"src":"image"==d.type&&i.setAttributeNS(n,"href",p);break;case"stroke-width":(1!=d._.sx||1!=d._.sy)&&(p/=g(h(d._.sx),h(d._.sy))||1),d.paper._vbSize&&(p*=d.paper._vbSize),i.setAttribute(o,p),k["stroke-dasharray"]&&v(d,k["stroke-dasharray"],f),d._.arrows&&("startString"in d._.arrows&&t(d,d._.arrows.startString),"endString"in d._.arrows&&t(d,d._.arrows.endString,1));break;case"stroke-dasharray":v(d,p,f);break;case"fill":var D=c(p).match(a._ISURL);if(D){z=q("pattern");var E=q("image");z.id=a.createUUID(),q(z,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1}),q(E,{x:0,y:0,"xlink:href":D[1]}),z.appendChild(E),function(b){a._preload(D[1],function(){var a=this.offsetWidth,c=this.offsetHeight;q(b,{width:a,height:c}),q(E,{width:a,height:c}),d.paper.safari()})}(z),d.paper.defs.appendChild(z),q(i,{fill:"url(#"+z.id+")"}),d.pattern=z,d.pattern&&s(d);break}var F=a.getRGB(p);if(F.error){if(("circle"==d.type||"ellipse"==d.type||"r"!=c(p).charAt())&&r(d,p)){if("opacity"in k||"fill-opacity"in k){var G=a._g.doc.getElementById(i.getAttribute("fill").replace(/^url\(#|\)$/g,l));if(G){var H=G.getElementsByTagName("stop");q(H[H.length-1],{"stop-opacity":("opacity"in k?k.opacity:1)*("fill-opacity"in k?k["fill-opacity"]:1)})}}k.gradient=p,k.fill="none";break}}else delete f.gradient,delete k.gradient,!a.is(k.opacity,"undefined")&&a.is(f.opacity,"undefined")&&q(i,{opacity:k.opacity}),!a.is(k["fill-opacity"],"undefined")&&a.is(f["fill-opacity"],"undefined")&&q(i,{"fill-opacity":k["fill-opacity"]});F[b]("opacity")&&q(i,{"fill-opacity":F.opacity>1?F.opacity/100:F.opacity});case"stroke":F=a.getRGB(p),i.setAttribute(o,F.hex),"stroke"==o&&F[b]("opacity")&&q(i,{"stroke-opacity":F.opacity>1?F.opacity/100:F.opacity}),"stroke"==o&&d._.arrows&&("startString"in d._.arrows&&t(d,d._.arrows.startString),"endString"in d._.arrows&&t(d,d._.arrows.endString,1));break;case"gradient":("circle"==d.type||"ellipse"==d.type||"r"!=c(p).charAt())&&r(d,p);break;case"opacity":k.gradient&&!k[b]("stroke-opacity")&&q(i,{"stroke-opacity":p>1?p/100:p});case"fill-opacity":if(k.gradient){G=a._g.doc.getElementById(i.getAttribute("fill").replace(/^url\(#|\)$/g,l)),G&&(H=G.getElementsByTagName("stop"),q(H[H.length-1],{"stop-opacity":p}));break}default:"font-size"==o&&(p=e(p,10)+"px");var I=o.replace(/(\-.)/g,function(a){return a.substring(1).toUpperCase()});i.style[I]=p,d._.dirty=1,i.setAttribute(o,p)}}y(d,f),i.style.visibility=m},x=1.2,y=function(d,f){if("text"==d.type&&(f[b]("text")||f[b]("font")||f[b]("font-size")||f[b]("x")||f[b]("y"))){var g=d.attrs,h=d.node,i=h.firstChild?e(a._g.doc.defaultView.getComputedStyle(h.firstChild,l).getPropertyValue("font-size"),10):10;if(f[b]("text")){for(g.text=f.text;h.firstChild;)h.removeChild(h.firstChild);for(var j,k=c(f.text).split("\n"),m=[],n=0,o=k.length;o>n;n++)j=q("tspan"),n&&q(j,{dy:i*x,x:g.x}),j.appendChild(a._g.doc.createTextNode(k[n])),h.appendChild(j),m[n]=j}else for(m=h.getElementsByTagName("tspan"),n=0,o=m.length;o>n;n++)n?q(m[n],{dy:i*x,x:g.x}):q(m[0],{dy:0});q(h,{x:g.x,y:g.y}),d._.dirty=1;var p=d._getBBox(),r=g.y-(p.y+p.height/2);r&&a.is(r,"finite")&&q(m[0],{dy:r})}},z=function(b,c){this[0]=this.node=b,b.raphael=!0,this.id=a._oid++,b.raphaelid=this.id,this.matrix=a.matrix(),this.realPath=null,this.paper=c,this.attrs=this.attrs||{},this._={transform:[],sx:1,sy:1,deg:0,dx:0,dy:0,dirty:1},!c.bottom&&(c.bottom=this),this.prev=c.top,c.top&&(c.top.next=this),c.top=this,this.next=null},A=a.el;z.prototype=A,A.constructor=z,a._engine.path=function(a,b){var c=q("path");b.canvas&&b.canvas.appendChild(c);var d=new z(c,b);return d.type="path",w(d,{fill:"none",stroke:"#000",path:a}),d},A.rotate=function(a,b,e){if(this.removed)return this;if(a=c(a).split(j),a.length-1&&(b=d(a[1]),e=d(a[2])),a=d(a[0]),null==e&&(b=e),null==b||null==e){var f=this.getBBox(1);b=f.x+f.width/2,e=f.y+f.height/2}return this.transform(this._.transform.concat([["r",a,b,e]])),this},A.scale=function(a,b,e,f){if(this.removed)return this;if(a=c(a).split(j),a.length-1&&(b=d(a[1]),e=d(a[2]),f=d(a[3])),a=d(a[0]),null==b&&(b=a),null==f&&(e=f),null==e||null==f)var g=this.getBBox(1);return e=null==e?g.x+g.width/2:e,f=null==f?g.y+g.height/2:f,this.transform(this._.transform.concat([["s",a,b,e,f]])),this},A.translate=function(a,b){return this.removed?this:(a=c(a).split(j),a.length-1&&(b=d(a[1])),a=d(a[0])||0,b=+b||0,this.transform(this._.transform.concat([["t",a,b]])),this)},A.transform=function(c){var d=this._;if(null==c)return d.transform;if(a._extractTransform(this,c),this.clip&&q(this.clip,{transform:this.matrix.invert()}),this.pattern&&s(this),this.node&&q(this.node,{transform:this.matrix}),1!=d.sx||1!=d.sy){var e=this.attrs[b]("stroke-width")?this.attrs["stroke-width"]:1;this.attr({"stroke-width":e})}return this},A.hide=function(){return!this.removed&&this.paper.safari(this.node.style.display="none"),this},A.show=function(){return!this.removed&&this.paper.safari(this.node.style.display=""),this},A.remove=function(){if(!this.removed&&this.node.parentNode){var b=this.paper;b.__set__&&b.__set__.exclude(this),k.unbind("raphael.*.*."+this.id),this.gradient&&b.defs.removeChild(this.gradient),a._tear(this,b),"a"==this.node.parentNode.tagName.toLowerCase()?this.node.parentNode.parentNode.removeChild(this.node.parentNode):this.node.parentNode.removeChild(this.node);for(var c in this)this[c]="function"==typeof this[c]?a._removedFactory(c):null;this.removed=!0}},A._getBBox=function(){if("none"==this.node.style.display){this.show();var a=!0}var b={};try{b=this.node.getBBox()}catch(c){}finally{b=b||{}}return a&&this.hide(),b},A.attr=function(c,d){if(this.removed)return this;if(null==c){var e={};for(var f in this.attrs)this.attrs[b](f)&&(e[f]=this.attrs[f]);return e.gradient&&"none"==e.fill&&(e.fill=e.gradient)&&delete e.gradient,e.transform=this._.transform,e}if(null==d&&a.is(c,"string")){if("fill"==c&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;if("transform"==c)return this._.transform;for(var g=c.split(j),h={},i=0,l=g.length;l>i;i++)c=g[i],h[c]=c in this.attrs?this.attrs[c]:a.is(this.paper.customAttributes[c],"function")?this.paper.customAttributes[c].def:a._availableAttrs[c];return l-1?h:h[g[0]]}if(null==d&&a.is(c,"array")){for(h={},i=0,l=c.length;l>i;i++)h[c[i]]=this.attr(c[i]);return h}if(null!=d){var m={};m[c]=d}else null!=c&&a.is(c,"object")&&(m=c);for(var n in m)k("raphael.attr."+n+"."+this.id,this,m[n]);for(n in this.paper.customAttributes)if(this.paper.customAttributes[b](n)&&m[b](n)&&a.is(this.paper.customAttributes[n],"function")){var o=this.paper.customAttributes[n].apply(this,[].concat(m[n]));this.attrs[n]=m[n];for(var p in o)o[b](p)&&(m[p]=o[p])}return w(this,m),this
},A.toFront=function(){if(this.removed)return this;"a"==this.node.parentNode.tagName.toLowerCase()?this.node.parentNode.parentNode.appendChild(this.node.parentNode):this.node.parentNode.appendChild(this.node);var b=this.paper;return b.top!=this&&a._tofront(this,b),this},A.toBack=function(){if(this.removed)return this;var b=this.node.parentNode;"a"==b.tagName.toLowerCase()?b.parentNode.insertBefore(this.node.parentNode,this.node.parentNode.parentNode.firstChild):b.firstChild!=this.node&&b.insertBefore(this.node,this.node.parentNode.firstChild),a._toback(this,this.paper);this.paper;return this},A.insertAfter=function(b){if(this.removed)return this;var c=b.node||b[b.length-1].node;return c.nextSibling?c.parentNode.insertBefore(this.node,c.nextSibling):c.parentNode.appendChild(this.node),a._insertafter(this,b,this.paper),this},A.insertBefore=function(b){if(this.removed)return this;var c=b.node||b[0].node;return c.parentNode.insertBefore(this.node,c),a._insertbefore(this,b,this.paper),this},A.blur=function(b){var c=this;if(0!==+b){var d=q("filter"),e=q("feGaussianBlur");c.attrs.blur=b,d.id=a.createUUID(),q(e,{stdDeviation:+b||1.5}),d.appendChild(e),c.paper.defs.appendChild(d),c._blur=d,q(c.node,{filter:"url(#"+d.id+")"})}else c._blur&&(c._blur.parentNode.removeChild(c._blur),delete c._blur,delete c.attrs.blur),c.node.removeAttribute("filter")},a._engine.circle=function(a,b,c,d){var e=q("circle");a.canvas&&a.canvas.appendChild(e);var f=new z(e,a);return f.attrs={cx:b,cy:c,r:d,fill:"none",stroke:"#000"},f.type="circle",q(e,f.attrs),f},a._engine.rect=function(a,b,c,d,e,f){var g=q("rect");a.canvas&&a.canvas.appendChild(g);var h=new z(g,a);return h.attrs={x:b,y:c,width:d,height:e,r:f||0,rx:f||0,ry:f||0,fill:"none",stroke:"#000"},h.type="rect",q(g,h.attrs),h},a._engine.ellipse=function(a,b,c,d,e){var f=q("ellipse");a.canvas&&a.canvas.appendChild(f);var g=new z(f,a);return g.attrs={cx:b,cy:c,rx:d,ry:e,fill:"none",stroke:"#000"},g.type="ellipse",q(f,g.attrs),g},a._engine.image=function(a,b,c,d,e,f){var g=q("image");q(g,{x:c,y:d,width:e,height:f,preserveAspectRatio:"none"}),g.setAttributeNS(n,"href",b),a.canvas&&a.canvas.appendChild(g);var h=new z(g,a);return h.attrs={x:c,y:d,width:e,height:f,src:b},h.type="image",h},a._engine.text=function(b,c,d,e){var f=q("text");b.canvas&&b.canvas.appendChild(f);var g=new z(f,b);return g.attrs={x:c,y:d,"text-anchor":"middle",text:e,font:a._availableAttrs.font,stroke:"none",fill:"#000"},g.type="text",w(g,g.attrs),g},a._engine.setSize=function(a,b){return this.width=a||this.width,this.height=b||this.height,this.canvas.setAttribute("width",this.width),this.canvas.setAttribute("height",this.height),this._viewBox&&this.setViewBox.apply(this,this._viewBox),this},a._engine.create=function(){var b=a._getContainer.apply(0,arguments),c=b&&b.container,d=b.x,e=b.y,f=b.width,g=b.height;if(!c)throw new Error("SVG container not found.");var h,i=q("svg"),j="overflow:hidden;";return d=d||0,e=e||0,f=f||512,g=g||342,q(i,{height:g,version:1.1,width:f,xmlns:"http://www.w3.org/2000/svg"}),1==c?(i.style.cssText=j+"position:absolute;left:"+d+"px;top:"+e+"px",a._g.doc.body.appendChild(i),h=1):(i.style.cssText=j+"position:relative",c.firstChild?c.insertBefore(i,c.firstChild):c.appendChild(i)),c=new a._Paper,c.width=f,c.height=g,c.canvas=i,c.clear(),c._left=c._top=0,h&&(c.renderfix=function(){}),c.renderfix(),c},a._engine.setViewBox=function(a,b,c,d,e){k("raphael.setViewBox",this,this._viewBox,[a,b,c,d,e]);var f,h,i=g(c/this.width,d/this.height),j=this.top,l=e?"meet":"xMinYMin";for(null==a?(this._vbSize&&(i=1),delete this._vbSize,f="0 0 "+this.width+m+this.height):(this._vbSize=i,f=a+m+b+m+c+m+d),q(this.canvas,{viewBox:f,preserveAspectRatio:l});i&&j;)h="stroke-width"in j.attrs?j.attrs["stroke-width"]:1,j.attr({"stroke-width":h}),j._.dirty=1,j._.dirtyT=1,j=j.prev;return this._viewBox=[a,b,c,d,!!e],this},a.prototype.renderfix=function(){var a,b=this.canvas,c=b.style;try{a=b.getScreenCTM()||b.createSVGMatrix()}catch(d){a=b.createSVGMatrix()}var e=-a.e%1,f=-a.f%1;(e||f)&&(e&&(this._left=(this._left+e)%1,c.left=this._left+"px"),f&&(this._top=(this._top+f)%1,c.top=this._top+"px"))},a.prototype.clear=function(){a.eve("raphael.clear",this);for(var b=this.canvas;b.firstChild;)b.removeChild(b.firstChild);this.bottom=this.top=null,(this.desc=q("desc")).appendChild(a._g.doc.createTextNode("Created with Raphaël "+a.version)),b.appendChild(this.desc),b.appendChild(this.defs=q("defs"))},a.prototype.remove=function(){k("raphael.remove",this),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var b in this)this[b]="function"==typeof this[b]?a._removedFactory(b):null};var B=a.st;for(var C in A)A[b](C)&&!B[b](C)&&(B[C]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a].apply(c,b)})}}(C))}(window.Raphael),window.Raphael.vml&&function(a){var b="hasOwnProperty",c=String,d=parseFloat,e=Math,f=e.round,g=e.max,h=e.min,i=e.abs,j="fill",k=/[, ]+/,l=a.eve,m=" progid:DXImageTransform.Microsoft",n=" ",o="",p={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},q=/([clmz]),?([^clmz]*)/gi,r=/ progid:\S+Blur\([^\)]+\)/g,s=/-?[^,\s-]+/g,t="position:absolute;left:0;top:0;width:1px;height:1px",u=21600,v={path:1,rect:1,image:1},w={circle:1,ellipse:1},x=function(b){var d=/[ahqstv]/gi,e=a._pathToAbsolute;if(c(b).match(d)&&(e=a._path2curve),d=/[clmz]/g,e==a._pathToAbsolute&&!c(b).match(d)){var g=c(b).replace(q,function(a,b,c){var d=[],e="m"==b.toLowerCase(),g=p[b];return c.replace(s,function(a){e&&2==d.length&&(g+=d+p["m"==b?"l":"L"],d=[]),d.push(f(a*u))}),g+d});return g}var h,i,j=e(b);g=[];for(var k=0,l=j.length;l>k;k++){h=j[k],i=j[k][0].toLowerCase(),"z"==i&&(i="x");for(var m=1,r=h.length;r>m;m++)i+=f(h[m]*u)+(m!=r-1?",":o);g.push(i)}return g.join(n)},y=function(b,c,d){var e=a.matrix();return e.rotate(-b,.5,.5),{dx:e.x(c,d),dy:e.y(c,d)}},z=function(a,b,c,d,e,f){var g=a._,h=a.matrix,k=g.fillpos,l=a.node,m=l.style,o=1,p="",q=u/b,r=u/c;if(m.visibility="hidden",b&&c){if(l.coordsize=i(q)+n+i(r),m.rotation=f*(0>b*c?-1:1),f){var s=y(f,d,e);d=s.dx,e=s.dy}if(0>b&&(p+="x"),0>c&&(p+=" y")&&(o=-1),m.flip=p,l.coordorigin=d*-q+n+e*-r,k||g.fillsize){var t=l.getElementsByTagName(j);t=t&&t[0],l.removeChild(t),k&&(s=y(f,h.x(k[0],k[1]),h.y(k[0],k[1])),t.position=s.dx*o+n+s.dy*o),g.fillsize&&(t.size=g.fillsize[0]*i(b)+n+g.fillsize[1]*i(c)),l.appendChild(t)}m.visibility="visible"}};a.toString=function(){return"Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël "+this.version};var A=function(a,b,d){for(var e=c(b).toLowerCase().split("-"),f=d?"end":"start",g=e.length,h="classic",i="medium",j="medium";g--;)switch(e[g]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":h=e[g];break;case"wide":case"narrow":j=e[g];break;case"long":case"short":i=e[g]}var k=a.node.getElementsByTagName("stroke")[0];k[f+"arrow"]=h,k[f+"arrowlength"]=i,k[f+"arrowwidth"]=j},B=function(e,i){e.attrs=e.attrs||{};var l=e.node,m=e.attrs,p=l.style,q=v[e.type]&&(i.x!=m.x||i.y!=m.y||i.width!=m.width||i.height!=m.height||i.cx!=m.cx||i.cy!=m.cy||i.rx!=m.rx||i.ry!=m.ry||i.r!=m.r),r=w[e.type]&&(m.cx!=i.cx||m.cy!=i.cy||m.r!=i.r||m.rx!=i.rx||m.ry!=i.ry),s=e;for(var t in i)i[b](t)&&(m[t]=i[t]);if(q&&(m.path=a._getPath[e.type](e),e._.dirty=1),i.href&&(l.href=i.href),i.title&&(l.title=i.title),i.target&&(l.target=i.target),i.cursor&&(p.cursor=i.cursor),"blur"in i&&e.blur(i.blur),(i.path&&"path"==e.type||q)&&(l.path=x(~c(m.path).toLowerCase().indexOf("r")?a._pathToAbsolute(m.path):m.path),"image"==e.type&&(e._.fillpos=[m.x,m.y],e._.fillsize=[m.width,m.height],z(e,1,1,0,0,0))),"transform"in i&&e.transform(i.transform),r){var y=+m.cx,B=+m.cy,D=+m.rx||+m.r||0,E=+m.ry||+m.r||0;l.path=a.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x",f((y-D)*u),f((B-E)*u),f((y+D)*u),f((B+E)*u),f(y*u))}if("clip-rect"in i){var G=c(i["clip-rect"]).split(k);if(4==G.length){G[2]=+G[2]+ +G[0],G[3]=+G[3]+ +G[1];var H=l.clipRect||a._g.doc.createElement("div"),I=H.style;I.clip=a.format("rect({1}px {2}px {3}px {0}px)",G),l.clipRect||(I.position="absolute",I.top=0,I.left=0,I.width=e.paper.width+"px",I.height=e.paper.height+"px",l.parentNode.insertBefore(H,l),H.appendChild(l),l.clipRect=H)}i["clip-rect"]||l.clipRect&&(l.clipRect.style.clip="auto")}if(e.textpath){var J=e.textpath.style;i.font&&(J.font=i.font),i["font-family"]&&(J.fontFamily='"'+i["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g,o)+'"'),i["font-size"]&&(J.fontSize=i["font-size"]),i["font-weight"]&&(J.fontWeight=i["font-weight"]),i["font-style"]&&(J.fontStyle=i["font-style"])}if("arrow-start"in i&&A(s,i["arrow-start"]),"arrow-end"in i&&A(s,i["arrow-end"],1),null!=i.opacity||null!=i["stroke-width"]||null!=i.fill||null!=i.src||null!=i.stroke||null!=i["stroke-width"]||null!=i["stroke-opacity"]||null!=i["fill-opacity"]||null!=i["stroke-dasharray"]||null!=i["stroke-miterlimit"]||null!=i["stroke-linejoin"]||null!=i["stroke-linecap"]){var K=l.getElementsByTagName(j),L=!1;if(K=K&&K[0],!K&&(L=K=F(j)),"image"==e.type&&i.src&&(K.src=i.src),i.fill&&(K.on=!0),(null==K.on||"none"==i.fill||null===i.fill)&&(K.on=!1),K.on&&i.fill){var M=c(i.fill).match(a._ISURL);if(M){K.parentNode==l&&l.removeChild(K),K.rotate=!0,K.src=M[1],K.type="tile";var N=e.getBBox(1);K.position=N.x+n+N.y,e._.fillpos=[N.x,N.y],a._preload(M[1],function(){e._.fillsize=[this.offsetWidth,this.offsetHeight]})}else K.color=a.getRGB(i.fill).hex,K.src=o,K.type="solid",a.getRGB(i.fill).error&&(s.type in{circle:1,ellipse:1}||"r"!=c(i.fill).charAt())&&C(s,i.fill,K)&&(m.fill="none",m.gradient=i.fill,K.rotate=!1)}if("fill-opacity"in i||"opacity"in i){var O=((+m["fill-opacity"]+1||2)-1)*((+m.opacity+1||2)-1)*((+a.getRGB(i.fill).o+1||2)-1);O=h(g(O,0),1),K.opacity=O,K.src&&(K.color="none")}l.appendChild(K);var P=l.getElementsByTagName("stroke")&&l.getElementsByTagName("stroke")[0],Q=!1;!P&&(Q=P=F("stroke")),(i.stroke&&"none"!=i.stroke||i["stroke-width"]||null!=i["stroke-opacity"]||i["stroke-dasharray"]||i["stroke-miterlimit"]||i["stroke-linejoin"]||i["stroke-linecap"])&&(P.on=!0),("none"==i.stroke||null===i.stroke||null==P.on||0==i.stroke||0==i["stroke-width"])&&(P.on=!1);var R=a.getRGB(i.stroke);P.on&&i.stroke&&(P.color=R.hex),O=((+m["stroke-opacity"]+1||2)-1)*((+m.opacity+1||2)-1)*((+R.o+1||2)-1);var S=.75*(d(i["stroke-width"])||1);if(O=h(g(O,0),1),null==i["stroke-width"]&&(S=m["stroke-width"]),i["stroke-width"]&&(P.weight=S),S&&1>S&&(O*=S)&&(P.weight=1),P.opacity=O,i["stroke-linejoin"]&&(P.joinstyle=i["stroke-linejoin"]||"miter"),P.miterlimit=i["stroke-miterlimit"]||8,i["stroke-linecap"]&&(P.endcap="butt"==i["stroke-linecap"]?"flat":"square"==i["stroke-linecap"]?"square":"round"),i["stroke-dasharray"]){var T={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};P.dashstyle=T[b](i["stroke-dasharray"])?T[i["stroke-dasharray"]]:o}Q&&l.appendChild(P)}if("text"==s.type){s.paper.canvas.style.display=o;var U=s.paper.span,V=100,W=m.font&&m.font.match(/\d+(?:\.\d*)?(?=px)/);p=U.style,m.font&&(p.font=m.font),m["font-family"]&&(p.fontFamily=m["font-family"]),m["font-weight"]&&(p.fontWeight=m["font-weight"]),m["font-style"]&&(p.fontStyle=m["font-style"]),W=d(m["font-size"]||W&&W[0])||10,p.fontSize=W*V+"px",s.textpath.string&&(U.innerHTML=c(s.textpath.string).replace(/</g,"&#60;").replace(/&/g,"&#38;").replace(/\n/g,"<br>"));var X=U.getBoundingClientRect();s.W=m.w=(X.right-X.left)/V,s.H=m.h=(X.bottom-X.top)/V,s.X=m.x,s.Y=m.y+s.H/2,("x"in i||"y"in i)&&(s.path.v=a.format("m{0},{1}l{2},{1}",f(m.x*u),f(m.y*u),f(m.x*u)+1));for(var Y=["x","y","text","font","font-family","font-weight","font-style","font-size"],Z=0,$=Y.length;$>Z;Z++)if(Y[Z]in i){s._.dirty=1;break}switch(m["text-anchor"]){case"start":s.textpath.style["v-text-align"]="left",s.bbx=s.W/2;break;case"end":s.textpath.style["v-text-align"]="right",s.bbx=-s.W/2;break;default:s.textpath.style["v-text-align"]="center",s.bbx=0}s.textpath.style["v-text-kern"]=!0}},C=function(b,f,g){b.attrs=b.attrs||{};var h=(b.attrs,Math.pow),i="linear",j=".5 .5";if(b.attrs.gradient=f,f=c(f).replace(a._radial_gradient,function(a,b,c){return i="radial",b&&c&&(b=d(b),c=d(c),h(b-.5,2)+h(c-.5,2)>.25&&(c=e.sqrt(.25-h(b-.5,2))*(2*(c>.5)-1)+.5),j=b+n+c),o}),f=f.split(/\s*\-\s*/),"linear"==i){var k=f.shift();if(k=-d(k),isNaN(k))return null}var l=a._parseDots(f);if(!l)return null;if(b=b.shape||b.node,l.length){b.removeChild(g),g.on=!0,g.method="none",g.color=l[0].color,g.color2=l[l.length-1].color;for(var m=[],p=0,q=l.length;q>p;p++)l[p].offset&&m.push(l[p].offset+n+l[p].color);g.colors=m.length?m.join():"0% "+g.color,"radial"==i?(g.type="gradientTitle",g.focus="100%",g.focussize="0 0",g.focusposition=j,g.angle=0):(g.type="gradient",g.angle=(270-k)%360),b.appendChild(g)}return 1},D=function(b,c){this[0]=this.node=b,b.raphael=!0,this.id=a._oid++,b.raphaelid=this.id,this.X=0,this.Y=0,this.attrs={},this.paper=c,this.matrix=a.matrix(),this._={transform:[],sx:1,sy:1,dx:0,dy:0,deg:0,dirty:1,dirtyT:1},!c.bottom&&(c.bottom=this),this.prev=c.top,c.top&&(c.top.next=this),c.top=this,this.next=null},E=a.el;D.prototype=E,E.constructor=D,E.transform=function(b){if(null==b)return this._.transform;var d,e=this.paper._viewBoxShift,f=e?"s"+[e.scale,e.scale]+"-1-1t"+[e.dx,e.dy]:o;e&&(d=b=c(b).replace(/\.{3}|\u2026/g,this._.transform||o)),a._extractTransform(this,f+b);var g,h=this.matrix.clone(),i=this.skew,j=this.node,k=~c(this.attrs.fill).indexOf("-"),l=!c(this.attrs.fill).indexOf("url(");if(h.translate(-.5,-.5),l||k||"image"==this.type)if(i.matrix="1 0 0 1",i.offset="0 0",g=h.split(),k&&g.noRotation||!g.isSimple){j.style.filter=h.toFilter();var m=this.getBBox(),p=this.getBBox(1),q=m.x-p.x,r=m.y-p.y;j.coordorigin=q*-u+n+r*-u,z(this,1,1,q,r,0)}else j.style.filter=o,z(this,g.scalex,g.scaley,g.dx,g.dy,g.rotate);else j.style.filter=o,i.matrix=c(h),i.offset=h.offset();return d&&(this._.transform=d),this},E.rotate=function(a,b,e){if(this.removed)return this;if(null!=a){if(a=c(a).split(k),a.length-1&&(b=d(a[1]),e=d(a[2])),a=d(a[0]),null==e&&(b=e),null==b||null==e){var f=this.getBBox(1);b=f.x+f.width/2,e=f.y+f.height/2}return this._.dirtyT=1,this.transform(this._.transform.concat([["r",a,b,e]])),this}},E.translate=function(a,b){return this.removed?this:(a=c(a).split(k),a.length-1&&(b=d(a[1])),a=d(a[0])||0,b=+b||0,this._.bbox&&(this._.bbox.x+=a,this._.bbox.y+=b),this.transform(this._.transform.concat([["t",a,b]])),this)},E.scale=function(a,b,e,f){if(this.removed)return this;if(a=c(a).split(k),a.length-1&&(b=d(a[1]),e=d(a[2]),f=d(a[3]),isNaN(e)&&(e=null),isNaN(f)&&(f=null)),a=d(a[0]),null==b&&(b=a),null==f&&(e=f),null==e||null==f)var g=this.getBBox(1);return e=null==e?g.x+g.width/2:e,f=null==f?g.y+g.height/2:f,this.transform(this._.transform.concat([["s",a,b,e,f]])),this._.dirtyT=1,this},E.hide=function(){return!this.removed&&(this.node.style.display="none"),this},E.show=function(){return!this.removed&&(this.node.style.display=o),this},E._getBBox=function(){return this.removed?{}:{x:this.X+(this.bbx||0)-this.W/2,y:this.Y-this.H,width:this.W,height:this.H}},E.remove=function(){if(!this.removed&&this.node.parentNode){this.paper.__set__&&this.paper.__set__.exclude(this),a.eve.unbind("raphael.*.*."+this.id),a._tear(this,this.paper),this.node.parentNode.removeChild(this.node),this.shape&&this.shape.parentNode.removeChild(this.shape);for(var b in this)this[b]="function"==typeof this[b]?a._removedFactory(b):null;this.removed=!0}},E.attr=function(c,d){if(this.removed)return this;if(null==c){var e={};for(var f in this.attrs)this.attrs[b](f)&&(e[f]=this.attrs[f]);return e.gradient&&"none"==e.fill&&(e.fill=e.gradient)&&delete e.gradient,e.transform=this._.transform,e}if(null==d&&a.is(c,"string")){if(c==j&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;for(var g=c.split(k),h={},i=0,m=g.length;m>i;i++)c=g[i],h[c]=c in this.attrs?this.attrs[c]:a.is(this.paper.customAttributes[c],"function")?this.paper.customAttributes[c].def:a._availableAttrs[c];return m-1?h:h[g[0]]}if(this.attrs&&null==d&&a.is(c,"array")){for(h={},i=0,m=c.length;m>i;i++)h[c[i]]=this.attr(c[i]);return h}var n;null!=d&&(n={},n[c]=d),null==d&&a.is(c,"object")&&(n=c);for(var o in n)l("raphael.attr."+o+"."+this.id,this,n[o]);if(n){for(o in this.paper.customAttributes)if(this.paper.customAttributes[b](o)&&n[b](o)&&a.is(this.paper.customAttributes[o],"function")){var p=this.paper.customAttributes[o].apply(this,[].concat(n[o]));this.attrs[o]=n[o];for(var q in p)p[b](q)&&(n[q]=p[q])}n.text&&"text"==this.type&&(this.textpath.string=n.text),B(this,n)}return this},E.toFront=function(){return!this.removed&&this.node.parentNode.appendChild(this.node),this.paper&&this.paper.top!=this&&a._tofront(this,this.paper),this},E.toBack=function(){return this.removed?this:(this.node.parentNode.firstChild!=this.node&&(this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild),a._toback(this,this.paper)),this)},E.insertAfter=function(b){return this.removed?this:(b.constructor==a.st.constructor&&(b=b[b.length-1]),b.node.nextSibling?b.node.parentNode.insertBefore(this.node,b.node.nextSibling):b.node.parentNode.appendChild(this.node),a._insertafter(this,b,this.paper),this)},E.insertBefore=function(b){return this.removed?this:(b.constructor==a.st.constructor&&(b=b[0]),b.node.parentNode.insertBefore(this.node,b.node),a._insertbefore(this,b,this.paper),this)},E.blur=function(b){var c=this.node.runtimeStyle,d=c.filter;d=d.replace(r,o),0!==+b?(this.attrs.blur=b,c.filter=d+n+m+".Blur(pixelradius="+(+b||1.5)+")",c.margin=a.format("-{0}px 0 0 -{0}px",f(+b||1.5))):(c.filter=d,c.margin=0,delete this.attrs.blur)},a._engine.path=function(a,b){var c=F("shape");c.style.cssText=t,c.coordsize=u+n+u,c.coordorigin=b.coordorigin;var d=new D(c,b),e={fill:"none",stroke:"#000"};a&&(e.path=a),d.type="path",d.path=[],d.Path=o,B(d,e),b.canvas.appendChild(c);var f=F("skew");return f.on=!0,c.appendChild(f),d.skew=f,d.transform(o),d},a._engine.rect=function(b,c,d,e,f,g){var h=a._rectPath(c,d,e,f,g),i=b.path(h),j=i.attrs;return i.X=j.x=c,i.Y=j.y=d,i.W=j.width=e,i.H=j.height=f,j.r=g,j.path=h,i.type="rect",i},a._engine.ellipse=function(a,b,c,d,e){{var f=a.path();f.attrs}return f.X=b-d,f.Y=c-e,f.W=2*d,f.H=2*e,f.type="ellipse",B(f,{cx:b,cy:c,rx:d,ry:e}),f},a._engine.circle=function(a,b,c,d){{var e=a.path();e.attrs}return e.X=b-d,e.Y=c-d,e.W=e.H=2*d,e.type="circle",B(e,{cx:b,cy:c,r:d}),e},a._engine.image=function(b,c,d,e,f,g){var h=a._rectPath(d,e,f,g),i=b.path(h).attr({stroke:"none"}),k=i.attrs,l=i.node,m=l.getElementsByTagName(j)[0];return k.src=c,i.X=k.x=d,i.Y=k.y=e,i.W=k.width=f,i.H=k.height=g,k.path=h,i.type="image",m.parentNode==l&&l.removeChild(m),m.rotate=!0,m.src=c,m.type="tile",i._.fillpos=[d,e],i._.fillsize=[f,g],l.appendChild(m),z(i,1,1,0,0,0),i},a._engine.text=function(b,d,e,g){var h=F("shape"),i=F("path"),j=F("textpath");d=d||0,e=e||0,g=g||"",i.v=a.format("m{0},{1}l{2},{1}",f(d*u),f(e*u),f(d*u)+1),i.textpathok=!0,j.string=c(g),j.on=!0,h.style.cssText=t,h.coordsize=u+n+u,h.coordorigin="0 0";var k=new D(h,b),l={fill:"#000",stroke:"none",font:a._availableAttrs.font,text:g};k.shape=h,k.path=i,k.textpath=j,k.type="text",k.attrs.text=c(g),k.attrs.x=d,k.attrs.y=e,k.attrs.w=1,k.attrs.h=1,B(k,l),h.appendChild(j),h.appendChild(i),b.canvas.appendChild(h);var m=F("skew");return m.on=!0,h.appendChild(m),k.skew=m,k.transform(o),k},a._engine.setSize=function(b,c){var d=this.canvas.style;return this.width=b,this.height=c,b==+b&&(b+="px"),c==+c&&(c+="px"),d.width=b,d.height=c,d.clip="rect(0 "+b+" "+c+" 0)",this._viewBox&&a._engine.setViewBox.apply(this,this._viewBox),this},a._engine.setViewBox=function(b,c,d,e,f){a.eve("raphael.setViewBox",this,this._viewBox,[b,c,d,e,f]);var h,i,j=this.width,k=this.height,l=1/g(d/j,e/k);return f&&(h=k/e,i=j/d,j>d*h&&(b-=(j-d*h)/2/h),k>e*i&&(c-=(k-e*i)/2/i)),this._viewBox=[b,c,d,e,!!f],this._viewBoxShift={dx:-b,dy:-c,scale:l},this.forEach(function(a){a.transform("...")}),this};var F;a._engine.initWin=function(a){var b=a.document;b.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)");try{!b.namespaces.rvml&&b.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),F=function(a){return b.createElement("<rvml:"+a+' class="rvml">')}}catch(c){F=function(a){return b.createElement("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}},a._engine.initWin(a._g.win),a._engine.create=function(){var b=a._getContainer.apply(0,arguments),c=b.container,d=b.height,e=b.width,f=b.x,g=b.y;if(!c)throw new Error("VML container not found.");var h=new a._Paper,i=h.canvas=a._g.doc.createElement("div"),j=i.style;return f=f||0,g=g||0,e=e||512,d=d||342,h.width=e,h.height=d,e==+e&&(e+="px"),d==+d&&(d+="px"),h.coordsize=1e3*u+n+1e3*u,h.coordorigin="0 0",h.span=a._g.doc.createElement("span"),h.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;",i.appendChild(h.span),j.cssText=a.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",e,d),1==c?(a._g.doc.body.appendChild(i),j.left=f+"px",j.top=g+"px",j.position="absolute"):c.firstChild?c.insertBefore(i,c.firstChild):c.appendChild(i),h.renderfix=function(){},h},a.prototype.clear=function(){a.eve("raphael.clear",this),this.canvas.innerHTML=o,this.span=a._g.doc.createElement("span"),this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;",this.canvas.appendChild(this.span),this.bottom=this.top=null},a.prototype.remove=function(){a.eve("raphael.remove",this),this.canvas.parentNode.removeChild(this.canvas);for(var b in this)this[b]="function"==typeof this[b]?a._removedFactory(b):null;return!0};var G=a.st;for(var H in E)E[b](H)&&!G[b](H)&&(G[H]=function(a){return function(){var b=arguments;return this.forEach(function(c){c[a].apply(c,b)})}}(H))}(window.Raphael),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin,a.mixin.add(function(){window.multigraph.driver="raphael"})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Axis;b.hasA("axisElem"),b.hasA("gridElem"),b.hasA("tickmarkElem");var c=function(a,c){var d,e,f,g=a.currentLabeler(),h=a.perpOffset(),i=a.orientation(),j=c.plotBox(),k="";for(d=i===b.HORIZONTAL?j.height()-h:j.width()-h;g.hasNext();)f=g.next(),e=a.dataValueToAxisValue(f),k=i===b.HORIZONTAL?k+"M"+e+","+h+"L"+e+","+d:k+"M"+h+","+e+"L"+d+","+e;return k},d=function(a){return a.orientation()===b.HORIZONTAL?"M "+a.parallelOffset()+", "+a.perpOffset()+" l "+a.pixelLength()+", 0":"M "+a.perpOffset()+", "+a.parallelOffset()+" l 0, "+a.pixelLength()},e=function(b,c){var d=b.perpOffset();return b.orientation()===a.Axis.HORIZONTAL?"M"+c+","+(d+b.tickmax())+"L"+c+","+(d+b.tickmin()):"M"+(d+b.tickmin())+","+c+"L"+(d+b.tickmax())+","+c},f=function(a,b){var c=a.currentLabeler();a.prepareRender(b),a.currentLabeler()!==c&&void 0!==c&&(a.currentLabeler().elems(c.elems()),c.elems([]))};b.rspd("renderGrid",function(a,b,d){var e=b.text(100,100,"foo");if(f(this,e),this.hasDataMin()&&this.hasDataMax()&&this.grid().visible()&&this.labelers().size()>0&&this.currentLabelDensity()<=1.5){this.currentLabeler().prepare(this.dataMin(),this.dataMax());var g=b.path(c(this,a)).attr({"stroke-width":1,stroke:this.grid().color().getHexString("#")});this.gridElem(g),d.push(g)}e.remove()}),b.rspd("redrawGrid",function(a,b){var d=b.text(100,100,"foo");f(this,d),this.hasDataMin()&&this.hasDataMax()&&this.grid().visible()&&this.labelers().size()>0&&this.currentLabelDensity()<=1.5&&(this.currentLabeler().prepare(this.dataMin(),this.dataMax()),this.gridElem().attr("path",c(this,a))),d.remove()}),b.rspd("render",function(a,b,c){var f=b.text(100,100,"foo"),g=this.currentLabeler(),h=this.tickcolor(),i="",j=b.path(d(this)).attr("stroke",this.color().getHexString("#"));if(this.axisElem(j),c.push(j),this.hasDataMin()&&this.hasDataMax()&&g){var k,l;if(g.prepare(this.dataMin(),this.dataMax()),g.elems().length>0){var m,n;for(m=0,n=g.elems().length;n>m;m++)g.elems().pop().elem.remove()}for(;g.hasNext();)k=g.next(),l=this.dataValueToAxisValue(k),i+=e(this,l),g.renderLabel({paper:b,set:c,textElem:f},k);var o=b.path(i).attr("stroke",void 0!==h&&null!==h?h.getHexString("#"):"#000");this.tickmarkElem(o),c.push(o)}this.title()&&this.title().render(b,c),f.remove()}),b.rspd("redraw",function(a,b){var c=b.text(100,100,"foo"),f=this.currentLabeler(),g="";if(this.axisElem().attr("path",d(this)),this.hasDataMin()&&this.hasDataMax()&&f){var h,i,j=[];for(this.currentLabeler().prepare(this.dataMin(),this.dataMax());f.hasNext();)h=f.next(),i=this.dataValueToAxisValue(h),g+=e(this,i),j.push(h);f.redraw(a,b,j),this.tickmarkElem().attr("path",g)}this.title()&&this.title().redraw(),c.remove()})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.AxisTitle;b.hasA("previousBase"),b.hasA("elem");var c=function(b){var c=b.axis(),d=(b.base()+1)*(c.pixelLength()/2)+c.minoffset()+c.parallelOffset(),e=c.perpOffset(),f=window.multigraph.math.Point;return c.orientation()===a.Axis.HORIZONTAL?new f(d,e):new f(e,d)};b.rspd("render",function(a,b){var d,e,f=this.content(),g=this.anchor(),h=c(this);d=new window.multigraph.math.Point(.5*f.origWidth()*g.x(),.5*f.origHeight()*g.y()),this.previousBase(h),e=f.drawText(a,d,h,this.position(),this.angle()),this.elem(e),b.push(e)}),b.rspd("redraw",function(){var a=this.previousBase(),b=c(this),d=this.elem();if(b.x()===a.x()&&b.y()===a.y())return this;var e=b.x()-a.x(),f=b.y()-a.y(),g=d.attr("x"),h=d.attr("y");d.attr({x:g+e,y:h-f}),this.previousBase(b)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Background;b.hasA("elem"),b.rspd("render",function(a,b,c,d,e){var f=this.img(),g=a.window().margin().left()+a.window().border(),h=b.rect(g,g,d-2*g,e-2*g).attr({fill:this.color().getHexString("#"),stroke:"none"});this.elem(h),c.push(h),f&&void 0!==f.src()&&f.render(a,b,c,d,e)}),b.rspd("redraw",function(a,b,c){var d=a.window().margin().left()+2*a.window().border(),e=b-d,f=c-d,g=this.img(),h=this.elem();h.attr("width")!==e&&h.attr("width",e),h.attr("height")!==f&&h.attr("height",f),g&&void 0!==g.src()&&g.redraw(a)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){a.ConstantPlot.rspd("redraw",function(){var a=this.horizontalaxis(),b=this.renderer(),c=this.constantValue();a.hasDataMin()&&a.hasDataMax()&&(b.beginRedraw(),b.dataPoint([a.dataMin(),c]),b.dataPoint([a.dataMax(),c]),b.endRedraw())})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){a.DataPlot.rspd("redraw",function(){var a=this.data();if(a){var b=this.horizontalaxis();if(b.hasDataMin()&&b.hasDataMax()){var c,d=[];for(c=0;c<this.variable().size();++c)d.push(this.variable().at(c).id());var e,f=a.getIterator(d,b.dataMin(),b.dataMax(),1),g=this.renderer();for(g.beginRedraw();f.hasNext();)e=f.next(),g.dataPoint(e);g.endRedraw()}}})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Graph;b.hasA("transformString"),b.rspd("render",function(a,b,c){var d,e=a.set(),f=a.set(),g=a.set(),h=a.set(),i=a.set();for(this.transformString("S 1, -1, 0, "+c/2+" t "+this.x0()+", "+this.y0()),this.window().render(this,a,e,b,c),this.background().render(this,a,e,b,c),this.plotarea().render(this,a,e),d=0;d<this.axes().size();++d)this.axes().at(d).renderGrid(this,a,f);for(d=0;d<this.axes().size();++d)this.axes().at(d).render(this,a,f);for(d=0;d<this.plots().size();++d)this.plots().at(d).render(this,{paper:a,set:g});this.legend().render({paper:a,set:h}),this.title()&&this.title().render(a,i),this.transformSets(c,this.x0(),this.y0(),e,f,g,h,i)}),b.rspd("redraw",function(a,b,c){var d;for(this.window().redraw(b,c),this.background().redraw(this,b,c),this.plotarea().redraw(this),d=0;d<this.axes().size();++d)this.axes().at(d).redrawGrid(this,a);for(d=0;d<this.axes().size();++d)this.axes().at(d).redraw(this,a);for(d=0;d<this.plots().size();++d)this.plots().at(d).redraw();this.legend().redraw(),this.title()&&this.title().redraw()}),b.rspd("transformSets",function(a,b,c,d,e,f,g,h){var i;for(i=0;i<d.length;i++)"image"!==d[i].type&&d[i].transform("S 1, -1, 0, "+a/2);e.transform(this.transformString()+"..."),f.transform(this.transformString()),g.transform(this.transformString()+"..."),h.transform(this.transformString()+"..."),f.attr("clip-rect","1,1,"+(this.plotBox().width()-2)+","+(this.plotBox().height()-2))})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Title;b.hasA("borderElem"),b.hasA("backgroundElem"),b.hasA("textElem"),b.hasA("previousBase");var c=function(a){var b=a.graph(),c=a.base(),d=b.paddingBox(),e=b.plotBox(),f=b.plotarea().margin(),g=window.multigraph.math.Point;return"padding"===a.frame()?new g((c.x()+1)*(d.width()/2)-f.left(),(c.y()+1)*(d.height()/2)-f.bottom()):new g((c.x()+1)*(e.width()/2),(c.y()+1)*(e.height()/2))};b.rspd("render",function(a,b){var d,e,f=window.multigraph.math.Point,g=this.anchor(),h=this.border(),i=this.position(),j=this.padding(),k=this.text(),l=k.origWidth(),m=k.origHeight(),n=c(this);if(e=new f((.5*l+j+h)*(g.x()+1),(.5*m+j+h)*(g.y()+1)),d=k.computeTransform(e,n,i,0),this.previousBase(n),h>0){var o=a.rect(h/2,h/2,l+2*j+h,m+2*j+h).transform(d).attr({stroke:this.bordercolor().toRGBA(),"stroke-width":h});this.borderElem(o),b.push(o)}var p=a.rect(h,h,l+2*j,m+2*j).transform(d).attr({stroke:"none",fill:this.color().toRGBA(this.opacity())});this.backgroundElem(p),b.push(p);var q=new f(i.x()+h+j+l/2,i.y()+h+j+m/2),r=k.drawText(a,e,n,q,0).attr({"font-size":this.fontSize()});return this.textElem(r),b.push(r),this}),b.rspd("redraw",function(){var a=c(this),b=this.previousBase();if(a.x()===b.x()&&a.y()===b.y())return this;var d=this.textElem(),e=a.x()-b.x(),f=a.y()-b.y(),g=d.attr("x"),h=d.attr("y"),i="...t"+e+" "+f;return d.attr({x:g+e,y:h-f}),this.borderElem()&&this.borderElem().transform(i),this.backgroundElem().transform(i),this.previousBase(a),this})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){a.Icon.rspd("renderBorder",function(a,b,c){a.set.push(a.paper.rect(b,c,this.width(),this.height()).attr({stroke:"rgba(0, 0, 0, 1)"}))})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Img,c=function(a,c){var d,e,f=window.multigraph.math.util.interp,g=c.window(),h=c.plotarea(),i=a.base(),j=f(a.anchor().x(),-1,1,0,a.image().width),k=f(a.anchor().y(),1,-1,0,a.image().height),l=g.margin().left()+g.border(),m=g.margin().top()+g.border(),n=l+g.padding().left()+h.margin().left()+h.border(),o=m+g.padding().top()+h.margin().top()+h.border();return a.frame()===b.PLOT?(d=n+f(i.x(),-1,1,0,c.plotBox().width()),e=o+f(i.y(),1,-1,0,c.plotBox().height())):(d=l+f(i.x(),-1,1,0,c.paddingBox().width()),e=m+f(i.y(),1,-1,0,c.paddingBox().height())),{x:d+a.position().x()-j,y:e+a.position().y()-k}};b.hasA("image").dflt(function(){return new Image}),b.hasA("fetched").dflt(!1),b.hasA("elem"),b.rspd("render",function(a,b,d,e,f){var g=this.image(),h=this;if(this.fetched()){var i=c(this,a),j=b.image(this.src(),i.x,i.y,g.width,g.height);this.elem(j),d.push(j)}else g.onload=function(){h.fetched(!0),a.render(b,e,f)},g.src=this.src()}),b.rspd("redraw",function(a){if(this.fetched()){var b=c(this,a);this.elem().attr({x:b.x,y:b.y})}})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";
    a.mixin.add(function(a){var b=a.Labeler;b.hasA("elems").dflt(function(){return[]});var c=function(b,c){var d=b.dataValueToAxisValue(c),e=b.perpOffset();return b.orientation()===a.Axis.HORIZONTAL?{x:function(){return d},y:function(){return e}}:{x:function(){return e},y:function(){return d}}};b.rspd("measureStringWidth",function(b,c){return window.Raphael.svg?new a.Text(c).initializeGeometry({elem:b,angle:this.angle()}).rotatedWidth():(b.attr("text",c),b.W)}),b.rspd("measureStringHeight",function(b,c){return window.Raphael.svg?new a.Text(c).initializeGeometry({elem:b,angle:this.angle()}).rotatedHeight():(b.attr("text",c),b.H)}),b.rspd("renderLabel",function(b,d){var e,f,g=this.anchor(),h=(this.angle(),new a.Text(this.formatter().format(d))),i=c(this.axis(),d);h.initializeGeometry({elem:b.textElem,angle:this.angle()}),e=new window.multigraph.math.Point(.5*h.origWidth()*g.x(),.5*h.origHeight()*g.y()),f=h.drawText(b.paper,e,i,this.position(),this.angle()).attr("fill",this.color().getHexString("#")),this.elems().push({elem:f,base:i}),b.set.push(f)}),b.rspd("redraw",function(b,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=this.axis(),r=this.elems(),s=[],t=[];for(j=0;j<e.length;j++){for(i=!1,l=this.formatter().format(e[j]),k=0;k<r.length;k++)if(f=r[k].elem,l===f.attr("text")){g=c(q,e[j]),h=r[k].base,m=g.x()-h.x(),n=g.y()-h.y(),o=f.attr("x"),p=f.attr("y"),f.transform("t"+m+" "+n+"..."),r[k].base=g,s.push(r.splice(k,1)[0]),i=!0;break}i===!1&&t.push(e[j])}for(j=0;j<t.length;j++){l=new a.Text(this.formatter().format(t[j])),g=c(q,t[j]),r.length>0?(f=r.pop().elem,f.transform("").attr({text:l.string(),x:0,y:0})):f=d.text(0,0,l.string()).attr("fill",this.color().getHexString("#")),l.initializeGeometry({elem:f,angle:this.angle()});var u=.5*l.origWidth()*this.anchor().x(),v=.5*l.origHeight()*this.anchor().y(),w={x:function(){return u},y:function(){return v}},x=l.computeTransform(w,g,this.position(),this.angle());f.transform(b.transformString()+x),s.push({elem:f,base:g})}var y=r.length;for(j=0;y>j;j++)r.pop().elem.remove();this.elems(s)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Legend;b.hasA("previousX"),b.hasA("previousY"),b.hasA("set"),b.rspd("begin",function(){}),b.rspd("end",function(a){var b=a.set;b.transform("t"+this.x()+","+this.y()+"..."),this.set(b).previousX(this.x()).previousY(this.y())}),b.rspd("renderLegend",function(a){a.set.push(a.paper.rect(0,0,this.width(),this.height()).attr({stroke:this.bordercolor().toRGBA(),"stroke-width":this.border(),fill:this.color().toRGBA(this.opacity())}))}),b.rspd("renderLabel",function(a,b,c,d){b.set.push(b.paper.text(c,d,a.string()).attr({fill:"rgba(0, 0, 0, 1)","text-anchor":"start"}).transform("t0,"+this.maxLabelHeight()/2+"s1,-1"))}),b.rspd("redraw",function(){if(this.determineVisibility()===!1)return this;var a,b,c=this.plots(),d=this.x()-this.previousX(),e=this.y()-this.previousY(),f=0;for((0!==d||0!==e)&&(this.set().transform("...t"+d+" "+e),this.previousX(this.x()).previousY(this.y())),a=0;a<this.rows()&&!(f>=c.size());a++)for(b=0;b<this.columns()&&!(f>=c.size());b++)c.at(f).renderer().redrawLegendIcon(),f++;return this})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";var b=window.multigraph.jQuery;a.mixin.add(function(a){var c=a.Multigraph;c.hasA("paper"),c.hasA("$div"),c.hasA("width").isA("number"),c.hasA("height").isA("number"),c.hasA("baseX").isA("number"),c.hasA("baseY").isA("number"),c.hasA("mouseLastX").isA("number"),c.hasA("mouseLastY").isA("number"),a.Multigraph.rspd("redraw",function(){var a=this;window.requestAnimationFrame(function(){var b,c,d=a.paper().text(-8e3,-8e3,"foo"),e=a.graphs();for(b=0;b<e.size();b++)for(c=0;c<e.at(b).axes().size();c++)e.at(b).axes().at(c).computeAxisToDataRatio();for(b=0;b<e.size();b++)e.at(b).redraw(a.paper(),a.width(),a.height());d.remove()})}),a.Multigraph.rspd("init",function(){this.$div(b(this.div())),this.registerEvents(),this.width(this.$div().width()),this.height(this.$div().height()),this.initializeSurface(),this.busySpinner(b('<div style="position: absolute; left:5px; top:5px;"></div>').appendTo(this.$div()).busy_spinner()),this.render()}),a.Multigraph.rspd("render",function(){this.paper().clear();var a,b=this.paper().text(-8e3,-8e3,"foo");for(this.initializeGeometry(this.width(),this.height(),{elem:b}),a=0;a<this.graphs().size();++a)this.graphs().at(a).render(this.paper(),this.width(),this.height());b.remove()}),a.Multigraph.rspd("registerEvents",function(){this.$div().on("mousedown",{mg:this},this.setupEvents),this.registerTouchEvents(this.$div())}),a.Multigraph.rspd("setupEvents",function(a){a.preventDefault();var b=a.data.mg,c=b.$div();b.baseX(a.pageX-c.offset().left),b.baseY(c.height()-(a.pageY-c.offset().top)),b.mouseLastX(a.pageX-c.offset().left),b.mouseLastY(c.height()-(a.pageY-c.offset().top)),b.graphs().at(0).doDragReset(),b.$div().on("mousemove",{mg:b},b.triggerEvents),b.$div().on("mouseup",{mg:b},b.unbindEvents),b.$div().on("mouseleave",{mg:b},b.unbindEvents)}),a.Multigraph.rspd("triggerEvents",function(a){var b,c=a.data.mg,d=c.$div(),e=a.pageX-d.offset().left,f=d.height()-(a.pageY-d.offset().top),g=e-c.mouseLastX(),h=f-c.mouseLastY();for(c.mouseLastX(e),c.mouseLastY(f),b=0;b<c.graphs().size();++b)c.graphs().at(b).doDrag(c,c.baseX(),c.baseY(),g,h,a.shiftKey)}),a.Multigraph.rspd("unbindEvents",function(a){var b,c=a.data.mg,d=c.$div();for(d.off("mousemove",c.triggerEvents),d.off("mouseup",c.unbindEvents),d.off("mouseleave",c.unbindEvents),b=0;b<c.graphs().size();++b)c.graphs().at(b).doDragDone()}),a.Multigraph.rspd("resizeSurface",function(a,b){this.paper().setSize(a,b)}),a.Multigraph.rspd("initializeSurface",function(){this.paper()&&this.paper().remove(),this.paper(new window.Raphael(this.div(),this.width(),this.height()))})});var c=function(){window.multigraph.parser.mixin.apply(window.multigraph,"parseXML"),a.mixin.apply(window.multigraph.core),window.multigraph.normalizer.mixin.apply(window.multigraph.core),window.multigraph.events.draggable.mixin.apply(window.multigraph),window.multigraph.events.mouse.mixin.apply(window.multigraph),window.multigraph.events.touch.mixin.apply(window.multigraph)},d=function(a,b){var c=window.multigraph.core.Multigraph.parseXML(window.multigraph.parser.stringToJQueryXMLObj(a),b.mugl,b.messageHandler);return c.normalize(),c.div(b.div),window.multigraph.jQuery(b.div).css({cursor:"pointer","-webkit-touch-callout":"none","-webkit-user-select":"none","-khtml-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","-o-user-select":"none","user-select":"none"}),c.init(),c.registerCommonDataCallback(function(){c.redraw()}),c};window.multigraph.core.Multigraph.createRaphaelGraph=function(a){var e,f;try{c(a),e=b.ajax({url:a.mugl,dataType:"text"}),f=b.Deferred()}catch(g){a.messageHandler.error(g)}return e.done(function(b){try{var c=d(b,a);f.resolve(c)}catch(e){a.messageHandler.error(e)}}),f.promise()},window.multigraph.core.Multigraph.createRaphaelGraphFromString=function(a){var b;try{c(a),b=window.multigraph.jQuery.Deferred();var e=d(a.muglString,a);b.resolve(e)}catch(f){a.messageHandler.error(f)}return b.promise()}}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(){var a=window.multigraph.core.Plotarea;a.hasA("elem"),a.rspd("render",function(a,b,c){var d,e={},f=this.border();null!==this.color()&&(e.fill=this.color().getHexString("#")),f>0?(e["fill-opacity"]=0,e["stroke-opacity"]=1,e.stroke=this.bordercolor().getHexString("#"),e["stroke-width"]=f):e.stroke="none",d=b.rect(a.x0()-f/2,a.y0()-f/2,a.plotBox().width()+f,a.plotBox().height()+f).attr(e),d.insertAfter(c),this.elem(d),c.push(d)}),a.rspd("redraw",function(a){var b=this.border(),c=a.plotBox(),d=c.width()+b,e=c.height()+b,f=this.elem();f.attr("width")!==d&&f.attr("width",d),f.attr("height")!==e&&f.attr("height",e)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.BandRenderer;b.hasA("fillElem"),b.hasA("line1Elem"),b.hasA("line2Elem"),b.hasA("state"),b.rspd("begin",function(a){var b={paper:a.paper,set:a.set,run:[],fillPath:"",line1Path:"",line2Path:"",linecolor:this.getOptionValue("linecolor"),line1color:this.getOptionValue("line1color"),line2color:this.getOptionValue("line2color"),linewidth:this.getOptionValue("linewidth"),line1width:this.getOptionValue("line1width"),line2width:this.getOptionValue("line2width"),fillcolor:this.getOptionValue("fillcolor"),fillopacity:this.getOptionValue("fillopacity")};this.state(b)}),b.rspd("beginRedraw",function(){var a=this.state();a.run=[],a.fillPath="",a.line1Path="",a.line2Path=""}),b.rspd("dataPoint",function(a){var b=this.state();this.isMissing(a)?b.run.length>0&&(d(b),b.run=[]):b.run.push(this.transformPoint(a))}),b.rspd("end",function(){var a,b,c=this.state(),e=c.paper,f=c.set;c.run.length>0&&d(c);var g=e.path(c.fillPath).attr({fill:c.fillcolor.toRGBA(c.fillopacity),stroke:"none"});if(this.fillElem(g),f.push(g),a=c.line1width>=0?c.line1width:c.linewidth,""!==c.line1Path&&a>0){b=null!==c.line1color?c.line1color:c.linecolor;var h=e.path(c.line1Path).attr({"stroke-width":a,stroke:b.getHexString("#")});this.line1Elem(h),f.push(h)}if(a=c.line2width>=0?c.line2width:c.linewidth,""!==c.line2Path&&a>0){b=null!==c.line2color?c.line2color:c.linecolor;var i=e.path(c.line2Path).attr({"stroke-width":a,stroke:b.getHexString("#")});this.line2Elem(i),f.push(i)}}),b.rspd("endRedraw",function(){var a=this.state();a.run.length>0&&d(a),this.fillElem().attr("path",a.fillPath),this.line1Elem()&&this.line1Elem().attr("path",a.line1Path),this.line2Elem()&&this.line2Elem().attr("path",a.line2Path)});var c=function(a,b,c,d,e){var f;if(d=d>=0?d:e,d>0)for(a=a+"M"+b[0][0]+","+b[0][c],f=1;f<b.length;++f)a=a+"L"+b[f][0]+","+b[f][c];return a},d=function(a){var b,d=a.fillPath,e=a.line1Path,f=a.line2Path,g=a.run;for(d=d+"M"+g[0][0]+","+g[0][1],b=1;b<g.length;++b)d+="L"+g[b][0]+","+g[b][1];for(d=d+"L"+g[g.length-1][0]+","+g[g.length-1][2],b=g.length-1;b>=0;--b)d=d+"L"+g[b][0]+","+g[b][2];d+="Z",e=c(e,g,1,a.line1width,a.linewidth),f=c(f,g,2,a.line2width,a.linewidth),a.fillPath=d,a.line1Path=e,a.line2Path=f};b.rspd("renderLegendIcon",function(a,b,c,d){var e,f,g,h=this.state(),i=a.paper,j=a.set,k=d.width(),l=d.height(),m="M0,"+2*l/8+"L0,"+6*l/8+"L"+k+","+7*l/8+"L"+k+","+3*l/8+"L0,"+2*l/8;e=10>k||10>l?h.fillcolor.toRGBA():"#FFFFFF",j.push(i.rect(b,c,k,l).attr({fill:e,stroke:e})),f=h.line2width>=0?h.line2width:h.linewidth,g=null!==h.line2color?h.line2color:h.linecolor,j.push(i.path(m).attr({"stroke-width":f,stroke:g.toRGBA(),fill:h.fillcolor.toRGBA(h.fillopacity)}).transform("t"+b+","+c))}),b.rspd("redrawLegendIcon",function(){})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.BarRenderer;b.hasMany("barElems"),b.hasA("outlineElem"),b.hasA("iconGraphicElem"),b.hasA("settings"),b.rspd("begin",function(a){var b={paper:a.paper,set:a.set,paths:{},barwidth:this.getOptionValue("barwidth"),baroffset:this.getOptionValue("baroffset"),barbase:this.getOptionValue("barbase"),fillcolor:this.getOptionValue("fillcolor"),linecolor:this.getOptionValue("linecolor"),hidelines:this.getOptionValue("hidelines"),barGroups:[],currentBarGroup:null,prevCorner:null,pixelEdgeTolerance:1};b.barpixelwidth=b.barwidth.getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),b.barpixelbase=null!==b.barbase?this.plot().verticalaxis().dataValueToAxisValue(b.barbase):0;var c;for(c=0;c<this.options().fillcolor().size();c++)b.paths[this.options().fillcolor().at(c).value().getHexString("0x")]={fillcolor:this.options().fillcolor().at(c).value(),path:""};for(c=0;c<this.barElems().size();c++)this.barElems().pop();this.settings(b)}),b.rspd("beginRedraw",function(){var a=this.settings();a.barpixelwidth=a.barwidth.getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),a.barpixelbase=null!==a.barbase?this.plot().verticalaxis().dataValueToAxisValue(a.barbase):0,a.barGroups=[],a.currentBarGroup=null,a.prevCorner=null;var b;for(b=0;b<this.options().fillcolor().size();b++)a.paths[this.options().fillcolor().at(b).value().getHexString("0x")]={fillcolor:this.options().fillcolor().at(b).value(),path:""}}),b.rspd("dataPoint",function(a){if(!this.isMissing(a)){var b=this.settings(),c=this.transformPoint(a),e=c[0]+b.baroffset,f=c[0]+b.baroffset+b.barpixelwidth,g=this.getOptionValue("fillcolor",a[1]);b.paths[g.getHexString("0x")].path=b.paths[g.getHexString("0x")].path+d(e,b.barpixelbase,b.barpixelwidth,c[1]-b.barpixelbase),b.barpixelwidth>b.hidelines&&(null===b.prevCorner?b.currentBarGroup=[[e,c[1]]]:Math.abs(e-b.prevCorner[0])<=b.pixelEdgeTolerance?b.currentBarGroup.push([e,c[1]]):(b.currentBarGroup.push(b.prevCorner),b.barGroups.push(b.currentBarGroup),b.currentBarGroup=[[e,c[1]]]),b.prevCorner=[f,c[1]])}});var c=function(a){var b,c,d,e,f="",g=a.barpixelbase;for(c=0;c<a.barGroups.length;c++){if(b=a.barGroups[c],e=b.length,2>e)return;for(f=f+"M"+b[1][0]+","+b[0][1]+"L"+b[0][0]+","+b[0][1]+"L"+b[0][0]+","+g+"L"+b[1][0]+","+g,d=1;e-1>d;++d)f=f+"M"+b[d][0]+","+Math.min(b[d-1][1],b[d][1],g)+"L"+b[d][0]+","+Math.max(b[d-1][1],b[d][1],g)+"M"+b[d][0]+","+b[d][1]+"L"+b[d+1][0]+","+b[d][1]+"M"+b[d][0]+","+g+"L"+b[d+1][0]+","+g;f=f+"M"+b[e-1][0]+","+b[e-1][1]+"L"+b[e-1][0]+","+g}return f};b.rspd("end",function(){var a,b,d=this.settings(),e=d.paper,f=d.set;null!==d.prevCorner&&null!==d.currentBarGroup&&(d.currentBarGroup.push(d.prevCorner),d.barGroups.push(d.currentBarGroup));var g;for(g in d.paths)d.paths.hasOwnProperty(g)&&(a=e.path(d.paths[g].path).attr({fill:d.paths[g].fillcolor.getHexString("#"),stroke:"none"}),this.barElems().add(a),f.push(a));b=e.path(c(d)).attr({"stroke-width":1,stroke:d.linecolor.getHexString("#")}),this.outlineElem(b),f.push(b)}),b.rspd("endRedraw",function(){var a=this.settings();null!==a.prevCorner&&null!==a.currentBarGroup&&(a.currentBarGroup.push(a.prevCorner),a.barGroups.push(a.currentBarGroup));var b,d=0;for(b in a.paths)a.paths.hasOwnProperty(b)&&(this.barElems().at(d).attr("path",a.paths[b].path),d++);this.outlineElem().attr("path",c(a))});var d=function(a,b,c,d){return"M"+a+","+b+"L"+a+","+(b+d)+"L"+(a+c)+","+(b+d)+"L"+(a+c)+","+b+"Z"};b.rspd("renderLegendIcon",function(a,b,c,e){var f,g,h=this.settings(),i=a.paper,j=a.set,k=this.getOptionValue("fillcolor",0),l=this.getOptionValue("fillopacity",0),m=e.width(),n=e.height(),o="";j.push(i.rect(b,c,m,n).attr({stroke:"rgba(255, 255, 255, 1)",fill:"rgba(255, 255, 255, 1)"})),f={"stroke-width":1,fill:k.toRGBA(l)},f.stroke=h.barpixelwidth<h.hidelines?"none":this.getOptionValue("linecolor",0).toRGBA(l),g=m>20||n>20?m/6:m>10||n>10?m/4:m/4,m>20&&n>20&&(o=o+d(b+m/4-g/2,c,g,n/2)+d(b+m-m/4-g/2,c,g,n/3)),o+=d(b+m/2-g/2,c,g,n-n/4);var p=i.path(o).attr(f);this.iconGraphicElem(p),j.push(p)}),b.rspd("redrawLegendIcon",function(){var a,b=this.settings();a=b.barpixelwidth<b.hidelines?"none":this.getOptionValue("linecolor",0).toRGBA(this.getOptionValue("fillopacity",0)),this.iconGraphicElem().attr("stroke",a)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.FillRenderer;b.hasA("fillElem"),b.hasA("lineElem"),b.hasA("settings"),b.rspd("begin",function(a){var b={paper:a.paper,set:a.set,path:"",fillpath:"",previouspoint:null,first:!0,linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth"),fillcolor:this.getOptionValue("fillcolor"),downfillcolor:this.getOptionValue("downfillcolor"),fillopacity:this.getOptionValue("fillopacity"),fillbase:this.getOptionValue("fillbase")};b.fillpixelbase=null!==b.fillbase?this.plot().verticalaxis().dataValueToAxisValue(b.fillbase):0,this.settings(b)}),b.rspd("beginRedraw",function(){var a=this.settings();a.path="",a.fillpath="",a.previouspoint=null,a.first=!0,a.fillpixelbase=null!==a.fillbase?this.plot().verticalaxis().dataValueToAxisValue(a.fillbase):0}),b.rspd("dataPoint",function(a){var b,c=this.settings(),d=c.fillpath,e=c.path;return this.isMissing(a)?(null!==c.previouspoint&&(d=d+"L"+c.previouspoint[0]+","+c.fillpixelbase),c.first=!0,c.previouspoint=null,void(c.fillpath=d)):(b=this.transformPoint(a),c.first?(c.first=!1,d=d+"M"+b[0]+","+c.fillpixelbase+"L"+b[0]+","+b[1],c.linewidth>0&&(e=e+"M"+b[0]+","+b[1])):(d=d+"L"+b[0]+","+b[1],c.linewidth>0&&(e=e+"L"+b[0]+","+b[1])),c.fillpath=d,c.path=e,void(c.previouspoint=b))}),b.rspd("end",function(){var a=this.settings(),b=a.paper,c=a.set;null!==a.previouspoint&&(a.fillpath=a.fillpath+"L"+a.previouspoint[0]+","+a.fillpixelbase);var d=b.path(a.fillpath).attr({fill:a.fillcolor.toRGBA(a.fillopacity),stroke:"none"});if(this.fillElem(d),c.push(d),a.linewidth>0){var e=b.path(a.path).attr({stroke:a.linecolor.getHexString("#"),"stroke-width":a.linewidth});this.lineElem(e),c.push(e)}}),b.rspd("endRedraw",function(){var a=this.settings();null!==a.previouspoint&&(a.fillpath=a.fillpath+"L"+a.previouspoint[0]+","+a.fillpixelbase),this.fillElem().attr("path",a.fillpath),this.lineElem()&&this.lineElem().attr("path",a.path)}),b.rspd("renderLegendIcon",function(a,b,c,d){var e=this.settings(),f=a.paper,g=a.set,h=d.width(),i=d.height(),j={},k="M0,0";j.stroke="rgba(255, 255, 255, 1)",j.fill=10>h||10>i?e.fillcolor.toRGBA(e.fillopacity):"rgba(255, 255, 255, 1)",g.push(f.rect(b,c,h,i).attr(j)),(h>10||i>10)&&((h>20||i>20)&&(k=k+"L"+h/6+","+i/2+"L"+h/3+","+i/4),k=k+"L"+h/2+","+(i-i/4),(h>20||i>20)&&(k=k+"L"+(h-h/3)+","+i/4+"L"+(h-h/6)+","+i/2)),k=k+"L"+h+",0",g.push(f.path(k).attr({stroke:e.linecolor.toRGBA(e.fillopacity),"stroke-width":e.linewidth,fill:e.fillcolor.toRGBA(e.fillopacity)}).transform("t"+b+","+c))}),b.rspd("redrawLegendIcon",function(){})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.PointlineRenderer;b.hasA("lineElem"),b.hasA("pointsElem"),b.hasA("settings"),b.rspd("begin",function(b){var c={paper:b.paper,set:b.set,path:"",points:[],first:!0,pointshape:this.getOptionValue("pointshape"),pointcolor:this.getOptionValue("pointcolor"),pointopacity:this.getOptionValue("pointopacity"),pointsize:this.getOptionValue("pointsize"),pointoutlinewidth:this.getOptionValue("pointoutlinewidth"),pointoutlinecolor:this.getOptionValue("pointoutlinecolor"),linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth")};this.type()===a.Renderer.LINE&&(c.pointsize=0),this.type()===a.Renderer.POINT&&(c.linewidth=0),this.settings(c)}),b.rspd("beginRedraw",function(){var a=this.settings();a.path="",a.points=[],a.first=!0}),b.rspd("dataPoint",function(a){var b=this.settings();if(this.isMissing(a))return void(b.first=!0);var c=this.transformPoint(a);b.linewidth>0&&(b.first?(b.path=b.path+"M"+c[0]+","+c[1],b.first=!1):b.path=b.path+"L"+c[0]+","+c[1]),b.pointsize>0&&b.points.push(c)}),b.rspd("end",function(){var a=this.settings(),b=a.paper,d=a.set;if(a.linewidth>0){var f=b.path(a.path).attr({stroke:a.linecolor.getHexString("#"),"stroke-width":a.linewidth});this.lineElem(f),d.push(f)}if(a.pointsize>0){var g=b.path(c(a)).attr(e(a));this.pointsElem(g),d.push(g)}}),b.rspd("endRedraw",function(){var a=this.settings();this.lineElem()&&this.lineElem().attr("path",a.path),this.pointsElem()&&this.pointsElem().attr("path",c(a))});var c=function(a){var b,c=a.points,e=a.pointshape,f=a.pointsize,g="";for(b=0;b<c.length;++b)g+=d(e,f,c[b]);return g},d=function(a,c,d){var e,f,g,h;switch(a){case b.PLUS:e="M"+d[0]+","+(d[1]-c)+"L"+d[0]+","+(d[1]+c)+"M"+(d[0]-c)+","+d[1]+"L"+(d[0]+c)+","+d[1];break;case b.X:h=.7071*c,e="M"+(d[0]-h)+","+(d[1]-h)+"L"+(d[0]+h)+","+(d[1]+h)+"M"+(d[0]-h)+","+(d[1]+h)+"L"+(d[0]+h)+","+(d[1]-h);break;case b.TRIANGLE:h=1.5*c,f=.866025*h,g=.5*h,e="M"+d[0]+","+(d[1]+h)+"L"+(d[0]+f)+","+(d[1]-g)+"L"+(d[0]-f)+","+(d[1]-g)+"Z";break;case b.DIAMOND:h=1.5*c,e="M"+(d[0]-c)+","+d[1]+"L"+d[0]+","+(d[1]+h)+"L"+(d[0]+c)+","+d[1]+"L"+d[0]+","+(d[1]-h)+"Z";break;case b.STAR:h=1.5*c,e="M"+(d[0]-0*h)+","+(d[1]+1*h)+"L"+(d[0]+.3536*h)+","+(d[1]+.3536*h)+"L"+(d[0]+.9511*h)+","+(d[1]+.309*h)+"L"+(d[0]+.4455*h)+","+(d[1]-.227*h)+"L"+(d[0]+.5878*h)+","+(d[1]-.809*h)+"L"+(d[0]-.0782*h)+","+(d[1]-.4938*h)+"L"+(d[0]-.5878*h)+","+(d[1]-.809*h)+"L"+(d[0]-.4938*h)+","+(d[1]-.0782*h)+"L"+(d[0]-.9511*h)+","+(d[1]+.309*h)+"L"+(d[0]-.227*h)+","+(d[1]+.4455*h)+"Z";break;case b.SQUARE:e="M"+(d[0]-c)+","+(d[1]-c)+"L"+(d[0]+2*c)+","+(d[1]-c)+"L"+(d[0]+2*c)+","+(d[1]+2*c)+"L"+(d[0]-c)+","+(d[1]+2*c)+"Z";break;default:e="M"+d[0]+","+d[1]+"m0,"+-c+"a"+c+","+c+",0,1,1,0,"+2*c+"a"+c+","+c+",0,1,1,0,"+-2*c+"z"}return e},e=function(a){return a.pointshape===b.PLUS||a.pointshape===b.X?{stroke:a.pointcolor.getHexString("#"),"stroke-width":a.pointoutlinewidth}:{fill:a.pointcolor.toRGBA(a.pointopacity),stroke:a.pointoutlinecolor.getHexString("#"),"stroke-width":a.pointoutlinewidth}};b.rspd("renderLegendIcon",function(a,b,c,f){var g=this.settings(),h=a.paper,i=a.set,j=f.width(),k=f.height();if(i.push(h.rect(b,c,j,k).attr({stroke:"rgba(255, 255, 255, 1)",fill:"rgba(255, 255, 255, 1)"})),g.linewidth>0){var l="M"+b+","+(c+k/2)+"L"+(b+j)+","+(c+k/2);i.push(h.path(l).attr({stroke:g.linecolor.toRGBA(),"stroke-width":g.linewidth}))}g.pointsize>0&&i.push(h.path(d(g.pointshape,g.pointsize,[b+j/2,c+k/2])).attr(e(g)))}),b.rspd("redrawLegendIcon",function(){})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.RangeBarRenderer;b.hasA("elem"),b.hasA("iconGraphicElem"),b.hasA("state"),b.rspd("begin",function(a){var b={paper:a.paper,set:a.set,path:"",barwidth:this.getOptionValue("barwidth"),baroffset:this.getOptionValue("baroffset"),fillcolor:this.getOptionValue("fillcolor"),fillopacity:this.getOptionValue("fillopacity"),linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth"),hidelines:this.getOptionValue("hidelines")};b.barpixelwidth=b.barwidth.getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),b.barpixeloffset=b.barpixelwidth*b.baroffset,this.state(b)}),b.rspd("beginRedraw",function(){var a=this.state();a.path="",a.barpixelwidth=a.barwidth.getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),a.barpixeloffset=a.barpixelwidth*a.baroffset}),b.rspd("dataPoint",function(a){if(!this.isMissing(a)){var b=this.state(),c=this.transformPoint(a),d=c[0]-b.barpixeloffset,e=d+b.barpixelwidth;b.path=b.path+"M"+d+","+c[1]+"L"+d+","+c[2]+"L"+e+","+c[2]+"L"+e+","+c[1]+"Z"}}),b.rspd("end",function(){var a=this.state(),b=a.path,c={"fill-opacity":a.fillopacity,fill:a.fillcolor.getHexString("#"),stroke:"none"};a.linewidth>0&&a.barpixelwidth>a.hidelines&&(c.stroke=a.linecolor.getHexString("#"),c["stroke-width"]=a.linewidth);var d=a.paper.path(b).attr(c);this.elem(d),a.set.push(d)}),b.rspd("endRedraw",function(){var a=this.state(),b={path:a.path};a.linewidth>0&&a.barpixelwidth>a.hidelines?(b.stroke=a.linecolor.getHexString("#"),b["stroke-width"]=a.linewidth):(b.stroke="none",b["stroke-width"]=1),this.elem().attr(b)});var c=function(a,b,c,d){return"M"+a+","+b+"L"+a+","+(b+d)+"L"+(a+c)+","+(b+d)+"L"+(a+c)+","+b+"Z"};b.rspd("renderLegendIcon",function(a,b,d,e){var f=this.state(),g=a.paper,h=a.set,i=e.width(),j=e.height(),k="";h.push(g.rect(b,d,i,j).attr({stroke:"#FFFFFF",fill:"#FFFFFF"}));var l={fill:f.fillcolor.toRGBA(f.fillopacity),"stroke-width":f.linewidth};l.stroke=f.barpixelwidth<10?f.fillcolor.toRGBA(f.fillopacity):f.linecolor.getHexString("#");var m;m=i>20||j>20?i/6:i>10||j>10?i/4:i/4,i>20&&j>20&&(k=k+c(b+i/4-m/2,d+j/8,m,j/2)+c(b+i-i/4-m/2,d+j/4,m,j/3)),k+=c(b+i/2-m/2,d,m,j-j/4);var n=g.path(k).attr(l);return this.iconGraphicElem(n),h.push(n),this}),b.rspd("redrawLegendIcon",function(){var a,b=this.state();a=b.barpixelwidth<10?b.fillcolor.toRGBA(b.fillopacity):b.linecolor.getHexString("#"),this.iconGraphicElem().attr("stroke",a)})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Text;b.rspd("initializeGeometry",function(a){var b,c,d,e,f,g,h,i,j=a.elem;if(void 0!==a.fontSize&&(g=j.attr("font-size"),j.attr("font-size",a.fontSize)),i=j.attr("text"),j.attr("text",this.string()),h=j.transform(),j.transform(""),f=j.getBBox(),b=f.width,c=f.height,void 0!==a.angle){var k=a.angle/180*Math.PI,l=Math.abs(Math.sin(k)),m=Math.abs(Math.cos(k));d=m*b+l*c,e=l*b+m*c}else d=b,e=c;void 0!==a.fontSize&&j.attr("font-size",g),j.attr("text",i);var n;for(n=0;n<h.length;n++)h[n]=h[n].join(" ");return j.transform(h.join(" ")),this.origWidth(b),this.origHeight(c),this.rotatedWidth(d),this.rotatedHeight(e),this}),b.rspd("measureStringWidth",function(a){if(void 0===this.string())throw new Error("measureStringWidth requires the string attr to be set.");return a.attr("text",this.string()),a.getBBox().width}),b.rspd("measureStringHeight",function(a){if(void 0===this.string())throw new Error("measureStringHeight requires the string attr to be set.");return a.attr("text",this.string()),a.getBBox().height}),b.rspd("computeTransform",function(a,b,c,d){return"t"+b.x()+","+b.y()+"s1,-1t"+c.x()+","+-c.y()+"r"+-d+"t"+-a.x()+","+a.y()}),b.rspd("drawText",function(a,b,c,d,e){return a.text(0,0,this.string()).transform(this.computeTransform(b,c,d,e))})})}),window.multigraph.util.namespace("window.multigraph.graphics.raphael",function(a){"use strict";a.mixin.add(function(a){var b=a.Window;b.hasA("elem"),b.rspd("render",function(a,b,c,d,e){var f=this.margin().left(),g=b.rect(f,f,d-2*f,e-2*f).attr({fill:this.bordercolor().getHexString("#")});this.elem(g),c.push(g)}),b.rspd("redraw",function(a,b){var c=2*this.margin().left(),d=a-c,e=b-c,f=this.elem();f.attr("width")!==d&&f.attr("width",d),f.attr("height")!==e&&f.attr("height",e)})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin=new window.multigraph.core.Mixin,a.mixin.add(function(){window.multigraph.driver="canvas"})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Axis.rspd("renderGrid",function(b,c){if(this.prepareRender(c),this.hasDataMin()&&this.hasDataMax()&&this.grid().visible()&&this.labelers().size()>0&&this.currentLabelDensity()<=1.5){var d=this.currentLabeler(),e=this.perpOffset(),f=b.plotBox();for(d.prepare(this.dataMin(),this.dataMax()),c.beginPath();d.hasNext();){var g=d.next(),h=this.dataValueToAxisValue(g);this.orientation()===a.Axis.HORIZONTAL?(c.moveTo(h,e),c.lineTo(h,f.height()-e)):(c.moveTo(e,h),c.lineTo(f.width()-e,h))}c.strokeStyle=this.grid().color().getHexString("#"),c.stroke()}}),a.Axis.rspd("render",function(b,c){var d=this.parallelOffset(),e=this.perpOffset(),f=this.pixelLength(),g=this.currentLabeler(),h=this.orientation()===a.Axis.HORIZONTAL;if(this.linewidth()>0&&(c.beginPath(),h?(c.moveTo(d,e),c.lineTo(d+f,e)):(c.moveTo(e,d),c.lineTo(e,d+f)),c.strokeStyle=this.color().getHexString("#"),c.stroke()),this.hasDataMin()&&this.hasDataMax()&&g&&g.visible()){var i=this.tickwidth(),j=this.tickmin(),k=this.tickmax(),l=this.tickcolor();for(c.beginPath(),c.fillStyle="#000000",g.prepare(this.dataMin(),this.dataMax());g.hasNext();){var m=g.next(),n=this.dataValueToAxisValue(m);i>0&&(void 0!==l&&null!==l&&(c.strokeStyle=l.getHexString("#")),h?(c.moveTo(n,e+k),c.lineTo(n,e+j)):(c.moveTo(e+j,n),c.lineTo(e+k,n)),void 0!==l&&null!==l&&c.restore()),g.renderLabel(c,m)}c.stroke()}this.title()&&this.title().render(c)})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.AxisTitle.rspd("render",function(b){var c,d=window.multigraph.math.Point,e=this.axis(),f=this.content(),g=this.anchor(),h=e.perpOffset(),i=f.origHeight(),j=f.origWidth(),k=new d(.5*j*(g.x()+1),.5*i*(g.y()+1)),l=(this.base()+1)*(e.pixelLength()/2)+e.minoffset()+e.parallelOffset();c=e.orientation()===a.Axis.HORIZONTAL?new d(l,h):new d(h,l),b.save(),b.fillStyle="rgba(0, 0, 0, 1)",f.drawText(b,k,c,this.position(),this.angle()),b.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Background.rspd("render",function(a,b,c,d){var e=a.window().margin().left()+a.window().border(),f=this.img();b.save(),b.fillStyle=this.color().getHexString("#"),b.fillRect(e,e,c-2*e,d-2*e),b.restore(),f&&void 0!==f.src()&&f.render(a,b,c,d)})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.Graph;b.rspd("render",function(a,b,c){var d;for(this.window().render(a,b,c),this.background().render(this,a,b,c),a.transform(1,0,0,1,this.x0(),this.y0()),this.plotarea().render(this,a),d=0;d<this.axes().size();++d)this.axes().at(d).renderGrid(this,a);for(a.save(),a.rect(0,0,this.plotBox().width(),this.plotBox().height()),a.clip(),d=0;d<this.plots().size();++d)this.plots().at(d).render(this,a);for(a.restore(),d=0;d<this.axes().size();++d)this.axes().at(d).render(this,a);this.legend().render(a),this.title()&&this.title().render(a)})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Title.rspd("render",function(a){var b,c=window.multigraph.math.Point,d=this.graph(),e=this.border(),f=this.padding(),g=this.anchor(),h=this.base(),i=this.position(),j=this.text(),k=this.color().toRGBA(this.opacity()),l=d.paddingBox(),m=d.plotBox(),n=d.plotarea().margin(),o=j.origHeight(),p=j.origWidth(),q=new c((.5*p+f+e)*(g.x()+1),(.5*o+f+e)*(g.y()+1));b="padding"===this.frame()?new c((h.x()+1)*(l.width()/2)-n.left(),(h.y()+1)*(l.height()/2)-n.bottom()):new c((h.x()+1)*(m.width()/2),(h.y()+1)*(m.height()/2)),a.save(),j.setTransform(a,q,b,i,0),a.transform(1,0,0,-1,0,0),e>0&&(a.strokeStyle=this.bordercolor().toRGBA(),a.lineWidth=e,a.strokeRect(e/2,e/2,p+2*f+e,o+2*f+e)),a.fillStyle=k,a.fillRect(e,e,p+2*f,o+2*f),a.restore(),a.save();var r=new c(i.x()+e+f,i.y()+e+f);a.font=this.fontSize()+" sans-serif",a.fillStyle="rgba(0, 0, 0, 1)",j.drawText(a,q,b,r,0),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Icon.rspd("renderBorder",function(a,b,c){a.save(),a.strokeStyle="rgba(0, 0, 0, 1)",a.strokeRect(b,c,this.width(),this.height()),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(){var a=window.multigraph.core.Img;a.hasA("image").dflt(function(){return new Image}),a.hasA("fetched").dflt(!1),a.rspd("render",function(b,c,d,e){if(this.fetched()){var f,g,h,i,j=window.multigraph.math.util.interp,k=this.image(),l=b.window(),m=b.plotarea(),n=this.base(),o=j(this.anchor().x(),-1,1,0,k.width),p=j(this.anchor().y(),1,-1,0,k.height),q=l.margin().left()+l.border(),r=l.margin().top()+l.border(),s=q+l.padding().left()+m.margin().left()+m.border(),t=r+l.padding().top()+m.margin().top()+m.border();this.frame()===a.PLOT?(f=s+j(n.x(),-1,1,0,b.plotBox().width()),g=t+j(n.y(),1,-1,0,b.plotBox().height())):(f=q+j(n.x(),-1,1,0,b.paddingBox().width()),g=r+j(n.y(),1,-1,0,b.paddingBox().height())),h=f+this.position().x()-o,i=g+this.position().y()-p,c.save(),c.transform(1,0,0,-1,0,e),c.drawImage(k,h,i,k.width,k.height),c.restore()}else{var u=this;this.image().onload=function(){u.fetched(!0),c.save(),c.setTransform(1,0,0,-1,0,e),b.render(c,d,e),c.restore()},this.image().src=this.src()
}})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.Labeler;b.rspd("measureStringWidth",function(b,c){return new a.Text(c).initializeGeometry({context:b,angle:this.angle()}).rotatedWidth()}),b.rspd("measureStringHeight",function(b,c){return new a.Text(c).initializeGeometry({context:b,angle:this.angle()}).rotatedHeight()}),b.rspd("renderLabel",function(b,c){var d,e,f=window.multigraph.math.Point,g=this.axis(),h=this.anchor(),i=this.angle(),j=g.perpOffset(),k=g.dataValueToAxisValue(c),l=new a.Text(this.formatter().format(c));l.initializeGeometry({context:b,angle:i}),d=new f(.5*l.origWidth()*(h.x()+1),.5*l.origHeight()*(h.y()+1)),e=g.orientation()===a.Axis.HORIZONTAL?new f(k,j):new f(j,k),b.save(),b.fillStyle=this.color().getHexString("#"),l.drawText(b,d,e,this.position(),i),b.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.Legend;b.rspd("begin",function(a){a.save(),a.transform(1,0,0,1,this.x(),this.y())}),b.rspd("end",function(a){a.restore()}),b.rspd("renderLegend",function(a){var b=this.border();a.save(),b>0&&(a.strokeStyle=this.bordercolor().toRGBA(),a.strokeRect(b/2,b/2,this.width()-b/2,this.height()-b/2)),a.fillStyle=this.color().toRGBA(this.opacity()),a.fillRect(b,b,this.width()-2*b,this.height()-2*b),a.restore()}),b.rspd("renderLabel",function(a,b,c,d){b.save(),b.fillStyle="rgba(0, 0, 0, 1)",b.transform(1,0,0,-1,0,d+this.maxLabelHeight()/2-a.origHeight()/2),b.fillText(a.string(),c,0),b.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";var b=window.multigraph.jQuery;a.mixin.add(function(a){var c=a.Multigraph;c.hasA("canvas"),c.hasA("context"),c.hasA("width").isA("number"),c.hasA("height").isA("number"),c.rspd("redraw",function(){var a=this;window.requestAnimationFrame(function(){a.render()})}),c.rspd("init",function(){var a=b(this.div());this.width(a.width()),this.height(a.height()),this.width()>0&&this.height()>0&&(b('<canvas width="'+this.width()+'" height="'+this.height()+'"/>').appendTo(a),this.initializeSurface(),this.busySpinner(b('<div style="position:absolute;top:50%;left:50%;margin-top:-16px;margin-left:-16px"></div>').appendTo(a).busy_spinner())),this.render()}),c.rspd("render",function(){var a,b=this.context(),c=this.width(),d=this.height();for(b.setTransform(1,0,0,1,0,0),b.transform(1,0,0,-1,0,d),b.clearRect(0,0,c,d),this.initializeGeometry(c,d,{context:b}),a=0;a<this.graphs().size();++a)this.graphs().at(a).render(b,c,d)}),c.rspd("registerEvents",function(){var a=this.canvas();this.registerMouseEvents(a),this.registerTouchEvents(a)}),c.rspd("resizeSurface",function(a,b){var c=this.context().canvas;c.width=a,c.height=b}),c.rspd("initializeSurface",function(){this.canvas(window.multigraph.jQuery(this.div()).children("canvas")[0]),this.context(this.canvas().getContext("2d"))})});var c=function(b){var c=b.messageHandler.error;window.multigraph.parser.mixin.apply(window.multigraph,"parseXML"),a.mixin.apply(window.multigraph.core),window.multigraph.events.draggable.mixin.apply(window.multigraph,c),window.multigraph.events.mouse.mixin.apply(window.multigraph,c),window.multigraph.events.touch.mixin.apply(window.multigraph,c),window.multigraph.normalizer.mixin.apply(window.multigraph.core)},d=function(a,c){var d=window.multigraph.parser.stringToJQueryXMLObj(a),e=window.multigraph.core.Multigraph.parseXML(d,c.mugl,c.messageHandler);return e.normalize(),e.div(c.div),b(c.div).css("cursor","pointer"),e.init(),e.registerEvents(),e.registerCommonDataCallback(function(){e.redraw()}),e};window.multigraph.core.Multigraph.createCanvasGraph=function(a){var e,f;try{c(a),e=b.ajax({url:a.mugl,dataType:"text"}),f=b.Deferred()}catch(g){a.messageHandler.error(g)}return e.done(function(b){try{var c=d(b,a);f.resolve(c)}catch(e){a.messageHandler.error(e)}}),f.promise()},window.multigraph.core.Multigraph.createCanvasGraphFromString=function(a){var e;try{c(a),e=b.Deferred();var f=d(a.muglString,a);e.resolve(f)}catch(g){a.messageHandler.error(g)}return e.promise()}}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Plotarea.rspd("render",function(a,b){var c=a.plotBox(),d=this.border();null!==this.color()&&(b.save(),b.fillStyle=this.color().getHexString("#"),b.fillRect(0,0,c.width(),c.height()),b.restore()),d>0&&(b.save(),b.lineWidth=d,b.strokeStyle=this.bordercolor().getHexString("#"),b.strokeRect(-d/2,-d/2,c.width()+d,c.height()+d),b.restore())})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.BandRenderer;b.hasA("state"),b.rspd("begin",function(a){var b={context:a,run:[],linecolor:this.getOptionValue("linecolor"),line1color:this.getOptionValue("line1color"),line2color:this.getOptionValue("line2color"),linewidth:this.getOptionValue("linewidth"),line1width:this.getOptionValue("line1width"),line2width:this.getOptionValue("line2width"),fillcolor:this.getOptionValue("fillcolor"),fillopacity:this.getOptionValue("fillopacity")};this.state(b)}),b.rspd("dataPoint",function(a){var b=this.state();if(this.isMissing(a))b.run.length>0&&(this.renderRun(),b.run=[]);else{var c=this.transformPoint(a);b.run.push(c)}}),b.rspd("end",function(){var a=this.state();a.run.length>0&&this.renderRun()});var c=function(a,b,c,d,e,f,g){var h;if(f=f>=0?f:g,f>0){for(d=null!==d?d:e,a.save(),a.strokeStyle=d.getHexString("#"),a.lineWidth=f,a.beginPath(),a.moveTo(b[0][0],b[0][c]),h=1;h<b.length;++h)a.lineTo(b[h][0],b[h][c]);a.stroke(),a.restore()}};b.rspd("renderRun",function(){var a,b=this.state(),d=b.context,e=b.run;for(d.save(),d.globalAlpha=b.fillopacity,d.fillStyle=b.fillcolor.getHexString("#"),d.beginPath(),d.moveTo(e[0][0],e[0][1]),a=1;a<e.length;++a)d.lineTo(e[a][0],e[a][1]);for(d.lineTo(e[e.length-1][0],e[e.length-1][2]),a=e.length-1;a>=0;--a)d.lineTo(e[a][0],e[a][2]);d.fill(),d.restore(),c(d,e,1,b.line1color,b.linecolor,b.line1width,b.linewidth),c(d,e,2,b.line2color,b.linecolor,b.line2width,b.linewidth)}),b.rspd("renderLegendIcon",function(a,b,c,d){var e=this.state(),f=d.width(),g=d.height();a.save(),a.transform(1,0,0,1,b,c),a.save(),a.fillStyle=10>f||10>g?e.fillcolor.toRGBA():"#FFFFFF",a.fillRect(0,0,f,g),a.restore(),a.strokeStyle=null!==e.line2color?e.line2color:e.linecolor,a.lineWidth=e.line2width>=0?e.line2width:e.linewidth,a.fillStyle=e.fillcolor.toRGBA(e.fillopacity),a.beginPath(),a.moveTo(0,2*g/8),a.lineTo(0,6*g/8),a.lineTo(f,7*g/8),a.lineTo(f,3*g/8),a.lineTo(0,2*g/8),a.fill(),a.stroke(),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.BarRenderer;b.hasA("settings"),b.rspd("begin",function(a){var b={context:a,barpixelwidth:this.getOptionValue("barwidth").getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),baroffset:this.getOptionValue("baroffset"),barpixelbase:null!==this.getOptionValue("barbase")?this.plot().verticalaxis().dataValueToAxisValue(this.getOptionValue("barbase")):0,fillcolor:this.getOptionValue("fillcolor"),linecolor:this.getOptionValue("linecolor"),hidelines:this.getOptionValue("hidelines"),barGroups:[],currentBarGroup:null,prevCorner:null,pixelEdgeTolerance:1};this.settings(b)}),b.rspd("dataPoint",function(a){if(!this.isMissing(a)){var b=this.settings(),c=b.context,d=this.transformPoint(a),e=d[0]+b.baroffset,f=d[0]+b.baroffset+b.barpixelwidth;c.save(),c.fillStyle=this.getOptionValue("fillcolor",a[1]).getHexString("#"),c.fillRect(e,b.barpixelbase,b.barpixelwidth,d[1]-b.barpixelbase),c.restore(),b.barpixelwidth>b.hidelines&&(null===b.prevCorner?b.currentBarGroup=[[e,d[1]]]:Math.abs(e-b.prevCorner[0])<=b.pixelEdgeTolerance?b.currentBarGroup.push([e,d[1]]):(b.currentBarGroup.push(b.prevCorner),b.barGroups.push(b.currentBarGroup),b.currentBarGroup=[[e,d[1]]]),b.prevCorner=[f,d[1]])}}),b.rspd("end",function(){var a,b,c,d,e=this.settings(),f=e.context,g=e.barpixelbase,h=Math.max,i=Math.min;for(null!==e.prevCorner&&null!==e.currentBarGroup&&(e.currentBarGroup.push(e.prevCorner),e.barGroups.push(e.currentBarGroup)),f.save(),f.strokeStyle=e.linecolor.getHexString("#"),f.beginPath(),b=0;b<e.barGroups.length;b++){if(a=e.barGroups[b],d=a.length,2>d)return;for(f.moveTo(a[1][0],a[0][1]),f.lineTo(a[0][0],a[0][1]),f.lineTo(a[0][0],g),f.lineTo(a[1][0],g),c=1;d-1>c;++c)f.moveTo(a[c][0],i(a[c-1][1],a[c][1],g)),f.lineTo(a[c][0],h(a[c-1][1],a[c][1],g)),f.moveTo(a[c][0],a[c][1]),f.lineTo(a[c+1][0],a[c][1]),f.moveTo(a[c][0],g),f.lineTo(a[c+1][0],g);f.moveTo(a[d-1][0],a[d-1][1]),f.lineTo(a[d-1][0],g)}f.stroke(),f.restore()}),b.rspd("renderLegendIcon",function(a,b,c,d){var e=this.settings(),f=this.getOptionValue("fillcolor",0).toRGBA(this.getOptionValue("fillopacity",0));a.save(),a.transform(1,0,0,1,b,c),a.fillStyle="rgba(255, 255, 255, 1)",a.fillRect(0,0,d.width(),d.height()),a.lineWidth=1,a.fillStyle=f,a.strokeStyle=e.barpixelwidth<e.hidelines?f:this.getOptionValue("linecolor",0).toRGBA();var g,h=d.width(),i=d.height();g=h>20||i>20?h/6:h>10||i>10?h/4:h/4,h>20&&i>20&&(a.fillRect(h/4-g/2,0,g,i/2),a.strokeRect(h/4-g/2,0,g,i/2),a.fillRect(h-h/4-g/2,0,g,i/3),a.strokeRect(h-h/4-g/2,0,g,i/3)),a.fillRect(h/2-g/2,0,g,i-i/4),a.strokeRect(h/2-g/2,0,g,i-i/4),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";var b=window.multigraph.math.util;a.mixin.add(function(a){var c=a.FillRenderer;c.hasA("state"),c.rspd("begin",function(a){var b={context:a,run:[],previouspoint:null,linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth"),fillcolor:this.getOptionValue("fillcolor"),downfillcolor:this.getOptionValue("downfillcolor"),fillopacity:this.getOptionValue("fillopacity"),fillbase:this.getOptionValue("fillbase"),currentfillcolor:null};null===b.downfillcolor&&(b.downfillcolor=b.fillcolor),b.fillpixelbase=null!==b.fillbase?this.plot().verticalaxis().dataValueToAxisValue(b.fillbase):0,this.state(b),a.save(),a.fillStyle=b.fillcolor.getHexString("#")}),c.rspd("dataPoint",function(a){var c,d,e=this.state(),f=e.fillpixelbase;if(this.isMissing(a))return void(null!==e.previouspoint&&(e.run.push([e.previouspoint[0],f]),this.renderRun(),e.run=[],e.previouspoint=null));if(d=this.transformPoint(a),c=d[1]>=f?e.fillcolor:e.downfillcolor,0===e.run.length)e.run.push([d[0],f]);else if(!c.eq(e.currentfillcolor)){var g=b.safe_interp(f,e.previouspoint[1],d[1],e.previouspoint[0],d[0]);e.run.push([g,f]),e.run.push([g,f]),this.renderRun(),e.run=[],e.run.push([g,f]),e.run.push([g,f])}e.run.push(d),e.previouspoint=d,e.currentfillcolor=c}),c.rspd("end",function(){var a=this.state(),b=a.context;a.run.length>0&&(a.run.push([a.run[a.run.length-1][0],a.fillpixelbase]),this.renderRun()),b.restore()}),c.rspd("renderRun",function(){var a,b=this.state(),c=b.context;for(c.save(),c.globalAlpha=b.fillopacity,c.fillStyle=b.currentfillcolor.getHexString("#"),c.beginPath(),c.moveTo(b.run[0][0],b.run[0][1]),a=1;a<b.run.length;++a)c.lineTo(b.run[a][0],b.run[a][1]);for(c.fill(),c.restore(),c.save(),c.strokeStyle=b.linecolor.getHexString("#"),c.lineWidth=b.linewidth,c.beginPath(),c.moveTo(b.run[1][0],b.run[1][1]),a=2;a<b.run.length-1;++a)c.lineTo(b.run[a][0],b.run[a][1]);c.stroke(),c.restore()}),c.rspd("renderLegendIcon",function(a,b,c,d){var e=this.state(),f=d.width(),g=d.height();a.save(),a.transform(1,0,0,1,b,c),a.save(),a.fillStyle=10>f||10>g?e.fillcolor.toRGBA():"rgba(255, 255, 255, 1)",a.fillRect(0,0,f,g),a.restore(),a.strokeStyle=e.linecolor.toRGBA(),a.lineWidth=e.linewidth,a.fillStyle=e.fillcolor.toRGBA(e.fillopacity),a.beginPath(),a.moveTo(0,0),(f>10||g>10)&&((f>20||g>20)&&(a.lineTo(f/6,g/2),a.lineTo(f/3,g/4)),a.lineTo(f/2,g-g/4),(f>20||g>20)&&(a.lineTo(f-f/3,g/4),a.lineTo(f-f/6,g/2))),a.lineTo(f,0),a.stroke(),a.fill(),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.PointlineRenderer;b.hasA("settings"),b.rspd("begin",function(b){var c={context:b,points:[],first:!0,pointshape:this.getOptionValue("pointshape"),pointcolor:this.getOptionValue("pointcolor"),pointopacity:this.getOptionValue("pointopacity"),pointsize:this.getOptionValue("pointsize"),pointoutlinewidth:this.getOptionValue("pointoutlinewidth"),pointoutlinecolor:this.getOptionValue("pointoutlinecolor"),linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth")};this.type()===a.Renderer.LINE&&(c.pointsize=0),this.type()===a.Renderer.POINT&&(c.linewidth=0),this.settings(c),c.linewidth>0&&(b.save(),b.beginPath(),b.lineWidth=c.linewidth,b.strokeStyle=c.linecolor.getHexString("#"))}),b.rspd("dataPoint",function(a){var b,c=this.settings(),d=c.context;return this.isMissing(a)?void(c.first=!0):(b=this.transformPoint(a),c.linewidth>0&&(c.first?(d.moveTo(b[0],b[1]),c.first=!1):d.lineTo(b[0],b[1])),void(c.pointsize>0&&c.points.push(b)))}),b.rspd("end",function(){var a=this.settings(),b=a.context;a.linewidth>0&&(b.stroke(),b.restore()),a.pointsize>0&&this.drawPoints()}),b.rspd("drawPoints",function(){var a,c=this.settings(),d=c.context,e=c.points,f=c.pointshape;for(d.save(),d.beginPath(),f===b.PLUS||f===b.X?(d.strokeStyle=c.pointcolor.getHexString("#"),d.lineWidth=c.pointoutlinewidth):(d.fillStyle=c.pointcolor.toRGBA(c.pointopacity),d.strokeStyle=c.pointoutlinecolor.getHexString("#"),d.lineWidth=c.pointoutlinewidth),a=0;a<e.length;++a)this.drawPoint(d,c,e[a]);f!==b.PLUS&&f!==b.X&&d.fill(),d.stroke(),d.restore()}),b.rspd("drawPoint",function(a,c,d){var e,f,g,h=c.pointsize,i=d[0],j=d[1];switch(c.pointshape){case b.PLUS:return a.moveTo(i,j-h),a.lineTo(i,j+h),a.moveTo(i-h,j),void a.lineTo(i+h,j);case b.X:return g=.7071*h,a.moveTo(i-g,j-g),a.lineTo(i+g,j+g),a.moveTo(i-g,j+g),void a.lineTo(i+g,j-g);case b.SQUARE:return a.moveTo(i-h,j-h),a.lineTo(i+h,j-h),a.lineTo(i+h,j+h),void a.lineTo(i-h,j+h);case b.TRIANGLE:return g=1.5*h,e=.866025*g,f=.5*g,a.moveTo(i,j+g),a.lineTo(i+e,j-f),void a.lineTo(i-e,j-f);case b.DIAMOND:return g=1.5*h,a.moveTo(i-h,j),a.lineTo(i,j+g),a.lineTo(i+h,j),void a.lineTo(i,j-g);case b.STAR:return g=1.5*h,a.moveTo(i-0*g,j+1*g),a.lineTo(i+.3536*g,j+.3536*g),a.lineTo(i+.9511*g,j+.309*g),a.lineTo(i+.4455*g,j-.227*g),a.lineTo(i+.5878*g,j-.809*g),a.lineTo(i-.0782*g,j-.4938*g),a.lineTo(i-.5878*g,j-.809*g),a.lineTo(i-.4938*g,j-.0782*g),a.lineTo(i-.9511*g,j+.309*g),void a.lineTo(i-.227*g,j+.4455*g);case b.CIRCLE:return a.moveTo(i+h,j),void a.arc(i,j,h,0,2*Math.PI,!1)}}),b.rspd("renderLegendIcon",function(a,c,d,e){var f=this.settings(),g=f.pointshape,h=e.width(),i=e.height();a.save(),a.fillStyle="rgba(255, 255, 255, 1)",a.fillRect(c,d,h,i),f.linewidth>0&&(a.strokeStyle=f.linecolor.toRGBA(),a.lineWidth=f.linewidth,a.beginPath(),a.moveTo(c,d+i/2),a.lineTo(c+h,d+i/2),a.stroke()),f.pointsize>0&&(a.beginPath(),g===b.PLUS||g===b.X?(a.strokeStyle=f.pointcolor.toRGBA(),a.lineWidth=f.pointoutlinewidth):(a.fillStyle=f.pointcolor.toRGBA(f.pointopacity),a.strokeStyle=f.pointoutlinecolor.toRGBA(),a.lineWidth=f.pointoutlinewidth),this.drawPoint(a,f,[c+h/2,d+i/2]),g!==b.PLUS&&g!==b.X&&a.fill(),a.stroke()),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.RangeBarRenderer;b.hasA("state"),b.rspd("begin",function(a){var b={context:a,run:[],barpixelwidth:this.getOptionValue("barwidth").getRealValue()*this.plot().horizontalaxis().axisToDataRatio(),barpixeloffset:0,baroffset:this.getOptionValue("baroffset"),fillcolor:this.getOptionValue("fillcolor"),fillopacity:this.getOptionValue("fillopacity"),linecolor:this.getOptionValue("linecolor"),linewidth:this.getOptionValue("linewidth"),hidelines:this.getOptionValue("hidelines")};b.barpixeloffset=b.barpixelwidth*b.baroffset,this.state(b),a.save(),a.beginPath()}),b.rspd("dataPoint",function(a){if(!this.isMissing(a)){var b=this.state(),c=b.context,d=this.transformPoint(a),e=d[0]-b.barpixeloffset,f=e+b.barpixelwidth;c.moveTo(e,d[1]),c.lineTo(e,d[2]),c.lineTo(f,d[2]),c.lineTo(f,d[1]),c.lineTo(e,d[1])}}),b.rspd("end",function(){var a=this.state(),b=a.context;b.globalAlpha=a.fillopacity,b.fillStyle=a.fillcolor.getHexString("#"),b.fill(),a.linewidth>0&&a.barpixelwidth>a.hidelines&&(b.strokeStyle=a.linecolor.getHexString("#"),b.lineWidth=a.linewidth,b.stroke()),b.restore()}),b.rspd("renderLegendIcon",function(a,b,c,d){var e,f=this.state(),g=d.width(),h=d.height();a.save(),a.transform(1,0,0,1,b,c),a.save(),a.strokeStyle="#FFFFFF",a.fillStyle="#FFFFFF",a.fillRect(0,0,g,h),a.restore(),a.fillStyle=f.fillcolor.toRGBA(f.fillopacity),a.lineWidth=f.linewidth,a.strokeStyle=f.barpixelwidth<10?f.fillcolor.toRGBA(f.fillopacity):f.linecolor.getHexString("#"),e=g>20||h>20?g/6:g>10||h>10?g/4:g/4,g>20&&h>20&&(a.fillRect(g/4-e/2,h/8,e,h/2),a.strokeRect(g/4-e/2,h/8,e,h/2),a.fillRect(g-g/4-e/2,h/4,e,h/3),a.strokeRect(g-g/4-e/2,h/4,e,h/3)),a.fillRect(g/2-e/2,0,e,h-h/4),a.strokeRect(g/2-e/2,0,e,h-h/4),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){var b=a.Text;b.rspd("initializeGeometry",function(a){var b,c,d,e;if(a.context.save(),void 0!==a.fontSize&&(a.context.font=a.fontSize+" sans-serif"),b=this.measureStringWidth(a.context),c=this.measureStringHeight(a.context),a.context.restore(),void 0!==a.angle){var f=a.angle/180*Math.PI;d=Math.abs(Math.cos(f))*b+Math.abs(Math.sin(f))*c,e=Math.abs(Math.sin(f))*b+Math.abs(Math.cos(f))*c}else d=b,e=c;return this.origWidth(b),this.origHeight(c),this.rotatedWidth(d),this.rotatedHeight(e),this}),b.rspd("measureStringWidth",function(a){if(void 0===this.string())throw new Error("measureStringWidth requires the string attr to be set.");var b=a.measureText(this.string());return b.width}),b.rspd("measureStringHeight",function(a){if(void 0===this.string())throw new Error("measureStringHeight requires the string attr to be set.");var b=a.measureText("M"),c=this.string().match(/\n/g);return(null!==c?c.length+1:1)*b.width}),b.rspd("setTransform",function(a,b,c,d,e){a.transform(1,0,0,-1,0,2*c.y()),a.transform(1,0,0,1,c.x(),c.y()),a.transform(1,0,0,1,d.x(),-d.y()),a.rotate(-e*Math.PI/180),a.transform(1,0,0,1,-b.x(),b.y())}),b.rspd("drawText",function(a,b,c,d,e){a.save(),this.setTransform(a,b,c,d,e),a.fillText(this.string(),0,0),a.restore()})})}),window.multigraph.util.namespace("window.multigraph.graphics.canvas",function(a){"use strict";a.mixin.add(function(a){a.Window.rspd("render",function(a,b,c){var d=this.margin().left();a.save(),a.fillStyle=this.bordercolor().getHexString("#"),a.fillRect(d,d,b-2*d,c-2*d),a.restore()})})});
var MUGLTEMPLATES = {
    "data-30d-prcp": '<data><variables><variable column="0" id="30d-prcp-time" type="datetime"/><variable column="1" id="30d-prcp-prcp" missingvalue="-9000" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "data-drought-pdsi": '<data adapter="drought-pdsi"><variables><variable column="0" id="drought-pdsi-time" type="datetime"/><variable column="1" id="drought-pdsi-pdsi" type="number" missingvalue="-99" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "data-ndvi": '<data><variables><variable column="0" id="ndvi-time" type="datetime"/><variable column="1" id="ndvi-ndvi"/></variables><values>{{{values}}}</values></data>',
    "data-normal-30d-prcp": '<data><variables><variable column="0" id="normal-30d-prcp-time" type="datetime"/><variable column="1" id="normal-30d-prcp-prcp" missingvalue="-9000" missingop="le"/></variables><repeat period="1Y"/><values>{{{values}}}</values></data>',
    "data-normal-temp": '<data><variables><variable column="0" id="normal-temp-time" type="datetime"/><variable column="1" id="normal-temp-tmin" missingvalue="-9000" missingop="le"/><variable column="2" id="normal-temp-tmax" missingvalue="-9000" missingop="le"/></variables><repeat period="1Y"/><values>{{{values}}}</values></data>',
    "data-normal-ytd-prcp": '<data><variables><variable column="0" id="normal-ytd-prcp-time" type="datetime"/><variable column="1" id="normal-ytd-prcp-prcp" missingvalue="-9000" missingop="le"/></variables><repeat period="1Y"/><values>{{{values}}}</values></data>',
    "data-prcp": '<data><variables><variable column="0" id="prcp-time" type="datetime"/><variable column="1" id="prcp-prcp" missingvalue="-9000" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "data-snow": '<data><variables><variable column="0" id="snow-time" type="datetime"/><variable column="1" id="snow-snow" missingvalue="-9000" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "data-temp": '<data><variables><variable column="0" id="temp-time" type="datetime"/><variable column="1" id="temp-tmin" missingvalue="-9000" missingop="le"/><variable column="2" id="temp-tmax" missingvalue="-9000" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "data-ytd-prcp": '<data><variables><variable column="0" id="ytd-prcp-time" type="datetime"/><variable column="1" id="ytd-prcp-prcp" missingvalue="-9000" missingop="le"/></variables><values>{{{values}}}</values></data>',
    "mugl": '<mugl><background color="0xffffff"/><legend visible="false" border="0" base="0,1" anchor="0,1" rows="1" opacity="0.2"><icon border="0"/></legend><window margin="0" padding="5" border="1" bordercolor="0x000000"/><plotarea margintop="5" marginleft="{{{marginleft}}}" marginbottom="20" marginright="5"/><horizontalaxis id="time" type="datetime" min="{{{mindate}}}" max="{{{maxdate}}}" length="1" base="-1,-1" anchor="-1" tickmin="-5" tickmax="5"><labels start="0" anchor="0,0" position="0,-10"><label format="%Y" spacing="1000Y 500Y 200Y 100Y 50Y 20Y 10Y 5Y 2Y 1Y"/><label format="%Y-%M" spacing="6M 3M 2M 1M"/><label format="%Y-%M-%D" spacing="30D 20D 15D 10D 5D 2D 1D"/></labels><title></title><binding id="time-binding" min="1900" max="2000"/></horizontalaxis>{{{verticalaxes}}}{{{plots}}}{{{datas}}}</mugl>',
    "plot-30d-prcp": '<plot><legend label="30-Day Precipitation"/><horizontalaxis ref="time"><variable ref="30d-prcp-time"/></horizontalaxis><verticalaxis ref="30d-prcpmm"><variable ref="30d-prcp-prcp"/></verticalaxis><renderer type="fill"><option name="fillcolor" value="0xcc3333"/><option name="fillopacity" value="0.5"/></renderer></plot>',
    "plot-drought-pdsi": '<plot><legend label="Drought (PDSI)"/><horizontalaxis ref="time"><variable ref="drought-pdsi-time"/></horizontalaxis><verticalaxis ref="pdsi"><variable ref="drought-pdsi-pdsi"/></verticalaxis><renderer type="bar"><option name="linecolor" value="0x000000"/><option name="fillcolor" max="-4" value="0xfe9b00"/><!-- Extreme Drought --><option name="fillcolor" min="-4" max="-3" value="0xfece00"/><!-- Severe Drought --><option name="fillcolor" min="-3" max="-2" value="0xffff33"/><!-- Moderate Drought --><option name="fillcolor" min="-2" max="2" value="0xdddddd"/><!-- Near Normal --><option name="fillcolor" min="2" max="3" value="0x9cff89"/><!-- Unusually Moist --><option name="fillcolor" min="3" max="4" value="0x69cd52"/><!-- Very Moist --><option name="fillcolor" min="4" value="0x109a00"/><!-- Extremely Moist --><option name="barbase" value="0"/><option name="barwidth" value="1M"/><option name="baroffset" value="0"/><option name="hidelines" value="10"/></renderer></plot>',
    "plot-ndvi": '<plot><horizontalaxis ref="time"><variable ref="ndvi-time"/></horizontalaxis><verticalaxis ref="ndvi"><variable ref="ndvi-ndvi"/></verticalaxis><renderer type="pointline"><option name="linecolor" value="black"/><option name="pointcolor" value="blue"/><option name="pointsize" value="1.5"/></renderer></plot>',
    "plot-normal-30d-prcp": '<plot><legend label="Normal 30-Day Precipitation"/><horizontalaxis ref="time"><variable ref="normal-30d-prcp-time"/></horizontalaxis><verticalaxis ref="30d-prcpmm"><variable ref="normal-30d-prcp-prcp"/></verticalaxis><renderer type="line"><option name="linecolor" value="0x660000"/><option name="linewidth" value="2"/></renderer></plot>',
    "plot-normal-temp": '<plot><legend label="Normal Daily Max/Min Temperature"/><horizontalaxis ref="time"><variable ref="normal-temp-time"/></horizontalaxis><verticalaxis ref="tempc"><variable ref="normal-temp-tmin"/><variable ref="normal-temp-tmax"/></verticalaxis><renderer type="band"><option name="fillcolor" value="0x99ff99"/><option name="linewidth" value="0"/><option name="linecolor" value="0x99ff99"/></renderer></plot>',
    "plot-normal-ytd-prcp": '<plot><legend label="Normal YTD Precipitation"/><horizontalaxis ref="time"><variable ref="normal-ytd-prcp-time"/></horizontalaxis><verticalaxis ref="ytd-prcpmm"><variable ref="normal-ytd-prcp-prcp"/></verticalaxis><renderer type="line"><option name="linecolor" value="0x660000"/></renderer></plot>',
    "plot-prcp": '<plot><legend label="Precipitation"/><horizontalaxis ref="time"><variable ref="prcp-time"/></horizontalaxis><verticalaxis ref="prcpmm"><variable ref="prcp-prcp"/></verticalaxis><renderer type="bar"><option name="barwidth" value="20H"/><option name="baroffset" value="0.5"/><option name="fillcolor" value="0x00ff00"/></renderer></plot>',
    "plot-snow": '<plot><legend label="Snowfall"/><horizontalaxis ref="time"><variable ref="snow-time"/></horizontalaxis><verticalaxis ref="snowmm"><variable ref="snow-snow"/></verticalaxis><renderer type="bar"><option name="barwidth" value="20H"/><option name="baroffset" value="0.5"/><option name="fillcolor" value="0x00ffff"/></renderer></plot>',
    "plot-temp": '<plot><legend label="Daily Max/Min Temperature"/><horizontalaxis ref="time"><variable ref="temp-time"/></horizontalaxis><verticalaxis ref="tempc"><variable ref="temp-tmin"/><variable ref="temp-tmax"/></verticalaxis><renderer type="rangebar"><option name="fillcolor" value="0x0000cc"/><option name="barwidth" value="20H"/><option name="baroffset" value="0.5"/></renderer></plot>',
    "plot-ytd-prcp": '<plot><legend label="YTD Precipitation"/><horizontalaxis ref="time"><variable ref="ytd-prcp-time"/></horizontalaxis><verticalaxis ref="ytd-prcpmm"><variable ref="ytd-prcp-prcp"/></verticalaxis><renderer type="fill"><option name="fillcolor" value="0xcc3333"/><option name="fillopacity" value="0.5"/></renderer></plot>',
    "vertical-axis-30d-prcpmm": '<verticalaxis id="30d-prcpmm" min="0" max="200" length="1" position="{{{position}}},0"><labels format="%1d" start="0" spacing="1000 500 200 100 50 20 10 5 2 1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-27,0">30-Day Precipitation (mm)</title><pan allowed="no"/><zoom anchor="0"/><binding id="30d-prcp-binding" min="0" max="1"/></verticalaxis>',
    "vertical-axis-ndvi": '<verticalaxis id="ndvi" min="0" max="100" type="number" length="1" position="{{{position}}},0"><title angle="90" anchor="0,-1" position="-30 0">NDVI</title><binding id="ndvi-binding" min="0" max="1"/></verticalaxis>',
    "vertical-axis-pdsi": '<verticalaxis id="pdsi" type="number" min="-7" max="7" length="1" position="{{{position}}},0"><title angle="90" anchor="0,-1" position="-30,0">Palmer Drought Serverity</title><binding id="pdsi-binding" min="0" max="1"/></verticalaxis>',
    "vertical-axis-prcpmm": '<verticalaxis id="prcpmm" min="0" max="50" length="1" position="{{{position}}},0"><labels format="%1d" start="0" spacing="100 50 20 10 5 2 1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-27,0">Precipitation (mm)</title><pan allowed="no"/><zoom anchor="0"/><binding id="prcp-binding" min="0" max="1"/></verticalaxis>',
    "vertical-axis-snowmm": '<verticalaxis id="snowmm" min="0" max="10" length="1" position="{{{position}}},0"><labels format="%1d" start="0" spacing="100 50 20 10 5 2 1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-27,0">Snow (mm)</title><pan allowed="no"/><zoom anchor="0"/><binding id="snow-binding" min="0" max="1"/></verticalaxis>',
    "vertical-axis-temp": '<verticalaxis id="tempc" length="1" position="-1000,0"><labels format="%.1f" start="0" spacing="20 10 5 2 1 0.5 0.1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-27,0">Degrees C</title><binding id="temp-binding" min="0" max="100"/></verticalaxis><verticalaxis id="tempf" min="0" max="100" length="1" position="{{{position}}},0"><labels format="%1d" start="0" spacing="20 10 5 2 1 0.5 0.1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-30,0">Degrees F</title><zoom max="100" min="1"/><pan min="-50" max="141"/><binding id="temp-binding" min="32" max="212"/></verticalaxis>',
    "vertical-axis-ytd-prcp": '<verticalaxis id="ytd-prcpmm" length="1" position="-1000,0"><labels format="%1d" start="0" spacing="1000 500 200 100 50 20 10 5 2 1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-27,0">YTD Precipitation (mm)</title><binding id="ytd-prcp-binding" min="0" max="1000"/></verticalaxis><verticalaxis id="ytd-prcpin" min="0" max="60" length="1" position="{{{position}}},0"><labels format="%1d" start="0" spacing="1000 500 200 100 50 20 10 5 2 1" anchor="0,0" position="-15,0" angle="0" /><title angle="90" anchor="0,-1" position="-30,0">YTD Precipitation (in)</title><pan allowed="no"/><zoom anchor="0" max="250"/><binding id="ytd-prcp-binding" min="0" max="39.37"/></verticalaxis>'
};
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//
// Init
//
        $(function(){

            var oldIE = false;
            if ($('html').is('.ie6, .ie7, .ie8, .ie9')) {
                oldIE = true;
            }

            if (oldIE) {
                $('body').empty();
                alert("Climate Explorer does not support the browser you are using.  You appear to be using an old version of Internet Explorer.  Climate Explorer works best in Mozilla Firefox, Google Chrome, or Internet Explorer 10 or higher.");
                return;
            }

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
                dir : 'ceui',
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
                graphRemoved : function(id, type) {
                    pl.removeGraph({type: type, id : id.replace("GHCND:", "")});
                    updatePermalinkDisplay();
                },
                stationRemoved : function(removedId, remainingStations) {
                    pl.removeStation(removedId.replace("GHCND:", ""));
                    updatePermalinkDisplay();
                    if ( mL !== null ) {
                        mL.unselectPoint( removedId );
                        // update label for each remaining station
                        remainingStations.forEach( function( station, i ) {
                            mL.setLabel( station.id, i + 1 );
                        });
                    }
                },
                baseLayerSet : function(baseLayer) {
                    // TODO improve baselayer type translation
                    var baseLayerCode = "b_a";
                    if (baseLayer === ceui.IMAGERY_BASELAYER) {
                        baseLayerCode = "b_b";
                    } // else if (baseLayer === ceui.STREET_BASELAYER) // use street as default

                    mL.setBaseLayer(baseLayerCode);
                    pl.setBl(baseLayerCode);
                    updatePermalinkDisplay();
                }
            });

            var mL = null;
            function rememberML(x) {
                mL = x;
            }

            var MH = require( './utils/muglHelper.js' );
            var MuglHelper;

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

            var baseCsvSourceUrl;

            var requests = [
                $.get( TEMPLATE_LOCATION, function( template ) {
                    STATION_DETAIL_TEMPLATE = template;
                }),
                $.getJSON( APP_CONFIG_URL, function( config ) {
                    baseCsvSourceUrl = config.stationData.baseCsvSourceUrl;

                    // config muglhelper
                    MuglHelper = new MH.MuglHelper({
                        baseUrl: baseCsvSourceUrl,
                        normalsUrl: config.stationData.normalsCsvSourceUrl
                    });

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

            var $permalink = $( 'div.permLinkButt' ).permalink({ icon : false});

            var pl = Permalink(URL({url: window.location.toString()}));

            function updatePermalinkDisplay() {
                window.history.replaceState({}, "RDV", pl.toString());
                $permalink.permalink('url', pl.toString());
            }

            $.when.apply( $, requests ).done( function(){
                // get summary
                $.getJSON( baseCsvSourceUrl + 'summary.json', function( data ) {
                    DATA_SUMMARY = data;
                    doInit();
                });
            });

            function doInit() {
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
                    iconPath: 'img/',
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

                        // set base layer, if defined
                        if (pl.haveBl()) {
                            var bl = pl.getBl();
                            mL.setBaseLayer(bl);

                            // TODO improve baselayer type translation
                            // set the selector to the opposite of current base layer
                            var baseLayer = ceui.STREET_BASELAYER;
                            if (bl === "b_a" ) {
                                baseLayer = ceui.IMAGERY_BASELAYER;
                            }

                            ceui.setBaseLayerSelector(baseLayer);
                        }

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
            }

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
                var center = null, zoom = null, gp = null, tp = null, p = null, bl = null;
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
                if ('bl' in url.params) {
                    bl = url.params.bl;
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
                    'removeStation' : function(id) {
                        for ( var i = graphs.length - 1; i >= 0; i-- ) {
                            if (graphs[i].id === id) {
                                graphs.splice ( i, 1 );
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
                    },
                    'setBl': function(bl) {
                        url.params.bl = bl;
                    },
                    'haveBl': function() { return bl !== null;  },
                    'getBl': function() { return bl }
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

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_d6bd4c36.js","/")
},{"./utils/muglHelper.js":6,"./utils/stringUtil.js":7,"./utils/urlUtils.js":9,"IrXUsu":5,"buffer":2}],2:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        /*!
         * The buffer module from node.js, for the browser.
         *
         * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
         * @license  MIT
         */

        var base64 = require('base64-js')
        var ieee754 = require('ieee754')

        exports.Buffer = Buffer
        exports.SlowBuffer = Buffer
        exports.INSPECT_MAX_BYTES = 50
        Buffer.poolSize = 8192

        /**
         * If `Buffer._useTypedArrays`:
         *   === true    Use Uint8Array implementation (fastest)
         *   === false   Use Object implementation (compatible down to IE6)
         */
        Buffer._useTypedArrays = (function () {
            // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
            // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
            // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
            // because we need to be able to add all the node Buffer API methods. This is an issue
            // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
            try {
                var buf = new ArrayBuffer(0)
                var arr = new Uint8Array(buf)
                arr.foo = function () { return 42 }
                return 42 === arr.foo() &&
                    typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
            } catch (e) {
                return false
            }
        })()

        /**
         * Class: Buffer
         * =============
         *
         * The Buffer constructor returns instances of `Uint8Array` that are augmented
         * with function properties for all the node `Buffer` API functions. We use
         * `Uint8Array` so that square bracket notation works as expected -- it returns
         * a single octet.
         *
         * By augmenting the instances, we can avoid modifying the `Uint8Array`
         * prototype.
         */
        function Buffer (subject, encoding, noZero) {
            if (!(this instanceof Buffer))
                return new Buffer(subject, encoding, noZero)

            var type = typeof subject

            // Workaround: node's base64 implementation allows for non-padded strings
            // while base64-js does not.
            if (encoding === 'base64' && type === 'string') {
                subject = stringtrim(subject)
                while (subject.length % 4 !== 0) {
                    subject = subject + '='
                }
            }

            // Find the length
            var length
            if (type === 'number')
                length = coerce(subject)
            else if (type === 'string')
                length = Buffer.byteLength(subject, encoding)
            else if (type === 'object')
                length = coerce(subject.length) // assume that object is array-like
            else
                throw new Error('First argument needs to be a number, array or string.')

            var buf
            if (Buffer._useTypedArrays) {
                // Preferred: Return an augmented `Uint8Array` instance for best performance
                buf = Buffer._augment(new Uint8Array(length))
            } else {
                // Fallback: Return THIS instance of Buffer (created by `new`)
                buf = this
                buf.length = length
                buf._isBuffer = true
            }

            var i
            if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
                // Speed optimization -- use set if we're copying from a typed array
                buf._set(subject)
            } else if (isArrayish(subject)) {
                // Treat array-ish objects as a byte array
                for (i = 0; i < length; i++) {
                    if (Buffer.isBuffer(subject))
                        buf[i] = subject.readUInt8(i)
                    else
                        buf[i] = subject[i]
                }
            } else if (type === 'string') {
                buf.write(subject, 0, encoding)
            } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
                for (i = 0; i < length; i++) {
                    buf[i] = 0
                }
            }

            return buf
        }

// STATIC METHODS
// ==============

        Buffer.isEncoding = function (encoding) {
            switch (String(encoding).toLowerCase()) {
                case 'hex':
                case 'utf8':
                case 'utf-8':
                case 'ascii':
                case 'binary':
                case 'base64':
                case 'raw':
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    return true
                default:
                    return false
            }
        }

        Buffer.isBuffer = function (b) {
            return !!(b !== null && b !== undefined && b._isBuffer)
        }

        Buffer.byteLength = function (str, encoding) {
            var ret
            str = str + ''
            switch (encoding || 'utf8') {
                case 'hex':
                    ret = str.length / 2
                    break
                case 'utf8':
                case 'utf-8':
                    ret = utf8ToBytes(str).length
                    break
                case 'ascii':
                case 'binary':
                case 'raw':
                    ret = str.length
                    break
                case 'base64':
                    ret = base64ToBytes(str).length
                    break
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    ret = str.length * 2
                    break
                default:
                    throw new Error('Unknown encoding')
            }
            return ret
        }

        Buffer.concat = function (list, totalLength) {
            assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
                'list should be an Array.')

            if (list.length === 0) {
                return new Buffer(0)
            } else if (list.length === 1) {
                return list[0]
            }

            var i
            if (typeof totalLength !== 'number') {
                totalLength = 0
                for (i = 0; i < list.length; i++) {
                    totalLength += list[i].length
                }
            }

            var buf = new Buffer(totalLength)
            var pos = 0
            for (i = 0; i < list.length; i++) {
                var item = list[i]
                item.copy(buf, pos)
                pos += item.length
            }
            return buf
        }

// BUFFER INSTANCE METHODS
// =======================

        function _hexWrite (buf, string, offset, length) {
            offset = Number(offset) || 0
            var remaining = buf.length - offset
            if (!length) {
                length = remaining
            } else {
                length = Number(length)
                if (length > remaining) {
                    length = remaining
                }
            }

            // must be an even number of digits
            var strLen = string.length
            assert(strLen % 2 === 0, 'Invalid hex string')

            if (length > strLen / 2) {
                length = strLen / 2
            }
            for (var i = 0; i < length; i++) {
                var byte = parseInt(string.substr(i * 2, 2), 16)
                assert(!isNaN(byte), 'Invalid hex string')
                buf[offset + i] = byte
            }
            Buffer._charsWritten = i * 2
            return i
        }

        function _utf8Write (buf, string, offset, length) {
            var charsWritten = Buffer._charsWritten =
                blitBuffer(utf8ToBytes(string), buf, offset, length)
            return charsWritten
        }

        function _asciiWrite (buf, string, offset, length) {
            var charsWritten = Buffer._charsWritten =
                blitBuffer(asciiToBytes(string), buf, offset, length)
            return charsWritten
        }

        function _binaryWrite (buf, string, offset, length) {
            return _asciiWrite(buf, string, offset, length)
        }

        function _base64Write (buf, string, offset, length) {
            var charsWritten = Buffer._charsWritten =
                blitBuffer(base64ToBytes(string), buf, offset, length)
            return charsWritten
        }

        function _utf16leWrite (buf, string, offset, length) {
            var charsWritten = Buffer._charsWritten =
                blitBuffer(utf16leToBytes(string), buf, offset, length)
            return charsWritten
        }

        Buffer.prototype.write = function (string, offset, length, encoding) {
            // Support both (string, offset, length, encoding)
            // and the legacy (string, encoding, offset, length)
            if (isFinite(offset)) {
                if (!isFinite(length)) {
                    encoding = length
                    length = undefined
                }
            } else {  // legacy
                var swap = encoding
                encoding = offset
                offset = length
                length = swap
            }

            offset = Number(offset) || 0
            var remaining = this.length - offset
            if (!length) {
                length = remaining
            } else {
                length = Number(length)
                if (length > remaining) {
                    length = remaining
                }
            }
            encoding = String(encoding || 'utf8').toLowerCase()

            var ret
            switch (encoding) {
                case 'hex':
                    ret = _hexWrite(this, string, offset, length)
                    break
                case 'utf8':
                case 'utf-8':
                    ret = _utf8Write(this, string, offset, length)
                    break
                case 'ascii':
                    ret = _asciiWrite(this, string, offset, length)
                    break
                case 'binary':
                    ret = _binaryWrite(this, string, offset, length)
                    break
                case 'base64':
                    ret = _base64Write(this, string, offset, length)
                    break
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    ret = _utf16leWrite(this, string, offset, length)
                    break
                default:
                    throw new Error('Unknown encoding')
            }
            return ret
        }

        Buffer.prototype.toString = function (encoding, start, end) {
            var self = this

            encoding = String(encoding || 'utf8').toLowerCase()
            start = Number(start) || 0
            end = (end !== undefined)
                ? Number(end)
                : end = self.length

            // Fastpath empty strings
            if (end === start)
                return ''

            var ret
            switch (encoding) {
                case 'hex':
                    ret = _hexSlice(self, start, end)
                    break
                case 'utf8':
                case 'utf-8':
                    ret = _utf8Slice(self, start, end)
                    break
                case 'ascii':
                    ret = _asciiSlice(self, start, end)
                    break
                case 'binary':
                    ret = _binarySlice(self, start, end)
                    break
                case 'base64':
                    ret = _base64Slice(self, start, end)
                    break
                case 'ucs2':
                case 'ucs-2':
                case 'utf16le':
                case 'utf-16le':
                    ret = _utf16leSlice(self, start, end)
                    break
                default:
                    throw new Error('Unknown encoding')
            }
            return ret
        }

        Buffer.prototype.toJSON = function () {
            return {
                type: 'Buffer',
                data: Array.prototype.slice.call(this._arr || this, 0)
            }
        }

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
        Buffer.prototype.copy = function (target, target_start, start, end) {
            var source = this

            if (!start) start = 0
            if (!end && end !== 0) end = this.length
            if (!target_start) target_start = 0

            // Copy 0 bytes; we're done
            if (end === start) return
            if (target.length === 0 || source.length === 0) return

            // Fatal error conditions
            assert(end >= start, 'sourceEnd < sourceStart')
            assert(target_start >= 0 && target_start < target.length,
                'targetStart out of bounds')
            assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
            assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

            // Are we oob?
            if (end > this.length)
                end = this.length
            if (target.length - target_start < end - start)
                end = target.length - target_start + start

            var len = end - start

            if (len < 100 || !Buffer._useTypedArrays) {
                for (var i = 0; i < len; i++)
                    target[i + target_start] = this[i + start]
            } else {
                target._set(this.subarray(start, start + len), target_start)
            }
        }

        function _base64Slice (buf, start, end) {
            if (start === 0 && end === buf.length) {
                return base64.fromByteArray(buf)
            } else {
                return base64.fromByteArray(buf.slice(start, end))
            }
        }

        function _utf8Slice (buf, start, end) {
            var res = ''
            var tmp = ''
            end = Math.min(buf.length, end)

            for (var i = start; i < end; i++) {
                if (buf[i] <= 0x7F) {
                    res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
                    tmp = ''
                } else {
                    tmp += '%' + buf[i].toString(16)
                }
            }

            return res + decodeUtf8Char(tmp)
        }

        function _asciiSlice (buf, start, end) {
            var ret = ''
            end = Math.min(buf.length, end)

            for (var i = start; i < end; i++)
                ret += String.fromCharCode(buf[i])
            return ret
        }

        function _binarySlice (buf, start, end) {
            return _asciiSlice(buf, start, end)
        }

        function _hexSlice (buf, start, end) {
            var len = buf.length

            if (!start || start < 0) start = 0
            if (!end || end < 0 || end > len) end = len

            var out = ''
            for (var i = start; i < end; i++) {
                out += toHex(buf[i])
            }
            return out
        }

        function _utf16leSlice (buf, start, end) {
            var bytes = buf.slice(start, end)
            var res = ''
            for (var i = 0; i < bytes.length; i += 2) {
                res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
            }
            return res
        }

        Buffer.prototype.slice = function (start, end) {
            var len = this.length
            start = clamp(start, len, 0)
            end = clamp(end, len, len)

            if (Buffer._useTypedArrays) {
                return Buffer._augment(this.subarray(start, end))
            } else {
                var sliceLen = end - start
                var newBuf = new Buffer(sliceLen, undefined, true)
                for (var i = 0; i < sliceLen; i++) {
                    newBuf[i] = this[i + start]
                }
                return newBuf
            }
        }

// `get` will be removed in Node 0.13+
        Buffer.prototype.get = function (offset) {
            console.log('.get() is deprecated. Access using array indexes instead.')
            return this.readUInt8(offset)
        }

// `set` will be removed in Node 0.13+
        Buffer.prototype.set = function (v, offset) {
            console.log('.set() is deprecated. Access using array indexes instead.')
            return this.writeUInt8(v, offset)
        }

        Buffer.prototype.readUInt8 = function (offset, noAssert) {
            if (!noAssert) {
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset < this.length, 'Trying to read beyond buffer length')
            }

            if (offset >= this.length)
                return

            return this[offset]
        }

        function _readUInt16 (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
            }

            var len = buf.length
            if (offset >= len)
                return

            var val
            if (littleEndian) {
                val = buf[offset]
                if (offset + 1 < len)
                    val |= buf[offset + 1] << 8
            } else {
                val = buf[offset] << 8
                if (offset + 1 < len)
                    val |= buf[offset + 1]
            }
            return val
        }

        Buffer.prototype.readUInt16LE = function (offset, noAssert) {
            return _readUInt16(this, offset, true, noAssert)
        }

        Buffer.prototype.readUInt16BE = function (offset, noAssert) {
            return _readUInt16(this, offset, false, noAssert)
        }

        function _readUInt32 (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
            }

            var len = buf.length
            if (offset >= len)
                return

            var val
            if (littleEndian) {
                if (offset + 2 < len)
                    val = buf[offset + 2] << 16
                if (offset + 1 < len)
                    val |= buf[offset + 1] << 8
                val |= buf[offset]
                if (offset + 3 < len)
                    val = val + (buf[offset + 3] << 24 >>> 0)
            } else {
                if (offset + 1 < len)
                    val = buf[offset + 1] << 16
                if (offset + 2 < len)
                    val |= buf[offset + 2] << 8
                if (offset + 3 < len)
                    val |= buf[offset + 3]
                val = val + (buf[offset] << 24 >>> 0)
            }
            return val
        }

        Buffer.prototype.readUInt32LE = function (offset, noAssert) {
            return _readUInt32(this, offset, true, noAssert)
        }

        Buffer.prototype.readUInt32BE = function (offset, noAssert) {
            return _readUInt32(this, offset, false, noAssert)
        }

        Buffer.prototype.readInt8 = function (offset, noAssert) {
            if (!noAssert) {
                assert(offset !== undefined && offset !== null,
                    'missing offset')
                assert(offset < this.length, 'Trying to read beyond buffer length')
            }

            if (offset >= this.length)
                return

            var neg = this[offset] & 0x80
            if (neg)
                return (0xff - this[offset] + 1) * -1
            else
                return this[offset]
        }

        function _readInt16 (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
            }

            var len = buf.length
            if (offset >= len)
                return

            var val = _readUInt16(buf, offset, littleEndian, true)
            var neg = val & 0x8000
            if (neg)
                return (0xffff - val + 1) * -1
            else
                return val
        }

        Buffer.prototype.readInt16LE = function (offset, noAssert) {
            return _readInt16(this, offset, true, noAssert)
        }

        Buffer.prototype.readInt16BE = function (offset, noAssert) {
            return _readInt16(this, offset, false, noAssert)
        }

        function _readInt32 (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
            }

            var len = buf.length
            if (offset >= len)
                return

            var val = _readUInt32(buf, offset, littleEndian, true)
            var neg = val & 0x80000000
            if (neg)
                return (0xffffffff - val + 1) * -1
            else
                return val
        }

        Buffer.prototype.readInt32LE = function (offset, noAssert) {
            return _readInt32(this, offset, true, noAssert)
        }

        Buffer.prototype.readInt32BE = function (offset, noAssert) {
            return _readInt32(this, offset, false, noAssert)
        }

        function _readFloat (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
            }

            return ieee754.read(buf, offset, littleEndian, 23, 4)
        }

        Buffer.prototype.readFloatLE = function (offset, noAssert) {
            return _readFloat(this, offset, true, noAssert)
        }

        Buffer.prototype.readFloatBE = function (offset, noAssert) {
            return _readFloat(this, offset, false, noAssert)
        }

        function _readDouble (buf, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
            }

            return ieee754.read(buf, offset, littleEndian, 52, 8)
        }

        Buffer.prototype.readDoubleLE = function (offset, noAssert) {
            return _readDouble(this, offset, true, noAssert)
        }

        Buffer.prototype.readDoubleBE = function (offset, noAssert) {
            return _readDouble(this, offset, false, noAssert)
        }

        Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset < this.length, 'trying to write beyond buffer length')
                verifuint(value, 0xff)
            }

            if (offset >= this.length) return

            this[offset] = value
        }

        function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
                verifuint(value, 0xffff)
            }

            var len = buf.length
            if (offset >= len)
                return

            for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
                buf[offset + i] =
                    (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
                    (littleEndian ? i : 1 - i) * 8
            }
        }

        Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
            _writeUInt16(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
            _writeUInt16(this, value, offset, false, noAssert)
        }

        function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
                verifuint(value, 0xffffffff)
            }

            var len = buf.length
            if (offset >= len)
                return

            for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
                buf[offset + i] =
                    (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
            }
        }

        Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
            _writeUInt32(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
            _writeUInt32(this, value, offset, false, noAssert)
        }

        Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset < this.length, 'Trying to write beyond buffer length')
                verifsint(value, 0x7f, -0x80)
            }

            if (offset >= this.length)
                return

            if (value >= 0)
                this.writeUInt8(value, offset, noAssert)
            else
                this.writeUInt8(0xff + value + 1, offset, noAssert)
        }

        function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
                verifsint(value, 0x7fff, -0x8000)
            }

            var len = buf.length
            if (offset >= len)
                return

            if (value >= 0)
                _writeUInt16(buf, value, offset, littleEndian, noAssert)
            else
                _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
        }

        Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
            _writeInt16(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
            _writeInt16(this, value, offset, false, noAssert)
        }

        function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
                verifsint(value, 0x7fffffff, -0x80000000)
            }

            var len = buf.length
            if (offset >= len)
                return

            if (value >= 0)
                _writeUInt32(buf, value, offset, littleEndian, noAssert)
            else
                _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
        }

        Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
            _writeInt32(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
            _writeInt32(this, value, offset, false, noAssert)
        }

        function _writeFloat (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
                verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
            }

            var len = buf.length
            if (offset >= len)
                return

            ieee754.write(buf, value, offset, littleEndian, 23, 4)
        }

        Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
            _writeFloat(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
            _writeFloat(this, value, offset, false, noAssert)
        }

        function _writeDouble (buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
                assert(value !== undefined && value !== null, 'missing value')
                assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
                assert(offset !== undefined && offset !== null, 'missing offset')
                assert(offset + 7 < buf.length,
                    'Trying to write beyond buffer length')
                verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
            }

            var len = buf.length
            if (offset >= len)
                return

            ieee754.write(buf, value, offset, littleEndian, 52, 8)
        }

        Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
            _writeDouble(this, value, offset, true, noAssert)
        }

        Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
            _writeDouble(this, value, offset, false, noAssert)
        }

// fill(value, start=0, end=buffer.length)
        Buffer.prototype.fill = function (value, start, end) {
            if (!value) value = 0
            if (!start) start = 0
            if (!end) end = this.length

            if (typeof value === 'string') {
                value = value.charCodeAt(0)
            }

            assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
            assert(end >= start, 'end < start')

            // Fill 0 bytes; we're done
            if (end === start) return
            if (this.length === 0) return

            assert(start >= 0 && start < this.length, 'start out of bounds')
            assert(end >= 0 && end <= this.length, 'end out of bounds')

            for (var i = start; i < end; i++) {
                this[i] = value
            }
        }

        Buffer.prototype.inspect = function () {
            var out = []
            var len = this.length
            for (var i = 0; i < len; i++) {
                out[i] = toHex(this[i])
                if (i === exports.INSPECT_MAX_BYTES) {
                    out[i + 1] = '...'
                    break
                }
            }
            return '<Buffer ' + out.join(' ') + '>'
        }

        /**
         * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
         * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
         */
        Buffer.prototype.toArrayBuffer = function () {
            if (typeof Uint8Array !== 'undefined') {
                if (Buffer._useTypedArrays) {
                    return (new Buffer(this)).buffer
                } else {
                    var buf = new Uint8Array(this.length)
                    for (var i = 0, len = buf.length; i < len; i += 1)
                        buf[i] = this[i]
                    return buf.buffer
                }
            } else {
                throw new Error('Buffer.toArrayBuffer not supported in this browser')
            }
        }

// HELPER FUNCTIONS
// ================

        function stringtrim (str) {
            if (str.trim) return str.trim()
            return str.replace(/^\s+|\s+$/g, '')
        }

        var BP = Buffer.prototype

        /**
         * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
         */
        Buffer._augment = function (arr) {
            arr._isBuffer = true

            // save reference to original Uint8Array get/set methods before overwriting
            arr._get = arr.get
            arr._set = arr.set

            // deprecated, will be removed in node 0.13+
            arr.get = BP.get
            arr.set = BP.set

            arr.write = BP.write
            arr.toString = BP.toString
            arr.toLocaleString = BP.toString
            arr.toJSON = BP.toJSON
            arr.copy = BP.copy
            arr.slice = BP.slice
            arr.readUInt8 = BP.readUInt8
            arr.readUInt16LE = BP.readUInt16LE
            arr.readUInt16BE = BP.readUInt16BE
            arr.readUInt32LE = BP.readUInt32LE
            arr.readUInt32BE = BP.readUInt32BE
            arr.readInt8 = BP.readInt8
            arr.readInt16LE = BP.readInt16LE
            arr.readInt16BE = BP.readInt16BE
            arr.readInt32LE = BP.readInt32LE
            arr.readInt32BE = BP.readInt32BE
            arr.readFloatLE = BP.readFloatLE
            arr.readFloatBE = BP.readFloatBE
            arr.readDoubleLE = BP.readDoubleLE
            arr.readDoubleBE = BP.readDoubleBE
            arr.writeUInt8 = BP.writeUInt8
            arr.writeUInt16LE = BP.writeUInt16LE
            arr.writeUInt16BE = BP.writeUInt16BE
            arr.writeUInt32LE = BP.writeUInt32LE
            arr.writeUInt32BE = BP.writeUInt32BE
            arr.writeInt8 = BP.writeInt8
            arr.writeInt16LE = BP.writeInt16LE
            arr.writeInt16BE = BP.writeInt16BE
            arr.writeInt32LE = BP.writeInt32LE
            arr.writeInt32BE = BP.writeInt32BE
            arr.writeFloatLE = BP.writeFloatLE
            arr.writeFloatBE = BP.writeFloatBE
            arr.writeDoubleLE = BP.writeDoubleLE
            arr.writeDoubleBE = BP.writeDoubleBE
            arr.fill = BP.fill
            arr.inspect = BP.inspect
            arr.toArrayBuffer = BP.toArrayBuffer

            return arr
        }

// slice(start, end)
        function clamp (index, len, defaultValue) {
            if (typeof index !== 'number') return defaultValue
            index = ~~index;  // Coerce to integer.
            if (index >= len) return len
            if (index >= 0) return index
            index += len
            if (index >= 0) return index
            return 0
        }

        function coerce (length) {
            // Coerce length to a number (possibly NaN), round up
            // in case it's fractional (e.g. 123.456) then do a
            // double negate to coerce a NaN to 0. Easy, right?
            length = ~~Math.ceil(+length)
            return length < 0 ? 0 : length
        }

        function isArray (subject) {
            return (Array.isArray || function (subject) {
                return Object.prototype.toString.call(subject) === '[object Array]'
            })(subject)
        }

        function isArrayish (subject) {
            return isArray(subject) || Buffer.isBuffer(subject) ||
                subject && typeof subject === 'object' &&
                typeof subject.length === 'number'
        }

        function toHex (n) {
            if (n < 16) return '0' + n.toString(16)
            return n.toString(16)
        }

        function utf8ToBytes (str) {
            var byteArray = []
            for (var i = 0; i < str.length; i++) {
                var b = str.charCodeAt(i)
                if (b <= 0x7F)
                    byteArray.push(str.charCodeAt(i))
                else {
                    var start = i
                    if (b >= 0xD800 && b <= 0xDFFF) i++
                    var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
                    for (var j = 0; j < h.length; j++)
                        byteArray.push(parseInt(h[j], 16))
                }
            }
            return byteArray
        }

        function asciiToBytes (str) {
            var byteArray = []
            for (var i = 0; i < str.length; i++) {
                // Node's code seems to be doing this and not & 0x7F..
                byteArray.push(str.charCodeAt(i) & 0xFF)
            }
            return byteArray
        }

        function utf16leToBytes (str) {
            var c, hi, lo
            var byteArray = []
            for (var i = 0; i < str.length; i++) {
                c = str.charCodeAt(i)
                hi = c >> 8
                lo = c % 256
                byteArray.push(lo)
                byteArray.push(hi)
            }

            return byteArray
        }

        function base64ToBytes (str) {
            return base64.toByteArray(str)
        }

        function blitBuffer (src, dst, offset, length) {
            var pos
            for (var i = 0; i < length; i++) {
                if ((i + offset >= dst.length) || (i >= src.length))
                    break
                dst[i + offset] = src[i]
            }
            return i
        }

        function decodeUtf8Char (str) {
            try {
                return decodeURIComponent(str)
            } catch (err) {
                return String.fromCharCode(0xFFFD) // UTF 8 invalid char
            }
        }

        /*
         * We have to make sure that the value is a valid integer. This means that it
         * is non-negative. It has no fractional component and that it does not
         * exceed the maximum allowed value.
         */
        function verifuint (value, max) {
            assert(typeof value === 'number', 'cannot write a non-number as a number')
            assert(value >= 0, 'specified a negative value for writing an unsigned value')
            assert(value <= max, 'value is larger than maximum value for type')
            assert(Math.floor(value) === value, 'value has a fractional component')
        }

        function verifsint (value, max, min) {
            assert(typeof value === 'number', 'cannot write a non-number as a number')
            assert(value <= max, 'value larger than maximum allowed value')
            assert(value >= min, 'value smaller than minimum allowed value')
            assert(Math.floor(value) === value, 'value has a fractional component')
        }

        function verifIEEE754 (value, max, min) {
            assert(typeof value === 'number', 'cannot write a non-number as a number')
            assert(value <= max, 'value larger than maximum allowed value')
            assert(value >= min, 'value smaller than minimum allowed value')
        }

        function assert (test, message) {
            if (!test) throw new Error(message || 'Failed assertion')
        }

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer")
},{"IrXUsu":5,"base64-js":3,"buffer":2,"ieee754":4}],3:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

        ;(function (exports) {
            'use strict';

            var Arr = (typeof Uint8Array !== 'undefined')
                ? Uint8Array
                : Array

            var PLUS   = '+'.charCodeAt(0)
            var SLASH  = '/'.charCodeAt(0)
            var NUMBER = '0'.charCodeAt(0)
            var LOWER  = 'a'.charCodeAt(0)
            var UPPER  = 'A'.charCodeAt(0)
            var PLUS_URL_SAFE = '-'.charCodeAt(0)
            var SLASH_URL_SAFE = '_'.charCodeAt(0)

            function decode (elt) {
                var code = elt.charCodeAt(0)
                if (code === PLUS ||
                    code === PLUS_URL_SAFE)
                    return 62 // '+'
                if (code === SLASH ||
                    code === SLASH_URL_SAFE)
                    return 63 // '/'
                if (code < NUMBER)
                    return -1 //no match
                if (code < NUMBER + 10)
                    return code - NUMBER + 26 + 26
                if (code < UPPER + 26)
                    return code - UPPER
                if (code < LOWER + 26)
                    return code - LOWER + 26
            }

            function b64ToByteArray (b64) {
                var i, j, l, tmp, placeHolders, arr

                if (b64.length % 4 > 0) {
                    throw new Error('Invalid string. Length must be a multiple of 4')
                }

                // the number of equal signs (place holders)
                // if there are two placeholders, than the two characters before it
                // represent one byte
                // if there is only one, then the three characters before it represent 2 bytes
                // this is just a cheap hack to not do indexOf twice
                var len = b64.length
                placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

                // base64 is 4/3 + up to two characters of the original data
                arr = new Arr(b64.length * 3 / 4 - placeHolders)

                // if there are placeholders, only get up to the last complete 4 chars
                l = placeHolders > 0 ? b64.length - 4 : b64.length

                var L = 0

                function push (v) {
                    arr[L++] = v
                }

                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
                    push((tmp & 0xFF0000) >> 16)
                    push((tmp & 0xFF00) >> 8)
                    push(tmp & 0xFF)
                }

                if (placeHolders === 2) {
                    tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
                    push(tmp & 0xFF)
                } else if (placeHolders === 1) {
                    tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
                    push((tmp >> 8) & 0xFF)
                    push(tmp & 0xFF)
                }

                return arr
            }

            function uint8ToBase64 (uint8) {
                var i,
                    extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
                    output = "",
                    temp, length

                function encode (num) {
                    return lookup.charAt(num)
                }

                function tripletToBase64 (num) {
                    return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
                }

                // go through the array every three bytes, we'll deal with trailing stuff later
                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
                    output += tripletToBase64(temp)
                }

                // pad the end with zeros, but make sure to not forget the extra bytes
                switch (extraBytes) {
                    case 1:
                        temp = uint8[uint8.length - 1]
                        output += encode(temp >> 2)
                        output += encode((temp << 4) & 0x3F)
                        output += '=='
                        break
                    case 2:
                        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
                        output += encode(temp >> 10)
                        output += encode((temp >> 4) & 0x3F)
                        output += encode((temp << 2) & 0x3F)
                        output += '='
                        break
                }

                return output
            }

            exports.toByteArray = b64ToByteArray
            exports.fromByteArray = uint8ToBase64
        }(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib")
},{"IrXUsu":5,"buffer":2}],4:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        exports.read = function (buffer, offset, isLE, mLen, nBytes) {
            var e, m,
                eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                nBits = -7,
                i = isLE ? (nBytes - 1) : 0,
                d = isLE ? -1 : 1,
                s = buffer[offset + i]

            i += d

            e = s & ((1 << (-nBits)) - 1)
            s >>= (-nBits)
            nBits += eLen
            for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

            m = e & ((1 << (-nBits)) - 1)
            e >>= (-nBits)
            nBits += mLen
            for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

            if (e === 0) {
                e = 1 - eBias
            } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity)
            } else {
                m = m + Math.pow(2, mLen)
                e = e - eBias
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
        }

        exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
            var e, m, c,
                eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
                i = isLE ? 0 : (nBytes - 1),
                d = isLE ? 1 : -1,
                s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

            value = Math.abs(value)

            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0
                e = eMax
            } else {
                e = Math.floor(Math.log(value) / Math.LN2)
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--
                    c *= 2
                }
                if (e + eBias >= 1) {
                    value += rt / c
                } else {
                    value += rt * Math.pow(2, 1 - eBias)
                }
                if (value * c >= 2) {
                    e++
                    c /= 2
                }

                if (e + eBias >= eMax) {
                    m = 0
                    e = eMax
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen)
                    e = e + eBias
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
                    e = 0
                }
            }

            for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

            e = (e << mLen) | m
            eLen += mLen
            for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

            buffer[offset + i - d] |= s * 128
        }

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754")
},{"IrXUsu":5,"buffer":2}],5:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

        var process = module.exports = {};

        process.nextTick = (function () {
            var canSetImmediate = typeof window !== 'undefined'
                && window.setImmediate;
            var canPost = typeof window !== 'undefined'
                    && window.postMessage && window.addEventListener
                ;

            if (canSetImmediate) {
                return function (f) { return window.setImmediate(f) };
            }

            if (canPost) {
                var queue = [];
                window.addEventListener('message', function (ev) {
                    var source = ev.source;
                    if ((source === window || source === null) && ev.data === 'process-tick') {
                        ev.stopPropagation();
                        if (queue.length > 0) {
                            var fn = queue.shift();
                            fn();
                        }
                    }
                }, true);

                return function nextTick(fn) {
                    queue.push(fn);
                    window.postMessage('process-tick', '*');
                };
            }

            return function nextTick(fn) {
                setTimeout(fn, 0);
            };
        })();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        }

// TODO(shtylman)
        process.cwd = function () { return '/' };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js","/node_modules/gulp-browserify/node_modules/browserify/node_modules/process")
},{"IrXUsu":5,"buffer":2}],6:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        var Transformer = require( './transformer.js' );

        function MuglHelper( options ) {
            this.options = options;
        }

        MuglHelper.prototype.getDataRequests = function ( type, id ) {
            var payload = {
                requests: [],
                data: []
            };

            if ( type === 'TEMP' ) {
                payload.requests.push(
                    $.get(this.options.baseUrl + id + '/TMIN.csv.gz')
                        .success( function( lines ){
                            payload.data['TMIN'] = lines;
                        }));

                payload.requests.push(
                    $.get(this.options.normalsUrl + 'TMIN/' + id + '.csv.gz')
                        .success( function( lines ){
                            payload.data['TMIN_NORMAL'] = lines;
                        }));

                payload.requests.push(
                    $.get(this.options.baseUrl + id + '/TMAX.csv.gz')
                        .success( function( lines ){
                            payload.data['TMAX'] = lines;
                        }));

                payload.requests.push(
                    $.get(this.options.normalsUrl + 'TMAX/' + id + '.csv.gz')
                        .success( function( lines ){
                            payload.data['TMAX_NORMAL'] = lines;
                        }));

            } else {
                payload.requests.push(
                    $.get(this.options.baseUrl + id + '/' + type + '.csv.gz')
                        .success( function( lines ){
                            payload.data[type] = lines;
                        }));

                payload.requests.push(
                    $.get(this.options.normalsUrl + type + '/' + id + '.csv.gz')
                        .success( function( lines ){
                            payload.data[type + '_NORMAL'] = lines;
                        }));
            }

            return payload;
        };

        MuglHelper.prototype.buildMugl = function( data, type, summary, templates ) {
            var d = new Date();
            var max = $.datepicker.formatDate( 'yymmdd', d );
            d.setFullYear( d.getFullYear() -1 );
            var min = $.datepicker.formatDate( 'yymmdd', d );

            return Mustache.render(templates['mugl'], {
                marginleft: 40,
                mindate: min,
                maxdate: max,
                verticalaxes: this.buildVerticalAxisSection( type, 0, templates ),
                plots: this.buildPlotSection( type, templates ),
                datas: this.buildDataSection( type, data, templates )
            });
        };

        MuglHelper.prototype.buildVerticalAxisSection = function( type, position, templates ) {
            var template;
            switch ( type ) {
                case 'TEMP' :
                    template = templates['vertical-axis-temp'];
                    break;
                case 'PRCP_YTD' :
                    template = templates['vertical-axis-ytd-prcp'];
                    break;
            }

            return Mustache.render( template, {
                position: position
            });

        };

        MuglHelper.prototype.buildPlotSection = function( type, templates ) {
            var plots = [];
            switch ( type ) {
                case 'TEMP' :
                    plots.push( Mustache.render( templates['plot-normal-temp'] ) );
                    plots.push( Mustache.render( templates['plot-temp'] ) );
                    break;
                case 'PRCP_YTD' :
                    plots.push( Mustache.render( templates['plot-normal-ytd-prcp'] ) );
                    plots.push( Mustache.render( templates['plot-ytd-prcp'] ) );
                    break;
            }

            return plots.join( '' );
        };

        MuglHelper.prototype.buildDataSection = function( type, payload, templates ) {
            var normals = [];
            var normalTemplate;
            var data = [];
            var dataTemplate;

            if ( type === 'TEMP' ) {
                // normals        
                normals = Transformer.mergeCSV(
                    payload['TMIN_NORMAL'],
                    payload['TMAX_NORMAL'],
                    Transformer.transformations[type + '_NORMAL'] );

                normalTemplate = templates['data-normal-temp'];

                // data
                data = Transformer.mergeCSV(
                    payload['TMIN'],
                    payload['TMAX'],
                    Transformer.transformations[type] );

                dataTemplate = templates['data-temp'];

            } else {
                // normals
                normals = Transformer.transformCSV(
                    payload[type + '_NORMAL'],
                    Transformer.transformations[type + '_NORMAL'] );

                data = Transformer.transformCSV(
                    payload[type],
                    Transformer.transformations[type] );

                switch ( type ) {
                    case 'PRCP_YTD' :
                        normalTemplate = templates['data-normal-ytd-prcp'];
                        dataTemplate = templates['data-ytd-prcp'];
                        break
                }
            }

            var section = [];

            if ( normals.length !== 0 ) {
                section.push(Mustache.render( normalTemplate, {
                    values: normals
                }));
            }

            section.push(Mustache.render( dataTemplate, {
                values: data
            }));

            return section.join( '' );
        };

// TODO: follow class with prototype

        module.exports = {
            MuglHelper: MuglHelper
        }

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils/muglHelper.js","/utils")
},{"./transformer.js":8,"IrXUsu":5,"buffer":2}],7:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        var ID_DELIMITER = '-';

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

        module.exports = sanitizeString;

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils/stringUtil.js","/utils")
},{"IrXUsu":5,"buffer":2}],8:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
        /**
         * Transformer contains a number of data transformation utility classes
         */
        function Transformer() {
            //
        }

        /**
         * Finds the minima and maxama across an object by relevant keys
         *
         * @param array params       : parameters of interest in summary, e.g., ['TMAX', 'TMIN']
         * @param object data        : data summary object, filtered by selected id
         *                             { "VAR": { "min": "19000101", "max": "19001231" } ... }
         * @returns object           : summary object with a min and max across params
         */
        Transformer.findMinMax = function( params, data ) {
            var summary = {};

            var minima = [];
            var maxima = [];

            $.each(params, function() {
                minima.push( parseInt( data[this].min ) );
                maxima.push( parseInt( data[this].max ) );
            });

            summary.min = $.apply( Math.max, minima )[0];
            summary.max = $.apply( Math.min, maxima )[0];

            return summary;
        };

        /**
         * Merges two two-column CSV strings by the intersection of the first columns
         *
         * @param array csv1        : the first two-column CSV string
         * @param array csv2        : the second two-column CSV string
         * @param function transform : transformation that should be applied to each data column
         * @returns array            : a merged three-column CSV
         */
        Transformer.mergeCSV = function( csv1, csv2, transform ) {
            var colA = {};
            $.each( csv1.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function() {
                var ln = this.split( ',' );
                colA[ln[0]] = transform( ln[1] );
            });

            // only append the value portion - not the date
            var colB = {};
            $.each( csv2.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function() {
                var ln = this.split( ',' );
                if ( colA.hasOwnProperty( ln[0] ) ) {
                    colB[ln[0]] = transform( ln[1] );
                }
            });

            // back-check keys, merge and push common keys
            var merge = [];
            $.each( colA, function ( key, value ) {
                if ( (key != "") && colB.hasOwnProperty( key ) ) {
                    merge.push( sprintf( '%s,%s,%s', key, value, colB[key] ) );
                }
            });

            return merge.join( '\n' );
        };

        /**
         * Transforms the data column of a two-column CSV string using a provided transform function
         *
         * @param {type} csv1        : the two-column CSV string
         * @param function transform : transformation that should be applied to each data column
         * @returns array            : a transformed CSV
         */
        Transformer.transformCSV = function( csv, transform ) {
            var xform = [];
            $.each( csv.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function() {
                var ln = this.split( ',' );
                xform.push( sprintf( '%s,%s', ln[0], transform( ln[1] ) ) );
            });

            return xform.join( '\n' );
        };

        Transformer.transformations = {
            'PRCP_YTD': function( x ) {
                var v = parseFloat(x);
                v = v / 10.0;
                return sprintf("%.1f", v);
            },
            'PRCP_YTD_NORMAL': function( x ) {
                var v = parseFloat(x);
                return sprintf("%.1f", 25.4*v/10.0);
            },
            'TEMP': function( x ) {
                var v = parseFloat(x);
                v = v / 10.0;
                return sprintf( '%.1f', v );
            },
            'TEMP_NORMAL': function ( x ) {
                var f = parseFloat( x );
                var c = ( f-32.0 ) *5.0 /9.0;
                return sprintf( '%.1f', c );
            }
        };

        module.exports = Transformer;

    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils/transformer.js","/utils")
},{"IrXUsu":5,"buffer":2}],9:[function(require,module,exports){
    (function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
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

        module.exports = URL;
    }).call(this,require("IrXUsu"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/utils/urlUtils.js","/utils")
},{"IrXUsu":5,"buffer":2}]},{},[1])