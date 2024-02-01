const routes = [].concat(
  require('../routes/assets'),
  require('../routes/index'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/upload-document'),
  require('../routes/document'),
  require('../routes/document-version'),
  require('../routes/regenerate'),
  require('../routes/playground'),
  require('../routes/prompt')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
