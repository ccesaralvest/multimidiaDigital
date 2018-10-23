'use strict'; // see strict mode

// default imports/requires
var path = require('path'),
    source = require('vinyl-source-stream'),
    args = require('yargs').argv,
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    // less + css (for production)
    less = require('gulp-less'),
    cleanCSS = require('gulp-clean-css'),
    // uglify and browserify to use require inside js
    uglify = require('gulp-uglify'),
    browserify = require('gulp-browserify'),
    // image min and copy
    imagemin = require("gulp-imagemin"),
    imageminJpegRecompress = require('imagemin-jpeg-recompress'),
    imageminPngquant = require('imagemin-pngquant'),
    // html min and html replace to inject html, css and js files
    htmlmin = require('gulp-html-minifier'),
    htmlreplace = require('gulp-html-replace'),
    injectPartials = require('gulp-inject-partials'),
    // browserSync
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// CONFIGURATIONS
var env = args.env;
var isProd = env && env.toLowerCase().indexOf("prod") > -1;

var source = 'source/';
var dist = 'dist/';

var assetsDir = 'assets/'
// images paths
var imagesFolder = 'images/';
var imagesPath = imagesFolder + 'unoptimized/**';
var imagesOptPath = imagesFolder + 'optimized';
// styles configs
var stylesheetsFolder = 'stylesheets/';
var stylesheetsPath = stylesheetsFolder + '/**/*.less';
var stylesheetsFileName = 'app';
// js configs
var javascriptsFolder = 'javascripts/';
var javascriptsPath = javascriptsFolder + '/**/*.js';
var javascriptFileName = 'app';
// html configs
var htmlPath = 'html/**/*.html';
// fonts configs
var fontsFolder = 'fonts';
var fontsPath = fontsFolder + '/**';
// bundle configs
var bundle = {
    css: stylesheetsFileName + (isProd ? '.min' : '') + '.css',
    js: javascriptFileName + (isProd ? '.min' : '') + '.js',
};

// less + css (for production)
gulp.task('less', function () {
    var pathS = source + stylesheetsFolder;
    var pathD = dist + assetsDir + stylesheetsFolder;

    var _less = gulp.src(pathS + stylesheetsFileName + '.less')
        .pipe(
            less({
                paths: [
                    './node_modules/reset-css',
                    path.join(__dirname, 'less', 'includes')
                ],
                relativeUrls: false
            })
            .on('error', console.log)
        )
        .pipe(
            concat(bundle.css)
            .on('error', console.log)
        );

    if (isProd) {
        _less
            .pipe(
                cleanCSS({
                    level: 2,
                    compatibility: 'ie10'
                })
                .on('error', console.log)
            );
    }
    return _less.pipe(gulp.dest(pathD));
});

// uglify and browserify to use require inside js
gulp.task('browserify', function () {
    var pathS = source + javascriptsFolder;
    var pathD = dist + assetsDir + javascriptsFolder;

    var _js = gulp.src([
            pathS + javascriptFileName + '.js'
        ])
        .pipe(
            browserify()
            .on('error', console.log)
        )
        .pipe(
            concat(bundle.js)
            .on('error', console.log)
        );
    if (isProd) {
        _js.pipe(
            uglify()
            .on('error', console.log)
        );
    }
    return _js.pipe(gulp.dest(pathD));
});

// image min and copy
gulp.task('images-compress', function () {
    var pathS = source + imagesPath;
    var pathD = source + imagesOptPath;

    return gulp.src([
            pathS
        ])
        .pipe(
            imagemin([
                imagemin.gifsicle({
                    interlaced: true
                }),
                imagemin.svgo({
                    plugins: [{
                        removeViewBox: false
                    }]
                }),
                imageminJpegRecompress({
                    progressive: true,
                    max: 80,
                    min: 70
                }),
                imageminPngquant({
                    quality: '75-85'
                })
            ]).on('error', console.log)
        )

        .pipe(
            gulp.dest(pathD).on('error', console.log)
        );
});

gulp.task('images-copy', ['images-compress'], function () {
    var pathS = source + imagesOptPath;
    var pathD = dist + assetsDir + imagesFolder;

    return gulp.src(pathS + '/**')
        .pipe(
            gulp.dest(pathD)
            .on('error', console.log)
        );

});

gulp.task('fonts-copy', function () {
    var pathS = source + fontsPath;
    var pathD = dist + assetsDir + fontsFolder;

    return gulp.src(pathS)
        .pipe(
            gulp.dest(pathD)
            .on('error', console.log)
        );
});

// html min and html replace to inject html, css and js files
gulp.task('html-minify', function () {
    var pathS = source + htmlPath;

    var _bundle = function () {
        var css = '/' + assetsDir + stylesheetsFolder + bundle.css;
        var js = '/' + assetsDir + javascriptsFolder + bundle.js;

        return {
            css: css,
            js: js
        };
    }();

    return gulp.src(pathS)
        .pipe(
            injectPartials({
                start: '<partial src="{{path}}">',
                end: '</partial>',
                removeTags: isProd
            })
            .on('error', console.log)
        )
        .pipe(
            htmlreplace({
                js: _bundle.js,
                css: _bundle.css
            })
            .on('error', console.log)
        )
        .pipe(
            htmlmin({
                collapseWhitespace: true
            })
            .on('error', console.log)
        )
        .pipe(
            gulp.dest(dist)
            .on('error', console.log)
        );
});

// browserSync
gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: dist
        }
    }).on('error', console.log);
});

gulp.task('default', function () {
    gulp.start(
        [
            'less',
            'browserify',
            'html-minify',
            'images-copy',
            'fonts-copy'
        ]
    );
});

gulp.task('watch', ['default'], function () {
    gulp.start('browser-sync');
    gulp.watch(
            source + fontsPath, ['fonts-copy']
        )
        .on("change", reload);
    gulp.watch(
            source + imagesPath, ['images-copy']
        )
        .on("change", reload);
    gulp.watch(
            source + stylesheetsPath, ['less']
        )
        .on("change", reload);
    gulp.watch(
            source + javascriptsPath, ['browserify']
        )
        .on("change", reload);
    gulp.watch(
            source + htmlPath, ['html-minify']
        )
        .on("change", reload);
});