var Stations = function (id, data_base_url) {

    this.data_base_url = data_base_url;

    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);

    console.log("running init");
    this.mapStations();
    this.selectedStation = id || 'daily_vs_climate';
    this.selectedSeason = 'summer';

    $(".level-1").html(this.varMapping[this.selectedStation]);

    $('#about-stations-link').html('About ' + this.varMapping[this.selectedStation]);
    $('.current').html(this.varMapping[this.selectedStation]);
    $('#about-stations-link').prop('href', '#detail-' + this.selectedStation.split('.')[0]);

    $('#stations-options').val(id).attr('selected', true).change();


    this.createMap();
    this.wireSearch();
};


/*
 * Lots of inconsistencies in naming, so here I map all the variables to one another
 *
 */
Stations.prototype.mapStations = function () {
    this.varMapping = {
        'daily_vs_climate': 'Daily vs. Climate',
        'thresholds': 'Thresholds',
        'high_tide_flooding': 'High-tide Flooding'

    };
};

function isNumeric(num) {
    return (num > 0 || num === 0 || num === '0' || num < 0) && num !== true && isFinite(num);
}

Stations.prototype.createMap = function () {
    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);


    var center = (qs.center) ? qs.center.split(',') : null;

    // make sure variable in query is valid
    if (!qs.id.match(/^(daily_vs_climate|high_tide_flooding|thresholds)$/)) {
        window.location = "error.php";
        throw new Error("MALFORMED VARIABLE");
    }


    // make sure center is valid (when it exists)
    if (center) {
        if ((isNumeric(center[0])) && (isNumeric(center[1]))) {
            //alert("Good Center");
        } else {

            window.location = "error.php";
            throw new Error("MALFORMED CENTER");
        }
    }

    // make sure zoom is valid (when it exists)
    if (qs.zoom) {
        if (!isNumeric(qs.zoom)) {
            window.location = "error.php";
            throw new Error("MALFORMED ZOOM");
        }
    }

    var view = new ol.View({
        center: center || ol.proj.transform([-105.21, 37.42], 'EPSG:4326', 'EPSG:3857'),
        zoom: qs.zoom || 5,
        minZoom: 5,
        maxZoom: 10
    });

    var scaleLineControl = new ol.control.ScaleLine();

    console.log('run map');

    this.map = new ol.Map({
        controls: ol.control.defaults({
            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
            })
        }).extend([
            scaleLineControl
        ]),
        target: 'stations-map',
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

    //add layers to map and wire events
    this.addITEMStations();
    this.wire();
};

Stations.prototype.addITEMStations = function () {
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

Stations.prototype.stationSelected = function (feature, event, type) {
    var self = this;

    if (feature) {

        $('#station-overlay-container').addClass('overlay-on');
        $('#station-overlay-container').css('visibility','visible');

        $('#stations-spinner').fadeIn(50, function () {

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

                $('#station-stations').addClass('type-tidal');

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


    $('#close-wx-station').on('click', function () {
        $('#station-data-about').show();
        //$('#station-data-container').empty();
    });
};




Stations.prototype.wireSearch = function () {
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

            } else {
                self.popup.hide();
            }
        }, 500);

    });
};
Stations.prototype.wire = function () {
    var self = this;

    //map click selector
    var select = new ol.interaction.Select({
        layers: function (layer) {
            if (layer.get('layer_id') === 'stations2') {
                return true;
            } else {
                return false;
            }
        },
        condition: ol.events.condition.click
    });


    $('#station-overlay-close').click(function () {
        $('#station-overlay-container').css('visibility','hidden');
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

    this.map.getView().on('change:resolution', function () {
        var zoom = self.map.getView().getZoom();
        $('.page-type-stations .zoom-slider').slider('value', zoom);
    });

    this.map.on('moveend', function () {
        self.updateUrl();
    });

    $('.page-type-stations .zoom-slider').attr('data-value', 4);
    $('.page-type-stations .zoom-slider').slider({
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

                //console.log(features);
                if (show === false) {
                    // clear the selections/features
                    select.getFeatures().clear();
                    // clear the popup
                    self.popup.hide();
                }
            }
        });


    });


    //var selector
    $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
        self.selectedStation = $(this).data().value;


        $('#about-stations-link').html('About ' + self.varMapping[self.selectedStation]);
        $('#about-stations-link').prop('href', '#detail-' + self.selectedStation.split('.')[0]);

        $(".level-1").html(self.varMapping[self.selectedStation]);

        self.updateUrl();
        self.updateChart();

        $('#breadcrumb .current').html(self.varMapping[self.selectedStation]);

    });


    $('#stations-options').on('change', function () {
        $("#chart-name").html($('.fs-dropdown-selected').html());
    });


    this.map.addInteraction(select);

    this.selected_collection = select.getFeatures();

    select.on('select', function (e) {

        var features = select.getFeatures();
        var feature = self.map.forEachFeatureAtPixel(e.mapBrowserEvent.pixel, function (feature, layer) {
            if (layer.get('layer_id') === 'states') {
                return null;
            } else {
                return feature;
            }
        });

        if (feature) {
            var props = feature.getProperties();
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
Stations.prototype.parseQueryString = function (qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
};
Stations.prototype.updateUrl = function () {
    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);

    //history.pushState(null, "", "?id="+self.selectedStation);
    qs.id = this.selectedStation;
    qs.zoom = this.map.getView().getZoom();
    qs.center = this.map.getView().getCenter().toString();

    var str = $.param(qs);
    history.replaceState(null, "", 'stations.php?' + str);
    setTimeout(function () {
        selectedStationOption = $('#stations-options option:selected').text();
        actualurl = window.location.href;     // Returns full URL
        actualurlEncoded = encodeURIComponent(actualurl);
        twitterurl = "https://twitter.com/intent/tweet?text=" + selectedStationOption + "+via+%40NOAA+Climate+Explorer%3A+" + actualurlEncoded;     // Returns full URL
        facebookurl = "https://www.facebook.com/sharer/sharer.php?u=" + actualurlEncoded;     // Returns full URL

        $('#share_facebook').attr("href", facebookurl);
        $('#share_facebook').attr("data-href", actualurl);
        $('#share_twitter').attr("href", twitterurl);
        $('#share_link').val(actualurl);

    }, 500)

};
Stations.prototype.setZoom = function (zoom) {
    this.map.getView().setZoom(zoom);
    this.updateUrl();
};


Stations.prototype.updateChart = function () {
    if (this.cwg) {
        this.cwg.update({
            variable: this.selectedStation
        });
    }
};