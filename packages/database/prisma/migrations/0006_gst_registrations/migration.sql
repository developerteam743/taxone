CREATE TABLE "GstRegistration" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "gstin" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "registrationType" TEXT NOT NULL DEFAULT 'REGULAR',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "effectiveFrom" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GstRegistration_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GstRegistration_organizationId_gstin_key" ON "GstRegistration"("organizationId", "gstin");
CREATE INDEX "GstRegistration_organizationId_businessId_createdAt_idx" ON "GstRegistration"("organizationId", "businessId", "createdAt");
CREATE INDEX "GstRegistration_organizationId_status_idx" ON "GstRegistration"("organizationId", "status");

ALTER TABLE "GstRegistration" ADD CONSTRAINT "GstRegistration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
