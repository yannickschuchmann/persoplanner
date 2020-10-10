import React, { useRef } from "react";
import { start } from "../../services/auth";
import { useLocation, useHistory } from "react-router-dom";
import { useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";

export const Auth = () => {
  const location = useLocation();
  const history = useHistory();
  const ref = useRef();
  const onStart = () => {
    start({ elSelector: `#${ref.current.id}`, onSuccess, onLoad });
  };

  useEffect(() => {
    if (ref.current) {
      onStart();
    }
  }, [ref, onStart]);

  const onSuccess = function (authResult, redirectUrl) {
    const { from } = location.state || {};
    history.push(from || "/");
    return false;
  };
  const onLoad = function () {};
  return (
    <Grid container justify="center">
      <Grid item xs={12}>
        <Box
          display="flex"
          style={{ height: "100vh" }}
          justifyContent="center"
          alignItems="center"
        >
          <div ref={ref} id="auth-container"></div>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Auth;
