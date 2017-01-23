'use strict';

const vm = require('vm');


function bindLiteral(literal, context) {
    let scope = vm.createContext(context);
    return new vm.Script('`'+literal+'`').runInContext(scope);
};

class Step {

    constructor(args) {
        this.defenition = (!!args.defenition) ? args.defenition : '';
        this.scope = (!!args.scope) ? args.scope : {};
    }

    render(scope) {
        return bindLiteral(this.defenition, (!!scope) ? Object.assign(this.scope, scope) : this.scope);
    }

};

class Group {

    constructor(args) {
        this.steps = (!!args) ? args : [];
        this.text = this.steps.map((element) => element.step.render(element.scope)).join('\n');
    }

}

class Syntax {

    constructor() {
        this.steps = {};
        this.groups = {};

        this.stepQuery = [];
        this.groupQuery = [];
    }

    step(name, options) {
        this.stepQuery.push({
            name: name,
            options: options
        });
        return this;
    }

    group(name, options) {
      this.groupQuery.push({
          name: name,
          options: options
      });
      return this;
    }

    registerStep(name,options) {
        if (false === !!this.steps[name]) this.steps[name] = new Step(options);
        else throw 'step already defined!';
    }

    registerGroup(name, options) {
        if (false === !!this.groups[name]) this.groups[name] = new Group(options);
    }

    build(callback) {
        process.nextTick(() => {
            this.stepQuery.forEach((step) => {
                this.registerStep(step.name, step.options);
            });
            this.groupQuery.forEach((group) => {
                this.registerGroup(group.name, group.options.map((step) => {
                    return {
                        step: this.steps[step.name],
                        scope: step.scope
                    };
                }));
            });
            callback(this);
        });
    }

};



let syntax = new Syntax();

syntax.build(function(stx) {
    console.log(stx.groups.test.text);
});

syntax.step('button', {
        defenition: 'Я нажимаю на кнопку ${name}${val(text)}',
        scope: {
            name: 'создания',
            text: undefined,
            val: (v) => (!!v) ? (' "'+v+'"') : ''
        }
    })
    .step('field' ,{
        defenition: 'Я выбираю в выпадающем списке${tree(type)}${gen(generated)} "${name}"${val(value)}',
        scope: {
            name: 'КПГЗ',
            tree: (t) => (t) ? ' с деревом' : '',
            gen: (g) => (g) ? ' сгенерированный' : '',
            val: (v) => (!!v) ? (' "'+v+'"') : ''
        }
    })

    .group('test', [
        {
            name: 'button',
            scope: {
                name: 'с текстом',
                text: 'тест'
            }
        },
        {
            name: 'field',
            scope: {
                name: 'код СПГЗ',
                type: false,
                generated: true,
                value: '01'
            }
        }
    ])
