//request module
const request = require('request-promise');

//Load mysql module
var mysql = require('mysql');

//Load filesystem module
var fs = require('fs');

//load axios module
const axios = require('axios')

async function keycloak() {
    function btoa(s) {
        return Buffer.from(s, 'utf8').toString('base64')
    }
    function auth(username, password) {
        return 'Basic ' + btoa(username + ':' + password)
    }

    configPath = './config.json';
    var config = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

    const accessData = await request({
        method: 'POST',
        uri: config.keycloak.accessTokenUri,
        headers: {
            'Accept': 'application/json, application/x-www-form-urlencoded',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': auth(config.keycloak.clientId, config.keycloak.clientSecret)
        },
        form: {
            grant_type: 'client_credentials',
        }
    })
    
    const accessParsed = JSON.parse(accessData)
    const access_token = accessParsed.access_token
    
    var representation1 = await axios(
        {method: 'get',
        url: 'http://localhost:8080/auth/admin/realms/master/users/?email=test1',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        json: true
    })

    console.log(representation1.data)
    var rep = representation1.data[0];
    rep.enabled = false;

    const update = await axios({
        method: "PUT",
        url: "http://localhost:8080/auth/admin/realms/master/users/" + rep.id,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        data: rep,
        json: true
      })
}
keycloak();