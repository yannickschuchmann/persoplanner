import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyC_1NYgoy4_1IyRU8GE8DfplxyvzOsRHYc",
  authDomain: "persoplan.firebaseapp.com",
  projectId: "persoplan",
};

firebase.initializeApp(config);

export const auth = firebase.auth();
export const ui = new firebaseui.auth.AuthUI(firebase.auth());
export const db = firebase.firestore();

if (window.location.hostname === "localhost") {
  db.settings({
    host: "localhost:8080",
    ssl: false,
  });
}

db.enablePersistence().catch(function (err) {
  if (err.code === "failed-precondition") {
    alert(
      "To use offline access, make sure you have only 1 tab of this app open."
    );
  } else if (err.code === "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    // ...
  }
});
// Subsequent queries will use persistence, if it was enabled successfully
