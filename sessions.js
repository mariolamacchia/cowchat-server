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

setInterval(function() {
    for (var k in users) {
        console.log('send keepalive to ' + k);
        var alive = false;
        users[k].socket.on('alive', function() {
            console.log(k + ' is alive');
            alive = true;
            users[k].socket.removeAllListeners('alive');
        });
        users[k].socket.emit('keep alive');
        setTimeout(function() {
            if (!alive) {
                console.log(k + 'is dead');
                module.exports.delete(k);
            }
        }, 5000);
    }
}, 5000);

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
