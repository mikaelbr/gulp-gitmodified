var through = require("through2"),
  exec = require("child_process").execFile,
  find = require("lodash.find"),
  which = require("which")
  gutil = require("gulp-util");

module.exports = function (param) {
  "use strict";

  var files = null,
      gitApp = 'git',
      gitExtra = {env: process.env};

  var getGitStatus = function (cb) {

    which(gitApp, function (err) {
      if (err) {
        return cb(new Error('git not found on your system.'))
      }

      exec(gitApp, [ "status", "--porcelain" ], gitExtra, function (err, stdout, stderr) {
        if (err) {
          return cb(new Error('Could not get git status --porcelain'));
        }
        // makeCommit parly inspired and taken from NPM version module
        var lines = stdout.trim().split("\n").filter(function (line) {
          return line.trim() && !line.match(/^\?\? /)
        }).map(function (line) {
          return line.trim().substring(2);
        });

        return cb(null, lines);
      });
    });
  };

  var gitmodified = function (file, enc, callback) {
    var stream = this;

    if (file.isNull()) {
      return callback();
    }
    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-gitmodified', 'Stream content is not supported'));
      return callback();
    }

    var checkStatus = function () {
      var isIn = find(files, function (line) {
        return file.path.indexOf(line) !== -1;
      });

      if (isIn) {
        stream.push(file);
      }
      return callback();
    };

    if (!!files) {
      return checkStatus();
    }

    getGitStatus(function (err, statusFiles) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-gitmodified', err));
        return callback();
      }
      files = statusFiles;
      checkStatus();
    });
  }

  return through.obj(gitmodified, function (callback) {
    files = null;
    return callback();
  });
};
