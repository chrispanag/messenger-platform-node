const crypto = require('crypto');
const fetch = require('node-fetch');

class FBApi {
  // The constructor stores the FB_APP_SECRET in a private variable and also creates the qs for the requests with the FB_PAGE_TOKEN
  constructor (FB_PAGE_TOKEN, FB_APP_SECRET) {
    if (!FB_PAGE_TOKEN) 
      throw new Error("No FB_PAGE_TOKEN is specified");
    if (!FB_APP_SECRET) 
      throw new Error("No FB_APP_SECRET is specified");

    this._FB_APP_SECRET = FB_APP_SECRET;
    this._qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);

    this.verifyRequestSignature = this.verifyRequestSignature.bind(this);
  }

  // Method Used for all the Send API calls
  sendAPI (options) {
    const body = JSON.stringify(options);
    return fetch(`https://graph.facebook.com/me/messages?${this._qs}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
    })
    .then(rsp => rsp.json())
    .then(json => {
      if (json.error && json.error.message)
        throw new Error(json.error.message);

      return json;
    });
  }

  senderAction (id, sender_action) {
    const body = {
      recipient: { id },
      sender_action
    }
    return this.sendAPI(body);
  }

  verifyRequestSignature (req, res, buf) {
    let signature = req.headers["x-hub-signature"];

    if (!signature)
      throw new Error("Couldn't validate the signature.");

    let elements = signature.split('=');
    let signatureHash = elements[1];

    let expectedHash = crypto.createHmac('sha1', this._FB_APP_SECRET)
                      .update(buf)
                      .digest('hex');

    if (signatureHash != expectedHash)
      throw new Error("Couldn't validate the request signature.");
  }
}

module.exports = FBApi;
