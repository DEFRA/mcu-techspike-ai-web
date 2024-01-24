const { OpenAIClient, AzureKeyCredential } = require('@azure/openai')
const { aiConfig } = require('../config')
const client = new OpenAIClient(aiConfig.openAiEndpoint, new AzureKeyCredential(aiConfig.openAiApiKey))
const deploymentId = aiConfig.openAiDeploymentId

const summerize = async (textToSummarize) => {
  const summarizationPrompt = [`
    Identify the conversations and order the conversations and then summarize with the key points the following text, analising seniment and emotion and a draft reply and generate a json response message in the following format:
    {
      summary: 'some text',
      conversations: [
        {
          text: 'some text',
          sentiment: 'positive',
          emotion: 'happy'
        },
        {
          text: 'some text',
          sentiment: 'negative',
          emotion: 'sad'
        }
      ],
      reply: 'some text'
    }

    Text:
    """"""
    ${textToSummarize}
    """"""
  `]

  const { choices } = await client.getCompletions(deploymentId, summarizationPrompt, {
    maxTokens: 250
  })

  return choices[0].text
}

const ask = async (question, systemPrompt) => {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question }
  ]

  const result = await client.getChatCompletions(deploymentId, messages, {
    azureExtensionOptions: {
      extensions: [
        {
          type: 'AzureCognitiveSearch',
          parameters: {
            endpoint: aiConfig.searchEndpoint,
            key: aiConfig.searchKey,
            indexName: aiConfig.searchIndex,
            fieldsMapping: {
              filepathField: 'metadata_storage_name'
            }
          }
        }
      ]
    }
  })

  console.log('Usage:', result.usage)

  const citations = []

  for (const message of result.choices[0].message.context.messages) {
    const parsedCitations = JSON.parse(message.content).citations

    for (const citation of parsedCitations) {
      console.log(citation)
      citations.push({ filePath: citation.filepath, metadata: citation.metadata, chunkId: citation.chunk_id })
    }
  }

  return {
    message: result.choices[0].message.content,
    citations: {
      citations
    }
  }
}

const summariseConversation = async (message) => {
  const question = `summarize conversation, in order, in the following message ${message}`
  return ask(question, 'You are an assistant that can summarize conversations. You can also identify the sentiment and emotion of the conversation.')
}

const generateResponse = async (message) => {
  const question = `Order the following conversation ${message} and create a letter response to the originator. Acknowledging the content in the text, but with no committment. Output the paragraphs into a json array with the following structure { paragraphs: [ { paragraph: 'some text' }, { paragraph: 'some text', citation: '' } ] }`
  return ask(question, 'You are an assistant that generates JSON. you always return the JSON with no addition description, context or formatting.')
}

module.exports = {
  ask,
  summerize,
  summariseConversation,
  generateResponse
}
