import Decimal from 'decimal.js';
import {calculateTax,validateGSTIN} from './index';
describe('GST',()=>{it('splits intra-state tax',()=>{const x=calculateTax(new Decimal(1000),18,false);expect(x.cgst.toFixed(2)).toBe('90.00');expect(x.sgst.toFixed(2)).toBe('90.00');expect(x.igst.toFixed(2)).toBe('0.00')});it('calculates inter-state tax',()=>{const x=calculateTax(1000,18,true);expect(x.igst.toFixed(2)).toBe('180.00');expect(x.cgst.isZero()).toBe(true)});it('validates GSTIN shape',()=>{expect(validateGSTIN('24ABCDE1234F1Z5')).toBe(true);expect(validateGSTIN('BAD')).toBe(false)})});
