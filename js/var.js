$.jqKvisVariables = function ($selector) {
    var self = this;

    self.variables = {};

    self.fors = [];

    self.selector = $selector;

    self.resolveVarForElement = function (elem, name) {
        var variables = $(elem).var('get');
        
        var nameParts = name.split('.');

        var curval = variables.variables;

        for (var i = 0; i < nameParts.length; i++) {
            curval = curval[nameParts[i]];
            if (curval === undefined) {
                return '';
            }
        }
        
        return curval;
    };

    self.reFor = function () {
        for (var i = 0; i < self.fors.length; i++) {
            var fordata = self.fors[i];

            $('[data-for-id="' + fordata.id + '"]').remove();

            var resolvedVal = $(fordata.elem).var('get')

            var toIterate = resolvedVal.variables[fordata['var']];
            try {
                if (Array.isArray(toIterate)) {
                    for (var i = 0; i < toIterate.length; i++) {
                        var data = toIterate[i];
                        var insdata = fordata.html.clone();
                        var vars = $(insdata).var();
                        vars[fordata.subVar] = data;

                        insdata.attr('data-for-id', fordata.id);

                        switch (fordata.append) {
                            case 'before':
                                $(fordata.elem).before(insdata);
                                break;
                            case 'after':
                                $(fordata.elem).after(insdata);
                                break;
                            default:
                                $(fordata.elem).append(insdata);
                                break;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    };

    self.renderVars = function () {
        self.selector.find('var').each(function (k, v) {
            var varName;

            if ($(this).attr('data-var')) {
                varName = $(this).attr('data-var');
            } else {
                varName = $(this).text();
                $(this).attr('data-var', varName);
            }

            var varVal = self.resolveVarForElement($(this), varName);
            if (varVal === undefined) {
                varVal = '';
            }

            $(this).text(varVal);

        });

        self.selector.find('[data-var]:not(:focus)').each(function (k, v) {
            var varName = $(this).data('var');
            if ($(this).data('function') == 'text') {
                $(this).text(self.resolveVarForElement($(this), varName));
            } else if ($(this).data('function') == 'html') {
                $(this).html(self.resolveVarForElement($(this), varName));
            } else {
                $(this).val(self.resolveVarForElement($(this), varName));
            }
        });

        self.selector.find('[data-for]').each(function (k, v) {
            var varName = $(this).data('for').split(' in ')[1].trim();
            var subVar = $(this).data('for').split(' in ')[0].trim();

            var prev = $(this).prev();
            var next = $(this).next();

            var for_ = {};

            if (prev.length) {
                for_ = {type: 'after', elem: prev};
            } else if (next.length) {
                for_ = {type: 'before', elem: next};
            } else {
                for_ = {append: 'append', elem: $(this).parent()};
            }

            for_['html'] = $(this).attr('data-for', null).clone();
            for_['id'] = 'for-id-' + Math.random();
            for_['var'] = varName;
            for_['subVar'] = subVar;

            $(this).val(self.resolveVarForElement($(this), varName));

            $(this).remove();

            self.fors.push(for_);
        });

        self.reFor();
    };

    self.proxy = new Proxy(self.variables, {
        get: function (target, name, receiver) {
            var rv = target[name];
            self.renderVars();
            return rv;
        },
        set: function (target, property, value, receiver) {
            target[property] = value;
            self.renderVars();
        }
    });

    $(document).on('change keyup', '[data-var]', function () {
        var vars = $(this).var('get');
        var varName = $(this).data('var');
        if (!vars) {
            return;
        }
        vars.proxy[varName] = $(this).val();
    });

}

$.fn.var = function (action) {
    action = action || 'create';

    if (action === 'create') {
        var datavars = $(this).data('__var_o');

        if (!datavars) {
            datavars = new $.jqKvisVariables($(this));
            $(this).data('__var_o', datavars);
        }
        return datavars.proxy;

    } else if (action === 'get') {
        var elem = $(this);

        while (true) {
            var o = $(elem).data('__var_o');
            if (o) {
                return o;
            }
            if (elem.is(document)) {
                return;
            } else {
                elem = elem.parent();
            }
        }

    }

};


