var getPagePath    = require('./getPagePath');
var renderPage     = require('./renderPage');
var send           = require('send');
var url            = require('url');
var async          = require('async');
var less           = require('less');
var fs             = require('fs');
var renderLessFile = require('./renderLessFile');

module.exports = function handleRequest(options) {
  var handler = new RequestHandler(options);
  handler.execute();
};

function RequestHandler(options) {
  this.req = options.req;
  this.res = options.res;
  this.config = options.config;
}

RequestHandler.prototype.execute = function() {
  var self = this;
  async.series([
    this.servePage.bind(this),
    this.serveAsset.bind(this),
    this.serveLessCss.bind(this),
    this.serve404.bind(this),
  ], function(err) {
    self.res.writeHead(500);
    self.res.end(err.stack);
  });
};

RequestHandler.prototype.servePage = function(next) {
  var self = this;
  getPagePath(this.req.url, this.config.pagesDir, function(err, pagePath) {
    if (err) {
      self.getPageError = err;
      next(null);
      return;
    }

    renderPage(pagePath, self.config.layoutsDir, function(err, html) {
      if (err) return next(err);

      self.res.setHeader('Content-Type', 'text/html');
      self.res.end(html);
    })
  });
};

RequestHandler.prototype.serveAsset = function(next) {
  send(this.req, url.parse(this.req.url).pathname)
    .root(this.config.publicDir)
    .on('error', function() {
      next(null);
    })
    .on('directory', function() {
      next(null);
    })
    .pipe(this.res);
};

RequestHandler.prototype.serveLessCss = function(next) {
  if (!/\.css$/.test(this.req.url)) {
    return next(null);
  }

  var self = this;

  var path = this.config.publicDir + this.req.url.replace(/\.css$/, '.less');
  renderLessFile(path, function(err, css) {
    if (!err) {
      self.res.writeHead(200, {'Content-Type': 'text/css'});
      self.res.end(css);
      return;
    }

    var fileNotFound = (err.code === 'ENOENT');
    if (fileNotFound) {
      next(null);
    } else {
      next(err);
    }
  });
};

RequestHandler.prototype.serve404 = function() {
  this.res.writeHead(404);
  this.res.end(this.getPageError.message);
};
