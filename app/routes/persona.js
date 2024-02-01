const { admin } = require('../auth/permissions')
const { listDirectories } = require('../storage/blob-repository')
const { blobConfig } = require('../config')

module.exports = [{
  method: 'GET',
  path: '/persona',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const name = request.query.name
      const directories = await listDirectories(blobConfig.promptContainer, 'mcu/')
      const personas = directories.map(dir => dir.split('/')[1])
      console.log(personas)
      return h.view('persona', { personas, name })
    }
  }
}]
