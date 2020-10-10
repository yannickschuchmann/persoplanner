import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Auth from "./screens/Auth";
import { auth, db } from "./services/firebase";
import { BrowserRouter as Router } from "react-router-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const App = () => {
  const [isSignedIn, setSignedIn] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(async function (user) {
      if (user) {
        const doc = await db.collection("users").doc(user.uid).get();
        if (!doc || !doc.exists) {
          await doc.ref.set(
            {
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      }
      setSignedIn(!!user);
    });
  });
  return isSignedIn === null ? null : isSignedIn ? <Layout /> : <Auth />;
};

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

const AppWithRouter = () => (
  <>
    <Router>
      <ThemeProvider theme={darkTheme}>
        <App />
      </ThemeProvider>
    </Router>
  </>
);

export default AppWithRouter;
