'use strict';

var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function build(options) {
  var queue = new Queue()

  queue.use(require('./tasks/build-check'))

  if (options.force) {
    queue.use(require('./tasks/build-clean'))
  }

  if (options.i18n) {
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
  }

  queue.run(options, function() {
    log.info('build', 'done!')
  })
}
