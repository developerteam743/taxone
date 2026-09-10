# Production Runbook

## Release
1. Merge approved PR.
2. Build immutable container images.
3. Run migrations in a controlled step.
4. Deploy API.
5. Deploy workers.
6. Deploy web.
7. Verify readiness.
8. Run smoke tests.
9. Monitor error rate and queues.

## Database
- automated backups
- point-in-time recovery where supported
- encrypted backups
- monthly restore drill
- migration rollback strategy

## Incident
- identify request ID
- inspect structured logs
- check queue health
- check database health
- check provider status
- stop unsafe workers if financial integrity is at risk
- preserve audit evidence
- recover
- reconcile affected financial operations

## Monitoring Alerts
- API 5xx spike
- login failure spike
- queue backlog
- OCR failure spike
- GST provider failures
- database storage
- backup failure
- unusual admin activity
- payment/posting failure

## Disaster Recovery Targets
Define RPO/RTO before production launch and test them periodically.
