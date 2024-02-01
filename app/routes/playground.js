const { admin } = require('../auth/permissions')
const { getLatestUpdate } = require('../storage/document-table-repository')
const { getDirectories, downloadFileToString, uploadText } = require('../storage/blob-repository')
const { ask } = require('../ai-service/openai-service')
const { blobConfig } = require('../config')

const getParams = (request) => {
  const name = request.query.name ?? request.payload.name
  const persona = request.query.persona ?? request.payload.persona
  const version = request.query.version ?? request.payload.version
  return { name, persona, version }
}

const getResponse = async (request) => {
  const { name, persona, version } = getParams(request)
  const promptDirectory = `mcu/${persona}/${version}/`
  const systemPrompt = await downloadFileToString('system-prompt.txt', blobConfig.promptContainer, promptDirectory)
  const prompt = await downloadFileToString('prompt.txt', blobConfig.promptContainer, promptDirectory)
  const versions = await getDirectories(blobConfig.promptContainer, 'mcu/persona1/')
  return { name, systemPrompt, prompt, persona, version, versions: versions.persona.versions }
}

module.exports = [{
  method: 'GET',
  path: '/playground',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const response = await getResponse(request)
      return h.view('playground', response)
    }
  }
},
{
  method: 'POST',
  path: '/playground',
  options: {
    auth: { scope: [admin] },
    handler: async (request, h) => {
      const { name: documentName, persona, systemPrompt, prompt, save: payloadSave, newVersion: payloadNewVersion } = request.payload
      let output = request.payload.output
      let version = request.payload.version

      const versions = await getDirectories(blobConfig.promptContainer, `mcu/${persona}/`)

      const newVersion = !!payloadNewVersion
      let save = !!payloadSave

      if (newVersion) {
        save = true
      }

      if (!save) {
        const document = await getLatestUpdate(documentName)
        output = await ask(`${prompt} ${document.message}`, systemPrompt)
      } else {
        if (newVersion) {
          version = versions.persona.latestVersion + 1
          versions.persona.versions.push(version)
        }
        await uploadText('system-prompt.txt', systemPrompt, blobConfig.promptContainer, `mcu/${persona}/${version}/`)
        await uploadText('prompt.txt', prompt, blobConfig.promptContainer, `mcu/${persona}/${version}/`)
      }

      return h.view('playground', { name: documentName, persona, version, versions: versions.persona.versions, systemPrompt, prompt, output: output.message ?? null, citations: output?.citations?.citations ?? null, usage: output.usage ?? null })
    }
  }
}]
