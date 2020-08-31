require('dotenv').config();
const path = require('path');

// Requiring LTIJS provider
const lti = require('ltijs').Provider;

// Connect to db on start
const client = require('./models/db');

const dbURL = `${process.env.DB_URL}${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`;
client.connect(dbURL);

// Routes
const apiRouter = require('./api');

// Creating a provider instance
let options = {};
if (process.env.MODE === 'production') {
  options = {
    staticPath: path.join(__dirname, '../../dist'), // Path to static files
    cookies: { secure: false },
  };
}
lti.setup(
  process.env.LTI_KEY,
  // Setting up database configurations
  {
    url: `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}?replicaSet=${process.env.DB_REPLSET}`,
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS },
  },
  options
);

// When receiving successful LTI launch redirects to app.
lti.onConnect((token, req, res) => {
  if (process.env.MODE === 'production') {
    return res.sendFile(path.join(__dirname, '../../dist/index.html'));
  }
  return lti.redirect(res, 'http://localhost:3000');
});

// Routes
lti.app.use('/api', apiRouter);

/**
 * Set up everything
 */
async function setup() {
  // Deploying provider, connecting to the database and starting express server.
  await lti.deploy({ port: 8080 });

  // Register platform, if needed.
  await lti.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: 'Platform',
    clientId: process.env.PLATFORM_CLIENTID,
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
    process.env.PLATFORM_CLIENTID
  );
  // eslint-disable-next-line no-console
  console.log(await plat.platformPublicKey());
}

setup();
