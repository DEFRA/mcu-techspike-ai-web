const { odata } = require('@azure/data-tables')
const { getTableClient } = require('./get-table-client')
const { tableConfig } = require('../config')

const tableClient = getTableClient(tableConfig.documentTable)
const maxDate = new Date(8640000000000000)

const invertTimestamp = (timestamp) => {
  const inverted = `${maxDate - timestamp}`

  return inverted.padStart(19, '0')
}

const createEntity = (filename, message, summary, response, citations, overallSentiment, confidenceScores, reconiseEntities, action, version, locked) => {
  const now = new Date()

  const entity = {
    PartitionKey: filename,
    RowKey: invertTimestamp(now),
    message,
    summary,
    response,
    citationsResponse: citations,
    overallSentiment,
    confidenceScores,
    reconiseEntities,
    createdOn: now.toISOString(),
    updatedAt: now.toISOString(),
    version: version ?? 1,
    locked: locked ?? false,
    action: action ?? JSON.stringify({ type: 'new', action: 'Analyse new document', data: '' })
  }
  return entity
}

const addToTable = async (filename, message, summary, response, citations, overallSentiment, confidenceScores, reconiseEntities, action, version, locked) => {
  await tableClient.createTable()

  const entity = createEntity(filename, message, summary, response, citations, overallSentiment, confidenceScores, reconiseEntities, action, version, locked)

  await tableClient.createEntity(entity)
}

const queryImportsByPartition = async (filename, additionalOptions) => {
  await tableClient.createTable()

  const results = tableClient.listEntities({
    queryOptions: {
      ...additionalOptions,
      filter: odata`PartitionKey eq ${filename}`
    }
  })

  return results
}

const getLatestUpdate = async (filename) => {
  const results = await queryImportsByPartition(filename, { top: 1 })

  const { value: update } = await results[Symbol.asyncIterator]().next()

  return update
}

const getAllUpdates = async (filename) => {
  const results = await queryImportsByPartition(filename)

  const updates = []

  for await (const entity of results) {
    updates.push(entity)
  }

  return updates
}

module.exports = {
  getLatestUpdate,
  getAllUpdates,
  addToTable
}
