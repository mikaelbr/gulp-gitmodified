/*global describe, it*/
'use strict';

var should = require('should'),
  through = require('through2'),
  fs = require('fs'),
  join = require('path').join,
  git = require('../lib/git');

require('mocha');

var filePath = join(__dirname, './fixtures/*.txt'),
    expectedFile = join(__dirname, './fixtures/a.txt');

var gutil = require('gulp-util'),
  gulp = require('gulp'),
  gitmodified = require('../');

describe('gulp-gitmodified', function () {

  it('should return a stream', function (done) {
    var stream = gitmodified();
    should.exist(stream.on);
    should.exist(stream.write);
    done();
  });

  it('should call git library with a tester', function (done) {
    git.getStatusByMatcher = function (tester) {
      should.exist(tester);
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified());
  });

  it('should default to modified mode', function (done) {
    git.getStatusByMatcher = function (tester) {
      tester.toString().should.equal('/^(M)\\s/i');
      done();
    };
    var instream = gulp.src(filePath);
    instream.pipe(gitmodified());
  });

  describe('acccept custom input', function () {
    it('should allow short hand', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(A)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('A'));
    });

    it('should allow multiple separated short hands', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(A|D)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified(['A', 'D']));
    });

    it('should allow any value', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(foo)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('foo'));
    });

    it('should allow override of git root', function (done, baseDir) {
      var expected = 'myBaseDir';
      git.getStatusByMatcher = function (tester, actual) {
        actual.should.equal(expected);
        tester.toString().should.equal('/^(foo)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified({
        modes: 'foo',
        gitCwd: expected
      }));
    });

    it('should default to modified if only git cwd is passed', function (done, baseDir) {
      var expected = 'myBaseDir';
      git.getStatusByMatcher = function (tester, actual) {
        actual.should.equal(expected);
        tester.toString().should.equal('/^(M)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified({
        gitCwd: expected
      }));
    });

    it('should allow override of git root and modes array', function (done, baseDir) {
      var expected = 'myBaseDir';
      git.getStatusByMatcher = function (tester, actual) {
        actual.should.equal(expected);
        tester.toString().should.equal('/^(foo|bar)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified({
        modes: ['foo', 'bar'],
        gitCwd: expected
      }));
    });
  });

  describe('map mode from named string to short hand', function () {
    it('should map for "modified"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(M)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('modified'));
    });

    it('should map for "added"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(A)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('added'));
    });

    it('should map for "deleted"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(D)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('deleted'));
    });

    it('should map for "renamed"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(R)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('renamed'));
    });

    it('should map for "copied"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(C)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('copied'));
    });

    it('should map for "updated"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(U)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('updated'));
    });

    it('should map for "untracked"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(\\?\\?)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('untracked'));
    });

    it('should map for "ignored"', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(!!)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified('ignored'));
    });

    it('should map multiple modes from named strings to multiple short hand', function (done) {
      git.getStatusByMatcher = function (tester) {
        tester.toString().should.equal('/^(A|D|\\?\\?)\\s/i');
        done();
      };
      var instream = gulp.src(filePath);
      instream.pipe(gitmodified(['added', 'deleted', 'untracked']));
    });
  });

  it('should return modified files', function (done) {
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      cb(null, [{ path: 'a.txt', mode: 'M' }]);
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified('modified'))
      .pipe(through.obj(function(file) {
        should.exist(file);
        should.exist(file.path);
        should.exist(file.contents);
        file.path.should.equal(expectedFile);
        done();
      }));
  });

  it('should return deleted files', function (done) {
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      cb(null, [{ path: 'a.txt', mode: 'D' }]);
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified('deleted'))
      .pipe(through.obj(function(file) {
        should.exist(file);
        should.exist(file.isDeleted());
        should.not.exist(file.contents);
        done();
      }));
  });

  it('should throw error when git returns error', function (done) {
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      return cb(new Error('new error'));
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified())
      .on('error', function (err) {
        should.exist(err);
        err.message.should.equal('new error');
        done();
      });
  });

  it('should throw gulp specific error', function (done) {
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      return cb(new Error('new error'));
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified())
      .on('error', function (err) {
        should.exist(err.plugin);
        err.plugin.should.equal('gulp-gitmodified');
        done();
      });
  });

  it('should pass on no files when no status is returned', function (done) {
    var numFiles = 0;
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      cb(null, []);
    };
    var instream = gulp.src(filePath);
    instream
      .pipe(gitmodified('deleted'))
      .pipe(through.obj(function() {
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
      path: 'test/fixtures/a.txt',
      cwd: 'test/',
      base: 'test/fixtures/',
      contents: fs.createReadStream(join(__dirname, '/fixtures/a.txt'))
    });

    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      cb(null, [{ path: 'a.txt', mode: 'M' }]);
    };
    var outstream = gitmodified();
    outstream.on('data', function(file) {
      should.exist(file);
      should.exist(file.path);
      should.exist(file.contents);
      should(file.isNull()).not.equal(true);
      should.exist(file.isStream());
      file.contents.should.equal(streamedFile.contents);
      done();
    });

    outstream.write(streamedFile);
  });

  it('should handle folders', function (done) {
    git.getStatusByMatcher = function (tester, baseDir, cb) {
      if (typeof baseDir === 'function') {
        cb = baseDir;
        baseDir = void 0;
      }
      cb(null, [{ path: 'fixtures/', mode: 'M' }]);
    };

    var instream = gulp.src(join(__dirname, './fixtures'));
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
