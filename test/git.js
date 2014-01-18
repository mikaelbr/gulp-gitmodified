/*global describe, it*/
"use strict";

var should = require("should"),
  git = require("../lib/git");

require("mocha");

describe("gulp-gitmodified", function () {

  it("should have mockable which and exec", function (done) {
    var fnCalls = 0;
    git.which = function (app, cb) {
      ++fnCalls;
      app.should.equal("git");
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      ++fnCalls;
      app.should.equal("git");
      cb(null, "");
    };
    git.getStatusByMatcher(/\\s/, function (err) {
      should(err).equal(null);
      fnCalls.should.equal(2);
      done();
    });
  });


  it("should give error if git is not found on the system", function (done) {
    git.which = function (app, cb) {
      cb(new Error());
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, "");
    };
    git.getStatusByMatcher(/\\s/, function (err) {
      should(err.message).equal("git not found on your system.");
      done();
    });
  });

  it("should return a file returned by git status", function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, "M index.js");
    };
    git.getStatusByMatcher(/M\s/i, function (err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data[0]);
      data[0].should.equal('index.js');
      done();
    });
  });


  it("should return several files from git status", function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, "M index.js\nM foo.js\nM bar.js");
    };
    git.getStatusByMatcher(/M\s/i, function (err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data[0]);
      data.length.should.equal(3);
      done();
    });
  });

  it("should ignore statused files that doesnt match pattern", function (done) {
    git.which = function (app, cb) {
      cb();
    };
    git.exec = function (app, args, extra, cb) {
      cb(null, "M index.js\nD foo.js\nM bar.js");
    };
    git.getStatusByMatcher(/M\s/i, function (err, data) {
      should.not.exist(err);
      should.exist(data);
      should.exist(data[0]);
      data.length.should.equal(2);
      done();
    });
  });

});
