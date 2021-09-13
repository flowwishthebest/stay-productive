'use strict';

const config = require('./config');

function initializeState(cb) {
  localStorageSet(config.extActivityStatusKey, false, (err, v) => {
    console.log('Value is set to ' + v);
    cb();
  });
}

const blocklistedUrls = [
  'vk.com',
];

function isBlocklisted(url) {
  return blocklistedUrls.some((blocklistedUrl) => {
    return url.toLowerCase().includes(blocklistedUrl);
  });
}

function install() {
  console.log('This is a first install!');

  const url = `${config.landingUrl}/getting-started`;
  chrome.tabs.create({ url });

  initializeState(() => {
    console.log('Install done');
  });
}

function update(d) {
  const { version } = chrome.runtime.getManifest();

  console.log(`Updated from ${d.previousVersion} to ${version}!`);

  if (version !== d.previousVersion) {
    const url = `${config.landingUrl}/whats-new?from=${d.previousVersion}&to=${version}`;
    chrome.tabs.create({ url });
  }
}

function unknown() {
  console.log('Unknown runtime event fired');
}

function onUninstalled() {
  const url = `${config.landingUrl}/see-you-later`;
  chrome.runtime.setUninstallURL(url, () => {
    console.log('uninstall url set ', url);
  });
}

function onInstalled() {
  chrome.runtime.onInstalled.addListener((d) => {
    if (d.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      return install();
    }
    if (d.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      return update(d);
    }
    return unknown();
  });
}


function setHooks() {
  onInstalled();
  onUninstalled();
}

function filterActiveTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (isBlocklisted(tab.url)) {
        chrome.tabs.remove(tab.id, () => {
          console.log('removed tab ', tab);
        });
      }
    });
  });
}

function enable() {
  console.log('Enabling extension ...');

  chrome.tabs.onUpdated.addListener(filterTab);

  filterActiveTabs();

  chrome.action.setIcon({
    path: '../icons/32_on.png',
  });
}

function disable() {
  console.log('Disabling extension ...');

  chrome.tabs.onUpdated.removeListener(filterTab);

  chrome.action.setIcon({
    path: '../icons/32.png',
  });
}

function localStorageGet(key, cb) {
  chrome.storage.sync.get([key], (result) => {
    cb(null, result[key]);
  });
}

function localStorageSet(key, value, cb) {
  chrome.storage.sync.set({ [key]: value }, () => {
    cb(null, value);
  });
}

function filterTab(tabId, changeInfo, tab) {
  if (isBlocklisted(tab.url)) {
    chrome.tabs.remove(tab.id, () => {
      console.log('removed tab ', tab);
    });
  }
}


function main() {
  setHooks();

  chrome.action.onClicked.addListener(() => {
    localStorageGet(config.extActivityStatusKey, (err, v) => {
      const currState = v;
      const nextState = !currState;

      console.log('Value currently is ' + currState, 'next value ', nextState);

      if (nextState) {
        enable();
      } else {
        disable();
      }

      localStorageSet(config.extActivityStatusKey, nextState, (err, v) => {
        console.log('Value is set to after on/off ' + v);
      });
    });
  });
}

try {
  main();
} catch (err) {
  console.error(err);
}
