const { getLatestUpdate, addToTable } = require('../storage/document-table-repository')
const { ask } = require('../ai-service/openai-service')

module.exports = [
  {
    method: 'POST',
    path: '/regenerate',
    options: {
      handler: async (request, h) => {
        const documentName = request.query.name
        const document = await getLatestUpdate(documentName)
        const regenerateParagraph = JSON.parse(document.response).paragraphs[request.payload.index].paragraph

        const system = 'You are an AI assistant that helps people rewrite only paragraphs for thier responses within a letter. Do not add salutaions.'
        const prompt = request.payload.prompt ?? 'Re-write the following paragraph'

        const paragraph = await ask(`rewrite and ${prompt} to the following message ${regenerateParagraph}`, system)

        const response = JSON.parse(document.response)
        console.log('response', response)
        console.log('paragraph', paragraph)
        response.paragraphs[request.payload.index].paragraph = paragraph.message

        document.version = document.version + 1

        const action = { type: 'regenerate', action: `Using the following prompt: ${prompt}, regenerate paragraph number ${parseInt(request.payload.index) + 1}`, data: paragraph }

        console.log(document)

        await addToTable(documentName, document.message, document.summary, JSON.stringify(response), document.citationsResponse, document.overallSentiment, document.confidenceScores, document.reconiseEntities, JSON.stringify(action), document.version)

        return h.redirect(`/document?name=${documentName}`)
      }
    }
  }
]
