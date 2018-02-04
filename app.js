const fbApp = require('./fbFunctions.js');
const t = require('./templates.js');
const stickers = require('./stickers.js');
const { webhook, messengerWebhook } = require('./webhook.js');

module.exports = {
  stickers,
  fbApp,
  t,
  webhook,
  messengerWebhook
};
