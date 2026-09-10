CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "pan" TEXT,
    "gstin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Business_organizationId_gstin_key" ON "Business"("organizationId", "gstin");
CREATE UNIQUE INDEX "Business_organizationId_id_key" ON "Business"("organizationId", "id");
CREATE INDEX "Business_organizationId_createdAt_idx" ON "Business"("organizationId", "createdAt");
CREATE INDEX "Business_organizationId_clientId_createdAt_idx" ON "Business"("organizationId", "clientId", "createdAt");

ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_id_key" UNIQUE ("organizationId", "id");

ALTER TABLE "Business" ADD CONSTRAINT "Business_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Business" ADD CONSTRAINT "Business_organizationId_clientId_fkey" FOREIGN KEY ("organizationId", "clientId") REFERENCES "Client"("organizationId", "id") ON DELETE CASCADE ON UPDATE CASCADE;
