'use strict';

var path = require('path')

var Queue = require('dong-queue')
var template = require('gulp-template')
var log = require('spm-log')
var vfs = require('vinyl-fs')

module.exports = function() {
  return function flush(type, options, next) {
    var dest = path.join(process.cwd(), options.root)

    var queue = new Queue()

    queue.use(function(done) {
      // source files
      vfs.src([
            'package.json', 'index.*',
            'app/**/*', 'mod/**/*',
            'msg/**/*', 'spm_modules/**/*'
          ], {
          dot: false
        })
        .pipe(vfs.dest(function(file) {
          // saving in `tmp/_src`
          return ['.', 'tmp', '_src', path.relative(dest, file.base)].join(path.sep)
        }))
        .on('end', function() {
          log.info('filecopy', '已拷贝源代码到 tmp/_src 目录')

          done()
        })
    })

    queue.use(function(done) {
      if (!options.templates) {
        log.warn('replace', '没有需要进行变量替换的文件')

        return done()
      }

      // template files
      vfs.src(options.templates.split(/[,\s]+/)
        .map(function(item) {
          return path.join(dest, item.trim())
        }), {
          dot: false
        })
        .pipe(template({
          appname: options.pkg.name,
          version: options.pkg.version,
          description: options.pkg.description,
          author: options.pkg.author,
          timestamp: Date.now()
        }))
        .pipe(vfs.dest(function(file) {
          // saving in `tmp/_src`
          return ['.', 'tmp', '_src', path.relative(dest, file.base)].join(path.sep)
        }))
        .on('end', function() {
          log.info('replace', '已对指定文件进行变量替换')

          done()
        })
    })

    queue.run(function() {
      log.info('template', '已完成源代码处理')
      next()
    })
  }
}
