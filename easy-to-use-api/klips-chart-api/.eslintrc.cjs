module.exports = {
  extends: [
    '@terrestris/eslint-config-typescript'
  ],
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/member-ordering': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    // https://github.com/typescript-eslint/typescript-eslint/issues/1824
    'indent': 'off',
    '@typescript-eslint/indent': [
      'error',
      2,
      {
        'ignoredNodes': [
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
          'ClassBody.body > PropertyDefinition[decorators.length > 0] > .key'
        ]
      }
    ]
  }
};
