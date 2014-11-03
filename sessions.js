var users = {}

function createSessionId() {
    /*  Create a 8 byte unique id made by:
        4 byte seconds since Unix time
        2 byte pid
        2 byte random value
        */
    var date = (((Date.now() / 1000) & 0xffffffff) >>> 0).toString(16);
    var pid = (process.pid & 0xffff).toString(16);
    var random = (Math.floor(Math.random() * 0x10000)).toString(16);
    return ("00000000" + date).substr(-8) +
        ("0000" + pid).substr(-4) +
        ("0000" + random).substr(-4);
}

module.exports = {
    create: function(username, socket) {
        users[username] = {session: createSessionId(), socket: socket};

        // Setup keepalive requests
        var alive = true;
        socket.on('alive', function() {
            console.log(username + ' is alive');
            alive = true;
        });
        var keepalive = setInterval(function() {
            console.log('Senging keepalive to ' + username);
            alive = false;
            socket.emit('keep alive');
            setTimeout(function() {
                // Do not run if user was disconnected already
                if (!users[username]) return;
                if (!alive) {
                    console.log(username + ' disconnected');
                    module.exports.delete(username);
                    clearInterval(keepalive);
                }
            }, 10000);
        }, 5000);

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
