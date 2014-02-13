var gulp = require( 'gulp' );
var gulpUtil = require( 'gulp-util' );
var concat = require( 'gulp-concat' );
var gulpBower = require( 'gulp-bower' );
var uglify = require( 'gulp-uglify' );
var streamqueue = require( 'streamqueue' );

var paths = {
    scripts: {
        projectFiles: [
           'rdv.js'
        ],
        vendorFiles: [
            './bower_components/maplite/lib/openlayers/OpenLayers.js',
            './bower_components/maplite/maplite.js',
            './bower_components/mustache/mustache.js',
            './bower_components/drawerpanel/drawerpanel.js'
        ]
    }
};



gulp.task( 'bower', function() {
    // get the latest
    gulpBower();
    
});

gulp.task( 'package', function() {
    // copy bower static assets
    gulp.src( './bower_components/**/*.png' )
            .pipe( gulp.dest( './build/static/img' ) );
    
    gulp.src( './bower_components/**/*.css' )
            .pipe( gulp.dest( './build/static/css' ) );
    
    gulp.src( './bower_components/**/*.tpl.html' )
            .pipe( gulp.dest( './build/static/tpl' ) );
    
    // copy scripts
    var stream = streamqueue( {objectMode: true } );
    stream.queue( gulp.src( paths.scripts.vendorFiles ) );
    stream.queue( gulp.src( paths.scripts.projectFiles ) );
    
    return stream.done()
        .pipe( concat( 'app.js' ) )
        //.pipe( uglify() )
        .pipe( gulp.dest( './build' ) ); 
});

gulp.task( 'default', ['bower', 'package'], function() {
    
});

// Test scripts for future reference
/*
var clean = require( 'gulp-clean' );
var gulpBowerFiles = require( 'gulp-bower-files' );
var filter = require( 'gulp-filter' );
*/

gulp.task( 'clean', function() {
    return gulp.src( './build', {read: false} )
            .pipe( clean() );
});

gulp.task( '_default', function(){
    gulp.src( paths.scripts.vendorFiles )
            .pipe( gulpBowerFiles() )
            .pipe( concat( 'vendor.js' ) )
            .pipe( gulp.dest( './build' ) );
});

gulp.task( '_package-bower', function() {
    // get the latest
    gulpBower();
    
    // copy bower static assets
    gulp.src( './bower_components/**/*.png' )
            .pipe( gulp.dest( './build/static/img' ) );
    
    gulp.src( './bower_components/**/*.css' )
            .pipe( gulp.dest( './build/static/css' ) );
    
    gulp.src( './bower_components/**/*.html' )
            .pipe( gulp.dest( './build/static/tpl' ) );
    
    // put contents into bower.js
    var stream = streamqueue( {objectMode: true } );
    stream.queue( gulp.src( paths.scripts.vendorFiles ) );
    stream.queue( gulpBowerFiles() );
    stream.queue( gulp.src( paths.scripts.projectFiles ) );
    
    return stream.done()
        .pipe( concat( 'app.js' ) )
        //.pipe( uglify() )
        .pipe( gulp.dest( './build' ) );
});