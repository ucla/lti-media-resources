require('dotenv').config();
const { MongoClient } = require('mongodb');

module.exports.client = null;

// Create a connection to url and call callback()
module.exports.connect = async function (url) {
  if (this.client) {
    // Connection has already been established
    return;
  }
  // Create a new connection
  this.client = new MongoClient(url, {
    useUnifiedTopology: true,
    maxPoolSize: process.env.DB_MAX_POOL_SIZE,
    maxIdleTimeMS: process.env.DB_MAX_IDLE_TIME_MS,
  });
  try {
    await this.client.connect();
    return this.client;
  } catch (e) {
    return e;
  }
};

// Get database using pre-established connection
module.exports.db = function (dbName) {
  return this.client.db(dbName);
};

// Close open connection
module.exports.close = async function () {
  if (this.client) {
    await this.client.close();
    this.client = null;
  }
};
