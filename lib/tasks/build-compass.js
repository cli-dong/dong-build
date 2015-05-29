'use strict';

var log = require('spm-log')
var shell = require('shelljs')

module.exports = function() {
  return function(options, next) {
    shell.exec('compass compile', {
      silent: true
    })

    log.info('compass', '已生成 css 文件')

    next()
  }
}
