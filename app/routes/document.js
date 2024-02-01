const { admin } = require('../auth/permissions')
const { getLatestUpdate } = require('../storage/document-table-repository')

module.exports = {
  method: 'GET',
  path: '/document',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const result = await getLatestUpdate(request.query.name)
      const response = {
        name: request.query.name,
        summary: result.summary,
        response: JSON.parse(result.response, null, 2),
        citationsResponse: JSON.parse(result.citationsResponse),
        overallSentiment: result.overallSentiment,
        confidenceScores: result.confidenceScores,
        reconiseEntities: JSON.parse(result.reconiseEntities),
        version: result.version,
        createdOn: result.createdOn,
        updatedAt: result.updatedAt,
        locked: result.locked
      }
      console.log('response', response.citationsResponse.citations)
      return h.view('document', response)
    }
  }
}
