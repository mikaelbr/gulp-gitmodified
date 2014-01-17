var exec = require("child_process").execFile,
  which = require("which");

var gitApp = 'git',
    gitExtra = {env: process.env};

var Git = function () { };

Git.prototype.exec = function (app, args, extra, cb) {
  return exec(app, args, extra, cb);
};

Git.prototype.which = function (app, cb) {
  return which(app, cb);
};

Git.prototype.getStatusByMatcher = function (matcher, cb) {
  var that = this;
  that.which(gitApp, function (err) {
    if (err) {
      return cb(new Error('git not found on your system.'))
    }
    that.exec(gitApp, [ "status", "--porcelain" ], gitExtra, function (err, stdout, stderr) {
      if (err) {
        return cb(new Error('Could not get git status --porcelain'));
      }
      // partly inspired and taken from NPM version module
      var lines = stdout.trim().split("\n").filter(function (line) {
        return line.trim() && matcher.test(line.trim());
      }).map(function (line) {
        return line.trim().replace(matcher, "").trim();
      });
      return cb(null, lines);
    });
  });
};

module.exports = new Git();
