'use strict';

var path = require('path')

var log = require('spm-log')
var Queue = require('dong-queue')
var rimraf = require('rimraf')

module.exports = function(all) {
  return function clean(type, options, next) {
    var dest = path.join(process.cwd(), options.root)
    var dist = 'dist'
    var tmp = 'tmp'

    function remove(i18n) {
      var queue = new Queue()

      if (all) {
        i18n.forEach(function(lang, index) {
          queue.use(function(next) {
            var _dist = path.join(dist, index === 0 ? '_src' : lang)

            rimraf(path.join(dest, _dist), function(err) {
              if (err) {
                log.warn('clean', err);
              } else {
                log.info('clean', '已清除 ' + _dist + ' 目录')
              }

              next()
            })
          })
        })
      }

      i18n.forEach(function(lang, index) {
        queue.use(function(next) {
          var _tmp = path.join(tmp, index === 0 ? '_src' : lang)

          rimraf(path.join(dest, _tmp), function(err) {
            if (err) {
              log.warn('clean', err);
            } else {
              log.info('clean', '已清除 ' + _tmp + ' 目录')
            }

            next()
          })
        })
      })

      queue.all(next)
    }

    // Clean dest folder
    if (options.i18n) {
      remove(options.i18n)
    } else {
      if (all) {
        rimraf(dest, function(err) {
          if (err) {
            log.warn('clean', err);
          } else {
            log.info('clean', '已清除 ' + dest + ' 目录文件')
          }

          next()
        })
      } else {
        next()
      }
    }
  }
}
