const path = require('path')
function resolveSrc(_path) {
  return path.join(__dirname, _path)
}
const aliases = {
  '@': 'src',
  '@src': 'src',
  'stylus': 'src/assets/stylus',
}
module.exports = {
  webpack: {},
  jest: {}
}
for (const alias in aliases) {
  module.exports.webpack[alias] = resolveSrc(aliases[alias])
  module.exports.jest['^' + alias + '/(.*)$'] =
    '<rootDir>/' + aliases[alias] + '/$1'
}