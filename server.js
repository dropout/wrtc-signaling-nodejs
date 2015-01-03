// required libraries
var http = require('http');
var node_static = require('node-static');

// internal modules
var Messaging = require('./lib/Messaging');
var Signaling = require('./lib/Signaling');

// configuration variables
var SERVER_ADDRESS = 'localhost';
var SERVER_PORT = 1337;
var STATIC_DIRECTORY = '/static';

// create static server
var staticHandler = new node_static.Server(__dirname + STATIC_DIRECTORY);

// create an http server
var server = http.createServer();
server.addListener('request', function(req, res) {
    staticHandler.serve(req, res);
});
server.addListener('upgrade', function(req,res){
    res.end();
});

// create socket handlers
// var messagingSocket = new Messaging();
var signalingSocket = new Signaling();

// install socket handlers
// messagingSocket.install(server, {prefix: '/messaging'})
signalingSocket.install(server, {prefix: '/signaling'})

// start the server
server.listen(SERVER_PORT, SERVER_ADDRESS);
