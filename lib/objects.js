'use strict'

const { serialize, deserialize } = require('node:v8')

function read (buffer) {
  const view = new DataView(buffer)
  const length = view.getUint32(0, true)
  const object = deserialize(new Uint8Array(buffer, 4, length))
  return object
}

function write (buffer, object) {
  const data = serialize(object)
  
  if (buffer.byteLength < data.byteLength + 4) {
    if (!buffer.growable) {
      throw new Error('Buffer is not growable')
    }
    buffer.grow(data.byteLength + 4)
  }
  const view = new DataView(buffer)
  view.setUint32(0, data.byteLength, true)
  new Uint8Array(buffer, 4).set(data)
}

module.exports.read = read
module.exports.write = write
