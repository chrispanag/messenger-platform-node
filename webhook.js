const fb = require('./fbFunctions.js')(FB_PAGE_TOKEN, FB_APP_SECRET);
const routes = require('../../Handlers/routes.js');
const textHandler = require('../../Handlers/textHandler.js').text;
const attachmentHandler = require('../../Handlers/attachmentHandler.js').attachmentHandler;
const contextHandler = require('../../Handlers/contextHandler.js');

const _ = require('lodash');
const exlusionList = [];//require('../../UserLists/xterra.js');
//const subscription = require('./Facebook/subscription.js')(FB_PAGE_TOKEN, FB_APP_SECRET, 'user_profiles');

module.exports = () =>  {
  return (req, res) => {
    //send message to metrics
    if (USE_DASHBOT) {
      const dashbot = require('dashbot')(DASHBOT_API_KEY).facebook;
      dashbot.logIncoming(req.body);
    }

    const data = req.body;
    if (data.object === 'page') {
      data.entry.forEach(entry => {
        if (entry.messaging) {
          messengerWebhook(entry.messaging);
        } else if (entry.changes && ENABLE_COMMENT) {
          commentWebhook(entry.changes);
        } else if (entry.standby) {
          messengerStandbyWebhook(entry.standby);
        } else if (entry.referral) {
          referralsWebhook(entry);
        } else {
          console.log(entry);
          throw new Error("Webhook: Unknown webhook channel");
        }
      });
    }
    res.sendStatus(200);
  };
};

function commentWebhook(entries) {
  entries.forEach(entry => {
    const data = entry.value;
    if (data.item == 'comment') {
      if (data.sender_id != FB_PAGE_ID) {
        if ((data.parent_id == FB_POST_ID) && (data.post_id == FB_POST_ID)) {
          // Contest
          db.collection(FB_POST_ID).findOne({uid: data.sender_id}).then(comment => {
            var name = data.sender_name.split(" "); // Split to first and last name
            if (!comment) {
              db.collection(FB_POST_ID).insert({uid: data.sender_id, first_name: name[0], last_name: name[1]});
              fb.privateReply(data.comment_id, `${name[0]} ευχαριστούμε για το σχόλιό σου. Για να επιβεβαιώσεις τη συμμετοχή σου στην κλήρωση στείλε \"ΟΚ17\"`);
            } else {
              console.log("User has already commented");
              fb.privateReply(data.comment_id, `${name[0]} έχεις ήδη μία συμμετοχή στον διαγωνισμό από το προηγούμενο comment σου :)`);
            }
          });
        } else {
          console.log('Comment on other post');
        }
      } else {
        console.log('Comment Sender is Self');
      }
    } else {
      console.log("Other type of feed change");
    }
  });
}

function messengerWebhook(entry) {
  entry.forEach(data => {
    contextHandler.getContext(data).then(messaging => {
      // Check if the recipient is us (for safety)
      if (messaging.recipient.id === FB_PAGE_ID) {
        const sender = messaging.sender.id;
        if (messaging.pass_thread_control) {
          db.collection('users').findOneAndUpdate({id: sender}, {$set: {handovered: false}});
        } else {
          // If the data is a message (attachment or just text)
          if (isCustomerService(messaging)) {
            // If the user is on customer service right now.
            db.collection('users').findOneAndUpdate({id: sender}, {$set: {handovered: true}});
            fb.handover(sender);
            console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is Handovered!`);
          } else {
            if (messaging.message) {
              // Check if the message is an echo of what we sent before
              if (messaging.message.is_echo) {
                console.log("Echo message: " + messaging.message);
                // Here we can add any functions that will track what we said (Analytics etc.)
              } else {
                // We retrieve the user's current session, or create one if it doesn't exist
                // This is needed for our bot to figure out the conversation history

                // If message has an attachment
                if (messaging.message.attachments) {
                  attachmentHandler(sender, messaging.message.attachments, messaging.user);

                  // If message is Text
                } else if (messaging.message.text && !messaging.message.quick_reply) {
                  textHandler(messaging.message, sender, messaging.message.nlp, messaging.user);

                  // Handle Quick Replies
                } else if (messaging.message.quick_reply) {
                  contextHandler.moveToPhase2(sender).then(() => {
                    var payload = messaging.message.quick_reply.payload;
                    // If there is a payload
                    if (!(payload === "\"No Payload\"")) {
                      routes.menuHandler(messaging, payload, messaging.user);
                      // If there is no payload send message to wit
                    } else {
                      textHandler(sender, messaging.message.text, messaging.user);
                    }
                  });
                }
              }
              // If message is Postback (A button was hit or something)
            } else if (messaging.postback && messaging.postback.payload) {
              if (messaging.postback.payload == "marathon" || messaging.postback.payload == "get_started" || messaging.postback.payload == "\"get_started\"" || messaging.postback.payload == "\"epixeirimatikotita_yes\"" || messaging.postback.payload == "\"epixeirimatikotita_no\"") {
                contextHandler.moveToPhase2(sender).then(() => {
                  if (messaging.postback.referral) {
                    if (messaging.postback.referral.source == "SHORTLINK") {
                      if (messaging.postback.referral.ref) {
                        if (messaging.postback.referral.ref != "OpvoteFlow") {
                          db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.postback.referral.ref}});
                        }
                        db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.postback.referral.ref}});
                        messaging.postback.payload = JSON.stringify({type: "app_vote", app_id: messaging.postback.referral.ref});
                      }
                    }
                  }
                  routes.menuHandler(messaging, messaging.postback.payload, messaging.user);
                  console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
                });
              } else {
                routes.menuHandler(messaging, messaging.postback.payload, messaging.user);
              }
            } else if (messaging.referral) {
              if (messaging.referral.source == "SHORTLINK") {
                if (messaging.referral.ref) {
                  contextHandler.moveToPhase2(sender).then(() => {
                    if (messaging.referral.ref == "efxostolidia") {
                      routes.menuHandler(messaging, "get_started", messaging.user);
                    } else {
                      if (messaging.referral.ref != "FavoriteGame") {
                        db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.referral.ref}});
                      }
                      routes.menuHandler(messaging, JSON.stringify({type: "app_vote", app_id: messaging.referral.ref}), messaging.user);
                    }
                  });
                }
              }
            }
          }
        }
      }
    }).catch(err => console.log(err));
  });
}

function messengerStandbyWebhook(entry) {
  entry.forEach(data => {
    contextHandler.getContext(data).then(messaging => {
      // Check if the recipient is us (for safety)
      if (messaging.recipient.id === FB_PAGE_ID) {
        const sender = messaging.sender.id;
        // If the data is a message (attachment or just text)
        if (messaging.message) {
          if (messaging.message.text && !messaging.message.quick_reply && isKey(messaging.message.text)) {
            if (isKey(messaging.message.text) && ENABLE_COMMENT) {
              contextHandler.moveToPhase2(sender).then(() => {
                textHandler(messaging.message, sender, messaging.message.nlp, messaging.user);
                console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
              });
            }
          } else if (messaging.message.quick_reply) {
            console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} sent QR ${messaging.message.quick_reply.payload}!`);
            var payload = JSON.parse(messaging.message.quick_reply.payload);
            if (payload.type == "second" || payload.type == "refVote") {
              contextHandler.moveToPhase2(sender).then(() => {
                routes.menuHandler(messaging, messaging.message.quick_reply.payload, messaging.user);
                console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
              });
            }
          }
          // add attachments TODO
        } else if (messaging.postback && messaging.postback.payload) {
          if (messaging.postback.payload == "get_started" || messaging.postback.payload == "marathon" || messaging.postback.title == "Εφαρμογή «Ομάδα Προσφοράς»" || messaging.postback.title == "Get Started" || messaging.postback.title == "Ας ξεκινήσουμε" || messaging.postback.payload == "\"epixeirimatikotita_yes\"" || messaging.postback.payload == "\"epixeirimatikotita_no\"") {
            contextHandler.moveToPhase2(sender).then(() => {
              if (messaging.postback.referral) {
                if (messaging.postback.referral.source == "SHORTLINK") {
                  if (messaging.postback.referral.ref) {
                    if (messaging.postback.referral.ref != "OpvoteFlow") {
                      db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.postback.referral.ref}});
                    }
                    db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.postback.referral.ref}});
                    messaging.postback.payload = JSON.stringify({type: "app_vote", app_id: messaging.postback.referral.ref});
                  }
                }
              }
              routes.menuHandler(messaging, messaging.postback.payload, messaging.user);
              console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
            });
            /*contextHandler.moveToPhase2(sender).then(() => {
            if (messaging.postback.payload) {
            routes.menuHandler(messaging, messaging.postback.payload, messaging.user);
          }
          // TODO: We should also change the fact that the user is handovered here.
          console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
        });*/
      }
    } else if (messaging.user['398302793580810_1504147086329703'] && !excluded(messaging.user, messaging)) {
      contextHandler.moveToPhase2(sender).then(() => {
        textHandler(messaging.message, sender, messaging.message.nlp, messaging.user);
        console.log(`User: ${messaging.user.first_name} ${messaging.user.last_name} with the id: ${messaging.user.id} is taken by the Bot!`);
      });
    } else if (messaging.referral) {
      if (messaging.referral.source == "SHORTLINK") {
        if (messaging.referral.ref) {
          contextHandler.moveToPhase2(sender).then(() => {
            if (messaging.referral.ref != "FavoriteGame") {
              db.collection('users').findOneAndUpdate({id: sender}, {$set: {app_id: messaging.referral.ref}});
            }
            routes.menuHandler(messaging, JSON.stringify({type: "app_vote", app_id: messaging.referral.ref}), messaging.user);
          });
        }
      }
    }
  }
});
});
}

function isCustomerService(messaging) {
  if (messaging.message) {
    if (messaging.message.quick_reply) {
      return false;
    }
  }
  if (messaging.user.phase && !excluded(messaging.user, messaging)) {
    // If the user has already been added to the app
    return false;
  } else {
    return true;
  }
}

function excluded(user, messaging) {
  var found =_.find(exlusionList, ['id', user.id]);
  if (found) {
    if (messaging.postback) {
      if (messaging.postback.payload == "marathon" || messaging.postback.title == "Εφαρμογή «Ομάδα Προσφοράς»") {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function isKey(text) {
  text = text.toUpperCase();
  switch(text) {
    case "OK17": return true;
    case "ΟΚ17": return true;
    case "OΚ17": return true;
    case "ΟK17": return true;

    case "\"OK17\"": return true;
    case "\"ΟΚ17\"": return true;
    case "\"OΚ17\"": return true;
    case "\"ΟK17\"": return true;

    case "\"OK17": return true;
    case "\"ΟΚ17": return true;
    case "\"OΚ17": return true;
    case "\"ΟK17": return true;

    case "OK17\"": return true;
    case "ΟΚ17\"": return true;
    case "OΚ17\"": return true;
    case "ΟK17\"": return true;

    // with space
    case "OK 17": return true;
    case "ΟΚ 17": return true;
    case "OΚ 17": return true;
    case "ΟK 17": return true;

    case "\"OK 17\"": return true;
    case "\"ΟΚ 17\"": return true;
    case "\"OΚ 17\"": return true;
    case "\"ΟK 17\"": return true;

    case "\"OK 17": return true;
    case "\"ΟΚ 17": return true;
    case "\"OΚ 17": return true;
    case "\"ΟK 17": return true;

    case "OK 17\"": return true;
    case "ΟΚ 17\"": return true;
    case "OΚ 17\"": return true;
    case "ΟK 17\"": return true;

    // With single quotes
    case "\'\'OK17\'\'": return true;
    case "\'\'ΟΚ17\'\'": return true;
    case "\'\'OΚ17\'\'": return true;
    case "\'\'ΟK17\'\'": return true;

    case "\'\'OK17": return true;
    case "\'\'ΟΚ17": return true;
    case "\'\'OΚ17": return true;
    case "\'\'ΟK17": return true;

    case "OK17\'\'": return true;
    case "ΟΚ17\'\'": return true;
    case "OΚ17\'\'": return true;
    case "ΟK17\'\'": return true;

    // with space

    case "\'\'OK 17\'\'": return true;
    case "\'\'ΟΚ 17\'\'": return true;
    case "\'\'OΚ 17\'\'": return true;
    case "\'\'ΟK 17\'\'": return true;

    case "\'\'OK 17": return true;
    case "\'\'ΟΚ 17": return true;
    case "\'\'OΚ 17": return true;
    case "\'\'ΟK 17": return true;

    case "OK 17\'\'": return true;
    case "ΟΚ 17\'\'": return true;
    case "OΚ 17\'\'": return true;
    case "ΟK 17\'\'": return true;
    default: return false;
  }
}
