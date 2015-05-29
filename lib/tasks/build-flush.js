'use strict';

var path = require('path')

var crypto = require('dong-crypto')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function build(options, next) {
    var dest = path.join(process.cwd(), options.root)

    // view files
    var view = ['lib/config.js']
      .concat(options.views.split(/[,\s]+/)
        .map(function(item) {
          return path.join(dest, item.trim())
        }))

    vfs.src(view, {
        dot: false
      })
      .pipe(crypto(options))
      .pipe(vfs.dest(function(file) {
        return file.base
      }))
      .on('end', function() {
        log.info('flush', '已生成资源文件 Hash 串')

        next()
      })
  }
}
