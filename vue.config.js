const configureWebpack = (config) => {
  if (process.env.NODE_ENV !== "development") {
    // prevent class name mangling
    config.optimization.minimizer[0].options.terserOptions.keep_classnames = true;
  }
};

const chainWebpack = (config) => {};

module.exports = {
  chainWebpack,
  configureWebpack,
  transpileDependencies:true,
};
