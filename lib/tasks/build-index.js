'use strict';

var Build = require('spm-sea').Build

module.exports = function index(options, next) {

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

  new Build(args)
    .getArgs()
    .installDeps()
    .parsePkg()
    .addCleanTask()
    .run(function(err) {
      if (err) {
        console.error(err.message)
        console.error(err.stack)
        process.exit(1)
      }

      next()
    })
}
