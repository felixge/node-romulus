var EventEmitter  = require('events').EventEmitter;
var http          = require('http');
var util          = require('util');
var handleRequest = require('./handleRequest');

var exports = module.exports = function createServer(options, cb) {
  var server = new Server(options);
  server.listen();
  return server;
};

util.inherits(Server, EventEmitter);
function Server(options) {
  EventEmitter.call(this);

  this._port    = options.port;
  this._pages   = options.pages;
  this._layouts = options.layouts;
  this._public  = options.public;
  this._http    = http.createServer(this._handleRequest.bind(this));
}

Server.prototype.listen = function() {
  this._http.listen(this._port);
  this._http.on('listening', this.emit.bind(this, 'listening'));
};

Server.prototype._handleRequest = function(req, res) {
  handleRequest({
    req     : req,
    res     : res,
    pages   : this._pages,
    layouts : this._layouts,
    public  : this._public,
  });
};
