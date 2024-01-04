const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: './',
  assetsDir:"flow_static",
  transpileDependencies: true,
  lintOnSave: false
})
