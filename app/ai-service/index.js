const { sentimentAnalysis, reconiseEntities, keyPhrases } = require('./text-analysis-service')
const { summariseConversation, generateResponse } = require('./openai-service')

module.exports = {
  sentimentAnalysis,
  reconiseEntities,
  keyPhrases,
  summariseConversation,
  generateResponse
}
