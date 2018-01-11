
$('#tidal-chart-container').hide();

var Location = function (lat, lon, stations_base_url, data_base_url) {

    this.stations_base_url = stations_base_url;
    this.data_base_url = data_base_url;

    $('#temperature-map-season').hide();
    $('#precipitation-map-season').hide();

    this.mapVariables();

    this.selectedVariable = {
        'temperature-map': 'tmax',
        'precipitation-map': 'pcpn',
        'derived-map': 'hdd_65f'
    };

    this.activeYear = 1950;
    this.selectedSeason = 'summer';

    this.lat = parseFloat(lat) || 37.42;
    this.lon = parseFloat(lon) || -105.21;
    this.createMap();
    this.wire();
};


/*
* Lots of inconsistencies in naming, so here I map all the variables to one another
*
*/
Location.prototype.mapVariables = function () {
    this.tilesHistMapping = {
        'temperature-map': {
            'tmax': '-hist-tasmax',
            'tmin': '-hist-tasmin',
            'days_tmin_blw_0.0': '-annual-hist-days-tmin-blw',
            'days_tmax_abv_35.0': '-annual-hist-days-tmax-abv',
        },
        'precipitation-map': {
            'pcpn': '-hist-precip',
            'days_pcpn_gt_1in': '-annual-hist-days-prcp-abv'
        },
        'derived-map': {
            'cdd_65f': '-annual-hist-cooling-degree-day',
            'hdd_65f': '-annual-hist-heating-degree-day'
        }
    };

    this.tilesMapping = {
        'temperature-map': {
            'tmax': '-rcp45-tasmax',
            'tmin': '-rcp45-tasmin',
            'days_tmin_blw_0.0': '-annual-rcp45-days-tmin-blw',
            'days_tmax_abv_35.0': '-annual-rcp45-days-tmax-abv',
        },
        'precipitation-map': {
            'pcpn': '-rcp45-precip',
            'days_pcpn_gt_1in': '-annual-rcp45-days-prcp-abv'
        },
        'derived-map': {
            'cdd_65f': '-annual-rcp45-cooling-degree-day',
            'hdd_65f': '-annual-rcp45-heating-degree-day'
        }
    };

    this.tilesMapping85 = {
        'temperature-map': {
            'tmax': '-rcp85-tasmax',
            'tmin': '-rcp85-tasmin',
            'days_tmin_blw_0.0': '-annual-rcp85-days-tmin-blw',
            'days_tmax_abv_35.0': '-annual-rcp85-days-tmax-abv',
        },
        'precipitation-map': {
            'pcpn': '-rcp85-precip',
            'days_pcpn_gt_1in': '-annual-rcp85-days-prcp-abv'
        },
        'derived-map': {
            'cdd_65f': '-annual-rcp85-cooling-degree-day',
            'hdd_65f': '-annual-rcp85-heating-degree-day'
        }
    };
};


/*
* Create WEATHER stations map
*
*
*/
Location.prototype.createMap = function () {
    var self = this;

    var view = new ol.View({
        center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
        zoom: 9
    });

    this.map = new ol.Map({
        target: 'location-station-map',
        interactions: ol.interaction.defaults({mouseWheelZoom: false}),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    attributions: [new ol.Attribution({html: ['&copy; Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ']})],
                    maxZoom: 19
                })
            })
        ],
        view: view
    });

    this.popup = new ol.Overlay.Popup();
    this.map.addOverlay(this.popup);

    // do we still need to originals? self.addStations();

    self.addITEMStations();
    self.addTIDALStations();


};


/*
*
* get stations and add to map
*
*/
Location.prototype.addStations = function () {
    var self = this;

    var styles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({color: '#f5442d'}),
                stroke: new ol.style.Stroke({color: '#FFF', width: 2})
            })
        })
    };

    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };


    $.getJSON(this.data_base_url + 'wx_stations.json', function (data) {

        var featureCollection = {
            'type': 'FeatureCollection',
            'features': []
        };

        var obj;
        $.each(data, function (i, d) {
//      if ( d.weight < 2 ) {
            obj = {
                'type': 'Feature',
                'properties': {
                    'station': d.id,
                    'name': d.name,
                    'type': 'standard'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [d.lon, d.lat]
                }
            };
            featureCollection.features.push(obj);
            //    }
        });

        var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
            featureProjection: 'EPSG:3857'
        });
        var vectorSource = new ol.source.Vector({
            features: features
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
        });

        vectorLayer.set('layer_id', 'stations');
        self.map.addLayer(vectorLayer);

        //console.log('added', data);
    });


};


Location.prototype.addITEMStations = function () {
    var self = this;

    var styles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({color: '#f5442d'}),
                stroke: new ol.style.Stroke({color: '#FFF', width: 2})
            })
        })
    };

    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };


    $.getJSON('/resources/item/conus_station_reliability_all.json', function (data) {

        var featureCollection = {
            'type': 'FeatureCollection',
            'features': []
        };

        var obj;
        $.each(data, function (i, d) {

            obj = {
                'type': 'Feature',
                'properties': {
                    'station': d.id,
                    'name': d.name,
                    'type': 'ITEM'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [d.lon, d.lat]
                }
            };
            featureCollection.features.push(obj);
        });

        var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
            featureProjection: 'EPSG:3857'
        });
        var vectorSource = new ol.source.Vector({
            features: features
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
        });

        vectorLayer.set('layer_id', 'stations2');
        self.map.addLayer(vectorLayer);

        //console.log('added', data);
    });


};


Location.prototype.addTIDALStations = function () {
    var self = this;

    var styles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({color: '#5dacf5'}),
                stroke: new ol.style.Stroke({color: '#FFF', width: 2})
            })
        })
    };

    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };


    $.getJSON('/resources/tidal/tidal_stations.json', function (data) {

        var featureCollection = {
            'type': 'FeatureCollection',
            'features': []
        };

        var obj;
        $.each(data, function (i, d) {

            obj = {
                'type': 'Feature',
                'properties': {
                    'station': d.id,
                    'name': d.label,
                    'type': 'tidal'
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [d.lon, d.lat]
                }
            };
            featureCollection.features.push(obj);
        });

        var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
            featureProjection: 'EPSG:3857'
        });
        var vectorSource = new ol.source.Vector({
            features: features
        });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
        });

        vectorLayer.set('layer_id', 'stations2');
        self.map.addLayer(vectorLayer);

        //console.log('added', data);
    });


};


/*
*
* Called when a station is selected!
* Opens popover and populates CHART into that popover for historcal weather data
*
*/
Location.prototype.stationSelected = function (feature, event, type) {
    var self = this;


    if (feature) {


        var props = feature.getProperties();


        if (props.type === 'ITEM') {
            console.log("CLICKED ON ITEM");
            $('#multi-chart-container').show();
            $('#multi-chart-header').remove();

            $('#multi-precip-chart-container').show();
            $('#tidal-chart-container').hide();

            html = '<div id="multi-chart-header"><h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3><div id="close-wx-station">x</div>' +
                '<div>Station: ' + props.name + '<br /></div>' +
                '<div>Station ID: <div id="station_id">' + props.station + '</div><br /></div></div>' +
                '' +
                '';

            $('#multi-chart-container').prepend(html);

            this.chart = new ChartBuilder(props, this.stations_base_url);
        }
        if (props.type === 'tidal') {

            $('#tidal-chart-header').remove();
            $('#tidal-chart-container').show();

            $('#multi-chart-container').hide();
            $('#multi-precip-chart-container').hide();

            var html = '<div id="tidal-chart-header"><h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Tidal Station</h3><div id="close-wx-station">x</div>' +
                '<div>Station: ' + props.name + '<br /></div>' +
                '<div>Station ID: ' + props.station + '<br /></div></div>'

            //this.popup.show(event.mapBrowserEvent.coordinate, html);
            $('#tidal-chart-container').prepend(html);

            //$(html).appendTo('#station-data-container').find('#tidal-chart').tidalstationwidget({
            //    station: props.station,
            //    data_url: '/resources/tidal/tidal_data.json' // defaults to tidal_data.json
            //});


            $('#station').change(function () {
                $("#tidal-chart").tidalstationwidget("update", {station: $('#station').val()})
            });

            $("#station").val(props.station).change();


        }


    } else {
        $('#station-data-about').show();
        //$('#station-data-container').empty();
        //this.popup.hide();
    }

    $('#close-wx-station').on('click', function () {
        $('#station-data-about').show();
        //$('#station-data-container').empty();
    });
};

function isInDoc(sel) {
    var $sel = jQuery(sel);
    return $sel.length && jQuery.contains(document.documentElement, $sel[0]);
}


/*
* Creates maps used for each variable that is highlighted
* "map" is id of container
*
*/
Location.prototype.createGraphMaps = function (map) {
    var self = this;

    //var maps = ['temperature-map', 'precipitation-map', 'derived-map'];
    if (self[map]) return;

    var view = new ol.View({
        center: ol.proj.transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
    });

    self[map] = new ol.Map({
        target: map,
        interactions: ol.interaction.defaults({mouseWheelZoom: false}),
        view: view,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    attributions: [new ol.Attribution({html: ['&copy; Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ']})],
                    maxZoom: 19
                })
            })
        ]
    });
    self.updateTiledLayer(map, true, true);

};


/*
*
* Wires up all the crazy interactions and UI sliders on this page
*
*/
Location.prototype.wire = function () {
    var self = this;

    var select = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    this.map.addInteraction(select);

    select.on('select', function (e) {

        var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
            return feature;
        });

        if (feature) {
            var props = feature.getProperties();
            self.stationSelected(feature, e);
        } else {
            $('#station-data-about').show();
            //$('#station-data-container').empty();
            //self.popup.hide();
        }

    });

    $('.data-options-trigger').click(function (e) {
        e.preventDefault();

        $(this).siblings('.data-options').slideDown();
    });

    $('.data-accordion-tab').on('click', function (e) {
        var id = e.currentTarget.id;
        var map;

        if (id.match('chart')) {
            map = id.replace('-chart', '-map-container');
            var mapDiv = id.replace('-chart', '-map');
            $('#' + id + ' .chart').show();
            $('#' + mapDiv).hide();
            $('#' + map + ' .moveable').hide();
            $('#' + map + ' .map-seasons-container').hide();
            $('#' + map + ' .year').hide();

            self.updateSidebar(false, id);

            return;
        } else {

            $($('#precipitation-data .location-resolution a')[0]).trigger('click');
            $($('#temperature-data .location-resolution a')[0]).trigger('click');

            self.updateSidebar(true, id);

            map = id.replace('-container', '');
            $('#' + map).show();

            var h = $('#' + map).parent().height();
            //$('#'+map).css({'height': h - 74 - 90 + 'px'});
            //$('.moveable').css({'height': h - 74 - 90 + 40 + 'px'});

            self.createGraphMaps(map);

            setTimeout(function () {
                $('#' + id + ' .year').show().css({'z-index': 200});

                //id = id.replace('-chart', '-map-container');
                var c = id.replace('-map-container', '-chart');
                $('#' + c + ' .chart').hide();
                $('#' + id + ' .moveable').show();
                $('#' + id + ' .map-seasons-container').show();
                $('#' + id + ' .year').show();

                map = id.replace('-container', '');
                if (self[map]) self[map].updateSize();

            }, 200);
        }
    });

    $.fn.swap_classes = function (clicked) {

        // remove all active, accent border and accent color classes
        this.find('.active').removeClass('active');
        this.find('.accent-border').removeClass('accent-border');
        this.find('.accent-color').removeClass('accent-color');

        // set the parent li to active
        clicked.parents('li').addClass('active').addClass('accent-border');

        // set the first link under the h4 to active
        var first_li = clicked.siblings('ul').find('li').first();

        first_li.addClass('active').addClass('accent-border');
        first_li.find('a').addClass('accent-color');
    };

    $('#temperature-data h4').on('click', function (e) {
        e.preventDefault();

        $('#temperature-data .data-options').swap_classes($(this));

        var id = $(this).attr('id').replace('var-', '');
        self.selectedVariable['temperature-map'] = id;
        if (self['temperature-map']) {
            self.updateTiledLayer('temperature-map', false);
        }

        $('#temperature-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});
        $('#temperature-map-container .location-map-legend').html('<img class="legend-image" src="resources/img/' + id + '.png"></img>');
    });

    $('#precipitation-data h4').on('click', function (e) {
        e.preventDefault();

        $('#precipitation-data .data-options').swap_classes($(this));

        var id = $(this).attr('id').replace('var-', '');

        // use the same tiles as PR for days with above one inch
        if (id === 'days_prcp_abv_25.3') {
            id = 'pr';
        }
        self.selectedVariable['precipitation-map'] = id;
        if (self['precipitation-map']) {
            self.updateTiledLayer('precipitation-map', false);
        }
        $('#precipitation-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});
    });

    $('#derived-data h4').on('click', function (e) {
        e.preventDefault();

        $('#derived-data .data-options').swap_classes($(this));

        var id = $(this).attr('id').replace('var-', '');
        self.selectedVariable['derived-map'] = id;
        if (self['derived-map']) {
            self.updateTiledLayer('derived-map', false);
        }
        $('#derived-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});
        $('#derived-map-container .location-map-legend').html('<img class="legend-image" src="resources/img/' + id + '.png"></img>');
    });

    $('#precipitation-map-season .fs-dropdown-item').on('click', function (e) {
        self.selectedSeason = $(this).data().value;
        self.updateTiledLayer('precipitation-map', true, false);
    });

    $('#temperature-map-season .fs-dropdown-item').on('click', function (e) {
        self.selectedSeason = $(this).data().value;
        self.updateTiledLayer('temperature-map', true, false);
    });

};


Location.prototype.updateSidebar = function (disable, id) {
    id = id.split('-')[0] + '-data';
    //console.log('id', id);
    if (disable) {
        $('#' + id + ' .seasonal-monthly').addClass('disabled');
    } else {
        $('#' + id + ' .seasonal-monthly').removeClass('disabled');
    }
};


/*
*
* Creates tiled layers, both 45 and 85
* map id required
* replace / time reset tells us what sort of update this is – new layer or otherwise
*
*/
Location.prototype.updateTiledLayer = function (map, replace, timeReset) {

    var self = this;
    var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
    var seasons = ['tmax', 'tmin', 'pcpn'];

    var extent = ol.proj.transformExtent([-135, 11.3535322866, -56.25, 49.5057345956], 'EPSG:4326', 'EPSG:3857');

    var hist = null;
    var season = (seasons.indexOf(this.selectedVariable[map]) !== -1) ? '-' + this.selectedSeason : '';

    if ((this.selectedVariable[map] === 'tmax' || this.selectedVariable[map] === 'tmin') && map === 'temperature-map') {
        $('#temperature-map-season').show();
    } else if (map === 'temperature-map') {
        $('#temperature-map-season').hide();
    }

    if (this.selectedVariable[map] === 'pr' && map === 'precipitation-map') {
        $('#precipitation-map-season').show();
    } else if (map === 'precipitation-map') {
        $('#precipitation-map-season').hide();
    }

    var src, src85;
    if (histYears.indexOf(this.activeYear) !== -1) {
        src = this.activeYear + season + this.tilesHistMapping[map][this.selectedVariable[map]];
        src85 = null;
    } else {
        src = this.activeYear + season + this.tilesMapping[map][this.selectedVariable[map]];
        src85 = this.activeYear + season + this.tilesMapping85[map][this.selectedVariable[map]];
    }

    if (replace) {
        this.removeOldTiles(map);
    }

    //rcp45 OR historical
    var layer = map + 'TileLayer';
    this[layer] = new ol.layer.Tile({
        source: new ol.source.XYZ({
            urls: [
                'https://s3.amazonaws.com/climate-explorer-bucket/tilesets/' + src + '/{z}/{x}/{y}.png'
            ],
            extent: extent,
            minZoom: 0,
            maxZoom: 5,
            tilePixelRatio: 1
        })
    });

    this[layer].set('layer_id', 'tile_layer');
    this[map].addLayer(this[layer]);

    var layer85;
    if (src85) {
        //rcp85
        layer85 = map + 'TileLayer85';
        this[layer85] = new ol.layer.Tile({
            source: new ol.source.XYZ({
                urls: [
                    'https://s3.amazonaws.com/climate-explorer-bucket/tilesets/' + src85 + '/{z}/{x}/{y}.png'
                ],
                extent: extent,
                minZoom: 0,
                maxZoom: 5,
                tilePixelRatio: 1
            })
        });

        this[layer85].set('layer_id', 'tile_layer');
        this[map].addLayer(this[layer85]);
    }

    this.nameLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
            attributions: [new ol.Attribution({html: ['']})],
            maxZoom: 19
        })
    });

    this.nameLayer.set('layer_id', 'name_layer');
    this[map].addLayer(this.nameLayer);

    this[layer].setZIndex(0);
    if (src85) {
        this[layer85].setZIndex(0);
    }
    this.nameLayer.setZIndex(6);

    if (src85) {
        $("#" + map + "SliderDiv").show();
        this.setSwipeMap(map);
    } else {
        $("#" + map + "SliderDiv").hide();
    }

    if (replace && timeReset) {
        this.setSlider(map);
    }

};


/*
* Removes old climate tiles from map
* Timeout means new tiles will load before we remove old, so there isn't a
* flash of map with no tiles at all
*
*/
Location.prototype.removeOldTiles = function (map) {
    var self = this;

    this.oldTile = this[map + 'TileLayer'];
    this.oldTile85 = this[map + 'tileLayer85'];

    setTimeout(function () {
        if (self.oldTile) {
            self.map.removeLayer(self.oldTile);
            self.oldTile = null;
        }
        if (self.oldTile85) {
            self.map.removeLayer(self.oldTile85);
            self.oldTile85 = null;
        }
    }, 900);
};


/*
*
* Map swiper logic!
* Map ( id ) required, to assign swiper and eventing to correct map
*
*/
Location.prototype.setSwipeMap = function (map) {
    var self = this;
    var swipeVal = null, pos, wrapper;
    var layer = map + 'TileLayer';
    var layer85 = map + 'TileLayer85';

    $("#" + map + "SliderDiv").draggable({
        axis: "x",
        containment: "#" + map + "-container",
        scroll: false,
        drag: function (event, ui) {
            pos = ui.helper.offset();
            swipeVal = (pos.left - $("#" + map + "-container").offset().left);
            self[layer].dispatchEvent('change');
            $(".emissions-low").fadeOut();
            $(".emissions-high").fadeOut();
            // self.map.render();
        },
        stop: function (event, ui) {
            pos = ui.helper.offset();
            swipeVal = (pos.left - $("#" + map + "-container").offset().left);
            self[layer].dispatchEvent('change');
            $(".emissions-low").fadeIn();
            $(".emissions-high").fadeIn();
        }
    });

    self[layer85].on('precompose', function (event) {
        var ctx = event.context;
        var wrapper = $("#" + map + "-container").width();
        if (swipeVal === null) {
            pos = $("#" + map + "SliderDiv").offset(); //ui.helper.offset();
            swipeVal = (pos.left - $("#" + map + "-container").offset().left);
        }
        var screenPercent = swipeVal / wrapper;
        var width = ctx.canvas.width * screenPercent;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
        ctx.clip();
    });

    self[layer85].on('postcompose', function (event) {
        var ctx = event.context;
        ctx.restore();
    });
};


/*
*
* Handles logic for the time sliders
* Map ( id )  required to assign slider to correct map
*
*/
Location.prototype.setSlider = function (map) {
    var self = this;
    var year_slider = $('#' + map + '-time-slider');

    var tooltip = $('<span class="tooltip">' + year_slider.attr('data-value') + '</span>').hide();

    year_slider.slider({
        range: false,
        min: 1950,
        max: 2090,
        step: 10,
        value: 2010,
        slide: function (event, ui) {
            if (self.selectedVariable[map] !== 'tasmax' && self.selectedVariable[map] !== 'tasmin' && self.selectedVariable[map] !== 'pr') {
                if (ui.value === 2000) {
                    return false;
                }
            }
            tooltip.text(ui.value);
            tooltip.fadeIn(200);
        },
        change: function (event, ui) {
            year_slider.attr('data-value', ui.value);
        },
        stop: function (event, ui) {
            year_slider.attr('data-value', ui.value);
            self.activeYear = ui.value;
            self.updateTiledLayer(map, true, false);
            tooltip.fadeOut(200);
        }
    }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);
    tooltip.fadeIn(200);
};
