const functions = require("firebase-functions");

// دالة بسيطة ترجع Hello
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});
