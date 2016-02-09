/**
 * Created by Adebola on 04/02/2016.
 */
var del = require('del');
var gulp = require('gulp');
var babel = require("gulp-babel");
var rename = require('gulp-rename');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var coffeeify = require('coffeeify');
var source = require('vinyl-source-stream');
var babelify = require("babelify");

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

// Clear
gulp.task('clear', function () {
    del.sync([distDir]);
});

// Coffee
gulp.task('coffee', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './src/waveform.coffee',
        debug: true,
        transform: [coffeeify, babelify]
    });

    b.bundle()
        .pipe(source("all.js"))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))       // add header banner

        .pipe(rename({basename: 'waveform'}))
        .pipe(gulp.dest(distDir + '/js/'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(distDir + '/js/'))
    ;
});


// Watch
gulp.task('watch', ['coffee'], function () {
    gulp.watch('./src/**/*', ['coffee']);
});

// Defaults
gulp.task('build', ['clear','coffee']);
gulp.task('default', ['build']);