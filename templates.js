// Buttons
function urlBtn (title, url, webview_height_ratio) {
  if (!webview_height_ratio) {
    webview_height_ratio = "full";
  }
  return {
    "type": "web_url",
    "url": url,
    "title": title,
    "webview_height_ratio": webview_height_ratio
  };
}

function callBtn (title, number) {
  return {
    "type":"phone_number",
    "title": title,
    "payload": number
  };
}

function shareBtn (generic = null) {
  if (generic) {
    return {
      "type":"element_share",
      "share_contents": {
        "attachment": JSON.stringify(generic)
      }
    };
  } else {
    return {
      "type": "element_share"
    };
  }
}

function postbackBtn (title, payload) {
  return {
    "type": "postback",
    "payload": JSON.stringify(payload),
    "title": title,
  };
}

// buttons must be an array of button objects,
// make them manually or use the functions above
function buttonMessage (text, buttons) {
  return {
    "type":"template",
      "payload":{
        "template_type":"button",
        "text": text,
        "buttons": buttons
      }
  };
}

function image (image) {
  return {
    "type":"image",
    "payload":{
      "url": image
    }
  };
}

function cardElement ({title = null, subtitle = null, image_url = null, buttons = []}) {
  return {
    "title": title,
    "subtitle": subtitle,
    "image_url": image_url,
    "buttons": buttons
  };
}

function listElement ({title, subtitle, image_url, action, button}) {
  if (button) {
    button = [button];
  }
  return {
    "title": title,
    "image_url": image_url,
    "subtitle": subtitle,
    "default_action": action,
    "buttons": button
  };
}

// elements is an array of
function cardMessage (elements) {
  return {
    "type":"template",
    "payload": {
      "template_type":"generic",
      "elements": elements
    }
  };
}

function listMessage (elements, button, large) {
  if (button) {
    button = [button];
  }
  var type = "compact";
  if (large) {
    type = "large";
  }
  return {
    "type": "template",
    "payload": {
        "template_type": "list",
        "top_element_style": type,
        "elements": elements,
        "buttons": button
      }
  };
}

exports.image = image;
exports.callBtn = callBtn;
exports.shareBtn = shareBtn;
exports.listElement = listElement;
exports.listMessage = listMessage;
exports.cardElement = cardElement;
exports.cardMessage = cardMessage;
exports.urlBtn = urlBtn;
exports.postbackBtn = postbackBtn;
exports.buttonMessage = buttonMessage;
