// Load plugins
// const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const gulp = require("gulp");
const header = require("gulp-header");
// const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const pkg = require('./package.json');
const responsive = require('gulp-responsive')

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function(cb) {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./public/vendor/bootstrap'))

  // Font Awesome
  gulp.src([
      './node_modules/font-awesome/**/*',
    ])
    .pipe(gulp.dest('./public/vendor/font-awesome'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./public/vendor/jquery'))

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./public/vendor/jquery-easing'))

  cb();

});

// CSS task
function css() {
  return gulp
    .src("./scss/*.scss")
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
    .pipe(gulp.dest("./public/css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
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
    .pipe(gulp.dest('./public/js'))
    .pipe(browsersync.stream());
}

function imgGen() {
    return gulp.src('img-src/bg.jpg')
        .pipe(responsive({
            'bg.jpg': [
                {width: '80%', rename: {suffix: '@4x', extname: '.jpg'}},
                {width: '100%', rename: {suffix: '@5x', extname: '.jpg'}}
            ]
        },
            {
                quality: 80,
                progressive: true,
                withMetadata: false
            }
        ))
        .pipe(gulp.dest('./public/img'))
        .pipe(browsersync.stream());
}

function img() {
  return gulp.src('img/**/*')
    .pipe(gulp.dest('./public/img'));
}

function static() {
  return gulp.src(['index.html', 'favicon.ico'])
      .pipe(gulp.dest('./public'))
}

// Tasks
gulp.task("css", css);
gulp.task("js", js);
gulp.task("static", static);

// Images
gulp.task('img', img);
gulp.task('imgGen', imgGen);


// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./public/"
    }
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*.js", "!./js/*.min.js"], js);
  gulp.watch("./img-src/*", imgGen);
  gulp.watch("./img/*", img);
  gulp.watch("./**/*.html", browserSyncReload);
  gulp.watch(["index.html", "./favicon.ico"], gulp.series(static, browserSyncReload));
}

gulp.task("default", gulp.parallel('vendor', css, js, img, imgGen, static, somethingThatDoesn'tExist));

// dev task
gulp.task("dev", gulp.parallel(watchFiles, browserSync));
