# GST domain

The GST package keeps tax arithmetic and validation independent from HTTP and UI. `calculateTax` supports CGST/SGST for intra-state supplies and IGST for inter-state supplies, with configurable cess. GSTIN validation checks the basic 15-character structure and exposes state-code extraction.

Reconciliation uses weighted fields: supplier GSTIN, invoice number, invoice date, taxable value and tax totals. Import adapters should normalize CSV/XLSX/GSTR datasets into a common record model. Live GST portal access is deliberately not claimed; official credentials/API access and compliance review are required before enabling a production adapter.
