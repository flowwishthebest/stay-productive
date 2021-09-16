'use strict';

module.exports = {
  set: (key, value, cb) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      cb(null, value);
    });
  },
  get: (key, cb) => {
    chrome.storage.sync.get([key], (result) => {
      cb(null, result[key]);
    });
  },
};
