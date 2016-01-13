/**
 * app 配置 & 启动
 */
define(
    [
        'underscore',
        'backbone',
        'router'
    ],
    function(_, Backbone, Router) {

        var AppRouter = Router.extend({

            /**
             * 控制器预加载
             */
            preLoadControllers: [
                'controller/PreloadController'
            ]
        });

        var appRouter = new AppRouter({
            //options here
        });
        appRouter.start();
    }
);