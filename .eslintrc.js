module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    'jest/globals': true
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
      plugins: ['@typescript-eslint', 'jest'],
      extends: [
        'eslint:recommended',
        'plugin:jest/recommended',
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
      plugins: ['jest'],
      extends: ['eslint:recommended', 'plugin:jest/recommended', 'prettier']
    }
  ]
}
