# everysync

Make any API sync with the help of [`node:worker_threads`](https://nodejs.org/api/worker_threads.html) and [`node:fs`](https://nodejs.org/api/worker_threads.html).

## Installation

```bash
npm install everysync
```

## Expose async APIs from a worker thread

Caller side:

```javascript
import { join } from 'node:path'
import { strictEqual } from 'node:assert'
import { Worker } from 'node:worker_threads'
import { makeSync } from 'everysync'

const buffer = new SharedArrayBuffer(1024, {
  maxByteLength: 64 * 1024 * 1024,
})
const worker = new Worker(join(import.meta.dirname, 'echo.mjs'), {
  workerData: {
    data: buffer,
  },
})

const api = makeSync(buffer)

strictEqual(api.echo(42), 42)

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

// Keep the event loop alive
setInterval(() => {}, 100000)
```

## License

MIT
