# LTI Media Resources

## First Time Setup

Table of Contents

- [Set up VS Code](#set-up-vs-code)
- [Set up git-secrets hooks](#set-up-git-secrets-hooks)
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

## Set up git-secrets hooks

To prevent us from accidentally committing secrets, we will install the [git-secrets](https://github.com/awslabs/git-secrets) hooks.

1. Install git-secrets locally on your machine. See instructions for your platform [here](https://github.com/awslabs/git-secrets#installing-git-secrets).

2. Set up git-secrets for this repo

   - `cd` into the repo
   - Run `git secrets --install`

3. Configure git-secrets by running the following commands:
   - `git secrets --register-aws`
   - `git secrets --add 'SECRET(\s|[a-zA-Z\_])*=\s*.+'`

These rules will prevent any variables prefixed with `SECRET_` from being committed with a value filled in.

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
7. Copy Client ID value into the SECRET_PLATFORM_CLIENTID variable in .env (created below in [Start up the app](#start-up-the-app), Step 1)

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

1. Copy .env.dist to a local .env file. There are some empty secret fields in .env.dist. Ask Rex for the secrets.
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

## Deploying to AWS

### Configure AWS CLI

1. Download the CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
2. Run `aws configure` in your terminal
   - Go to "My Security Credentials" for the access and secret key
   - `us-west-2` as the default region
   - https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html for more information

### Create a repository on AWS ECR

Make sure "Oregon" (us-west-2) is the selected region in the AWS Console before performing any of the next steps.

1. Go to the Elastic Container Registry in the AWS Console
2. Create a private repository
3. After creating the repository, click on the name to view the images (will be empty)
4. Click on the "View push commands" button to view the 4 commands to push images to the repository
5. After pushing an image to the repo, move on

This will need to be repeated for each service listed in the Docker Compose file (Nodeserver and Nginx).

### Creating Network Load Balancer

To utilize elastic IP with ECS Fargate, we need to use a NLB. Visit https://aws.amazon.com/premiumsupport/knowledge-center/ecs-fargate-static-elastic-ip-address/ for directions.

### Creating AWS ECS Cluster

1. Go to AWS ECS (Elastic Container Service)
2. Create a cluster
3. Select "Networking Only" for the cluster template
4. Enter a name

### Creating ECS Task Definition

1. Go to Task Defintions on the AWS ECS side menu
2. Create new tasks definition
3. Choose Fargate
4. Enter a name, memory, and CPU size
5. Click on Add Container
   1. Add the container for the nodeserver (Image URI can be found in the ECR)
      - Enter port 8080 for the Port Mappings
   2. Add the container for the nginx server (Image URI can be found in the ECR)
      - Enter port 80 for the Port Mappings
      - Enter port 443 (SSL) for the Port Mappings
6. Create task definition

### Creating ECS Service

Using the new task definition, we can now run the app on our cluster.

1. Go to Clusters in the AWS ECS side menu
2. Click on the cluster that was previously created
3. Click on Create under the Services tab
4. Under launch type, click Fargate
5. Under task defintion, select the task that was just created
6. Enter a service name
7. Enter 1 for number of tasks
8. Choose the first option for Cluster VPC and Subnets
9. Edit the Security Group to allow traffic over HTTPS
10. Select the Network Load Balancer

The service should now be running.

### Connecting to CCLE

Once the task is running, you can now connect it to the CCLE LTI tool.

1. Under the Task tab for the running service, click on the running task
2. Under Network, copy and paste the Public IP
3. Go to the External Tool Configuration on CCLE
4. Copy and paste the IP with the port for Tool URL, Initiate login URL, and Redirection URI(s)
   - It will be of the form `https://<Public IP>`
5. To avoid CORS issues, switch Default launch container to New Window
6. Save changes

### Updating ECS when deploying newer version of app

1. Push the new image to the repository (these can be found under "View push commands" in the AWS ECR repo)
   1. Retrieve login token - `aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <AccountId>.dkr.ecr.us-west-2.amazonaws.com`
   2. Build image - `docker-compose build`
   3. Tag and Push Image - `docker-compose push`
      - This will tag and push from the image field listed in the Docker Compose file
2. Update the cluster service to use the new image - `aws ecs update-service --cluster <Cluster Name> --service <Service Name> --force-new-deployment`
3. If Auto-Assign IP is on, the Public IP will be changed and need to be updated in the CCLE tool settings

The Cluster will stop the old task once the newer version is up and running.

This can also be done manually in the AWS console if the new image has a different tag.

1. Click on the task definition
2. Click on Create new revision
3. Update the container defintion with the new image tag
4. Update the task defintion revision
5. Go to the ECS Cluster
6. Click on the Service and hit Update
7. Choose the latest revision for the task defintion

The Service will now have the latest image of the app. The previous task will need to be stopped.

### Deploying to Different Environments

There are AWS ECS enviroments for PROD, STAGE, and TEST.

Use the deploy script `./deploy.sh --id=<AWS_ACCOUNT_ID> --env=<PROD|STAGE|TEST>` to push the latest image to the respective environment.

### SSL Certificates

The Nginx server and Dockerfile assume that the SSL public and private keys for the different environments are located in the `nginx-conf/certs/<prod|stage|test>` directory.

The file name for the keys should be `mediaresources-<ENV>.ccle.ucla.edu.cert.cer` and `mediaresources-<ENV>.ccle.ucla.edu.key` respectively.
