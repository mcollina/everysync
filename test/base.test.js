'use strict'

const { test } = require('node:test')
const { join } = require('node:path')
const assert = require('node:assert/strict')
const { Worker } = require('node:worker_threads')
const { EverySyncWorker, makeSync } = require('..')

test('make a async function sync', async (t) => {
  const everysync = new EverySyncWorker({
    module: join(__dirname, 'fixtures', 'foo.mjs'),
  })

  t.after(() => {
    everysync.terminate()
  })

  assert.strictEqual(everysync.api.foo(), 'foo')
})

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
