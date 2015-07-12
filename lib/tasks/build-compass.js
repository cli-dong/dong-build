'use strict';

var log = require('spm-log')
var shell = require('shelljs')

module.exports = function() {
  return function compass(type, options, next) {
    var r = shell.exec('compass compile', {
      silent: true
    })

    if (r.code) {
      if (r.output.indexOf('    error') === 0) {
        log.error('error', '执行 `compass compile` 出错（' + r.output.substring(10, r.output.indexOf('\n') - 1) + '）')
      } else {
        log.error('error', '执行 `compass compile` 出错（请检查是否已安装 `compass`）')
      }
    } else {
      log.info('compass', '已生成 css 文件')
      next()
    }
  }
}
