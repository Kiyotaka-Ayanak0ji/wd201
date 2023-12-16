const http = require("http");
const fs  = require("fs");

fs.readFile("home.html", (err, home) => {
    console.log(home.toString());
});

//Listening by the server
server.listen(3000);