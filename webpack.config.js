const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/aegis.js",
  devtool: "source-map",
  output: {
    filename: "aegis.js",
    path: path.resolve(__dirname, "dist"),
    library: "ewise_aegisJS",
  },
  resolve: {
    extensions: [".js", ".json"]
  }
};