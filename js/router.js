/**
 * The application router
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/DefaultController'
    ],
    function($, _, Backbone, DefaultController) {

        var defaultController;

        /**
         * 缓存控制器
         * @type {Object}
         */
        var cachedControllers = {};

        var navigationStack = [];

        var urlStack = [];

        // TODO controllerFlow 和 addToNavigationStack 需要视情况优化
        function addToNavigationStack(controllerInstance) {
            if (navigationStack.length < (this.options.maxNavigationStackLength || 10)) {
                navigationStack.push(controllerInstance);
            } else {
                navigationStack.shift(controllerInstance);
                navigationStack.push(controllerInstance);
            }

            if (navigationStack.length > 1) {
                //set isBackNavigated
                var controllerName = controllerInstance.name,
                    controllerFlowInfo = this.findControllerFlowInfo(controllerName);

                $.debug('router::addNavigationStack | controllerFlowInfo', controllerFlowInfo);

                var previousNavigationStackName = navigationStack[navigationStack.length - 2].name;

                if (controllerFlowInfo.previous.name === previousNavigationStackName) {
                    $.debug('router::addNavigationStack | controllerFlowInfo.previous.name matched', controllerFlowInfo.previous);
                    controllerInstance.isBackNavigated = false;
                } else {
                    controllerInstance.isBackNavigated = true;
                }
            }
        }

        return Backbone.Router.extend({
            /**
             * 默认控制器
             */
            defaultController: "Index",

            /**
             *  路由映射
             * For example: 'user' : 'User' => router will try to find module under: controller/UserController.
             */
            controllers: {},

            /**
             * 预加载控制器数组
             * @type {Array}
             */
            preLoadControllers: [],


            controllerFlow: {
                name: 'IndexController'
            },

            findControllerFlowInfo: function(controllerName) {

                var previousElement = {},
                    foundElement = {};

                function searchTree(element, matchingName) {
                    if (element.name === matchingName) {
                        foundElement = element;
                    } else if (element.children) {
                        var result;
                        for (var i = 0, len = element.children.length; i < len; i++) {
                            previousElement = element;
                            result = searchTree(element.children[i], matchingName);
                            if (result.found.name) {
                                break;
                            }
                        }
                        return result;
                    }

                    return {
                        'previous': previousElement,
                        'found': foundElement
                    };
                }

                return searchTree(this.controllerFlow, controllerName);
            },

            /**
             * 动态设置url 映射
             * @param {string} urlController  url名称
             * @param {string} controllerName 控制器名称
             */
            setController: function(urlController, controllerName) {
                if (this.controllers[urlController]) {
                    $.warn('Router#setController: override ' + this.controllers[urlController]);
                }
                this.controllers[urlController] = controllerName;
            },

            /**
             * 请求页面前做的事情
             */
            beforeReqest: function() {

            },

            /**
             * 路由跳转
             * @param  {string} urlController 
             * @param  {string} options       
             */
            dispatch: function(urlController, options) {
                if (!urlController) {
                    $.warn('Router#dispatch: not valid urlController', urlController);
                    return;
                }
                options = options || {};
                var fragment = _getRouteFragment.call(this, urlController, options.action, options.params);
                this.navigate(fragment, options);
            },

            routes: {
                '*params': 'dispatchController'
            },

            initialize: function(options) {
                this.options = options || {};

                /**
                 * 预加载控制器
                 */
                var self = this;
                require(this.preLoadControllers,
                    function() {
                        $.each(arguments, function(index, Controller) {
                            var controllerName = self.preLoadControllers[index].split("/").pop();
                            var controllerInstance = new Controller({
                                name: controllerName,
                                router: self
                            });
                            cachedControllers[controllerName] = controllerInstance;
                            $.log(controllerName + " preload", controllerName);
                        });
                    },
                    function(err) {
                        $.warn('AppRouter#dispatchController: Error for loading preLoadControllers: ', err);
                    }
                );
            },

            dispatchController: function(paramString) {
                if (urlStack.length < (this.options.maxNavigationStackLength || 10)) {
                    urlStack.push(paramString);
                } else {
                    urlStack.shift(paramString);
                    urlStack.push(paramString);
                }
                
                if(paramString == urlStack[urlStack.length-3]){
                    Backbone.history.isBack  = true;
                }

                var urlParsed = paramString.split("/"),
                    controller = urlParsed[0],
                    action = urlParsed[1],
                    params = urlParsed.splice(2);

                var controllerName = this.controllers[controller];

                if (!controllerName) {
                    controllerName = controller;
                }
                if (!controllerName) {
                    controllerName = this.defaultController || "Default";
                }

                controllerName += 'Controller';
                var self = this;

                /**
                 * 控制器缓存
                 */
                var cachedControllerInstance = cachedControllers[controllerName];

                if (cachedControllerInstance) {

                    processController.call(this, cachedControllerInstance);

                } else {
                    this.beforeReqest();

                    require(
                        [
                            'controller/' + controllerName
                        ],
                        function(Controller) {
                            var controllerInstance = new Controller({
                                name: controllerName,
                                router: self
                            });
                            cachedControllers[controllerName] = controllerInstance;

                            processController.call(self, controllerInstance);
                        },
                        function(err) {
                            $.warn('AppRouter#dispatchController: Error for loading controller: ' + controllerName, err);
                            self.ErrorController(_getRouteFragment.call(self, controller, action, params));
                        }
                    );

                }

                function processController(controllerInstance) {
                    addToNavigationStack.call(this, controllerInstance);

                    controllerInstance.trigger('actionStart');
                    if (!action) {
                        action = controllerInstance.defaultAction || "index";
                    }
                    if ($.isFunction(controllerInstance[action])) {
                        controllerInstance[action].apply(controllerInstance, params);
                    }
                    controllerInstance.trigger('actionFinish');
                }
            },

            /**
             * 错误处理
             */
            ErrorController: function(params) {
                if (!defaultController) {
                    defaultController = new DefaultController({
                        name: 'DefaultController',
                        router: this
                    });
                }
                addToNavigationStack.call(this, defaultController);
                defaultController.trigger('actionStart');
                defaultController.index(params);
                defaultController.trigger('actionFinish');
            },

            getNavigationRouteStack: function() {
                return navigationStack;
            },

            start: function() {
                Backbone.history.start();
            }
        });

        function _getRouteFragment(controller, action, params) {
            var routeFragment = controller;
            if (action) {
                routeFragment += '/' + action;
            }
            if (params) {
                routeFragment += '/' + params;
            }
            return routeFragment;
        }

    }
);