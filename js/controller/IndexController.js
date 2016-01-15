/**
 * 首页控制器
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/Controller',
        'view/View',
        'text!../template/IndexTemplate.html'
    ],
    function($, _, Backbone, Controller, View, indexTpl) {

        return Controller.extend({

            initialize: function() {
                this.indexView = new View({
                    $container: $('body'),
                    appendable: true,
                    controller: this,
                    textTemplate: indexTpl
                });
            },

            index: function() {
                this.indexView.render({});
            },
            react:function(){
                var that = this;
                    require(['react', 'jsx!../js/jsx/Timer',"view/ReactView"], function(React, Timer,ReactView) {
                      Timer = React.createFactory(Timer);
                        that.indexView = new ReactView({
                            $container: $('body'),
                            appendable: true,
                            controller: that,
                            jsx: Timer
                        });
                        that.indexView.render();
                    });
            }
        });
    }
);