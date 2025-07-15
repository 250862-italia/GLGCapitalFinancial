DELETE FROM email_queue WHERE status = 'error' OR status IS NULL OR to_email IS NULL;
