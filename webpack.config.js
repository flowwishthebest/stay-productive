'use strict';

const path = require('path');

module.exports = {
	mode: 'development',
	entry: './lib/background.js',
	output: {
		filename: 'main.js',
		path: path.join(process.cwd(), 'dist'),
	},
};

