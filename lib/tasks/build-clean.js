'use strict';

var path = require('path')
var log = require('spm-log')
var rimraf = require('rimraf')

module.exports = function clean(options, next) {
  var dest = path.join(process.cwd(), options.root)
  var dist = 'dist'
  var tmp = 'tmp'

  function remove(i18n) {
    var count = i18n.length
    var i = 0

    function ok() {
      if (++i === count * 2) {
        next()
      }
    }

    i18n.forEach(function(lang) {
      var _dist = path.join(dist, lang)

      rimraf(path.join(dest, _dist), function(err) {
        if (err) {
          log.warn('clean', err);
        } else {
          log.info('clean', '已清除 ' + _dist + ' 目录')
        }

        ok()
      })
    })

    i18n.forEach(function(lang) {
      var _tmp = path.join(tmp, lang)

      rimraf(path.join(dest, _tmp), function(err) {
        if (err) {
          log.warn('clean', err);
        } else {
          log.info('clean', '已清除 ' + _tmp + ' 目录')
        }

        ok()
      })
    })
  }

  // Clean dest folder
  if (options.i18n) {
    remove(options.i18n)
  } else {
    rimraf(dest, function(err) {
      if (err) {
        log.warn('clean', err);
      } else {
        log.info('clean', '已清除 ' + dest + ' 目录文件')
      }

      next()
    })
  }
}
