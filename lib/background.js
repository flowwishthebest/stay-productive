'use strict';

const LANDING_URL = 'https://fierce-temple-66379.herokuapp.com';

function install() {
  console.log('This is a first install!');

  const url = `${LANDING_URL}/getting-started`;
  chrome.tabs.create({ url });
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

function main() {
  setHooks();
}

try {
  main();
} catch (err) {
  console.error(err);
}
