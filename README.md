# LTI Media Resources

## First Time Setup

Table of Contents

- [Set up VS Code](#set-up-vs-code)
- [Set up LTI tool](#set-up-lti-tool)
- MongoDB installation and setup
  - [Install MongoDB](#install-mongodb)
  - [Set up MongoDB Replica Set](#set-up-mongodb-replica-set)
  - [Set up MongoDB Collections](#set-up-mongodb-collections)
- [Start up the app](#start-up-the-app)
- [Test it out](#test-it-out)
- [Documentation](#documentation)

## Set up VS Code

1. Download and install VS Code: https://code.visualstudio.com/
2. Install ESLint package: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
3. Install ESLint rules: `npx install-peerdeps --global eslint-config-wesbos`

## Set up LTI tool

1. Start up your local Moodle on Docker, then log in as admin
2. Go to Site administration → Plugins → Activity modules → External tool → Manage tools
3. Click on "configure a tool manually"
4. Configure the following:

   - Tool settings:
     - Tool name: _(Anything)_
     - Tool URL: http://localhost:8080
     - LTI version: LTI 1.3
     - Public key type: RSA key
     - Initiate login URL: http://localhost:8080/login
     - Redirection URI(s): http://localhost:8080
   - Services:
     - IMS LTI Assignment and Grade Services: Use this service for grade sync and column management
     - IMS LTI Names and Role Provisioning: Use this service to retrieve members' information as per privacy settings
     - Tool Settings: Use this service
   - Privacy:
     - Share launcher's name with tool: Always
     - Share launcher's email with tool: Always
     - Accept grades from the tool: Always

5. Click "Save changes"
6. Under "Tools", find the LTI app you just created and click on the "View configurations" icon (first icon, next to gear)
7. Copy Client ID value into PLATFORM_CLIENTID value in .env file (created below in [Start up the app](#start-up-the-app), Step 1)

## Install MongoDB

1. Install MongoDB: https://docs.mongodb.com/manual/administration/install-community/
2. Helpful to install MongoDB Compass to ensure your database is running correctly: https://www.mongodb.com/try/download/compass
3. Follow the steps below for setting MongoDB for development

## Set up MongoDB Replica Set

In order to use [MongoDB transactions](https://www.mongodb.com/transactions), we need to configure our local MongoDB development instance with a replica set.

If you are on macOS, you should only need to do this configuration once.
If you are on Ubuntu, you may need to start mongod manually every time after boot.

(The following steps were tested on macOS Catalina 10.15.6.)

1. Make sure MongoDB isn't currently running. (Running `mongo` should give an error)

   - If you are doing this setup for the first time, stop mongod. https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
   - If you have already done this setup before, and you see mongod running on computer boot, it means that you have autostart enabled
     - In this case, do step 3 below to make sure you do have replica set. Stop mongod and continue with step 2 only if you don't see any replica set

2. Start MongoDB by running `mongod --port 27017 --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --replSet rs0 --bind_ip localhost`

   - The paths for `--dbpath` and `--logpath` might vary depending your system
     - Look for the paths in the [MongoDB configuration file](https://docs.mongodb.com/manual/reference/configuration-options/#configuration-file)
   - The `--dbpath` must be specified as such on macOS Catalina or newer because Catalina has made the root volume read-only, so the default `/data/db` path does not work
   - The argument after `--replSet` should match the `DB_REPLSET` .env variable

3. Enter the MongoDB shell by running `mongo`
   1. Inside the mongo shell, run `rs.initiate()` to create a replica set
   2. Verify that there is a replica set by running `rs.status()`. Running `rs.status().set` gives you the name of the replica set

## Set up MongoDB Collections

1. If you don't have migrate-mongo package installed globally, run `yarn global add migrate-mongo`
2. Inside project directory, run `migrate-mongo up` to get create all the needed collections
3. Run all scripts under src/server/jobs/update-xxx.js by running `node src/server/jobs/update-xxx.js`
   - These scripts must be run with a CCLE IP address. Use the CCLE VPN if you are off campus
   - `update-bcast.js` takes in 1 command-line parameter called 'term'
     - For example, run `node src/server/jobs/update-bcast.js 20S` to update Bruincast records for term 20S

To create or modify the mongo migration script, see documentation at https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script.

## Start up the app

1. Copy .env-dist to a local .env file. There are some empty secret fields in .env.dist. Ask Rex for the secrets.
2. Set LTI_KEY to any random string, and DB_DATABASE to whatever you'd like
3. (Optional) Comment out DEBUG if you do not want to see the LTI provider debugging messages
4. Start app:

   1. `yarn`
   2. `yarn dev`

5. On initial load, the app will display the public key in the terminal
6. Copy the key, and remember to remove the `[0]` characters from the start of each row of the key, and include the BEGIN/END PUBLIC KEY lines
7. Go to Site administration → Plugins → Activity modules → External tool → Manage tools again, and click on the gear icon on the LTI external tool
8. Paste the public key you just copied (with `[0]` removed) into 'Public key'

## Test it out

1. Go to a course site
2. Turn editing on and click "Add activity or resource", choose External tool, enter any name, choose your LTI tool from Preconfigured tool, and then click "Save changes"
3. You should see your tool embedded in the site and the app should load

## Documentation

- LTIjs: https://cvmcosta.me/ltijs/#/provider
- Instructure UI: https://instructure.design/
- Migrate-mongo: https://www.npmjs.com/package/migrate-mongo
- Jest: https://jestjs.io/
- UCLA API: https://kb.sait.ucla.edu/display/KB/API+Knowledgebase
