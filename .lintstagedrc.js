module.exports = {
  // TypeScript files
  '*.ts': [
    'eslint --fix',
    'prettier --write',
  ],

  // HTML files
  '*.html': [
    'eslint --fix',
    'htmlhint',
    'prettier --write',
  ],

  // SCSS files
  '*.scss': [
    'stylelint --fix',
    'prettier --write',
  ],

  // CSS files
  '*.css': [
    'stylelint --fix',
    'prettier --write',
  ],

  // JSON files
  '*.json': [
    'prettier --write',
  ],

  // Markdown files
  '*.md': [
    'prettier --write',
  ],
};
