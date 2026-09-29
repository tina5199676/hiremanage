import { candidateHandlers } from './candidates'
import { jobHandlers } from './jobs'

export const handlers = [
  ...jobHandlers,
  ...candidateHandlers,
]