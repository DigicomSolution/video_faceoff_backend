var admin = require("firebase-admin");
var serviceAccount;
if (process.env.NODE_ENV === "development") {
  serviceAccount = require("/home/headerlabs/Documents/workspace/headerlabs/ipomea-backend/iside-ac589-firebase-adminsdk-rqs1w-b4baa64e53.json");
} else if (process.env.NODE_ENV === "staging") {
  serviceAccount = require("/home/deploy/iside-backend/shared/iside-ac589-firebase-adminsdk-rqs1w-b4baa64e53.json");
}
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

function sendMessageToUser({ registrationToken, msgBody, notificationType }) {
  var message = {
    notification: {
      title: "Face Off",
      body: msgBody,
    },
    data: {
      type: notificationType,
    },
    android: {
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
    token: registrationToken,
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      console.log("Error sending message:", error);
    });
}

module.exports = {
  sendMessageToUser,
};
