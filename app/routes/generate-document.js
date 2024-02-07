const { admin } = require('../auth/permissions')
const { getLatestUpdate } = require('../storage/document-table-repository')

module.exports = {
  method: 'GET',
  path: '/generate-document',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const persona = request.query.persona
      const version = request.query.version
      const result = await getLatestUpdate(request.query.name)
      const documentResponse = JSON.parse(result.response)
      const { summary, reply } = JSON.parse(documentResponse.message)
      return h.view('generate-document', { summary, reply, persona, version })
    }
  }
}
