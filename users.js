var bcrypt = require('bcrypt'),
    db = require('./db');

function encryptPassword(password, callback) {
  bcrypt.genSalt(function(err, salt) {
    if (err) return callback(err);
    bcrypt.hash(password, salt, callback);
  });
}

function comparePassword(pwd1, pwd2, callback) {
  bcrypt.compare(pwd1, pwd2, callback);
}

module.exports = {
  signup: function(usr, callback) {
    var password = usr.password;
    // Check if user exists already
    db.getUserByUsername(usr.username, function(err, data) {
      if (err) return callback(err);
      if (data.username) return callback('Existing user');
      // Encrypt password
      encryptPassword(password, function(err, newPassword) {
        usr.password = newPassword;
        // Save user in db
        db.saveUser(usr, function() {
          return callback();
        });
      });
    });
  },

  login: function(usr, callback) {
    var username = usr.username;
    var password = usr.password;
    // Check if user exists
    db.getUserByUsername(username, function(err, usr) {
      if (err) return callback(err);
      if (!usr.username) return callback('User not found.');
      // Check password
      comparePassword(password, usr.password, function(err, data) {
        if (err) return callback(err);
        if (!data) return callback('Invalid password');
        // Create session
        db.createSession(username, function(err, session) {
          if (err) return callback(err);
          return callback(null, session);
        });
      });
    });
  },

  logout: function(session, callback) {
    db.deleteSession(session, callback);
  }
}
