# Recovery Test Instructions

## 1. Simulate Server Crash During Investment
- While running the stress test, manually stop the application server (or use Docker/K8s to kill the pod/container).
- After restart, check:
  - Was the investment transaction rolled back?
  - Any partial/duplicate data?
  - Are logs clean?

## 2. Simulate DB Disconnection During KYC Upload
- Disconnect the database (or block network) while a KYC upload is in progress.
- After reconnect, check:
  - Was the KYC upload rolled back?
  - Any data corruption?
  - Are logs clean?

## 3. General
- Always check admin panel and DB for data integrity after recovery.
- Review logs for errors or warnings. 