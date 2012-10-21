var ejs  = require('ejs');
var fs   = require('fs');
var path = require('path');

module.exports = function renderPage(pagePath, layouts, cb) {
  fs.readFile(pagePath, 'utf-8', function(err, rawPage) {
    if (err) return cb(err);

    var pageScope     = {};
    var renderedPage = ejs.render(rawPage, {scope: pageScope});

    if (!pageScope.layout) {
      return cb(null, renderedPage);
    }

    var layoutPath = path.join(layouts, pageScope.layout + '.html');

    fs.readFile(layoutPath, 'utf-8', function(err, rawLayout) {
      if (err) return cb(err);

      var layoutLocals    = {page: renderedPage};
      var renderedLayout = ejs.render(rawLayout, {locals: layoutLocals});

      cb(null, renderedLayout);
    });
  });
};

