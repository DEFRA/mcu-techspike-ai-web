const { blobServiceClient } = require('./get-blob-client')
const { blobConfig } = require('../config')

const uploadDocumentFile = async (filename, stream) => {
  const container = blobServiceClient.getContainerClient(blobConfig.documentContainer)

  await container.createIfNotExists()

  const blob = await container.getBlockBlobClient(`new/${filename}`)

  await blob.uploadStream(stream)

  return blob
}

module.exports = {
  uploadDocumentFile
}
