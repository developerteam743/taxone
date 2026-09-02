import {weightedMatch} from '@taxone/gst';
export type Record={gstin?:string;invoiceNumber:string;invoiceDate:string;taxable:number;tax:number};
export function classify(score:number){return score>=90?'MATCHED':score>=70?'PROBABLE':score>=45?'PARTIAL':'REVIEW'}
export function reconcile(books:Record[],returns:Record[]){const used=new Set<number>();return books.map(book=>{let best=-1,bestScore=0;returns.forEach((r,i)=>{if(used.has(i))return;const s=weightedMatch(book,r);if(s>bestScore){bestScore=s;best=i}});if(best>=0&&bestScore>=45)used.add(best);return {book,returnRecord:best>=0?returns[best]:undefined,score:bestScore,status:best<0?'MISSING':classify(bestScore)}}).concat(returns.map((r,i)=>used.has(i)?[]:[{returnRecord:r,score:0,status:'EXTRA'}]).flat() as any)}
