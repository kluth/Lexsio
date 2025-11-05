module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss'
  ],
  plugins: ['stylelint-scss'],
  rules: {
    // SCSS specific rules
    'scss/at-import-partial-extension': 'never',
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-redundant-nesting-selector': true,
    'scss/no-duplicate-dollar-variables': true,
    'scss/no-duplicate-mixins': true,

    // General rules
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message: 'Expected class selector to be kebab-case',
      },
    ],
    'selector-id-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message: 'Expected id selector to be kebab-case',
      },
    ],
    'custom-property-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
      {
        message: 'Expected custom property to be kebab-case',
      },
    ],

    // Best practices
    'no-descending-specificity': null, // Too strict for component styles
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'string-no-newline': true,
    'unit-no-unknown': true,
    'property-no-unknown': true,
    'declaration-block-no-duplicate-properties': true,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['host', 'ng-deep'], // Angular specific
      },
    ],
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': [
      true,
      {
        ignore: ['custom-elements'], // Allow custom elements
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'include',
          'mixin',
          'extend',
          'use',
          'forward',
        ],
      },
    ],

    // Code quality
    'max-nesting-depth': [
      4,
      {
        ignore: ['blockless-at-rules', 'pseudo-classes'],
      },
    ],
    'declaration-no-important': null, // Sometimes needed for Angular overrides

    // Note: Formatting rules like indentation and string-quotes are handled by Prettier
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*',
    'coverage/**/*',
    '.angular/**/*',
  ],
};
