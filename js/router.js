/**
 * The application router
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/IndexController',
        'controller/DefaultController'
    ],
    function($, _, Backbone, IndexController, DefaultController) {

        var indexController,
            defaultController;

        /**
         * Holds controller instance for caching purpose.
         *
         * @type {Object}
         */
        var cachedControllers = {

        };

        /**
         * Holds previous and current controller instance for detecting back/forward button
         */
        var navigationStack = [];

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
            
            defaultController:"Index",

            /**
             *  路由映射
             * For example: 'user' : 'User' => router will try to find module under: controller/UserController.
             */
            controllers: {

            },

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
            beforeReqest:function(){

            },

            /**
             * 路由跳转
             * @param  {string} urlController 
             * @param  {string} options       
             */
            redirect: function(urlController, options) {
                if (!urlController) {
                    $.warn('Router#dispatch: not valid urlController', urlController);
                    return;
                }
                options = options || {};
                var fragment = _getRouteFragment.call(this, urlController, options.action, options.params);
                this.navigate(fragment, options);
            },

            routes: {
                // ':controller': 'dispatchController',
                // ':controller/:action': 'dispatchController',
                // ':controller/:action/*params': 'dispatchController',
                // '*actions': 'dispatchController'
                '*params': 'dispatchController'
            },

            initialize: function(options) {
                this.options = options || {};

                /**
                 * 初始化预加载部分控制器
                 */
                var self = this;
                require(this.preLoadControllers,
                    function() {
                        $.each(arguments,function(index,Controller) {
                            var controllerName = self.preLoadControllers[index].split("/").pop();
                            var controllerInstance = new Controller({
                                name: controllerName,
                                router: self
                            });
                            cachedControllers[controllerName] = controllerInstance;
                            $.log(controllerName+" preload",controllerName);
                        });
                    },
                    function(err) {
                        $.warn('AppRouter#dispatchController: Error for loading controller: ' + controller, err);
                    }
                );
            },

            dispatchController: function(paramString) {
                var urlParsed = paramString.split("/"),
                    controller = urlParsed[0],
                    action = urlParsed[1],
                    params = urlParsed.splice(2);

                var controllerName = this.controllers[controller];

                if (!controllerName) {
                    controllerName = controller;
                }
                if(!controllerName){
                    controllerName = this.defaultController || "Index";
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
                        }
                    );

                }

                function processController(controllerInstance) {
                    addToNavigationStack.call(this, controllerInstance);

                    controllerInstance.trigger('actionStart');

                    if(!action){
                        action = controllerInstance.defaultAction || "index";
                    }

                    var methodAction = controllerInstance.actions[action];
                    if (methodAction && $.isFunction(controllerInstance[methodAction])) {
                        controllerInstance[methodAction].apply(controllerInstance,params);
                    } else if ($.isFunction(methodAction)) {
                        methodAction.apply(controllerInstance, params);
                    } else if ($.isFunction(controllerInstance[action])) {
                        controllerInstance[action].apply(controllerInstance,params);
                    } else {
                        controllerInstance.index.apply(controllerInstance,params);
                    }
                    controllerInstance.trigger('actionFinish');
                }
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

    });