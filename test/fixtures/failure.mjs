import { workerData } from 'node:worker_threads'
import { wire } from '../../everysync.js'

wire(workerData.data, {
  fail (arg) {
    return new Promise((resolve, reject) => {
      // nothing to do here, we will fail
    })
  },
})
