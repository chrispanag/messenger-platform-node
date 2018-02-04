# README #

This is an npm module with Functions for accessing FB API (Send API mostly)

## List of Functions ##

### Send Messages ###
* `fbMessage (id, options);`
* `fbMessageDelay (DELAY, id, options);`
* `chainFbMessages (DELAY, id, [options]);`

### Comment-To-Messenger ###
* `privateReply (comment_id, message);`

### Manipulate the typing indicator ###
* `startsTyping (id);`
* `stopsTyping (id);`
* `markSeen (id);`

### Handover Protocol ###
* `handover (id);`
* `takeThread (id);`

### Get user data ###
* `getUserData (id);`

## List of Templates ##

### Buttons ###
* `urlBtn (title, url , webview_height_ratio = "full");`
* `callBtn (title, number);`
* `shareBtn (generic = null);`
* `postbackBtn (title, payload);`

### Attachments ###
* `image (url);`
* `buttonMessage (text, [buttons]);`
* `cardMessage ([elements]);`
* `cardElement ({title = null, subtitle = null, image_url = null, buttons = []});`
* `listMessage ({elements, buttons, large = false});`
* `listElement ({title, subtitle, image_url, action = null, buttons = []});`

## Webhook ##

* `webhook (messenger, feed, standby);`
* `messengerWebhook ({attachmentHandler, textHandler, menuHandler, getContext, isCustomerService});`
