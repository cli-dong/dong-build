'use strict';

var path = require('path')

var jshint = require('gulp-jshint')
var map = require('map-stream')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function check(options, next) {
  var dest = path.join(process.cwd(), options.root)

  // view files
  var arr = ['app/**/*.js', 'mod/**/*.js']
  var i = 0;
  var err = false;

  arr.forEach(function(view) {
    view = path.join(dest, view.trim());

    vfs.src(view, {
        dot: false
      })
      .pipe(jshint())
      // .pipe(jshint.reporter('default'))
      .pipe(map(function(file, cb) {
        if (!file.jshint.success) {
          err = true;
          log.info('check', 'JSHINT fail in `' + path.relative(dest, file.path) + '`')

          file.jshint.results.forEach(function(result) {
            if (result.error) {
              log.error('error', '\t' +
                        // ', code ' + result.error.code +
                        '' + result.error.reason +
                        ' (Line ' + result.error.line +
                        ', Column ' + result.error.character +
                        ')')
            }
          })
        }

        cb(null, file)
      }))
      .on('end', function() {
        if (!err && ++i === arr.length) {
          log.info('check', 'app 及 mod 文件检查通过')

          next()
        }
      })

  })
}
