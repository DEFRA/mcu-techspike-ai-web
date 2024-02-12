const { admin } = require('../auth/permissions')
const { listDirectories } = require('../storage/blob-repository')
const { blobConfig } = require('../config')

module.exports = {
  method: 'GET',
  path: '/',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const directories = await listDirectories(blobConfig.promptContainer, 'mcu/persona1/')
      const versions = directories.map(dir => parseInt(dir.split('/')[2]))
      console.log(versions)
      return h.view('index')
    }
  }
}
