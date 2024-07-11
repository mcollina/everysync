'use strict'

const { workerData } = require('node:worker_threads')

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

  write(workerData.data, Object.keys(obj))

  const metaView = new Int32Array(workerData.meta)

  Atomics.store(metaView, 0, 1)
  Atomics.notify(metaView, 0)

  while (true) {
    const res = Atomics.wait(metaView, 1, 0)
    Atomics.store(metaView, 1, 0)

    if (res === 'ok') {
      const { key, args } = read(workerData.data)
      // This is where the magic happens
      const result = await obj[key](...args)
      write(workerData.data, result)
      Atomics.store(metaView, 0, 1)
      Atomics.notify(metaView, 0, 1)
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
