var buildSite    = require('./buildSite');
var createServer = require('./createServer');

module.exports = function handleCommandLine(cwd, args) {
  var options = {
    layouts : cwd + '/layouts',
    pages   : cwd + '/pages',
    public  : cwd + '/public',
    port    : 8080,
  };


  var outputPath = process.argv[2];
  if (outputPath) {
    var start = Date.now();
    buildSite(options, function(err) {
      if (err) throw err;

      console.log('time', Date.now() - start, 'ms');
    });
    return;
  }

  var server = createServer(options);
  server.on('listening', function() {
    console.log('Building your static empire at http://localhost:' + options.port + '/ ...');
  });
};
