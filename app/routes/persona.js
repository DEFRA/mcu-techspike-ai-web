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
      const personas = await Promise.all(directories.map(async dir => {
        const persona = dir.split('/')[1]
        const personaVersions = await listDirectories(blobConfig.promptContainer, `mcu/${persona}/`)
        const versions = personaVersions.map(dir => parseInt(dir.split('/')[2]))
        return { persona, versions }
      }))
      return h.view('persona', { personas, name })
    }
  }
},
{
  method: 'POST',
  path: '/persona',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const persona = request.payload.persona
      const version = request.payload.version
      return h.redirect(`/upload?persona=${persona}&version=${version}`)
    }
  }
}]
