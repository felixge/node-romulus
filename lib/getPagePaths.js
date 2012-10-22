var glob = require('glob');

// @todo rename to findPageFiles
module.exports = function getPagePaths(pagesDir, cb) {
  glob('**/*.html', {cwd: pagesDir}, function(err, files) {
    if (err) return cb(err);

    var fullPaths = files.map(function(relativePath) {
      return pagesDir + '/' + relativePath;
    });

    cb(null, fullPaths);
  });
};
