'use strict'

const { Worker } = require('node:worker_threads')
const { join } = require('node:path')
const { read, write } = require('./lib/objects')
const EventEmitter = require('node:events')

class EverySync extends EventEmitter {
  constructor({ module, maxByteLength }) { 
    super()
    this._meta = new SharedArrayBuffer(1024)
    // Indexes:
    // * 0: writin from worker, reading from main
    // * 1: writing from main, reading from worker
    this._metaView = new Int32Array(this._meta)
    this._data = new SharedArrayBuffer(1024, {
      maxByteLength: maxByteLength || 64 * 1024 * 1024, // 64MB
    })
    this.worker = new Worker(join(__dirname, 'lib', 'worker.js'), {
      workerData: {
        module,
        meta: this._meta,
        data: this._data,
      },
    })

    this.worker.on('error', (err) => {
      this.emit('error', err)
    })

    const res = Atomics.wait(this._metaView, 0, 0, 1000)
    console.log('data in atomics', Atomics.load(this._metaView, 0))
    Atomics.store(this._metaView, 0, 0)

    console.log(res)

    if (res === 'ok') {
      const obj = read(this._data)
      this.api = this._buildApi(obj)
    } else {
      throw new Error('Worker failed to initialize')
    }
  }

  _buildApi (obj) {
    const api = {}
    for (const key of obj) {
      api[key] = (...args) => {
        write(this._data, { key, args })
        Atomics.store(this._metaView, 1, 1)
        Atomics.notify(this._metaView, 1, 1)
        const res = Atomics.wait(this._metaView, 0, 0)
        Atomics.store(this._metaView, 0, 0)
        if (res === 'ok') {
          const obj = read(this._data)
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
