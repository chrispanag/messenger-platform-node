/*
  Webhook Function 
*/

function webhook(FB_PAGE_ID, { messages = () => null, feed = () => null, standby = () => null }, logIncoming = () => null) {
  if (!FB_PAGE_ID) 
    throw new Error("Missing FB_PAGE_ID");

  return (req, res) => {
    const data = req.body;
    
    // Send message to metrics
    logIncoming(data);

    if (data.object === 'page') {
      data.entry.forEach(entry => {
        // Messaging Standard Channel
        if (entry.messaging) {
          entry.messaging.forEach(e => {
            if (e.recipient.id == FB_PAGE_ID) 
              messages(e);
            else 
              console.log("Message from other page");
          });
          return;
        }
        // Feed Changes Channel. We use that for the Comment-To-Messenger Functionality
        if (entry.changes) {
          entry.changes.forEach(e => feed(e.value));
          return;
        }
        // Messaging Standby Channel
        if (entry.standby) {
          entry.standby.forEach(e => {
            if (e.recipient.id === FB_PAGE_ID) 
              standby(e);
            else
              console.log("Message from other page");
          });
          return;
        }
        // If another channel is added that it is not handled then throw an error.
        // This may result to some messages being dropped but that will be rare.
        console.log(entry);
        throw new Error("Webhook: Unknown webhook channel");
      });
    } else
        // If the object sending the webhook requests is not a page
        throw new Error(`Webhook: Unknown data.object: ${data.object}`);
      
    // We send the 200 status as fast as we can.
    res.sendStatus(200);
  };
}

function messengerWebhook({ attachmentHandler, textHandler, menuHandler, getContext, isCustomerService = () => false, customerServiceHandler = () => null}) {
  if (attachmentHandler) 
    throw new Error("Messenger Webhook: No attachmentHandler is set");
  if (textHandler) 
    throw new Error("Messenger Webhook: No textHandler is set");
  if (menuHandler) 
    throw new Error("Messenger Webhook: No menuHandler is set");
  if (getContext) 
    throw new Error("Messenger Webhook: No getContext is set");

  return data => {
    return getContext(data).then(messaging => {
      const id = messaging.sender.id;
      if (isCustomerService(messaging))
        return customerServiceHandler(id);
        
      if (messaging.message) {
        // ECHOs
        if (messaging.message.is_echo) {
          console.log(`Echo message: ${messaging.message}`);
          return;
        }
        // ATTACHMENTS
        if (messaging.message.attachments)
          // For each attachment run the attachment handler once
          return Promise.all(messaging.message.attachments.map(a => attachmentHandler(id, a, messaging.user)));
        // TEXT
        else if (messaging.message.text && !messaging.message.quick_reply)
          return textHandler(messaging.message, id, messaging.message.nlp, messaging.user);
        // QUICKREPLIES
        else if (messaging.message.quick_reply) {
          const payload = messaging.message.quick_reply.payload;
          // If there is no payload treat it as just text
          if (payload == "\"No Payload\"")
            return textHandler(id, messaging.message.text, messaging.user);
          // If there is a payload
          return menuHandler(messaging, payload, messaging.user);
        }
      }
      // Button pushes
      if (messaging.postback && messaging.postback.payload) {
        // TODO Ref Links
        let ref = null;
        if (messaging.postback.referral)
          ref = messaging.postback.referral.ref;
        // TODO REF HANDLER
        return menuHandler(messaging, messaging.postback.payload, messaging.user, ref);
      }
      if (messaging.referral) {
        // TODO Ref Links
        let ref = null;
        if (messaging.postback.referral)
          ref = messaging.postback.referral.ref;
        // TODO REF handler
      }
    });
  };
}

module.exports = {
  webhook,
  messengerWebhook
}
