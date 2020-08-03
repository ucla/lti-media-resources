# UCLA notes

## Set up LTI tool

1. Startup your local Moodle on Docker
2. Go to Site administration > Plugins > Activity modules > External tool > Manage tools
3. Click on configure a tool manually
4. Enter in the following:

   Tool name: <Anything>
   Tool URL: http://localhost:8080
   LTI version: LTI 1.3
   Public key type: RSA key
   Initiate login URL: http://localhost:8080/login
   Redirection URI(s): http://localhost:8080

   Services:

   IMS LTI Assignment and Grade Services: Use this service for grade sync and column management
   IMS LTI Names and Role Provisioning: Use this service to retrieve members' information as per privacy settings
   Tool Settings: Use this service

   Privacy:

   Share launcher's name with tool: Always
   Share launcher's email with tool: Always
   Accept grades from the tool: Always

5. Click "Save changes"
6. Then under "Tools" find LTI app you just created and click on the "View configurations" icon (first icon, next to gear)
7. Copy Client ID value into PLATFORM_CLIENTID value in .env file (created below in "Startup app" Step 1).

## Install MongoDB

1. Install MongoDB: https://docs.mongodb.com/manual/administration/install-community/
2. Helpful to install MongoDB Compass to ensure your database is running correctly: https://www.mongodb.com/try/download/compass
3. Follow guide below for "Setting up MongoDB for development".

## Startup app

1. Copy .env-dist to .env
2. Set LTI_KEY to any random string, and DB_DATABASE to whatever you'd like
3. Comment out DEBUG if you do not want to see the LTI provider debugging messages
4. Start app:

   yarn
   yarn dev

5. On initial load the app will display the public key
6. Copy the key, and remember to remove the '[0] ' characters from the start of each row of the key, and include the BEGIN/END PUBLIC KEY lines

## Add public key to LTI tool

1. Go back to Manage Tools section on local CCLE (Site administration > Plugins > Activity modules > External tool > Manage tools)
2. Under Tools, find your LTI tool and click the gear icon
3. Paste your key into the Public key field
4. Click "Save changes"

## Mongo Migration
1. If you don't have migrate-mongo package installed globally, run `npm install -g migrate-mongo`
2. Inside project directory, run `migrate-mongo up`
3. To revert any changes, run `migrate-mongo down`
4. To create or modify migration script, see documentations at https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script

## Test it out

1. Go to a course site
2. Turn editing on and click "Add activity or resource", choose External tool, enter any name, choose your LTI tool from Preconfigured tool, and then click "Save changes"
3. You should see your tool embedded in the site and the app should load up

## Setting up MongoDB for development

### Why

In order to use [MongoDB transactions](https://www.mongodb.com/transactions), we need to configure our local MongoDB development instance with a replica set.

### How

You should only need to do this configuration once. (The following steps were tested on macOS Catalina 10.15.6.)

1. Make sure MongoDB isn't currently running

2. Start MongoDB by running `mongod --port 27017 --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --replSet rs0 --bind_ip localhost`

   - The paths for `--dbpath` and `--logpath` might vary depending your system
      - Look for the paths in the [MongoDB configuration file](https://docs.mongodb.com/manual/reference/configuration-options/#configuration-file)
   - The `--dbpath` must be specified as such on Catalina or newer because Catalina has made the root volume read-only, so the default `/data/db` path does not work
   - The argument after `--replSet` should match the `DB_REPLSET` .env variable

3. Enter the MongoDB shell by running `mongo`
   1. Inside the mongo shell, run `rs.initiate()` to create a replica set
   2. Verify that there is a replica set by running `rs.status()`. Running `rs.status().set` gives you the name of the replica set

### References

- [MongoDB Replication Sets - BogoToBogo](https://www.bogotobogo.com/DevOps/MongoDB/MongoDB_Replication_Replica_Set.php)
- [Configuration File Options - MongoDB Docs](https://docs.mongodb.com/manual/reference/configuration-options/)
- [Convert Standalone to Replica Set - MongoDB Docs](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)
- Stack Overflow
  - [stackoverflow.com/questions/51087833/how-to-find-the-replica-set-name](https://stackoverflow.com/questions/51087833/how-to-find-the-replica-set-name)
  - [stackoverflow.com/questions/58589631/mongoerror-this-mongodb-deployment-does-not-support-retryable-writes-please-ad](https://stackoverflow.com/questions/58589631/mongoerror-this-mongodb-deployment-does-not-support-retryable-writes-please-ad)
