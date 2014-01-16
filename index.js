var through = require("through2"),
  exec = require("child_process").exec,
  find = require("lodash.find"),
  gutil = require("gulp-util");

module.exports = function (param) {
  "use strict";

  var files = null,
      gitApp = 'git',
      gitExtra = {env: process.env};

  var getGitStatus = function (callback) {
    exec(gitApp + " " + [ "status", "--porcelain" ].join(' '), gitExtra, function (err, stdout, stderr) {
      if (err) {
        return callback(err);
      }
      // makeCommit parly inspired and taken from NPM version module
      var lines = stdout.trim().split("\n").filter(function (line) {
        return line.trim() && !line.match(/^\?\? /)
      }).map(function (line) {
        return line.trim().substring(2);
      });

      return callback(null, lines);
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

    if (files) {
      return checkStatus();
    }

    getGitStatus(function (err, statusFiles) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-gitmodified', err));
        callback();
      }
      files = statusFiles;
      checkStatus();
    });
  }

  return through.obj(gitmodified, function (callback) {
    files = null;
    callback();
  });
};
