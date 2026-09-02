import {Worker,Queue} from 'bullmq'; import IORedis from 'ioredis';
const connection=new IORedis(process.env.REDIS_URL??'redis://localhost:6379',{maxRetriesPerRequest:null});
for(const name of ['ocr','gst-import','gst-reconciliation','report','notification','backup']){new Worker(name,async job=>{console.log(`processing ${name}/${job.id}`);return {ok:true};},{connection,concurrency:2});}
new Queue('health',{connection}); console.log('TaxOne worker ready');
