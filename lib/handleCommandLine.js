var buildSite    = require('./buildSite');
var createServer = require('./createServer');
var deploySite   = require('./deploySite');
var createConfig = require('./config');

module.exports = function handleCommandLine(cwd, args) {
  var config = createConfig({root: cwd});

  var command = args[2];
  switch (command) {
    case 'build':
      config.build = args[3] || config.build;

      // @todo the time keeping / output should be done inside buildSite
      var start = Date.now();
      buildSite(config, function(err) {
        if (err) throw err;

        console.log('You static empire was built in "%s" (took %s ms)', config.build, Date.now() - start);
      });
      break;
    case 'deploy':
      deploySite(config, function(err) {
        if (err) throw err;
      });
      break;
      break;
    default:
      var server = createServer(config);
      server.on('listening', function() {
        console.log('Building your static empire at http://localhost:' + config.port + '/ ...');
      });
      break;
  }
};
