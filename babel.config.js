module.exports = {
  presets: ['@vue/app'],
  env: {
    test: {
      plugins: ['dynamic-import-node'],
      presets: ['@babel/preset-env']
    }
  }
}
