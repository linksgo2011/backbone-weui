
/**
 * The index controller for displaying on the index home page.
 */
define(
    [
        'jquery',
        'underscore',
        'backbone',
        'controller/MobileController',
        'view/BaseMobileView',
        'text!../template/IndexTemplate.html'
    ],
    function($, _, Backbone, MobileController, BaseMobileView, indexTpl) {

        return MobileController.extend({

            initialize: function() {
                this.indexView = new BaseMobileView({
                    $container: $('body'),
                    appendable: true,
                    controller: this,
                    textTemplate:indexTpl
                });
            },
            
            index: function() {
                this.indexView.render({});
            }
        });
    }
);