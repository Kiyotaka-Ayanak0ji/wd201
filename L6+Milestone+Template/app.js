const {request,response} = require('express')
const express = require('express')
const app = express()
const { Todo } = require('./models')
const bodyParser = require('body-parser')
app.use(bodyParser.json());

app.get("/todos", async (request,response) => {
    const todosItems = await Todo.gettodo();
    response.send(todosItems);
});

app.post("/todos", async (request,response) => {
    console.log("Creating a todo",request.body);
    //Todo
    try{    
        const todo = await Todo.addTodo({title: request.body.title , dueDate: request.body.dueDate , completed: request.body.completed});
        return response.json(todo);
    }
    catch(error){
        console.log(error);
        return response.status(442).json(error);
    }
});

//PUT localhost:3000/todos/:id/markAsCompleted as completed
app.put("/todos/:id/markAsCompleted" , async (request,response) => {
    console.log("We have to update a todo with ID" , request.params.id);
    const todo = await Todo.findByPk(request.params.id);
    try{    
        const updatedTodo = await todo.markAsCompleted();
        return response.json(updatedTodo);
    }
    catch(error){
        console.log(error);
        return response.status(442).json(error);
    }
});

app.delete("/todos/:id" , async (request,response) => {
    console.log("Delete a todo by ID:", request.params.id);
    const todo = await Todo.findByPk(request.params.id);

    if(todo != null){    
        try{    
            await Todo.deleteByID();
            response.send(true);
        }
        catch(error){
            console.log(error);
            return response.status(442).json(error);
        }
    }
    else{
        response.send(false);
    }
});

module.exports = app;