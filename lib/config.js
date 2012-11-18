var exports = module.exports = function createConfig(options) {
  return new Config(options);
};

exports.Config = Config;
function Config(options) {
  this.stdout = options.stdout || process.stdout;
  this.stderr = options.stdout || process.stderr;
  this.rootDir = options.rootDir || process.cwd;
  this.layoutsDir = this.rootDir + '/layouts';
  this.pagesDir = this.rootDir + '/pages';
  this.publicDir = this.rootDir + '/public';
  this.buildDir = this.rootDir + '/build';
  this.git = 'git';
  this.deployBranch = 'gh-pages';
  this.port = 8080;
}
