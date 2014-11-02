var app = require('express')(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    db = require('./db'),
    users = require('./users');

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  
  socket.on('signup', function(usr) {
  });

  socket.on('login', function(usr) {
  });

  socket.on('logout', function(usr) {
  });

  socket.on('message', function(msg){
    io.emit('message', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
