var EventEmitter  = require('events').EventEmitter;
var http          = require('http');
var util          = require('util');
var handleRequest = require('./handleRequest');

var exports = module.exports = function createServer(config, cb) {
  var server = new Server(config);
  server.listen();
  return server;
};

util.inherits(Server, EventEmitter);
function Server(config) {
  EventEmitter.call(this);

  this.config = config;
  this.server = http.createServer(this._handleRequest.bind(this));
}

Server.prototype.listen = function() {
  this.server.listen(this.config.port);
  this.server.on('listening', this.emit.bind(this, 'listening'));
};

Server.prototype._handleRequest = function(req, res) {
  handleRequest({
    req: req,
    res: res,
    config: this.config,
  });
};
