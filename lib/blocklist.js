'use strict';

const blocklistedUrls = [
  'vk.com',
];

module.exports = {
	isBlocklisted: (url) => {
		return blocklistedUrls.some((blocklistedUrl) => {
			return url.toLowerCase().includes(blocklistedUrl);
		});
	}
};
