var redis = require('redis').createClient();

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

  getUser: function(username, callback) {
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
}
