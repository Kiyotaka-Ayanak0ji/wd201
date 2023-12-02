const express = require("express")
const app = express()

app.get("/", (request,response) => {
    response.send("hello World");
});

app.listen(3000, () => {
    console.log("The server has started at port 3000!");
})