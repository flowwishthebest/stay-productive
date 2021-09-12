'use strict';

const LANDING_URL = 'https://fierce-temple-66379.herokuapp.com';

function onInstall() {
  console.log('This is a first install!');

  const url = `${LANDING_URL}/getting-started`;
  chrome.tabs.create({ url });
}

function onUpdate(d) {
  const { version } = chrome.runtime.getManifest();
  console.log(`Updated from ${d.previousVersion} to ${version}!`);

  const url = `${LANDING_URL}/whats-new?from=${d.previousVersion}&to=${version}`;
  chrome.tabs.create({ url });
}

function onUnknowReason() {
  const color = '#3aa757';
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
}

function setExtensionLifeTimeHooks() {
  chrome.runtime.onInstalled.addListener((d) => {
    if (d.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      return onInstall();
    }
    if (d.reason === chrome.runtime.OnInstalledReason.UPDATE) {
      return onUpdate(d);
    }
    return onUnknowReason();
  });

  const url = `${LANDING_URL}/see-you-later`;
  chrome.runtime.setUninstallURL(url, () => {
    console.log('uninstall url set ', url);
  });
}

async function main() {
  setExtensionLifeTimeHooks();
}

main().catch((err) => {
  console.error(err);
});
