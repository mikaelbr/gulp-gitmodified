var through = require("through2"),
  exec = require("child_process").exec,
  find = require("lodash.find"),
  gutil = require("gulp-util");

module.exports = function (param) {
  "use strict";

  var gitApp = 'git', gitExtra = {env: process.env};


  var getGitStatus = function (callback) {
    exec(gitApp + " " + [ "status", "--porcelain" ].join(' '), gitExtra, function (err, stdout, stderr) {
      if (err) return callback(err);
      // makeCommit parly inspired and taken from NPM version module
      var lines = stdout.trim().split("\n").filter(function (line) {
        return line.trim() && !line.match(/^\?\? /)
      }).map(function (line) {
        return line.trim()
      });
      return callback(null, lines);
    });
  };

  var files = null;

  // see "Writing a plugin"
  // https://github.com/gulpjs/gulp/wiki/Writing-a-Plugin:-Guidelines
  function gitmodified(file, enc, callback) {

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-gitmodified', 'Stream content is not supported'));
      return callback();
    }

    if (file.isNull()) {
      return callback();
    }
    var stream = this;

    var checkStatus = function () {
      var isIn = find(files, function (line) {
        return line.indexOf(file.path) !== -1;
      });

      if (isIn) {
        this.push(file);
        return callback();
      }
    };

    if (files) {
      checkStatus();
    }

    getGitStatus(function (err, statusFiles) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-gitmodified', err));
        callback();
      }
      console.log(err, statusFiles)
      files = statusFiles;
      checkStatus();
    });
  }

  return through.obj(gitmodified, function (cb) {
    files = null;
    cb();
  });
};
