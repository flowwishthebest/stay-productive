'use strict';

const config = require('./config');
const blocklist = require('./blocklist');

function initializeState(cb) {
  localStorageSet(config.extActivityStatusKey, false, (err, v) => {
    console.log('Value is set to ' + v);
    cb();
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

function filterTab(tab) {
  if (blocklist.isBlocklisted(tab.url)) {
    chrome.tabs.remove(tab.id, () => {
      console.log('removed tab ', tab);
    });
  }
}

function filterActiveTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(filterTab);
  });
}

function enable() {
  console.log('Enabling extension ...');

  chrome.tabs.onUpdated.addListener((id, info, tab) => filterTab(tab));

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

function main() {
  setHooks();

  chrome.storage.onChanged.addListener((changes) => {
    if (typeof changes[config.extActivityStatusKey] === 'undefined') {
      return;
    }

    if (changes[config.extActivityStatusKey]) {
      return enable();
    }

    return disable();
  });

  chrome.action.onClicked.addListener(() => {
    localStorageGet(config.extActivityStatusKey, (err, v) => {
      const nextState = !v;

      console.log('Value currently is ' + v, 'next value ' + nextState);

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
