# Minionkeys: A Keycloak and MySQL integration
Overview: Minionkeys is a node app that queries a mysql database with user information (called minion internally) and disables expired users on keycloak. This is intended to be run as a docker container with the following environment variables: 
MYSQL_QUERY= this is a string that contains three words separated by commas, the first is the column on the user table of whatever stores usernames or emails, the second is whatever column on the user table stores expiration dates and the third is the table that stores the users. For example, the default looks like "email,expiration,users". This will be split into an array within the docker container and used for a database query. 
MYSQL_HOST= host mysql is running on, usually `host.docker.internal`
MYSQL_USER= username for mysql
MYSQL_PASS= password for mysql user
MYSQL_DATABASE= mysql database with user information
KEYCLOAK_HOST= host of the keycloak container or installation, default is `localhost:8080` but typically changed to `host.docker.internal:8080`
KEYCLOAK_CLIENT_ID= ID for the keycloak client set up to be used by minionkeys
KEYCLOAK_CLIENT_SECRET= secret for the keycloak client set up to be used by minionkeys

