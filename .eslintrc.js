module.exports = {
  root: true,
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '.angular',
    '*.js',
    '*.mjs',
    'playwright-report',
    'test-results'
  ],
  overrides: [
    // TypeScript files
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json', './tsconfig.e2e.json'],
        createDefaultProgram: true,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      extends: [
        'airbnb-base',
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/template/process-inline-templates',
        'plugin:prettier/recommended',
      ],
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'default',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
            leadingUnderscore: 'allow',
            trailingUnderscore: 'allow',
          },
          {
            selector: 'typeLike',
            format: ['PascalCase'],
          },
          {
            selector: 'enumMember',
            format: ['UPPER_CASE', 'PascalCase'],
          },
          {
            selector: 'property',
            format: null, // Allow any format for properties (JSON compatibility)
          },
        ],
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/await-thenable': 'error',

        // Angular specific rules
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'app',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            prefix: 'app',
            style: 'kebab-case',
          },
        ],
        '@angular-eslint/no-input-rename': 'error',
        '@angular-eslint/no-output-rename': 'error',
        '@angular-eslint/use-lifecycle-interface': 'error',
        '@angular-eslint/no-conflicting-lifecycle': 'error',
        '@angular-eslint/prefer-on-push-component-change-detection': 'warn',

        // Import rules
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: [
              '**/*.spec.ts',
              '**/*.test.ts',
              '**/vitest.config.ts',
              '**/playwright.config.ts',
              'e2e/**/*',
              'src/test-setup.ts',
            ],
          },
        ],
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
              'object',
              'type',
            ],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],

        // General code quality rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'warn',
        'max-len': [
          'error',
          {
            code: 120,
            ignoreComments: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true,
          },
        ],
        'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
        complexity: ['warn', 15],
        'max-depth': ['warn', 4],
        'max-params': ['warn', 5],

        // Best practices
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-template': 'error',
        'object-shorthand': 'error',
        'no-param-reassign': ['error', { props: false }],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'ForInStatement',
            message:
              'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
          },
        ],

        // Allow certain patterns common in Angular
        'class-methods-use-this': 'off',
        '@typescript-eslint/unbound-method': 'off', // RxJS operators
        'no-underscore-dangle': 'off',
        'no-plusplus': 'off', // Allow ++ and -- operators
        'no-console': ['warn', { allow: ['warn', 'error'] }], // Allow console.warn and console.error

        // Relax some strict type-checking rules for existing codebase
        '@typescript-eslint/no-unsafe-assignment': 'warn',
        '@typescript-eslint/no-unsafe-return': 'warn',
        '@typescript-eslint/no-unsafe-member-access': 'warn',
        '@typescript-eslint/no-unsafe-call': 'warn',
        '@typescript-eslint/no-unsafe-argument': 'warn',
        '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/no-floating-promises': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        '@angular-eslint/prefer-inject': 'warn', // Constructor injection is fine for now
        '@typescript-eslint/naming-convention': 'off', // Too strict for existing codebase
      },
    },

    // HTML Templates
    {
      files: ['*.html'],
      extends: [
        'plugin:@angular-eslint/template/recommended',
        'plugin:@angular-eslint/template/accessibility',
      ],
      rules: {
        '@angular-eslint/template/click-events-have-key-events': 'warn',
        '@angular-eslint/template/mouse-events-have-key-events': 'warn',
        '@angular-eslint/template/no-autofocus': 'warn',
        '@angular-eslint/template/no-distracting-elements': 'error',
        '@angular-eslint/template/prefer-self-closing-tags': 'error',
      },
    },

    // Test files - more relaxed rules
    {
      files: ['*.spec.ts', '*.test.ts', 'e2e/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        'no-plusplus': 'off',
        'no-await-in-loop': 'off',
        'no-console': 'off',
      },
    },
  ],
};
