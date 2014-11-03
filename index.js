var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    users = require('./users'),
    sessions = require('./sessions');

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

function reply(socket, messageId, result, message) {
  var key;
  if (result)
    key = messageId + ':success';
  else key = messageId + ':error';
  console.log(key + ': ' + JSON.stringify(message));
  socket.emit(key, message);
}

io.on('connection', function(socket){
  console.log('connected');
  
  socket.on('signup', function(message) {
    console.log('signing user ' + message.content.username);
    var password = message.content.password;
    users.signup(message.content, function(error) {
      if (error) return reply(socket, message.id, false, error);
      console.log('signed');
      return reply(socket, message.id, true);
    });
  });

  socket.on('login', function(message) {
    console.log(message.content.username + 'logging in');
    users.login(socket, message.content, function(error, session) {
      if (error) return reply(socket, message.id, false, error);
      console.log('logged');
      reply(socket, message.id, true, {
        username: message.content.username,
        session: session
      });
    });
  });

  socket.on('user', function(message) {
    console.log('requested user: ' + message.content);
    users.getUser(message.content, function(e, d) {
      if (e) return reply(socket, message.id, false, e);
      if (!d.username)
        return reply(socket, message.id, false, 'User not found');
      reply(socket, message.id, true, d);
    });
  });

  socket.on('message', function(msg){
    // Check if user is connected
    if (!sessions.checkSession(msg.content.me.username, msg.content.me.session))
      return reply(socket, msg.id, false, 'Not connected');
    // Check if user is connected
    var targetSocket = sessions.getSocket(msg.content.to);
    if (!targetSocket)
      return reply(socket, msg.id, false, 'User not found or not connected');
    var success = false;
    targetSocket.on(msg.id + ':received', function() {
      success = true;
      reply(socket, msg.id, true);
    });
    targetSocket.emit('message', {
      id: msg.id,
      from: msg.content.me.username,
      message: msg.content.message
    });
    setTimeout(
      function() {
        if (!success)
          reply(socket, msg.id, false, 'User offline');
      },
      5000
    );
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
