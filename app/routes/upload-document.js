const { admin } = require('../auth/permissions')
const { Readable } = require('stream')
const mammoth = require('mammoth')
const { ask } = require('../ai-service/openai-service')
const uploadConstants = require('../constants/upload')
const { uploadFile } = require('../storage/blob-repository')
const Joi = require('joi')
const ViewModel = require('../models/upload')
const { addToTable } = require('../storage/document-table-repository')
const { blobConfig } = require('../config')
const { downloadFileToString } = require('../storage/blob-repository')

module.exports = [{
  method: 'GET',
  path: uploadConstants.routes.document.get,
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const persona = request.query.persona ?? request.payload.persona
      const version = request.query.version ?? request.payload.version
      return h.view(uploadConstants.views.document, { ...new ViewModel(), persona, version })
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
      const persona = request.payload.persona
      const version = request.payload.version
      const filename = `mcu-document-${new Date().toISOString()}`
      const fileBuffer = request.payload.document._data

      const stream = new Readable()
      stream.push(fileBuffer)
      stream.push(null)

      await uploadFile(filename, stream, blobConfig.documentContainer, 'new/')
      const documentsContent = await mammoth.extractRawText({ buffer: fileBuffer })

      if (playground !== 'true') {
        const promptDirectory = `mcu/${persona}/${version}/`
        const systemPrompt = await downloadFileToString('system-prompt.txt', blobConfig.promptContainer, promptDirectory)
        const prompt = await downloadFileToString('prompt.txt', blobConfig.promptContainer, promptDirectory)
        const output = await ask(`${prompt} ${documentsContent.value}`, systemPrompt)
        await addToTable(filename, documentsContent.value, null, JSON.stringify(output), null, null, null, null)
        return h.redirect(`${uploadConstants.routes.document.redirectToGenerateDocument}?name=${filename}&persona=${persona}&version=${version}`)
      }

      await addToTable(filename, documentsContent.value, null, null, null, null, null, null)
      return h.redirect(`${uploadConstants.routes.document.redirectToPlayground}?name=${filename}&persona=${persona}&version=${version}`)
    }
  }
}]
