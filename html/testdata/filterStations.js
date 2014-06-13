#! /usr/bin/env node

var fs = require( 'fs' );
var stations = require( './weighted_stations.json');
var summary = require( './summary.json' );

var minimumVariables = [ 'TMIN', 'TMAX', 'PRCP_YTD' ];

var removedStations = [];
var includedStations = [];

stations.forEach( function( station ) {
    var id = station.id.replace( 'GHCND:', '' );
    
    if ( !summary.hasOwnProperty( id ) ) {
        removedStations.push( {
            id: id,
            reason: "Not in summary"
        });
    } else {
        var summaryObj = summary[id];
        var missingVars = [];
        
        minimumVariables.forEach( function( v ) { 
            if ( !summaryObj.hasOwnProperty( v ) ) {
                missingVars.push( v );
            }
        });
        
        if ( missingVars.length > 0 ) {
            removedStations.push({
                id: id,
                missing: missingVars
            });
        } else {
            includedStations.push( station );
        }
    }
});

fs.writeFile( 'removed_stations.json', JSON.stringify( removedStations ), function( e ) {
    if ( e ) console.log( e );
    console.log( '%s stations removed', removedStations.length );
});

fs.writeFile( 'filtered_stations.json', JSON.stringify( includedStations ), function( e ) {
    if ( e ) console.log( e );
    console.log( '%s stations written', includedStations.length );
});