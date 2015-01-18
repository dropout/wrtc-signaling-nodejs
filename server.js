// required libraries
var http = require('http');
var node_static = require('node-static');
var sockjs = require('sockjs');

// internal modules
var Hub = require('./lib/Hub');

// configuration variables
var SERVER_ADDRESS = 'localhost';
var SERVER_PORT = 1337;
var STATIC_DIRECTORY = '/static';

// create static file request handler
var staticHandler = new node_static.Server(__dirname + STATIC_DIRECTORY);

// create an http server
var server = http.createServer();
server.addListener('request', function(req, res) {
    staticHandler.serve(req, res);
});
server.addListener('upgrade', function(req,res){
    res.end();
});

// create a hub for websocket connections
var hub = new Hub();

// create websocket server
var socketServer = sockjs.createServer();

// on new connection add to hub
socketServer.on('connection', function handleConnect (conn) {
  hub.addConnection(conn);
});

// install websocket server
socketServer.installHandlers(server, {
  prefix: '/signaling'
});

// start the http server
server.listen(SERVER_PORT, SERVER_ADDRESS);
