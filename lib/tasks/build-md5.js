'use strict';

var path = require('path')

var crypto = require('dong-crypto')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function build(options, next) {
  var dest = path.join(process.cwd(), options.root)

  // view files
  var arr = ['lib/config.js']
  var i = 0;

  arr.concat(options.views.split(','))
    .forEach(function(view) {
      view = path.join(dest, view.trim());

      vfs.src(view, {
          dot: false
        })
        .pipe(crypto(options))
        .pipe(vfs.dest(path.dirname(view)))
        .on('end', function() {
          if (++i === arr.length) {
            log.info('build', 'views 及 config 文件')

            next()
          }
        })

    })
}
