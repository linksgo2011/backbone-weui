/**
 * 如果没有控制匹配使用默认控制器
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/Controller',
        'view/View',
        'text!../template/DefaultTemplate.html'
    ],
    function($, _, Backbone, Controller, View,defaultTpl) {
        return Controller.extend({
            initialize: function() {
                this.defaultView = new View({
                    $container: $('body'),
                    appendable: true,
                    controller: this,
                    textTemplate: defaultTpl
                });
            },
            index: function(params) {
                this.defaultView.render();
            }
        });

    }
);