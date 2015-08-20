/*
 * dong-build
 * https://github.com/crossjs/dong-build
 *
 * Copyright (c) 2015 crossjs
 * Licensed under the MIT license.
 */

'use strict';

module.exports = {
  command: 'build',
  description: '静态文件构建，包括资源哈希值生成',
  options: [{
    name: 'root',
    alias: 'r',
    description: 'Web 根目录',
    defaults: '.'
  }, {
    name: 'views',
    alias: 'v',
    description: '视图文件',
    defaults: '*.html'
  }, {
    name: 'templates',
    alias: 't',
    description: '需要进行变量替换的文件',
    defaults: ''
  }, {
    name: 'i18n',
    alias: 'i',
    description: '需要构建的语言版本',
    defaults: ''
  }, {
    name: 'force',
    alias: 'f',
    description: '先清空输出目录',
    defaults: false
  }, {
    name: 'debug',
    alias: 'd',
    description: '仅生成 `seajs, config.js`',
    defaults: false
  }],
  bootstrap: require('./lib/build'),
  help: function(chalk) {
    console.log('  Examples:')
    console.log('')
    console.log(chalk.gray('    $ ') +
                chalk.magenta('dong build spa') +
                chalk.gray(' ....... Single Page Application'))
    console.log(chalk.gray('    $ ') +
                chalk.magenta('dong build web') +
                chalk.gray(' ....... General Web Project'))
    console.log('')
  },
  strict: true
}
