var gulp = require("gulp"),
    gitmodified = require("./");

gulp.task("foo", function () {
  gulp.src("*").pipe(gitmodified());
});
