'use strict';

var fs = require('fs')
var path = require('path')

var Queue = require('dong-queue')
var replace = require('dong-replace')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function(type, options, next) {
    var dest = path.join(process.cwd(), options.root)

    /*jshint maxparams:5*/

    function translate(src, cwd, lang, done, display) {
      var filePath = path.join(cwd, 'i18n', lang + '.json')

      vfs.src(src.concat('!**/i18n/*.json'), {
          dot: false
        })
        // replace(dict, flag)
        .pipe(replace(fs.existsSync(filePath) ? require(filePath) : null, true))
        // save
        .pipe(vfs.dest(function(file) {
          return ['.', 'tmp', lang, path.relative(dest, file.base)].join(path.sep)
        }))
        .on('end', function() {
          log.info('translate', '  - ' + lang + '/' + (display || src))

          done()
        })
    }

    var queue = new Queue()

    options.i18n.forEach(function(lang) {
      // 中文不需要翻译
      if (lang === 'zh-CN') {
        return
      }

      // main files
      queue.use(function(done) {
        translate(
          ['package.json', 'index.*', 'app/**/*', 'mod/**/*'],
          dest, lang, done, ' 本地业务文件'
        )
      })
    })

    var spmModules = path.join(dest, 'spm_modules')

    // spm modules
    fs.readdirSync(spmModules).forEach(function(dir) {
      if (dir.charAt(0) === '.') {
        return true;
      }

      var dirPath = path.join(spmModules, dir)

      fs.readdirSync(dirPath).forEach(function(ver) {
        var verPath = path.join(dirPath, ver)

        options.i18n.forEach(function(lang) {
          if (lang === 'zh-CN') {
            return true;
          }

          // main files
          queue.use(function(done) {
            translate(
              [path.join(verPath, '**', '*')],
              verPath, lang, done, dir + ' 模块'
            )
          })
        })
      })
    })

    log.info('i18n', '开始多语言处理：')

    queue.run(function() {
      log.info('i18n', '已完成多语言处理')
      next()
    })
  }
}
