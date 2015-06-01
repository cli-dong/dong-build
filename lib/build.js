'use strict';

require('gnode');

var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function(type, options) {
  if (!options) {
    options = type
    type = 'spa'
  }

  if (typeof options.i18n === 'string') {
    options.i18n = options.i18n.split(/[,\s]+/)
  }

  var queue = new Queue()

  queue.use(require('./tasks/build-check')())

  // clean dist and tmp
  queue.use(require('./tasks/build-clean')(options.force))

  if (options.i18n && !options.debug) {
    // translate
    queue.use(require('./tasks/build-i18n')())
  }

  if (!options.debug) {
    queue.use(require('./tasks/build-other')())
    queue.use(require('./tasks/build-index')())
  }

  queue.use(require('./tasks/build-seajs')())

  if (!options.debug) {
    queue.use(require('./tasks/build-flush')())
    queue.use(require('./tasks/build-uglify')())
  }

  queue.use(require('./tasks/build-compass')())

  // clean tmp
  queue.use(require('./tasks/build-clean')(false))

  queue.run(type, options, function() {
    log.info('build', '已完成项目构建')
  })
}
