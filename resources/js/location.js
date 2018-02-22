//$('#tidal-chart-container').hide();

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

    this.activeYear = 2010;
    this.selectedSeason = 'summer';

    this.lat = parseFloat(lat) || 37.42;
    this.lon = parseFloat(lon) || -105.21;
    this.createMap();
};
/*
* Lots of inconsistencies in naming, so here I map all the variables to one another
*/
Location.prototype.mapVariables = function () {
    // HISTORICAL
    this.tilesHistMapping = {
        'temperature-map': {
            'tmax': '-hist-tmax',
            'tmin': '-hist-tmin',
            'days_tmin_lt_32f': '-annual-hist-days_tmin_lt_32f',
            'days_tmax_gt_95f': '-annual-hist-days_tmax_gt_95f',
            'days_tmax_gt_90f': '-annual-hist-days_tmax_gt_90f',
            'days_tmax_gt_100f': '-annual-hist-days_tmax_gt_100f',
            'days_tmax_gt_105f': '-annual-hist-days_tmax_gt_105f',
            'days_tmax_lt_32f': '-annual-hist-days_tmax_lt_32f',
            'days_tmin_gt_80f': '-annual-hist-days_tmin_gt_80f',
            'days_tmin_gt_90f': '-annual-hist-days_tmin_gt_90f'
        },
        'precipitation-map': {
            'pcpn': '-hist-pcpn',
            'days_pcpn_gt_1in': '-annual-hist-days_pcpn_gt_1in',
            'days_pcpn_gt_2in': '-annual-hist-days_pcpn_gt_2in',
            'days_pcpn_gt_3in': '-annual-hist-days_pcpn_gt_3in',
            'days_dry_days': '-annual-hist-dry_days'
        },
        'derived-map': {
            'cdd_65f': '-annual-hist-cdd_65f',
            'hdd_65f': '-annual-hist-hdd_65f',
            'gdd': '-annual-hist-gdd',
            'gddmod': '-annual-hist-gddmod'
        }


    };
    // RCP 4.5
    this.tilesMapping = {

        'temperature-map': {
            'tmax': '-rcp45-tmax',
            'tmin': '-rcp45-tmin',
            'days_tmin_lt_32f': '-annual-rcp45-days_tmin_lt_32f',
            'days_tmax_gt_95f': '-annual-rcp45-days_tmax_gt_95f',
            'days_tmax_gt_90f': '-annual-rcp45-days_tmax_gt_90f',
            'days_tmax_gt_100f': '-annual-rcp45-days_tmax_gt_100f',
            'days_tmax_gt_105f': '-annual-rcp45-days_tmax_gt_105f',
            'days_tmax_lt_32f': '-annual-rcp45-days_tmax_lt_32f',
            'days_tmin_gt_80f': '-annual-rcp45-days_tmin_gt_80f',
            'days_tmin_gt_90f': '-annual-rcp45-days_tmin_gt_90f'
        },
        'precipitation-map': {
            'pcpn': '-rcp45-pcpn',
            'days_pcpn_gt_1in': '-annual-rcp45-days_pcpn_gt_1in',
            'days_pcpn_gt_2in': '-annual-rcp45-days_pcpn_gt_2in',
            'days_pcpn_gt_3in': '-annual-rcp45-days_pcpn_gt_3in',
            'days_dry_days': '-annual-rcp45-dry_days'
        },
        'derived-map': {
            'cdd_65f': '-annual-rcp45-cdd_65f',
            'hdd_65f': '-annual-rcp45-hdd_65f',
            'gdd': '-annual-rcp45-gdd',
            'gddmod': '-annual-rcp45-gddmod'
        }
    };
    // RCP 8.5
    this.tilesMapping85 = {

        'temperature-map': {
            'tmax': '-rcp85-tmax',
            'tmin': '-rcp85-tmin',
            'days_tmin_lt_32f': '-annual-rcp85-days_tmin_lt_32f',
            'days_tmax_gt_95f': '-annual-rcp85-days_tmax_gt_95f',
            'days_tmax_gt_90f': '-annual-rcp85-days_tmax_gt_90f',
            'days_tmax_gt_100f': '-annual-rcp85-days_tmax_gt_100f',
            'days_tmax_gt_105f': '-annual-rcp85-days_tmax_gt_105f',
            'days_tmax_lt_32f': '-annual-rcp85-days_tmax_lt_32f',
            'days_tmin_gt_80f': '-annual-rcp85-days_tmin_gt_80f',
            'days_tmin_gt_90f': '-annual-rcp85-days_tmin_gt_90f'
        },
        'precipitation-map': {
            'pcpn': '-rcp85-pcpn',
            'days_pcpn_gt_1in': '-annual-rcp85-days_pcpn_gt_1in',
            'days_pcpn_gt_2in': '-annual-rcp85-days_pcpn_gt_2in',
            'days_pcpn_gt_3in': '-annual-rcp85-days_pcpn_gt_3in',
            'days_dry_days': '-annual-rcp85-dry_days'
        },
        'derived-map': {
            'cdd_65f': '-annual-rcp85-cdd_65f',
            'hdd_65f': '-annual-rcp85-hdd_65f',
            'gdd': '-annual-rcp85-gdd',
            'gddmod': '-annual-rcp85-gddmod'
        }
    };
};
/*
* Create WEATHER stations map
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

    this.wire(this.map);

};
/*
* get stations and add to map
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

    var blackStyles = {
        'Point': new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({color: '#f5442d'}),
                stroke: new ol.style.Stroke({color: '#000', width: 2})
            })
        })
    };

    var styleFunction = function (feature) {
        if (feature.U.show_on_precip === 0 && feature.U.show_on_temp === 0) {
            return styles[feature.getGeometry().getType()];
        } else {
            return blackStyles[feature.getGeometry().getType()];
        }
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
                    'show_on_precip': d.precip,
                    'show_on_temp': d.temp,
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


        if ($('#stations-charts-list > li.selected > a').text() === 'Temperature') {

            if (feature.U.show_on_temp === 0) {
                $('#station-detail-data').hide();
                $('#station-no-data').show();
            } else {
                $('#station-detail-data').show();
                $('#station-no-data').hide();
            }
        }

        if ($('#stations-charts-list > li.selected > a').text() === 'Precipitation') {

            if (feature.U.show_on_precip === 0) {
                $('#station-detail-data').hide();
                $('#station-no-data').show();
            } else {
                $('#station-detail-data').show();
                $('#station-no-data').hide();
            }
        }

        $('#station-charts-tabs .chart-tab-list a').click(function (e) {

            e.preventDefault();

            var tab_id = $(this).attr('href');


            if (!$(this).parents('li').hasClass('selected')) {

                $('#station-charts-tabs .chart-tab-list li').removeClass('selected');
                $('#station-charts-tabs .chart-tab').removeClass('selected');

                $(this).parents('li').addClass('selected');
                $(tab_id).addClass('selected');

                if (tab_id === '#stations-charts-temp') {
                    $('body').find('#itemvariable').val('tavg').change();

                    if (feature.U.show_on_temp === 0) {
                        $('#station-detail-data').hide();
                        $('#station-no-data').show();
                    } else {
                        $('#station-detail-data').show();
                        $('#station-no-data').hide();
                    }

                } else {
                    $('body').find('#itemvariable').val('precipitation').change();


                    if (feature.U.show_on_precip === 0) {
                        $('#station-detail-data').hide();
                        $('#station-no-data').show();
                    } else {
                        $('#station-detail-data').show();
                        $('#station-no-data').hide();
                    }

                }

            }

        });


        var station_tabs;

        $('#stations-spinner').fadeIn(50, function () {
            $('#location-stations').addClass('overlay-on');

            var props = feature.getProperties();

            // populate header

            $('#station-overlay-header .station-name').html(props.name);

            $('#station-overlay-header .station-id').html(props.station);

            $('#station').val(props.station).change();

            if (props.type === 'ITEM') {


                $('#station-overlay-header h3').html('Weather Station');

                self.chart = new ChartBuilder(props, self.stations_base_url);

                $('#stations-spinner').fadeOut(250);
            }

            if (props.type === 'tidal') {

                $('#station-overlay-header h3').html('Tidal Station');

                $('#location-stations').addClass('type-tidal');

                $('#stations-spinner').fadeOut(250);

                $('body').on('change', '#tidal_station', function () {
                    $("#tidal-chart").tidalstationwidget("update", {station: $(this).val()})

                    if ($(this).find('option:selected').length) {
                        $('#station-overlay-header .station-name').html($(this).find('option:selected').text());
                    }

                    $('#station-overlay-header .station-id').html($(this).val());
                });

                $("#tidal_station").val(props.station).change();

            }

        });

    } else {
        $('#station-data-about').show();
        //$('#station-data-container').empty();
        //this.popup.hide();
    }

    $('#station-overlay-close').click(function () {
        $('#location-stations').removeClass('overlay-on').removeClass('type-tidal');
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
        zoom: 5
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
Location.prototype.wire = function (map) {
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

            le_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
            he_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();

            self.updateTiledLayer('temperature-map', false, false,le_option_selected,he_option_selected);

        }

        var legendFilename;

        if (self.selectedVariable['temperature-map'] === 'tmax') {
            legendFilename = 'summer_tmax';
        } else if (self.selectedVariable['temperature-map'] === 'tmin') {
            legendFilename = 'summer_tmin';
        } else {
            legendFilename = self.selectedVariable['temperature-map'];
        }

        $('#temperature-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});

        $('#temperature-map-container .location-map-legend').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png"></img>');


    });

    $('#precipitation-data h4').on('click', function (e) {
        e.preventDefault();

        $('#precipitation-data .data-options').swap_classes($(this));

        var id = $(this).attr('id').replace('var-', '');

        // use the same tiles as PR for days with above one inch
        //if (id === 'days_pcpn_gt_1in') {
        //    id = 'pcpn';
        //}
        self.selectedVariable['precipitation-map'] = id;
        if (self['precipitation-map']) {

            le_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
            he_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();

            self.updateTiledLayer('precipitation-map', false, false,le_option_selected,he_option_selected);

        }

        var legendFilename;
        legendFilename = self.selectedVariable['precipitation-map'];


        $('#precipitation-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});

        $('#precipitation-map-container .location-map-legend').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');
    });

    $('#derived-data h4').on('click', function (e) {
        e.preventDefault();

        console.log("clicked derived data");

        $('#derived-data .data-options').swap_classes($(this));

        var id = $(this).attr('id').replace('var-', '');
        self.selectedVariable['derived-map'] = id;
        if (self['derived-map']) {

            le_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
            he_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();

            self.updateTiledLayer('derived-map', false, false,le_option_selected,he_option_selected);

        }

        var legendFilename;
        legendFilename = self.selectedVariable['derived-map'];

        $('#derived-map-container .full-map-btn').prop({'href': 'variables.php?id=' + id});
        $('#derived-map-container .location-map-legend').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');
    });

    $('#precipitation-map-season .fs-dropdown-item').on('click', function (e) {
        self.selectedSeason = $(this).data().value;


        left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
        right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();

        self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
    });

    $('#temperature-map-season .fs-dropdown-item').on('click', function (e) {
        self.selectedSeason = $(this).data().value;
        if (self.selectedVariable['temperature-map'] === 'tmax' || self.selectedVariable['temperature-map'] === 'tmin') {
            var legendFilename;
            legendFilename = self.selectedSeason + '_' + self.selectedVariable['temperature-map'];
            $('.location-map-legend').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');
        }
        left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
        right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
    });

    $('#temperature-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
        left_option_selected = this.innerHTML;
        right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
    });
    $('#temperature-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
        left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
        right_option_selected = this.innerHTML;
        self.updateTiledLayer('temperature-map', true, false, left_option_selected, right_option_selected);
    });


    $('#precipitation-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
        left_option_selected = this.innerHTML;
        right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
    });
    $('#precipitation-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
        left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
        right_option_selected = this.innerHTML;
        self.updateTiledLayer('precipitation-map', true, false, left_option_selected, right_option_selected);
    });


    $('#derived-swipeImg .emissions-low .fs-dropdown-item').on('click', function (e) {
        left_option_selected = this.innerHTML;
        right_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer('derived-map', true, false, left_option_selected, right_option_selected);
    });
    $('#derived-swipeImg .emissions-high .fs-dropdown-item').on('click', function (e) {
        left_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
        right_option_selected = this.innerHTML;
        self.updateTiledLayer('derived-map', true, false, left_option_selected, right_option_selected);
    });


};


Location.prototype.updateSidebar = function (disable, id) {
    id = id.split('-')[0] + '-data';
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
Location.prototype.updateTiledLayer = function (map, replace, timeReset,left_option_selected,right_option_selected) {

    if (map === 'temperature-map') {
        if (!left_option_selected){
            left_option_selected = $("#temperature-swipeImg .emissions-low .fs-dropdown-selected").text();
        }
        if (!right_option_selected){
            right_option_selected = $("#temperature-swipeImg .emissions-high .fs-dropdown-selected").text();
        }
    }

    if (map === 'precipitation-map') {
        if (!left_option_selected){
            left_option_selected = $("#precipitation-swipeImg .emissions-low .fs-dropdown-selected").text();
        }
        if (!right_option_selected){
            right_option_selected = $("#precipitation-swipeImg .emissions-high .fs-dropdown-selected").text();
        }
    }

    if (map === 'derived-map') {
        if (!left_option_selected){
            left_option_selected = $("#derived-swipeImg .emissions-low .fs-dropdown-selected").text();
        }
        if (!right_option_selected){
            right_option_selected = $("#derived-swipeImg .emissions-high .fs-dropdown-selected").text();
        }
    }
    //
    // console.log(map);
    // console.log(replace);
    // console.log('left_option_selected');
    // console.log(left_option_selected);
    // console.log('right_option_selected');
    // console.log(right_option_selected);

    if (replace && timeReset) {
        this.setSlider(map);
    }

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

    if (this.selectedVariable[map] === 'pcpn' && map === 'precipitation-map') {
        $('#precipitation-map-season').show();
    } else if (map === 'precipitation-map') {
        $('#precipitation-map-season').hide();
    }

    var layer_left, layer_right;
    //
    // if (histYears.indexOf(this.activeYear) !== -1) {
    //
    //     layer_left = this.activeYear + season + this.tilesHistMapping[map][this.selectedVariable[map]];
    //     layer_right = null;
    // } else {

        if (left_option_selected === 'lower_historical' || left_option_selected === 'HISTORICAL') {
            layer_left = 'avg' + season + this.tilesHistMapping[map][this.selectedVariable[map]];
        } else {
            layer_left = this.activeYear + season + this.tilesMapping[map][this.selectedVariable[map]];
        }


        if (right_option_selected === 'higher_historical' || right_option_selected === 'HISTORICAL') {
            layer_right = 'avg' + season + this.tilesHistMapping[map][this.selectedVariable[map]];
        } else {
            layer_right = this.activeYear + season + this.tilesMapping85[map][this.selectedVariable[map]];
        }

    // }
    //
    // console.log('layer_left');
    // console.log(layer_left);
    // console.log('layer_right');
    // console.log(layer_right);
    // console.log('selectedVar');
    // console.log(this.tilesMapping[map][this.selectedVariable[map]]);
    // console.log();

    if (replace) {
        this.removeOldTiles(map);
    }

    //rcp45 OR historical
    var layer = map + 'TileLayer';
    this[layer] = new ol.layer.Tile({
        source: new ol.source.XYZ({
            urls: [
                'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_left + '/{z}/{x}/{-y}.png'
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
    if (layer_right) {
        //rcp85
        layer85 = map + 'TileLayer85';
        this[layer85] = new ol.layer.Tile({
            source: new ol.source.XYZ({
                urls: [
                    'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_right + '/{z}/{x}/{-y}.png'
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

     this[layer].setZIndex(1);
     if (layer_right) {
         this[layer85].setZIndex(1);
     }
    this.nameLayer.setZIndex(10);



    if (replace && timeReset) {


        $("#" + map + "SliderDiv").draggable({
            axis: "x",
            containment: "#" + map + "-container",
            scroll: false,

            drag: function (event, ui) {
                var pos,swipeVal;
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

        this[layer85].on('precompose', function (event) {
            var ctx = event.context;
            var wrapper = $("#" + map + "-container").width();
            var pos = $("#" + map + "SliderDiv").offset(); //ui.helper.offset();
            var swipeVal = (pos.left - $("#" + map + "-container").offset().left);
            var screenPercent = swipeVal / wrapper;
            var width = ctx.canvas.width * screenPercent;
            ctx.save();
            ctx.beginPath();
            ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
            ctx.clip();
        });


        this[layer85].on('postcompose', function (event) {
            var ctx = event.context;
            ctx.restore();
        });

    }

    // if (layer_right) {
    //     $("#" + map + "SliderDiv").show();
        this.setSwipeMap(map);
    // } else {
    //     $("#" + map + "SliderDiv").hide();
    // }


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
            if (self.selectedVariable[map] !== 'tmax' && self.selectedVariable[map] !== 'tmin' && self.selectedVariable[map] !== 'pcpn') {
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

Location.prototype.setSwipeMap = function (map) {


    var self = this;
    var swipeVal = null, pos, wrapper;
    var layer = map + 'TileLayer';
    var layer85 = map + 'TileLayer85';

    // console.log('layer');
    // console.log(layer);
    // console.log('layer85');
    // console.log(layer85);



    $("#" + map + "SliderDiv").draggable({
        axis: "x",
        containment: "#" + map + "-container",
        scroll: false,

        drag: function (event, ui) {
            var pos,swipeVal;
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
        var pos = $("#" + map + "SliderDiv").offset(); //ui.helper.offset();
        var swipeVal = (pos.left - $("#" + map + "-container").offset().left);
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
