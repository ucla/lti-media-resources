# UCLA notes

## Startup app

1. Copy .env-dist to .env
2. Set LTI_KEY to any random string
3. Comment out DEBUG if you do not want to see the LTI provider debugging messages
4. Start app:
   yarn
   yarn dev
5. On initial load the app will display the public key, use it below

## To add sample app on Moodle

1. Go to Site administration > Plugins > Activity modules > External tool > Manage tools
2. Click on configure a tool manually to run on localhost
3. Enter in the following:
   Tool name: <Anything>
   Tool URL: http://localhost:8080
   LTI version: LTI 1.3
   Public key type: RSA key
   Public key: <Copy/paste public key when you lauch LTI app>
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

4. Click "Save changes"
5. Then under "Tools" find LTI app you just created and click on the "View configurations" icon (first icon, next to gear)
6. Set these in your .env file
7. Restart app

## Setting up MongoDB for development

### Why

In order to use [MongoDB transactions](https://www.mongodb.com/transactions), we need to configure our local MongoDB development instance with a replica set.

### How

You should only need to do this configuration once. (The following steps were tested on macOS Catalina 10.15.6.)

1. Make sure MongoDB isn't currently running

2. Start MongoDB by running `mongod --port 27017 --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --replSet rs0 --bind_ip localhost`
    - The paths for `--dbpath` and `--logpath` might vary depending your system (the `--dbpath` might be `/data/db` on other OSes)
    - The `--dbpath` must be specified as such on Catalina or newer because Catalina has made the root volume read-only, so the default `/data/db` path does not work
    - The argument after `--replSet` should match the `DB_REPLSET` .env variable

3. Enter the MongoDB shell by running `mongo`
    1. Inside the mongo shell, run `rs.initiate()` to create a replica set
    2. Verify that there is a replica set by running `rs.status()`. Running `rs.status().set` gives you the name of the replica set

### References
- [MongoDB Replication Sets - BogoToBogo](https://www.bogotobogo.com/DevOps/MongoDB/MongoDB_Replication_Replica_Set.php)
- [Convert Standalone to Replica Set - MongoDB Docs](https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/)
- Stack Overflow
    - [stackoverflow.com/questions/51087833/how-to-find-the-replica-set-name](https://stackoverflow.com/questions/51087833/how-to-find-the-replica-set-name)
    - [stackoverflow.com/questions/58589631/mongoerror-this-mongodb-deployment-does-not-support-retryable-writes-please-ad](https://stackoverflow.com/questions/58589631/mongoerror-this-mongodb-deployment-does-not-support-retryable-writes-please-ad)
