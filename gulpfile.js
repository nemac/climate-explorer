var gulp = require( 'gulp' );
var gulpUtil = require( 'gulp-util' );
var concat = require( 'gulp-concat' );
var gulpBower = require( 'gulp-bower' );
var uglify = require( 'gulp-uglify' );
var streamqueue = require( 'streamqueue' );
var filter = require( 'gulp-filter' );
var flatten = require( 'gulp-flatten' );
var minify = require( 'gulp-minify-css' );

var paths = {
    scripts: {
        projectFiles: [
           'rdv.js'
        ],
        vendorFiles: [
            './bower_components/maplite/lib/openlayers/OpenLayers.js',
            //'./bower_components/maplite/maplite.js',
            './bower_components/mustache/mustache.js',
            './bower_components/drawerpanel/drawerpanel.js'
        ]
    },
    assets: {
        css: [
            'rdv.css'
        ],
        images: [
            
        ],
        templates: [
            
        ]
    }
};

gulp.task( 'bower', function() {
    // get the latest
    gulpBower();
});

gulp.task( 'bundle-assets', function() {
    // TODO: merge project images, templates
    
    // copy bower static assets
    gulp.src( './bower_components/**/*.png' )
            .pipe( filter( '!jquery-ui*/**') )
            .pipe( flatten() )
            .pipe( gulp.dest( './build/asset/img' ) );

    gulp.src( './bower_components/**/*.tpl.html' )
            .pipe( filter( '!jquery-ui*/**') )
            .pipe( flatten() )
            .pipe( gulp.dest( './build/asset/tpl' ) );

    var cssStream = streamqueue( { objectMode: true } );
    //cssStream.queue( gulp.src( paths.assets.css ) );
    cssStream.queue( 
            gulp.src( './bower_components/**/*.css' )
            .pipe( filter( '!jquery-ui*/**') )
    );
    
    return cssStream.done()
            .pipe( minify() )
            .pipe( concat( 'app.css' ) )
            .pipe( gulp.dest( './build/asset' ) )
});

gulp.task( 'package', function() {
    // copy scripts
    var stream = streamqueue( { objectMode: true } );
    stream.queue( gulp.src( paths.scripts.vendorFiles ) );
    //stream.queue( gulp.src( paths.scripts.projectFiles ) );

    return stream.done()
        .pipe( concat( 'app.js' ) )
        .pipe( uglify() )
        .pipe( gulp.dest( './build' ) ); 
});

gulp.task( 'default', ['bower', 'bundle-assets', 'package'], function() {
    
});