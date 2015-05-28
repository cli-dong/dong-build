'use strict';

var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function build(options) {
  var queue = new Queue()

  queue.use(require('./tasks/build-check'))

  if (options.force) {
    queue.use(require('./tasks/build-clean'))
  }

  if (options.i18n && !options.debug) {
    // translate
    queue.use(require('./tasks/build-i18n'))
  }

  if (!options.debug) {
    queue.use(require('./tasks/build-other'))
    queue.use(require('./tasks/build-index'))
  }

  queue.use(require('./tasks/build-seajs'))

  if (!options.debug) {
    queue.use(require('./tasks/build-flush'))
    queue.use(require('./tasks/build-uglify'))
  }

  queue.use(require('./tasks/build-compass'))

  queue.run(options, function() {
    log.info('build', '已完成项目构建')
  })
}
