var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var factor = require('factor-bundle');

var sourcemaps = require("gulp-sourcemaps");
var buffer = require('vinyl-buffer');

var uglify = require('gulp-uglify');


// BROWSERIFY 模块化打包 JS， 依赖 COPY:JS 任务
gulp.task('BROWSERIFY', ['COPY:JS'], function() {

    // 获取多页面的每个入口文件
    function getEntry() {
        var fileDir = path.resolve(process.cwd(), './src');
        var jsPath = path.resolve(fileDir, 'js');
        var dirs = fs.readdirSync(jsPath);
        var matchs = [];
        var entryfiles = [];

        dirs.forEach(function(item) {
            matchs = item.match(/(.+)\.js$/);
            // console.log(fileDir);
            if (matchs) {
                entryfiles.push('./src/js/' + matchs[1] + '.js');
            }
        });

        return entryfiles;
    }

    // 获取打包生成文件路径
    function getOut() {
        var outFiles = getEntry().map(function(item, index) {
            return item.replace('./src/js/', './bundle/');
        });

        return outFiles;
    }

    // BROWSERIFY 打包任务
    return browserify({
            entries: getEntry(),
            plugin: [
                [factor, {
                    outputs: getOut()
                }]
            ],
            debug: true
        })
        .bundle()
        .pipe(source("common.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest('./bundle/'));

});

gulp.task('HTML', function() {
    return gulp.src('./src/html/*.html')
        .pipe(gulp.dest('./bundle/html/'));
});

gulp.task('COPY:JS', function() {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest('./bundle/'));
});

// 发布 JS
gulp.task('BUILD:JS', ['BROWSERIFY'], function() {
    var timeStamp = Date.parse(new Date());
    console.log(timeStamp);
    return gulp.src('./bundle/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./bundle/'));
});

gulp.task('default', ['BUILD:JS', 'HTML'], function() {
    console.log('---------------------构建完成---------------------')
});