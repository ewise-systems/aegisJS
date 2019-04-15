const path = require('path');

module.exports = {
  mode: "development",
  entry: './build/src/eww.js',
  output: {
    filename: 'eww.js',
    path: path.resolve(__dirname, 'dist')
  }
};