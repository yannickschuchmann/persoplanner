import React, { useEffect, useState } from "react";
import {
  compose,
  flatten,
  filter,
  find,
  map,
  includes,
  prop,
  propEq,
} from "ramda";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Tabs from "@material-ui/core/Tabs";
import AppBar from "@material-ui/core/AppBar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { makeStyles } from "@material-ui/core/styles";

const onError = (e) => alert(e);
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    boxShadow: theme.shadows[1],
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wrapped-tabpanel-${index}`}
      aria-labelledby={`wrapped-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={0}>{children}</Box>}
    </div>
  );
}

const TodoList = ({ onSelect, name, color, cards = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCard, setCurrentCard] = useState(null);

  const handleClick = (card) => (event) => {
    if (Boolean(card.selected)) {
      onSelect({ ...card, color, selected: false });
    } else {
      setCurrentCard(card);
      setAnchorEl(event.currentTarget);
    }
  };
  const handleClose = () => {
    setCurrentCard(null);
    setAnchorEl(null);
  };
  const handleSize = (size) => () => {
    onSelect({ ...currentCard, color, selected: true, size });
    setCurrentCard(null);
    setAnchorEl(null);
  };

  return (
    <>
      <List component="nav" aria-label={name}>
        {cards.map((card, index) => (
          <ListItem
            dense
            selected={card.selected}
            key={index}
            button
            onClick={handleClick(card)}
          >
            <ListItemText primary={card.name} />
          </ListItem>
        ))}
      </List>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleSize(0)}>S</MenuItem>
        <MenuItem onClick={handleSize(1)}>M</MenuItem>
        <MenuItem onClick={handleSize(2)}>L</MenuItem>
      </Menu>
    </>
  );
};
function a11yProps(index) {
  return {
    id: `todoliost-${index}`,
    "aria-controls": `todoliost-${index}`,
  };
}

export const TodoLists = ({ lists = [], selectedCards = [], onSelect }) => {
  const classes = useStyles();
  const [data, setData] = useState(null);
  useEffect(() => {
    lists.forEach(async (list) => {
      const cardsPerBoard = await Promise.all(
        map(async ({ id, listId, memberId }) => {
          let cards = await (listId
            ? window.Trello.get(`lists/${listId}/cards`, {})
            : window.Trello.get(`boards/${id}/cards`, {}));

          if (memberId) {
            cards = filter(
              compose(includes(memberId), prop("idMembers")),
              cards
            );
          }

          return cards;
        }, list.boards)
      );

      const cards = compose(
        map((card) => {
          const selectedCard = find(propEq("id", card.id), selectedCards) || {};
          return {
            ...card,
            selected: Boolean(selectedCard.selected),
            done: Boolean(selectedCard.done),
            archived: Boolean(selectedCard.archived),
          };
        }),
        flatten
      )(cardsPerBoard);

      setData((data) => ({
        ...data,
        [list.name]: {
          ...list,
          cards,
        },
      }));
    });
  }, [lists, selectedCards]);

  const [tabIndex, setTabIndex] = useState(0);

  const onTabsChange = (_, newTabIndex) => {
    setTabIndex(newTabIndex);
  };
  return (
    <div>
      <div className={classes.root}>
        <AppBar
          className={classes.appBar}
          color="transparent"
          position="static"
        >
          <Tabs
            value={tabIndex}
            onChange={onTabsChange}
            aria-label="Todo Lists"
          >
            {data &&
              Object.values(data).map(({ name, color, cards }, index) => (
                <Tab
                  style={{ background: color }}
                  key={index}
                  value={index}
                  label={name}
                  wrapped
                  {...a11yProps(index)}
                />
              ))}
          </Tabs>
        </AppBar>
        {data &&
          Object.values(data).map((list, index) => (
            <TabPanel value={index} index={index} key={index}>
              <TodoList onSelect={onSelect} {...list} />
            </TabPanel>
          ))}
      </div>
    </div>
  );
};

export default TodoLists;
