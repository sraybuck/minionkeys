//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

//Load mysql module
var mysql = require('mysql'); 

//Load filesystem module
var fs = require('fs');

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//get mySQL connection info from json file
configPath = './config.json';
var config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

//set mysql host, creds and db
var con = mysql.createConnection({
  host: config.HOST,
  user: config.user,
  password: config.pass,
  database: config.database
});

//establish connection
con.connect(function(err){
  if(err) throw err;
  //query
  con.query("SELECT email, expiration from users", function (err, result, fields){
    if(err) throw err;
    //print result
    console.log(result);
  })
})