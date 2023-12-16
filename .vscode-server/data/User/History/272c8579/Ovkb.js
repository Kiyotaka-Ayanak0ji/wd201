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

fs.readFile("project.html", (err, project) => {
    if (err) {
        throw err;
    }
    projectContent = project;
});

