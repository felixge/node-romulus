var getPagePaths = require('./getPagePaths');

module.exports = function buildSite(options, cb) {
  var pagesDir = options.pages;

  getPagePaths(pagesDir, function(err, pages) {
    if (err) return cb(err);

    throw new Error('unfinished: needs recursive mkdir and copy module');
  });
};
