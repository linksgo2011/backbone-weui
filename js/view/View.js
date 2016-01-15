/**
 * View 层的基类
 */
define(
    [
        'jquery',
        'underscore',
        'backbone'
    ],
    function($, _, Backbone) {
        var $preEl = null;

        var isBooted = false;

        function renderEnd($outpage, $inpage) {
            if ($outpage) {
                $outpage.remove();
            }
                
            // 保留本次渲染副本
            $preEl = $inpage;
            this.delegateEvents();
            this.afterRender();
            this.rendered = true;
        }

        function attachRouterToLinks() {

            this.$('a:not([href^="http"])').off('click').on('click', $.proxy(function(e) {
                var link = $(e.currentTarget).attr('href');
                if (link.indexOf('#') === 0) {
                    return;
                }
                //if the link start with hash '#' => ignore
                e.preventDefault();
                this.controller.router.dispatch(link, {
                    trigger: true
                });

            }, this));

            this.$('[data-role="back"]').off('click').on('click', $.proxy(function(e) {
                window.history.back();
            }, this));
        }

        /**
         * 动画控制组件
         * @type {Object}
         */
        var transitions = {
            isAnimating: false,
            $curPage: null,
            $nextPage: null,
            // 动画 class 集合,这样可以拓展
            aniClass: {
                9: {
                    outClass: 'pt-page-moveToLeftFade',
                    inClass: 'pt-page-moveFromRightFade'
                },
                10: {
                    outClass: 'pt-page-moveToRightFade',
                    inClass: 'pt-page-moveFromLeftFade'
                }
            },
            init: function($curpage, $nextpage) {
                this.$curPage = $curpage;
                this.$nextPage = $nextpage;
            },
            back: function($curpage, $nextpage, fn) {
                this.init.apply(this, arguments);
                this.animation(10, fn);
            },
            next: function($curpage, $nextpage, fn) {
                this.init.apply(this, arguments);
                this.animation(9, fn);
            },
            skip: function($curpage, $nextpage, fn) {
                this.init.apply(this, arguments);
                this.$nextPage.addClass('page-current');
                if (fn) {
                    fn($curpage, $nextpage);
                }
            },
            animation: function(animation, fn) {
                var that = this;
                if (this.isAnimating) {
                    return false;
                }
                this.isAnimating = true;
                this.$nextPage.addClass('page-current');

                var aniClass = this.get_aniClass(animation);
                var outClass = aniClass.outClass;
                var inClass = aniClass.inClass;
                var animEndEventName = "animationend";

                if (this.$curPage) {
                    this.$curPage.addClass(outClass);
                }
                this.$nextPage.addClass(inClass).on(animEndEventName, function() {
                    that.isAnimating = false;
                    that.$nextPage.off(animEndEventName).removeClass(inClass);
                    if (typeof fn === "function") {
                        fn(that.$curPage, that.$nextPage);
                    }
                });
            },
            get_aniClass: function(animation) {
                var ret = this.aniClass[animation];
                if (!ret) {
                    ret = {
                        outClass: '',
                        inClass: ''
                    };
                }
                return ret;
            }
        };

        return Backbone.View.extend({

            beforeInitialize: function(options) {
                return this;
            },

            initialize: function(options) {

                this.options = options || {};

                this.controller = this.options.controller;

                //indicates if the view is rendered or not
                this.rendered = false;

                this.beforeInitialize.apply(this, arguments);

                this.$container = this.$container || options.$container;
                this.model = this.model || options.model || new Backbone.Model();
                this.appendable = this.appendable || options.appendable;

                // 使用 underscore
                this.textTemplate = this.textTemplate || options.textTemplate || "";
                if (this.textTemplate && !this.template) {
                    this.template = _.template(this.textTemplate);
                }

                this.afterInitialize.apply(this, arguments);
            },

            afterInitialize: function(options) {
                return this;
            },

            beforeRender: function() {
                return this;
            },

            container: function() {
                return _.isString(this.$container) ? this.$(this.$container) : this.$container;
            },

            render: function() {
                this.beforeRender();
                if (this.$el) {
                    this.destroy();
                }
                if (this.template) {
                    this.setElement(this.template(this.model));
                }
                if (_.isNull(this.$container) || _.isNull(this.el)) {
                    $.log('this.$container or this.el is null, invalid state');
                    return false;
                }

                var c = this.container();
                c.append(this.$el);

                // 绑定view全局事件
                attachRouterToLinks.call(this);

                var transMethon = "next";
                if (!isBooted) {
                    $('#app-boot').hide();
                    isBooted = true;
                    transMethon = "skip";
                }
                if (Backbone.history.isBack) {
                    transMethon = "back";
                }

                transitions[transMethon]($preEl, this.$el, _.bind(renderEnd, this));
                return this;
            },

            /**
             * 渲染过后
             * @return {*}
             */
            afterRender: function() {
                return this;
            },

            update: function(model) {
                this.model = model;
                this.destroy();
                this.initialize();
                this.render();
            },

            /**
             * 销毁视图，需要注意是否有事件没有释放
             */
            destroy: function() {
                this.$el.remove();
            }
        });
    }
);