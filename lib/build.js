'use strict';

require('gnode');

var hooker = require('hooker')
var figures = require('figures')
var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function(type, options) {
  if (!options) {
    options = type
    type = 'spa'
  }

  if (options.i18n && typeof options.i18n === 'string') {
    options.i18n = options.i18n.split(/[,\s]+/)
  }

  var queue = new Queue()

  queue.use(require('./tasks/build-check')())

  // clean dist and tmp
  queue.use(require('./tasks/build-clean')(options.force))

  queue.use(require('./tasks/build-message')())

  if (!options.debug) {
    // vars replacement
    queue.use(require('./tasks/build-template')())
  }

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

  var durations = {}
  var lastName

  var begin
  var end

  function calcLast() {
    if (lastName) {
      durations[lastName] = Date.now() - durations[lastName]
    }
  }

  hooker.hook(Queue, 'exec', function(fn) {
    if (fn.name && !durations[fn.name]){
      calcLast()
      durations[(lastName = fn.name)] = Date.now()
    }
  })

  function cov(ms) {
    var ENUM = ['ms', 's', 'm', 'h']

    var i = 0, unit = 1000

    while (ms > unit) {
      ms /= unit
      unit = 60
      i++
    }

    return ms.toFixed(2).replace(/\.00|0$/g, '') + ENUM[i]
  }

  function pad(s, n) {
    return new Array((n || log.width) - s.length).join(' ') + s
  }

  function bar(n, t) {
    n = Math.round(n / t * 100) || 1
    return new Array((Math.round(n * 0.1) || 1) + 1).join(figures.square) + ' ' + n + '%'
  }

  function show() {
    calcLast()

    var total = Object.keys(durations).map(function(key) {
      return durations[key]
    }).reduce(function(p, c) {
      return p + c
    })

    log.info('times', ['from ' + begin.toISOString() + ' to ' + end.toISOString()].concat(Object.keys(durations).map(function(n) {
      return pad(n) + ': ' + pad(cov(durations[n]), 7) + ' ' + bar(durations[n], total)
    })).concat(['', pad('total') + ': ' + pad(cov(total), 7)]).join('\n' + new Array(log.width + 3).join(' ')))
  }

  begin = new Date()

  queue.run(type, options, function() {
    log.info('build', '已完成构建任务')

    end = new Date()
    show()
  })
}
