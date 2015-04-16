'use strict';

var fs = require('fs')
var path = require('path')

var chalk = require('chalk')
var crypto = require('dong-crypto')
var shell = require('shelljs')
var vfs = require('vinyl-fs')

module.exports = function build(options) {
  var dest = path.join(process.cwd(), options.root)

  var spm = options.pkg.spm
  var _main = spm.main
  var _output = spm.output

  ;(function backup() {
    fs.renameSync('./package.json', './_package.json')
  })()

  ;(function buildOther() {
    spm.main = ''
    spm.output = _output

    var args = [
      '--sea all',
      '--global jquery:util.$',
      '--skip source-map',
      '--idleading /{{name}}'
    ]

    console.log(chalk.magenta('░▒▓██ 构建业务文件……'))
    fs.writeFileSync('./package.json', JSON.stringify(options.pkg))

    shell.exec('spm build ' + args.join(' '), {
      silent: false
    })
  })()

  ;(function buildIndex() {
    spm.main = _main
    spm.output = ''

    var args = [
      '--sea all',
      '--skip source-map',
      '--idleading /{{name}}'
    ]

    console.log(chalk.magenta('░▒▓██ 构建 index 文件……'))
    fs.writeFileSync('./package.json', JSON.stringify(options.pkg))

    shell.exec('spm build ' + args.join(' '), {
      silent: false
    })
  })()

  ;(function restore() {
    fs.renameSync('./_package.json', './package.json')
  })()

  // view files
  var arr = ['./static/lib/config.js']
  var i = 0;

  arr.concat(options.views.split(','))
    .forEach(function(view) {
      view = path.join(dest, view.trim());

      vfs.src(view, {
          dot: false
        })
        .pipe(crypto(options))
        .pipe(vfs.dest(path.dirname(view)))
        .on('end', function() {
          if (++i === arr.length) {
            console.log('')
            console.log(chalk.magenta('░▒▓██ 视图及 config 文件成功构建！'))
          }
        })

    })
}
