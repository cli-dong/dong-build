'use strict';

var fs = require('fs')
var path = require('path')

var Build = require('spm-sea').Build
var extend = require('extend')
var log = require('spm-log')
var Queue = require('dong-queue')

module.exports = function index(options, next) {

  // SINGLE PAGE APPLICATION
  if (options.type !== 'spa' || !fs.existsSync('index.js')) {
    return next()
  }

  var dest = 'dist'

  var args = {
    cwd: process.cwd(),
    sea: 'all',
    skip: 'source-map',
    idleading: function(path, pkg) {
      // if is NOT spm module
      if (pkg.origin.dong) {
        return ''
      }

      return '{{name}}'
    },
    entry: ['index.js']
  }

  function build(args, callback) {
    new Build(args)
      .getArgs()
      // .installDeps()
      .parsePkg()
      .addCleanTask()
      .run(function(err) {
        if (err) {
          console.error(err.message)
          console.error(err.stack)
          process.exit(1)
        }

        callback()
      })
  }

  function buildI18N(i18n) {
    log.info('i18n', i18n)

    var queue = new Queue()

    i18n.forEach(function(lang) {
      queue.use(function(next) {
        build(extend({
          dest: [dest, lang].join(path.sep)
        }, args), next)
      })
    })

    queue.run(next)
  }

  if (options.i18n) {
    buildI18N(options.i18n)
  } else {
    build(args, next)
  }

}
