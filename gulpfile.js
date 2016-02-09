/**
 * Created by Adebola on 04/02/2016.
 */
// assign the module to a local variable
var del = require('del');
var gulp = require('gulp');
var babel = require("gulp-babel");
var rename = require('gulp-rename');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var bower = require('gulp-bower');
var concat = require('gulp-concat');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var coffeeify = require('coffeeify');
var source = require('vinyl-source-stream');
var umd = require('gulp-wrap-umd');

/*
 * Variables
 */
var distDir = './dist';
// using data from package.json
var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');
var umdOptions = {
    exports: 'Waveform',
    namespace: 'Waveform'
};
// Clear
gulp.task('clear', function () {
    del.sync([distDir]);
});


//bower
gulp.task('bower', function () {
    return bower({cmd: "install"});
});

// Javascript
gulp.task('coffee', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './src/waveform.coffee',
        debug: true,
        transform: [coffeeify]
    });

    b.bundle()
        .pipe(source("all.js"))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))       // add header banner

        // Original
        .pipe(umd(umdOptions))
        .pipe(rename({basename: 'waveform'}))
        .pipe(gulp.dest(distDir + '/js/'));
});

// minify result
gulp.task('minify', function () {
    gulp.src('./dist/js/waveform.js')
        .pipe(uglify())
        .pipe(rename({basename: 'waveform', suffix: '.min'}))
        .pipe(gulp.dest(distDir + '/js/'));
});

// Watch
gulp.task('watch', ['coffee'], function () {
    gulp.watch('./src/**/*', ['coffee', 'minify']);
});

// Defaults
gulp.task('build', ['coffee']);
gulp.task('default', ['build']);