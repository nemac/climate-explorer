var gulp = require( 'gulp' );
var gulpUtil = require( 'gulp-util' );
var concat = require( 'gulp-concat' );
var gulpBowerFiles = require( 'gulp-bower-files' );
var gulpBower = require( 'gulp-bower' );
var uglify = require( 'gulp-uglify' );

var paths = {
    scripts: {
        projectFiles: [
           'rdv.js'
        ]
    }
};

gulp.task( 'concat-project-files', function() {
    return gulp.src( paths.scripts.projectFiles )
            .pipe( concat( 'project.js' ) )
            .pipe( gulp.dest( './build' ) );
});

gulp.task( 'package-bower', function() {
    // get the latest
    gulpBower();
    
    // copy bower static assets
    gulp.src( './bower_components/**/*.png' )
            .pipe( gulp.dest( './build/static/img' ) );
    
    gulp.src( './bower_components/**/*.css' )
            .pipe( gulp.dest( './build/static/css' ) );
    
    gulp.src( './bower_components/**/*.tpl.html' )
            .pipe( gulp.dest( './build/static/css' ) );
    
    // put contents into bower.js
    return gulpBowerFiles()
            .pipe( concat( 'bower.js' ) )
            //.pipe( uglify() )
            .pipe( gulp.dest( './build' ) );
});

gulp.task( 'default', ['package-bower', 'concat-project-files'], function() {
    
});

gulp.task( '_default', function(){
    gulp.src( paths.scripts.vendorFiles )
            .pipe( gulpBowerFiles() )
            .pipe( concat( 'vendor.js' ) )
            .pipe( gulp.dest( './build' ) );
});