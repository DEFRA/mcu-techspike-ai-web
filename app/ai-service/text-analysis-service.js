const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics')
const { aiConfig } = require('../config')
const client = new TextAnalyticsClient(aiConfig.textAnalyticsEndpoint, new AzureKeyCredential(aiConfig.textAnalyticsApiKey))

const sentimentAnalysis = async (documents) => {
  const sentimentResults = await client.analyzeSentiment(documents)

  const sentimentResult = {}

  for (const result of sentimentResults) {
    if (result.error === undefined) {
      sentimentResult.overallSentiment = result.sentiment
      sentimentResult.confidenceScores = result.confidenceScores
    } else {
      console.error('Encountered an error:', result.error)
    }
  }

  return sentimentResult
}

const reconiseEntities = async (documents) => {
  const entitesResults = await client.recognizeEntities(documents, 'en')
  const entityResponse = { entities: [] }
  for (const result of entitesResults) {
    if (result.error === undefined) {
      for (const entity of result.entities) {
        entityResponse.entities.push(entity)
      }
    } else {
      console.error('Encountered an error:', result.error)
    }
  }

  return entityResponse
}

const keyPhrases = async (documents) => {
  const keyPhrasesresults = await client.extractKeyPhrases(documents, 'en')

  for (const result of keyPhrasesresults) {
    if (result.error === undefined) {
      console.log('-- Extracted key phrases for input', result.id, '--')
      console.log(result.keyPhrases)
    } else {
      console.error('Encountered an error:', result.error)
    }
  }
}

module.exports = {
  sentimentAnalysis,
  reconiseEntities,
  keyPhrases
}
