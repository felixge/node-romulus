var async        = require('async');
var childProcess = require('child_process');
var fs           = require('fs');
var buildSite    = require('./buildSite');

module.exports = function deploySite(options, cb) {
  var deployment = new Deployment(options);
  deployment.execute(cb);
};

function Deployment(options) {
  this._git     = options.git;
  this._root    = options.root;
  this._build   = options.build;
  this._ghPages = options.ghPages;
  this._stdout  = options.stdout;
  this._stderr  = options.stderr;
  this._public  = options.public;
  this._pages   = options.pages;
  this._layouts = options.layouts;
  this._start   = undefined;
  this._github  = undefined;
}

Deployment.prototype.execute = function(cb) {
  this._start = Date.now();

  async.waterfall([
    this._createClone.bind(this),
    this._checkoutGithubPagesBranch.bind(this),
    this._cleanGithubPagesBranch.bind(this),
    this._buildSite.bind(this),
    this._getGithubRemote.bind(this),
    this._setGithubRemote.bind(this),
    this._stageDeployCommit.bind(this),
    this._createDeployCommit.bind(this),
    this._forcePushToGithub.bind(this),
    this._outputDuration.bind(this),
  ], cb);
};

Deployment.prototype._createClone = function(next) {
  this._stdout.write('Creating a local clone of your site ...\n');

  var args = ['clone', this._root, this._build];
  this._execute(this._git, {args: args}, next);
};

Deployment.prototype._checkoutGithubPagesBranch = function(next) {
  this._stdout.write('Checking out "' + this._ghPages + '"...\n');
  var args = ['checkout', '--orphan', this._ghPages];
  this._execute(this._git, {args: args, cwd: this._build}, next);
};

Deployment.prototype._cleanGithubPagesBranch = function(next) {
  this._stdout.write('Cleaning "' + this._ghPages + '"...\n');
  var args = ['rm', '-rf', '.'];
  this._execute(this._git, {args: args, cwd: this._build, silent: true}, next);
};

Deployment.prototype._buildSite = function(next) {
  this._stdout.write('Building your statice empire ...\n');

  var options = {
    build   : this._build,
    public  : this._public,
    pages   : this._pages,
    layouts : this._layouts,
  };

  buildSite(options, next);
};

Deployment.prototype._getGithubRemote = function(next) {
  this._stdout.write('Determining github remote url ...\n');

  var self = this;
  var args = ['remote', '-v'];
  childProcess.execFile(this._git, args, function(err, stdout, stderr) {
    if (err) return next(err);

    var match = stdout.match(/origin\s+([^\s]+).*push/);
    if (!match) {
      next(new Error('Could not find push origin in: ' + stdout));
      return;
    }

    self._github = match[1];
    next(null);
  });
};

Deployment.prototype._setGithubRemote = function(next) {
  this._stdout.write('Setting up github remote ...\n');
  var args = ['remote', 'add', 'github', this._github];
  var options = {cwd: this._build};

  childProcess.execFile(this._git, args, options, function(err) {
    next(err);
  });
};

Deployment.prototype._stageDeployCommit = function(next) {
  this._stdout.write('Staging deploy commit ...\n');
  var args = ['add', '.'];
  var options = {cwd: this._build};

  childProcess.execFile(this._git, args, options, function(err) {
    next(err);
  });
};

Deployment.prototype._createDeployCommit = function(next) {
  this._stdout.write('Creating deploy commit ...\n');

  var args = ['commit', '-m', 'panem et circenses'];
  var options = {cwd: this._build};

  childProcess.execFile(this._git, args, options, function(err) {
    next(err);
  });
};

Deployment.prototype._forcePushToGithub = function(next) {
  this._stdout.write('Force pushing "' + this._ghPages + '" to ' + this._github + '...\n');

  var args = ['push', '-f', '--progress', 'github', this._ghPages];
  this._execute(this._git, {args: args, cwd: this._build}, next);
};

Deployment.prototype._outputDuration = function(next) {
  var duration = Date.now() - this._start;
  this._stdout.write('Deployed your static empire (took ' + duration + ' ms)\n');

  next(null);
};

Deployment.prototype._execute = function(program, options, cb) {
  var child = childProcess.spawn(program, options.args, options);

  if (!options.silent) {
    child.stdout.pipe(this._stdout, {end: false});
    child.stderr.pipe(this._stderr, {end: false});
  }

  child.on('exit', function(code) {
    var err = null;
    if (code !== 0) {
      err = new Error(program + ' exit code was: ' + code);
      err.code = code;
    }

    cb(err);
  });
};
