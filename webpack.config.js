const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/aegis.ts",
  devtool: "source-map",
  output: {
    filename: "aegis.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".json"]
  },
  module: {
      rules: [
        // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
        {
          test: /\.ts$/,
          use: ["ts-loader"],
          exclude: /(node_modules|test|spec\.ts)/
        }
      ]
  }
};