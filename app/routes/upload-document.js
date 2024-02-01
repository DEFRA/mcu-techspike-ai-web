const { admin } = require('../auth/permissions')
const { Readable } = require('stream')
const mammoth = require('mammoth')
const { sentimentAnalysis, reconiseEntities, summariseConversation, generateResponse } = require('../ai-service')
const uploadConstants = require('../constants/upload')
const { uploadFile } = require('../storage/blob-repository')
const Joi = require('joi')
const ViewModel = require('../models/upload')
const { addToTable } = require('../storage/document-table-repository')
const { blobConfig } = require('../config')

module.exports = [{
  method: 'GET',
  path: uploadConstants.routes.document.get,
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      return h.view(uploadConstants.views.document, new ViewModel())
    }
  }
},
{
  method: 'POST',
  path: uploadConstants.routes.document.post,
  options: {
    auth: { scope: [admin] },
    payload: {
      maxBytes: (50 * 1024 * 1024) + 250,
      multipart: true,
      timeout: false,
      output: 'stream',
      parse: true,
      allow: 'multipart/form-data'
    },
    validate: {
      payload: Joi.object({
        document: Joi.object({
          hapi: Joi.object({
            filename: Joi.string().regex(/^(.+)\.(doc|docx)$/).message('Incorrect document file type. Must be .doc or .docx.')
          }).required().unknown(true)
        }).required().unknown(true)
      }).required().unknown(true),
      failAction: (request, h, err) => {
        console.log(err)
        return h.view(uploadConstants.views.document, new ViewModel(err)).takeover(400)
      }
    },
    handler: async (request, h) => {
      const playground = request.payload.playground
      const filename = `mcu-document-${new Date().toISOString()}`
      const fileBuffer = request.payload.document._data

      const stream = new Readable()
      stream.push(fileBuffer)
      stream.push(null)

      await uploadFile(filename, stream, blobConfig.documentContainer, 'new/')
      const documentsContent = await mammoth.extractRawText({ buffer: fileBuffer })

      if (playground !== 'true') {
        const textSummary = await summariseConversation(documentsContent.value)

        const message = textSummary.message

        const response = await generateResponse(documentsContent.value)
        const documents = []
        documents.push(message)

        const sentiment = await sentimentAnalysis(documents)
        const entities = await reconiseEntities(documents)

        await addToTable(filename, documentsContent.value, message, response.message, JSON.stringify(response.citations), sentiment.overallSentiment, JSON.stringify(sentiment.confidenceScores), JSON.stringify(entities))
        return h.redirect(`${uploadConstants.routes.document.redirectToDocument}?name=${filename}`)
      }

      await addToTable(filename, documentsContent.value, null, null, null, null, null, null)
      return h.redirect(`${uploadConstants.routes.document.redirectToPersona}?name=${filename}`)
    }
  }
}]
