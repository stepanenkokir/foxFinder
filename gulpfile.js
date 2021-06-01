// Определяем константы Gulp
const { src, dest, parallel, series, watch } = require('gulp');
const uglify = require('gulp-uglify');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const jshint = require('gulp-jshint');
const mocha = require('gulp-mocha');
const del = require('del');
const todo = require('gulp-todo');
const util = require('gulp-util');
const nodemon = require('gulp-nodemon');

function cleandist() {
	return del('bin/**/*', { force: true });
}

function scriptServer() {
	return src(['src/server/**/*.*', 'src/server/**/*.js'],{ base: 'src' })	
    .pipe(babel())
	.pipe(dest('bin/')) ;
}

function scriptClient() { 
	return src([
		'src/client/js/app.js'
		])	
	.pipe(uglify()) 
	.pipe(webpack(require('./webpack.config.js')))
  .pipe(babel())
	.pipe(dest('bin/client/js')); 
}

function moveClient(){	  
     return src(['src/client/**/*', '!src/client/js/*.js'])
    .pipe(dest('./bin/client/'));
}

function lint(){	
  return src(['**/*.js', '!node_modules/**/*.js', '!bin/**/*.js', '!src/**/*.min.js'])
    .pipe(jshint({
          esnext: true
      }))
    .pipe(jshint.reporter('default', { verbose: true}))
    .pipe(jshint.reporter('fail'));
}

function test(){
	return src(['test/**/*.js'])
        .pipe(mocha());
}

function todoMake(){
  	return src('src/**/*.js')
      .pipe(todo())
      .pipe(dest('./'));
}

function run() {
    return nodemon({
        delay: 1,
        script: './server/server.js',
        cwd: "./bin",          
        ext: 'html js css'
    })   
    .on('restart', function () {
        util.log('server restarted!');
    });
}

exports.test = test;
exports.build = series(lint, test, cleandist, scriptClient,scriptServer, moveClient, todoMake);
exports.run = series(lint, test, cleandist, scriptClient,scriptServer, moveClient, todoMake , run);
exports.start = run;
