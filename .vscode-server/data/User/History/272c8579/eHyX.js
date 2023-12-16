const http = require("http");
const fs  = require("fs");

const server = http.createServer((req,res) => {
    const stream = fs.createReadStream("sample.txt");
    stream.pipe(res);
    
    // fs.readFile("sample.txt",(err,data) => {
    //     res.end(data);
    // })
});

//Listening by the server
server.listen(3000);