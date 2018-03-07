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

function cardElement ({title = null, subtitle = null, image_url = null, buttons = null}) {
  return {
    title,
    subtitle,
    image_url,
    buttons
  };
}

function listElement ({title, subtitle, image_url, action = null, buttons = null}) {
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

function listMessage ({elements, buttons = null, large = false}) {
  let top_element_style = "compact";
  if (large)
    top_element_style = "large";
  return {
    type: "template",
    payload: {
        template_type: "list",
        top_element_style,
        elements,
        buttons
      }
  };
}

module.exports = {
  image,
  callBtn,
  shareBtn,
  listElement,
  listMessage,
  cardElement,
  cardMessage,
  urlBtn,
  postbackBtn,
  buttonMessage
}
