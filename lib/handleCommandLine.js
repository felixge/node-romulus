var buildSite    = require('./buildSite');
var createServer = require('./createServer');

module.exports = function handleCommandLine(cwd, args) {
  var options = {
    layouts : cwd + '/layouts',
    pages   : cwd + '/pages',
    public  : cwd + '/public',
    port    : 8080,
  };


  var command = args[2];
  switch (command) {
    case 'build':
      var outputPath = args[3] || 'build';
      var start = Date.now();
      buildSite(outputPath, options, function(err) {
        if (err) throw err;

        console.log('You static empire was built in "%s" (took %s ms)', outputPath, Date.now() - start);
      });
      break;
    case 'deploy':
      throw new Error('todo: implement this');
      break;
    default:
      var server = createServer(options);
      server.on('listening', function() {
        console.log('Building your static empire at http://localhost:' + options.port + '/ ...');
      });
      break;
  }
};
