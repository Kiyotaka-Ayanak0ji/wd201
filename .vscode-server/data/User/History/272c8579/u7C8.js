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

http
  .createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, { "Content-Type": "text/html" });
    switch (url) {
      case "/project":
        response.write(projectContent);
        response.end();
        break;
      case "/registration":
        response.write();
        response.end();
      default:
        response.write(homeContent);
        response.end();
        break;
    }
  })
  .listen(3000);