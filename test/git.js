/*global describe, it*/
'use strict';

var should = require('should'),
  git = require('../lib/git');

require('mocha');

describe('gulp-gitmodified', function () {

  it('should have mockable which and exec', function (done) {
    var fnCalls = 0;
    git.which = function (app, cb) {
      ++fnCalls;
      app.should.equal('git');
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      ++fnCalls;
      app.should.equal('git');
      cb(null, '');
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), function (err) {
      should(err).equal(null);
      fnCalls.should.equal(2);
      done();
    });
  });


  it('should give error if git is not found on the system', function (done) {
    git.which = function (app, cb) {
      cb(new Error());
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, '');
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), function (err) {
      should(err.message).equal('git not found on your system.');
      done();
    });
  });

  it('should pass on cwd', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      extra.cwd.should.equal('foo');
      done();
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), 'foo', function (err) {
      should(err.message).equal('git not found on your system.');
      done();
    });
  });

  it('should return a file returned by git status', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, 'M index.js');
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), function (err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data[0]);
      data[0].should.eql({
        mode: 'M',
        path: 'index.js'
      });
      done();
    });
  });


  it('should return several files from git status', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, 'M index.js\nM foo.js\nM bar.js');
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), function (err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data[0]);
      data.length.should.equal(3);
      done();
    });
  });

  it('should return statused files which match pattern', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, 'M index.js\nD foo.js\nM bar.js');
    };
    git.getStatusByMatcher(new RegExp('^(M)\\s', 'i'), function (err, data) {
      should.not.exist(err);
      data.length.should.equal(2);
      data[0].should.eql({ mode: 'M', path: 'index.js' });
      data[1].should.eql({ mode: 'M', path: 'bar.js' });
      done();
    });
  });

  it('should return statused files which match complex pattern', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, 'M index.js\nD foo.js\nM bar.js\nA baz.js');
    };
    git.getStatusByMatcher(new RegExp('^(A|D)\\s', 'i'), function (err, data) {
      should.not.exist(err);
      data.length.should.equal(2);
      data[0].should.eql({ mode: 'D', path: 'foo.js' });
      data[1].should.eql({ mode: 'A', path: 'baz.js' });
      done();
    });
  });

  it('should return statused files which match complex pattern', function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, 'C index.js\n?? foo.js\n  bar.js\n!! baz.js');
    };
    git.getStatusByMatcher(new RegExp('^(C|!!|\\?\\?)\\s', 'i'), function (err, data) {
      should.not.exist(err);
      data.length.should.equal(3);
      data[0].should.eql({ mode: 'C', path: 'index.js' });
      data[1].should.eql({ mode: '??', path: 'foo.js' });
      data[2].should.eql({ mode: '!!', path: 'baz.js' });
      done();
    });
  });

});
