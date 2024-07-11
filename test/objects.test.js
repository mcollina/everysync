'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { read, write } = require('../lib/objects')

test('mirror test', () => {
  const obj = { foo: 'bar' }
  const buffer = new SharedArrayBuffer(1024)
  write(buffer, obj)
  const obj2 = read(buffer)
  assert.deepEqual(obj, obj2)
})

test('growable', () => {
  const obj = { foo: 'bar' }
  const buffer = new SharedArrayBuffer(2, {
    maxByteLength: 1024,
  })
  write(buffer, obj)
  const obj2 = read(buffer)
  assert.deepEqual(obj, obj2)
})

test('mirror test with offset', () => {
  const obj = { foo: 'bar' }
  const buffer = new SharedArrayBuffer(1024)
  write(buffer, obj, 4)
  const obj2 = read(buffer, 4)
  assert.deepEqual(obj, obj2)
})

test('growable', () => {
  const obj = { foo: 'bar' }
  const buffer = new SharedArrayBuffer(2, {
    maxByteLength: 1024,
  })
  write(buffer, obj, 4)
  const obj2 = read(buffer, 4)
  assert.deepEqual(obj, obj2)
})
