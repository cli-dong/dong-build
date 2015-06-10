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

    function mkdir(arr) {
      var a = [dest]
      var i
      var p
      while ((i = arr.shift())) {
        a.push(i)
        p = path.join.apply(null, a)
        if (!fs.existsSync(p)) {
          fs.mkdirSync(p)
        }
      }
    }

    function merge(lang, done, display) {
      var errorDir = path.join(dest, 'i18n', 'error')

      if (!fs.existsSync(errorDir)) {
        log.warn('merge', 'i18n/error 目录不存在')
      }

      var data = {}

      fs.readdirSync(errorDir).forEach(function(dir) {
        var modDir = path.join(errorDir, dir)
        if (fs.statSync(modDir).isDirectory()) {
          var dataFile = path.join(modDir, lang + '.json')
          if (fs.existsSync(dataFile)) {
            var langData = require(dataFile)
            Object.keys(langData).forEach(function(key) {
              data[key] = langData[key]
            })
          }
        }
      })

      data = JSON.stringify(data, null, 2)

      if (lang === 'zh-CN') {
        mkdir(['msg'])
        fs.writeFileSync(path.join(dest, 'msg', 'error.json'), data)
        log.info('create', '  - msg/error.json' + display)
      } else {
        mkdir(['tmp', lang, 'msg'])
        fs.writeFileSync(path.join(dest, 'tmp', lang, 'msg', 'error.json'), data)
        log.info('create', '  - ' + lang + '/msg/error.json' + display)
      }

      done()
    }

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
      // error file
      queue.use(function(done) {
        merge(lang, done, ' 错误信息文件')
      })

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
