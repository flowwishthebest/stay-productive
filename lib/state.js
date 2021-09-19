'use strict';

const storage = require('./storage');
const config = require('./config');

let currentState = false;

async function initialize() {
  await set(false);
}

function getNextState() {
  return !currentState;
}

async function set(value) {
  currentState = value;
  await storage.set(config.extActivityStatusKey, value);
}

module.exports = {
  initialize,
  set,
  getNextState,
};
