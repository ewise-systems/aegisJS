const path = require('path');

module.exports = {
  mode: "development",
  entry: './build/src/ew-lib.js',
  output: {
    filename: 'ew-lib.js',
    path: path.resolve(__dirname, 'dist')
  }
};