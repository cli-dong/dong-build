'use strict';

var path = require('path')
var log = require('spm-log')
var rimraf = require('rimraf')

module.exports = function clean(options, next) {
  var dest = 'dist'

  function remove(i18n) {
    var count = i18n.length
    var i = 0

    function ok() {
      if (++i === count) {
        next()
      }
    }

    i18n.forEach(function(lang) {
      var _dest = path.join(dest, lang)

      log.info('clean', _dest)
      rimraf(_dest, ok)
    })
  }

  // Clean dest folder
  if (options.force) {
    if (options.i18n) {
      remove(options.i18n)
    } else {
      log.info('clean', dest)
      rimraf(dest, next)
    }
  } else {
    next()
  }
}
