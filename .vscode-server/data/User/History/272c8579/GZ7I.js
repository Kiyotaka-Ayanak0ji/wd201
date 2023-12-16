const http = require("http");
const fs  = require("fs");

let homeContent = "";
let projectContent = "";


fs.readFile("home.html", (err, home) => {
    if(err){
        throw err;
    }
    homeContent = home;
});

fs.readFile("home.html", (err, home) => {
    if (err) {
        throw err;
    }
    http.createServer((request, response) => {
        response.writeHeader(200, { "Content-Type": "text/html" });
        response.write(home);
        response.end();
    }).listen(3000);
});