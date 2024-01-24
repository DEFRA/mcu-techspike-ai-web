const routes = [].concat(
  require('../routes/assets'),
  require('../routes/index'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/upload/upload-document'),
  require('../routes/document'),
  require('../routes/document-version'),
  require('../routes/regenerate')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, _) => {
      server.route(routes)
    }
  }
}
