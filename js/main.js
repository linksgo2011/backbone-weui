(function() {
    'use strict';

    var root = this;
    var require = root.require;
    var config = window.config || {};
    var waitSeconds = (config.environment === "prod") ? 2000 : 30;
    var fileExtension = (config.environment === "prod") ? ".js" : ".jsx";

    require.config({
        paths: {
            'domReady': 'lib/require/plugins/domReady-2.0.1',
            'text': 'lib/require/plugins/text-2.0.3',
            'jsx': 'lib/require/plugins/jsx',
            'jquery': 'lib/jquery/jquery-2.1.4',
            'underscore': 'lib/underscore/underscore-1.4.2',
            'backbone': 'lib/backbone/backbone-0.9.2',
            'jquery.log': 'lib/jquery/plugins/jquery.log-0.1.0',
            "react": "lib/react/react",
            "JSXTransformer": "lib/react/JSXTransformer"
        },
      jsx: {
        fileExtension: fileExtension,
        harmony: true,
        stripTypes: true
      },
        waitSeconds:  2000, //2000 seconds for prod mode on bootstrap and 2 seconds for dev mode
        shim: {
            underscore: {
                exports: '_'
            },
            'jquery.log': {
                deps: [
                    'jquery'
                ],
                exports: 'jQuery.log'
            },
            backbone: {
                deps: [
                    'underscore',
                    'jquery'
                ],
                exports: 'Backbone'
            }
        }
    });

    var updateModuleProgress = function(context, map, depMaps) {
        var console = root.console;
        if (console && console.log) {
            console.log('loading: ' + map.name + ' at ' + map.url);
        }
    };

    require.onResourceLoad = function(context, map, depMaps) {
        updateModuleProgress(context, map, depMaps);
    };

    require(['domReady'], function(domReady) {
        domReady(function() {
            if (config.environment === "prod") {
                updateModuleProgress = function(context, map, depMaps) {
                    // TODO 如果是生产环境，可以显示加载进度
                };
            }
        });
    });

    require(
        [
            'jquery',
            'jquery.log',
            'backbone',
            'utils',
            'app'
        ],
        function($) {

            if (config.environment === "prod") {
                $.log.setLevel($.log.LEVEL.INFO);
            }
        }
    );
}).call(this);