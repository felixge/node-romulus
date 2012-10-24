var ghMarkdown = require('github-flavored-markdown');
var ejs        = require('ejs');
var fs         = require('fs');
var path       = require('path');

module.exports = function renderPage(pagePath, layouts, cb) {
  fs.readFile(pagePath, 'utf-8', function(err, rawPage) {
    if (err) return cb(err);

    var pageScope     = {};
    try {
      var renderedPage = renderEjs(rawPage, pagePath, {scope: pageScope});
    } catch (err) {
      return cb(err);
    }

    var isMarkdown = pagePath.match(/\.md$/);
    if (isMarkdown) {
      try {
        renderedPage = ghMarkdown.parse(renderedPage);
      } catch (err) {
        return cb(err);
      }
    }

    if (!pageScope.layout) {
      return cb(null, renderedPage);
    }

    var layoutPath = path.join(layouts, pageScope.layout + '.html');

    fs.readFile(layoutPath, 'utf-8', function(err, rawLayout) {
      if (err) return cb(err);

      var layoutLocals   = {page: renderedPage};

      try {
        var renderedLayout = renderEjs(rawLayout, layoutPath, {locals: layoutLocals});
      } catch (err) {
        return cb(err);
      }

      cb(null, renderedLayout);
    });
  });
};

function renderEjs(input, path, options) {
  try {
    var output = ejs.render(input, options);
  } catch (err) {
    err.message = path + ':\n\n' + err.message;
    throw err;
  }

  return output;
}
