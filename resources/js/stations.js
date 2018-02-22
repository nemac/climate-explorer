var Stations = function (id, data_base_url) {

    this.data_base_url = data_base_url;

    var qtrs = location.search;
    var qs = this.parseQueryString(qtrs);

    console.log("running init");
    this.mapStations();
    this.selectedStationType = id || 'daily_vs_climate';
    this.selectedSeason = 'summer';

    $(".level-1").html(this.varMapping[this.selectedStationType]);

    $('#about-stations-link').html('About ' + this.varMapping[this.selectedStationType]);
    $('.current').html(this.varMapping[this.selectedStationType]);
    $('#about-stations-link').prop('href', '#detail-' + this.selectedStationType.split('.')[0]);

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

    selectedStationType = $('#stations-options option:selected').val();
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
    this.addStations();
    this.wire();
};

Stations.prototype.addStations = function (selectedStationType) {
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

    if (!selectedStationType) {
        selectedStationType = $('#stations-options option:selected').val();
    }

    console.log('running addStations');
    console.log(selectedStationType);
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };

    //json_url = '/resources/item/conus_station_whitelist.json';
    json_url = '/resources/item/conus_stations_whitelist.json';

    $.getJSON(json_url, function (data) {
        var itemfeatureCollection = {
            'type': 'FeatureCollection',
            'features': []
        };

        var obj;
        $.each(data, function (i, d) {

            obj = {
                'type': 'Feature',
                'properties': {
                    'station': d.id,
                    'name': d.name
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': [d.lon, d.lat]
                }
            };

            itemfeatureCollection.features.push(obj);

            if (i === 0) {
                console.log(obj);
            }
        });

        var features = new ol.format.GeoJSON().readFeatures(itemfeatureCollection, {
            featureProjection: 'EPSG:3857'
        });
        var vectorSource = new ol.source.Vector({
            features: features
        });
        vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            style: styleFunction
        });


        vectorLayer.set('layer_id', 'stations');
        vectorLayer.set('name', 'stations');
        self.map.addLayer(vectorLayer);
        vectorLayer.setVisible(false);

        json_url = '/resources/tidal/tidal_stations.json';

        $.getJSON(json_url, function (data) {
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
                        'name': d.label
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [d.lon, d.lat]
                    }
                };


                featureCollection.features.push(obj);

                if (i === 0) {
                    console.log(obj);
                }
            });

            var features = new ol.format.GeoJSON().readFeatures(featureCollection, {
                featureProjection: 'EPSG:3857'
            });
            var vectorSource = new ol.source.Vector({
                features: features
            });
            tidalLayer = new ol.layer.Vector({
                source: vectorSource,
                style: styleFunction
            });


            tidalLayer.set('layer_id', 'tidal_stations');
            tidalLayer.set('name', 'tidal_stations');
            self.map.addLayer(tidalLayer);
            tidalLayer.setVisible(false);

            if (selectedStationType === 'daily_vs_climate' || selectedStationType === 'thresholds') {
                vectorLayer.setVisible(true);
                tidalLayer.setVisible(false);
            }


            if (selectedStationType === 'high_tide_flooding') {
                vectorLayer.setVisible(false);
                tidalLayer.setVisible(true);
            }
        });


    });


    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };


};

Stations.prototype.stationSelected = function (feature, event, type) {
    if (feature) {
        var props = feature.getProperties();
        $('#station-overlay-container').css('visibility', 'visible');


        console.log('option selected');
        console.log(selectedStationType);
        console.log(props);

        if (selectedStationType === 'daily_vs_climate') {
            var html =
                '<div id="station-overlay">' +
                '   <div id="station-overlay-close">x</div>' +
                '   <div id="station-overlay-header">' +
                '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
                '       <h5>Name: ' + props.name + '</h5>' +
                '       <h5>Station ID: ' + props.station + '</h5>' +
                '   </div>' +
                '   <div id="multi-chart" class="left_chart"></div>' +
                '   <div id="multi-precip-chart" class="right_chart"></div>' +
                '   <div style="clear:both">' +
                '   <h5>Scroll, click-and-drag, or hold down your SHIFT key to scroll on either graph or axis to view more years or adjust the display.</h5>' +
                '   <h5>Blue bars on temperature graphs indicate the full range of observed temperatures for each day; the green band shows the average temperature range from 1981-2010. Comparing the two makes it easy to spot periods of above- and below-normal temperature.</h5>' +
                '   <h5>Green areas on precipitation graphs track year-to-date cumulative precipitation. Comparing observed precipitation to normal year-to-date totals (the black line) shows whether each season received above-, below-, or near-normal amounts of precipitation. Vertical portions of the year-to-date precipitation line show days when precipitation occurred.</h5>' +
                '   <h5>Data are from stations in the Global Historical Climatology Network-Daily dataset, compiled by the National Centers for Environmental Information and served by ACIS.</h5>' +
                '</div>';


            $('#station-overlay-container').append(html);


            var stations_base_url = 'https://data.rcc-acis.org/StnData';
            this.chart = new ChartBuilder(props, stations_base_url);

        }
        if (selectedStationType === 'thresholds') {
            var html =

                '<div id="station-overlay">' +
                '   <div id="station-overlay-close">x</div>' +
                '   <div id="station-overlay-header">' +
                '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>Weather Station</h3>' +
                '       <h5>Name: ' + props.name + '</h5>' +
                '       <h5>Station ID: ' + props.station + '</h5>' +
                '   </div>' +
                '   <div style="margin:25px">' +
                '       <div class="field-pair field-id">' +
                '           <label for="station">Station Id:</label>' +
                '           <div class="field">' +
                '               <input type="text" name="station" id="station" value="' + props.station + '">' +
                '           </div>' +
                '       </div>' +
                '       <div class="field-pair field-var">' +
                '           <label for="itemvariable">Variable:</label>' +
                '           <div class="field">' +
                '               <select name="itemvariable" id="itemvariable">' +
                '                   <option value="tavg">TAvg</option>' +
                '                   <option value="tmax">TMax</option>' +
                '                   <option value="tmin">TMin</option>' +
                '                   <option value="precipitation">Precipitation</option>' +
                '               </select>' +
                '           </div>' +
                '       </div>' +
                '       <div class="field-pair field-window append">' +
                '           <label for="window">Window:</label>' +
                '           <div class="field">' +
                '               <input type="number" id="window" name="window" value="1"> <span class="append">days</span>' +
                '           </div>' +
                '       </div>' +
                '       <div class="field-pair field-threshold append">' +
                '           <label for="threshold">Threshold:</label>' +
                '           <div class="field">' +
                '               <input type="number" name="threshold" id="threshold" value="1" step="0.1"> <span class="append" id="item_inches_or_f">°F</span>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '<div style="margin:25px" id="thresholds-container"></div>' +
                '</div>';

            $('#station-overlay-container').append(html);


            $("#thresholds-container").item({
                station: props.station, // GHCN-D Station id (required)
                variable: 'tavg', // Valid values: 'precipitation', 'tmax', 'tmin', 'tavg'
                threshold: 1.0,
                thresholdOperator: '>', // Valid values: '==', '>=', '>', '<=', '<'
                thresholdFilter: '', // Transformations/Filters to support additional units. Valid Values: 'KtoC','CtoK','FtoC','CtoF','InchToCM','CMtoInch'
                thresholdFunction: undefined, //Pass in a custom function: function(this, values){ return _.sum(values) > v2; }
                window: 1, // Rolling window size in days.
                dailyValueValidator: undefined, // Pass in a custom validator predicate function(value, date){return date.slice(0, 4) > 1960 && value > 5 }
                yearValidator: undefined, // Similar to dailyValueValidator
                dataAPIEndpoint: "https://data.rcc-acis.org/",
                barColor: '#307bda' // Color for bars.
            });

            $('#threshold').change(function () {
                $("#thresholds-container").item({threshold: parseFloat($('#threshold').val())}).item('update');
            });

            $('#station').change(function () {
                $("#thresholds-container").item('option', 'station', $('#station').val()).item('update');
            });


            // when #variable changes, update ui units and apply sensible defaults.
            $('#itemvariable').change(function (e) {
                var queryElements = void 0,
                    missingValueTreatment = void 0,
                    windowFunction = void 0;
                switch ($('#itemvariable').val()) {
                    case 'precipitation':
                        $('#thresholdUnits').text('in');
                        $('#threshold').val(1.0);
                        $('#item_inches_or_f').text('inches');
                        break;
                    case 'tmax':
                        $('#thresholdUnits').text('F');
                        $('#threshold').val(95);
                        $('#item_inches_or_f').text('°F');
                        break;
                    case 'tmin':
                        $('#thresholdUnits').text('F');
                        $('#threshold').val(32);
                        $('#item_inches_or_f').html('°F');
                        break;
                    case 'tavg':
                        $('#thresholdUnits').text('F');
                        $('#threshold').val(70);
                        $('#item_inches_or_f').text('°F');
                        break;
                }
                $("#thresholds-container").item({
                    threshold: parseFloat($('#threshold').val()),
                    variable: $('#itemvariable option:selected').val()
                }).item('update');
            });

            $('#percentileThreshold').change(function () {

                var value = $('#percentileThreshold').val();
                if (value === '') {
                    return;
                }

                if (value <= 0 || value >= 100) {
                    $('#percentileThreshold').addClass('form-control-danger');
                    return;
                }

                $('#threshold').val($("#thresholds-container").item('getPercentileValue', value)).trigger('change');

            });

            $('#window').change(function () {
                $("#thresholds-container").item({window: parseInt($('#window').val())});
                $("#thresholds-container").item('update');
            });


            var stations_base_url = 'https://data.rcc-acis.org/StnData';
            this.chart = new ChartBuilder(props, stations_base_url);

        }
        if (selectedStationType === 'high_tide_flooding') {
            var html =
                '<div id="station-overlay">' +
                '   <div id="station-overlay-close">x</div>' +
                '   <div id="station-overlay-header">' +
                '       <h3 class="accent-color" style="margin-bottom: 20px;"><span class="icon icon-district"></span>High Tide Flooding</h3>' +
                '       <h5>Name: <span class="station_name">' + props.name + '</span></h5>' +
                '       <h5>Station ID: <span class="station_id">' + props.station + '</span></h5>' +
                '   </div>' +
                '<div id="tidal-chart-container">' +
                '<select name="" id="tidal_station" class="form-control" style="width: 200px;">' +
                '<option value="" disabled selected hidden>Station</option>' +
                '<option value="8443970">Boston, MA</option>' +
                '<option value="8454000">Providence, RI</option>' +
                '<option value="8461490">New London, CT</option>' +
                '<option value="8510560">Montauk, NY</option>' +
                '<option value="8516945">Kings Point, NY</option>' +
                '<option value="8518750">Battery, NY</option>' +
                '<option value="8531680">Sandy Hook, NJ</option>' +
                '<option value="8534720">Atlantic City, NJ</option>' +
                '<option value="8545240">Philadelphia, PA</option>' +
                '<option value="8557380">Lewes, DE</option>' +
                '<option value="8574680">Baltimore, MD</option>' +
                '<option value="8575512">Annapolis, MD</option>' +
                '<option value="8594900">Washington D.C.</option>' +
                '<option value="8638610">Sewells Point, VA</option>' +
                '<option value="8658120">Wilmington, NC</option>' +
                '<option value="8665530">Charleston, SC</option>' +
                '<option value="8670870">Fort Pulaski, GA</option>' +
                '<option value="8720030">Fernandina Beach, FL</option>' +
                '<option value="8720218">Mayport, FL</option>' +
                '<option value="8724580">Key West, FL</option>' +
                '<option value="8726430">St Petersburg, FL</option>' +
                '<option value="8771341">Galveston Bay, TX</option>' +
                '<option value="8779770">Port Isabel, TX</option>' +
                '<option value="9410230">La Jolla, CA</option>' +
                '<option value="9414290">San Francisco, CA</option>' +
                '<option value="9447130">Seattle, WA</option>' +
                '<option value="1612340">Honolulu, HI</option>' +
                '</select>' +
                '<canvas id="tidal-chart" style="width:100%; height:300px"></canvas>' +
                '</div>';


            $('#station-overlay-container').append(html);


                $("#tidal-chart").tidalstationwidget({
                    station: '8665530',
                    data_url: '/resources/tidal/tidal_data.json', // defaults to tidal_data.json
                    responsive: false // set to false to disable ChartJS responsive sizing.
                });

                $('#station-overlay-header h3').html('Tidal Station');

                $('#location-stations').addClass('type-tidal');

                $('#stations-spinner').fadeOut(250);

                $('#tidal_station').change(function () {
                    $("#tidal-chart").tidalstationwidget("update", {station: $(this).val()})

                    if ($(this).find('option:selected').length) {
                        $('#station-overlay-header .station-name').html($(this).find('option:selected').text());
                    }

                    $('#station-overlay-header .station-id').html($(this).val());
                });

            setTimeout(function () {
                $("#tidal_station").val(props.station).trigger('change');
            }, 250);


        }

        $('#station-overlay-close').click(function () {
            $('#station-overlay-container').css('visibility', 'hidden');
            $('#station-overlay-container').empty();
        });
    }
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


    // detect dropdown change
    $('#stations-options-container .fs-dropdown-item').on('click', function (e) {
        self.selectedStationType = $(this).data().value;


        // hide the overlay if it exists
        $('#station-overlay-container').css('visibility', 'hidden').empty();

        // update about link
        $('#about-stations-link').html('About ' + self.varMapping[self.selectedStationType]);
        $('#about-stations-link').prop('href', '#detail-' + self.selectedStationType.split('.')[0]);

        //$(".level-1").html(self.varMapping[self.selectedStation]);


        self.updateUrl();
        self.updateChart();
        //self.addStations(self.selectedStationType);


        if (self.selectedStationType === 'daily_vs_climate' || self.selectedStationType === 'thresholds') {
            vectorLayer.setVisible(true);
            tidalLayer.setVisible(false);
        }

        console.log(self.selectedStationType);

        if (self.selectedStationType === 'high_tide_flooding') {
            vectorLayer.setVisible(false);
            tidalLayer.setVisible(true);
        }

        $('#breadcrumb .current').html(self.varMapping[self.selectedStationType]);


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
    qs.id = this.selectedStationType;
    qs.zoom = this.map.getView().getZoom();
    qs.center = this.map.getView().getCenter().toString();

    var str = $.param(qs);
    history.replaceState(null, "", 'stations.php?' + str);
    setTimeout(function () {
        selectedStationOption = $('#stations-options option:selected').text();
        selectedStationType = $('#stations-options option:selected').val();
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
            variable: this.selectedStationType
        });
    }
};