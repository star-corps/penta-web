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
const dirSync = require( 'gulp-directory-sync' );
const merge = require('merge2')

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
gulp.task('hello', ()=>{   console.log('Hello World'); });

/** 
 * @function build 
 * @desc complete build pipeline
 * this is not the default build, but taken from the Penta roadmap as an example
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
 * @desc generate minimized html; combine  this task as part of smash / replaceblocks
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
 * @desc smash together js and css files to reduce load times using build block within index.html :)
 */
gulp.task('smash', ()=> {
    console.log('... generating smashed from: ', paths.html, ' to: ', bases.dist)
    return gulp.src('./public/index.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify({mangle:false}).on('error', gutil.log)))
    .pipe(gulp.dest('./public'));
});
/**
 * @function htmlreplace
 * @desc smash together js and css files to reduce load times :)
 */
gulp.task('replace', ()=> {
    var arr = ['./public/work/index.html','./public/service/index.html', './public/tags/index.html', './public/tags/**/index.html'];
    console.log('... replacing js/css blocks in:',arr.toString());
    return gulp.src(arr)
    .pipe(replaceblocks())
    .pipe(gulp.dest('./public'));
});
var indexesConfig = [
	{
		src: './public/work/index.html',
		dest: './public/work'
	},
	{
		src: './public/service/index.html',
		dest: './public/service'
    },
    {
		src: './public/tags/index.html',
		dest: './public/tags'
	},
	{
		src: './public/tags/**/index.html',
		dest: './public/tags/'
	},
    {
		src: './public/blog/index.html',
		dest: './public/blog'
	},
	{
		src: './public/blog/**/index.html',
		dest: './public/blog/'
	},
    {
		src: './public/categories/index.html',
		dest: './public/categories'
	},
	{
		src: './public/categories/**/index.html',
		dest: './public/categories/'
    },
    {
		src: './public/contact/index.html',
		dest: './public/contact/'
	}
];
gulp.task('replaceblocks', function() {
	// we use the array map function to map each
    // entry in our configuration array to a function

	var tasks = indexesConfig.map(function(entry) {
		// the parameter we get is this very entry. In
		// that case, an object containing src, name and
		// dest.
		// So here we create a Gulp stream as we would
		// do if we just handle one set of files
		return gulp.src(entry.src)
			.pipe(replaceblocks())
			.pipe(gulp.dest(entry.dest))
    });
    console.log('... replacing js/css blocks in:',indexesConfig.toString());
	// tasks now includes an array of Gulp streams. Use
	// the `merge-stream` module to combine them into one
	return merge(tasks);
});
gulp.task('htmlIndexes', function() {
	// we use the array map function to map each
	// entry in our configuration array to a function
	var tasks = indexesConfig.map(function(entry) {
		// the parameter we get is this very entry. In
		// that case, an object containing src, name and
		// dest.
		// So here we create a Gulp stream as we would
		// do if we just handle one set of files
		return gulp.src(entry.src)
            .pipe(htmlmin({
                collapseWhitespace: true
            }))
			.pipe(gulp.dest(entry.dest))
    });
    console.log('minimizing html in:',indexesConfig.toString());

	// tasks now includes an array of Gulp streams. Use
	// the `merge-stream` module to combine them into one
	return merge(tasks);
});
/**
 * @function docs
 * @desc create a docs/ for gh-pages; not used at present
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
    gulp.src('public')
      .pipe(server({
        livereload: true,
        open: true
      }));
  });
/** 
 * @function compressjs
 * @desc generate .min.js from .js; not used at present, use smash instead
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
/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 * oops, this is for gulp 4, we should stay with 3.9.1 for the moment
 */
//var build = gulp.series();
 /**
 * @function build
 * @desc Define default task that can be called by just running `gulp` from cli
 */
//first run: hugo
//then: gulp which will launch the default task, which runs in series a set of subtasks
gulp.task('default', gulpSequence('smash','replaceblocks','html','htmlIndexes'));