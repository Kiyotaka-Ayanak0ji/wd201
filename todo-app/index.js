const express = require('express')
const app = express()

app.listen(3000, () => {
    console.log("The server has started at port 3000!");
});

app.get("/",(request,response) => {
    response.send("Hello World");
});

app.get("/todos", (request,response) => {
    response.send("hello World");
    console.log("Todo List");
});

app.post("/todos", (request,response) => {
    console.log("Creating a todo",request.body);
});

app.post("/todos/:id/markAsCompleted" , (request,response) => {
    console.log("We have to update a todo with ID" , request.params.id);
});

app.delete("/todos/:id" , (request,response) => {
    console.log("Delete a todo by ID:", request.params.id);
});
