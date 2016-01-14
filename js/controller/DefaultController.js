/**
 * 如果没有控制匹配使用默认控制器
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/Controller',
        'view/DefaultView'
    ],
    function($, _, Backbone, Controller, DefaultView) {
        return Controller.extend({
            initialize: function() {
                this.defaultView = new DefaultView({
                    $container: $('body'),
                    appendable: true,
                    controller: this,
                });
            },
            index: function(params) {
                this.defaultView.render();
            }
        });

    }
);