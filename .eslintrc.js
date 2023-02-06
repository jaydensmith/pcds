module.exports = {
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module',
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:import/errors',
    ],
    globals: {
        __static: true,
    },
    plugins: [
        'vue',
    ],
    rules: {
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'indent': ['warn', 4, { SwitchCase:  1 }],
        'linebreak-style': ['warn', 'unix'],
        'no-console': 0,
        'no-undef': 0,
        'no-unused-vars': 0,
        'quotes': ['error','single'],
        'quote-props': ['warn', 'consistent-as-needed'],
        'semi': ['warn','always'],
        'eol-last': 1,
        'comma-dangle': ['warn', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'ignore',
        }],
        'camelcase': ['warn', {
            properties: 'always',
        }],
        'object-curly-spacing': ['warn', 'always'],
        'space-before-function-paren': ['warn', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'never',
        }],
        'lines-between-class-members': ['warn', 'always', {
            exceptAfterSingleLine: false,
        }],

        // ES6 specific rules
        'prefer-arrow-callback': 'warn',
        'prefer-destructuring': ['warn', {
            array: true,
            object: true,
        }],
        'object-shorthand': ['warn', 'always'],

        // Vue specific rules
        'vue/script-indent': ['warn', 4, {
            baseIndent: 1,
            switchCase: 1,
        }],
        'vue/html-indent': ['warn', 4, {
            attribute: 1,
            baseIndent: 1,
            closeBracket: 0,
            alignAttributesVertically: true,
            ignores: [],
        }],
        'vue/max-attributes-per-line': ['warn', {
            singleline: 5,
            multiline: {
                max: 5,
                allowFirstLine: false,
            },
        }],
        'vue/html-self-closing': ['warn', {
            html: {
                void: 'always',
                normal: 'always',
                component: 'always',
            },
            svg: 'always',
            math: 'always',
        }],
        'vue/order-in-components': ['warn', {
            order: [
                'el',
                'name',
                'parent',
                'functional',
                ['delimiters', 'comments'],
                ['components', 'directives', 'filters'],
                'extends',
                'mixins',
                'inheritAttrs',
                'model',
                ['props', 'propsData'],
                'data',
                'computed',
                'watch',
                'LIFECYCLE_HOOKS',
                'methods',
                ['template', 'render'],
                'renderError',
            ],
        }],
        'vue/this-in-template': ['warn', 'never'],
        'vue/singleline-html-element-content-newline': 0,
        'vue/v-bind-style': ['warn', 'shorthand'],
        'vue/v-on-style': ['warn', 'shorthand'],
        'vue/v-on-function-call': ['warn', 'never'],
        'vue/name-property-casing': ['warn', 'PascalCase'],
        'vue/prop-name-casing': ['warn', 'camelCase'],
        'vue/require-valid-default-prop': 1,
        'vue/require-prop-types': 1,
        'vue/mustache-interpolation-spacing': ['warn', 'always'],
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js'],
            },
            alias: {
                map: [
                    ['~', './src/renderer'],
                ],
            },
        },
    },
    // Standard indentation rule needs to be disabled for .vue files
    // as it conflicts with the vue indent rule.
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                indent: 'off',
            },
        },
    ],
};
