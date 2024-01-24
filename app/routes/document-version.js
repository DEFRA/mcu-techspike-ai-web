const { getAllUpdates } = require('../storage/document-table-repository')

module.exports = {
  method: 'GET',
  path: '/document/version',
  options: {
    handler: async (request, h) => {
      const results = await getAllUpdates(request.query.name)
      const response = {
        name: request.query.name,
        results: results
      }
      return h.view('document-version', response)
    }
  }
}
