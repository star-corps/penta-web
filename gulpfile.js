/** 
 *  @file       Gulp file for generating Penta roadmap microsite and automating its workflow.
 *
 *  @author     Steve Melnikoff
 *
 *  @requires   NPM:{@link https://www.npmjs.com/}   
 *  @requires   GULP:{@link https://gulpjs.com/}
 *  @see        {@link https://css-tricks.com/gulp-for-beginners/} for help on installing gulp and use cases
 *  @example    $ gulp hello
*/
const argv = require('yargs').argv;
const gulp = require('gulp'); 
const gutil = require('gulp-util');
const gulpSequence = require('gulp-sequence')
const del = require('del');
const gulpif = require('gulp-if');
const clean = require('gulp-clean');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const svgo = require('gulp-svgo');
const rename = require('gulp-rename');
const jsdoc = require('gulp-jsdoc3');
const useref = require('gulp-useref');
const gulpIf = require('gulp-if');
const server = require('gulp-server-livereload');
const replaceblocks = require('gulp-replace-build-block');
const syncy = require('syncy');
const dirSync = require( 'gulp-directory-sync' );
var bases = {
    in: './',
    dist: './public/',
};

var paths = {
    scripts: [bases.in + 'js/*.js'],
    js: bases.dist + 'js',
    libs: ['scripts/libs/jquery/dist/jquery.js', 'scripts/libs/underscore/underscore.js', 'scripts/backbone/backbone.js'],
    scss: [bases.in + 'css/**/*.scss'],
    css: bases.dist + 'css/', 
    html: ['./public/index.html'],
    images: [bases.in + 'img/tinified/*'],
    img: bases.dist + 'img/',
    libs: bases.in + 'libs/',
    ico: bases.in + 'ico.png'
};

var createErrorHandler =function(name) {
    return function (err) {
     console.error('Error from ' + name + ' in compress task', err.toString());
    };
};

/** 
 * @function hello 
 * @desc General gulp hello world test to make sure everything is properly installed
*/
gulp.task('hello', ()=>{
    console.log('Hello World');
});

/** 
 * @function build 
 * @desc complete build pipeline
*/
gulp.task('build', gulpSequence(['ico', 'images', 'sass', 'html'], 'compressjs','concatjs-en', 'concatjs-zh')); //eo build

/** 
 * @function clean 
 * @desc clean up by deleting the dist directory
*/
gulp.task('clean', ()=>{
    del([bases.dist]).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
    });
}); //eo clean

/** 
 * @function ico
 * @desc copy favicon into dist/ 
*/
gulp.task('ico', ()=>{
    gulp.src(paths.ico)
    .pipe(gulp.dest(bases.dist));
});

/** 
 * @function images
 * @desc copy all the images into dist/ 
*/
gulp.task('images', ()=>{
    console.log('... copying images from: ', paths.images, ' to: ', paths.img);
    gulp.src(paths.images)
    .pipe(svgo())
    .pipe(gulp.dest(paths.img));
});

/** 
 * @function sass 
 * @desc generate css from scss
*/
gulp.task('sass', ()=>{
    console.log('... generate css from scss: ', paths.scss, ' to: ', paths.css);
    return gulp.src(paths.scss)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'})
        .on('error', sass.logError)) 
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css))
});

/** 
 * @function html
 * @desc generate minimized html 
*/
gulp.task('html', ()=>{
    console.log('... generating minimized html from: ', paths.html, ' to: ', bases.dist)
    return gulp.src(paths.html)
    .pipe(htmlmin({
          collapseWhitespace: true
     }))
    .pipe(gulp.dest(bases.dist));
});

/**
 * @function smash
 * @desc smash together js files to reduce load times :)
 */
gulp.task('smash', ()=> {
    console.log('... generating smashed from: ', paths.html, ' to: ', bases.dist)
    return gulp.src('./public/index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify({mangle:false}).on('error', gutil.log)))
    .pipe(gulp.dest(bases.dist));
});
/**
 * @function htmlreplace
 * @desc smash together js files to reduce load times :)
 */
gulp.task('replace', ()=> {
    return gulp.src('./public/work/index.html')
    .pipe(replaceblocks())
    .pipe(gulp.dest('./public/work/'));
});
/**
 * @function docs
 * @desc create a docs/ for gh-pages
 */
function done(err) {
    let msg = err ? err : 'sync carried out successfully';
    console.log(msg);
}
gulp.task( 'sync', function() {
    return gulp.src( '' )
    .pipe(dirSync( './public', './docs', { printSummary: true } ))
    .on('error', gutil.log);
} );
gulp.task('docs', ()=> {
    return gulp.src('./public/**/*')
    .pipe(replaceblocks())
    .pipe(gulp.dest('./docs'));
});
/**
 * @function server
 * @desc spin up a server at localhost:8000
 * see https://github.com/hiddentao/gulp-server-livereload
 */
gulp.task('server', ()=> {
    gulp.src('docs')
      .pipe(server({
        livereload: true,
        open: true
      }));
  });
/** 
 * @function compressjs
 * @desc generate .min.js from .js;
*/
gulp.task('compressjs', ()=>{
    console.log('... generate minimized js from: ', paths.scripts, ' to: ', paths.js);
    gulp.src(paths.scripts)
    .pipe(uglify())
    .on('error', createErrorHandler('uglify'))
    .pipe(gulp.dest(paths.js))
});

/** 
 * @function concatjs
 * @desc generate all the minified js into a single js file 
*/
gulp.task('concatjs-en', ()=>{
    var src = [  bases.dist + 'js/config-en.js', paths.libs + 'jquery.min.js',  bases.dist + 'js/index.js'];
    var out = 'index-en.min.js';
    console.log('... concatenating js from: ', src.toString(), ' to: ', out);
    return gulp.src(src)
    .pipe(concat(out))
    .on('error', createErrorHandler('concat'))
    .pipe(gulp.dest(paths.js));
});

gulp.task('concatjs-zh', ()=>{
    var src = [  bases.dist + 'js/config-zh.js', paths.libs + 'jquery.min.js',  bases.dist + 'js/index.js'];
    var out = 'index-zh.min.js';
    console.log('... concatenating js from: ', src.toString(), ' to: ', out);
    return gulp.src(src)
    .pipe(concat(out))
    .on('error', createErrorHandler('concat'))
    .pipe(gulp.dest(paths.js));
});

/**
 * @function doc
 * @desc generate jsdocs
 */
gulp.task('doc', () => {
    var config = require('./docs/jsdoc.json');
    gulp.src(['./*.js'], {read: false})
        .pipe(jsdoc());
});