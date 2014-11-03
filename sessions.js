var users = {}

function createSessionId() {
  /*  Create a 8 byte unique id made by:
      4 byte seconds since Unix time
      2 byte pid
      2 byte random value
  */
  return ("00000000" + (((Date.now() / 1000) & 0xffffffff) >>> 0).toString(16)).substr(-8) +
    ("0000" + (process.pid & 0xffff).toString(16)).substr(-4) +
    ("0000" + (Math.floor(Math.random() * 0x10000)).toString(16)).substr(-4);
}

module.exports = {
  create: function(username, socket) {
    users[username] = {session: createSessionId(), socket: socket};
    return users[username].session;
  },
  delete: function(username) {
    delete users[username];
  },
  checkSession: function(username, session) {
    if (!users[username]) return false;
    return (users[username].session == session);
  },
  getSocket: function(username) {
    if (!users[username]) return null;
    return users[username].socket;
  }
}
