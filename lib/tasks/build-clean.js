'use strict';

var log = require('spm-log')
var rimraf = require('rimraf')

module.exports = function clean(options, next) {
  // Clean dest folder
  if (options.force) {
    log.info('clean', 'dist')
    rimraf('dist', next);
  } else {
    next()
  }
}
