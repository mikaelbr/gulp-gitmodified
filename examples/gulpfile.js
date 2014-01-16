var gulp = require("gulp"),
    through = require('through2'),
    gitmodified = require("../");

gulp.task("foo", function () {
  var data = gulp.src(["../*.js", "../test/*.js"])
    .pipe(through.obj(function (file, enc, cb) {
      console.log(file);
      this.push(file);
      return cb();
    }))
    .pipe(gitmodified())
    .pipe(through.obj(function (file, enc, cb) {
      console.log(file.relative);
      this.push(file);
      return cb();
    }));
});
