import {Worker,Queue} from 'bullmq'; import IORedis from 'ioredis'; import { PrismaClient } from '@prisma/client'; import { readFile } from 'fs/promises'; import { join } from 'path';
const db=new PrismaClient();
const connection=new IORedis(process.env.REDIS_URL??'redis://localhost:6379',{maxRetriesPerRequest:null});
const STORAGE_DIR=process.env.STORAGE_DIR??'/tmp/taxone-storage';

interface ExtractedShape { rawText:string; structured:{supplierGstin?:string|null;invoiceNumber?:string|null;[k:string]:unknown}; confidence:number; schemaVersion:string }

/** Calls the OCR microservice; falls back to a deterministic pass-through when it is not running. */
async function extract(storageKey:string):Promise<ExtractedShape>{
  const path=join(STORAGE_DIR,storageKey);
  let buffer:Buffer; try{buffer=await readFile(path);}catch{throw new Error(`Document file missing: ${storageKey}`);}
  const url=process.env.OCR_URL;
  if(url){
    const form=new FormData();
    form.append('file',new Blob([new Uint8Array(buffer)]),'invoice.txt');
    const res=await fetch(`${url}/extract`,{method:'POST',body:form});
    if(res.ok)return await res.json() as ExtractedShape;
    throw new Error(`OCR service responded ${res.status}`);
  }
  // Offline fallback so the queue stays functional without the Python service.
  const text=buffer.toString('utf8');
  const gst=text.toUpperCase().match(/\b\d{2}[A-Z0-9]{13}\b/)?.[0]??null;
  const inv=text.match(/(?:invoice|inv)[\s:#-]*([A-Z0-9/-]+)/i)?.[1]??null;
  const amt=text.match(/(?:total|amount)[\s:₹-]*(\d+(?:\.\d{1,2})?)/i)?.[1]??null;
  return {rawText:text,structured:{supplierGstin:gst,invoiceNumber:inv,taxableValue:amt?Number(amt):null},confidence:text?0.35:0,schemaVersion:'1.0'};
}

async function processOcr(job:{documentId:string;jobId:string;storageKey:string}):Promise<unknown>{
  const doc=await db.document.findUnique({where:{id:job.documentId},include:{ocrJobs:true}});
  if(!doc)throw new Error('Document not found');
  const ocrJob=doc.ocrJobs.find(j=>j.id===job.jobId)??doc.ocrJobs[0];
  if(!ocrJob)throw new Error('OCR job not found');
  await db.oCRJob.update({where:{id:ocrJob.id},data:{status:'PROCESSING',attempts:{increment:1}}});
  try{
    const result=await extract(job.storageKey);
    await db.oCRResult.create({data:{ocrJobId:ocrJob.id,rawText:result.rawText.slice(0,100000),structuredJson:result.structured as object,confidence:result.confidence,schemaVersion:result.schemaVersion}});
    await db.oCRJob.update({where:{id:ocrJob.id},data:{status:'DONE'}});
    await db.document.update({where:{id:doc.id},data:{status:'REVIEW'}});
    return {ok:true,confidence:result.confidence};
  }catch(err){
    await db.oCRJob.update({where:{id:ocrJob.id},data:{status:'FAILED'}});
    await db.document.update({where:{id:doc.id},data:{status:'UPLOADED'}});
    throw err;
  }
}

new Worker('ocr',async job=>processOcr(job.data as {documentId:string;jobId:string;storageKey:string}),{connection,concurrency:2});
for(const name of ['gst-import','gst-reconciliation','report','notification','backup']){new Worker(name,async job=>{console.log(`processing ${name}/${job.id}`);return {ok:true};},{connection,concurrency:2});}
new Queue('health',{connection}); console.log('TaxOne worker ready');
