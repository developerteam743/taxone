import Decimal from 'decimal.js';
export type TaxResult={taxable:Decimal;cgst:Decimal;sgst:Decimal;igst:Decimal;cess:Decimal;total:Decimal};
export function validateGSTIN(gstin:string){return /^[0-9]{2}[A-Z0-9]{13}$/.test(gstin.trim().toUpperCase());}
export function stateCode(gstin:string){return validateGSTIN(gstin)?gstin.slice(0,2):null;}
export function calculateTax(taxable:Decimal.Value,rate:Decimal.Value,interState:boolean,cessRate:Decimal.Value=0):TaxResult{const base=new Decimal(taxable);const r=new Decimal(rate).div(100);const cessRateD=new Decimal(cessRate).div(100);const tax=base.mul(r);const cess=base.mul(cessRateD);const cgst=interState?new Decimal(0):tax.div(2);const sgst=interState?new Decimal(0):tax.div(2);const igst=interState?tax:new Decimal(0);return {taxable:base,cgst,sgst,igst,cess,total:base.plus(tax).plus(cess)};}
export function weightedMatch(a:{gstin?:string;invoiceNumber:string;invoiceDate:string;taxable:number;tax:number},b:{gstin?:string;invoiceNumber:string;invoiceDate:string;taxable:number;tax:number}){let score=0;if(a.gstin&&b.gstin&&a.gstin.toUpperCase()===b.gstin.toUpperCase())score+=35;if(a.invoiceNumber.trim().toUpperCase()===b.invoiceNumber.trim().toUpperCase())score+=30;if(a.invoiceDate===b.invoiceDate)score+=15;const td=Math.abs(a.taxable-b.taxable);const tx=Math.abs(a.tax-b.tax);if(td<=1)score+=10;if(tx<=1)score+=10;return score;}
export type ReconcileRecord={gstin?:string;invoiceNumber:string;invoiceDate:string;taxable:Decimal.Value;cgst:Decimal.Value;sgst:Decimal.Value;igst:Decimal.Value;cess:Decimal.Value};
export type ReconcileStatus='MATCHED'|'PROBABLE'|'PARTIAL'|'MISSING'|'EXTRA'|'MISMATCH'|'REVIEW';
export type ReconcileResult={status:ReconcileStatus;score:number;taxableDifference:Decimal;taxDifference:Decimal};
export function reconcileRecords(book:ReconcileRecord,ret:ReconcileRecord):ReconcileResult{
  const taxableDifference=new Decimal(book.taxable).minus(ret.taxable).abs();
  const taxDifference=new Decimal(book.cgst).plus(book.sgst).plus(book.igst).plus(book.cess).minus(new Decimal(ret.cgst).plus(ret.sgst).plus(ret.igst).plus(ret.cess)).abs();
  let score=0;
  const a=(book.gstin??'').trim().toUpperCase(),b=(ret.gstin??'').trim().toUpperCase();
  if(a&&b&&a===b)score+=35;
  if(book.invoiceNumber.trim().toUpperCase()===ret.invoiceNumber.trim().toUpperCase())score+=30;
  if(book.invoiceDate===ret.invoiceDate)score+=15;
  if(taxableDifference.lte(1))score+=10;
  if(taxDifference.lte(1))score+=10;
  let status:ReconcileStatus='REVIEW';
  if(score===100)status='MATCHED';else if(score>=80)status='PROBABLE';else if(score>=60)status='PARTIAL';else if(score>=30)status='MISMATCH';
  // A material difference in amounts caps the status at MISMATCH even when header fields agree.
  if((status==='MATCHED'||status==='PROBABLE')&&taxDifference.gt(100))status='MISMATCH';
  return {status,score,taxableDifference,taxDifference};
}
/** Greedy matching: exact invoice-number matches first, then best-score candidates >= 60. Unmatched book rows are MISSING, unmatched return rows are EXTRA. */
export type PairResult={bookIndex:number|null;returnIndex:number|null;result:ReconcileResult};
export function reconcileSets(book:ReconcileRecord[],ret:ReconcileRecord[]):PairResult[]{
  const usedReturn=new Set<number>();const out:PairResult[]=[];
  const pendingBook=book.map((_,i)=>i);
  // pass 1: exact invoice number
  for(const bi of pendingBook){
    const ri=ret.findIndex((r,idx)=>!usedReturn.has(idx)&&r.invoiceNumber.trim().toUpperCase()===book[bi].invoiceNumber.trim().toUpperCase());
    if(ri>=0){usedReturn.add(ri);out.push({bookIndex:bi,returnIndex:ri,result:reconcileRecords(book[bi],ret[ri])});}
  }
  // pass 2: best remaining candidate
  for(const bi of pendingBook){
    if(out.some(p=>p.bookIndex===bi))continue;
    let best=-1,bestScore=0;
    ret.forEach((r,ri)=>{if(usedReturn.has(ri))return;const s=reconcileRecords(book[bi],r).score;if(s>bestScore){bestScore=s;best=ri;}});
    if(best>=0&&bestScore>=60){usedReturn.add(best);out.push({bookIndex:bi,returnIndex:best,result:reconcileRecords(book[bi],ret[best])});}
    else out.push({bookIndex:bi,returnIndex:null,result:{status:'MISSING',score:0,taxableDifference:new Decimal(0),taxDifference:new Decimal(0)}});
  }
  ret.forEach((_,ri)=>{if(!usedReturn.has(ri))out.push({bookIndex:null,returnIndex:ri,result:{status:'EXTRA',score:0,taxableDifference:new Decimal(0),taxDifference:new Decimal(0)}});});
  return out;
}
