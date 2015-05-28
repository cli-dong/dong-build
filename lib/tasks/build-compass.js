'use strict';

var fs = require('fs')
var path = require('path')

var log = require('spm-log')
var compass = require('gulp-compass')
var vfs = require('vinyl-fs')

module.exports = function(options, next) {
  var config = {
    'config_file': './config.rb',
    style: 'compressed',
    sourcemap: true
  }

  fs.readFileSync(path.join(process.cwd(), 'config.rb'))
    .toString().match(/\b.+? = ".*?"/g)
    .forEach(function(value) {
      value = value.split(' = ')

      if (value[0].indexOf('_dir') !== -1) {
        config[value[0].replace(/_dir$/, '')] = value[1].slice(1, -1)
      }
    })

  vfs.src([config.sass + '/**/*.scss'], {
      dot: true
    })
    .pipe(compass(config))
    .pipe(vfs.dest(config.css))
    .on('end', function() {
      log.info('compass', '已生成 css 文件')

      next()
    })

}
