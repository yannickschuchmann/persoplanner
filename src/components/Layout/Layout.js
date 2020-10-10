import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";

import { makeStyles } from "@material-ui/core/styles";
import { Route, Switch } from "react-router-dom";
import Main from "../../screens/Main";
import { auth } from "../../services/firebase";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  content: {
    flexGrow: 1,
    // padding: theme.spacing(3),
  },
}));

const Layout = () => {
  const classes = useStyles();
  window.Trello.authorize({
    type: "redirect",
    name: "PersoPlanner",
    scope: {
      read: "true",
      write: "false",
    },
    expiration: "never",
  });

  const onSignOut = async () => {
    await auth.signOut();
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <main className={classes.content}>
        <Switch>
          <Route path="/">
            <Main />
          </Route>
        </Switch>
      </main>
    </div>
  );
};

export default Layout;
