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
        var isBooted = false;

        function renderEnd($inpage, $outpage) {
            $outpage && $outpage.remove();

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
                Backbone.history.isBack = true;
            }, this));

            this.controller.on("actionFinish", function(event) {
                Backbone.history.isBack = false;
            });
        }

        /**
         * 动画控制组件
         * @type {Object}
         */
        var transitions = {
            isAnimating: false,
            $curPage: "index-page", //存储当前页面的id
            $nextPage: "", //存储下一页的id
            back: function(curpage, nextpage, fn) {
                transitions.$curPage = $curpage;
                transitions.$nextPage = $nextpage;
                transitions.animation(10, fn);
            },
            next: function(curpage, nextpage, fn) {
                transitions.$curPage = $curpage;
                transitions.$nextPage = $nextpage;
                transitions.animation(9, fn);
            },
            skip: function(curpage, nextpage, fn) {
                transitions.$curPage = $curpage;
                transitions.$nextPage = $nextpage;
                transitions.resetPage($(".page"), $("#" + nextpage));
                if (fn) {
                    fn.call();
                }
            },
            animation: function(animation, fn) {
                var that = this;
                if (transitions.isAnimating) {
                    return false;
                }
                this.isAnimating = true;
                this.$nextPage.addClass('page-current');
                var aniClass = transitions.get_aniClass(animation); //获取过渡效果
                var outClass = aniClass.outClass; //设置过渡效果
                var inClass = aniClass.inClass; //设置过渡效果
                animEndEventName = "animationend";
                this.$currPage.addClass(outClass)
                // $currPage.addClass(outClass).on(animEndEventName, function() {
                //     $currPage.off(animEndEventName);
                //     transitions.endCurrPage = true;
                //     if (transitions.endNextPage) {
                //         transitions.onEndAnimation($currPage, $nextPage, fn);
                //     }
                // });
                this.$nextPage.addClass(inClass).on(animEndEventName, function() {
                    this.isAnimating = false;
                    $nextPage.off(animEndEventName).removeClass(inClass);
                    if (typeof fn === "function") {
                        fn();
                    }
                    //transitions.onEndAnimation(that.$currPage, that.$nextPage, fn);
                    // if (transitions.endCurrPage) {
                    // transitions.onEndAnimation($currPage, $nextPage, fn);
                    // }
                });
            },
            get_aniClass: function(animation) {
                var outClass = '',
                    inClass = '';
                switch (animation) {
                    case 9:
                        outClass = 'pt-page-moveToLeftFade';
                        inClass = 'pt-page-moveFromRightFade';
                        break;
                    case 10:
                        outClass = 'pt-page-moveToRightFade';
                        inClass = 'pt-page-moveFromLeftFade';
                        break;
                }
                var ret = {
                    outClass: outClass,
                    inClass: inClass
                };
                return ret;
            }
        };

        return Backbone.View.extend({
            $preEl: null,

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
                    this.$preEl = this.$el;
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

                transitions[transMethon](this.$preEl, this.$el, _.bind(renderEnd, this));
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