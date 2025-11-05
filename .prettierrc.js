module.exports = {
  // Basic formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',

  // Specific file type overrides
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
        printWidth: 120,
      },
    },
    {
      files: '*.component.html',
      options: {
        parser: 'angular',
        printWidth: 120,
      },
    },
    {
      files: ['*.json', '.prettierrc', '.eslintrc'],
      options: {
        parser: 'json',
        printWidth: 80,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: ['*.yml', '*.yaml'],
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
      },
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
      },
    },
  ],

  // Plugins
  plugins: ['prettier-plugin-organize-imports'],
};
