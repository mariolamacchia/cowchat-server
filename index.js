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
    var password = message.content.password;
    users.signup(message.content, function(error) {
      if (error) return socket.emit(message.id + ':error', error);
      console.log('signed');
      message.content.password = password;
      users.login(message.content, function(error, session) {
        if (error) socket.emit(message.id + ':error', error);
        else socket.emit(message.id + ':success', session);
      });
    });
  });

  socket.on('login', function(message) {
    console.log('logging in');
    users.login(message.content, function(error, session) {
      if (error) return socket.emit(message.id + ':error', error);
      console.log('logged');
      socket.emit(message.id + ':success', session);
    });
  });

  socket.on('logout', function(message) {
    console.log('logging out');
    users.logout(message.content, function(error) {
      if (error) return socket.emit(message.id + ':error', error);
      console.log('logged out');
      socket.emit(message.id + ':success');
    });
  });

  socket.on('user', function(message) {
    console.log('requested user');
    db.getUserByUsername(message.content, function(e, d) {
      if (e) return socket.emit(message.id + ':error', e);
      if (!d.username) return socket.emit(message.id + ':error', 'User not found');
      delete d.password;
      socket.emit(message.id + ':success', d);
    });
  });

  socket.on('me', function(message) {
    console.log('requesed me');
    db.getUserBySession(message.content, function(e, d) {
      if (e) return socket.emit(message.id + ':error', e);
      if (!d.username) return socket.emit(message.id + ':error', 'User not found');
      delete d.password;
      socket.emit(message.id + ':success', d);
    });
  });

  socket.on('message', function(msg){
    console.log('sending message to ' + msg.content.to);
    db.getUserByUsername(msg.content.to, function(e, d) {
      if (e) return socket.emit(msg.id + ':error', e);
      if (!d.username) return socket.emit(msg.id + ':error', 'User not found');
      var to = d;
      delete to.password;
      db.getUserBySession(msg.content.me, function(e, d) {
        if (e) return socket.emit(msg.id + ':error', e);
        var from = d;
        delete from.password;
        socket.emit(to.session, {
          from: from,
          id: msg.id,
          content: msg.content.message
        });
        socket.emit(msg.id + ':success');
        console.log('message sent to session ' + to.session);
      });
    });
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
