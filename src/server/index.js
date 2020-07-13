require('dotenv').config();
const path = require('path');

// Requiring LTIJS provider
const Lti = require('ltijs').Provider;

// Creating a provider instance
let options = {};
if (process.env.MODE === 'production') {
  options = {
    staticPath: path.join(__dirname, '../../dist'), // Path to static files
    cookies: { secure: false },
  };
}
const lti = new Lti(
  process.env.LTI_KEY,
  // Setting up database configurations
  {
    url: `mongodb://${process.env.DB_HOST}/${process.env.DB_DATABASE}`,
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

// Routes.

// Names and Roles route.
lti.app.get('/api/members', (req, res) => {
  lti.NamesAndRoles.getMembers(res.locals.token)
    .then(members => {
      console.log(members);
      res.send(members.members);
    })
    .catch(err => res.status(400).send(err));
});

// Grades routes.
lti.app.get('/api/grades', (req, res) => {
  lti.Grade.result(res.locals.token)
    .then(grades => res.status(200).send(grades))
    .catch(err => {
      console.log(err);
      return res.status(400);
    });
});

lti.app.post('/api/grades', (req, res) => {
  try {
    lti.Grade.ScorePublish(res.locals.token, req.body);
    return res.status(200).send(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

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
  const plat = await lti.getPlatform(process.env.PLATFORM_URL);
  console.log(await plat.platformPublicKey());
}

setup();
