var buildSite = require('./buildSite');
var createServer = require('./createServer');
var deploySite = require('./deploySite');
var createConfig = require('./config');
var verifyRomulusVersion = require('./verifyRomulusVersion');

module.exports = function handleCommandLine(cwd, args) {
  var config = createConfig({rootDir: cwd});
  verifyRomulusVersion(config, function(err) {
    if (err) {
      throw err;
    }

    runCommand(config, args);
  });
};

function runCommand(config, args) {
  var command = args[2];
  switch (command) {
    case 'build':
      config.buildDir = args[3] || config.buildDir;

      // @todo the time keeping / output should be done inside buildSite
      var start = Date.now();
      buildSite(config, function(err) {
        if (err) throw err;

        console.log('You static empire was built in "%s" (took %s ms)', config.buildDir, Date.now() - start);
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
}
