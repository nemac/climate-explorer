#! /usr/bin/env node

var fs = require( 'fs' );
var stations = require( './stations.json' );

for ( var i = 0; i < stations.length; i++ ) {
    stations[i].weight = i % 5 + 1;
}

fs.writeFile( 'weighted_stations.json', JSON.stringify( stations ), function( e ) {
    if ( e ) console.log( e );
    console.log( 'written' );
});