require('dotenv').config();
const path = require('path');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const dompurify = createDOMPurify(window);

// Requiring LTIJS provider
const Lti = require('ltijs').Provider;

const services = require('./services');

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

// Routes

// Names and Roles route.
lti.app.get('/api/roles', (req, res) => {
  const result = res.locals.token.roles.map(role =>
    role.substr(role.lastIndexOf('#') + 1, role.length).toLowerCase()
  );
  return res.send(result);
});

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

lti.app.get('/api/course', (req, res) => {
  const { context } = res.locals.context;
  if (context) {
    context.quarter = context.label.substr(0, context.label.indexOf('-'));
    return res.send(context);
  }
  return res.status(400).send(new Error('Context not found'));
});

lti.app.get('/api/medias/counts', (req, res) => {
  const result = {
    bruincasts: 6,
    videos: 69,
    audios: 420,
  };
  return res.send(result);
});

lti.app.get('/api/medias/bruincast/notice', (req, res) => {
  const result = '<p>A default notice</p>';
  res.send(dompurify.sanitize(result));
});

lti.app.post('/api/medias/bruincast/notice', (req, res) => {
  // Update notice in db here
  res.send('Notice updated!');
});

lti.app.get('/api/medias/bruincast/crosslist', (req, res) => {
  const { courseLabel } = req.query;
  // Get a list of all crosslist course labels
  const labelList = [courseLabel, '20S-CS32'];
  // Get course object for each label
  // Code below is just a sample. Replace with db queries.
  const { context } = res.locals.context;
  context.quarter = context.label.substr(0, context.label.indexOf('-'));
  const courseList = [
    context,
    {
      id: 69420,
      label: '20S-CS32',
      quarter: '20S',
      title: 'CS 32',
    },
  ];
  return res.send(courseList);
});

lti.app.get('/api/medias/bruincast/casts', (req, res) => {
  const { courseLabel } = req.query;
  const result = [
    {
      id: 0,
      title: 'Sample',
      comments: ['Sample'],
      date: new Date(2020, 2, 14),
      audios: [''],
      videos: ['eeb162-1-20200331-18431.mp4'],
    },
    {
      id: 1,
      title: 'Content is from CS 32 (Winter 2012)',
      comments: ['Date of lecture: 3/7/2012'],
      date: new Date(2020, 2, 7),
      audios: [''],
      videos: ['cs32-1-20200506-18379.mp4'],
    },
    {
      id: 2,
      title: 'Content is from CS 32 (Winter 2012)',
      comments: ['Date of lecture: 3/5/2012'],
      date: new Date(2020, 2, 5),
      audios: [],
      videos: ['cs32-1-20200504-18378.mp4'],
    },
  ];
  result.sort((a, b) => a.date - b.date);
  return res.send(result);
});

lti.app.get('/api/medias/bruincast/url', (req, res) => {
  const { quarter, type, src } = req.query;
  if (!quarter || !type || !src) {
    return res.status(500);
  }
  const { HOST, VALIDITY, SECRET } = process.env;
  // During development, find out your IP and put it here.
  // After production, use req.ip
  // When testing, replace with your own external ip
  // const clientIP = req.ip;
  const clientIP = '172.91.84.123';
  let stream = '';
  if (/^(Fall|Winter|Spring|Summer) 20[0-9]{2}$/i.test(quarter)) {
    // eslint-disable-next-line prettier/prettier
    stream = `${quarter.slice(-4)}${quarter.charAt(0).toLowerCase()}-${type}/${path.extname(src).substr(1)}:${src}`;
  } else if (/^[0-9]{2,3}(f|w|s|a|c)$/i.test(quarter)) {
    // eslint-disable-next-line prettier/prettier
    stream = `20${quarter.substr(0, 3).toLowerCase()}-${type}/${path.extname(src).substr(1)}:${src}`;
  } else {
    return res.status(400).send(new Error('Incorrect format for quarter'));
  }
  const now = new Date();
  const start = Math.round(now.getTime() / 1000);
  const end = start + parseInt(VALIDITY);

  const resultURL = services.generateMediaURL(
    HOST,
    stream,
    clientIP,
    SECRET,
    start.toString(),
    end.toString()
  );
  console.log(resultURL);
  res.send('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3');
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
