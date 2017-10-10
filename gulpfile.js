const gulp = require('gulp');
const $ = require('gulp-load-plugins')({pattern: ["*"]});
const path = require('path');
const pkg = require('./package.json');

const paths = {
  DEV: pkg.paths.DEV,
  DIST: pkg.paths.DIST,
  DEV_HTML: path.join(pkg.paths.DEV, pkg.paths.DIR_HTML),
  DEV_CSS: path.join(pkg.paths.DEV, pkg.paths.DIR_CSS),
  DEV_SCRIPT: path.join(pkg.paths.DEV, pkg.paths.DIR_SCRIPT),
  DIST_HTML: path.join(pkg.paths.DIST, pkg.paths.DIR_HTML),
  DIST_CSS: path.join(pkg.paths.DIST, pkg.paths.DIR_CSS),
  DIST_SCRIPT: path.join(pkg.paths.DIST, pkg.paths.DIR_SCRIPT)
};

const onError = function(err) {
  console.log('An Error Has Occurred \n', err.toString());
  this.emit('end');
};

gulp.task('twig', ()=>{
  return gulp
    .src('./src/twig/!(_*).twig')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.twig())
    .pipe(gulp.dest(paths.DEV_HTML))
    .pipe($.browserSync.stream());
});

gulp.task('scss', ()=>{
  return gulp
    .src('./src/scss/!(_*).scss')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.DEV_CSS))
    .pipe($.browserSync.stream());
});

gulp.task('js', ()=>{
  return gulp
    .src('./src/javascript/!(_*).js')
    .pipe($.plumber({errorHandler: onError}))
    .pipe($.newer({dest: paths.DEV_SCRIPT, ext: '.js'}))
    .pipe(gulp.dest(paths.DEV_SCRIPT))
    .pipe($.browserSync.stream());
});

gulp.task('bower:js', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.js'))
    .pipe($.concat('vendor.js'))
    .pipe(gulp.dest(paths.DEV_SCRIPT));
});

gulp.task('bower:css', ()=>{
  return gulp
    .src('./bower.json')
    .pipe($.mainBowerFiles('**/*.css'))
    .pipe($.concat('vendor.css'))
    .pipe(gulp.dest(paths.DEV_CSS));
});

gulp.task('bower', ['bower:js', 'bower:css']);

gulp.task('serve', ['bower', 'twig', 'scss', 'js'], ()=>{
  $.browserSync.init({
    server: "./dist",
    port: 8081
  });

  gulp.watch("src/**/*.twig", ['twig']);
  gulp.watch("src/**/*.scss", ['scss']);
  gulp.watch("src/**/*.js", ['js']);
});

gulp.task('dev:del', ()=>{
  return $.del(path.join(paths.DEV, '**/*'));
});

gulp.task('dev', ()=>{
  return $.runSequence('dev:del', ['bower', 'twig', 'scss', 'js']);
});

gulp.task('build:js', ['bower', 'js'], ()=>{
  return gulp
    .src(path.join(paths.DEV_SCRIPT, '**/*.js'))
    .pipe($.uglify())
    .pipe(gulp.dest(paths.DIST_SCRIPT))
});

gulp.task('build:css', ['scss'], ()=>{
  return gulp
    .src(path.join(paths.DEV_CSS, '**/*.css'))
    .pipe($.autoprefixer())
    .pipe($.cleanCss())
    .pipe(gulp.dest(paths.DIST_CSS))
});

gulp.task('build:html', ['twig'], ()=>{
  return gulp
    .src(path.join(paths.DEV_HTML, '**/*.html'))
    .pipe($.jsbeautifier())
    .pipe(gulp.dest(paths.DIST_HTML))
});

gulp.task('build:del', ()=>{
  return $.del(path.join(paths.DIST, '**/*'));
});

gulp.task('build', ()=>{
  return $.runSequence('build:del', ['build:html', 'build:scss', 'build:js']);
});

gulp.task('bump', ()=>{
  return gulp
    .src(['./bower.json', './package.json'])
    .pipe($.bump())
    .pipe(gulp.dest('./'));
});

gulp.task('w3c', function () {
  gulp.src('./dist/*.html')
		.pipe($.w3cjs())
		.pipe($.w3cjs.reporter());
});
