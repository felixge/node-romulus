var fs   = require('fs');
var less = require('less');

module.exports = function renderLessFile(path, cb) {
  fs.readFile(path, 'utf-8', function(err, lessSource) {
    if (err) return cb(err);

    var options = {filename: path};
    less.render(lessSource, options, function(err, css) {
      if (err) {
        cb(formatError(err));
        return;
      }

      cb(null, css);
    });
  });
};

// less errors are not instance of Error which causes problems with the async
// module. less errors also need additional formating to be useful.
function formatError(err) {
  var errObject = new Error(less.formatError(err));

  return errObject;
}
