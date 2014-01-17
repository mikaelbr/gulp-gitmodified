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

  // More tests to come.

});
