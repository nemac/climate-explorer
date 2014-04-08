var gulp        = require( 'gulp' );
var gulpUtil    = require( 'gulp-util' );
var concat      = require( 'gulp-concat' );
var gulpBower   = require( 'gulp-bower' );
var uglify      = require( 'gulp-uglify' );
var streamqueue = require( 'streamqueue' );
var filter      = require( 'gulp-filter' );
var flatten     = require( 'gulp-flatten' );
var minify      = require( 'gulp-minify-css' );
var inject      = require( 'gulp-inject' );

var paths = {
    buildDest : './build',
    scripts: {
        projectFiles: [
           'rdv.js',
           'utils/transformer.js',
           'utils/muglHelper.js'
        ],
        vendorFiles: [
            './bower_components/maplite/lib/openlayers/OpenLayers.js',
            './bower_components/maplite/maplite.js',
            './bower_components/mustache/mustache.js',
            './bower_components/drawerpanel/drawerpanel.js',
            './bower_components/multigraph/index.js'
        ]
    },
    assets: {
        css: [
            'rdv.css'
        ],
        images: [
            'img/*.png'
        ],
        templates: './templates/*.xml',
        templateBaseDir: './templates/',
        aggregateTemplate: 'aggregate.js'
    }
};

function bundleTemplates() {
    return gulp.src( paths.assets.templateBaseDir + paths.assets.aggregateTemplate )
        .pipe( inject( gulp.src( paths.assets.templates, { read: true } ), {
            starttag: 'var MUGLTEMPLATES = {',
            endtag: '};',
            transform: function(path, file, i, length) {
                // remove line breaks, spaces leading tags, and any remaining places where many spaces should be replaced with a single space
                var contents = file.contents.toString().replace(/(\r\n|\n|\r)/gm, '').replace(/\s+</g, '<').replace(/\s+/g, ' ');
                var key = path.split('.')[0].split('/')[2];
                return '"' + key + '": \'' + contents + (i + 1 < length ? '\',' : '\'');
            }
    }));
}

gulp.task( 'bower', function() {
    // get the latest
    gulpBower();
});

gulp.task( 'bundle-templates', function() {
    return bundleTemplates()
        .pipe(gulp.dest( paths.buildDest ));
});

gulp.task( 'bundle-assets', function() {
    // copy bower static assets
    var imageStream = streamqueue( { objectMode: true } );
    imageStream.queue( gulp.src( paths.assets.images ) );
    imageStream.queue( gulp.src( './bower_components/**/*.png' ) );
    imageStream.done()    
        .pipe( filter( '!jquery-ui*/**') )
        .pipe( flatten() )
        .pipe( gulp.dest( paths.buildDest + '/asset/img' ) );

    gulp.src( './bower_components/**/*.tpl.html' )
        .pipe( filter( '!jquery-ui*/**') )
        .pipe( flatten() )
        .pipe( gulp.dest( paths.buildDest + '/asset/tpl' ) );

    var cssStream = streamqueue( { objectMode: true } );
    cssStream.queue( gulp.src( paths.assets.css ) );
    cssStream.queue( 
        gulp.src( './bower_components/**/*.css' )
        .pipe( filter( '!jquery-ui*/**') )
    );
    
    return cssStream.done()
        .pipe( minify() )
        .pipe( concat( 'app.css' ) )
        .pipe( gulp.dest( paths.buildDest + '/asset' ) );
});

gulp.task( 'package', function() {
    // copy scripts
    var stream = streamqueue( { objectMode: true } );
    stream.queue( gulp.src( paths.scripts.vendorFiles ) );
    //stream.queue( gulp.src( paths.scripts.projectFiles ) );
    stream.queue( bundleTemplates() );

    return stream.done()
        .pipe( concat( 'app.js' ) )
        .pipe( uglify() )
        .pipe( gulp.dest( paths.buildDest ) ); 
});

gulp.task( 'default', ['bundle-assets', 'package'], function() {
    
});