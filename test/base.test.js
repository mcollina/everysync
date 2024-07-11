'use strict'

const { test } = require('node:test')
const { join } = require('node:path')
const assert = require('node:assert/strict')
const { Worker } = require('node:worker_threads')
const { makeSync } = require('..')

test('makeSync and wire', async (t) => {
  const buffer = new SharedArrayBuffer(1024, {
    maxByteLength: 64 * 1024 * 1024,
  })
  const worker = new Worker(join(__dirname, 'fixtures', 'echo.mjs'), {
    workerData: {
      data: buffer,
    },
  })

  const api = makeSync(buffer)

  t.after(() => {
    worker.terminate()
  })

  assert.strictEqual(api.echo(42), 42)
})

test('fail to respond', async (t) => {
  const buffer = new SharedArrayBuffer(1024, {
    maxByteLength: 64 * 1024 * 1024,
  })
  const worker = new Worker(join(__dirname, 'fixtures', 'failure.mjs'), {
    workerData: {
      data: buffer,
    },
  })

  const api = makeSync(buffer, { timeout: 100 })

  t.after(() => {
    worker.terminate()
  })

  assert.throws(() => api.fail(), new Error('The response timed out after 100ms'))
})

test('fail to initliaze', async (t) => {
  const buffer = new SharedArrayBuffer(1024, {
    maxByteLength: 64 * 1024 * 1024,
  })

  assert.throws(() => makeSync(buffer, { timeout: 100 }), new Error('The initialization timed out after 100ms'))
})
