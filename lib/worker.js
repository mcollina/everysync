'use strict'

const { workerData } = require('node:worker_threads')
const { TO_WORKER, TO_MAIN, OFFSET } = require('./indexes')

const { read, write } = require('./objects')

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

  write(workerData.data, Object.keys(obj), OFFSET)

  const metaView = new Int32Array(workerData.data)

  Atomics.store(metaView, TO_WORKER, 1)
  Atomics.notify(metaView, TO_WORKER)

  while (true) {
    const res = Atomics.wait(metaView, TO_MAIN, 0)
    Atomics.store(metaView, TO_MAIN, 0)

    if (res === 'ok') {
      const { key, args } = read(workerData.data, OFFSET)
      // This is where the magic happens
      const result = await obj[key](...args)
      write(workerData.data, result, OFFSET)
      Atomics.store(metaView, TO_WORKER, 1)
      Atomics.notify(metaView, TO_WORKER, 1)
    }
  }
}

/*
process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})
*/

start()
