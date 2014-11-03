var bcrypt = require('bcrypt'),
    db = require('./db'),
    sessions = require('./sessions');

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
        db.getUser(usr.username, function(err, data) {
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

    login: function(socket, usr, callback) {
        var username = usr.username;
        var password = usr.password;
        // Check if user exists
        db.getUser(username, function(err, usr) {
            if (err) return callback(err);
            if (!usr.username) return callback('User not found.');
            // Check password
            comparePassword(password, usr.password, function(err, data) {
                if (err) return callback(err);
                if (!data) return callback('Invalid password');
                // Create session
                var session = sessions.create(username, socket);
                return callback(null, session);
            });
        });
    },

    getUser: function(username, callback) {
        db.getUser(username, function(e, user) {
            if (e) return callback(e);
            delete user.password;
            callback(null, user);
        });
    }
}
