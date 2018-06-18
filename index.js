const { FB } = require('./src/fbFunctions');
const t = require('./src/templates');
const stickers = require('./src/stickers');
const { webhook, messengerWebhook } = require('./src/webhook');
const { attachmentUploadFactory } = require('./src/attachmentUpload');

module.exports = {
  stickers,
  FB,
  t,
  webhook,
  messengerWebhook,
  attachmentUploadFactory
};
