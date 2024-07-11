'use strict'

const { test } = require('node:test')
const { join } = require('node:path')
const assert = require('node:assert/strict')
const { EverySyncWorker } = require('..')

test('make a async function sync', async (t) => {
  const everysync = new EverySyncWorker({
    module: join(__dirname, 'fixtures', 'foo.mjs'),
  })

  t.after(() => {
    everysync.terminate()
  })

  assert.strictEqual(everysync.api.foo(), 'foo')
})
