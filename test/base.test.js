'use strict'

const { test } = require('node:test')
const { join } = require('node:path')
const assert = require('node:assert/strict')
const { EverySync } = require('..')

test('make a async function sync', async (t) => {
  const everysync = new EverySync({
    module: join(__dirname, 'fixtures', 'foo.mjs'),
  })

  t.after(() => {
    everysync.terminate()
  })

  assert.strictEqual(everysync.api.foo(), 'foo')
})
