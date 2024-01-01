const express = require("express");
const app = express();
var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shhh! Some Secret String"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));

//Set view Engine as EJS
app.set("view engine", "ejs");

app.get("/", async (request, response) => {
  const Overdue = await Todo.getOverdues();
  const DueToday = await Todo.getDuetoday();
  const dueLater = await Todo.getDueLater();
  const Completed = await Todo.getCompletedTodos();
  if (request.accepts("html")) {
    response.render("index", {
      title: "Todo Application",
      Overdue,
      DueToday,
      dueLater,
      Completed,
      csrfToken: request.csrfToken(),
    });
  } else {
    response.json({
      Overdue,
      DueToday,
      dueLater,
      Completed,
    });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll();
    return response.send(todos);
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

app.post("/todos", async (request, response) => {
  console.log("Creating a todo", request.body);
  //Todo
  try {
    const todo = await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: request.body.completed,
    });
    response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

//PUT localhost:3000/todos/:id/markAsCompleted as completed
app.put("/todos/:id", async (request, response) => {
  console.log("We have to update a todo with ID", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(!todo.completed);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

// //Get todo by ID
// app.get("/todos/:id", async (request, response) => {
//   console.log("We have to get a todo with ID", request.params.id);
//   try {
//     const todo = await Todo.findByPk(request.params.id);
//     return response.json(todo);
//   } catch (error) {
//     console.log(error);
//     return response.status(442).json(error);
//   }
// });

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);

  try {
    await Todo.remove(request.params.id);
    return response.json({ success: "true" });
  } catch (error) {
    console.error(error);
    return response.status(442).json(error);
  }
});

module.exports = app;
