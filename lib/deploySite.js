var async = require('async');
var childProcess = require('child_process');
var execFile = require('child_process').execFile;
var fs = require('fs');
var buildSite = require('./buildSite');
var getGitRepositoryInfo = require('./deploy/getGitRepositoryInfo');

module.exports = function deploySite(config, cb) {
  var deployment = new Deployment(config);
  deployment.execute(cb);
};

function Deployment(config) {
  this.config = config;
}

Deployment.prototype.execute = function(cb) {
  console.log('Getting git repository info ...');

  var self = this;
  getGitRepositoryInfo(this.config, function(err, info) {
    var tasks = [];

    if (info.dirtyTree) {
      cb(new Error('Refusing to deploy, your tree is dirty. Please commit your changes.'));
      return;
    }

    if (info.commit !== info.remoteCommit) {
      cb(new Error('Refusing to deploy, your branch "' + info.branch + '" is not up-to-date with your remote "' + info.remote + '". Please push before deploying.'));
      return;
    }

    if (!info.deployDirExists) {
      tasks.push(self.createDeployClone.bind(self));
      tasks.push(self.createOrphanDeployBranch.bind(self));
    }

    if (info.remoteDeployCommit) {
      tasks.push(self.updateLocalClone.bind(self));
      tasks.push(self.checkoutLatestDeployCommit.bind(self, info.remoteDeployCommit));
    }

    tasks.push(self.cleanDeployTree.bind(self));
    tasks.push(self.buildSite.bind(self));
    tasks.push(self.stageDeployCommit.bind(self));
    tasks.push(self.createDeployCommit.bind(self, info));
    tasks.push(self.pushDeploy.bind(self, info));

    async.series(tasks, cb);
  });
};

Deployment.prototype.createDeployClone = function(next) {
  this.config.stdout.write('Creating deploy directory by cloning local repository ...\n');

  var args = ['clone', this.config.rootDir, this.config.buildDir];
  execFile(this.config.git, args, next);
};

Deployment.prototype.createOrphanDeployBranch = function(next) {
  this.config.stdout.write('Creating orphan deploy branch "' + this.config.deployBranch + '"...\n');
  var args = ['checkout', '--orphan', this.config.deployBranch];
  var options = {cwd: this.config.buildDir};
  execFile(this.config.git, args, options, next);
};

Deployment.prototype.updateLocalClone = function(next) {
  this.config.stdout.write('Updating local clone ...\n');
  var args = ['fetch'];
  var options = {cwd: this.config.buildDir};
  execFile(this.config.git, args, options, next);
};

Deployment.prototype.checkoutLatestDeployCommit = function(commit, next) {
  this.config.stdout.write('Checking out previous deploy commit "' + commit + '" ...\n');
  var args = ['reset', '--hard', commit];
  var options = {cwd: this.config.buildDir};
  execFile(this.config.git, args, options, next);
};

Deployment.prototype.cleanDeployTree = function(next) {
  this.config.stdout.write('Cleaning deploy tree ...\n');
  var args = ['rm', '-rf', '.'];
  var options = {cwd: this.config.buildDir};
  var self = this;
  execFile(this.config.git, args, options, function(err, stdout, stderr) {
    if (err) {
      var triedToCleanEmptyTree = (err.code === 128);
      // This happens if somebody tries to deploy an empty repo
      if (triedToCleanEmptyTree) {
        self.config.stdout.write('Warning: Could not clean empty tree ...\n');
        next(null);
        return;
      }
    }

    next(err);
  });
};

Deployment.prototype.buildSite = function(next) {
  this.config.stdout.write('Building your statice empire ...\n');
  buildSite(this.config, next);
};

Deployment.prototype.stageDeployCommit = function(next) {
  this.config.stdout.write('Staging deploy commit ...\n');
  var args = ['add', '-A'];
  var options = {cwd: this.config.buildDir};
  execFile(this.config.git, args, options, next);
};

Deployment.prototype.createDeployCommit = function(info, next) {
  this.config.stdout.write('Creating deploy commit ...\n');

  var message = 'Deploying ' + info.commit + ' from branch: ' + info.branch;
  var args = ['commit', '--allow-empty', '-m', message];
  var options = {cwd: this.config.buildDir};
  execFile(this.config.git, args, options, next);
};

Deployment.prototype.pushDeploy = function(info, next) {
  this.config.stdout.write('Pushing to "' + this.config.deployBranch + '" in "' + info.remoteUrl + '" ...\n');
  var args = ['push', '--progress', info.remoteUrl, this.config.deployBranch + ':' + this.config.deployBranch];

  var options = {cwd: this.config.buildDir};
  var child = execFile(this.config.git, args, options, next);

  child.stdout.pipe(this.config.stdout);
  child.stderr.pipe(this.config.stderr);
};
