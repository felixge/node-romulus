// @todo: the fsExtra package is a bit bloated, would love to replace it with
// something smaller.

var async          = require('async');
var fs             = require('fs');
var fsExtra        = require('fs-extra');
var path           = require('path');
var findFiles      = require('./findFiles');
var renderLessFile = require('./renderLessFile');
var renderPage     = require('./renderPage');

module.exports = function buildSite(outputPath, options, cb) {
  var siteBuilder = new SiteBuilder(outputPath, options);
  siteBuilder.execute(cb);
};

function SiteBuilder(outputPath, options) {
  this._outputPath = outputPath;
  this._public     = options.public;
  this._pages      = options.pages;
  this._layouts    = options.layouts;
}

SiteBuilder.prototype.execute = function(cb) {
  async.waterfall([
    this._copyPublic.bind(this),
    this._findLessFiles.bind(this),
    this._renderLessFiles.bind(this),
    this._findPageFiles.bind(this),
    this._renderPages.bind(this),
  ], cb);
};

SiteBuilder.prototype._copyPublic = function(cb) {
  fsExtra.copy(this._public, this._outputPath, function(err) {
    // handles the case where the `this._public` folder does not exist.
    // @todo: submit a patch upstream that provides a proper error object
    // here.
    if (Array.isArray(err) && err.length === 0) {
      cb(null);
      return;
    }

    cb(err);
  });
};

SiteBuilder.prototype._findLessFiles = function(cb) {
  findFiles(this._outputPath, '**/*.less', cb);
};

SiteBuilder.prototype._renderLessFiles = function(lessPaths, cb) {
  async.forEachLimit(lessPaths, 8, function(lessPath, next) {
    renderLessFile(lessPath, function(err, css) {
      if (err) return next(err);

      var cssPath = lessPath.replace(/\.less$/, '.css');
      fs.writeFile(cssPath, css, function(err) {
        if (err) return next(err);

        fs.unlink(lessPath, next);
      });
    });
  }, cb);
};

SiteBuilder.prototype._findPageFiles = function(cb) {
  findFiles(this._pages, '**/*.html', cb);
};

SiteBuilder.prototype._renderPages = function(pagePaths, cb) {
  var self = this;
  async.forEachLimit(pagePaths, 8, function(pagePath, next) {
    renderPage(pagePath, self._layouts, function(err, html) {
      if (err) return next(err);

      var relativePagePath = pagePath.substr(self._pages.length + 1);
      var htmlPath = self._outputPath + '/' + relativePagePath;

      fsExtra.mkdirp(path.dirname(htmlPath), function(err) {
        if (err) return cb(err);

        fs.writeFile(htmlPath, html, next);
      });
    });
  }, cb);
};
