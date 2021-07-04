module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/.*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
        project: 'tsconfig.json'
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'prettier'
      ]
    },
    {
      files: ['**/*.js', '**/.*.js'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021
      },
      extends: ['eslint:recommended', 'prettier']
    }
  ]
}
