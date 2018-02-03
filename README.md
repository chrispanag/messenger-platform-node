# README #

This is an npm module with Functions for accessing FB API (Send API mostly)

## List of Functions ##

### Send Messages ###
* fbMessage(id, options);
  Sends a message to a user
  
* fbMessageDelay(DELAY, id, options);
* chainFbMessages(DELAY, id, array);

### Comment-To-Messenger ###
* privateReply(comment_id, message);

### Manipulate the typing indicator ###
* startsTyping(id);
* stopsTyping(id);
* markSeen(id);

### Handover Protocol ###
* handover(id);
* takeThread(id);

### Get user data ###
* getUserData(id);
