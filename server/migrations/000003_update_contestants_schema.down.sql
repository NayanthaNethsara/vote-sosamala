ALTER TABLE contestants
    DROP COLUMN IF EXISTS semester;

ALTER TABLE contestants
    ADD COLUMN IF NOT EXISTS nic_or_student_id VARCHAR(50) UNIQUE;

ALTER TABLE contestants
    RENAME COLUMN date_of_birth TO birthday;