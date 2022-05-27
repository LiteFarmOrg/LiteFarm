-- This SQL is never executed by LiteFarm app or server code.
-- It is intended for manual use in order to send a notification to all users.
-- It could be modified to send to any arbitrary set of users.
- The syntax of this "comment" is intentionally incorrect, to prevent running this file as a script.
-- You should run the statements individually, modifying as you go.

-- For safety, start a transaction. Before COMMIT; the changes will be visible to this session only.
-- At any prior time, use ROLLBACK; to discard transaction changes.
BEGIN TRANSACTION;

-- Create the notification record.
INSERT INTO notification (title, body, farm_id, created_at, updated_at, created_by_user_id, updated_by_user_id)
VALUES (
-- TODO: Fill in translated text from here ...
  '{ "en": "English title", "es": "Spanish title", "pt": "Portuguese title", "fr": "French title" }',
  '{ "en": "English body", "es": "Spanish body", "pt": "Portuguese body", "fr": "French body" }',
-- ... to here.
    NULL, NOW(), NOW(), '1', '1'
);

-- Get id of the new notification.
-- (Verify that the record returned is your notification.)
SELECT * FROM notification ORDER BY created_at DESC LIMIT 1;

-- "Send" notification to all users.
-- TODO: Substitute your new notifications's id in the second line below.
INSERT INTO notification_user (notification_id, user_id, alert, status, created_at, updated_at, created_by_user_id, updated_by_user_id)
  SELECT 'SUBSTITUTE NEW NOTIFICATION ID HERE', user_id, TRUE, 'Unread', NOW(), NOW(), '1', '1' FROM users;

-- Last chance to ROLLBACK; This will finalize changes.
COMMIT;