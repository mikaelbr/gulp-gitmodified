# gulp-gitmodified
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][depstat-image]][depstat-url]

> gitmodified plugin for [gulp](https://github.com/gulpjs/gulp)

## Usage

A plugin for Gulp to get an object stream of git status files on git (e.g. modified, deleted, untracked, etc).

First, install `gulp-gitmodified` as a development dependency:

```shell
npm install --save-dev gulp-gitmodified
```

Then, add it to your `gulpfile.js`:

```javascript
var gitmodified = require('gulp-gitmodified');

var files = gulp.src('./src/*.ext')
  .pipe(gitmodified('modified'));

files.on('data', function (file) {
  console.log('Modified file:', file);
});
```

## API

### gitmodified(statusMode|options)

For `statusMode`, you can pass a single string value or an array of string values.

`gulp-gitmodified` extends the vinyl file format gulp uses to have a method
for checking if file is deleted. `isDeleted` is true if checking for deleted
files (see below), and false otherwise.

#### `options`

Options can be used to pass in `gitCwd`, to override from which directory
git should be executed. This is handy in case you have your gulpfile in a
different directory than your where your repo resides.

```
// Options can be the following:
{
  gitCwd: String,
  modes: statusMode
}
```

`modes` is the value from below. If not defined it will default to `modified`.

#### statusMode

Type: `String` || `Array`
Default: 'modified'

What status mode to look for. From git documentation:

```
M = modified
A = added
D = deleted
R = renamed
C = copied
U = updated but unmerged
?? = untracked
!! = ignored
```

(and more if in short format (e.g. AM), see Short Format on [git status man page](https://www.kernel.org/pub/software/scm/git/docs/git-status.html))

#### Examples

```javascript
// All added files
gulp.src('./**/*')
    .pipe(gitmodified('added'))
```

```javascript
// Equal to the one before
gulp.src('./**/*')
    .pipe(gitmodified('A'))
```

```javascript
// All added and modified files
gulp.src('./**/*')
    .pipe(gitmodified(['added', 'modified']))
```

```javascript
// All added and modified files, from different git directory
gulp.src('./**/*')
    .pipe(gitmodified({
      modes: ['added', 'modified'],
      gitCwd: '../../differentDirectory'
    }))
```

```javascript
// All deleted files.
gulp.src('./**/*')
    .pipe(gitmodified('deleted'))
    .on('data', function (file) {
      console.log(file.isDeleted()); //=> true
    });
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-gitmodified
[npm-image]: https://badge.fury.io/js/gulp-gitmodified.png

[travis-url]: http://travis-ci.org/mikaelbr/gulp-gitmodified
[travis-image]: https://secure.travis-ci.org/mikaelbr/gulp-gitmodified.png?branch=master

[depstat-url]: https://david-dm.org/mikaelbr/gulp-gitmodified
[depstat-image]: https://david-dm.org/mikaelbr/gulp-gitmodified.png
