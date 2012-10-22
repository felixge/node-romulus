var glob = require('glob');

module.exports = function findFiles(dir, pattern, cb) {
  glob(pattern, {cwd: dir}, function(err, files) {
    if (err) return cb(err);

    var fullPaths = files.map(function(relativePath) {
      return dir + '/' + relativePath;
    });

    cb(null, fullPaths);
  });
};
