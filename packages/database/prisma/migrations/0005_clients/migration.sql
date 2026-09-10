CREATE TABLE "Client" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "pan" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Client_organizationId_createdAt_idx" ON "Client"("organizationId", "createdAt");
CREATE INDEX "Client_organizationId_name_idx" ON "Client"("organizationId", "name");
CREATE UNIQUE INDEX "Client_organizationId_pan_key" ON "Client"("organizationId", "pan");

ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
