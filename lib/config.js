var exports = module.exports = function createConfig(options) {
  return new Config(options);
};

exports.Config = Config;
function Config(options) {
  this.stdout = options.stdout || process.stdout;
  this.stderr = options.stdout || process.stderr;
  // @TODO: add 'Dir' suffix to these
  this.root = options.root || process.cwd;
  this.layouts = this.root + '/layouts';
  this.pages = this.root + '/pages';
  this.public = this.root + '/public';
  this.buildDir = this.root + '/build';
  this.git = 'git';
  this.deployBranch = 'gh-pages';
  this.port = 8080;
}
