const exec = require('child_process').execFile;
const which = require('which');

const gitApp = 'git';
const gitExtra = { env: process.env };

class Git {
  // used for tests
  exec(app, args, extra, cb) {
    return exec(app, args, extra, cb);
  }

  // used for tests
  which(app, cb) {
    return which(app, cb);
  }

  getStatusByMatcher(matcher, baseDir, { stagedOnly, targetBranch } = {}, cb = baseDir) {
    if (typeof baseDir === 'function') {
      baseDir = undefined;
    }
    let gitExtraOptions = gitExtra;
    if (baseDir) {
      gitExtraOptions = {
        env: gitExtra.env,
        cwd: baseDir,
      };
    }

    this.which(gitApp, (err) => {
      if (err) {
        return cb(new Error('git not found on your system.'));
      }

      const configArgs = ['-c', 'core.quotepath=false'];
      let gitArgs = [...configArgs, 'status', '--porcelain'];
      if (targetBranch) {
        gitArgs = [...configArgs, 'diff', '--name-status', targetBranch];
      }

      this.exec(gitApp, gitArgs, gitExtraOptions, (err, stdout) => {
        if (err) {
          return cb(new Error(`Could not execute git ${gitArgs.join(' ')}`));
        }
        // partly inspired and taken from NPM version module
        const lines = stdout.split('\n').filter((line) => {
          if (!stagedOnly) {
            // staged files doesn't have space in front
            line = line.trim();
          }
          return line && matcher.test(line);
        }).map((line) => ({
          mode: matcher.exec(line.trim())[0].trim(),
          path: line.trim().replace(matcher, '').trim(),
        }));
        return cb(null, lines);
      });
    });
  }
}

module.exports = new Git();
