const Joi = require('joi')

// Define config schema
const schema = Joi.object({
  openAiEndpoint: Joi.string().required(),
  openAiApiKey: Joi.string().required(),
  openAiDeploymentId: Joi.string().required(),
  textAnalyticsEndpoint: Joi.string().required(),
  textAnalyticsApiKey: Joi.string().required(),
  searchEndpoint: Joi.string().required(),
  searchKey: Joi.string().required(),
  searchIndex: Joi.string().required()
})

// Build config
const config = {
  openAiEndpoint: process.env.OPEN_AI_ENDPOINT,
  openAiApiKey: process.env.OPEN_AI_API_KEY,
  openAiDeploymentId: process.env.OPEN_AI_DEPLOYMENT_ID,
  textAnalyticsEndpoint: process.env.TEXT_ANALYTICS_ENDPOINT,
  textAnalyticsApiKey: process.env.TEXT_ANALYTICS_API_KEY,
  searchEndpoint: process.env.SEARCH_ENDPOINT,
  searchKey: process.env.SEARCH_KEY,
  searchIndex: process.env.SEARCH_INDEX
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The AI config is invalid. ${result.error.message}`)
}

module.exports = result.value
