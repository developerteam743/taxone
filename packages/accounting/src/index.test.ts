import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { assertBalanced, accountBalance, profitAndLoss, balanceSheet } from './index';

describe('accounting', () => {
  it('rejects unbalanced journals', () => expect(() => assertBalanced([{accountId:'a',debit:100,credit:0},{accountId:'b',debit:0,credit:90}])).toThrow());
  it('balances decimal entries', () => expect(() => assertBalanced([{accountId:'a',debit:'100.10',credit:0},{accountId:'b',debit:0,credit:'100.10'}])).not.toThrow());
  it('computes asset balance', () => expect(accountBalance(new Decimal('125.50'),10,'ASSET').toFixed(2)).toBe('115.50'));
  it('computes profit and loss', () => { const r=profitAndLoss([{accountId:'sales',name:'Sales',type:'INCOME',debit:0,credit:1000},{accountId:'rent',name:'Rent',type:'EXPENSE',debit:250,credit:0}]); expect(r.income.toFixed(2)).toBe('1000.00'); expect(r.expense.toFixed(2)).toBe('250.00'); expect(r.netProfit.toFixed(2)).toBe('750.00'); });
  it('computes a balanced balance sheet', () => { const r=balanceSheet([{accountId:'cash',name:'Cash',type:'ASSET',debit:1000,credit:0},{accountId:'loan',name:'Loan',type:'LIABILITY',debit:0,credit:400},{accountId:'capital',name:'Capital',type:'EQUITY',debit:0,credit:600}]); expect(r.assets.toFixed(2)).toBe('1000.00'); expect(r.liabilities.toFixed(2)).toBe('400.00'); expect(r.equity.toFixed(2)).toBe('600.00'); expect(r.difference.toFixed(2)).toBe('0.00'); });
});
