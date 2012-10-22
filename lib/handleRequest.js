var getPagePath   = require('./getPagePath');
var renderPage    = require('./renderPage');
var send          = require('send');
var url           = require('url');
var async         = require('async');
var less          = require('less');
var fs            = require('fs');

module.exports = function handleRequest(req, res) {
  var handler = new RequestHandler(req, res);
  handler.execute();
};

function RequestHandler(options) {
  this._req          = options.req;
  this._res          = options.res;
  this._pages        = options.pages;
  this._layouts      = options.layouts;
  this._public       = options.public;
  this._getPageError = null;
}

RequestHandler.prototype.execute = function() {
  var self = this;
  async.series([
    this._servePage.bind(this),
    this._serveAsset.bind(this),
    this._serveLessCss.bind(this),
    this._serve404.bind(this),
  ], function(err) {
    self._res.writeHead(500);
    self._res.end(err.stack);
  });
};

RequestHandler.prototype._servePage = function(next) {
  var self = this;
  getPagePath(this._req.url, this._pages, function(err, pagePath) {
    if (err) {
      self._getPageError = err;
      next(null);
      return;
    }

    renderPage(pagePath, self._layouts, function(err, html) {
      if (err) return next(err);

      self._res.setHeader('Content-Type', 'text/html');
      self._res.end(html);
    })
  });
};

RequestHandler.prototype._serveAsset = function(next) {
  send(this._req, url.parse(this._req.url).pathname)
    .root(this._public)
    .on('error', function() {
      next(null);
    })
    .on('directory', function() {
      next(null);
    })
    .pipe(this._res);
};

RequestHandler.prototype._serveLessCss = function(next) {
  if (!/\.css$/.test(this._req.url)) {
    return next(null);
  }

  var self = this;

  // @todo: use renderLessFile()
  var path = this._public + this._req.url.replace(/\.css$/, '.less');
  fs.readFile(path, 'utf-8', function(err, lessSource) {
    if (err) return next(null);

    less.render(lessSource, function(err, css) {
      if (err) return next(err);

      self._res.writeHead(200, {'Content-Type': 'text/css'});
      self._res.end(css);
    });
  });
};

RequestHandler.prototype._serve404 = function() {
  this._res.writeHead(404);
  this._res.end(this._getPageError.message);
};
