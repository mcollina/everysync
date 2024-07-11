'use strict'

const { Worker } = require('node:worker_threads')
const { join } = require('node:path')
const { read, write } = require('./lib/objects')
const EventEmitter = require('node:events')
const {
  OFFSET,
  TO_MAIN,
  TO_WORKER
} = require('./lib/indexes')

class EverySync extends EventEmitter {
  constructor({ module, maxByteLength }) { 
    super()
    // First 64 bytes are reserved for metadata
    this._data = new SharedArrayBuffer(1024, {
      maxByteLength: maxByteLength || 64 * 1024 * 1024, // 64MB
    })
    // Indexes:
    this._metaView = new Int32Array(this._data)
    this.worker = new Worker(join(__dirname, 'lib', 'worker.js'), {
      workerData: {
        module,
        data: this._data,
      },
    })

    this.worker.on('error', (err) => {
      this.emit('error', err)
    })

    const res = Atomics.wait(this._metaView, TO_WORKER, 0, 1000)
    Atomics.store(this._metaView, TO_WORKER, 0)

    if (res === 'ok') {
      const obj = read(this._data, OFFSET)
      this.api = this._buildApi(obj)
    } else {
      throw new Error('Worker failed to initialize')
    }
  }

  _buildApi (obj) {
    const api = {}
    for (const key of obj) {
      api[key] = (...args) => {
        write(this._data, { key, args }, OFFSET)
        Atomics.store(this._metaView, TO_MAIN, 1)
        Atomics.notify(this._metaView, TO_MAIN, 1)
        const res = Atomics.wait(this._metaView, TO_WORKER, 0)
        Atomics.store(this._metaView, TO_WORKER, 0)
        if (res === 'ok') {
          const obj = read(this._data, OFFSET)
          return obj
        } else {
          throw new Error('Worker failed to respond')
        }
      }
    }

    return api
  }

  terminate () {
    this.worker.terminate()
  }
}

module.exports.EverySync = EverySync
