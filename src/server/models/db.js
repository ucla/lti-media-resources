const { MongoClient } = require('mongodb');

module.exports.client = null;

// Create a connection to url and call callback()
module.exports.connect = function(url, callback) {
  if (this.client) {
    // Connection has already been established
    callback();
  }
  // Create a new connection
  this.client = new MongoClient(url, { useUnifiedTopology: true });
  this.client.connect(function(err) {
    if (err) {
      this.client = null;
      callback(err);
    } else {
      callback();
    }
  });
};

// Get database using pre-established connection
module.exports.db = function(dbName) {
  return this.client.db(dbName);
};

// Close open connection
module.exports.close = function() {
  if (this.client) {
    this.client.close();
    this.client = null;
  }
};
