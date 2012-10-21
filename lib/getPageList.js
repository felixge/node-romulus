var glob = require('glob');

module.exports = function findPages(options, cb) {
  var dir = options.pages;

  glob('**/*.html', {cwd: dir}, function(err, files) {
    if (err) return cb(err);

    var fullPaths = files.map(function(relativePath) {
      return dir + '/' + relativePath;
    });

    cb(null, fullPaths);
  });
};
