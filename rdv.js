var BUILD_BASE_PATH = 'build/asset/';
var ID_DELIMITER = '-';
var TEMPLATE_LOCATION = 'detail.tpl.html';
var DETAIL_TEMPLATE;
var PANEL_STATION_COUNT = 0;
var LABEL_OFFSET = 14;
var MAX_SELECTED_STATIONS = 6;

var stationAndGraphLinkHash = {};

$(function(){
    $.get( TEMPLATE_LOCATION, function( template ) {
        DETAIL_TEMPLATE = template;
        
        // deploy map now that the template is ready
        deployMap();
    });
    
    $( '#stationDetail' ).drawerPanel({
        state: 'closed',
        position: 'right',
        color: '#fee',
        title: 'Station Detail',
        resizable: true,
        width: 400,
        minWidth: 400,
        maxWidth: 600,
        templateLocation: BUILD_BASE_PATH + 'tpl/panel.tpl.html'
    });
});

function deployMap() {
    $( '#map' ).mapLite({
        layers: [
            new MapliteDataSource(
                'static/stations1.json',
                'Stream Gauges',
                MARKER_COLORS.BLUE,
                'EPSG:4326'
            ),
            new MapliteDataSource(
                'static/stations2.json',
                'Precipitation Gauges',
                MARKER_COLORS.GREEN,
                'EPSG:4326'
            )
        ],
        iconPath: BUILD_BASE_PATH + 'img/',
        selectCallback: clickPoint
    });
}

function clickPoint( point ) {
    var attr = point.attributes;
    
    if ( PANEL_STATION_COUNT >= MAX_SELECTED_STATIONS ) {
        return;
    }

    if ( attr.selected ) {
        return;
    }
    
    var index = ++PANEL_STATION_COUNT;
    attr.label = index;
    attr.selected = true;
    
    var sanitizedId = sanitizeString( attr.id );
    
    var contents = Mustache.render(
            DETAIL_TEMPLATE, {
                id: sanitizedId,
                index: index,
                name: attr.name.toCapitalCase(),
                lat: attr.lat,
                lon: attr.lon
            }
    );
    
    stationAndGraphLinkHash[index] = {
        id: sanitizedId,
        point: point
    };

    $( '#stationDetail' ).drawerPanel( 'appendContents', contents );
    $( '#stationDetail' ).drawerPanel( 'open' );

}

function sanitizeString( input ) {
    return input.replace( /\W/g, ID_DELIMITER );
}

function removeGraph( index ) {
    // decrement any items greater than the removed
    console.log("count is " + PANEL_STATION_COUNT);
    console.log("selected index is " + index );
    
    for (var i = PANEL_STATION_COUNT; i > index ; i--) {
        
        var shift = stationAndGraphLinkHash[i];
        // update graph label
        var newIndex = i -1;
        $( 'span.point-index', 'div#' + shift.id + '-detail' ).html( '(' + newIndex + ')' );
        
        // update point label
        shift.point.attributes.label = newIndex;
        shift.point.layer.redraw();
    }
    
    // remove the items to be removed
    var point = stationAndGraphLinkHash[index].point;
    $('div#' + stationAndGraphLinkHash[index].id + '-detail', '#stationDetail' ).remove();
    point.attributes.label = '';
    point.attributes.selected = false;
    point.layer.redraw();
    delete stationAndGraphLinkHash[index];
    
    PANEL_STATION_COUNT--;
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