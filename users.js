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
  signup = function(usr, callback) {
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

  login = function(username, password, callback) {
  },

  logout = function(session, callback) {
  }
}
