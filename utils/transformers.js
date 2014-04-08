/**
 * Transformer contains a number of data transformation utility classes
 */
function Transformer() {
    
}

/**
 * Finds the minima and maxama across an object by relevant keys
 * 
 * @param array params       : parameters of interest in summary, e.g., ['TMAX', 'TMIN']
 * @param object data        : data summary object, filtered by selected id
 *                             { "VAR": { "min": "19000101", "max": "19001231" } ... }
 * @returns object           : summary object with a min and max across params
 */
Transformer.findMinMax = function( params, data ) {
    var summary = {};
    
    var minima = [];
    var maxima = [];
    
    $.each(params, function() {
        minima.push( parseInt( data[this].min ) );
        maxima.push( parseInt( data[this].max ) );
    });
    
    summary.min = $.apply( Math.max, minima )[0];
    summary.max = $.apply( Math.min, maxima )[0];
    
    return summary;
};

/**
 * Merges two two-column CSV strings by the intersection of the first columns
 * 
 * @param {type} csv1        : the first two-column CSV string
 * @param {type} csv2        : the second two-column CSV string
 * @param function transform : transformation that should be applied to each data column
 * @returns array            : a merged three-column CSV
 */
Transformer.mergeCSV = function( csv1, csv2, transform ) {
    var merge = [];
    
    var colA = {};
    $.each( csv1.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(){
        var ln = this.split( ',' );
        colA[ln[0]] = transform(ln[1]);
    });
    
    // only append the value portion - not the date
    var colB = {};
    $.each( csv2.replace( /(\r\n|\n|\r)/gm, ';' ).split( ';' ), function(){
        var ln = this.split( ',' );
        if ( colA.hasOwnProperty( ln[0] ) ) {
            colB[ln[0]] = transform(ln[1]);
        }
    });
    
    // back-check keys, merge and push common keys
    $.each( colA, function ( key, value ) {
        if ( colB.hasOwnProperty( key ) ) {
            merge.push( sprintf( '%s,%s,%s', key, value, colB[key] ) );
        }
    });
    
    return merge.join( '\n' );
};

Transformer.tempTransform = function( x ) {
    var v = parseFloat(x);
    v = v / 10.0;
    return sprintf( "%.1f", v );
};

Transformer.normalTempTransform = function ( x ) {
    var f = parseFloat( x );
    var c = ( f-32.0 ) *5.0 /9.0;
    return sprintf( "%.1f", c );
};