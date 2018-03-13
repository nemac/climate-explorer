var Variables = function (id, data_base_url) {

    this.data_base_url = data_base_url;

    switch (true) {
        case (id === 'days_tmax_abv_35'):
            id = 'days_tmax_gt_95f';
            break;
        case (id === 'days_prcp_abv_25'):
            id = 'days_pcpn_gt_1in';
            break;
        case (id === 'days_tmin_blw_0'):
            id = 'days_tmin_lt_32f';
            break;
        case (id === 'heating_degree_day_18'):
            id = 'hdd_65f';
            break;
        case (id === 'cooling_degree_day_18'):
            id = 'cdd_65f';
            break;
    }

    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);

    this.mapVariables();
    this.selectedVariable = id || 'tmax';
    this.activeYear = qs.year || 2020;
    this.selectedSeason = 'summer';

    $(".level-1").html(this.varMapping[this.selectedVariable]);

    $('#about-variable-link').html('About ' + this.varMapping[this.selectedVariable]);
    $('#about-variable-link').prop('href', '#detail-' + this.selectedVariable.split('.')[0]);

    $('#variable-options').val(id).attr('selected', true).change();

    var legendFilename;

    if (this.selectedVariable === 'tmax' ) {
        legendFilename = 'summer_tmax';
    } else if (this.selectedVariable === 'tmin' ) {
        legendFilename = 'summer_tmin';
    } else {
        legendFilename = this.selectedVariable;
    }


    $('#vars-legend .legend #legend-container').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');

    this.createMap();
    this.wireSearch();
};


/*
 * Lots of inconsistencies in naming, so here I map all the variables to one another
 *
 */
Variables.prototype.mapVariables = function () {
    this.varMapping = {
        'tmax': 'Avg Daily Max Temp (°F)',
        'tmin': 'Avg Daily Min Temp (°F)',
        'days_tmin_lt_32f': 'Days With Minimum Below 32F&deg; F',
        'days_tmax_gt_90f': 'Days w/ max > 90°F',
        'days_tmax_gt_95f': 'Days With Maximum Above 95&deg; F',
        'pcpn': 'Total precip',
        'days_pcpn_gt_1in': 'Days of Precipitation Above 1 Inch',
        'cdd_65f': 'Cooling Degree Days',
        'hdd_65f': 'Heating Degree Days',

        'days_tmax_gt_100f':   'Days w/ max > 100°F',
        'days_tmax_gt_105f':   'Days w/ max > 105°F',
        'days_tmax_lt_32f':    'Days w/ max < 32°F',
        'days_tmin_gt_80f':    'Days w/ min > 80°F',
        'days_tmin_gt_90f':    'Days w/ min > 90°F',
        'days_pcpn_gt_2in':    'Days w/ > 2 in',
        'days_pcpn_gt_3in':    'Days w/ > 3 in',
        'days_dry_days': 'Dry Days',
        'gdd':                 'Growing Degree Days',
        'gddmod':              'Mod. Growing Degree Days'

    };

    this.tilesHistMapping = {
        'tmax': '-hist-tmax',
        'tmin': '-hist-tmin',
        'days_tmin_lt_32f': '-annual-hist-days_tmin_lt_32f',
        'days_tmax_gt_95f': '-annual-hist-days_tmax_gt_95f',

        'days_tmax_gt_90f':    '-annual-hist-days_tmax_gt_90f',
        'days_tmax_gt_100f':   '-annual-hist-days_tmax_gt_100f',
        'days_tmax_gt_105f':   '-annual-hist-days_tmax_gt_105f',
        'days_tmax_lt_32f':    '-annual-hist-days_tmax_lt_32f',
        'days_tmin_gt_80f':    '-annual-hist-days_tmin_gt_80f',
        'days_tmin_gt_90f':    '-annual-hist-days_tmin_gt_90f',
        'days_pcpn_gt_2in':    '-annual-hist-days_pcpn_gt_2in',
        'days_pcpn_gt_3in':    '-annual-hist-days_pcpn_gt_3in',
        'days_dry_days': '-annual-hist-dry_days',
        'gdd':                 '-annual-hist-gdd',
        'gddmod':              '-annual-hist-gddmod',

        'pcpn': '-hist-pcpn',
        'days_pcpn_gt_1in': '-annual-hist-days_pcpn_gt_1in',
        'cdd_65f': '-annual-hist-cdd_65f',
        'hdd_65f': '-annual-hist-hdd_65f'
    };

    this.tilesMapping = {
        'tmax': '-rcp45-tmax',
        'tmin': '-rcp45-tmin',
        'days_tmin_lt_32f': '-annual-rcp45-days_tmin_lt_32f',
        'days_tmax_gt_95f': '-annual-rcp45-days_tmax_gt_95f',

        'days_tmax_gt_90f':    '-annual-rcp45-days_tmax_gt_90f',
        'days_tmax_gt_100f':   '-annual-rcp45-days_tmax_gt_100f',
        'days_tmax_gt_105f':   '-annual-rcp45-days_tmax_gt_105f',
        'days_tmax_lt_32f':    '-annual-rcp45-days_tmax_lt_32f',
        'days_tmin_gt_80f':    '-annual-rcp45-days_tmin_gt_80f',
        'days_tmin_gt_90f':    '-annual-rcp45-days_tmin_gt_90f',
        'days_pcpn_gt_2in':    '-annual-rcp45-days_pcpn_gt_2in',
        'days_pcpn_gt_3in':    '-annual-rcp45-days_pcpn_gt_3in',
        'days_dry_days': '-annual-rcp45-dry_days',
        'gdd':                 '-annual-rcp45-gdd',
        'gddmod':              '-annual-rcp45-gddmod',

        'pcpn': '-rcp45-pcpn',
        'days_pcpn_gt_1in': '-annual-rcp45-days_pcpn_gt_1in',
        'cdd_65f': '-annual-rcp45-cdd_65f',
        'hdd_65f': '-annual-rcp45-hdd_65f'
    };

    this.tilesMapping85 = {
        'tmax': '-rcp85-tmax',
        'tmin': '-rcp85-tmin',
        'days_tmin_lt_32f': '-annual-rcp85-days_tmin_lt_32f',
        'days_tmax_gt_95f': '-annual-rcp85-days_tmax_gt_95f',

        'days_tmax_gt_90f':    '-annual-rcp85-days_tmax_gt_90f',
        'days_tmax_gt_100f':   '-annual-rcp85-days_tmax_gt_100f',
        'days_tmax_gt_105f':   '-annual-rcp85-days_tmax_gt_105f',
        'days_tmax_lt_32f':    '-annual-rcp85-days_tmax_lt_32f',
        'days_tmin_gt_80f':    '-annual-rcp85-days_tmin_gt_80f',
        'days_tmin_gt_90f':    '-annual-rcp85-days_tmin_gt_90f',
        'days_pcpn_gt_2in':    '-annual-rcp85-days_pcpn_gt_2in',
        'days_pcpn_gt_3in':    '-annual-rcp85-days_pcpn_gt_3in',
        'days_dry_days': '-annual-rcp85-dry_days',
        'gdd':                 '-annual-rcp85-gdd',
        'gddmod':              '-annual-rcp85-gddmod',

        'pcpn': '-rcp85-pcpn',
        'days_pcpn_gt_1in': '-annual-rcp85-days_pcpn_gt_1in',
        'cdd_65f': '-annual-rcp85-cdd_65f',
        'hdd_65f': '-annual-rcp85-hdd_65f'
    };
};


/*
 * Creates MAIN map
 *
 *
 */

function isNumeric(num) {
    return (num > 0 || num === 0 || num === '0' || num < 0) && num !== true && isFinite(num);
}


Variables.prototype.createMap = function () {
    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);


    var center = ( qs.center ) ? qs.center.split(',') : null;

    // make sure variable in query is valid
    if (!qs.id.match(/^(tmax|tmin|days_tmax_gt_90f|days_tmax_gt_95f|days_tmax_gt_100f| days_tmax_gt_105f|days_tmax_lt_32f|days_tmin_lt_32f|days_tmin_gt_80f|days_tmin_gt_90f|pcpn|days_pcpn_gt_1in|days_pcpn_gt_2in|days_pcpn_gt_3in|days_pcpn_gt_4in|days_dry_days|hdd_65f|cdd_65f|gdd|gddmod)$/)) {
        window.location = "error.php";
        throw new Error("MALFORMED VARIABLE");
    }


    // make sure center is valid (when it exists)
    if (center){
        if ((isNumeric(center[0]))&&(isNumeric(center[1])))
        {
            //alert("Good Center");
        } else {

            window.location = "error.php";
            throw new Error("MALFORMED CENTER");
        }
    }

    // make sure zoom is valid (when it exists)
    if (qs.zoom){
        if (!isNumeric(qs.zoom))
        {
            window.location = "error.php";
            throw new Error("MALFORMED ZOOM");
        }
    }


    // make sure year is valid (when it exists)
    /*if (qs.year){
        if (!isNumeric(qs.year))
        {
            window.location = "error.php";
            throw new Error("MALFORMED YEAR");
        }
    }*/


    var view = new ol.View({
        center: center || ol.proj.transform([-105.21, 37.42], 'EPSG:4326', 'EPSG:3857'),
        zoom: qs.zoom || 5,
        minZoom: 5,
        maxZoom: 10
    });

    var scaleLineControl = new ol.control.ScaleLine();

    this.map = new ol.Map({
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }).extend([
            scaleLineControl
        ]),
        target: 'variable-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
                    attributions: [new ol.Attribution({html: ['&copy; Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, and the GIS user community ']})],
                    maxZoom: 10
                })
            })
        ],
        view: view
    });

    this.popup = new ol.Overlay.Popup();
    this.map.addOverlay(this.popup);
    this.wire();
    //add layers to map and wire events
    this.addCounties();
    this.addStates();

    le_option_selected = $(".emissions-low .fs-dropdown-selected").text();
    he_option_selected = $(".emissions-high .fs-dropdown-selected").text();


    if (this.selectedVariable === 'pcpn' || this.selectedVariable === 'days_dry_days') {
        le_option_selected = 'LOWER EMISSIONS';
        he_option_selected = 'HIGHER EMISSIONS';
        $(".emissions-low .fs-dropdown-selected").text(le_option_selected);
        $(".emissions-low button[data-value=lower_historical]").hide();
        $(".emissions-low button[data-value=higher_historical]").hide();
        $(".emissions-high .fs-dropdown-selected").text(he_option_selected);
        $(".emissions-high button[data-value=lower_historical]").hide();
        $(".emissions-high button[data-value=higher_historical]").hide();

    } else {
        $(".emissions-low button[data-value=lower_historical]").show();
        $(".emissions-low button[data-value=higher_historical]").show();
        $(".emissions-high button[data-value=lower_historical]").show();
        $(".emissions-high button[data-value=higher_historical]").show();

    }
    this.updateTiledLayer(true, false,le_option_selected,he_option_selected);

};


/*
 *
 * Wires up search so user can use sidebar search for location in map
 *
 */
Variables.prototype.wireSearch = function () {
    var self = this;

    $("#formmapper").formmapper({
        details: "form"
    });

    $("#formmapper").bind("geocode:result", function (event, result) {
        var lat, lon;
        if (result.geometry.access_points) {
            lat = result.geometry.access_points[0].location.lat;
            lon = result.geometry.access_points[0].location.lng;
        } else {
            lat = result.geometry.location.lat();
            lon = result.geometry.location.lng();
        }

        var conv = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        var xy = self.map.getPixelFromCoordinate(conv);

        self.map.getView().setZoom(8);
        self.map.getView().setCenter(conv);

        setTimeout(function () {
            var center = self.map.getView().getCenter();
            xy = self.map.getPixelFromCoordinate(center);

            var feature = self.map.forEachFeatureAtPixel(xy, function (feature, layer) {
                var id = layer.get('layer_id');
                if (id === 'states') {
                    return null;
                } else {
                    return feature;
                }
            });

            var e = {};
            e.mapBrowserEvent = {};
            e.mapBrowserEvent.coordinate = center;
            if (feature) {
                self.selected_collection.clear();
                self.selected_collection.push(feature);
                var props = feature.getProperties();
                self.countySelected(feature, e);
            } else {
                self.popup.hide();
            }
        }, 500);

    });
};


/*
 * Wire map and UI events
 *
 *
 */
Variables.prototype.wire = function () {
    var self = this;

    this.map.getView().on('change:resolution', function () {
        var zoom = self.map.getView().getZoom();
        $('.page-type-variables .zoom-slider').slider('value', zoom);
    });

    this.map.on('moveend', function () {
        self.updateUrl();
    });

    $('.page-type-variables .zoom-slider').attr('data-value', 4);
    $('.page-type-variables .zoom-slider').slider({
        orientation: "vertical",
        range: false,
        min: 5,
        max: 10,
        value: 0,
        slide: function (event, ui) {
            $(this).attr('data-value', ui.value);
            self.setZoom(ui.value);
        },
        change: function (event, ui) {
            $(this).attr('data-value', ui.value);
            self.setZoom(ui.value);
        }
    });

    // help icon
    $('#vars-menu .help').click(function (e) {
        e.preventDefault();
        var current_legend = $(this).parents('.legend');
        if (current_legend.hasClass('info-on')) {
            $('body').close_layer_info();
        } else {
            current_legend.open_layer_info();
        }
    });

    //map click selector
    var select = new ol.interaction.Select({
        layers: function (layer) {
            if (layer.get('layer_id') === 'states') {
                return false;
            } else {
                return true;
            }
        },
        condition: ol.events.condition.click
    });


    //layer show / hide handlers
    $('#counties-overlay-toggle').on('click', function (e) {
        var show = $(this).is(':checked');

        self.map.getLayers().forEach(function (layer) {
            if (layer.get('layer_id') === 'counties') {

                var source = layer.getSource();
                var features = source.getFeatures();

                if (show) {
                    layer.setOpacity(1);
                }
                layer.setVisible(show);

                if (show === false){
                    // clear the selections/features
                    select.getFeatures().clear();
                    // clear the popup
                    self.popup.hide();
                }
            }
        });


    });


    this.map.addInteraction(select);
    //var selector
    $('#variable-options-container .fs-dropdown-item').on('click', function (e) {
        self.selectedVariable = $(this).data().value;

        var legendFilename;

        if (self.selectedVariable === 'tmax' ) {
            legendFilename = 'summer_tmax';
        } else if (self.selectedVariable === 'tmin' ) {
            legendFilename = 'summer_tmin';
        } else {
            legendFilename = self.selectedVariable;
        }


        $('#vars-legend .legend #legend-container').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');


        $('#about-variable-link').html('About ' + self.varMapping[self.selectedVariable]);
        $('#about-variable-link').prop('href', '#detail-' + self.selectedVariable.split('.')[0]);

        $(".level-1").html(self.varMapping[self.selectedVariable]);

        self.updateUrl();

        le_option_selected = $(".emissions-low .fs-dropdown-selected").text();
        he_option_selected = $(".emissions-high .fs-dropdown-selected").text();

        if (self.selectedVariable === 'pcpn' || self.selectedVariable === 'days_dry_days') {
            le_option_selected = 'LOWER EMISSIONS';
            he_option_selected = 'HIGHER EMISSIONS';
            $(".emissions-low .fs-dropdown-selected").text(le_option_selected);
            $(".emissions-low button[data-value=lower_historical]").hide();
            $(".emissions-low button[data-value=higher_historical]").hide();
            $(".emissions-high .fs-dropdown-selected").text(he_option_selected);
            $(".emissions-high button[data-value=lower_historical]").hide();
            $(".emissions-high button[data-value=higher_historical]").hide();

        } else {


            $(".emissions-low button[data-value=lower_historical]").show();
            $(".emissions-low button[data-value=higher_historical]").show();
            $(".emissions-high button[data-value=lower_historical]").show();
            $(".emissions-high button[data-value=higher_historical]").show();

            if (le_option_selected === 'lower'){
                $(".emissions-low .fs-dropdown-selected").text('LOWER EMISSIONS');
            } else {
                $(".emissions-low .fs-dropdown-selected").text('HISTORICAL');
                le_option_selected = 'HISTORICAL';
            }


        }

        self.updateTiledLayer(true, true,le_option_selected,he_option_selected);

        self.updateChart();

        $('#breadcrumb .current').html(self.varMapping[self.selectedVariable]);

    });

    $('.emissions-low .fs-dropdown-item').on('click', function (e) {
        left_option_selected = this.innerHTML;
        right_option_selected = $(".emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer(true, false, left_option_selected, right_option_selected);
    });
    //
    // $('.emissions-low .fs-dropdown-item').on('click', function (e) {
    //     thisone = $(this).data().value;
    //     if (thisone === 'lower'){
    //         $(".emissions-low .fs-dropdown-selected").text('LOWER EMISSIONS');
    //     } else {
    //         $(".emissions-low .fs-dropdown-selected").text('HISTORICAL');
    //     }
    //     otherone = $(".emissions-high .fs-dropdown-selected").text();
    //     self.updateTiledLayer(true,false,thisone,otherone);
    // });

    // $('.emissions-high .fs-dropdown-item').on('click', function (e) {
    //     thisone = $(this).data().value;
    //     if (thisone === 'higher'){
    //         $(".emissions-high .fs-dropdown-selected").text('HIGHER EMISSIONS');
    //     } else {
    //         $(".emissions-high .fs-dropdown-selected").text('HISTORICAL');
    //     }
    //     otherone = $(".emissions-high .fs-dropdown-selected").text();
    //     self.updateTiledLayer(true,false,otherone,thisone);
    // });


    $('.emissions-high .fs-dropdown-item').on('click', function (e) {
        left_option_selected = $(".emissions-low .fs-dropdown-selected").text();
        right_option_selected = this.innerHTML;
        self.updateTiledLayer(true, false, left_option_selected, right_option_selected);
    });

    $('#map-seasons-container .fs-dropdown-item').on('click', function (e) {
        self.selectedSeason = $(this).data().value;
        le_option_selected = $(".emissions-low .fs-dropdown-selected").text();
        he_option_selected = $(".emissions-high .fs-dropdown-selected").text();
        self.updateTiledLayer(true, true,le_option_selected,he_option_selected);
        var legendFilename;
        legendFilename = self.selectedSeason + '_' + self.selectedVariable;
        $('#vars-legend .legend #legend-container').html('<img class="legend-image" src="resources/img/legends/' + legendFilename + '.png">');
    });

    $('#variable-options').on('change', function () {
        $("#chart-name").html($('.fs-dropdown-selected').html());
    });




    this.selected_collection = select.getFeatures();

    select.on('select', function (e) {

        $('#variable-options-container .fs-dropdown-item').on('click', function (e) {
            self.popup.hide();
            var features = select.getFeatures();
            features.remove(feature);
        });

        var features = select.getFeatures();
        var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
            var id = layer.get('layer_id');
            if (id === 'states') {
                return null;
            } else {
                return feature;
            }
        });

        if (feature) {
            var props = feature.getProperties();
            self.countySelected(feature, e);
        } else {
            features.remove(feature);
            self.popup.hide();
        }

        $('.ol-popup-closer').on('click', function () {
            self.popup.hide();
            features.remove(feature);
            e.preventDefault();
        });
    });
};



Variables.prototype.parseQueryString = function (qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
};


Variables.prototype.updateUrl = function () {
    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);

    //history.pushState(null, "", "?id="+self.selectedVariable);
    qs.id = this.selectedVariable;
    qs.zoom = this.map.getView().getZoom();
    qs.center = this.map.getView().getCenter().toString();
    qs.year = this.activeYear;

    var str = $.param(qs);
    history.replaceState(null, "", 'variables.php?' + str);
    setTimeout(function () {
        selectedVariableOption = $('#variable-options option:selected').text();
        actualurl      = window.location.href;     // Returns full URL
        actualurlEncoded = encodeURIComponent(actualurl);
        twitterurl      = "https://twitter.com/intent/tweet?text=" + selectedVariableOption + "+via+%40NOAA+Climate+Explorer%3A+" + actualurlEncoded;     // Returns full URL
        facebookurl      = "https://www.facebook.com/sharer/sharer.php?u=" + actualurlEncoded;     // Returns full URL


        $('#share_facebook').attr("href",facebookurl);
        $('#share_facebook').attr("data-href",actualurl);
        $('#share_twitter').attr("href",twitterurl);
        $('#share_link').val(actualurl);

    }, 500)

};


/*
 * Sets zoom on map
 * Triggered from custom zoom control in global_functions.js
 *
 */
Variables.prototype.setZoom = function (zoom) {
    this.map.getView().setZoom(zoom);
    this.updateUrl();
};


/*
 *
 * get counties geojson and add to map
 *
 */
Variables.prototype.addCounties = function () {

    var self = this;
    var style = function (feature, resolution) {

        return [new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.1)'
            }),
            stroke: new ol.style.Stroke({
                //color: '#2980b9',
                color: '#444',
                width: 0.2
            })
        })];

    };

    this.vectorLayer = new ol.layer.Vector({
        title: 'added Layer',
        source: new ol.source.Vector({
            url: this.data_base_url + 'counties-20m.json',
            format: new ol.format.GeoJSON()
        }),
        style: style
    });

    this.vectorLayer.set('layer_id', 'counties');
    //this.vectorLayer.setVisible(false);
    this.vectorLayer.setOpacity(0);
    self.map.addLayer(this.vectorLayer);

    setTimeout(function () {
        self.vectorLayer.setVisible(false);
    }, 500)
};


/*
 *
 * get states geojson and add to map
 *
 */
Variables.prototype.addStates = function () {

    var self = this;

    var style = function (feature, resolution) {

        return [new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 0, 0, 0)'
            }),
            stroke: new ol.style.Stroke({
                color: '#444',
                width: 0.8
            })
        })];

    };

    this.statesLayer = new ol.layer.Vector({
        title: 'added Layer',
        source: new ol.source.Vector({
            url: this.data_base_url + 'states.json',
            format: new ol.format.GeoJSON()
        }),
        style: style
    });

    this.statesLayer.set('layer_id', 'states');
    this.map.addLayer(this.statesLayer);

};


/*
 * Highlight county feature
 * Also shows popup with the climate widget chart inside
 * Have to build chart UI dynamically
 *
 */
Variables.prototype.countySelected = function (feature, event) {
    var self = this;

    if (feature) {
        var props = feature.getProperties();
        var fips = props.STATE + props.COUNTY;
        var lonlat = ol.proj.transform(event.mapBrowserEvent.coordinate, 'EPSG:3857', 'EPSG:4326');
        var lon = lonlat[0];
        var lat = lonlat[1];
        var state = this.stateFips[props.STATE];

        var html = '<span class="text">' +
            'Chart<span class="full-title">: <a href="location.php?county=' + props.NAME + '+County&city=' + props.NAME + ', ' + state + '&fips=' + fips + '&lat=' + lat + '&lon=' + lon + '">' + props.NAME + ' County</a></span><br />' +
            '<span class="source" id="chart-name">' + $('.fs-dropdown-selected').html() + '</span>' +
            '</span>' +
            '<div class="data-accordion-actions">' +
            '<a href="#" class="how-to-read-county"><span class="icon icon-help"></span>How to read this</a>' +
            '<a href="#" class="download-image"><span class="icon icon-download-image"></span>Image</a>' +
            '<a href="#" class="download-data"><span class="icon icon-download-chart"></span>Data</a>' +
            '</div>' +
            '</header>' +
            '<div id="climate-chart" style="width:800px; height:420px"></div>' +
            '<div class="chart-legend">' +
            '<div id="historical-obs" class="legend-item legend-item-range">' +
            '<div class="legend-item-line-container">' +
            '<div class="legend-item-line observed" id="over-baseline-block"></div>' +
            '</div>' +
            '<span class="legend-item-line-label">Observations</span>' +
            '</div>' +
            '<div id="historical-range" class="legend-item legend-item-range selected">' +
            '<div class="legend-item-block selected" id="historical-block"></div>' +
            'Historical (Modelled)' +
            '</div>' +
            '<div id="rcp45-range" class="legend-item legend-item-range selected">' +
            '<div class="legend-item-block selected" id="rcp45-block"></div>' +
            'Lower Emissions' +
            '</div>' +
            '<div id="rcp85-range" class="legend-item legend-item-range selected">' +
            '<div class="legend-item-block selected" id="rcp85-block"></div>' +
            'Higher Emissions' +
            '</div>' +
            '<div id="rcp45-mean" class="legend-item legend-item-range selected">' +
            '<div class="legend-item-line-container">' +
            '<div class="legend-item-line selected" id="rcp85-line"></div>' +
            '<div class="legend-item-line selected" id="rcp45-line"></div>' +
            '</div>' +
            '<span class="legend-item-line-label">Averages</span>' +
            '</div>' +
            '</div>' +
            '<div class="range" id="variable-slider">' +
            '<div id="slider-range"></div>' +
            '<div class="ui-slider-label range-label min" id="range-low">1950</div>' +
            '<div class="ui-slider-label range-label max" id="range-high">2100</div>' +
            '</div>';
        this.popup.show(event.mapBrowserEvent.coordinate, html);

        self.cwg = climate_widget.graph({
            div: "div#climate-chart",
            dataprefix: "/climate-explorer2-data/data",
            font: "Roboto",
            frequency: "annual",
            county: fips,
            variable: this.selectedVariable,
            scenario: "both",
            pmedian: "true",
            histobs: "false"
        });

        $('.legend-item-range').on('click', function () {
            $(this).toggleClass('selected');
            $(this).children('.legend-item-block, .legend-item-line').toggleClass('selected');
            $(this).children('.legend-item-line-container').children('.legend-item-line').toggleClass('selected');

            var scenario = null;
            switch (true) {
                case $('#rcp85-block').hasClass('selected') && $('#rcp45-block').hasClass('selected'):
                    scenario = 'both';
                    break;
                case $('#rcp45-block').hasClass('selected'):
                    scenario = 'rcp45';
                    break;
                case $('#rcp85-block').hasClass('selected'):
                    scenario = 'rcp85';
                    break;
                default:
                    scenario = '';
            }

            var median = null;
            switch (true) {
                case $('#rcp85-line').hasClass('selected') && $('#rcp45-line').hasClass('selected'):
                    median = 'true';
                    break;
                case $('#rcp45-line').hasClass('selected'):
                    median = 'true';
                    break;
                case $('#rcp85-line').hasClass('selected'):
                    median = 'true';
                    break;
                default:
                    median = 'false';
            }

            var histmod = null;
            switch (true) {
                case $('#historical-block').hasClass('selected') && $('#historical-block').hasClass('selected'):
                    histmod = 'true';
                    break;
                case $('#historical-block').hasClass('selected'):
                    histmod = 'true';
                    break;
                default:
                    histmod = 'false';
            }


            var histobs = null;
            switch (true) {
                case $('#over-baseline-block').hasClass('selected') && $('#under-baseline-block').hasClass('selected'):
                    histobs = 'true';
                    break;
                case $('#over-baseline-block').hasClass('selected'):
                    histobs = 'true';
                    break;
                case $('#under-baseline-block').hasClass('selected'):
                    histobs = 'true';
                    break;
                default:
                    histobs = 'false';
            }

            self.cwg.update({
                pmedian: median,
                scenario: scenario,
                histobs: histobs,
                histmod: histmod
            });

        });

        $('.download-image').click(function () {
            self.cwg.download_image(this, 'graph.png');
        });

        $('.download-data').click(function (e) {

            $('#download-panel').removeClass("hidden");

            $('#download-panel').show();
            $('#download-panel').fadeIn(250);

        });

        $('#download_hist_obs_data').click(function () {
            if (cwg) {
                cwg.download_hist_obs_data(this)
            }
        });
        $('#download_hist_mod_data').click(function () {
            if (cwg) {
                cwg.download_hist_mod_data(this)
            }
        });
        $('#download_proj_mod_data').click(function () {
            if (cwg) {
                cwg.download_proj_mod_data(this)
            }
        });



        $('#download-dismiss-button').click(function () {
            $('#download-panel').addClass("hidden");
            $('#download-panel').hide();
        });



        $('#download-precip-dismiss-button').click(function () {
            $('#download-precip-panel').addClass("hidden");
            $('#download-precip-panel').hide();
        });



        $('#download-derived-dismiss-button').click(function () {
            $('#download-derived-panel').addClass("hidden");
            $('#download-derived-panel').hide();
        });

        $('.how-to-read').on('click', function () {
            var pre = '';
            var closest = $(this).closest('.data-chart').attr('id');
            if (closest === 'precipitation-chart') {
                pre = 'precip-';
            }
            if (closest === 'derived-chart') {
                pre = 'derive-';
            }
            if (app) {
                app.takeGraphTour(pre);
            }
        });

        $("#slider-range").slider({
            range: true,
            min: 1950,
            max: 2099,
            values: [1950, 2099],
            slide: function (event, ui) {
                self.updateUrl();
                return self.cwg.setXRange(ui.values[0], ui.values[1]);
            }
        });

    } else {
        this.cwg = null;
        this.popup.hide();
    }
};


/*
 *
 * Main tile layer for all the climate tiles
 * Replace indicates if we are updating existing tiles, or if we are starting new variable
 * Given a "replace" we re-create slider / swiper at end of function
 *
 */
Variables.prototype.updateTiledLayer = function (replace, preserveTime,le_option_selected,he_option_selected) {
    var self = this;
    var histYears = [1950, 1960, 1970, 1980, 1990, 2000];
    var seasons = ['tmax', 'tmin', 'pcpn'];


    if (!le_option_selected){
        le_option_selected = $('.emissions-low .fs-dropdown-selected').text();
    }
    if (!he_option_selected) {
        he_option_selected = $('.emissions-high .fs-dropdown-selected').text();
    }

    console.log("     TILING: " + replace, preserveTime,le_option_selected,he_option_selected);

    if ( self.selectedVariable !== 'tmax' && self.selectedVariable !== 'tmin' && self.selectedVariable !== 'pcpn' && this.activeYear === 2000 ) {
        this.activeYear = 2020;
    }

    //var extent = ol.proj.transformExtent([-135, 11.3535322866, -56.25, 49.5057345956], 'EPSG:4326', 'EPSG:3857');

    var hist = null;
    var season = ( seasons.indexOf(this.selectedVariable) !== -1 ) ? '-' + this.selectedSeason : '';

    console.log('     SEASON: ' + season);
    console.log('   LEFT VAL: ' + le_option_selected);
    console.log('  RIGHT VAL: ' + he_option_selected);

    if (season === '') {
        $('#map-seasons-container .fs-dropdown-selected').hide();
    } else {
        $('#map-seasons-container .fs-dropdown-selected').show();
    }

    var layer_left, layer_right;

    if (histYears.indexOf(this.activeYear) !== -1) {

        if (le_option_selected === 'HISTORICAL') {
            layer_left = 'avg' + season + this.tilesHistMapping[this.selectedVariable];
        } else {
            layer_left = this.activeYear + season + this.tilesHistMapping[this.selectedVariable];
        }

        if (he_option_selected === 'HISTORICAL') {
            layer_right = 'avg' + season + this.tilesHistMapping[this.selectedVariable];
        } else {
            layer_right = this.activeYear + season + this.tilesHistMapping[this.selectedVariable];
        }


    } else {

        if (le_option_selected === 'HISTORICAL') {
            layer_left = 'avg' + season + this.tilesHistMapping[this.selectedVariable];
        } else {
            layer_left = this.activeYear + season + this.tilesMapping[this.selectedVariable];
        }

        if (he_option_selected === 'HISTORICAL') {
            layer_right = 'avg' + season + this.tilesHistMapping[this.selectedVariable];
        } else {
            layer_right = this.activeYear + season + this.tilesMapping85[this.selectedVariable];
        }

    }


    /*
     * Replace! So we set existing tiles to "old", and wait a second to remove
     * this means no flashing between layers – new one is drawn, old is removed a second later
     */
    if (replace) {
        this.removeOldTiles();
    }


    /*
     * Create the rcp45 tile layer
     */



    this.tileLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            urls: [
                'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_left + '/{z}/{x}/{-y}.png'
            ],
            //extent: extent,
            minZoom: 5,
            maxZoom: 10,
            tilePixelRatio: 1
        })
    });


    //add rcp45 tile layer to map
    this.tileLayer.set('layer_id', 'tile_layer');
    this.map.addLayer(this.tileLayer);


    /*
     * if after 2010, add the rcp85 tile layer to map as well!
     */
    if (layer_right) {
        //rcp85
        this.tileLayer85 = new ol.layer.Tile({
            source: new ol.source.XYZ({
                urls: [
                    'https://s3.amazonaws.com/climate-explorer-bucket/tiles/' + layer_right + '/{z}/{x}/{-y}.png'
                ],
                //extent: extent,
                minZoom: 5,
                maxZoom: 10,
                tilePixelRatio: 1
            })
        });

        this.tileLayer85.set('layer_id', 'tile_layer');
        this.map.addLayer(this.tileLayer85);



    }

    console.log(' LAYER LEFT: ' + layer_left);
    console.log('LAYER RIGHT: ' + layer_right);
    console.log("==============================================================================================");

    /*
     * We want map names to be on top of climate tiles, so add to map at end!
     */
    if (this.nameLayer) {
        this.map.removeLayer(this.nameLayer);
    } //don't add twice!
    this.nameLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
            attributions: [new ol.Attribution({html: ['']})],
            maxZoom: 10
        })
        // source: new ol.source.XYZ({
        //     url: 'http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
        //     subdomains: 'abcd',
        //     attributions: [new ol.Attribution({html: ['&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>']})]
        // })
    });

    this.nameLayer.set('layer_id', 'name_layer');
    this.map.addLayer(this.nameLayer);


    //here we have to move some layers around so ordering remains right
    this.tileLayer.setZIndex(0);
    if (layer_right) {
        this.tileLayer85.setZIndex(0);
    }
    if (this.statesLayer) {
        this.statesLayer.setZIndex(4);
    }
    if (this.vectorLayer) {
        this.vectorLayer.setZIndex(5);
    }
    this.nameLayer.setZIndex(6);




    //IF after 2010, add the high/low swiper to map
    if (layer_right) {
        $("#sliderDiv").show();
        this.setSwipeMap();
    } else {
        //else hide it
        $("#sliderDiv").hide();
    }

    //If new map tiles, reset time slider
    if (replace && !preserveTime) {
        this.setSlider();
    }

};


/*
 * Removes old climate tiles from map
 * Timeout means new tiles will load before we remove old, so there isn't a
 * flash of map with no tiles at all
 *
 */
Variables.prototype.removeOldTiles = function () {
    var self = this;

    this.oldTile = this.tileLayer;
    this.oldTile85 = this.tileLayer85;

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
 * Logic for high/low emissions swiper
 *
 *
 */
Variables.prototype.setSwipeMap = function () {
    var self = this;
    var swipeVal = null, pos, wrapper;

    $("#sliderDiv").draggable({
        axis: "x",
        containment: "#variable-map",
        scroll: false,
        drag: function (event, ui) {
            pos = ui.helper.offset();
            swipeVal = (pos.left - 20);
            self.tileLayer.dispatchEvent('change');
            $(".emissions-low").fadeOut();
            $(".emissions-high").fadeOut();
        },
        stop: function (event, ui) {
            pos = ui.helper.offset();
            swipeVal = (pos.left - 20);
            self.tileLayer.dispatchEvent('change');
            $(".emissions-low").fadeIn();
            $(".emissions-high").fadeIn();
        }
    });

    this.tileLayer85.on('precompose', function (event) {
        var ctx = event.context;
        var wrapper = $("#variable-map").width();
        if (swipeVal === null) {
            pos = $("#sliderDiv").offset(); //ui.helper.offset();
            swipeVal = (pos.left - 20);
        }
        var screenPercent = swipeVal / wrapper;
        var width = ctx.canvas.width * screenPercent;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
        ctx.clip();
    });

    this.tileLayer85.on('postcompose', function (event) {
        var ctx = event.context;
        ctx.restore();
    });
};


/*
 *
 * Creates time slider
 *
 */
Variables.prototype.setSlider = function () {
    var self = this;
    var year_slider = $('#variable-time-slider');

    var tooltip = $('<span class="tooltip">' + self.activeYear + '</span>').hide();

    var year_min = parseInt($('#year-slider-container').find('.year-min').text());
    var year_max = parseInt($('#year-slider-container').find('.year-max').text());

    year_slider.slider({
        range: false,
        min: year_min,
        max: year_max,
        step: 10,
        value: self.activeYear,
        slide: function (event, ui) {
            if ( self.selectedVariable !== 'tmax' && self.selectedVariable !== 'tmin' && self.selectedVariable !== 'pcpn') {
                if ( ui.value === 2000 ) {
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

            le_option_selected = $(".emissions-low .fs-dropdown-selected").text();
            he_option_selected = $(".emissions-high .fs-dropdown-selected").text();

            self.updateTiledLayer(true, true);

            self.updateUrl();
            tooltip.fadeOut(200);
        }
    }).find(".ui-slider-handle").html('<span class="icon icon-arrow-left-right"></span>').append(tooltip);

    $(this).hover(function () {
        tooltip.fadeIn(200);
    }, function () {
        tooltip.fadeOut(100);
    });

    tooltip.fadeIn(200);

}


/*
 * Update the chart!
 *
 */
Variables.prototype.updateChart = function () {
    if (this.cwg) {
        this.cwg.update({
            variable: this.selectedVariable
        });
    }
};


/*
 * State fips for use in UI
 *
 */
Variables.prototype.stateFips = {
    "02": "AK",
    "01": "AL",
    "05": "AR",
    "60": "AS",
    "04": "AZ",
    "06": "CA",
    "08": "CO",
    "09": "CT",
    "11": "DC",
    "10": "DE",
    "12": "FL",
    "13": "GA",
    "66": "GU",
    "15": "HI",
    "19": "IA",
    "16": "ID",
    "17": "IL",
    "18": "IN",
    "20": "KS",
    "21": "KY",
    "22": "LA",
    "25": "MA",
    "24": "MD",
    "23": "ME",
    "26": "MI",
    "27": "MN",
    "29": "MO",
    "28": "MS",
    "30": "MT",
    "37": "NC",
    "38": "ND",
    "31": "NE",
    "33": "NH",
    "34": "NJ",
    "35": "NM",
    "32": "NV",
    "36": "NY",
    "39": "OH",
    "40": "OK",
    "41": "OR",
    "42": "PA",
    "72": "PR",
    "44": "RI",
    "45": "SC",
    "46": "SD",
    "47": "TN",
    "48": "TX",
    "49": "UT",
    "51": "VA",
    "78": "VI",
    "50": "VT",
    "53": "WA",
    "55": "WI",
    "54": "WV",
    "56": "WY"
}
