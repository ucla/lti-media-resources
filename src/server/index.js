require('dotenv').config();
const path = require('path');

// Requiring LTIJS provider
const lti = require('ltijs').Provider;

// Connect to db on start
const client = require('./models/db');

client.connect(process.env.DB_URL);

// Creating a provider instance
let options = {};
if (process.env.MODE === 'production') {
  options = {
    staticPath: path.join(__dirname, '../../dist'), // Path to static files
    cookies: { secure: true, sameSite: 'None' },
  };
}

const approute = process.env.LTI_APPROUTE ? process.env.LTI_APPROUTE : '';
options.appRoute = approute;
options.loginRoute = `${approute}/login`;
options.keysetRoute = `${approute}/keys`;
options.invalidTokenRoute = `${approute}/invalidtoken`;
options.sessionTimeoutRoute = `${approute}/sessiontimeout`;

lti.setup(
  process.env.LTI_KEY,
  // Setting up database configurations
  { url: process.env.DB_URL },
  options
);

// When receiving successful LTI launch redirects to app.
lti.onConnect((token, req, res) => {
  if (process.env.MODE === 'production') {
    return res.sendFile(path.join(__dirname, '../../dist/index.html'));
  }
  return lti.redirect(res, `http://localhost:${process.env.CLIENTPORT}`);
});

// Routes
const apiRouter = require('./api');

lti.app.use(`${process.env.LTI_APPROUTE}/api`, apiRouter);

/**
 * Set up everything
 */
async function setup() {
  // Deploying provider, connecting to the database and starting express server.
  const port = process.env.SERVERPORT ? process.env.SERVERPORT : 8080;
  await lti.deploy({ port });

  // Register platform, if needed.
  await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: 'Platform',
    clientId: process.env.SECRET_PLATFORM_CLIENTID,
    authenticationEndpoint: process.env.PLATFORM_ENDPOINT,
    accesstokenEndpoint: process.env.PLATFORM_TOKEN_ENDPOINT,
    authConfig: {
      method: 'JWK_SET',
      key: process.env.PLATFORM_KEY_ENDPOINT,
    },
  });

  // Get the public key generated for that platform.
  const plat = await lti.getPlatform(
    process.env.PLATFORM_URL,
    process.env.SECRET_PLATFORM_CLIENTID
  );
  // eslint-disable-next-line no-console
  console.log(await plat.platformPublicKey());
}

setup();
