//request module
const request = require('request-promise');

//Load mysql module
var mysql = require('mysql'); 

//Load filesystem module
var fs = require('fs');

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

var test_emails = ["test1@gmail.com","test2@gmail.com","test3@gmail.com","test4@gmail.com","test5@gmail.com",]

//establish connection
function connect(){
  con.connect(function(err){
    if(err) throw err;
    //query
    var data = con.query("SELECT email, expiration from users", function (err, result, fields){
      if(err) throw err;
      return result;
    })
  })
}

function btoa(s) {
  return Buffer.from(s, 'utf8').toString('base64')
}
 
function auth(username, password) {
  return 'Basic ' + btoa(username + ':' + password)
}

async function main() {
  const accessData = await request({ 
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
  const accessParsed = JSON.parse(accessData)
  const access_token = accessParsed.access_token

    //get id from 
    var userData = await request({
      method: 'GET',
      uri: "http://localhost:8080/auth/admin/realms/master/users?email=tfadhakdsl",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      },
      json: true
    })
    console.log(userData)
    userData=userData[9000];
    console.log(userData);

    /*
    const representation = await request({
      method: "GET",
      uri: "http://localhost:8080/auth/admin/realms/master/users/92ba2261-4853-4170-a5ad-eef46553b921",
      headers: {
       'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${access_token}`
       }
    })
    
    var repParsed = JSON.parse(representation);
    repParsed.enabled = false;
    var repString = toString(repParsed);

    const update = await request({
      method: "PUT",
      uri: "http://localhost:8080/auth/admin/realms/master/users/92ba2261-4853-4170-a5ad-eef46553b921",
      headers: {
       'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${access_token}`
       },
       body : repString
    })
  */
}
main()