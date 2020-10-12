import React, { useState, useEffect } from "react";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import InputBase from "@material-ui/core/InputBase";
import { LinearProgress } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Cancel";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    boxShadow: theme.shadows[1],
  },
  color: {
    width: "100%",
    border: 0,
    marginTop: 8,
    height: 30,
  },
}));

const newList = {
  name: "",
  color: "",
  sort: 0,
  boards: [
    {
      id: "",
      listId: null,
      memberIds: [],
      labelIds: [],
    },
  ],
};

const TodoListForm = ({ list = newList, onSubmit }) => {
  const [trelloBoards, setBoards] = useState(null);
  const [trelloLists, setLists] = useState(null);
  const [trelloLabels, setLabels] = useState(null);
  const [trelloMembers, setMembers] = useState(null);
  const classes = useStyles();

  const fetchBoards = async () => {
    const boards = await window.Trello.get(`members/me/boards`, {});
    setBoards(boards);
  };
  const fetchLabels = async (id) => {
    const labels = await window.Trello.get(`boards/${id}/labels`, {});
    setLabels(labels);
  };
  const fetchMembers = async (id) => {
    const members = await window.Trello.get(`boards/${id}/members`, {});
    setMembers(members);
  };
  const fetchLists = async (id) => {
    setLists(null);
    const lists = await window.Trello.get(`boards/${id}/lists`, {});
    setLists(lists);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleBoard = (handleChange) => (e) => {
    handleChange(e);
    const boardId = e.target.value;
    fetchLists(boardId);
    fetchLabels(boardId);
    fetchMembers(boardId);
  };

  const { name, color, sort, boards } = list;
  return (
    <div className={classes.root}>
      <Formik initialValues={{ name, color, sort, boards }} onSubmit={onSubmit}>
        {({
          errors,
          touched,
          isSubmitting,
          values,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box my={2}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.name && touched.name}
                    helperText={errors.name && touched.name && errors.name}
                  />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box my={2}>
                  <InputLabel>Color</InputLabel>
                  <Field type="color" name="color" className={classes.color} />
                  <ErrorMessage name="color" component="div" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box my={2}>
                  <TextField
                    fullWidth
                    label="Sort Position"
                    name="sort"
                    type="number"
                    value={values.sort}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.sort && touched.sort}
                    helperText={errors.sort && touched.sort && errors.sort}
                  />
                </Box>
              </Grid>
              <FieldArray
                name="boards"
                render={(arrayHelpers) => (
                  <Grid item xs={12}>
                    <Box my={2}>
                      {values.boards &&
                        values.boards.map((board, index) => (
                          <Box
                            {...console.log(board, board.memberIds)}
                            position="relative"
                            my={2}
                            key={index}
                          >
                            <Card variant="outlined">
                              <CardContent>
                                <Box
                                  position="absolute"
                                  right={0}
                                  top={0}
                                  p={1}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() => arrayHelpers.remove(index)}
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                </Box>
                                <br />
                                <FormControl
                                  fullWidth
                                  className={classes.formControl}
                                >
                                  <InputLabel id={`board${index}`}>
                                    Trello Board
                                  </InputLabel>
                                  {trelloBoards ? (
                                    <Select
                                      fullWidth
                                      labelId={`board${index}`}
                                      id={`board${index}-select`}
                                      value={board.id}
                                      name={`boards.${index}.id`}
                                      onChange={handleBoard(handleChange)}
                                    >
                                      {trelloBoards.map(({ id, name }) => (
                                        <MenuItem key={id} value={id}>
                                          {name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  ) : (
                                    <InputBase>
                                      <LinearProgress />
                                    </InputBase>
                                  )}
                                </FormControl>
                                {trelloLists && (
                                  <FormControl
                                    fullWidth
                                    className={classes.formControl}
                                  >
                                    <InputLabel id={`board${index}list`}>
                                      Trello List
                                    </InputLabel>
                                    {
                                      <Select
                                        fullWidth
                                        labelId={`board${index}list`}
                                        id={`board${index}-select-list`}
                                        value={board.listId}
                                        name={`boards.${index}.listId`}
                                        onChange={handleChange}
                                      >
                                        <MenuItem value={null}>
                                          All lists
                                        </MenuItem>
                                        {trelloLists.map(({ id, name }) => (
                                          <MenuItem key={id} value={id}>
                                            {name}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    }
                                  </FormControl>
                                )}
                                {trelloLabels && (
                                  <FormControl
                                    fullWidth
                                    className={classes.formControl}
                                  >
                                    <InputLabel id={`board${index}labels`}>
                                      Filter by Labels
                                    </InputLabel>
                                    {
                                      <Select
                                        fullWidth
                                        labelId={`board${index}labels`}
                                        id={`board${index}-select-labels`}
                                        value={board.labelIds}
                                        multiple
                                        name={`boards.${index}.labelIds`}
                                        onChange={handleChange}
                                      >
                                        {trelloLabels.map(({ id, name }) => (
                                          <MenuItem key={id} value={id}>
                                            {name}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    }
                                  </FormControl>
                                )}
                                {trelloMembers && (
                                  <FormControl
                                    fullWidth
                                    className={classes.formControl}
                                  >
                                    <InputLabel id={`board${index}members`}>
                                      Filter by Members
                                    </InputLabel>
                                    {
                                      <Select
                                        fullWidth
                                        labelId={`board${index}members`}
                                        id={`board${index}-select-members`}
                                        value={board.memberIds}
                                        multiple
                                        name={`boards.${index}.memberIds`}
                                        onChange={handleChange}
                                      >
                                        {trelloMembers.map(
                                          ({ id, fullName }) => (
                                            <MenuItem key={id} value={id}>
                                              {fullName}
                                            </MenuItem>
                                          )
                                        )}
                                      </Select>
                                    }
                                  </FormControl>
                                )}
                              </CardContent>
                            </Card>
                          </Box>
                        ))}
                      <Box display="flex" justifyContent="center">
                        <Button
                          startIcon={<AddIcon />}
                          type="button"
                          onClick={() => arrayHelpers.push(newList.boards[0])}
                        >
                          Add another board
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
              />
              <Grid item xs={12}>
                <Box my={2}>
                  <Button
                    onClick={handleSubmit}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TodoListForm;
