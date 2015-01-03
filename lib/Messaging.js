var sockjs = require('sockjs');

function Messaging () {
  this.socketServer = sockjs.createServer();

  this.socketServer.on('connection', function(conn) {

    // if (clients.length >= maxConnections) {
    //   conn.close(500, 'Maximum number of connections reached');
    //   return;
    // }

    // clients.push({
    //   id: conn.id
    //   ,conn: conn
    // });

    // describe(clients);

    // conn.on('data', function(message) {
    //   processMessage(conn, message);
    // });

    // conn.on('close', function() {
    //   var i = clients.length;
    //   while (i--) {
    //     if (clients[i].id === conn.id) {
    //       clients.splice(i, 1);
    //     }
    //   }
    //   describe(clients);
    // });

  }.bind(this));
}

Messaging.prototype.broadcast = function broadcast () {

};

Messaging.prototype.install = function install (server, config) {
  this.socketServer.installHandlers(server, config);
};

module.exports = Messaging;
