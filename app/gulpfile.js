'use strict';


var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
let replace = require('replace');
let replaceFiles = ['./www/js/app.js'];
let templateCache = require('gulp-angular-templatecache');




let paths = {
    sass: ['./scss/**/*.scss'],
    templatecache: ['./www/templates/**/*.html']

};

gulp.task('templatecache', (done) => {
    gulp.src(paths.templatecache)
        .pipe(templateCache({
            standalone: true
        }))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('add-proxy', () => {
    return replace({
        regex: "https://secret-plateau-96989.herokuapp.com/api",
        replacement: "http://localhost:5000/api",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    })
});

gulp.task('remove-proxy', () => {
    return replace({
        regex: "http://localhost:5000/api",
        replacement: "https://secret-plateau-96989.herokuapp.com/api",
        paths: replaceFiles,
        recursive: false,
        silent: false,
    })
});

gulp.task('default', ['sass', 'templatecache']);

gulp.task('sass', function(done) {
    gulp.src('./scss/ionic.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.templatecache, ['templatecache']);
});

gulp.task('install', ['git-check'], function() {
    return bower.commands.install()
        .on('log', function(data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function(done) {
    if (!sh.which('git')) {
        console.log(
            '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download Ionic.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
            '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
