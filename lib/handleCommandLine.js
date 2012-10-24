var buildSite    = require('./buildSite');
var createServer = require('./createServer');
var deploySite   = require('./deploySite');

module.exports = function handleCommandLine(cwd, args) {
  // @todo: make these the defaults when using the API as well.
  var options = {
    root    : cwd,
    layouts : cwd + '/layouts',
    pages   : cwd + '/pages',
    public  : cwd + '/public',
    build   : cwd + '/build',
    git     : 'git',
    ghPages : 'gh-pages',
    port    : 8080,
    stdout  : process.stdout,
    stderr  : process.stderr,
  };


  var command = args[2];
  switch (command) {
    case 'build':
      options.build = args[3] || options.build;

      // @todo the time keeping / output should be done inside buildSite
      var start = Date.now();
      buildSite(options, function(err) {
        if (err) throw err;

        console.log('You static empire was built in "%s" (took %s ms)', options.build, Date.now() - start);
      });
      break;
    case 'deploy':
      deploySite(options, function(err) {
        if (err) throw err;
      });
      break;
      break;
    default:
      var server = createServer(options);
      server.on('listening', function() {
        console.log('Building your static empire at http://localhost:' + options.port + '/ ...');
      });
      break;
  }
};
