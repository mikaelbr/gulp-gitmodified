const through = require('through2');
const PluginError = require('plugin-error');
const path = require('path');
const File = require('vinyl');

const git = require('./lib/git');

const ModeMapping = {
  modified: 'M',
  added: 'A',
  deleted: 'D',
  renamed: 'R',
  copied: 'C',
  updated: 'U',
  untracked: '??',
  ignored: '!!',
};

function setDeleted(file, isDeleted) {
  file.isDeleted = () => {
    return !!isDeleted;
  };
}

function makeVinylFile(path) {
  const file = new File({
    path: path,
    contents: null,
  });
  setDeleted(file, true);
  return file;
}

module.exports = function (modes) {
  let defaultOptions = {
    stagedOnly: false,
    targetBranch: undefined,
    gitCwd: undefined,
    modes: ['M'],
  };

  let files;
  let regexTest;
  let options = defaultOptions;

  if (typeof modes === 'object' && !Array.isArray(modes)) {
    options = modes;
    modes = modes.modes || [];
  }
  if (!Array.isArray(modes)) {
    modes = [modes];
  }
  if (options.stagedOnly && options.targetBranch) {
    throw new PluginError('gulp-gitmodified', 'stageOnly and targetBranch can\'t be used together');
  }

  modes = modes.reduce((acc, mode) => {
    if (typeof mode !== 'string') {
      return acc;
    }
    const mappedMode = ModeMapping[mode.trim().toLowerCase()] || mode;
    return acc.concat(mappedMode.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'));
  }, []);

  if (!modes.length) {
    modes = defaultOptions.modes;
  }

  regexTest = new RegExp('^(' + modes.join('|') + ')\\s', 'i');

  const gitmodified = function (file, enc, callback) {
    const stream = this;

    const checkStatus = () => {
      const isIn = !!files.find((fileLine) => {
        const line = path.normalize(fileLine.path);
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
    git.getStatusByMatcher(regexTest, options.gitCwd, options, (err, statusFiles) => {
      if (err) {
        stream.emit('error', new PluginError('gulp-gitmodified', err));
        return callback();
      }
      files = statusFiles;

      // Deleted files. Make into vinyl files
      files.forEach(function (file) {
        if (file.mode !== 'D') {
          return;
        }
        stream.push(makeVinylFile(file.path));
      });

      checkStatus();
    });
  };

  return through.obj(gitmodified, function (callback) {
    files = undefined;
    return callback();
  });
};
