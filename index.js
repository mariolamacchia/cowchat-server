var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    db = require('./db'),
    users = require('./users');

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('connected');
  
  socket.on('signup', function(message) {
    console.log('signing');
    users.signup(message.content, function(error) {
      if (error) socket.emit(message.id + ':error', error);
      else user.login(message.content, function(error, session) {
        if (error) socket.emit(message.id + ':error', error);
        else socket.emit(message.id + ':success', session);
      });
    });
  });

  socket.on('login', function(message) {
    console.log('logging in');
    users.login(message.content, function(error, session) {
      if (error) socket.emit(message.id + ':error', error);
      else socket.emit(message.id + ':success', session);
    });
  });

  socket.on('logout', function(message) {
    console.log('logging out');
    user.logout(message.content, function(error) {
      if (error) socket.emit(message.id + ':error', error);
      else socket.emit(message.id + ':success');
    });
  });

  socket.on('message', function(msg){
    io.emit('message', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
