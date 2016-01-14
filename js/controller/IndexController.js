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
            }
        });
    }
);