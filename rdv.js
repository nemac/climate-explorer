$(function(){
    $( '#stationDetail' ).drawerPanel({
        state: 'closed',
        position: 'right',
        width: 400,
        color: '#fee'
    });

    $( '#map' ).mapLite({
        layers: [
            new MapliteDataSource(
                'static/stations1.json',
                'Stream Gauges',
                $.nemac.MARKER_COLORS.BLUE,
                'EPSG:4326',
                clickPoint
            ),
            new MapliteDataSource(
                'static/stations2.json',
                'Precipitation Gauges',
                $.nemac.MARKER_COLORS.GREEN,
                'EPSG:4326',
                clickPoint
            )
        ]
    });
});

function clickPoint( marker, point ) {
    $( '#stationDetail' ).drawerPanel( 'open' );
    
    var clickText = "You clicked on " + point.name + " <br>";
    clickText += "If you were curious, the marker icon url is <br>";
    clickText += marker.icon.url;
    
    $( '#stationDetail' ).drawerPanel( 'setContents', clickText );
}