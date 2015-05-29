'use strict';

var fs = require('fs')
var path = require('path')

var deps = require('dong-deps')
var log = require('spm-log')
var template = require('gulp-template')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function(options, next) {
    var model = {
      appname: options.pkg.name,
      version: options.pkg.version,
      lang: options.i18n ? 'navigator.language || \'' + options.i18n[0] + '\'' : 'false'
    }

    // root 到工作目录的距离
    var prefix = path.relative(options.root, process.cwd()).replace(/\\/g, '/')

    if (prefix) {
      prefix = '/' + prefix
    }

    var dependencies = deps({
      scope: 'spm/dependencies',
      prefix: prefix
    })

    var devDependencies = deps({
      scope: 'spm/devDependencies',
      prefix: prefix
    })

    model.base = (function() {
      return prefix.replace('/' + model.appname, '')
    })()

    model.alias = (function() {
      var map = [],
        keys = []
      var data = dependencies.all(),
        n
      var dep = dependencies.get()

      for (n in dep) {
        keys.push(n)
        map.push('\'' + n + '\': \'' + dep[n] + '\'')
      }

      for (n in data) {
        if (n === dependencies.ROOT_KEY) {
          continue
        }

        dep = data[n]

        for (n in dep) {
          if (keys.indexOf(n) !== -1) {
            continue
          }

          keys.push(n)
          map.push('\'' + n + '\': \'' + dep[n] + '\'')
        }

      }

      return map.join(',\n      ')
    })()

    model.plugins = (function() {
      // 必须按指定顺序执行
      var plugins = ['seajs-text', 'seajs-wrap', 'seajs-style', 'seajs-debug']

      var str = []

      plugins.forEach(function(plugin) {
        plugin = devDependencies.get('', plugin)

        // 仅加载 devDependecies 中的 plugins
        if (plugin) {
          str.push('\'' + plugin + '?nowrap\'')
        }
      })

      return '[' + str.join(', ') + ']'
    })()

    model.md5Map = (function() {
      var md5Map = []

      function read(dest, recursively) {
        fs.readdirSync(dest).forEach(function(file) {
          var filePath = path.join(dest, file);
          var stats = fs.statSync(filePath)

          if (stats.isFile()) {
            if (/index.js$/.test(file)) {
              md5Map.push('\'/' + path.relative(options.root, filePath) + '\': \'\'')
            }
          } else if (recursively && stats.isDirectory()) {
            read(path.join(dest, file), recursively)
          }
        })
      }

      // /index.js
      read(process.cwd(), false)
        // /app/**/index.js
      read(path.join(process.cwd(), 'app'), true)

      return md5Map.join(',\n      ').replace(/\\/g, '/')
    })()

    vfs.src(path.join(__dirname, '../../tpl/sea/**'), {
        dot: true
      })
      .pipe(template(model))
      .pipe(vfs.dest('.'))
      .on('end', function() {
        log.info('seajs', '已生成 lib/** 配置文件')

        next()
      })
  }
}
