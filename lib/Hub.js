var winston = require('winston');

function Hub () {
  this.connections = [];
  this.logger = new (winston.Logger)({
      transports: [new (winston.transports.Console)({'timestamp':true})]
  });
};

Hub.prototype.getAddress = function getAddress (conn) {
  return (conn.remoteAddress + ':' + conn.remotePort);
}

Hub.prototype.addConnection = function broadcast (conn) {

  // this example works for two users for now...
  if (this.connections.length >= 2) {
    conn.close(403, 'Maximum number of connections reached.');
    this.logger.info('HUB_CONNECTION_REJECTED: ' + this.getAddress(conn));
    return;
  }

  // add the new user to connections list
  this.logger.info('HUB_CONNECTION_ESTABLISHED: ' + this.getAddress(conn));
  this.connections.push(conn);

  // room has changed, describe it to the connected users
  this.describe();

  // handle connection events
  conn.on('data', function (message) {
    this.handleConnectionData(message, conn);
  }.bind(this));
  conn.on('close', function (ev) {
    this.handleConnectionClose(ev, conn);
  }.bind(this));

};

Hub.prototype.handleConnectionData = function handleConnectionData (message, conn) {
  this.broadcast(message, conn);
};

Hub.prototype.handleConnectionClose = function handleConnectionClose (ev, conn) {
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
};

Hub.prototype.broadcast = function broadcast (message, sender) {
  this.logger.info('HUB_BROADCAST', message, this.getAddress(sender));
  this.connections.forEach(function (target) {
    if (typeof sender === 'undefined') {
      this.send(message, target);
    } else if (target.id !== sender.id) {
      this.send(message, target);
    }
  }, this);
};

Hub.prototype.send = function send (message, target) {
  target.write(message);
};

Hub.prototype.describe = function describe () {
  this.logger.info('HUB_DESCRIBE');
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
    this.send(JSON.stringify(message), targetConn);

  }, this);

};

module.exports = Hub;
