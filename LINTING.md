# Linting & Code Quality Guide

This document explains the comprehensive linting infrastructure for the Lixso
project.

## 🎯 Overview

We use a multi-layered linting setup to ensure code quality:

- **ESLint** - TypeScript/JavaScript linting with Airbnb style guide
- **Prettier** - Code formatting
- **StyleLint** - SCSS/CSS linting
- **HTMLHint** - HTML template linting
- **lint-staged** - Pre-commit hooks
- **Husky** - Git hooks

## 🚀 Quick Start

### Run All Linters

```bash
npm run lint
```

### Fix All Auto-Fixable Issues

```bash
npm run lint:fix
```

### Format All Code

```bash
npm run format
```

## 📋 Available Commands

### Linting Commands

| Command               | Description                                    |
| --------------------- | ---------------------------------------------- |
| `npm run lint`        | Run all linters (TS, HTML, SCSS, format check) |
| `npm run lint:ts`     | Lint TypeScript files only                     |
| `npm run lint:html`   | Lint HTML files only                           |
| `npm run lint:scss`   | Lint SCSS files only                           |
| `npm run lint:format` | Check if code is formatted correctly           |

### Fixing Commands

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `npm run lint:fix`      | Auto-fix all linting issues     |
| `npm run lint:ts:fix`   | Auto-fix TypeScript issues      |
| `npm run lint:html:fix` | Auto-fix HTML issues            |
| `npm run lint:scss:fix` | Auto-fix SCSS issues            |
| `npm run format`        | Format all files with Prettier  |
| `npm run format:check`  | Check formatting without fixing |

## 🔧 Configuration Files

### ESLint (`.eslintrc.js`)

**Base Configuration:**

- ✅ Airbnb base style guide
- ✅ Airbnb TypeScript configuration
- ✅ TypeScript recommended rules
- ✅ Angular-specific rules
- ✅ Prettier integration

**Key Rules:**

```typescript
// Naming conventions
- camelCase for variables
- PascalCase for classes/types
- UPPER_CASE for enums/constants

// Code Quality
- Max line length: 120 characters
- Max file lines: 500
- Max function length: 100 lines
- Max complexity: 15
- Max depth: 4
- Max parameters: 5

// Angular Specific
- Component selector prefix: 'app-'
- Directive selector prefix: 'app-'
- No input/output rename
- Prefer OnPush change detection (warning)
```

**Test Files:** More relaxed rules for `*.spec.ts`, `*.test.ts`, and
`e2e/**/*.ts`:

- `any` type allowed
- Longer functions allowed
- More flexibility for test scenarios

### Prettier (`.prettierrc.js`)

**Settings:**

```javascript
{
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf'
}
```

**File-Specific Overrides:**

- HTML: 120 char width, Angular parser
- JSON: 80 char width
- Markdown: 80 char width, prose wrap
- SCSS/CSS: SCSS parser

**Plugins:**

- `prettier-plugin-organize-imports` - Auto-organize imports

### StyleLint (`.stylelintrc.js`)

**Base Configuration:**

- ✅ Standard SCSS config
- ✅ Prettier SCSS integration
- ✅ SCSS-specific plugins

**Key Rules:**

```scss
// Naming
- Classes: kebab-case
- IDs: kebab-case
- Custom properties: kebab-case

// Code Quality
- Max nesting depth: 4
- No duplicate selectors
- No invalid hex colors
- No unknown properties

// Angular Specific
- Allow :host pseudo-class
- Allow ::ng-deep pseudo-element
- Allow custom elements
```

### HTMLHint (`.htmlhintrc`)

**Enabled Checks:**

- ✅ Lowercase tag names
- ✅ Double quotes for attributes
- ✅ No duplicate attributes
- ✅ Proper tag pairing
- ✅ Unique IDs
- ✅ Alt text for images
- ✅ kebab-case for IDs/classes

## 🪝 Pre-Commit Hooks

### How It Works

When you commit code, **lint-staged** automatically:

1. Runs ESLint on staged `.ts` files
2. Runs HTMLHint on staged `.html` files
3. Runs StyleLint on staged `.scss/.css` files
4. Runs Prettier on all staged files
5. Auto-fixes issues where possible
6. Blocks commit if critical issues remain

### Configuration (`.lintstagedrc.js`)

```javascript
{
  '*.ts': ['eslint --fix', 'prettier --write'],
  '*.html': ['eslint --fix', 'htmlhint', 'prettier --write'],
  '*.scss': ['stylelint --fix', 'prettier --write'],
  '*.css': ['stylelint --fix', 'prettier --write'],
  '*.json': ['prettier --write'],
  '*.md': ['prettier --write']
}
```

### Skipping Hooks (Emergency Only)

```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "Emergency fix"
```

## 🔍 CI/CD Integration

### GitHub Actions Workflow

Every push/PR automatically runs:

1. **TypeScript Linting** (blocking)
   - Fails the build if critical issues found

2. **HTML Linting** (non-blocking)
   - Reports issues but doesn't fail build

3. **SCSS Linting** (non-blocking)
   - Reports issues but doesn't fail build

4. **Format Check** (non-blocking)
   - Checks if code is properly formatted

### Workflow Jobs

```yaml
lint:
  - Run TypeScript linter (required)
  - Run HTML linter (optional)
  - Run SCSS linter (optional)
  - Check formatting (optional)
  - Generate summary
```

## 📖 Best Practices

### 1. Run Linters Before Committing

```bash
npm run lint:fix
npm run format
git add .
git commit -m "feat: your change"
```

### 2. Use Auto-Fix Wisely

Auto-fix handles most issues, but review changes:

```bash
# Review what will be fixed
npm run lint:ts
npm run lint:scss

# Apply fixes
npm run lint:fix

# Review changes
git diff

# Commit if good
git add . && git commit
```

### 3. IDE Integration

**VS Code** - Install extensions:

- ESLint
- Prettier - Code formatter
- StyleLint
- HTMLHint

**Settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "eslint.validate": ["javascript", "typescript", "html"]
}
```

### 4. Disabling Rules (Use Sparingly)

**TypeScript:**

```typescript
// Disable for one line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = {};

// Disable for block
/* eslint-disable @typescript-eslint/no-explicit-any */
const data: any = {};
const more: any = {};
/* eslint-enable @typescript-eslint/no-explicit-any */
```

**SCSS:**

```scss
/* stylelint-disable-next-line selector-max-id */
#unique-id {
  color: red;
}
```

**HTML:**

```html
<!-- htmlhint-disable -->
<div id="CamelCase">Bad ID</div>
<!-- htmlhint-enable -->
```

## 🎯 Common Issues & Solutions

### Issue: "Parsing error: Cannot find module"

**Solution:** Ensure TypeScript is properly configured

```bash
npm install
# Verify tsconfig.json paths are correct
```

### Issue: "Delete ⏎ prettier/prettier"

**Solution:** Line ending mismatch

```bash
# Fix all files
npm run format

# Or configure git
git config core.autocrlf false
```

### Issue: "Import order is incorrect"

**Solution:** Let Prettier organize imports

```bash
npm run format
```

### Issue: "Max line length exceeded"

**Solution:** Break long lines

```typescript
// Before
const result = someVeryLongFunctionName(param1, param2, param3, param4, param5);

// After
const result = someVeryLongFunctionName(param1, param2, param3, param4, param5);
```

### Issue: "no-explicit-any" error

**Solution:** Type your code properly

```typescript
// Bad
function process(data: any) {}

// Good
interface Data {
  id: string;
  value: number;
}
function process(data: Data) {}
```

## 📊 Metrics

### Code Quality Metrics Enforced

- **Cyclomatic Complexity**: ≤ 15
- **Max Nesting Depth**: ≤ 4
- **Max Parameters**: ≤ 5
- **Max Line Length**: ≤ 120 characters
- **Max Function Length**: ≤ 100 lines
- **Max File Length**: ≤ 500 lines

## 🤝 Contributing

When contributing:

1. ✅ Run `npm run lint` before creating PR
2. ✅ Fix all linting errors
3. ✅ Format code with `npm run format`
4. ✅ Pre-commit hooks will auto-fix many issues
5. ✅ CI will verify linting in PR

## 📚 Resources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Airbnb Style Guide](https://github.com/airbnb/javascript)
- [Prettier](https://prettier.io/)
- [StyleLint](https://stylelint.io/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)

## 🔄 Updating Linting Rules

### Modify Rules

Edit the respective configuration file:

- TypeScript: `.eslintrc.js`
- Formatting: `.prettierrc.js`
- SCSS: `.stylelintrc.js`
- HTML: `.htmlhintrc`

### Test Changes

```bash
# Test on specific files
npx eslint src/app/app.ts
npx stylelint src/app/app.scss

# Test on whole project
npm run lint
```

### Document Changes

Update this file with any rule changes and rationale.

---

**Last Updated**: 2025-11-05 **Maintained By**: Development Team **Version**:
1.0.0
