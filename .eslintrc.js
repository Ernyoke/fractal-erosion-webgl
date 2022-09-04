module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'mocha': true,
    },
    'parserOptions': {
        'ecmaVersion': 8,
        'sourceType': 'module',
    },
    'extends': [
        'eslint:recommended',
        'google',
    ],
    'rules': {
        'indent': ['error', 4,
            {
                'SwitchCase': 1,
            }],
        'max-len': ['error',
            {
                'code': 120,
                'ignoreComments': true,
            }],
        'space-before-function-paren': 'off',
        'no-unused-expressions': 0,
    },
    'globals': {
        'expect': true,
        'assert': true,
        'require': true,
        'module': true,
    },
    'overrides': [{
        'files': '*.js',
        'rules': {
            'require-jsdoc': 'off',
        },
    }],
};
