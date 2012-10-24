var async = require('async');
var path  = require('path');
var fs    = require('fs');

// Resolves a url to a page similar to what Github pages does
module.exports = function getPagePath(url, pages, cb) {
  var paths = [];

  // Github pages does not consider this option for urls ending with a /
  if (!/\/$/.test(url)) {
    paths.push(path.join(pages, url + '.html'));
    paths.push(path.join(pages, url + '.md'));
  }

  paths.push(path.join(pages, url, 'index.html'));
  paths.push(path.join(pages, url, 'index.md'));

  async.forEachSeries(paths, function(path, next) {
    fs.stat(path, function(err) {
      if (err) return next();

      cb(null, path);
    });
  }, function() {
    cb(new Error('No page found for: "' + url + '". Considered paths: ' + paths.join(', ')));
  });
};
