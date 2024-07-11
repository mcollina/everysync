'use strict'

const { read, write } = require('./lib/objects')
const {
  OFFSET,
  TO_MAIN,
  TO_WORKER,
} = require('./lib/indexes')

function makeSync (data) {
  const metaView = new Int32Array(data)

  const res = Atomics.wait(metaView, TO_WORKER, 0, 1000)
  Atomics.store(metaView, TO_WORKER, 0)

  if (res === 'ok') {
    const obj = read(data, OFFSET)

    const api = {}
    for (const key of obj) {
      api[key] = (...args) => {
        write(data, { key, args }, OFFSET)
        Atomics.store(metaView, TO_MAIN, 1)
        Atomics.notify(metaView, TO_MAIN, 1)
        const res = Atomics.wait(metaView, TO_WORKER, 0)
        Atomics.store(metaView, TO_WORKER, 0)
        if (res === 'ok') {
          const obj = read(data, OFFSET)
          return obj
        } else {
          throw new Error('Worker failed to respond')
        }
      }
    }

    return api
  } else {
    throw new Error('Worker failed to initialize')
  }
}

async function wire (data, obj) {
  write(data, Object.keys(obj), OFFSET)

  const metaView = new Int32Array(data)

  Atomics.store(metaView, TO_WORKER, 1)
  Atomics.notify(metaView, TO_WORKER)

  while (true) {
    const res = Atomics.wait(metaView, TO_MAIN, 0)
    Atomics.store(metaView, TO_MAIN, 0)

    if (res === 'ok') {
      const { key, args } = read(data, OFFSET)
      // This is where the magic happens
      const result = await obj[key](...args)
      write(data, result, OFFSET)
      Atomics.store(metaView, TO_WORKER, 1)
      Atomics.notify(metaView, TO_WORKER, 1)
    }
  }
}

module.exports.makeSync = makeSync
module.exports.wire = wire
