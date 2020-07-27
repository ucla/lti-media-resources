const { MongoClient } = require('mongodb');

let client = null;

// Create a connection to url and call callback()
module.exports.connect = function(url, callback) {
  if (client) {
    // Connection has already been established
    callback();
  }
  // Create a new connection
  client = new MongoClient(url, { useUnifiedTopology: true });
  client.connect(function(err) {
    if (err) {
      client = null;
      callback(err);
    } else {
      callback();
    }
  });
};

// Get database using pre-established connection
module.exports.db = function(dbName) {
  return client.db(dbName);
};

// Close open connection
module.exports.close = function() {
  if (client) {
    client.close();
    client = null;
  }
};
