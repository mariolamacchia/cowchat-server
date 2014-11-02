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
  },

  login = function(username, password, callback) {
  },

  logout = function(session, callback) {
  }
}
