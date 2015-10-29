var through = require('through2'),
  find = require('lodash.find'),
  gutil = require('gulp-util'),
  git = require('./lib/git'),
  path = require('path'),
  File = require('vinyl');

module.exports = function (modes) {
  'use strict';
  var options = {};

  var files = null,
      regexTest,
      modeMapping = {
    modified: 'M',
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    copied: 'C',
    updated: 'U',
    untracked: '??',
    ignored: '!!'
  };

  if (typeof modes === 'object' && (!!modes.modes || !!modes.gitCwd)) {
    options = modes;
    modes = modes.modes || [];
  }
  if (!Array.isArray(modes)) modes = [modes];

  modes = modes.reduce(function(acc, mode) {
    var mappedMode;
    if (typeof mode !== 'string') return acc;
    mappedMode = modeMapping[mode.trim().toLowerCase()] || mode;
    return acc.concat(mappedMode.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
  }, []);

  if (!modes.length) modes = ['M'];

  regexTest = new RegExp('^('+modes.join('|')+')\\s', 'i');

  var gitmodified = function (file, enc, callback) {
    var stream = this;

    var checkStatus = function () {
      var isIn = !!find(files, function (fileLine) {
        var line = path.normalize(fileLine.path);
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
    git.getStatusByMatcher(regexTest, options.gitCwd, function (err, statusFiles) {
      if (err) {
        stream.emit('error', new gutil.PluginError('gulp-gitmodified', err));
        return callback();
      }
      files = statusFiles;

      // Deleted files. Make into vinyl files
      files.forEach(function(file) {
        if (file.mode !== 'D') return;
        stream.push(makeVinylFile(file.path));
      });

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
