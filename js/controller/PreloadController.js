/**
 * 预加载控制器
 * @author ln 
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/Controller',
        'view/View',
        'text!../template/Preload/index.html'
    ],
    function($, _, Backbone, Controller, View, index) {
        return Controller.extend({
            // 批量初始化
            initialize: function() {
                var views = {
                    indexView: index
                };
                $.each(views, $.proxy(function(key,tpl){
                    this[key] = new View({
                        $container: $('body'),
                        appendable: true,
                        controller: this,
                        textTemplate: tpl
                    });
                },this));
            },
            index: function() {
                this.indexView.render({});
            }
        });
    }
);