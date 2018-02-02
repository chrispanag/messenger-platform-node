/*
This module supposes that the users are stored inside a MongoDB collection with this form:
  user: {
    id: facebook_id,
    subscribed: bool
  }
 */
const _ = require('lodash');

const facebook = require('./fbFunctions.js')(FB_PAGE_TOKEN, FB_APP_SECRET);

const DELAY = 1000; // Delay in milliseconds

module.exports = (collection) => {

  const subscription = (id, set) => {
    return global.db.collection(collection).updateOne({id: id}, {$set:{subscribed: set}});
  };

  function subscriptionSend (id, options) {
    return facebook.fbMessage(id, options).then(() => {
      console.log("Sent to " + id);
    }).catch(error => {
      // Unsubscribe the user if he has deleted his thread or banned the bot from sending msgs
      if ((error.code == 10 && error.error_subcode == 2018108) || (error.code == 200 && error.error_subcode == 1545041)) {
        console.log("User " + id + ": Blocked the bot or deleted the conversation");
        subscription(id, false);
      } else {
        throw new Error("Error sending to " + id + ": " + error.message);
      }
    });
  }

  function sendChunk (chunkedProfiles, msg, quickreplies, attachment) {
    console.log(this.depth);
    _.forEach(chunkedProfiles[this.depth], profile => {
      subscriptionSend(profile.id, msg, quickreplies, attachment);
    });
  }

  // Recursive function with a prespecified delay between each recursion
  // (NOTE TO SELF: WTF did I do?)
  function recTimeout (depth, callback, funArgs) {
    if (depth < 1) {
      return Promise.resolve();
    } else {
      var i = {depth: depth - 1};
      callback.apply(i, funArgs);
      return setTimeout(recTimeout, (depth-1) * DELAY, depth-1, callback, funArgs);
    }
  }

  var module = {};

  // Checks if this user exists and if not it adds him a the database. If the user existed, it returns false.
  module.newUser = (recipientId) => {
    return global.db.collection(collection).findOne({id: recipientId}).then(user => {
      if (!user) {
        return facebook.getUserData(recipientId).then(data => {
          _.set(data, 'id', recipientId);
          _.set(data, 'subscribed', false);
          return global.db.collection(collection).insertOne(data).then(() => {
            return false;
          });
        });
      } else {
        return subscription(recipientId, false);
      }
    });

  };

  /*
    Send to a collection of users that are subscribed (subscribed == True)
   */
  module.sendToSubscribers = (msg, quickreplies, attachment) => {
    // Retrieve subscribed user profiles
    return global.db.collection(collection).find({"subscribed": true}).toArray().then(profiles => {
      var chunkedProfiles = _.chunk(profiles, 80); // Split the messages in chunks of 80
      return recTimeout(chunkedProfiles.length, sendChunk, [chunkedProfiles, msg, quickreplies, attachment]);
    });
  };


  /*
    Returns a promise with the state of the user subscription or returns a rejection if the user doesn't exist
   */
  module.isSubscribed = (recipientId) => {
    return global.db.collection(collection).findOne({id: recipientId}).then(user => {
      if (user) {
        return Promise.resolve(!user.subscribed);
      } else {
        console.log("Issue! User " + recipientId + " was not found");
        return Promise.reject(404);
      }
    });
  };

  module.subscription = subscription;


  return module;
};
