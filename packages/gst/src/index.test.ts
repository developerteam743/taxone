import {describe,it,expect} from 'vitest';
import Decimal from 'decimal.js';
import {calculateTax,validateGSTIN} from './index';
describe('GST',()=>{it('splits intra-state tax',()=>{const x=calculateTax(new Decimal(1000),18,false);expect(x.cgst.toFixed(2)).toBe('90.00');expect(x.sgst.toFixed(2)).toBe('90.00');expect(x.igst.toFixed(2)).toBe('0.00')});it('calculates inter-state tax',()=>{const x=calculateTax(1000,18,true);expect(x.igst.toFixed(2)).toBe('180.00');expect(x.cgst.isZero()).toBe(true)});it('validates GSTIN shape',()=>{expect(validateGSTIN('24ABCDE1234F1Z5')).toBe(true);expect(validateGSTIN('BAD')).toBe(false)})});
import { reconcileSets } from './index';
const rec=(invoiceNumber:string,taxable='1000',cgst='90',sgst='90')=>({gstin:'27ABCDE1234F1Z5',invoiceNumber,invoiceDate:'2025-04-10',taxable,cgst,sgst,igst:'0',cess:'0'});
describe('reconcileSets',()=>{it('matches exact invoice numbers and flags mismatches',()=>{
  const out=reconcileSets([rec('INV-1'),rec('INV-2','1000','90','90')],[rec('INV-1'),rec('INV-2','1800','162','162')]);
  expect(out[0].result.status).toBe('MATCHED');
  expect(out[1].result.status).toBe('MISMATCH');
});it('marks missing book rows and extra return rows',()=>{
  const out=reconcileSets([rec('INV-A','5000')],[{...rec('INV-X'),gstin:'29ZZE1234F1Z5'}]);
  expect(out.some(o=>o.result.status==='MISSING')).toBe(true);
  expect(out.some(o=>o.result.status==='EXTRA')).toBe(true);
});});