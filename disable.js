//Load filesystem lib
var fs = require('fs');

//load axios lib
const axios = require('axios')

//load query string lib
const qs = require('qs');

//get mysql connection info from json file
configPath = './config.json';
var config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

//load knex module and connection info
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: config.mysql.HOST,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
  }
});

//get auth token
async function getKey() {
  function btoa(s) {
    return Buffer.from(s, 'utf8').toString('base64')
  }
  function auth(username, password) {
    return 'Basic ' + btoa(username + ':' + password)
  }

  //get configuration info
  configPath = './config.json';
  var config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

  //call api for token
  const accessData = await axios({
    method: 'post',
    url: config.keycloak.accessTokenUri,
    headers: {
      'Accept': 'application/json, application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': auth(config.keycloak.clientId, config.keycloak.clientSecret)
    },
    data: qs.stringify({ grant_type: 'client_credentials' })
  })
  const access_token = accessData.data.access_token

  return access_token;
}

//search for users with email and disable them
async function disable(email, access) {
  //find user by email
  var rep = await axios({
    method: 'GET',
    url: "http://localhost:8080/auth/admin/realms/master/users/?email=" + email,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access}`
    },
    json: true
  })

  //check for correct number of accounts
  if (rep.data.length == 0) {
    console.log("No results found")
  } else if (rep.data.length > 1) {
    console.log("Multiple users match the email '" + email + "'")
  } else {
    //check that result is defined
    if (rep.data[0] == null) {
      console.log("Result is undefined")
    } else {
      //update user data to disable user
      var representation = rep.data[0];
      representation.enabled = false;

      //update user with new data
      const update = await axios({
        method: "PUT",
        url: "http://localhost:8080/auth/admin/realms/master/users/" + representation.id,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access}`
        },
        data: representation,
        json: true
      })
    }
  }
}
async function main(){
  //get current date and time
  var datetime = new Date();
  //get all user emails
  var data = await knex.select('email', 'expiration').from('users')
  .then((rows) => { return rows })
  //get access token
  var access = await getKey();
  //iterate through emails and disable users who match
  for (i = 0; i < data.length; i++) {
    if(data[i].expiration < datetime){
      disable(data[i].email, access);
    }
  }
}
main();