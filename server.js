//Load HTTP module
const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

//request module
const request = require('request-promise');

//load axios
const axios = require('axios');

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
  host: config.mysql.HOST,
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.database
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

function btoa(s) {
  return Buffer.from(s, 'utf8').toString('base64')
}
 
function auth(username, password) {
  return 'Basic ' + btoa(username + ':' + password)
}
request({ // Client credentials grant to get access_token
  method: 'POST',
  uri: config.keycloak.auth.accessTokenUri,
  headers: {
    'Accept': 'application/json, application/x-www-form-urlencoded',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': auth(config.keycloak.auth.clientId, config.keycloak.auth.clientSecret)
  },
  form: {
    grant_type: 'client_credentials',
  }
})
.then(JSON.parse)
.then(data => data.access_token) // access_token, refresh_token, expires_in, refresh_expires_in
.then(access_token => request({ // call to keycloak API using access token
  method: 'GET',
  uri: "https://localhost:8080/auth/realms/test/users",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: {
    "appId": appId, // valid appIds: eipplus-dev, eipplus-onboard, eipplus
    "email": email // user email
  },
  json: true,
}))

