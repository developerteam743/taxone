# Integration Blueprint

## Adapter Interface
Every external system should implement an interface such as:

- authenticate()
- healthCheck()
- import()
- export()
- sync()
- map()
- handleWebhook()
- disconnect()

## Tally
Support:
- ledger export
- voucher export
- invoice export
- bank voucher export
- master mapping
- duplicate prevention
- sync logs

Implement via the officially supported integration mechanism available to the deployment.

## Vyapar
Support:
- client/business mapping
- sales/purchase import/export where permitted
- synchronization status
- conflict handling

## GST
Provider adapter must isolate:
- authentication
- return retrieval
- return preparation
- filing submission
- status retrieval
- reconciliation data

Do not scrape portals unless explicitly permitted and technically/legal reviewed.

## WhatsApp
- template management
- opt-in tracking
- outbound reminders
- document request
- delivery/read status
- webhook verification
- retry/dead-letter

## Excel
- template detection
- column mapping
- preview
- validation
- import job
- error rows
- export templates
