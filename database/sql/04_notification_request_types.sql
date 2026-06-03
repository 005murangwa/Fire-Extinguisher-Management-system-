-- Extend notification types for extinguisher request workflow.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'INSPECTION_SCHEDULED',
    'INSPECTION_UPCOMING',
    'INSPECTION_OVERDUE',
    'EXTINGUISHER_EXPIRING',
    'MAINTENANCE_REMINDER',
    'REQUEST_SUBMITTED',
    'REQUEST_APPROVED',
    'REQUEST_DENIED'
  ));
