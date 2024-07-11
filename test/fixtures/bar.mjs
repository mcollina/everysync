import { workerData } from 'node:worker_threads'
import { wire } from '../../everysync.js'

wire(workerData.data, {
  async echo (arg) {
    return arg
  },
})


