/*
 * dong-build
 * https://github.com/crossjs/dong-build
 *
 * Copyright (c) 2015 crossjs
 * Licensed under the MIT license.
 */

'use strict';

require('gnode');

var extend = require('extend')
var getPkg = require('package')

module.exports = function(options) {

  var pkg = getPkg('.')

  options = extend({
    root: '.',
    views: '*.html',
    force: false,
    debug: false
  }, pkg && pkg.dong || {}, options)

  if (typeof options.lang === 'string') {
    options.lang = options.lang.split(/[,\s]+/)
  }

  options.pkg = pkg;

  require('./lib/build')(options)

}
