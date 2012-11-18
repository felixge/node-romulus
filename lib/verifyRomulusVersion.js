var fs = require('fs');
var semver = require('semver');
var version = require('../package.json').version;

var exports = module.exports = function verifyRomulusVersion(config, cb) {
  fs.readFile(config.rootDir + '/package.json', 'utf-8', function(err, string) {
    if (err ) {
      if (err.code === 'ENOENT') {
        cb(null);
      } else {
        cb(err);
      }

      return;
    }

    try {
      var json = JSON.parse(string);
    } catch (err) {
      cb(err);
      return;
    }

    var range = json.devDependencies && json.devDependencies.romulus;
    if (!range) {
      cb(null);
      return;
    }

    if (semver.satisfies(version, range)) {
      cb(null);
      return;
    }

    cb(new Error('Incompatible romulus version. This site requires: ' + range));
  });
};
