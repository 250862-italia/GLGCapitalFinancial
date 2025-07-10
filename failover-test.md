# Failover & High-Availability Test Instructions

## 1. Simulate Server Failure
- If using multiple app servers, manually stop one (or use a tool like Chaos Monkey).
- Confirm the system remains available for users.

## 2. Simulate Database Downtime
- Temporarily stop the primary database.
- Confirm if read replicas take over (read-only mode).
- Try to perform a write (should fail gracefully).

## 3. Bad Deployment Rollback
- Deploy a known-bad update (e.g., break a route).
- Confirm system health checks fail and rollback is triggered.
- Restore previous working version.

## 4. Monitor
- Check logs and monitoring dashboards for errors and failover events. 