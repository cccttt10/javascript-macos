// prettier-ignore
module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended'],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaFeatures': {
            'jsx': true
        },
        'ecmaVersion': 9,
        'sourceType': 'module'
    },
    'plugins': ['simple-import-sort', 'react', '@typescript-eslint', 'react-hooks'],
    'rules': {
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-use-before-define': 'error',
        'camelcase': 'error',
        'eqeqeq': 'error',
        'max-lines': ['warn', 200],
        'no-console': 'warn',
        'no-trailing-spaces': 'error',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', {
            'argsIgnorePattern': '^(props)$',
            'varsIgnorePattern': 'React'
        }],
        'no-var': 'error',
        'react/boolean-prop-naming': 'error',
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        'react/jsx-key': 'error',
        'react/no-unused-prop-types': 'error',
        'react/no-unused-state': 'error',
        'react/prefer-stateless-function': 'error',
        'react/prop-types': 'off',
        'require-await': 'error',
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error'
    },
    'settings': {
        'react': {
            'version': 'detect'
        }
    }
};