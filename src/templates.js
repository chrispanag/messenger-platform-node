// Buttons
function urlBtn (title, url, webview_height_ratio = "full") {
  return {
    type: "web_url",
    url,
    title,
    webview_height_ratio
  };
}

function callBtn (title, number) {
  return {
    type: "phone_number",
    title,
    payload: number
  };
}

function shareBtn (generic = null) {
  if (generic) {
    return {
      type: "element_share",
      share_contents: {
        attachment: JSON.stringify(generic)
      }
    };
  }
  return {
    type: "element_share"
  };
}

function postbackBtn (title, payload) {
  return {
    type: "postback",
    payload: JSON.stringify(payload),
    title,
  };
}

// buttons must be an array of button objects,
// make them manually or use the functions above
function buttonMessage (text, buttons) {
  return {
      type: "template",
      payload: {
        template_type: "button",
        text,
        buttons
      }
  };
}

function image (url) {
  return {
    type: "image",
    payload: {
      url
    }
  };
}

function cardElement ({title = null, subtitle = null, image_url = null, buttons = []}) {
  return {
    title,
    subtitle,
    image_url,
    buttons
  };
}

function listElement ({title, subtitle, image_url, action = null, buttons = []}) {
  return {
    title,
    image_url,
    subtitle,
    default_action: action,
    buttons
  };
}

// elements is an array of
function cardMessage (elements) {
  return {
    type: "template",
    payload: {
      template_type: "generic",
      elements
    }
  };
}

function listMessage ({elements, buttons, large = false}) {
  let type = "compact";
  if (large) {
    type = "large";
  }
  return {
    type: "template",
    payload: {
        template_type: "list",
        top_element_style: type,
        elements,
        buttons
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