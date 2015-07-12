'use strict';

var log = require('spm-log')
var gulpUglify = require('gulp-uglify')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function uglify(type, options, next) {
    vfs.src(['./lib/config.js'], {
        dot: true
      })
      .pipe(gulpUglify())
      .pipe(vfs.dest(function(file) {
        return file.base
      }))
      .on('end', function() {
        log.info('uglify', '已压缩 lib/config.js 文件')

        next()
      })
  }
}
