var fs   = require('fs');
var less = require('less');

module.exports = function renderLessFile(path, cb) {
  fs.readFile(path, 'utf-8', function(err, lessSource) {
    if (err) return cb(err);

    less.render(lessSource, cb);
  });
};
