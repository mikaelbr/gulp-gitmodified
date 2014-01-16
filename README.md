(PLUGIN AUTHOR: Please read [Plugin README conventions](https://github.com/wearefractal/gulp/wiki/Plugin-README-Conventions), then delete this line)

# gulp-gitmodified
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]  [![Coverage Status](coveralls-image)](coveralls-url) [![Dependency Status][depstat-image]][depstat-url]

> gitmodified plugin for [gulp](https://github.com/wearefractal/gulp)

## Usage

First, install `gulp-gitmodified` as a development dependency:

```shell
npm install --save-dev gulp-gitmodified
```

Then, add it to your `gulpfile.js`:

```javascript
var gitmodified = require("gulp-gitmodified");

gulp.src("./src/*.ext")
	.pipe(gitmodified({
		msg: "Hello Gulp!"
	}))
	.pipe(gulp.dest("./dist"));
```

## API

### gitmodified(options)

#### options.msg
Type: `String`  
Default: `Hello World`

The message you wish to attach to file.


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)

[npm-url]: https://npmjs.org/package/gulp-gitmodified
[npm-image]: https://badge.fury.io/js/gulp-gitmodified.png

[travis-url]: http://travis-ci.org/mikaelbr/gulp-gitmodified
[travis-image]: https://secure.travis-ci.org/mikaelbr/gulp-gitmodified.png?branch=master

[coveralls-url]: https://coveralls.io/r/mikaelbr/gulp-gitmodified
[coveralls-image]: https://coveralls.io/repos/mikaelbr/gulp-gitmodified/badge.png

[depstat-url]: https://david-dm.org/mikaelbr/gulp-gitmodified
[depstat-image]: https://david-dm.org/mikaelbr/gulp-gitmodified.png
