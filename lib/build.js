'use strict';

var fs = require('fs')

var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function build(options) {
  var queue = new Queue()

  queue.use(require('./tasks/build-clean'))
  queue.use(require('./tasks/build-app'))

  // SINGLE PAGE APPLICATION
  if (options.type === 'spa' && fs.existsSync('index')) {
    queue.use(require('./tasks/build-index'))
  }

  queue.use(require('./tasks/build-sea'))
  queue.use(require('./tasks/build-md5'))

  queue.run(options, function() {
    log.info('build', 'done!')
  })
}
