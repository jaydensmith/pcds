module.exports = {
    extends: [
        'stylelint-config-standard',
    ],
    // add your custom config here
    // https://stylelint.io/user-guide/configuration
    rules: {
        'indentation': [ 4, { baseIndentLevel: 1 } ],
        'string-quotes': 'single',
        'no-descending-specificity': null,
        'at-rule-no-unknown': [ true, {
            ignoreAtRules: [
                'mixin',
                'include',
                'tailwind',
                'apply',
                'extends',
                'svg-load',
                'layer',
                'screen',
                'responsive',
                'variants',
                'extend',
                'each',
                'for',
            ],
        } ],
        'selector-pseudo-element-no-unknown': [ true, {
            ignorePseudoElements: [
                'v-deep',
            ],
        } ],
    },
};
