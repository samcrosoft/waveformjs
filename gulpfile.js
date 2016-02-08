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
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');

var onError = function (err) {
    console.log(err);
};

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


//bower
gulp.task('bower', function () {
    return bower({cmd: "install"});
});

// Javascript
gulp.task('coffee', function () {
    gulp.src(['./src/observable.coffee', './src/waveform.coffee'])
        .pipe(coffee({bare: true})).on('error', onError)
        .pipe(concat('all.js'))
        //.pipe(babel())
        .pipe(header(banner, {pkg: pkg}))       // add header banner

        // Original
        .pipe(rename({basename: 'waveform'}))
        .pipe(gulp.dest(distDir + '/js/'))

        // Minified
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(distDir + '/js/'));
});

// Watch
gulp.task('watch', ['coffee'], function() {
    gulp.watch('./src/**/*', ['coffee']);
});

// Defaults
gulp.task('build', ['coffee']);
gulp.task('default', ['build']);