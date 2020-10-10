import React, { useEffect, useRef } from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { filter, propEq } from "ramda";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Isotope from "isotope-layout";
import "isotope-packery";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  boxS: {
    width: "33.33%",
    minHeight: "10vh",
    display: "flex",
  },
  boxM: {
    width: "33.33%",
    minHeight: "30vh",
    display: "flex",
  },
  boxL: {
    width: "33.33%",
    minHeight: "50vh",
    display: "flex",
  },
  paper: {
    padding: theme.spacing(1),
    wordBreak: "break-word",
    width: "100%",
    position: "relative",
  },
}));

const Card = ({ name, size, color, onDone, done, selected = false }) => {
  const classes = useStyles();
  let className;
  switch (size) {
    case 0:
      className = classes.boxS;
      break;
    case 1:
      className = classes.boxM;
      break;
    case 2:
      className = classes.boxL;
      break;

    default:
      break;
  }
  return (
    <Grid className={`grid-item ${className}`} data-done={done} item>
      <Paper
        style={{
          background: color,
          // TODO: move to classNames
          ...(done
            ? {
                filter: "grayscale(100%)",
                opacity: 0.5,
              }
            : {}),
        }}
        onClick={onDone}
        className={classes.paper}
      >
        {name}
      </Paper>
    </Grid>
  );
};

export const Selection = ({ cards, onDone, onArchive }) => {
  const el = useRef();
  const classes = useStyles();
  useEffect(() => {
    const iso = new Isotope(el.current, {
      percentPosition: true,
      sortAscending: false,
      getSortData: {
        done: "[data-done]",
      },
      packery: { columnWidth: ".grid-sizer" },
      layoutMode: "packery",
      itemSelector: ".grid-item",
    });
    iso.arrange({ sortBy: "done" });
  }, [cards]);

  const doneCards = filter(propEq("done", true), cards || []);
  const onClick = (card) => () => {
    onDone(card.id, !card.done);
  };

  return (
    <Box mb={4}>
      <Grid ref={el} container justify="center" spacing={2}>
        <Grid item className={`grid-sizer ${classes.boxS}`}></Grid>
        {cards &&
          cards.map((card, idx) => (
            <Card key={idx} onDone={onClick(card)} {...card} />
          ))}
      </Grid>
      {doneCards.length > 0 && (
        <Box mt={5}>
          <Grid container justify="center">
            <Grid item>
              <Button
                onClick={() => onArchive(doneCards)}
                variant="outlined"
                color="info"
              >
                Archive done tasks
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Selection;
