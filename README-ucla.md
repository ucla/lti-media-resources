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
