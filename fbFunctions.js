// Facebook Send API related modules
const fetch = require('node-fetch');
const promiseDelay = require('promise-delay');

module.exports = function (FB_PAGE_TOKEN, FB_APP_SECRET) {
  let module = {};

  // Concealed Facebook API functions that were once created and I don't need to touch them anymore :P
  const api = require('./facebookAPI.js')(FB_PAGE_TOKEN, FB_APP_SECRET);
  const qs = 'access_token=' + encodeURIComponent(FB_PAGE_TOKEN);

  // Sender Actions
  module.startsTyping = id => api.senderAction(id, "typing_on");

  module.stopsTyping = id =>  api.senderAction(id, "typing_off");

  module.markSeen = id => api.senderAction(id, "mark_seen");

  // Sends a message in facebook. The message can be of any type. Either of plain text, or with an attachment or with quickreplies
  // options = {text, quickreplies, attachment, templateID}
  // Quick Replies is an array of objects with the title & the payload of each quickreply
  module.fbMessage = (id, options) => {
    let {text = null, quickreplies = null, attachment = null, templateID = null, tag = null} = options;
    if (!(typeof options === "object")) {
      text = options, quickreplies = null, attachment = null, templateID = null, tag = null;
    }
    console.log(attachment);
    if (!id) {
      throw new Error("fbMessage: No user id is specified!");
    }
    if (!(text || attachment)) {
      throw new Error("fbMessage: No message content is specified!");
    }
    const body = messageBuilder(id, text, quickreplies, attachment, tag); // Set the body of the message
    return fetch(`https://graph.facebook.com/me/messages?${qs}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body,
    })
    .then(rsp => {
      if (USE_DASHBOT) {
        const dashbot = require('dashbot')(DASHBOT_API_KEY).facebook;
        let json = JSON.parse(body);
        if (templateID) {
          json.dashbotTemplateId = templateID;
        }
        const requestData = {
          url: 'https://graph.facebook.com/me/messages?',
          qs,
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          json,
        };
        dashbot.logOutgoing(requestData, rsp.body);
      }
      return rsp.json();
    }).then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
  };

  module.fbMessageDelay = (delay, id, options) => {
    return module.startsTyping(id).then(() => {
      return promiseDelay(delay).then(() => {
        return module.fbMessage(id, options);
      });
    });
  };

  module.chainFbMessages = (delay, id, messages) => {
    return chainPromises(delay, id, messages, 0);
  };

  function chainPromises(delay, id, messages, i) {
    if (i == (messages.length - 1)) {
      return module.fbMessageDelay(delay, id, messages[i]);
    }
    return module.fbMessageDelay(delay, id, messages[i]).then(() => chainPromises(delay, id, messages, i+1));
  }

  module.handover = id => {
    const body = JSON.stringify({
      recipient: {
        id
      },
      target_app_id: 263902037430900,
      metadata: ""
    });
    return fetch(`https://graph.facebook.com/v2.6/me/pass_thread_control?${qs}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body
    });
  };

  module.takeThread = id => {
    const body = JSON.stringify({
      recipient: {
        id
      }
    });
    return fetch(`https://graph.facebook.com/v2.6/me/take_thread_control?${qs}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body
    });
  };

  module.getUserData = id => {
    return fetch(`https://graph.facebook.com/v2.11/${id}?fields=first_name,last_name,profile_pic,locale,timezone,gender&${qs}`, {
      method: 'GET'
    })
    .then(rsp => rsp.json())
    .then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
  };

  module.privateReply = (id, message) => {
    const body = JSON.stringify({
      id,
      message
    });
    return fetch(`https://graph.facebook.com/v2.10/${id}/private_replies?${qs}`, {
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

  module.getMessage = id => {
    return fetch("https://graph.facebook.com/v2.6/"+id+"?" + qs, {
      method: 'GET'
    })
    .then(rsp => rsp.json())
    .then(json => {
      if (json.error && json.error.message) {
        throw new Error(json.error.message);
      }
      return json;
    });
  };

  module.verifyRequestSignature = api.verifyRequestSignature;
  module.subscribeToWebhook = api.subscribeToWebhook;

  return module;
};

// Gets an array of quick replies and creates a JSON array object with them.
function quickrepliesGen(array) {
  let quickreplies = [];
  for (i = 0, len = array.length; i < len; i++) {
    if (array[i].payload) {
      quickreplies.push(quickreplyGen(array[i].text, array[i].payload));
    } else {
      quickreplies.push(quickreplyGen(array[i], "No Payload"));
    }
  }
  return quickreplies;
}

// Gets the text and the payload of a quick reply and returns the json of a quickreply
function quickreplyGen(title, payload) {
  if (title == "send_location" && payload == "No Payload") {
    return {
      content_type : "location"
    };
  }
  return {
    content_type : "text",
    title,
    payload : JSON.stringify(payload)
  };
}


// A function to build the body of a message
function messageBuilder(id, text, quickreplies, attachment, tag) {
  console.log(text);
  let quick_replies = null;
  // Handle Quick Replies (Facebook Send API)
  if (quickreplies) {
    if (!Array.isArray(quickreplies)) {
      throw new Error("fbMessage: Quickreplies is not an Array!");
    }
    quick_replies = quickrepliesGen(quickreplies);
  }
  if (attachment) {
    return JSON.stringify({
      recipient: { id },
      message: {
        attachment: attachment,
      },
      tag
    });
  }
  return JSON.stringify({
    recipient: { id },
    message: {text, quick_replies},
    tag
  });
}
