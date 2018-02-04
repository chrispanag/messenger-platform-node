const fbApp = require('./src/fbFunctions.js');
const t = require('./src/templates.js');
const stickers = require('./src/stickers.js');
const { webhook, messengerWebhook } = require('./src/webhook.js');

module.exports = {
  stickers,
  fbApp,
  t,
  webhook,
  messengerWebhook
};
