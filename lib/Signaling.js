var sockjs = require('sockjs');

function Signaling () {

  // list holds our connections
  this.connections = [];

  // the socket server
  this.socketServer = sockjs.createServer();

  // on every new connection
  this.socketServer.on('connection', function handleConnection (conn) {

    // this example works for two users for now...
    if (this.connections.length >= 2) {
      conn.close(500, 'Maximum number of connections reached');
      return;
    }

    // add the new user to connections list
    this.connections.push(conn);

    // room has changed, describe it to the connected users
    this.describe();

    // forward message sent by the user
    conn.on('data', function(message) {
      this.broadcast(message, conn);
    });

    // in case user is disconnected
    conn.on('close', function () {

      // remove the user
      var i = this.connections.length;
      var index;
      while (i--) {
        if (this.connections[i].id === conn.id) {
          index = i;
          this.connections.splice(i, 1);
          break;
        }
      }

      // room has changed, describe it to the connected users
      this.describe();

    }.bind(this)); // eof on close

  }.bind(this)); // eof on connection

};

Signaling.prototype.broadcast = function broadcast (message, sender) {
  this.connections.forEach(function (target) {
    if (typeof sender === 'undefined') {
      this.send(message, target);
    } else if (target.id !== sender.id) {
      this.send(message, target);
    }
  }, this);
};

Signaling.prototype.send = function send (message, target) {
  target.write(JSON.stringify(message));
};

Signaling.prototype.describe = function describe () {

  this.connections.forEach(function (targetConn) {

    // users in the room, exclude the user itself
    var users = this.connections
      .filter(function (item) {
        return (item.id !== targetConn.id);
      })
      .map(function (item, index) {
        return {
          id: item.id
        }
      });

    // assemble message
    var message = {
      type: 'DESCRIBE_ROOM'
      ,data: {
        users: users
      }
    };

    // send the message
    this.send(message, targetConn);

  }, this);

};

Signaling.prototype.install = function install (server, config) {
  this.socketServer.installHandlers(server, config);
};

module.exports = Signaling;
