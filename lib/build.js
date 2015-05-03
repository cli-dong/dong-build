'use strict';

var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function build(options) {
  var queue = new Queue()

  if (!options.debug) {
    queue.use(require('./tasks/build-clean'))
    queue.use(require('./tasks/build-app'))
    queue.use(require('./tasks/build-index'))
  }

  queue.use(require('./tasks/build-sea'))

  if (!options.debug) {
    queue.use(require('./tasks/build-md5'))
  }

  queue.run(options, function() {
    log.info('build', 'done!')
  })
}
