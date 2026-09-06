import { PrismaClient, MemberRole, AccountType } from '@prisma/client';
import argon2 from 'argon2';
const db = new PrismaClient();
async function main() {
  const roleNames = Object.values(MemberRole);
  const roles: Record<string,string> = {};
  for (const name of roleNames) { const r = await db.role.upsert({where:{name},update:{},create:{name}}); roles[name]=r.id; }
  const admin = await db.user.upsert({where:{email:'admin@example.com'},update:{},create:{name:'Demo Admin',email:'admin@example.com',passwordHash:await argon2.hash('Admin@12345')}});
  const org = await db.organization.upsert({where:{slug:'demo-ca-firm'},update:{},create:{name:'Demo CA Firm',slug:'demo-ca-firm'}});
  await db.organizationMember.upsert({where:{organizationId_userId:{organizationId:org.id,userId:admin.id}},update:{roleId:roles.FIRM_ADMIN},create:{organizationId:org.id,userId:admin.id,roleId:roles.FIRM_ADMIN}});
  const client = await db.client.upsert({where:{id:(await db.client.findFirst({where:{organizationId:org.id,name:'Demo Client'}}))?.id ?? '00000000-0000-0000-0000-000000000000'},update:{},create:{organizationId:org.id,name:'Demo Client',email:'client@example.com'}});
  const business = await db.business.upsert({where:{id:(await db.business.findFirst({where:{organizationId:org.id,legalName:'Demo Trading Private Limited'}}))?.id ?? '00000000-0000-0000-0000-000000000000'},update:{},create:{organizationId:org.id,clientId:client.id,legalName:'Demo Trading Private Limited',tradeName:'Demo Trading',pan:'ABCDE1234F'}});
  await db.gSTRegistration.upsert({where:{gstin:'24ABCDE1234F1Z5'},update:{businessId:business.id},create:{businessId:business.id,gstin:'24ABCDE1234F1Z5',state:'Gujarat',legalName:business.legalName,registrationType:'REGULAR'}});
  const now = new Date(); const fyStart = new Date(now.getFullYear() - (now.getMonth()<3?1:0),3,1); const fyEnd = new Date(fyStart.getFullYear()+1,2,31);
  const fy = await db.financialYear.findFirst({where:{businessId:business.id,startDate:fyStart,endDate:fyEnd}});
  if (!fy) await db.financialYear.create({data:{businessId:business.id,startDate:fyStart,endDate:fyEnd}});
  const accounts = [['1000','Cash',AccountType.ASSET],['1100','Bank',AccountType.ASSET],['1200','Accounts Receivable',AccountType.ASSET],['2000','Accounts Payable',AccountType.LIABILITY],['3000','Capital',AccountType.EQUITY],['4000','Sales',AccountType.INCOME],['5000','Purchases',AccountType.EXPENSE],['5100','GST Input Credit',AccountType.ASSET],['5200','GST Output Tax',AccountType.LIABILITY]] as const;
  for (const [code,name,type] of accounts) await db.account.upsert({where:{businessId_code:{businessId:business.id,code}},update:{},create:{businessId:business.id,code,name,type}});
  const customer = await db.customer.upsert({where:{id:(await db.customer.findFirst({where:{businessId:business.id,name:'Demo Customer'}}))?.id ?? '00000000-0000-0000-0000-000000000000'},update:{},create:{businessId:business.id,name:'Demo Customer',gstin:'24AAACD1234A1Z1'}});
  const supplier = await db.supplier.upsert({where:{id:(await db.supplier.findFirst({where:{businessId:business.id,name:'Demo Supplier'}}))?.id ?? '00000000-0000-0000-0000-000000000000'},update:{},create:{businessId:business.id,name:'Demo Supplier',gstin:'24AAACS1234B1Z1'}});
  await db.item.upsert({where:{businessId_name:{businessId:business.id,name:'Consulting Service'}},update:{},create:{businessId:business.id,name:'Consulting Service',sku:'CONS-001',hsnSac:'9983',unit:'NOS',saleRate:1000,purchaseRate:700,gstRate:18}});
  await db.item.upsert({where:{businessId_name:{businessId:business.id,name:'Office Product'}},update:{},create:{businessId:business.id,name:'Office Product',sku:'OFF-001',hsnSac:'4820',unit:'NOS',saleRate:500,purchaseRate:350,gstRate:18}});
  console.log({organization:org.id,business:business.id,customer:customer.id,supplier:supplier.id});
}
main().finally(()=>db.$disconnect());
