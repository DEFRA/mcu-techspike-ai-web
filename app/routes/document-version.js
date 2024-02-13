const { admin } = require('../auth/permissions')
const { getAllUpdates } = require('../storage/document-table-repository')

module.exports = {
  method: 'GET',
  path: '/document/version',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const results = await getAllUpdates(request.query.name)
      const response = {
        name: request.query.name,
        results
      }
      return h.view('document-version', response)
    }
  }
}
