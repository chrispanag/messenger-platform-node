# Messenger Platform Lib #

This is a NodeJS module with Functions for accessing FB API (Send API mostly)

[![Linux Build][travis-image]][travis-url]

## How to get up and running ##
1) Install the module with `npm`
2) Require the module and construct the library
  ```
  const { FB } = require('messenger-platform-node');
  const fb = new FB(FB_PAGE_TOKEN, FB_APP_SECRET, logger);
  ```

## List of Functions ##

### Send Messages ###
* #### `fbMessage (id, options);` ####
This method sends a message specified by the `options` object to the user with the PSID `id`. Returns a *promise* that throws an error if the sending of the message fails.
* #### `fbMessageDelay (DELAY, id, options);` ####
This method executes a `fbMessage(id, options);` after a given delay specified by the `DELAY` constant. Returns a *promise*.
* #### `chainFbMessages (DELAY, id, [options]);` ####
This method is used to send multiple messages to a single user. Each message is separated from the one before it with a constant delay (`DELAY`). The messages sent are specified inside the array `[options]` that contains multiple `options` objects. It is implemented using a `fbMessage(id, options)` for each separate message. Returns a *promise*.

  #### The `options` object: ####

  ```
  {
    text,         // String
    quickreplies, // Array
    attachment,   // Object
    templateId,   // String
    tag           // String
  }
  ```

### Comment-To-Messenger ###
* #### `privateReply (comment_id, message);` ####
This method uses the comment_id Graph API edge to send a one-time private response to the commenter. The `message` variable can only be a string. Returns a *promise*.

### Manipulate the typing indicator ###
* #### `startsTyping (id);` ####
Shows the user with the PSID `id` that the bot is "typing". Returns a *promise*.
* #### `stopsTyping (id);` ####
Stops the typing indicator to the user with the PSID `id`. Returns a *promise*.
* #### `markSeen (id);` ####
Marks the last message on the thread with the user with the PSID `id` as "seen". Returns a *promise*.

### Get user data ###
* #### `getUserData (id);` ####
Gets the user data provided by the Messenger Platform API for the user with the PSID `id`. Returns a *promise* that returns the following object:

  ```
  {
    first_name,
    last_name,
    profile_pic,
    locale,
    timezone,
    gender
  }
  ```

  *This method should be edited to inlude the LAST_AD_REFERRAL field*

### Handover Protocol ###
* #### `handover (id);` ####
Handovers the user with the PSID `id` to the Page Inbox app. Returns a *promise*.
* #### `takeThread (id);` ####
Takes thread control of the user with the PSID `id`. Returns a *promise*.

## List of Templates ##

### Buttons ###
* `urlBtn (title, url, webview_height_ratio = "full");`
* `callBtn (title, number);`
* `shareBtn (generic = null);`
* `postbackBtn (title, payload);`

### Attachments ###
* `image (url);`
* `buttonMessage (text, [buttons]);`
* `cardMessage ([elements]);`
* `cardElement ({title = null, subtitle = null, image_url = null, buttons = []});`
* `listMessage ({[elements], buttons, large = false});`
* `listElement ({title, subtitle, image_url, action = null, buttons = []});`

## Webhook ##

* `webhook (messenger, FB_PAGE_ID);`
* `messengerWebhook ({attachmentHandler, textHandler, menuHandler, getContext, isCustomerService});`

[travis-image]:https://travis-ci.org/chrispanag/messenger-platform-node.svg?branch=master
[travis-url]:https://travis-ci.org/chrispanag/messenger-platform-node

