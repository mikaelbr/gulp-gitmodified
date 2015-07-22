'use strict';

var gulp = require('gulp'),
    through = require('through2'),
    gitmodified = require('../');

gulp.task('foo', function () {
  gulp.src(['../**/*', '!../node_modules/**'])
    .pipe(through.obj(function (file, enc, cb) {
      this.push(file);
      return cb();
    }))
    .pipe(gitmodified())
    .on('error', function (err) {
      console.log(err);
    })
    .pipe(through.obj(function (file, enc, cb) {
      console.log('Modified: ', file.relative);
      this.push(file);
      return cb();
    }));
});
