(function(window, seajs, document) {

  'use strict';

  // <%= appname %>@<%= version %>

  if (!seajs) {
    return;
  }

  // 支持的语言
  var i18n = <%= i18n %>;
  // 默认语言
  var lang = <%= lang %>;

  // 如果没找到对应的
  if (i18n.indexOf(lang) === -1) {
    // 找相似的，比如：en-GB -> en-US
    lang = lang.split('-')[0];

    if (!i18n.some(function(item) {
      if (item.split('-')[0] === lang) {
        // 找到
        lang = item;
        return true;
      }
    })) {
      // 没找到，选第一个
      lang = i18n[0];
    }
  }

  // debug 开关
  var debug = (function(localStorage) {
    var key = 'SEAJS-DEBUG';
    var search = window.location.search;

    // 关闭 debug
    if (search.indexOf('no-debug') > 0) {
      localStorage.removeItem(key);
      return false;
    }

    var debug = search.indexOf('debug') > 0;

    // 修改 localStorage
    if (debug) {
      localStorage.setItem(key, '1');
    } else {
      debug = localStorage.getItem(key) !== null;
    }

    return debug;
  }(window.localStorage));

  // 映射表
  var map = [];

  // 保存 id 与真实地址映射
  var idsMap = {};

  if (debug) {
    document.title = '[D] ' + document.title;
    // debug 模式
    (function(plugins){
      if (!plugins || !plugins.length) {
        return;
      }

      var seajsUse = seajs.use;
      var useQueue = [];

      // 暂存 use 信息
      seajs.use = function() {
        useQueue.push(arguments);
      };

      function boot() {
        var args;

        while ((args = useQueue.shift())) {
          seajsUse.apply(null, args);
        }

        // 完璧归赵
        seajs.use = seajsUse;
      }

      var i = 0;
      var n = plugins.length;
      var head = document.head || document.getElementsByTagName('HEAD')[0] || document.documentElement;

      function addScript(url, next) {
        var script = document.createElement('script');
        script.src = url;

        function onload() {
          script.onload = script.onerror = script.onreadystatechange = null;
          if (i < n) {
            next();
          } else {
            boot();
          }
        }

        if ('onload' in script) {
          script.onload = script.onerror = onload;
        } else {
          script.onreadystatechange = function() {
            if (/loaded|complete/.test(script.readyState)) {
              onload();
            }
          };
        }

        head.appendChild(script);
      }

      // 确保加载顺序
      (function loop() {
        addScript(plugins[i++], loop);
      })();
    })(<%= plugins %>);
  } else {
    map.push(function(url) {
      return url.replace(/\/(?:app\/|index.js)/, function(all) {
        return '/dist/' + lang + all;
      });
    });
  }

  seajs.config({
    base: '<%= base %>',
    alias: {
      <%= alias %>
    },
    map: map,
    debug: debug
  });

  if (!debug) {

    seajs.on('request', function(a) {
      if (a.uri in idsMap) {
        a.requestUri = idsMap[a.uri];
      }
    });

    // 处理 md5 串
    (function(md5Map) {
      var uri;

      Object.keys(md5Map).forEach(function(id) {
        uri = seajs.resolve(id);
        idsMap[uri] = uri + '?' + md5Map[id][lang];
      });

      md5Map = null;
    })({
      <%= md5Map %>
    });
  }

})(this, this.seajs, this.document);
