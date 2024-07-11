'use strict'

const { serialize, deserialize } = require('node:v8')

function read (buffer, byteOffset = 0) {
  const view = new DataView(buffer, byteOffset)
  const length = view.getUint32(0, true)
  const object = deserialize(new Uint8Array(buffer, byteOffset + 4, length))
  return object
}

function write (buffer, object, byteOffset = 0) {
  const data = serialize(object)

  if (buffer.byteLength < data.byteLength + 4 + byteOffset) {
    if (!buffer.growable) {
      throw new Error('Buffer is not growable')
    }
    /* c8 ignore next 2 */
    buffer.grow(data.byteLength + 4 + byteOffset)
  }
  const view = new DataView(buffer, byteOffset)
  view.setUint32(0, data.byteLength, true)
  new Uint8Array(buffer, byteOffset + 4).set(data)
}

module.exports.read = read
module.exports.write = write
