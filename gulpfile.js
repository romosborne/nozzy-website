// Load plugins
// const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const {src, dest, watch, series, parallel } = require("gulp");
const header = require("gulp-header");
// const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require('sass'));
const uglify = require("gulp-uglify");
const pkg = require('./package.json');
const imagemin = require('gulp-imagemin')

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
function vendor(done) {

  // Bootstrap
  src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(dest('./public/vendor/bootstrap'))

  // Font Awesome
  src([
      './node_modules/font-awesome/**/*',
    ])
    .pipe(dest('./public/vendor/font-awesome'))

  // jQuery
  src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(dest('./public/vendor/jquery'))

  // jQuery Easing
  src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(dest('./public/vendor/jquery-easing'))

  done();
}


// CSS task
function css() {
  return src("./scss/*.scss")
    // .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded"
    }))
    .on("error", sass.logError)
    // .pipe(autoprefixer({
    //   browsers: ['last 2 versions'],
    //   cascade: false
    // }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(dest("./public/css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(dest("./public/css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/contact_me.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest('./public/js'))
    .pipe(browsersync.stream());
}

function imgGen() {
    return src('img-src/bg.jpg')
        .pipe(imagemin())
        .pipe(dest('./public/img'))
        .pipe(browsersync.stream());
}

function img() {
  return src('img/**/*')
    .pipe(dest('./public/img'));
}

function static() {
  return src(['index.html', 'favicon.ico'])
      .pipe(dest('./public'))
}

// BrowserSync
function serve(done) {
  browsersync.init({
    server: {
      baseDir: "./public/"
    }
  });
  done();
}

// Watch files
function watchFiles() {
  watch("./scss/**/*", css);
  watch(["./js/**/*.js", "!./js/*.min.js"], js);
  watch("./img-src/*", imgGen);
  watch("./img/*", img);
  watch("./index.html", static);
  watch("./favicon.ico",static);
}

const build = parallel(vendor, css, js, imgGen, img, static)

exports.default = build;
exports.watch = series(build, parallel(watchFiles, serve));