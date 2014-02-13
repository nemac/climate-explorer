var ID_DELIMITER = '-';
var TEMPLATE_LOCATION = 'detail.tpl.html';
var DETAIL_TEMPLATE;
var PANEL_STATION_COUNT = 0;
var LABEL_OFFSET = 14;

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
        templateLocation: 'build/static/tpl/drawerpanel/panel.tpl.html'
    });
});

function deployMap() {
    $( '#map' ).mapLite({
        layers: [
            new MapliteDataSource(
                'static/stations1.json',
                'Stream Gauges',
                MARKER_COLORS.BLUE,
                'EPSG:4326',
                clickPoint
            ),
            new MapliteDataSource(
                'static/stations2.json',
                'Precipitation Gauges',
                MARKER_COLORS.GREEN,
                'EPSG:4326',
                clickPoint
            )
        ]
    });
}

function clickPoint( marker, point ) {
    var selected = $(marker.icon.imageDiv).attr('selected');
    if ( !selected ) {
        var contents = Mustache.render(
                DETAIL_TEMPLATE, {
                    id: sanitizeString( point.id ),
                    name: point.name.toCapitalCase(),
                    lat: point.lat,
                    lon: point.lon
                }
        );
        
        /* WIP: label selected items - this method is probably not feasible given
         * that it doesn't zoom in/out well. May need to actually use a feature label.

        var markerRef = $(marker.icon.imageDiv);
        var leftStr = markerRef.css( 'left' );
        var left = parseInt( leftStr.substring( 0, leftStr.length - 2 ) ) + LABEL_OFFSET;
        var topStr = markerRef.css( 'top' );
        var top = parseInt( topStr.substring( 0, topStr.length - 2 ) ) - LABEL_OFFSET;
        var label = ++PANEL_STATION_COUNT;
        
        $( '<div/>', {
            'id': 'label-' + label,
            'class': 'label',
            text: label
        })
        .css( 'top', top)
        .css( 'left', left)
        .appendTo( markerRef.parent() );
        
         */
        
        // TODO: probably send over an icon ref for future use
        $(marker.icon.imageDiv).attr('selected', true);
        
        $( '#stationDetail' ).drawerPanel( 'appendContents', contents );
        $( '#stationDetail' ).drawerPanel( 'open' );
    
    }
}

function sanitizeString( input ) {
    return input.replace( /\W/g, ID_DELIMITER );
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