/*
 * dong-build
 * https://github.com/crossjs/dong-build
 *
 * Copyright (c) 2015 crossjs
 * Licensed under the MIT license.
 */

/**
 * @todo Integrate grunt and spm build
 */

'use strict';

var extend = require('extend')
var getPkg = require('package')

module.exports = function(options) {

  var pkg = getPkg('.')

  options = extend({
    root: '.',
    views: '*.html'
  }, pkg && pkg.dong || {}, options)

  require('./lib/build')(options)

}
