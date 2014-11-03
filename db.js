var redis = require('redis').createClient();

module.exports = {
    saveUser: function(usr, callback) {
        var setEmail = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'email', usr.email, setCow);
        }
        var setCow = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'cow', usr.cow, setPassword);
        }
        var setPassword = function(e) {
            if (e) return callback(e);
            redis.set('user:' + usr.username + 'password',
                      usr.password, callback);
        }
        redis.set('user:' + usr.username + 'name', usr.name, setEmail);
    },

    getUser: function(username, callback) {

        var getEmail = function(e) {
            if (e) return callback(e);
            if (!password) return callback(null, {});
            redis.get('user:' + username + 'email', getCow);
        }
        var getCow = function(e) {
            if (e) return callback(e);
            redis.get('user:' + username + 'cow', getName);
        }
        var getName = function(e) {
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
        }
        redis.get('user:' + username + 'password', getEmail);
    },
}
