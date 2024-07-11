# everysync

Make any API sync with the help of [`node:worker_threads`](https://nodejs.org/api/worker_threads.html) and [`node:fs`](https://nodejs.org/api/worker_threads.html).

## Installation

```bash
npm install everysync
```

## Expose async APIs from a worker thread

Caller side:

```javascript
const { join } = require('node:path')
const assert = require('node:assert')
const { Worker } = require('node:worker_threads')
const { makeSync } = require('everysync')

const buffer = new SharedArrayBuffer(1024, {
  maxByteLength: 64 * 1024 * 1024,
})
const worker = new Worker(join(__dirname, 'echo.mjs'), {
  workerData: {
    data: buffer,
  },
})

const api = makeSync(buffer)

assert.strictEqual(api.echo(42), 42)

worker.terminate()
```

Worker side (`echo.mjs`):

```javascript
import { wire } from 'everysync'
import { workerData } from 'node:worker_threads'
import { setTimeout } from 'node:timers/promises'

wire(workerData.data, {
  async echo (value) {
    await setTimeout(1000)
    return value
  },
})
```

## License

MIT
