/*global describe, it*/
"use strict";

var should = require("should"),
  through = require("through2"),
  fs = require("fs"),
  join = require("path").join,
  git = require("../lib/git");

require("mocha");

var filePath = join(__dirname, "./fixtures/*.txt"),
    expectedFile = join(__dirname, "./fixtures/a.txt");

var gutil = require("gulp-util"),
  gulp = require("gulp"),
  gitmodified = require("../");

describe("gulp-gitmodified", function () {

  it("should return a stream", function (done) {
    var stream = gitmodified();
    should.exist(stream.on);
    should.exist(stream.write);
    done();
  });

  it("should call git library with a tester", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      should.exist(tester);
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified());
  });

  it("should default to modified mode", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      tester.toString().should.equal("/^M\\s/i");
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified());
  });

  it("should map mode from named string to short hand", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      tester.toString().should.equal("/^M\\s/i");
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified("modified"));
  });

  it("should map deleted mode from named string to short hand", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      tester.toString().should.equal("/^D\\s/i");
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified("deleted"));
  });

  it("should return modified files", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      cb(null, ["a.txt"]);
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified("deleted"))
      .pipe(through.obj(function(file, enc, cb) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
        file.path.should.equal(expectedFile);
        done();
      }));
  });

  it("should throw error when git returns error", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      return cb(new Error("new error"));
    };
    var instream = gulp.src(filePath);
    var outstream = gitmodified();
    instream
      .pipe(gitmodified())
      .on('error', function (err) {
        should.exist(err);
        err.message.should.equal("new error");
        done();
      });
  });

  it("should throw gulp specific error", function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      return cb(new Error("new error"));
    };
    var instream = gulp.src(filePath);
    var outstream = gitmodified();
    instream
      .pipe(gitmodified())
      .on('error', function (err) {
        should.exist(err.plugin);
        err.plugin.should.equal("gulp-gitmodified");
        done();
      });
  });

  it("should pass on no files when no status is returned", function (done) {
    var numFiles = 0;
    git.getStatusByMatcher = function (tester, cb) {
      cb(null, []);
    };
    var instream = gulp.src(filePath);
    var outstream = gitmodified();
    instream
      .pipe(gitmodified("deleted"))
      .pipe(through.obj(function(file, enc, cb) {
        ++numFiles;
        done();
      }, function (callback) {
        numFiles.should.equal(0);
        callback();
        done();
      }));
  });

  it('should handle streamed files', function (done) {
    var streamedFile = new gutil.File({
      path: "test/fixtures/a.txt",
      cwd: "test/",
      base: "test/fixtures/",
      contents: fs.createReadStream("test/fixtures/a.txt")
    });

    git.getStatusByMatcher = function (tester, cb) {
      cb(null, ["a.txt"]);
    };
    var outstream = gitmodified();
    outstream.on('data', function(file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      should.exist(file.isStream());
      file.contents.should.equal(streamedFile.contents);
      done();
    });

    outstream.write(streamedFile);
  });

  it('should handle folders', function (done) {
    git.getStatusByMatcher = function (tester, cb) {
      cb(null, ["fixtures/"]);
    };

    var instream = gulp.src(join(__dirname, "./fixtures"));
    var outstream = gitmodified();

    outstream.on('data', function(file) {
      should.exist(file);
      should.exist(file.path);
      file.relative.should.equal('fixtures');
      should.exist(file.isNull());
      done();
    });

    instream.pipe(outstream);
  });

});
