const { DefaultAzureCredential } = require('@azure/identity')
const { TableClient } = require('@azure/data-tables')
const { tableConfig } = require('../config')

let tableClient

if (tableConfig.useConnectionString) {
  console.log('Using connection string for Table Client')
  tableClient = TableClient.fromConnectionString(tableConfig.connectionString, tableConfig.documentTable, { allowInsecureConnection: true })
} else {
  console.log('Using DefaultAzureCredential for Table Client')
  tableClient = new TableClient(`https://${tableConfig.storageAccount}.table.core.windows.net`, tableConfig.documentTable, new DefaultAzureCredential())
}

module.exports = {
  tableClient
}
