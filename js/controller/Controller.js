/**
 * 控制器基类
 */
define(
    [
        'jquery',
        'underscore',
        'backbone'
    ],
    function($, _, Backbone) {

        var Controller = function(options) {
            this.options = options || {};
            this.router = this.options.router;
            this.name = this.options.name;
            this.trigger('beforeInitialize', arguments);
            this.initialize.apply(this, arguments);
            this.trigger('afterInitialize', arguments);
        };
        
        Controller.extend = Backbone.Router.extend;

        _.extend(Controller.prototype, Backbone.Events, {
            initialize: function() {

            },

            //默认action
            index: function(params) {
                $.error('Controller#index is not overridden with params: ' + params);
            }

        });

        return Controller;
    }
);