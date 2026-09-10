import { Queue, Worker } from 'bullmq';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
export const documentQueue = new Queue('document-processing', { connection: { url: redisUrl } });
new Worker('document-processing', async job => {
  // Processing handlers are added in Sprint 2/3; jobs are tenant-scoped by payload contract.
  return { acknowledged: true, jobId: job.id };
}, { connection: { url: redisUrl }, concurrency: 5 });
