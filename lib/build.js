'use strict';

var path = require('path')

var chalk = require('chalk')
var crypto = require('dong-crypto')
var vfs = require('vinyl-fs')

module.exports = function build(options) {
  var dest = path.join(process.cwd(), options.root)

  options.views.split(',')
  .forEach(function(view) {
    view = path.join(dest, view.trim());

    vfs.src(view, { dot: false })
      .pipe(crypto(options))
      .pipe(vfs.dest(path.dirname(view)))
      .on('end', function() {
        console.log('')
        console.log(chalk.magenta('░▒▓██ 视图文件成功构建！'))
      })

  })

}
