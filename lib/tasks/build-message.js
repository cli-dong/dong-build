'use strict';

var fs = require('fs')
var path = require('path')

var Queue = require('dong-queue')
var log = require('spm-log')

module.exports = function() {
  return function(type, options, next) {
    var dest = path.join(process.cwd(), options.root)

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
        log.warn('message', 'i18n/error 目录不存在')
        return done()
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

    var queue = new Queue()

    ;(options.i18n || ['zh-CN']).forEach(function(lang) {
      // error file
      queue.use(function(done) {
        merge(lang, done, ' 错误信息文件')
      })
    })

    log.info('message', '开始错误信息处理：')

    queue.run(function() {
      log.info('message', '已完成错误信息处理')
      next()
    })
  }
}
