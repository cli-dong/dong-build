'use strict';

var log = require('spm-log')
var uglify = require('gulp-uglify')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function(options, next) {
    vfs.src(['./lib/config.js'], {
        dot: true
      })
      .pipe(uglify())
      .pipe(vfs.dest(function(file) {
        return file.base
      }))
      .on('end', function() {
        log.info('uglify', '已压缩 lib/config.js 文件')

        next()
      })
  }
}
