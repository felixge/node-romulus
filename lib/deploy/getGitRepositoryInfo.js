var async = require('async');
var fs = require('fs');
var execFile = require('child_process').execFile;

var exports = module.exports = function getGitRepositoryInfo(config, cb) {
  var gitRepositoryInfo = new GitRepositoryInfo(config);
  gitRepositoryInfo.get(cb);
};

function GitRepositoryInfo(config) {
  this.config = config;
  this.branch = null;
  this.remote = null;
  this.remoteUrl = null;
  this.commit = null;
  this.remoteCommit = null;
  this.remoteDeployCommit = null;
  this.dirtyTree = null;
  this.deployDirExists = null;
}

GitRepositoryInfo.prototype.get = function(cb) {
  var self = this;
  async.series([
    this.getBranch.bind(this),
    this.getRemote.bind(this),
    this.fetchRemote.bind(this),
    this.getRemoteUrl.bind(this),
    this.getCommit.bind(this),
    this.getRemoteCommit.bind(this),
    this.getRemoteDeployCommit.bind(this),
    this.checkDirtyTree.bind(this),
    this.checkDeployDirExists.bind(this),
  ], function(err) {
    delete self.config;
    cb(err, self);
  });
};

GitRepositoryInfo.prototype.getBranch = function(next) {
  var args = ['rev-parse', '--abbrev-ref', 'HEAD'];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, branch) {
    self.branch = branch.trim() || false;
    next(err);
  });
};

GitRepositoryInfo.prototype.getRemote = function(next) {
  var args = ['config', 'branch.' + this.branch + '.remote'];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, remote) {
    self.remote = remote.trim() || false;
    next(err);
  });
};

GitRepositoryInfo.prototype.fetchRemote = function(next) {
  var args = ['fetch', this.remote];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, next);
};

GitRepositoryInfo.prototype.getRemoteUrl = function(next) {
  var args = ['config', 'remote.' + this.remote + '.url'];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, url) {
    self.remoteUrl = url.trim() || false;
    next(err);
  });
};

GitRepositoryInfo.prototype.getCommit = function(next) {
  var args = ['rev-parse', 'HEAD'];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, commit) {
    self.commit = commit.trim() || false;
    next(err);
  });
};

GitRepositoryInfo.prototype.getRemoteCommit = function(next) {
  var args = ['rev-parse', '--verify', this.remote + '/' + this.branch];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, commit) {
    self.remoteCommit = commit.trim() || false;
    next(err);
  });
};

GitRepositoryInfo.prototype.getRemoteDeployCommit = function(next) {
  var args = ['rev-parse', '--verify', this.remote + '/' + this.config.deployBranch];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err, commit) {
    self.remoteDeployCommit = commit.trim() || false;
    next(null);
  });
};

GitRepositoryInfo.prototype.checkDirtyTree = function(next) {
  var args = ['diff', '--quiet', 'HEAD'];
  var options = {cwd: this.config.rootDir};

  var self = this;
  execFile(this.config.git, args, options, function(err) {
    self.dirtyTree = Boolean(err && err.code === 1);
    next(null);
  });
};

GitRepositoryInfo.prototype.checkDeployDirExists = function(next) {
  var self = this;
  fs.exists(this.config.buildDir, function(exists) {
    self.deployDirExists = exists;
    next(null);
  });
};
