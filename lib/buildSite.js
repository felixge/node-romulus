// @todo: the fsExtra package is a bit bloated, would love to replace it with
// something smaller.

var async          = require('async');
var fs             = require('fs');
var fsExtra        = require('fs-extra');
var path           = require('path');
var findFiles      = require('./findFiles');
var renderLessFile = require('./renderLessFile');
var renderPage     = require('./renderPage');

module.exports = function buildSite(config, cb) {
  var siteBuilder = new SiteBuilder(config);
  siteBuilder.execute(cb);
};

function SiteBuilder(config) {
  this.config = config;
}

SiteBuilder.prototype.execute = function(cb) {
  async.waterfall([
    this.copyPublic.bind(this),
    this.findLessFiles.bind(this),
    this.renderLessFiles.bind(this),
    this.findPageFiles.bind(this),
    this.renderPages.bind(this),
  ], cb);
};

SiteBuilder.prototype.copyPublic = function(cb) {
  fsExtra.copy(this.config.public, this.config.buildDir, function(err) {
    // handles the case where the `this.config.public` folder does not exist.
    // @todo: submit a patch upstream that provides a proper error object
    // here.
    if (Array.isArray(err) && err.length === 0) {
      cb(null);
      return;
    }

    cb(err);
  });
};

SiteBuilder.prototype.findLessFiles = function(cb) {
  findFiles(this.config.buildDir, '**/*.less', cb);
};

SiteBuilder.prototype.renderLessFiles = function(lessPaths, cb) {
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

SiteBuilder.prototype.findPageFiles = function(cb) {
  findFiles(this.config.pages, '**/*.{html,md}', cb);
};

SiteBuilder.prototype.renderPages = function(pagePaths, cb) {
  var self = this;
  async.forEachLimit(pagePaths, 8, function(pagePath, next) {
    renderPage(pagePath, self.config.layouts, function(err, html) {
      if (err) return next(err);

      var relativePagePath = pagePath.substr(self.config.pages.length + 1);
      relativePagePath = relativePagePath.replace(/[^.]+$/, 'html');
      var htmlPath = self.config.buildDir + '/' + relativePagePath;

      fsExtra.mkdirp(path.dirname(htmlPath), function(err) {
        if (err) return cb(err);

        fs.writeFile(htmlPath, html, next);
      });
    });
  }, cb);
};
