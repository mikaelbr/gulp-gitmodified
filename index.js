var through = require('through2'),
  find = require('lodash.find'),
  gutil = require('gulp-util'),
  git = require('./lib/git'),
  File = require('vinyl');

module.exports = function (mode) {
  'use strict';

  var files = null,
      regexTest,
      modeMapping = {
    unmodified: '\\s',
    modified: 'M',
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    copied: 'C',
    updated: 'U',
    untracked: '??',
    ignored: '!!'
  };

  if (mode && !!modeMapping[mode.trim().toLowerCase()]) {
    mode = modeMapping[mode.trim().toLowerCase()];
  }
  mode = (mode || 'M').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  regexTest = new RegExp('^'+mode+'\\s', 'i');

  var gitmodified = function (file, enc, callback) {
    var stream = this;

    var checkStatus = function () {
      var isIn = !!find(files, function (line) {
        if (line.substring(line.length, line.length - 1)) {
          return file.path.indexOf(line.substring(0, line.length - 1)) !== -1;
        }
        return file.path.indexOf(line) !== -1;
      });

      if (isIn) {
        setDeleted(file, false);
        stream.push(file);
      }
      return callback();
    };

    if (!!files) {
      return checkStatus();
    }
    git.getStatusByMatcher(regexTest, function (err, statusFiles) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-gitmodified', err));
        return callback();
      }
      files = statusFiles;

      if (mode === 'D') {
        // Deleted files. Make into vinyl files
        files.map(makeVinylFile).forEach(function (file) {
          stream.push(file);
        });
      }

      checkStatus();
    });
  };

  return through.obj(gitmodified, function (callback) {
    files = null;
    return callback();
  });
};

function makeVinylFile (path) {
  var file = new File({
    path: path,
    contents: null
  });
  setDeleted(file, true);
  return file;
}

function setDeleted (file, isDeleted) {
  file.isDeleted = function () { return !!isDeleted; };
}
