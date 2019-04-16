const path = require("path");

module.exports = {
  mode: "development",
  entry: "./build/src/aegis.js",
  output: {
    filename: "aegis.js",
    path: path.resolve(__dirname, "dist")
  }
};