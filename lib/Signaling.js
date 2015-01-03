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

    // a user came online tell the others
    this.broadcast({
      type: 'USER_ONLINE'
      ,data: {id: this.connections.length} // don't expose the internal id

    });

    // add the new user to connections list
    this.connections.push(conn);

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

      // broadcast message that a user went offline
      this.broadcast({
        type: 'USER_OFFLINE'
        ,data: {id: index}
      });

    }.bind(this)); // on close

  }.bind(this)); // on connection

};

Signaling.prototype.broadcast = function broadcast (message, sender) {

  this.connections.forEach(function (target) {
    if (typeof sender === 'undefined') {
      target.write(JSON.stringify(message));
    } else if (target.id !== sender.id) {
      target.write(JSON.stringify(message));
    }
  }, this);

};

Signaling.prototype.install = function install (server, config) {
  this.socketServer.installHandlers(server, config);
};

module.exports = Signaling;
