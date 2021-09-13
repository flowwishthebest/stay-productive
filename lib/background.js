'use strict';

const EXTENSION_ACTIVITY_STATUS = 'isExtensionActive';

function initializeState(cb) {
  localStorageSet(EXTENSION_ACTIVITY_STATUS, false, (err, v) => {
    console.log('Value is set to ' + v);
    // TODO: load icon as off
    cb();
  });
}

const blocklistedUrls = [];

function isBlocklisted(url) {
  return blocklistedUrls.some((u) => u === url);
}

const LANDING_URL = 'https://fierce-temple-66379.herokuapp.com';

function install() {
  console.log('This is a first install!');

  const url = `${LANDING_URL}/getting-started`;
  chrome.tabs.create({ url });

  initializeState(() => {
    console.log('Install done');
  });
}

function update(d) {
  const { version } = chrome.runtime.getManifest();
  console.log(`Updated from ${d.previousVersion} to ${version}!`);

  const url = `${LANDING_URL}/whats-new?from=${d.previousVersion}&to=${version}`;
  chrome.tabs.create({ url });
}

function unknown() {
  const color = '#3aa757';
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
}

function onUninstalled() {
  const url = `${LANDING_URL}/see-you-later`;
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

function enable() {
  console.log('Enabling extension ...');
}

function disable() {
  console.log('Disabling extension ...');
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


function main() {
  setHooks();

  chrome.action.onClicked.addListener(() => {
    localStorageGet(EXTENSION_ACTIVITY_STATUS, (err, v) => {
      const currState = v;
      const nextState = !currState;

      console.log('Value currently is ' + currState, 'next value ', nextState);

      if (nextState) {
        enable();
      } else {
        disable();
      }

      localStorageSet(EXTENSION_ACTIVITY_STATUS, nextState, (err, v) => {
        console.log('Value is set to after on/off ' + v);
      });
    });
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (isBlocklisted(tab.url)) {
      chrome.tabs.remove(tabId);
    }
  });
}

try {
  main();
} catch (err) {
  console.error(err);
}
