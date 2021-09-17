'use strict';
module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
        webextensions: true,
				browser: true
    },
		globals: {
			localStorage: true,
		},
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module'
    },
		rules: {
			indent: [2, 2],
		},
};
