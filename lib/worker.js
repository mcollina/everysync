'use strict'

const { workerData } = require('node:worker_threads')
const { TO_WORKER, TO_MAIN, OFFSET } = require('./indexes')

const { read, write } = require('./objects')
const { wire } = require('../everysync')

async function start () {
  let obj
  try {
    obj = require(workerData.module)
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM') {
      obj = await import(workerData.module)
    } else {
      throw err
    }
  }

  await wire(workerData.data, obj)
}

/*
process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})
*/

start()
