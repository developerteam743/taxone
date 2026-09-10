import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis/built/Redis.js';

const connection = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', { maxRetriesPerRequest: null });
export const documentQueue = new Queue('document-processing', { connection });
new Worker('document-processing', async job => {
  // Processing handlers are added in Sprint 2/3; jobs are tenant-scoped by payload contract.
  return { acknowledged: true, jobId: job.id };
}, { connection, concurrency: 5 });
