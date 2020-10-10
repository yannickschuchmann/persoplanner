import { ui } from "./firebase";

import firebase from "firebase/app";

const uiConfig = {
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: "popup",
  // signInSuccessUrl: "<url-to-redirect-to-on-success>",
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false,
    },
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // TODO: Terms of service url.
  // tosUrl: "<your-tos-url>",
  // TODO: Privacy policy url.
  // privacyPolicyUrl: "<your-privacy-policy-url>",
};

export const start = ({ elSelector, onSuccess, onLoad }) => {
  ui.start(elSelector, {
    ...uiConfig,
    callbacks: {
      signInSuccessWithAuthResult: onSuccess,
      uiShown: onLoad,
    },
  });
};
