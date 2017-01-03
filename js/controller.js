var __controllers = {};

function jqControllers() {
    var self = this;

    self.appendTemplate = function ($elem, t) {
        $elem.append(t);
    };

    self.initController = function ($elem, controllerObject) {
        self.appendTemplate($elem, controllerObject.template);
        controllerObject.vars = $elem.var('get').proxy;
        controllerObject.vars['this'] = controllerObject;
        controllerObject.init();
    };


    self.run = function ($elem, controllerName) {
        var nn = new __controllers[controllerName].code;

        if (!nn.template) {
            nn.beforeTemplateLoad();
            $.ajax({
                url: nn.templateUrl
            }).done(function (html) {
                nn.template = html;
                self.initController($elem, nn);
            });
        } else {
            self.initController($elem, nn);
        }
    };

    self.reinit = function () {
        $('controller').each(function (k, v) {
            var vars = $(this).var();

            if (!$(this).attr('data-controller')) {
                var controllerName = $(this).text();
                console.log('init', controllerName);
                $(this).attr('data-controller', controllerName);
                cObj.run($(this), controllerName);
            }

        });
    };
}

var cObj = new jqControllers();

$.controller = function (controllerName, callable) {
    __controllers[controllerName] = {
        code: callable
    };

    cObj.reinit();
};

