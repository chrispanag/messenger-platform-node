const crypto = require('crypto');
const request = require('request');
const fetch = require('node-fetch');

module.exports = function (FB_PAGE_TOKEN, FB_APP_SECRET) {
  let module = {};

  /*
   * Verify that the callback came from Facebook. Using the App Secret from
   * the App Dashboard, we can verify the signature that is sent with each
   * callback in the x-hub-signature field, located in the header.
   */

  module.senderAction = (id, sender_action) => {
    const body = JSON.stringify({
      recipient: { id },
      sender_action
    });
    const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);
    return fetch('https://graph.facebook.com/me/messages?' + qs, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
    })
    .then(rsp => rsp.json())
    .then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
  };

  module.verifyRequestSignature = function (req, res, buf) {
    let signature = req.headers["x-hub-signature"];

    if (!signature) {
      console.error("Couldn't validate the signature.");
    } else {
      let elements = signature.split('=');
      let method = elements[0];
      let signatureHash = elements[1];

      let expectedHash = crypto.createHmac('sha1', FB_APP_SECRET)
                          .update(buf)
                          .digest('hex');

      if (signatureHash != expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }
  };

  module.subscribeToWebhook = function () {
    // Subscribe the app to the Webhook
    request({
        url: "https://graph.facebook.com/v2.6/me/subscribed_apps?access_token="+FB_PAGE_TOKEN,
        method: 'POST',
      }, function(error, response, body) {
        if (error) {
          console.log("There was an error subscribing the bot to the webhook!");
        } else {
          let res = JSON.parse(response.body);
          if (res.success) {
            console.log("The bot is subscribed to Facebook's webhook!");
          } else {
            throw new Error("There was an error subscribing the bot to the webhook!");
          }
        }
      });
  };

  return module;
};
