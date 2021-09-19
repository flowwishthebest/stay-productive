'use strict';

const config = require('./config');
const blocklist = require('./blocklist');
const state = require('./state');

async function install() {
  console.log('This is a first install!');

  await state.initialize();

  await showOnboarding();

  console.log('Install done');
}

async function showOnboarding() {
  await chrome.tabs.create({
    url: `${config.landingUrl}/getting-started`,
  });
}

async function showUpdatesPage(from, to) {
  await chrome.tabs.create({
    url: `${config.landingUrl}/whats-new?from=${from}&to=${to}`,
  });
}

async function update(d) {
  const { version } = chrome.runtime.getManifest();

  if (version === d.previousVersion) {
    return console.log('Updated to same version ' + version);
  }

  await showUpdatesPage(d.previousVersion, version);

  console.log(`Updated from ${d.previousVersion} to ${version}!`);
}

function unknown() {
  console.log('Unknown runtime event fired');
}

async function onUninstalled() {
  const url = `${config.landingUrl}/see-you-later`;
  await chrome.runtime.setUninstallURL(url);
  console.log('uninstall url set ', url);
}

async function onInstalled() {
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

async function filterTab(tab) {
  // TODO: remove accepts list of tab ids. Use it
  if (blocklist.isBlocklisted(tab.url)) {
    // TODO: hide or remove tabs depends on user settings
    await chrome.tabs.remove(tab.id);
    console.log('removed tab ', tab);
  }
}

async function filterActiveTabs() {
  const tabs = chrome.tabs.query({});

  for (const tab of tabs) {
    await filterTab(tab);
  }
}

function onTabsUpdatedHandler(id, info, tab) {
  return filterTab(tab);
}

async function changeIcon(iconName) {
  return new Promise((resolve) => {
    const path = '../icons/' + iconName;
    // TODO: check for animated icon
    chrome.action.setIcon({ path }, () => {
      console.log('icon changed ' + path);
      resolve();
    });
  });
}

async function enable() {
  console.log('Enabling extension ...');

  chrome.tabs.onUpdated.addListener(onTabsUpdatedHandler);

  await filterActiveTabs();

  await changeIcon('32_on.png');
}

async function disable() {
  console.log('Disabling extension ...');

  chrome.tabs.onUpdated.removeListener(onTabsUpdatedHandler);

  await changeIcon('32.png');
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
    state.set(state.getNextState());
  });
}

try {
  main();
} catch (err) {
  console.error(err);
}
