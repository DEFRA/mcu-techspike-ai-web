const { odata } = require('@azure/data-tables')
const { getTableClient } = require('./get-table-client')
const { tableConfig } = require('../config')

const tableClient = getTableClient(tableConfig.promptTable)
const maxDate = new Date(8640000000000000)

const invertTimestamp = (timestamp) => {
  const inverted = `${maxDate - timestamp}`

  return inverted.padStart(19, '0')
}

const createEntity = (persona, systemPrompt, userPrompt, version, locked) => {
  const now = new Date()

  const entity = {
    PartitionKey: persona,
    RowKey: invertTimestamp(now),
    systemPrompt,
    userPrompt,
    createdOn: now.toISOString(),
    updatedAt: now.toISOString(),
    version: version ?? 1
  }
  return entity
}

const addToTable = async (persona, systemPrompt, userPrompt, version, locked) => {
  await tableClient.createTable()

  const entity = createEntity(persona, systemPrompt, userPrompt, version, locked)

  await tableClient.createEntity(entity)
}

const queryPersonaByPartition = async (persona, additionalOptions) => {
  await tableClient.createTable()

  const results = tableClient.listEntities({
    queryOptions: {
      ...additionalOptions,
      filter: odata`PartitionKey eq ${persona}`
    }
  })

  return results
}

const getLatestVersion = async (filename) => {
  const results = await queryPersonaByPartition(filename, { top: 1 })

  const { value: update } = await results[Symbol.asyncIterator]().next()

  return update
}

const getAllVersions = async (filename) => {
  const results = await queryPersonaByPartition(filename)

  const updates = []

  for await (const entity of results) {
    updates.push(entity)
  }

  return updates
}

module.exports = {
  createEntity,
  addToTable,
  getAllVersions,
  getLatestVersion
}
