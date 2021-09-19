'use strict';

async function get(key) {
  return await chrome.storage.sync.get(key);
}

async function set(key, value) {
  await chrome.storage.sync.set(key, value);
  console.log(`set ${key} to ${value}`);
}

module.exports = {
  get,
  set,
};
