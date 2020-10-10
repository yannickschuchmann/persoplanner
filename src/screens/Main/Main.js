import React, { useEffect, useState } from "react";
import TodoLists from "../../components/TodoLists";
import Selection from "../../components/Selection";
import { auth, db } from "../../services/firebase";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import { compose, filter, map, reject, isNil, propEq } from "ramda";

const useStyles = makeStyles((theme) => ({
  selection: {
    height: "calc(100vh - 75px)",
    width: "100%",
    padding: theme.spacing(2),
    position: "fixed",
    zIndex: 1,
    overflowY: "scroll",
  },
  todoLists: {
    background: theme.palette.background.default,
    height: "calc(80vh)",
    position: "relative",
    zIndex: 2,
    top: "calc(100vh - 75px)",
  },
}));

export const Main = () => {
  const user = auth.currentUser;
  const classes = useStyles();
  const [lists, setLists] = useState();
  const [selectedCards, setSelectedCards] = useState();

  useEffect(() => {
    const extractData = map((doc) => doc.data());
    const filterSelected = filter(propEq("selected", true));
    const unsubscribeLists = db
      .collection("users")
      .doc(user.uid)
      .collection("lists")
      .onSnapshot((collection) => {
        setLists(extractData(collection.docs));
      });

    const unsubscribeSelectedCards = db
      .collection("users")
      .doc(user.uid)
      .collection("cards")
      .where("archived", "==", false)
      .onSnapshot((collection) => {
        setSelectedCards(compose(filterSelected, extractData)(collection.docs));
      });

    return () => {
      unsubscribeLists();
      unsubscribeSelectedCards();
    };
  }, [user]);

  const onCardSelect = async ({
    id,
    size,
    color,
    name,
    selected,
    archived,
    done,
  }) => {
    await db
      .collection("users")
      .doc(user.uid)
      .collection("cards")
      .doc(id)
      .set(
        reject(isNil, {
          id,
          name,
          color,
          size,
          selected,
          done,
          archived,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
  };

  const onArchive = async (doneCards) => {
    const batch = db.batch();

    doneCards.forEach((card) => {
      const ref = db
        .collection("users")
        .doc(user.uid)
        .collection("cards")
        .doc(card.id);

      batch.update(ref, { archived: true });
    });
    await batch.commit();
  };

  const onDone = async (id, done) => {
    await db.collection("users").doc(user.uid).collection("cards").doc(id).set(
      {
        done,
      },
      { merge: true }
    );
  };

  return (
    <>
      <div className={classes.selection}>
        <Selection
          onArchive={onArchive}
          onDone={onDone}
          cards={selectedCards}
        />
      </div>
      <Box boxShadow={3} className={classes.todoLists}>
        <TodoLists
          selectedCards={selectedCards}
          onSelect={onCardSelect}
          lists={lists}
        />
      </Box>
    </>
  );
};

export default Main;
