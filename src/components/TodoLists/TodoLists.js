import React, { useEffect, useRef, useState } from "react";
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
import AddIcon from "@material-ui/icons/Add";
import Form from "./TodoListForm";
import { makeStyles } from "@material-ui/core/styles";

const onError = (e) => alert(e);
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
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

export const TodoLists = ({
  onTodoListSubmit,
  lists = [],
  selectedCards = [],
  onSelect,
}) => {
  const classes = useStyles();
  const ref = useRef();
  const [data, setData] = useState(null);
  const [tabIndex, setTabIndex] = useState(1);
  const dataAsList = data ? Object.values(data) : [];
  const formPanelIndex = dataAsList.length;

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

  const onTabsChange = (_, newTabIndex) => {
    setTabIndex(newTabIndex);
  };

  const onSubmit = async (values) => {
    await onTodoListSubmit(values);
  };

  return (
    <div>
      <div ref={ref} className={classes.root}>
        <AppBar
          className={classes.appBar}
          color="transparent"
          position="static"
        >
          <Tabs
            value={tabIndex}
            variant="scrollable"
            onChange={onTabsChange}
            aria-label="Todo Lists"
          >
            {data &&
              dataAsList.map(({ name, color, cards }, index) => (
                <Tab
                  style={{ background: color }}
                  key={index}
                  value={index}
                  label={name}
                  wrapped
                  {...a11yProps(index)}
                />
              ))}
            <Tab
              value={formPanelIndex}
              icon={<AddIcon />}
              onClick={() => {
                ref.current.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </Tabs>
        </AppBar>
        {data &&
          dataAsList.map((list, index) => (
            <TabPanel value={index} index={tabIndex} key={index}>
              <TodoList onSelect={onSelect} {...list} />
            </TabPanel>
          ))}
        <TabPanel value={formPanelIndex} index={tabIndex}>
          <Form onSubmit={onTodoListSubmit} />
        </TabPanel>
      </div>
    </div>
  );
};

export default TodoLists;
