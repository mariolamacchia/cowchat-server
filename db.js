var redis = require('redis').createClient();

function createSessionId() {
  /*  Create a 8 byte unique id made by:
      4 byte seconds since Unix time
      2 byte pid
      2 byte random value
  */
  return ("00000000" + (((Date.now() / 1000) & 0xffffffff) >>> 0).toString(16)).substr(-8) +
    ("0000" + (process.pid & 0xffff).toString(16)).substr(-4) +
    ("0000" + (Math.floor(Math.random() * 0x10000)).toString(16)).substr(-4);
}

module.exports = {
  saveUser: function(usr, callback) {
    redis.set('user:' + usr.username + 'name', usr.name, function(e) {
      if (e) return callback(e);
      redis.set('user:' + usr.username + 'email', usr.email, function(e) {
        if (e) return callback(e);
        redis.set('user:' + usr.username + 'cow', usr.cow, function(e) {
          if (e) return callback(e);
          redis.set('user:' + usr.username + 'password', usr.password, callback);
        });
      });
    });
  },

  getUserByUsername: function(username, callback) {
    redis.get('user:' + username + 'password', function(e, password) {
      if (e) return callback(e);
      if (!password) return callback(null, {});
      redis.get('user:' + username + 'email', function(e, email) {
        if (e) return callback(e);
        redis.get('user:' + username + 'cow', function(e, cow) {
          if (e) return callback(e);
          redis.get('user:' + username + 'name', function(e, name) {
            if (e) return callback(e);
            return callback(null, {
              username: username,
              name: name,
              password: password,
              cow: cow,
              email: email
            });
          });
        });
      });
    });
  },

  getUserBySession: function(session, callback) {
    redis.get('session:' + session, function(e, username) {
      if (e) return callback(e);
      module.exports.getUserByUsername(username, callback);
    });
  },
  createSession: function(username, callback) {
    var session = createSessionId();
    redis.set('session:' + session, username, function(e) {
      if (e) return callback(e);
      return callback(null, session);
    });
  },
  deleteSession: function(session, callback) {
    redis.del('session:' + session, function(e) {
      return callback(e);
    });
  },
}
