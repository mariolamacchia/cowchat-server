var inputUrl = process.env.REDIS_URL || process.env.REDISTOGO_URL;
var redis;
if (inputUrl) {
    var url = require('url').parse(process.env.REDIS_URL || process.env.REDISTOGO_URL);
    redis = require('redis').createClient(url.port, url.hostname);
    if (url.auth) {
        redis.auth(url.auth.split(':')[1]);
    }
} else {
    redis = require('redis').createClient();
}

module.exports = {
    saveUser: function(usr, callback) {
        var nameCallback = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'email', usr.email,
                      emailCallback);
        }
        var emailCallback = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'cow', usr.cow, cowCallback);
        }
        var cowCallback = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'password',
                      usr.password, callback);
        }
        redis.set('user:' + usr.username + 'name', usr.name, nameCallback);
    },

    getUser: function(username, callback) {

        var password, email, cow;
        var passwordCallback = function(e, data) {
            if (e) return callback(e);
            if (!data) return callback(null, {});
            password = data;
            redis.get('user:' + username + 'email', emailCallback);
        }
        var emailCallback = function(e, data) {
            if (e) return callback(e);
            email = data;
            redis.get('user:' + username + 'cow', cowCallback);
        }
        var cowCallback = function(e, data) {
            if (e) return callback(e);
            cow = data;
            redis.get('user:' + username + 'name', nameCallback);
        }
        var nameCallback = function(e, name) {
            if (e) return callback(e);
            return callback(null, {
                username: username,
                name: name,
                password: password,
                cow: cow,
                email: email
            });
        }
        redis.get('user:' + username + 'password', passwordCallback);
    },
}
