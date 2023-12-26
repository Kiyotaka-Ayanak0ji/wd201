const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const path = require("path");
app.use(bodyParser.json());

//Set view Engine as EJS
app.set("view engine","ejs");

app.get("/", async (request,response) => {
  const Overdue = await Todo.getOverdues();
  const DueToday = await Todo.getDuetoday();
  const dueLater = await Todo.getDueLater();
  if(request.accepts("html")){
    response.render('index', {
      Overdue,DueToday,dueLater
    });
  }
  else{
    response.json({
      Overdue,DueToday,dueLater
    });
  }

});

app.use(express.static(path.join(__dirname,'public')));

app.get("/todos", async (request, response) => {
  const todos = await Todo.getTodos();
  return response.json(todos);
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
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

//PUT localhost:3000/todos/:id/markAsCompleted as completed
app.put("/todos/:id/markAsCompleted", async (request, response) => {
  console.log("We have to update a todo with ID", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(442).json(error);
  }
});

app.delete("/todos/:id", async (request, response) => {
  console.log("Delete a todo by ID:", request.params.id);

  try {
    const deletedItem = await Todo.destroy({
      where: {
        id: request.params.id
      }
    });
    response.send(deletedItem ? true : false);
  } 
  catch(error){
    console.error(error);
    return response.status(442).json(error);
  }
});

module.exports = app;
