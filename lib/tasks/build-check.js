'use strict';

var path = require('path')

var jshint = require('gulp-jshint')
var map = require('map-stream')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function check(type, options, next) {
    var dest = path.join(process.cwd(), options.root)

    var err = 0

    vfs.src(['index.js', 'app/**/*.js', 'mod/**/*.js'], {
        dot: false
      })
      .pipe(jshint())
      // .pipe(jshint.reporter('default'))
      .pipe(map(function(file, cb) {
        if (file && file.jshint && !file.jshint.success) {
          log.info('check', '文件 "' + path.relative(dest, file.path) + '" 存在如下错误：')

          file.jshint.results.forEach(function(result) {
            if (result.error && err++ < 10) {
              log.error('error', '  - ' +
                // ', code ' + result.error.code +
                '' + result.error.reason +
                ' (Line ' + result.error.line +
                ', Column ' + result.error.character +
                ')')
            }
          })

          if (err >= 10) {
            log.info('check', '错误太多了，仅显示前 10 条')
            process.exit(1)
          }
        }

        cb(null, file)
      }))
      .on('end', function() {
        if (!err) {
          log.info('check', '已通过 JSHINT 代码检查')

          next()
        }
      })
  }
}
